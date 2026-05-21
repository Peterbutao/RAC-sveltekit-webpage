import { fail, redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

function cleanEnvValue(value) {
	return typeof value === 'string' ? value.trim() : value;
}

function createSupabaseAdmin() {
	const supabaseUrl = cleanEnvValue(env.SUPABASE_URL) || cleanEnvValue(PUBLIC_SUPABASE_URL);
	const serviceRoleKey = cleanEnvValue(env.SUPABASE_SERVICE_ROLE_KEY);

	if (!supabaseUrl || !serviceRoleKey) {
		return null;
	}

	return createClient(supabaseUrl, serviceRoleKey);
}

/**
 * Validation rules for profile fields
 */
const VALIDATION_RULES = {
	phone: {
		maxLength: 20,
		pattern: /^[\d\s\-\+\(\)\.]*$/,
		required: false
	},
	occupation: {
		maxLength: 100,
		pattern: /^[a-zA-Z0-9\s\-&\.]*$/,
		required: false
	},
	skills: {
		maxLength: 500,
		pattern: /^[a-zA-Z0-9\s,\.&\-]*$/,
		required: false
	}
};

/**
 * Validate a single field
 * @param {string} fieldName - The field name to validate
 * @param {string} value - The field value
 * @returns {string|null} Error message or null if valid
 */
function validateField(fieldName, value) {
	if (!value || value.trim() === '') {
		return null; // Optional fields
	}

	const rules = VALIDATION_RULES[fieldName];
	if (!rules) {
		return 'Unknown field';
	}

	if (value.length > rules.maxLength) {
		return `${fieldName} cannot exceed ${rules.maxLength} characters`;
	}

	if (!rules.pattern.test(value)) {
		return `${fieldName} contains invalid characters`;
	}

	return null;
}

/**
 * Sanitize input to prevent XSS
 * @param {string} str
 * @returns {string}
 */
function sanitizeInput(str) {
	return String(str)
		.trim()
		.slice(0, 500)
		.replace(/[<>"'`]/g, ''); // Remove HTML/script characters
}

/**
 * Load member profile data
 * @type {import('./$types').PageServerLoad}
 */
export async function load({ locals: { safeGetSession } }) {
	const { session, user } = await safeGetSession();

	if (!session || !user) {
		redirect(302, '/login');
	}

	const supabase = createSupabaseAdmin();
	if (!supabase) {
		return {
			profile: null,
			error: 'Database connection failed'
		};
	}

	try {
		const { data: profile, error } = await supabase
			.from('members')
			.select('id, user_id, rac_number, full_name, email, phone, occupation, skills, status')
			.eq('user_id', user.id)
			.single();

		if (error || !profile) {
			return {
				profile: null,
				error: 'Profile not found. You may need to be added as a member first.'
			};
		}

		return {
			profile,
			error: null
		};
	} catch (err) {
		console.error('Error loading profile:', err);
		return {
			profile: null,
			error: 'Failed to load profile'
		};
	}
}

/**
 * Handle profile update
 * @type {import('./$types').Actions}
 */
export const actions = {
	updateProfile: async ({ locals: { safeGetSession }, request }) => {
		const { session, user } = await safeGetSession();

		if (!session || !user) {
			return fail(401, { message: 'Not authenticated' });
		}

		const supabase = createSupabaseAdmin();
		if (!supabase) {
			return fail(500, { message: 'Database connection failed' });
		}

		const formData = await request.formData();
		const phone = sanitizeInput(formData.get('phone') ?? '');
		const occupation = sanitizeInput(formData.get('occupation') ?? '');
		const skills = sanitizeInput(formData.get('skills') ?? '');

		// Validate fields
		const errors = {};
		const phoneError = validateField('phone', phone);
		if (phoneError) errors.phone = phoneError;

		const occupationError = validateField('occupation', occupation);
		if (occupationError) errors.occupation = occupationError;

		const skillsError = validateField('skills', skills);
		if (skillsError) errors.skills = skillsError;

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, message: 'Validation failed' });
		}

		try {
			// Update using service role to bypass RLS for verification, then verify ownership
			const { data: member, error: selectError } = await supabase
				.from('members')
				.select('user_id')
				.eq('user_id', user.id)
				.single();

			if (selectError || !member) {
				return fail(404, { message: 'Member record not found' });
			}

			// Update member profile
			const { error: updateError } = await supabase
				.from('members')
				.update({
					phone: phone || null,
					occupation: occupation || null,
					skills: skills || null,
					updated_at: new Date().toISOString()
				})
				.eq('user_id', user.id);

			if (updateError) {
				console.error('Update error:', updateError);
				return fail(500, { message: 'Failed to update profile' });
			}

			return {
				success: true,
				message: 'Profile updated successfully!'
			};
		} catch (err) {
			console.error('Error updating profile:', err);
			return fail(500, { message: 'An error occurred while updating your profile' });
		}
	}
};

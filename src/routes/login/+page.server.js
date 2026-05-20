import { fail, redirect } from '@sveltejs/kit';
import {
	racToAuthEmail,
	racValidationError,
	normalizeRacNumber
} from '$lib/auth/rac.js';

/** @param {string} racNumber */
function resolveAuthEmail(racNumber) {
	const validation = racValidationError(racNumber);
	if (validation) return { error: validation };
	const email = racToAuthEmail(racNumber);
	if (!email) return { error: 'Invalid RAC member number.' };
	return { email, rac: normalizeRacNumber(racNumber) };
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals: { safeGetSession }, url }) {
	const { session, user } = await safeGetSession();

	return {
		session,
		user,
		authError: url.searchParams.get('error') === 'auth'
			? 'Authentication failed. Please try again.'
			: null
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	login: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const racNumber = String(formData.get('rac_number') ?? '');
		const password = String(formData.get('password') ?? '');

		if (!racNumber || !password) {
			return fail(400, { message: 'Please fill in all fields.', mode: 'login' });
		}

		const resolved = resolveAuthEmail(racNumber);
		if (resolved.error) {
			return fail(400, { message: resolved.error, mode: 'login' });
		}

		const { error } = await supabase.auth.signInWithPassword({
			email: resolved.email,
			password
		});

		if (error) {
			return fail(400, {
				message: error.message === 'Invalid login credentials'
					? 'Invalid RAC number or password.'
					: error.message,
				mode: 'login'
			});
		}

		redirect(303, '/login');
	},

	resetPassword: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData();
		const racNumber = String(formData.get('rac_number') ?? '');

		if (!racNumber) {
			return fail(400, { message: 'Enter your RAC member number.', mode: 'reset' });
		}

		const resolved = resolveAuthEmail(racNumber);
		if (resolved.error) {
			return fail(400, { message: resolved.error, mode: 'reset' });
		}

		const { error } = await supabase.auth.resetPasswordForEmail(resolved.email, {
			redirectTo: `${url.origin}/auth/callback?next=/login`
		});

		if (error) {
			// ⚠️ Security: Don't reveal whether email exists
			console.warn(`[AUTH] Password reset request failed for ${resolved.email}:`, error.message);
			return {
				success: true,
				message: 'If this RAC member number is registered, password reset instructions have been sent to your registered email.',
				mode: 'reset'
			};
		}

		return {
			success: true,
			message: 'If this RAC member number is registered, password reset instructions have been sent to your registered email.',
			mode: 'reset'
		};
	},

	logout: async ({ locals: { supabase } }) => {
		await supabase.auth.signOut();
		redirect(303, '/login');
	}
};

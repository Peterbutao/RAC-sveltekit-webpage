import { fail, redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { Resend } from 'resend';
import { APPS_SCRIPT_WEBHOOK_URL } from '$lib/constants.js';

function createSupabaseAdmin() {
	const supabaseUrl = env.SUPABASE_URL ?? PUBLIC_SUPABASE_URL;
	const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !serviceRoleKey) {
		return null;
	}

	return createClient(supabaseUrl, serviceRoleKey);
}

function createResendClient() {
	if (!env.RESEND_API_KEY) {
		return null;
	}

	return new Resend(env.RESEND_API_KEY);
}

/**
 * Generate a user RAC number in format rac026001
 * @param {number} count - The counter for this year
 * @param {number} year - The year (e.g., 2026)
 * @returns {string}
 */
function generateUserRacNumber(count, year) {
	const yearSuffix = String(year).slice(-3); // Get last 3 digits of year
	return `rac${yearSuffix}${String(count).padStart(3, '0')}`;
}

/**
 * Generate an admin RAC number in format rac0000001
 * @param {number} count - The counter for admins
 * @returns {string}
 */
function generateAdminRacNumber(count) {
	return `rac000000${String(count).padStart(3, '0')}`;
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	const { session } = await locals.safeGetSession();

	// Check if user is authenticated
	if (!session) {
		redirect(303, '/login');
	}

	// Check if user is admin
	const supabase = createSupabaseAdmin();
	if (!supabase) {
		return fail(500, { message: 'Admin client not configured' });
	}

	const { data: member } = await supabase
		.from('members')
		.select('is_admin')
		.eq('user_id', session.user.id)
		.single();

	if (!member?.is_admin) {
		redirect(303, '/login');
	}

	// Fetch pending applications
	const { data: applications, error: appError } = await supabase
		.from('join_applications')
		.select('*')
		.eq('status', 'pending')
		.order('submitted_at', { ascending: false });

	if (appError) {
		console.error('Error fetching applications:', appError);
		return fail(500, { message: 'Failed to load applications' });
	}

	// Get the next user RAC number for this year
	const currentYear = new Date().getFullYear();
	const yearSuffix = String(currentYear).slice(-3); // e.g., '026' for 2026
	const racPrefix = `rac${yearSuffix}`; // e.g., 'rac026'

	const { data: yearMembers } = await supabase
		.from('members')
		.select('rac_number')
		.like('rac_number', `${racPrefix}%`) // Get only this year's RAC numbers
		.order('rac_number', { ascending: false })
		.limit(1);

	let nextRacCount = 1;
	if (yearMembers && yearMembers.length > 0) {
		const lastRac = yearMembers[0].rac_number;
		// Extract counter from last 3 digits (e.g., 'rac026042' -> '042' -> 42)
		const match = lastRac.match(/rac\d{3}(\d{3})/);
		if (match) {
			nextRacCount = parseInt(match[1]) + 1;
		}
	}

	return {
		applications: applications || [],
		applicationCount: applications?.length || 0,
		nextRacNumber: generateUserRacNumber(nextRacCount, currentYear),
		nextRacCount
	};
}

/**
 * Sync members from Supabase to Google Sheet via Apps Script
 * @param {Object} supabase - Supabase admin client
 * @returns {Promise<{success: boolean, message: string, count?: number, error?: string}>}
 */
async function syncMembersToGoogleSheet(supabase) {
	try {
		if (!APPS_SCRIPT_WEBHOOK_URL) {
			return {
				success: false,
				message: 'Apps Script webhook URL not configured. Set APPS_SCRIPT_WEBHOOK_URL environment variable.',
				error: 'Missing configuration'
			};
		}

		// Fetch all members from Supabase
		const { data: members, error } = await supabase
			.from('members')
			.select('full_name, rac_number, occupation, phone')
			.neq('status', 'inactive');

		if (error) {
			throw new Error(`Supabase query failed: ${error.message}`);
		}

		if (!members || members.length === 0) {
			return {
				success: false,
				message: 'No active members found to sync',
				count: 0
			};
		}

		// Format data for Google Sheet
		const memberData = members.map(member => ({
			name: member.full_name || '',
			rac_number: member.rac_number || '',
			occupation: member.occupation || '',
			age: '', // age - not available in Supabase yet
			phone_number: member.phone || ''
		}));

		// Call Apps Script webhook
		const response = await fetch(APPS_SCRIPT_WEBHOOK_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				action: 'syncMembers',
				members: memberData
			})
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Apps Script error (${response.status}): ${error}`);
		}

		const result = await response.json();

		if (result.success) {
			return {
				success: true,
				message: result.message || `Successfully synced ${members.length} members to Google Sheet`,
				count: members.length,
				updatedRows: members.length
			};
		} else {
			return {
				success: false,
				message: result.message || 'Failed to sync members',
				error: result.error,
				count: members.length
			};
		}
	} catch (error) {
		console.error('[Sync Members Error]', error.message);
		return {
			success: false,
			message: 'Failed to sync members to Google Sheet',
			error: error.message
		};
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	assignRac: async ({ request, locals: { safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) {
			return fail(401, { message: 'Not authenticated' });
		}

		const formData = await request.formData();
		const applicationId = String(formData.get('application_id') ?? '');
		const racNumber = String(formData.get('rac_number') ?? '');
		const password = String(formData.get('password') ?? '');

		if (!applicationId || !racNumber || !password) {
			return fail(400, { message: 'Missing required fields' });
		}

		const supabase = createSupabaseAdmin();
		if (!supabase) {
			return fail(500, { message: 'Admin client not configured' });
		}

		try {
			// Fetch the application
			const { data: application, error: fetchError } = await supabase
				.from('join_applications')
				.select('*')
				.eq('id', applicationId)
				.single();

			if (fetchError || !application) {
				return fail(404, { message: 'Application not found' });
			}

			const email = application.email;
			const authEmail = `${racNumber.toLowerCase()}@members.rotaractlilongwe.org`;

			// Create Supabase auth user
			const { data: authUser, error: createUserError } = await supabase.auth.admin.createUser(
				{
					email: authEmail,
					password,
					email_confirm: true,
					user_metadata: {
						rac_number: racNumber,
						full_name: application.full_name
					}
				}
			);

			if (createUserError) {
				console.error('Auth user creation error:', createUserError);
				return fail(400, { message: `Failed to create user: ${createUserError.message}` });
			}

			// Create member record
			const { error: memberError } = await supabase.from('members').insert({
				user_id: authUser.user.id,
				rac_number: racNumber,
				email: authEmail,
				full_name: application.full_name,
				phone: application.phone,
				occupation: application.occupation,
				is_admin: false,
				status: 'active'
			});

			if (memberError) {
				console.error('Member creation error:', memberError);
				// Try to clean up the auth user
				await supabase.auth.admin.deleteUser(authUser.user.id);
				return fail(400, { message: `Failed to create member record: ${memberError.message}` });
			}

			// Update application status
			const { error: updateError } = await supabase
				.from('join_applications')
				.update({
					status: 'approved',
					rac_number: racNumber,
					rac_assigned_at: new Date().toISOString()
				})
				.eq('id', applicationId);

			if (updateError) {
				console.error('Update application error:', updateError);
				return fail(400, { message: 'Failed to update application status' });
			}

			// Send welcome email
			const resend = createResendClient();
			if (resend) {
				try {
					const welcomeHtml = `
						<!DOCTYPE html>
						<html>
						<head>
							<meta charset="utf-8">
							<style>
								body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
								.container { max-width: 600px; margin: 0 auto; padding: 20px; }
								.header { background: #E8175D; color: white; padding: 30px 20px; text-align: center; }
								.header h1 { margin: 0; font-size: 28px; }
								.content { background: #f9f9f9; padding: 30px 20px; }
								.footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
								.credentials { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin: 20px 0; }
								.button { display: inline-block; background: #E8175D; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
							</style>
						</head>
						<body>
							<div class="container">
								<div class="header">
									<h1>Rotaract Club of Lilongwe</h1>
									<p>UNITE FOR GOOD</p>
								</div>
								<div class="content">
									<h2>Welcome to Rotaract Club of Lilongwe!</h2>
									<p>Dear ${application.full_name},</p>
									<p>Congratulations! Your application has been approved and you are now a member of the Rotaract Club of Lilongwe.</p>
									<div class="credentials">
										<p><strong>Your Login Credentials:</strong></p>
										<p><strong>RAC Number:</strong> ${racNumber}</p>
										<p><strong>Password:</strong> [provided separately]</p>
										<p><em>Keep these credentials safe and do not share them with anyone.</em></p>
									</div>
									<p><strong>Next Steps:</strong></p>
									<ul>
										<li>Log in at https://rotaractlilongwe.org/login using your RAC number</li>
										<li>Update your profile information</li>
										<li>Explore upcoming club events and projects</li>
										<li>Connect with other members</li>
									</ul>
									<p>If you have any questions, please contact us at info@rotaractlilongwe.org</p>
									<p>We're excited to have you on board!</p>
									<p>Best regards,<br>Rotaract Club of Lilongwe</p>
								</div>
								<div class="footer">
									<p>© 2025 Rotaract Club of Lilongwe. All rights reserved.</p>
								</div>
							</div>
						</body>
						</html>
					`;

					await resend.emails.send({
						from: 'noreply@rotaractlilongwe.org',
						to: email,
						subject: `Welcome to Rotaract! Your RAC Number is ${racNumber}`,
						html: welcomeHtml
					});
					console.log(`[EMAIL] Welcome email sent to ${email}`);
				} catch (emailError) {
					console.error('[EMAIL] Failed to send welcome email:', emailError.message);
					// Don't fail the entire operation if email fails
				}
			}

			return {
				success: true,
				message: `${racNumber} assigned to ${application.full_name}. Welcome email sent.`
			};
		} catch (error) {
			console.error('Assign RAC error:', error);
			return fail(500, { message: 'An error occurred while assigning RAC number' });
		}
	},

	rejectApplication: async ({ request, locals: { safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) {
			return fail(401, { message: 'Not authenticated' });
		}

		const formData = await request.formData();
		const applicationId = String(formData.get('application_id') ?? '');
		const reason = String(formData.get('reason') ?? '');

		if (!applicationId) {
			return fail(400, { message: 'Missing application ID' });
		}

		const supabase = createSupabaseAdmin();
		if (!supabase) {
			return fail(500, { message: 'Admin client not configured' });
		}

		try {
			const { data: application } = await supabase
				.from('join_applications')
				.select('*')
				.eq('id', applicationId)
				.single();

			if (!application) {
				return fail(404, { message: 'Application not found' });
			}

			const { error: updateError } = await supabase
				.from('join_applications')
				.update({
					status: 'rejected'
				})
				.eq('id', applicationId);

			if (updateError) {
				return fail(400, { message: 'Failed to reject application' });
			}

			// Send rejection email
			const resend = createResendClient();
			if (resend) {
				try {
					const rejectionHtml = `
						<!DOCTYPE html>
						<html>
						<head>
							<meta charset="utf-8">
							<style>
								body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
								.container { max-width: 600px; margin: 0 auto; padding: 20px; }
								.header { background: #E8175D; color: white; padding: 30px 20px; text-align: center; }
								.content { background: #f9f9f9; padding: 30px 20px; }
								.footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
							</style>
						</head>
						<body>
							<div class="container">
								<div class="header">
									<h1>Rotaract Club of Lilongwe</h1>
									<p>UNITE FOR GOOD</p>
								</div>
								<div class="content">
									<h2>Application Status Update</h2>
									<p>Dear ${application.full_name},</p>
									<p>Thank you for your interest in joining the Rotaract Club of Lilongwe. After careful review of your application, we regret to inform you that we are unable to move forward at this time.</p>
									${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
									<p>We encourage you to apply again in the future. If you have any questions, please feel free to contact us at info@rotaractlilongwe.org</p>
									<p>Thank you for your understanding.</p>
									<p>Best regards,<br>Rotaract Club of Lilongwe</p>
								</div>
								<div class="footer">
									<p>© 2025 Rotaract Club of Lilongwe. All rights reserved.</p>
								</div>
							</div>
						</body>
						</html>
					`;

					await resend.emails.send({
						from: 'noreply@rotaractlilongwe.org',
						to: application.email,
						subject: 'Application Status - Rotaract Club of Lilongwe',
						html: rejectionHtml
					});
					console.log(`[EMAIL] Rejection email sent to ${application.email}`);
				} catch (emailError) {
					console.error('[EMAIL] Failed to send rejection email:', emailError.message);
				}
			}

			return {
				success: true,
				message: `Application rejected. Notification email sent to ${application.email}.`
			};
		} catch (error) {
			console.error('Reject application error:', error);
			return fail(500, { message: 'An error occurred while rejecting the application' });
		}
	},

	syncMembers: async ({ locals: { safeGetSession } }) => {
		const { session } = await safeGetSession();
		if (!session) {
			return fail(401, { message: 'Not authenticated' });
		}

		const supabase = createSupabaseAdmin();
		if (!supabase) {
			return fail(500, { message: 'Admin client not configured' });
		}

		const result = await syncMembersToGoogleSheet(supabase);
		
		if (result.success) {
			return {
				success: true,
				message: result.message,
				count: result.count,
				updatedRows: result.updatedRows
			};
		} else {
			return fail(400, {
				success: false,
				message: result.message,
				error: result.error,
				count: result.count
			});
		}
	}
};

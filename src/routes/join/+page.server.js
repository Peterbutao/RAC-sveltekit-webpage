import { fail } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { Resend } from 'resend';

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

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	return {};
}

/** @type {import('./$types').Actions} */
export const actions = {
	apply: async ({ request }) => {
		const formData = await request.formData();
		const fullName = String(formData.get('full_name') ?? '');
		const email = String(formData.get('email') ?? '');
		const phone = String(formData.get('phone') ?? '');
		const age = String(formData.get('age') ?? '');
		const occupation = String(formData.get('occupation') ?? '');
		const motivation = String(formData.get('motivation') ?? '');
		const skills = String(formData.get('skills') ?? '');

		// Validation
		if (!fullName || !email || !phone || !age || !occupation || !motivation) {
			return fail(400, { 
				message: 'Please fill in all required fields.', 
				mode: 'apply' 
			});
		}

		if (!email.includes('@')) {
			return fail(400, { 
				message: 'Please enter a valid email address.', 
				mode: 'apply' 
			});
		}

		if (isNaN(parseInt(age)) || parseInt(age) < 18) {
			return fail(400, { 
				message: 'You must be at least 18 years old to join.', 
				mode: 'apply' 
			});
		}

		try {
			const supabase = createSupabaseAdmin();

			if (!supabase) {
				console.error('Supabase admin client is not configured.');
				return fail(500, { 
					message: 'Failed to submit application. Please try again.', 
					mode: 'apply' 
				});
			}

			// Insert into Supabase
			const { error: dbError } = await supabase
				.from('join_applications')
				.insert({
					full_name: fullName,
					email,
					phone,
					age: parseInt(age),
					occupation,
					motivation,
					skills: skills || null,
					status: 'pending',
					submitted_at: new Date().toISOString()
				});

			if (dbError) {
				console.error('Database error:', dbError);
				return fail(500, { 
					message: 'Failed to submit application. Please try again.', 
					mode: 'apply' 
				});
			}

			// Send confirmation email to applicant
			const applicantEmailHtml = `
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
							<h2>Application Received!</h2>
							<p>Dear ${fullName},</p>
							<p>Thank you for your interest in joining the Rotaract Club of Lilongwe. We have received your application and our team will review it shortly.</p>
							<p><strong>What happens next:</strong></p>
							<ul>
								<li>Our membership committee will review your application</li>
								<li>We will contact you within 3-5 business days</li>
								<li>You may be invited for an interview or to attend a club meeting</li>
							</ul>
							<p>If you have any questions in the meantime, please don't hesitate to reach out to us at info@rotaractlilongwe.org</p>
							<p>We look forward to potentially welcoming you to our community of young professionals dedicated to service and leadership!</p>
							<p>Best regards,<br>Rotaract Club of Lilongwe</p>
						</div>
						<div class="footer">
							<p>© 2025 Rotaract Club of Lilongwe. All rights reserved.</p>
						</div>
					</div>
				</body>
				</html>
			`;

			const resend = createResendClient();

			if (resend) {
				await resend.emails.send({
					from: 'noreply@rotaractlilongwe.org',
					to: email,
					subject: 'Application Received - Rotaract Club of Lilongwe',
					html: applicantEmailHtml
				});
			} else {
				console.warn('RESEND_API_KEY is not configured; skipping applicant confirmation email.');
			}

			// Send notification email to admin
			const adminEmailHtml = `
				<!DOCTYPE html>
				<html>
				<head>
					<meta charset="utf-8">
					<style>
						body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
						.container { max-width: 600px; margin: 0 auto; padding: 20px; }
						.header { background: #E8175D; color: white; padding: 30px 20px; text-align: center; }
						.content { background: #f9f9f9; padding: 30px 20px; }
						.field { margin: 10px 0; }
						.label { font-weight: bold; color: #E8175D; }
					</style>
				</head>
				<body>
					<div class="container">
						<div class="header">
							<h1>New Membership Application</h1>
						</div>
						<div class="content">
							<h2>Applicant Details:</h2>
							<div class="field"><span class="label">Full Name:</span> ${fullName}</div>
							<div class="field"><span class="label">Email:</span> ${email}</div>
							<div class="field"><span class="label">Phone:</span> ${phone}</div>
							<div class="field"><span class="label">Age:</span> ${age}</div>
							<div class="field"><span class="label">Occupation:</span> ${occupation}</div>
							<div class="field"><span class="label">Motivation:</span></div>
							<p>${motivation}</p>
							${skills ? `<div class="field"><span class="label">Skills:</span> ${skills}</div>` : ''}
							<p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
						</div>
					</div>
				</body>
				</html>
			`;

			if (resend) {
				await resend.emails.send({
					from: 'noreply@rotaractlilongwe.org',
					to: 'info@rotaractlilongwe.org',
					subject: `New Application: ${fullName}`,
					html: adminEmailHtml
				});
			}

			return {
				success: true,
				message: 'Application submitted successfully! We will contact you within 3-5 business days.',
				mode: 'apply'
			};

		} catch (error) {
			console.error('Application submission error:', error);
			return fail(500, { 
				message: 'Failed to submit application. Please try again.', 
				mode: 'apply' 
			});
		}
	}
};

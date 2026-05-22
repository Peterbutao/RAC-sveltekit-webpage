import { fail, redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SHEET_ID, SHEET_NAMES } from '$lib/constants.js';
import { fetchSheet } from '$lib/server/csv.js';
import {
	getRacNumberFromUser,
	racToAuthEmail,
	racValidationError,
	normalizeRacNumber
} from '$lib/auth/rac.js';

function createSupabaseAdmin() {
	const supabaseUrl = env.SUPABASE_URL ?? PUBLIC_SUPABASE_URL;
	const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !serviceRoleKey) {
		return null;
	}

	return createClient(supabaseUrl, serviceRoleKey);
}

/** @param {string} racNumber */
function resolveAuthEmail(racNumber) {
	const validation = racValidationError(racNumber);
	if (validation) return { error: validation };
	const email = racToAuthEmail(racNumber);
	if (!email) return { error: 'Invalid RAC member number.' };
	return { email, rac: normalizeRacNumber(racNumber) };
}

function prettifyStatus(status) {
	if (!status) return 'Member';
	return `${status.charAt(0).toUpperCase()}${status.slice(1)} Member`;
}

function parseSkills(skills) {
	if (!skills) return [];
	return skills
		.split(/[,;\n]/)
		.map((label) => label.trim())
		.filter(Boolean)
		.map((label) => ({ label, level: null }));
}

function mapDashboardEvents(events) {
	return events
		.filter((event) => event.title)
		.slice(0, 4)
		.map((event) => ({
			name: event.title,
			date: [event.date, event.time].filter(Boolean).join(' · '),
			location: event.loc,
			type: event.tag || 'Club Event',
			rsvp: false
		}));
}

function mapAnnouncements(events) {
	return events
		.filter((event) => event.title)
		.slice(0, 3)
		.map((event) => ({
			title: event.tag || 'Club Update',
			body: [event.title, event.date, event.time, event.loc].filter(Boolean).join(' · '),
			time: 'From events sheet',
			icon: '📅',
			urgent: false
		}));
}

function mapActivity(projects) {
	return projects
		.filter((project) => project.name)
		.slice(0, 4)
		.map((project) => ({
			label: project.name,
			date: project.status || 'Project update',
			meta: project.impact || ''
		}));
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals: { safeGetSession }, url }) {
	const { session, user } = await safeGetSession();

	let memberData = null;
	let applicationData = null;
	let dashboardData = {
		events: [],
		announcements: [],
		activity: [],
		committees: [],
		skills: [],
		dues: null,
		attendance: null,
		volunteer: null,
		points: null
	};

	// If user is logged in, fetch their member data
	if (session && user) {
		try {
			const supabase = createSupabaseAdmin();
			if (supabase) {
				const racNumber = getRacNumberFromUser(user);
				const { data: member, error } = await supabase
					.from('members')
					.select('*')
					.or(racNumber ? `user_id.eq.${user.id},rac_number.eq.${racNumber}` : `user_id.eq.${user.id}`)
					.limit(1)
					.maybeSingle();

				if (!error && member) {
					memberData = {
						rac_number: member.rac_number,
						full_name: member.full_name,
						email: member.email,
						phone: member.phone,
						occupation: member.occupation,
						is_admin: member.is_admin,
						status: member.status,
						created_at: member.created_at
					};

					const { data: application } = await supabase
						.from('join_applications')
						.select('skills,motivation,submitted_at,status,rac_number')
						.eq('rac_number', member.rac_number)
						.maybeSingle();

					applicationData = application ?? null;
				}
			}

			const [events, projects, duelist, attendlist, volunteerlist, committeeList, skillsList] = await Promise.all([
				fetchSheet(SHEET_ID, SHEET_NAMES.EVENTS),
				fetchSheet(SHEET_ID, SHEET_NAMES.PROJECTS),
				fetchSheet(SHEET_ID, SHEET_NAMES.DUES),
				fetchSheet(SHEET_ID, SHEET_NAMES.ATTENDANCE),
				fetchSheet(SHEET_ID, SHEET_NAMES.VOLUNTEER_HOURS),
				fetchSheet(SHEET_ID, SHEET_NAMES.COMMITTEES),
				fetchSheet(SHEET_ID, SHEET_NAMES.SKILLS)
			]);

			// Find member data in each sheet
			const memberRac = memberData?.rac_number;
			const memberDues = memberRac ? duelist.find(d => d.rac_number === memberRac) : null;
			const memberAttendance = memberRac ? attendlist.find(a => a.rac_number === memberRac) : null;
			const memberVolunteer = memberRac ? volunteerlist.filter(v => v.rac_number === memberRac) : [];
			const memberCommittees = memberRac ? committeeList.filter(c => c.rac_number === memberRac) : [];
			const memberSkills = memberRac ? skillsList.filter(s => s.rac_number === memberRac) : [];

			// Parse dues data
			const duesData = memberDues ? {
				annual: parseInt(memberDues.annual_amount) || 0,
				paid: parseInt(memberDues.total_paid) || 0,
				currency: 'MWK',
				status: memberDues.status || 'pending',
				nextDue: memberDues.next_due_date || 'N/A',
				monthly: {
					Jan: parseInt(memberDues.Jan) || 0,
					Feb: parseInt(memberDues.Feb) || 0,
					Mar: parseInt(memberDues.Mar) || 0,
					Apr: parseInt(memberDues.Apr) || 0,
					May: parseInt(memberDues.May) || 0,
					Jun: parseInt(memberDues.Jun) || 0,
					Jul: parseInt(memberDues.Jul) || 0,
					Aug: parseInt(memberDues.Aug) || 0,
					Sep: parseInt(memberDues.Sep) || 0,
					Oct: parseInt(memberDues.Oct) || 0,
					Nov: parseInt(memberDues.Nov) || 0,
					Dec: parseInt(memberDues.Dec) || 0
				}
			} : null;

			// Parse attendance data
			const attendanceData = memberAttendance ? {
				total: parseInt(memberAttendance.total_meetings) || 0,
				attended: parseInt(memberAttendance.total_attended) || 0,
				rate: memberAttendance.attendance_rate || '0%',
				monthly: {
					Jan: parseInt(memberAttendance.Jan) || 0,
					Feb: parseInt(memberAttendance.Feb) || 0,
					Mar: parseInt(memberAttendance.Mar) || 0,
					Apr: parseInt(memberAttendance.Apr) || 0,
					May: parseInt(memberAttendance.May) || 0,
					Jun: parseInt(memberAttendance.Jun) || 0,
					Jul: parseInt(memberAttendance.Jul) || 0,
					Aug: parseInt(memberAttendance.Aug) || 0,
					Sep: parseInt(memberAttendance.Sep) || 0,
					Oct: parseInt(memberAttendance.Oct) || 0,
					Nov: parseInt(memberAttendance.Nov) || 0,
					Dec: parseInt(memberAttendance.Dec) || 0
				}
			} : null;

			// Calculate total volunteer hours
			const totalVolunteerHours = memberVolunteer.reduce((sum, v) => sum + (parseInt(v.hours) || 0), 0);

			// Parse committee data
			const committeesData = memberCommittees.map(c => ({
				name: c.committee_name,
				position: c.position,
				startDate: c.start_date,
				endDate: c.end_date,
				status: c.status
			}));

			// Parse skills data
			const skillsData = memberSkills.map(s => ({
				label: s.skill_name,
				level: s.proficiency_level,
				experience: s.years_experience
			}));

			// Calculate member points
			let memberPoints = 0;
			if (duesData && duesData.annual > 0) {
				memberPoints += Math.round((duesData.paid / duesData.annual * 100));
			}
			if (attendanceData && attendanceData.total > 0) {
				const rateNum = parseInt(attendanceData.rate) || 0;
				memberPoints += Math.round(rateNum * 0.75);
			}
			memberPoints += Math.min(100, totalVolunteerHours * 5);
			memberPoints += committeesData.length * 25;

			dashboardData = {
				events: mapDashboardEvents(events),
				announcements: mapAnnouncements(events),
				activity: mapActivity(projects),
				committees: committeesData,
				skills: skillsData.length > 0 ? skillsData : parseSkills(applicationData?.skills),
				dues: duesData,
				attendance: attendanceData,
				volunteer: { hours: totalVolunteerHours, target: 200 },
				points: memberPoints,
				role: memberData?.is_admin ? 'Admin Member' : prettifyStatus(memberData?.status)
			};
		} catch (error) {
			console.error('[LOGIN] Error loading dashboard data:', error);
			// Return defaults on error, don't crash the page
		}
	}

	return {
		session,
		user,
		memberData,
		applicationData,
		dashboardData,
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

/** Domain for Supabase auth emails derived from RAC member IDs */
const MEMBER_AUTH_DOMAIN = 'members.rotaractlilongwe.org';

/** @param {string} input */
export function normalizeRacNumber(input) {
	return input.trim().toLowerCase().replace(/\s+/g, '');
}

/** @param {string} rac */
export function isValidRacNumber(rac) {
	// Accepts: rac026001 (user), rac0000001 (admin)
	// Format: rac + 6 digits (for year+counter) or rac + 9 digits (for admin)
	return /^rac\d{6}$/.test(rac) || /^rac\d{9}$/.test(rac);
}

/**
 * Maps rac026001 → rac026001@members.rotaractlilongwe.org for Supabase Auth.
 * @param {string} racNumber
 * @returns {string | null}
 */
export function racToAuthEmail(racNumber) {
	const rac = normalizeRacNumber(racNumber);
	if (!isValidRacNumber(rac)) return null;
	return `${rac}@${MEMBER_AUTH_DOMAIN}`;
}

/** @param {string | undefined} email */
export function authEmailToRacNumber(email) {
	if (!email) return null;
	const local = email.split('@')[0]?.toLowerCase();
	if (local && isValidRacNumber(local)) return local;
	return null;
}

/** @param {import('@supabase/supabase-js').User | null | undefined} user */
export function getRacNumberFromUser(user) {
	if (!user) return null;
	const fromMeta = user.user_metadata?.rac_number;
	if (typeof fromMeta === 'string' && isValidRacNumber(normalizeRacNumber(fromMeta))) {
		return normalizeRacNumber(fromMeta);
	}
	return authEmailToRacNumber(user.email);
}

/** @param {string} racNumber */
export function racValidationError(racNumber) {
	const rac = normalizeRacNumber(racNumber);
	if (!rac) return 'Enter your RAC member number.';
	if (!isValidRacNumber(rac)) return 'Use format rac026001 for members.';
	return null;
}

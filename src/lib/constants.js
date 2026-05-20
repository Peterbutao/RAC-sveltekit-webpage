/**
 * Application constants
 */

// Design tokens
export const COLORS = {
	PRIMARY: '#E8175D',
	DARK_MAGENTA: '#8B1045',
	NEAR_BLACK: '#1A1A1A',
	CREAM: '#F5F1E3',
	ORANGE: '#F97316'
};

// Google Sheets
export const SHEET_ID = '1kN76ZIpPbE5KhKvSA0lLtrCpdechOWT1qlhHT7DtmRg';

// Carousel and images
export const CAROUSEL_TIMINGS = {
	ADVANCE_MS: 4200,
	ABOUT_TEAM_CACHE_MS: 10 * 60 * 1000,
	IMAGE_WIDTH: 960,
	IMAGE_QUALITY: 72
};

// Supabase storage
export const STORAGE = {
	ABOUT_TEAM_BUCKET: 'RAC',
	ABOUT_TEAM_FOLDER: 'about',
	IMAGE_REGEX: /\.(avif|gif|jpe?g|png|webp)$/i
};

// API timeouts
export const TIMEOUTS = {
	FETCH_SHEET_MS: 10000,
	DATABASE_MS: 30000,
	EMAIL_MS: 15000
};

// Validation
export const VALIDATION = {
	MIN_AGE: 18,
	MAX_AGE: 120,
	MIN_NAME_LENGTH: 2,
	MAX_NAME_LENGTH: 100,
	MAX_TEXTAREA_LENGTH: 5000
};

// Auth
export const AUTH = {
	MEMBER_AUTH_DOMAIN: 'members.rotaractlilongwe.org',
	MEMBER_ID_REGEX: /^RAC\d+$/,
	SESSION_CACHE_MS: 24 * 60 * 60 * 1000 // 24 hours
};

// Rate limiting
export const RATE_LIMIT = {
	LOGIN_ATTEMPTS: 5,
	LOGIN_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
	PASSWORD_RESET_ATTEMPTS: 3,
	PASSWORD_RESET_WINDOW_MS: 60 * 60 * 1000 // 1 hour
};

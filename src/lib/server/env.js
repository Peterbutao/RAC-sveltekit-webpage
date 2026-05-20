/**
 * Environment variable validation and configuration
 */

/**
 * Validate that all required environment variables are set
 * @param {string[]} required - Array of required environment variable names
 * @param {boolean} throwOnError - Whether to throw or just log warnings
 * @returns {Object} Object with validation result and missing vars
 */
export function validateEnv(required = [], throwOnError = false) {
	const missing = required.filter(key => !process.env[key]);

	if (missing.length > 0) {
		const message = `Missing required environment variables: ${missing.join(', ')}`;

		if (throwOnError && process.env.NODE_ENV === 'production') {
			throw new Error(message);
		}

		if (missing.length > 0) {
			console.warn(`[ENV] ${message}`);
		}

		return {
			valid: false,
			missing
		};
	}

	return { valid: true, missing: [] };
}

/**
 * Get an environment variable with a fallback value
 * @param {string} key - Environment variable name
 * @param {string} fallback - Fallback value if not set
 * @returns {string}
 */
export function getEnv(key, fallback = '') {
	return process.env[key] ?? fallback;
}

/**
 * Check if running in production
 * @returns {boolean}
 */
export function isProduction() {
	return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 * @returns {boolean}
 */
export function isDevelopment() {
	return process.env.NODE_ENV === 'development';
}

/**
 * Get Supabase configuration
 * @param {Object} env - Environment variables object
 * @param {string} publicUrl - PUBLIC_SUPABASE_URL
 * @returns {Object} Supabase config or null if missing
 */
export function getSupabaseConfig(env, publicUrl) {
	const url = env.SUPABASE_URL ?? publicUrl;
	const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
	const anonKey = env.PUBLIC_SUPABASE_ANON_KEY;

	if (!url) {
		console.error('[ENV] SUPABASE_URL is not configured');
		return null;
	}

	return {
		url,
		serviceKey: serviceKey ?? anonKey,
		anonKey
	};
}

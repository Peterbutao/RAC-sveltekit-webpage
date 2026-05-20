/**
 * CSV parsing and data fetching utilities
 */

/**
 * Parse CSV text into array of objects
 * @param {string} text - Raw CSV text
 * @returns {Array<Record<string, string>>}
 */
export function parseCSV(text) {
	function splitLine(line) {
		const fields = [];
		let cur = '', inQuote = false;
		for (let i = 0; i < line.length; i++) {
			const ch = line[i];
			if (ch === '"') {
				if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
				else inQuote = !inQuote;
			} else if (ch === ',' && !inQuote) {
				fields.push(cur); cur = '';
			} else {
				cur += ch;
			}
		}
		fields.push(cur);
		return fields;
	}

	const lines = text.trim().split('\n');
	if (lines.length === 0) return [];

	const headers = splitLine(lines[0]).map(h => h.trim());
	return lines.slice(1).map(line => {
		const cols = splitLine(line);
		return Object.fromEntries(headers.map((h, i) => [h, (cols[i] ?? '').trim()]));
	});
}

/**
 * Fetch and parse a Google Sheet as CSV
 * @param {string} sheetId - Google Sheet ID
 * @param {string} name - Sheet name
 * @param {number} timeoutMs - Request timeout in milliseconds
 * @returns {Promise<Array<Record<string, string>>>}
 */
export async function fetchSheet(sheetId, name, timeoutMs = 10000) {
	const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${name}`;

	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), timeoutMs);

		const res = await fetch(url, { signal: controller.signal });
		clearTimeout(timeout);

		if (!res.ok) {
			console.error(`[SHEET] fetchSheet(${name}) failed: ${res.status} ${res.statusText}`);
			return [];
		}

		const text = await res.text();
		return parseCSV(text);
	} catch (error) {
		if (error.name === 'AbortError') {
			console.error(`[SHEET] fetchSheet(${name}) timed out after ${timeoutMs}ms`);
		} else {
			console.error(`[SHEET] fetchSheet(${name}) failed:`, error.message);
		}
		return [];
	}
}

/**
 * Fetch multiple sheets in parallel
 * @param {string} sheetId - Google Sheet ID
 * @param {string[]} sheetNames - Array of sheet names to fetch
 * @returns {Promise<Object>} Object with sheet names as keys
 */
export async function fetchSheets(sheetId, sheetNames) {
	const results = await Promise.all(
		sheetNames.map(name => fetchSheet(sheetId, name))
	);

	return Object.fromEntries(
		sheetNames.map((name, i) => [name, results[i]])
	);
}

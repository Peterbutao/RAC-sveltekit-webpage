// ── Constants ────────────────────────────────────────────────────────────────
const SHEET_ID = '1kN76ZIpPbE5KhKvSA0lLtrCpdechOWT1qlhHT7DtmRg';

function parseCSV(text) {
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
  const headers = splitLine(lines[0]).map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = splitLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, (cols[i] ?? '').trim()]));
  });
}

async function fetchSheet(name) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${name}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`fetchSheet(${name}) failed:`, res.status);
    return [];
  }
  const text = await res.text();
  return parseCSV(text);
}

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  const PROJECTS = await fetchSheet('PROJECTS');
  return { PROJECTS };
}

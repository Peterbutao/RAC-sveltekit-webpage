// ── Constants ────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';

const SHEET_ID = '1kN76ZIpPbE5KhKvSA0lLtrCpdechOWT1qlhHT7DtmRg';

const ICON_MAP_KEYS = ['Handshake', 'Globe2', 'Briefcase', 'Globe'];
const ABOUT_TEAM_BUCKET = 'RAC';
const ABOUT_TEAM_FOLDER = 'about';
const ABOUT_TEAM_IMAGE_RE = /\.(avif|gif|jpe?g|png|webp)$/i;
const ABOUT_TEAM_CACHE_MS = 10 * 60 * 1000;
const ABOUT_TEAM_IMAGE_WIDTH = 960;
const ABOUT_TEAM_IMAGE_QUALITY = 72;
const ABOUT_TEAM_PUBLIC_URL = `${PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/${ABOUT_TEAM_BUCKET}/${ABOUT_TEAM_FOLDER}`;

let cachedAboutTeamImages = [];
let cachedAboutTeamImagesUntil = 0;

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

function createStorageClient() {
  const supabaseUrl = env.SUPABASE_URL ?? PUBLIC_SUPABASE_URL;
  const storageKey = env.SUPABASE_SERVICE_ROLE_KEY ?? PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !storageKey) return null;

  return createClient(supabaseUrl, storageKey, {
    auth: { persistSession: false }
  });
}

function imageAltFromFileName(name) {
  const label = name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
  return label ? `Rotaract Club of Lilongwe team photo - ${label}` : 'Rotaract Club of Lilongwe team photo';
}

async function fetchAboutTeamImages() {
  const now = Date.now();
  if (cachedAboutTeamImagesUntil > now) {
    return cachedAboutTeamImages;
  }

  const supabase = createStorageClient();

  if (!supabase) {
    console.error('Supabase storage client is not configured.');
    return [];
  }

  const { data: files, error } = await supabase.storage
    .from(ABOUT_TEAM_BUCKET)
    .list(ABOUT_TEAM_FOLDER, {
      limit: 100,
      sortBy: { column: 'name', order: 'asc' }
    });

  if (error) {
    console.error('fetchAboutTeamImages failed:', error.message);
    return cachedAboutTeamImages;
  }

  cachedAboutTeamImages = (files ?? [])
    .filter((file) => ABOUT_TEAM_IMAGE_RE.test(file.name))
    .map((file) => ({
      src: `${ABOUT_TEAM_PUBLIC_URL}/${encodeURIComponent(file.name)}?width=${ABOUT_TEAM_IMAGE_WIDTH}&quality=${ABOUT_TEAM_IMAGE_QUALITY}&resize=cover`,
      alt: imageAltFromFileName(file.name)
    }));
  cachedAboutTeamImagesUntil = now + ABOUT_TEAM_CACHE_MS;

  return cachedAboutTeamImages;
}

/** @type {import('./$types').PageServerLoad} */
export async function load() {
  const [PROJECTS, STATS, rawAvenues, EVENTS, rawFooter, ABOUT_TEAM_IMAGES] = await Promise.all([
    fetchSheet('PROJECTS'),
    fetchSheet('STATS'),
    fetchSheet('AVENUES'),
    fetchSheet('EVENTS'),
    fetchSheet('FOOTER_COLS'),
    fetchAboutTeamImages(),
  ]);

  // Keep icon as a string key — the component mapping happens client-side
  // since Lucide components are not serialisable across the server boundary.
  const AVENUES = rawAvenues.map(a => ({
    ...a,
    // Validate the key exists in our known map so the client can look it up safely
    iconKey: ICON_MAP_KEYS.includes(a.icon) ? a.icon : null,
  }));

  const FOOTER_COLS = rawFooter.map(col => ({
    ...col,
    links: col.links ? col.links.split(',').map(l => l.trim()) : [],
  }));

  return { PROJECTS, STATS, AVENUES, EVENTS, FOOTER_COLS, ABOUT_TEAM_IMAGES };
}

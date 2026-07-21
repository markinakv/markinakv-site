const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/13aZr-z1eYpwtY5hcdBCyAQOYG7Q0_R84Zm2RSK9og5o/gviz/tq?tqx=out:csv&gid=0';

const EMPTY = { country: null, city: null, until: null };

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\r') {
      // skip, newline handled on \n
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function normalizeHeader(h) {
  return String(h || '').trim().toLowerCase().replace(/ё/g, 'е');
}

function findHeaderIndex(header, names) {
  for (const name of names) {
    const i = header.indexOf(name);
    if (i !== -1) return i;
  }
  return -1;
}

function parseDdMmYyyy(str) {
  const m = String(str || '').trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  return Date.UTC(year, month - 1, day);
}

function formatDdMmYy(ms) {
  const d = new Date(ms);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yy = String(d.getUTCFullYear()).slice(-2);
  return `${dd}.${mm}.${yy}`;
}

async function resolveLocation() {
  const r = await fetch(SHEET_CSV_URL);
  if (!r.ok) throw new Error('sheet fetch failed: ' + r.status);
  const csvText = await r.text();

  const rows = parseCSV(csvText).filter((row) => row.some((cell) => String(cell).trim() !== ''));
  if (rows.length < 2) return EMPTY;

  const header = rows[0].map(normalizeHeader);
  const idx = {
    country: findHeaderIndex(header, ['country']),
    city: findHeaderIndex(header, ['city']),
    arrive: findHeaderIndex(header, ['прилет']),
    depart: findHeaderIndex(header, ['вылет']),
  };
  if (idx.country === -1 || idx.arrive === -1 || idx.depart === -1) return EMPTY;

  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const arrive = parseDdMmYyyy(row[idx.arrive]);
    const depart = parseDdMmYyyy(row[idx.depart]);
    if (arrive == null || depart == null) continue;
    if (today >= arrive && today <= depart) {
      const country = String(row[idx.country] || '').trim() || null;
      const cityRaw = idx.city !== -1 ? String(row[idx.city] || '').trim() : '';
      return { country, city: cityRaw || null, until: formatDdMmYy(depart) };
    }
  }
  return EMPTY;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  try {
    const result = await resolveLocation();
    res.status(200).json(result);
  } catch (e) {
    res.status(200).json(EMPTY);
  }
}

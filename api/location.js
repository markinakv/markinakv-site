const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/13aZr-z1eYpwtY5hcdBCyAQOYG7Q0_R84Zm2RSK9og5o/gviz/tq?tqx=out:csv&gid=0';

const EMPTY = { country: null, countryEn: null, city: null, until: null, gmt: null };

// Часовые пояса: страна (ru/en, в нижнем регистре) → [IANA-пояс, название на EN]
const COUNTRIES = [
  [['болгария','bulgaria'], 'Europe/Sofia', 'Bulgaria'],
  [['сербия','serbia'], 'Europe/Belgrade', 'Serbia'],
  [['португалия','portugal'], 'Europe/Lisbon', 'Portugal'],
  [['испания','spain'], 'Europe/Madrid', 'Spain'],
  [['франция','france'], 'Europe/Paris', 'France'],
  [['италия','italy'], 'Europe/Rome', 'Italy'],
  [['германия','germany'], 'Europe/Berlin', 'Germany'],
  [['австрия','austria'], 'Europe/Vienna', 'Austria'],
  [['чехия','czechia','czech republic'], 'Europe/Prague', 'Czechia'],
  [['польша','poland'], 'Europe/Warsaw', 'Poland'],
  [['венгрия','hungary'], 'Europe/Budapest', 'Hungary'],
  [['румыния','romania'], 'Europe/Bucharest', 'Romania'],
  [['греция','greece'], 'Europe/Athens', 'Greece'],
  [['турция','turkey','türkiye'], 'Europe/Istanbul', 'Turkey'],
  [['грузия','georgia'], 'Asia/Tbilisi', 'Georgia'],
  [['армения','armenia'], 'Asia/Yerevan', 'Armenia'],
  [['черногория','montenegro'], 'Europe/Podgorica', 'Montenegro'],
  [['хорватия','croatia'], 'Europe/Zagreb', 'Croatia'],
  [['словения','slovenia'], 'Europe/Ljubljana', 'Slovenia'],
  [['босния и герцеговина','босния','bosnia and herzegovina','bosnia'], 'Europe/Sarajevo', 'Bosnia and Herzegovina'],
  [['северная македония','македония','north macedonia'], 'Europe/Skopje', 'North Macedonia'],
  [['албания','albania'], 'Europe/Tirane', 'Albania'],
  [['нидерланды','голландия','netherlands'], 'Europe/Amsterdam', 'Netherlands'],
  [['бельгия','belgium'], 'Europe/Brussels', 'Belgium'],
  [['швейцария','switzerland'], 'Europe/Zurich', 'Switzerland'],
  [['великобритания','англия','uk','united kingdom'], 'Europe/London', 'United Kingdom'],
  [['ирландия','ireland'], 'Europe/Dublin', 'Ireland'],
  [['дания','denmark'], 'Europe/Copenhagen', 'Denmark'],
  [['швеция','sweden'], 'Europe/Stockholm', 'Sweden'],
  [['норвегия','norway'], 'Europe/Oslo', 'Norway'],
  [['финляндия','finland'], 'Europe/Helsinki', 'Finland'],
  [['эстония','estonia'], 'Europe/Tallinn', 'Estonia'],
  [['латвия','latvia'], 'Europe/Riga', 'Latvia'],
  [['литва','lithuania'], 'Europe/Vilnius', 'Lithuania'],
  [['кипр','cyprus'], 'Asia/Nicosia', 'Cyprus'],
  [['мальта','malta'], 'Europe/Malta', 'Malta'],
  [['россия','russia'], 'Europe/Moscow', 'Russia'],
  [['оаэ','uae','united arab emirates'], 'Asia/Dubai', 'UAE'],
  [['таиланд','тайланд','thailand'], 'Asia/Bangkok', 'Thailand'],
  [['вьетнам','vietnam'], 'Asia/Ho_Chi_Minh', 'Vietnam'],
  [['индонезия','indonesia'], 'Asia/Makassar', 'Indonesia'],
  [['малайзия','malaysia'], 'Asia/Kuala_Lumpur', 'Malaysia'],
  [['сингапур','singapore'], 'Asia/Singapore', 'Singapore'],
  [['япония','japan'], 'Asia/Tokyo', 'Japan'],
  [['южная корея','корея','south korea','korea'], 'Asia/Seoul', 'South Korea'],
  [['шри-ланка','шри ланка','sri lanka'], 'Asia/Colombo', 'Sri Lanka'],
  [['индия','india'], 'Asia/Kolkata', 'India'],
  [['непал','nepal'], 'Asia/Kathmandu', 'Nepal'],
  [['китай','china'], 'Asia/Shanghai', 'China'],
  [['египет','egypt'], 'Africa/Cairo', 'Egypt'],
  [['марокко','morocco'], 'Africa/Casablanca', 'Morocco'],
  [['кения','kenya'], 'Africa/Nairobi', 'Kenya'],
  [['танзания','tanzania'], 'Africa/Dar_es_Salaam', 'Tanzania'],
  [['бурунди','burundi'], 'Africa/Bujumbura', 'Burundi'],
  [['канада','canada'], 'America/Toronto', 'Canada'],
  [['сша','usa','united states'], 'America/New_York', 'USA'],
  [['мексика','mexico'], 'America/Mexico_City', 'Mexico'],
  [['аргентина','argentina'], 'America/Argentina/Buenos_Aires', 'Argentina'],
  [['бразилия','brazil'], 'America/Sao_Paulo', 'Brazil'],
];

// Города в странах с несколькими поясами
const CITIES = [
  [['ванкувер','vancouver','виктория','victoria'], 'America/Vancouver'],
  [['калгари','calgary','эдмонтон','edmonton','банф','banff'], 'America/Edmonton'],
  [['виннипег','winnipeg'], 'America/Winnipeg'],
  [['галифакс','halifax'], 'America/Halifax'],
  [['лос-анджелес','los angeles','сан-франциско','san francisco','сиэтл','seattle'], 'America/Los_Angeles'],
  [['чикаго','chicago'], 'America/Chicago'],
  [['денвер','denver'], 'America/Denver'],
  [['азоры','azores','понта-делгада','ponta delgada'], 'Atlantic/Azores'],
  [['тенерифе','tenerife','гран-канария','gran canaria','лас-пальмас','las palmas'], 'Atlantic/Canary'],
  [['джакарта','jakarta'], 'Asia/Jakarta'],
  [['калининград','kaliningrad'], 'Europe/Kaliningrad'],
];

function norm(s) {
  return String(s || '').trim().toLowerCase().replace(/ё/g, 'е');
}

function findCountry(country) {
  const c = norm(country);
  return COUNTRIES.find(([names]) => names.includes(c)) || null;
}

function findCityTz(city) {
  const c = norm(city);
  if (!c) return null;
  const hit = CITIES.find(([names]) => names.includes(c));
  return hit ? hit[1] : null;
}

function gmtOffset(timeZone) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' }).formatToParts(new Date());
    const name = (parts.find((p) => p.type === 'timeZoneName') || {}).value || '';
    return name === 'GMT' ? 'GMT+0' : name || null;
  } catch (e) {
    return null;
  }
}


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
      const found = findCountry(country);
      const tz = findCityTz(cityRaw) || (found ? found[1] : null);
      return {
        country,
        countryEn: found ? found[2] : country,
        city: cityRaw || null,
        until: formatDdMmYy(depart),
        gmt: tz ? gmtOffset(tz) : null,
      };
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

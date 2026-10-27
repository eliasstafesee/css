// ethcal.js — የኢትዮጵያ ቀን አቆጣጠር። Dates stay Gregorian (YYYY-MM-DD) in the database;
// people see and type them as ቀን/ወር/ዓመተ ምሕረት (dd/mm/yyyy).
const EC = (() => {
  const MONTHS = ["መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት", "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜን"];
  const pad = (x) => String(x).padStart(2, "0");
  const isoToJdn = (iso) => { const [a, b, c] = iso.split("-").map(Number); return Date.UTC(a, b - 1, c) / 864e5 + 2440588; };
  const jdnToIso = (j) => new Date((j - 2440588) * 864e5).toISOString().slice(0, 10);
  const toJdn = (y, m, d) => 1724221 + 365 * (y - 1) + Math.floor(y / 4) + 30 * (m - 1) + d - 1;
  const fromJdn = (j) => {
    const r = (j - 1723856) % 1461, n = (r % 365) + 365 * Math.floor(r / 1460);
    return { y: 4 * Math.floor((j - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460), m: Math.floor(n / 30) + 1, d: (n % 30) + 1 };
  };
  const dim = (y, m) => (m < 13 ? 30 : y % 4 === 3 ? 6 : 5);          // ጳጉሜን 5 ወይም 6 ቀን
  const valid = (y, m, d) => y >= 1900 && y <= 2300 && m >= 1 && m <= 13 && d >= 1 && d <= dim(y, m);
  const isoOf = (dt) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;   // local date
  const fmt = (iso, empty = "—") => {
    if (!iso) return empty;
    const e = fromJdn(isoToJdn(String(iso).slice(0, 10)));
    return `${pad(e.d)}/${pad(e.m)}/${e.y}`;
  };
  return {
    MONTHS, dim, isoOf, fmt,
    fromISO: (iso) => fromJdn(isoToJdn(iso)),
    toISO: (y, m, d) => jdnToIso(toJdn(y, m, d)),
    fmtTs: (ts) => fmt(isoOf(new Date(ts))),
    today: () => fromJdn(isoToJdn(isoOf(new Date()))),
    // "15/02/2019" -> Gregorian ISO string, or null when it is not a real Ethiopian date.
    parse: (s) => {
      const p = String(s).trim().split(/[\/\-.\s]+/).map(Number);
      if (p.length !== 3 || p.some(isNaN)) return null;
      const [d, m, y] = p;
      return valid(y, m, d) ? jdnToIso(toJdn(y, m, d)) : null;
    },
  };
})();

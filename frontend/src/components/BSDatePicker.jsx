/**
 * BSDatePicker — Bikram Sambat date picker
 *
 * Props:
 *   label     string  – field label
 *   name      string  – form field name
 *   value     string  – AD date "YYYY-MM-DD" (what backend stores)
 *   onChange  fn      – called as onChange({ target: { name, value } })
 *                       value is always AD "YYYY-MM-DD"
 *   required  bool
 *
 * npm install nepali-date-converter
 */

import { useState, useEffect, useRef } from "react";
import NepaliDate from "nepali-date-converter";
import { useTranslation } from "react-i18next";

// ── BS days-per-month table (2075–2090 BS) ────────────────────────────────────
const BS_DAYS = {
  2075: [31,31,32,32,31,30,30,29,30,29,30,30],
  2076: [31,32,31,32,31,30,30,30,29,29,30,30],
  2077: [31,31,32,31,31,31,30,29,30,29,30,30],
  2078: [31,31,32,32,31,30,30,29,30,29,30,30],
  2079: [31,32,31,32,31,30,30,30,29,30,29,31],
  2080: [31,31,32,31,31,31,30,29,30,29,30,30],
  2081: [31,31,32,32,31,30,30,29,30,29,30,30],
  2082: [31,32,31,32,31,30,30,30,29,29,30,31],
  2083: [31,31,32,31,31,31,30,29,30,29,30,30],
  2084: [31,31,32,32,31,30,30,29,30,29,30,30],
  2085: [31,32,31,32,31,30,30,30,29,29,30,31],
  2086: [31,31,32,31,31,31,30,29,30,29,30,30],
  2087: [31,31,32,32,31,30,30,29,30,29,30,30],
  2088: [31,32,31,32,31,30,30,30,29,29,30,31],
  2089: [31,31,32,31,31,31,30,29,30,29,30,30],
  2090: [31,31,32,32,31,30,30,29,30,29,30,30],
};

const BS_START_YEAR = 2075;
const BS_END_YEAR   = 2090;

/** Days in a BS month — month is 0-indexed (0 = Baisakh) */
function getDaysInBsMonth(year, month0) {
  const row = BS_DAYS[year];
  if (!row) return 30;
  return row[month0];
}

const BS_MONTHS_EN = [
  "Baisakh","Jestha","Asar","Shrawan",
  "Bhadra","Ashwin","Kartik","Mangsir",
  "Poush","Magh","Falgun","Chaitra",
];
const BS_MONTHS_NE = [
  "बैशाख","जेठ","असार","श्रावण",
  "भाद्र","आश्विन","कार्तिक","मंसिर",
  "पुष","माघ","फाल्गुण","चैत्र",
];

// ── AD ↔ BS helpers ───────────────────────────────────────────────────────────

/** AD "YYYY-MM-DD" → { year, month(0-idx), day } BS. Returns null on error. */
function adToBs(adStr) {
  if (!adStr) return null;
  try {
    const bs = new NepaliDate(new Date(adStr));
    return { year: bs.getYear(), month: bs.getMonth(), day: bs.getDate() };
  } catch { return null; }
}

/** BS { year, month(0-idx), day } → AD "YYYY-MM-DD". Returns "" on error. */
function bsToAd(year, month, day) {
  try {
    const adDate = new NepaliDate(year, month, day).toJsDate();
    const y = adDate.getFullYear();
    const m = String(adDate.getMonth() + 1).padStart(2, "0");
    const d = String(adDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  } catch { return ""; }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BSDatePicker({ label, name, value, onChange, required = false }) {
  const { i18n } = useTranslation();
  const isNepali   = i18n.language === "ne";
  const monthNames = isNepali ? BS_MONTHS_NE : BS_MONTHS_EN;

  const todayBs = adToBs(new Date().toISOString().split("T")[0]);
  const parsed  = adToBs(value);

  const [bsYear,  setBsYear]  = useState(parsed?.year  ?? todayBs?.year  ?? 2081);
  const [bsMonth, setBsMonth] = useState(parsed?.month ?? todayBs?.month ?? 0);
  const [bsDay,   setBsDay]   = useState(parsed?.day   ?? 1);

  const hasMounted = useRef(false);

  // Emit initial value on mount only if no value is provided
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      if (!value) {
        const adValue = bsToAd(bsYear, bsMonth, Math.min(bsDay, getDaysInBsMonth(bsYear, bsMonth)));
        if (adValue) {
          onChange({ target: { name, value: adValue } });
        }
      }
    }
  }, []);

  // Sync selects when external value changes (edit-mode pre-fill)
  useEffect(() => {
    const p = adToBs(value);
    if (p) {
      setBsYear(p.year);
      setBsMonth(p.month);
      setBsDay(p.day);
    }
  }, [value]);

  const daysInMonth = getDaysInBsMonth(bsYear, bsMonth);
  const safeDay     = Math.min(bsDay, daysInMonth);

  const emit = (y, m, d) => {
    const clamped = Math.min(d, getDaysInBsMonth(y, m));
    onChange({ target: { name, value: bsToAd(y, m, clamped) } });
  };

  const handleYear  = (e) => { const y = Number(e.target.value); setBsYear(y);  emit(y, bsMonth, safeDay); };
  const handleMonth = (e) => { const m = Number(e.target.value); setBsMonth(m); emit(bsYear, m, safeDay); };
  const handleDay   = (e) => { const d = Number(e.target.value); setBsDay(d);   emit(bsYear, bsMonth, d); };

  const years = Array.from({ length: BS_END_YEAR - BS_START_YEAR + 1 }, (_, i) => BS_START_YEAR + i);
  const sel   = "border border-gray-300 rounded px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";

  return (
    <div>
      {label && (
        <label className="block text-sm text-gray-600 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="flex gap-2">
        {/* Year */}
        <select value={bsYear} onChange={handleYear} className={`${sel} w-24`}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        {/* Month */}
        <select value={bsMonth} onChange={handleMonth} className={`${sel} flex-1`}>
          {monthNames.map((mn, i) => <option key={i} value={i}>{mn}</option>)}
        </select>

        {/* Day */}
        <select value={safeDay} onChange={handleDay} className={`${sel} w-16`}>
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Show AD equivalent as a small hint */}
      {value && (
        <p className="text-[10px] text-gray-400 mt-1">AD: {value}</p>
      )}
    </div>
  );
}
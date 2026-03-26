import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  TrendingUp, Wallet, CheckCircle, Clock, AlertTriangle,
  FileBarChart, Receipt, Package, Printer, RefreshCw,
} from "lucide-react";
import api from "../../api/axios";

const TOTAL_WARD_BUDGET = 45_000_000;

const fmt  = (n) => new Intl.NumberFormat("en-NP", { minimumFractionDigits: 2 }).format(Number(n) || 0);
const fmtM = (n) => `${((Number(n) || 0) / 1_000_000).toFixed(2)}M`;
const pct  = (a, b) => (b > 0 ? Math.min(100, Math.round((a / b) * 100)) : 0);
const sumBy = (arr, k) => arr.reduce((s, x) => s + (Number(x[k]) || 0), 0);

// ── Mini donut ────────────────────────────────────────────────────────────────
function MiniDonut({ used, committed, total }) {
  const usedPct      = pct(used, total);
  const committedPct = pct(committed, total);
  const r = 20, cx = 24, cy = 24, sw = 6;
  const circ = 2 * Math.PI * r;
  let cum = 0;
  const segs = [
    { val: usedPct,      color: "#2563eb" },
    { val: committedPct, color: "#f59e0b" },
    { val: Math.max(0, 100 - usedPct - committedPct), color: "#e5e7eb" },
  ].filter(s => s.val > 0).map(seg => {
    const dash = (seg.val / 100) * circ;
    const offset = circ - (cum / 100) * circ;
    cum += seg.val;
    return { ...seg, dash, offset };
  });

  return (
    <svg viewBox="0 0 48 48" className="w-12 h-12 -rotate-90 flex-shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={sw} />
      {segs.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={s.color} strokeWidth={sw}
          strokeDasharray={`${s.dash} ${circ - s.dash}`}
          strokeDashoffset={s.offset}
        />
      ))}
    </svg>
  );
}

// ── Summary card ──────────────────────────────────────────────────────────────
function SummaryCard({ label, value, sub, icon: Icon, color, bg }) {
  return (
    <div className={`${bg} rounded-xl p-5 border border-gray-100`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className={`text-2xl font-bold ${color} mt-1 leading-tight`}>{value}</p>
          <p className="text-xs text-gray-400 mt-1">{sub}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${bg === "bg-white" ? "bg-gray-50" : "bg-white/60"}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ usedPct, committedPct }) {
  const remainingPct = Math.max(0, 100 - usedPct - committedPct);
  return (
    <div className="flex h-2 bg-gray-100 rounded-full overflow-hidden w-full">
      <div className="bg-blue-500 h-full transition-all duration-700" style={{ width: `${usedPct}%` }} />
      <div className="bg-amber-400 h-full transition-all duration-700" style={{ width: `${committedPct}%` }} />
      <div className="bg-gray-200 h-full transition-all duration-700" style={{ width: `${remainingPct}%` }} />
    </div>
  );
}

export default function BudgetReport() {
  const [measurements, setMeasurements] = useState([]);
  const [materials,    setMaterials]    = useState([]);
  const [abstracts,    setAbstracts]    = useState([]);
  const [projects,     setProjects]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [lastUpdated,  setLastUpdated]  = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [pr, mb, ma, ab] = await Promise.allSettled([
        api.get("projects/project/"),
        api.get("finance/measurement-book/"),
        api.get("finance/materials/"),
        api.get("finance/abstract-record/"),
      ]);
      if (pr.status === "fulfilled") setProjects(pr.value.data || []);
      if (mb.status === "fulfilled") setMeasurements(mb.value.data || []);
      if (ma.status === "fulfilled") setMaterials(ma.value.data || []);
      if (ab.status === "fulfilled") setAbstracts(ab.value.data || []);
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Ward-level totals ──
  const totalUsed = sumBy(measurements.filter(m => m.status === "VERIFIED"), "total_amount")
                  + sumBy(materials.filter(m => m.status === "DELIVERED"),   "grand_total");

  const totalCommitted = sumBy(materials.filter(m => m.status === "ORDERED"), "grand_total")
                       + sumBy(abstracts.filter(a => ["PENDING","APPROVED"].includes(a.status)), "grand_total");

  const totalRemaining = TOTAL_WARD_BUDGET - totalUsed - totalCommitted;

  // ── Per-project breakdown ──
  const projectMap = {};

  projects.forEach(p => {
    projectMap[p.id] = {
      id:        p.id,
      name:      p.project_name,
      code:      p.project_code,
      status:    p.status,
      estimated: 0,
      used:      0,
      committed: 0,
    };
  });

  abstracts.filter(a => a.status === "APPROVED").forEach(a => {
    if (!projectMap[a.project]) return;
    projectMap[a.project].estimated += Number(a.grand_total) || 0;
  });

  measurements.filter(m => m.status === "VERIFIED").forEach(m => {
    if (!projectMap[m.project]) return;
    projectMap[m.project].used += Number(m.total_amount) || 0;
  });

  materials.filter(m => m.status === "DELIVERED").forEach(m => {
    if (!projectMap[m.project]) return;
    projectMap[m.project].used += Number(m.grand_total) || 0;
  });

  materials.filter(m => m.status === "ORDERED").forEach(m => {
    if (!projectMap[m.project]) return;
    projectMap[m.project].committed += Number(m.grand_total) || 0;
  });

  const projectRows = Object.values(projectMap)
    .filter(p => p.estimated > 0 || p.used > 0 || p.committed > 0)
    .sort((a, b) => b.used - a.used);

  const STATUS_DOT = {
    ONGOING:     "bg-blue-500",
    COMPLETED:   "bg-emerald-500",
    DELAYED:     "bg-red-500",
    CANCELLED:   "bg-gray-400",
    COMING_SOON: "bg-purple-400",
  };

  if (loading) return (
    <div className="space-y-5 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
      </div>
      <div className="h-64 bg-gray-200 rounded-xl" />
      <div className="h-96 bg-gray-200 rounded-xl" />
    </div>
  );

  return (
    <div className="space-y-6 print:space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Budget Report</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            FY 2081/82 · Ward Budget: NPR {fmtM(TOTAL_WARD_BUDGET)}
            {lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-green-700 text-white rounded-lg hover:bg-green-800 transition"
          >
            <Printer className="w-4 h-4" /> Print / Export
          </button>
        </div>
      </div>

      {/* Print header (only shows in print) */}
      <div className="hidden print:block border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold">Ward Budget Report — FY 2081/82</h1>
        <p className="text-sm text-gray-500">Printed: {new Date().toLocaleString()}</p>
      </div>

      {/* Ward Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Ward Budget"
          value={`NPR ${fmtM(TOTAL_WARD_BUDGET)}`}
          sub="FY 2081/82 allocation"
          icon={Wallet}
          color="text-gray-800"
          bg="bg-white"
        />
        <SummaryCard
          label="Total Disbursed"
          value={`NPR ${fmtM(totalUsed)}`}
          sub={`${pct(totalUsed, TOTAL_WARD_BUDGET)}% of ward budget`}
          icon={CheckCircle}
          color="text-blue-700"
          bg="bg-blue-50"
        />
        <SummaryCard
          label="Committed"
          value={`NPR ${fmtM(totalCommitted)}`}
          sub={`${pct(totalCommitted, TOTAL_WARD_BUDGET)}% of ward budget`}
          icon={Clock}
          color="text-amber-700"
          bg="bg-amber-50"
        />
        <SummaryCard
          label="Remaining"
          value={`NPR ${fmtM(Math.max(0, totalRemaining))}`}
          sub={`${pct(Math.max(0, totalRemaining), TOTAL_WARD_BUDGET)}% available`}
          icon={TrendingUp}
          color={totalRemaining < 0 ? "text-red-700" : "text-green-700"}
          bg={totalRemaining < 0 ? "bg-red-50" : "bg-green-50"}
        />
      </div>

      {/* Ward utilization bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Ward Budget Utilization</h3>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Disbursed</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" /> Committed</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-gray-200 inline-block" /> Remaining</span>
          </div>
        </div>
        <div className="flex h-6 bg-gray-100 rounded-lg overflow-hidden mb-3">
          <div
            className="bg-blue-500 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all duration-1000"
            style={{ width: `${pct(totalUsed, TOTAL_WARD_BUDGET)}%` }}
          >
            {pct(totalUsed, TOTAL_WARD_BUDGET) > 5 ? `${pct(totalUsed, TOTAL_WARD_BUDGET)}%` : ""}
          </div>
          <div
            className="bg-amber-400 h-full flex items-center justify-center text-[10px] text-white font-bold transition-all duration-1000"
            style={{ width: `${pct(totalCommitted, TOTAL_WARD_BUDGET)}%` }}
          >
            {pct(totalCommitted, TOTAL_WARD_BUDGET) > 5 ? `${pct(totalCommitted, TOTAL_WARD_BUDGET)}%` : ""}
          </div>
          <div
            className="bg-gray-200 h-full transition-all duration-1000"
            style={{ width: `${Math.max(0, 100 - pct(totalUsed, TOTAL_WARD_BUDGET) - pct(totalCommitted, TOTAL_WARD_BUDGET))}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs">Disbursed</p>
            <p className="font-bold text-blue-700">NPR {fmt(totalUsed)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Committed</p>
            <p className="font-bold text-amber-600">NPR {fmt(totalCommitted)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Remaining</p>
            <p className={`font-bold ${totalRemaining < 0 ? "text-red-600" : "text-green-700"}`}>
              NPR {fmt(Math.max(0, totalRemaining))}
            </p>
          </div>
        </div>
      </div>

      {/* Finance source breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Measurement Books",
            icon: Receipt,
            color: "text-blue-600",
            bg: "bg-blue-50",
            rows: [
              { label: "Verified", count: measurements.filter(m => m.status === "VERIFIED").length, amount: sumBy(measurements.filter(m => m.status === "VERIFIED"), "total_amount"), color: "text-green-700" },
              { label: "Pending",  count: measurements.filter(m => m.status === "PENDING").length,  amount: sumBy(measurements.filter(m => m.status === "PENDING"),  "total_amount"), color: "text-yellow-600" },
              { label: "Draft",    count: measurements.filter(m => m.status === "DRAFT").length,    amount: sumBy(measurements.filter(m => m.status === "DRAFT"),    "total_amount"), color: "text-gray-500" },
            ],
          },
          {
            title: "Materials",
            icon: Package,
            color: "text-purple-600",
            bg: "bg-purple-50",
            rows: [
              { label: "Delivered", count: materials.filter(m => m.status === "DELIVERED").length, amount: sumBy(materials.filter(m => m.status === "DELIVERED"), "grand_total"), color: "text-green-700" },
              { label: "Ordered",   count: materials.filter(m => m.status === "ORDERED").length,   amount: sumBy(materials.filter(m => m.status === "ORDERED"),   "grand_total"), color: "text-yellow-600" },
              { label: "Pending",   count: materials.filter(m => m.status === "PENDING").length,   amount: sumBy(materials.filter(m => m.status === "PENDING"),   "grand_total"), color: "text-gray-500" },
            ],
          },
          {
            title: "Abstract Records",
            icon: FileBarChart,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            rows: [
              { label: "Approved", count: abstracts.filter(a => a.status === "APPROVED").length, amount: sumBy(abstracts.filter(a => a.status === "APPROVED"), "grand_total"), color: "text-green-700" },
              { label: "Pending",  count: abstracts.filter(a => a.status === "PENDING").length,  amount: sumBy(abstracts.filter(a => a.status === "PENDING"),  "grand_total"), color: "text-yellow-600" },
              { label: "Draft",    count: abstracts.filter(a => a.status === "DRAFT").length,    amount: sumBy(abstracts.filter(a => a.status === "DRAFT"),    "grand_total"), color: "text-gray-500" },
            ],
          },
        ].map(section => (
          <div key={section.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-1.5 rounded-lg ${section.bg}`}>
                <section.icon className={`w-4 h-4 ${section.color}`} />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">{section.title}</h3>
            </div>
            <div className="space-y-3">
              {section.rows.map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16">{row.label}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">{row.count}</span>
                  </div>
                  <span className={`text-sm font-semibold ${row.color}`}>NPR {fmtM(row.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Per-project table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Per-Project Budget Breakdown</h3>
          <span className="text-xs text-gray-400">{projectRows.length} projects with finance activity</span>
        </div>

        {projectRows.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileBarChart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No project finance data yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Project", "Status", "Estimated", "Disbursed", "Committed", "Remaining", "Utilization"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {projectRows.map(p => {
                  const remaining = p.estimated - p.used - p.committed;
                  const usedPct   = pct(p.used, p.estimated);
                  const comPct    = pct(p.committed, p.estimated);
                  const isOver    = remaining < 0;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 truncate max-w-[200px]">{p.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{p.code}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[p.status] || "bg-gray-300"}`} />
                          <span className="text-xs text-gray-600">{p.status?.replace("_", " ")}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">NPR {fmtM(p.estimated)}</td>
                      <td className="px-4 py-3 text-blue-700 font-semibold">NPR {fmtM(p.used)}</td>
                      <td className="px-4 py-3 text-amber-600 font-medium">NPR {fmtM(p.committed)}</td>
                      <td className={`px-4 py-3 font-semibold ${isOver ? "text-red-600" : "text-green-700"}`}>
                        {isOver ? "⚠ " : ""}NPR {fmtM(Math.abs(remaining))}
                        {isOver && <span className="text-[10px] text-red-400 block">Over budget</span>}
                      </td>
                      <td className="px-4 py-3 w-40">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <ProgressBar usedPct={usedPct} committedPct={comPct} />
                          </div>
                          <span className="text-xs font-semibold text-gray-600 w-8 text-right">
                            {usedPct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200 font-semibold">
                  <td colSpan={2} className="px-4 py-3 text-sm text-gray-700">Totals</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    NPR {fmtM(projectRows.reduce((s, p) => s + p.estimated, 0))}
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-700">
                    NPR {fmtM(projectRows.reduce((s, p) => s + p.used, 0))}
                  </td>
                  <td className="px-4 py-3 text-sm text-amber-600">
                    NPR {fmtM(projectRows.reduce((s, p) => s + p.committed, 0))}
                  </td>
                  <td colSpan={2} className="px-4 py-3 text-sm text-green-700">
                    NPR {fmtM(projectRows.reduce((s, p) => s + Math.max(0, p.estimated - p.used - p.committed), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Pending items alert */}
      {(measurements.filter(m => m.status === "PENDING").length > 0 || abstracts.filter(a => a.status === "PENDING").length > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3 print:hidden">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">Pending approvals affect totals</p>
            <p className="text-xs text-yellow-600 mt-0.5">
              {measurements.filter(m => m.status === "PENDING").length} measurement book(s) and{" "}
              {abstracts.filter(a => a.status === "PENDING").length} abstract record(s) are pending review.
              Approve them to reflect accurate disbursement figures.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
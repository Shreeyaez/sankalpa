import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign, Receipt, CreditCard, FileBarChart, PieChart,
  CheckCircle, Clock, Hourglass, AlertTriangle, ArrowRight,
  TrendingUp, Wallet, Building2, RefreshCw, Activity, Target,
  BarChart3, ChevronRight,
} from "lucide-react";
import api from "../../api/axios";

// ── Constants ─────────────────────────────────────────────────────────────────
const TOTAL_WARD_BUDGET = 45_000_000;

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt   = (n) => new Intl.NumberFormat("en-NP").format(Math.round(Number(n) || 0));
const fmtM  = (n) => `${((Number(n) || 0) / 1_000_000).toFixed(2)}M`;
const pct   = (a, b) => (b > 0 ? Math.min(100, Math.round((a / b) * 100)) : 0);
const sumBy = (arr, k) => arr.reduce((s, x) => s + (Number(x[k]) || 0), 0);

// ── Budget Donut ──────────────────────────────────────────────────────────────
function BudgetDonut({ used, committed, total }) {
  const remaining    = Math.max(0, total - used - committed);
  const usedPct      = pct(used, total);
  const committedPct = pct(committed, total);
  const remainingPct = Math.max(0, 100 - usedPct - committedPct);

  const cx = 90, cy = 90, r = 68, strokeW = 20;
  const circ = 2 * Math.PI * r;

  const segments = [
    { val: usedPct,      color: "#2563eb", label: "Disbursed",  amount: used,      color2: "bg-blue-600",  text: "text-blue-700"  },
    { val: committedPct, color: "#f59e0b", label: "Committed",  amount: committed, color2: "bg-amber-400", text: "text-amber-700" },
    { val: remainingPct, color: "#e5e7eb", label: "Remaining",  amount: remaining, color2: "bg-gray-200",  text: "text-gray-500"  },
  ].filter(s => s.val > 0);

  let cumulative = 0;
  const arcs = segments.map(seg => {
    const dash   = (seg.val / 100) * circ;
    const offset = circ - (cumulative / 100) * circ;
    cumulative  += seg.val;
    return { ...seg, dash, offset };
  });

  return (
    <div className="flex items-center gap-8">
      <div className="relative flex-shrink-0">
        <svg viewBox="0 0 180 180" className="w-44 h-44 -rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={strokeW} />
          {arcs.map((arc, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={arc.color} strokeWidth={strokeW}
              strokeDasharray={`${arc.dash} ${circ - arc.dash}`}
              strokeDashoffset={arc.offset}
              strokeLinecap="butt"
              style={{ transition: "stroke-dasharray 1s ease" }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Total</span>
          <span className="text-base font-bold text-gray-800">NPR {fmtM(total)}</span>
          <span className="text-[10px] text-gray-400">FY 2081/82</span>
        </div>
      </div>
      <div className="flex-1 space-y-3 min-w-0">
        {segments.map(s => (
          <div key={s.label}>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-sm ${s.color2} flex-shrink-0`} />
                <span className="text-xs text-gray-600">{s.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-400">NPR {fmtM(s.amount)}</span>
                <span className={`text-xs font-bold ${s.text}`}>{s.val}%</span>
              </div>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${s.color2} rounded-full transition-all duration-1000`} style={{ width: `${s.val}%` }} />
            </div>
          </div>
        ))}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
          <span className="text-[10px] text-green-500 font-medium">Live</span>
          <span className="text-[10px] text-gray-300">·</span>
          <span className="text-[10px] text-gray-400">FY 2081/82</span>
        </div>
      </div>
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, accentClass, textClass, iconClass, onClick, badge }) {
  return (
    <div onClick={onClick}
      className={`bg-white border-l-4 ${accentClass} rounded-xl px-4 py-4 relative cursor-pointer hover:shadow-md transition-all duration-200 flex items-center gap-3`}>
      <div className={`${iconClass} flex-shrink-0`}><Icon className="w-6 h-6" /></div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest truncate">{label}</p>
        <p className={`text-xl font-bold ${textClass} leading-tight`}>{value}</p>
        <p className="text-[10px] text-gray-400">{sub}</p>
      </div>
      {badge && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
    </div>
  );
}

// ── Financial Breakdown ───────────────────────────────────────────────────────
function FinancialBreakdown({ measurements, materials, abstracts }) {
  const rows = [
    { label: "Measurement Books (Verified)", amount: sumBy(measurements.filter(m => m.status === "VERIFIED"), "total_amount"), color: "bg-green-500",  icon: Receipt       },
    { label: "Measurement Books (Pending)",  amount: sumBy(measurements.filter(m => m.status === "PENDING"),  "total_amount"), color: "bg-yellow-400", icon: Clock         },
    { label: "Materials (Delivered)",        amount: sumBy(materials.filter(m => m.status === "DELIVERED"),   "grand_total"),  color: "bg-blue-500",   icon: CheckCircle   },
    { label: "Materials (Ordered)",          amount: sumBy(materials.filter(m => m.status === "ORDERED"),     "grand_total"),  color: "bg-purple-500", icon: Hourglass     },
    { label: "Abstracts (Approved)",         amount: sumBy(abstracts.filter(a => a.status === "APPROVED"),    "grand_total"),  color: "bg-emerald-500",icon: FileBarChart  },
    { label: "Abstracts (Pending)",          amount: sumBy(abstracts.filter(a => a.status === "PENDING"),     "grand_total"),  color: "bg-orange-400", icon: AlertTriangle },
  ];
  const max = Math.max(...rows.map(r => r.amount), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 className="w-4 h-4 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Financial Breakdown</h3>
      </div>
      <div className="space-y-4">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${row.color} flex-shrink-0`}>
              <row.icon className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-700 truncate">{row.label}</span>
                <span className="text-xs font-bold text-gray-800 ml-2 flex-shrink-0">NPR {fmt(row.amount)}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${row.color} rounded-full transition-all duration-1000`}
                  style={{ width: `${(row.amount / max) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Status Distribution ───────────────────────────────────────────────────────
function StatusDistribution({ measurements, materials, abstracts }) {
  const groups = [
    {
      name: "Measurement Books", total: measurements.length,
      bars: [
        { label: "Verified", count: measurements.filter(m => m.status === "VERIFIED").length, color: "bg-green-500"  },
        { label: "Pending",  count: measurements.filter(m => m.status === "PENDING").length,  color: "bg-yellow-400" },
      ],
    },
    {
      name: "Materials", total: materials.length,
      bars: [
        { label: "Delivered", count: materials.filter(m => m.status === "DELIVERED").length, color: "bg-blue-500"   },
        { label: "Ordered",   count: materials.filter(m => m.status === "ORDERED").length,   color: "bg-purple-500" },
      ],
    },
    {
      name: "Abstract Records", total: abstracts.length,
      bars: [
        { label: "Approved", count: abstracts.filter(a => a.status === "APPROVED").length, color: "bg-emerald-500" },
        { label: "Pending",  count: abstracts.filter(a => a.status === "PENDING").length,  color: "bg-orange-400"  },
      ],
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-5">
        <Activity className="w-4 h-4 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Status Distribution</h3>
      </div>
      <div className="space-y-5">
        {groups.map(g => (
          <div key={g.name}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">{g.name}</span>
              <span className="text-xs text-gray-400">Total: {g.total}</span>
            </div>
            <div className="flex h-2.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
              {g.bars.map(b => (
                <div key={b.label} className={`${b.color} transition-all duration-700`}
                  style={{ width: `${g.total > 0 ? (b.count / g.total) * 100 : 0}%` }}
                  title={`${b.label}: ${b.count}`} />
              ))}
            </div>
            <div className="flex gap-4">
              {g.bars.map(b => (
                <div key={b.label} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${b.color}`} />
                  <span className="text-[10px] text-gray-500">{b.label}: {b.count}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Pending Approvals ─────────────────────────────────────────────────────────
function PendingApprovals({ measurements, abstracts }) {
  const items = [
    ...measurements.filter(m => m.status === "PENDING").slice(0, 4).map(m => ({
      id: m.id, label: `MB #${m.id}`, amount: m.total_amount, type: "measurement",
    })),
    ...abstracts.filter(a => a.status === "PENDING").slice(0, 4).map(a => ({
      id: a.id, label: `Abstract #${a.id}`, amount: a.grand_total, type: "abstract",
    })),
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-500" />
          <h3 className="font-semibold text-gray-800">Pending Approvals</h3>
        </div>
        <span className="text-xs text-gray-400">{items.length} pending</span>
      </div>
      {items.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm text-gray-400">All caught up — no pending items</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors group">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.type === "measurement" ? "bg-blue-500" : "bg-purple-500"}`} />
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400">NPR {fmt(item.amount)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">Pending Review</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Quick Actions ─────────────────────────────────────────────────────────────
function QuickActions() {
  const navigate = useNavigate();
  const actions = [
    { label: "Measurement Books", icon: Receipt,      path: "/app/finance/measurements", color: "bg-green-600 hover:bg-green-700 text-white"   },
    { label: "Manage Materials",  icon: CreditCard,   path: "/app/finance/materials",    color: "bg-blue-600 hover:bg-blue-700 text-white"    },
    { label: "Abstract Records",  icon: FileBarChart, path: "/app/finance/abstracts",    color: "bg-purple-600 hover:bg-purple-700 text-white" },
    { label: "Budget Report",     icon: PieChart,     path: "/app/finance/report",       color: "bg-orange-500 hover:bg-orange-600 text-white" },
  ];
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-4 h-4 text-green-600" />
        <h3 className="font-semibold text-gray-800 text-sm">Quick Actions</h3>
      </div>
      <div className="space-y-2">
        {actions.map(a => (
          <button key={a.label} onClick={() => navigate(a.path)}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${a.color}`}>
            <div className="flex items-center gap-3">
              <a.icon className="w-4 h-4 flex-shrink-0" />
              {a.label}
            </div>
            <ChevronRight className="w-4 h-4 opacity-70" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Budget Health ─────────────────────────────────────────────────────────────
function BudgetHealth({ totalUsed, totalCommitted }) {
  const remaining = TOTAL_WARD_BUDGET - totalUsed - totalCommitted;
  const cards = [
    { label: "Total Disbursed",  amount: totalUsed,      pctVal: pct(totalUsed, TOTAL_WARD_BUDGET),             gradient: "from-green-50 to-emerald-50", valueColor: "text-green-600" },
    { label: "Committed Amount", amount: totalCommitted, pctVal: pct(totalCommitted, TOTAL_WARD_BUDGET),         gradient: "from-amber-50 to-orange-50",  valueColor: "text-amber-600" },
    { label: "Remaining Budget", amount: remaining,      pctVal: pct(Math.max(0, remaining), TOTAL_WARD_BUDGET), gradient: "from-blue-50 to-indigo-50",   valueColor: "text-blue-600"  },
  ];
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-blue-600" />
        <h3 className="font-semibold text-gray-800 text-sm">Budget Health</h3>
      </div>
      <div className="space-y-3">
        {cards.map(c => (
          <div key={c.label} className={`bg-gradient-to-r ${c.gradient} rounded-lg p-3.5`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-600">{c.label}</span>
              <span className={`text-base font-bold ${c.valueColor}`}>NPR {fmtM(c.amount)}</span>
            </div>
            <div className="h-1 bg-white/60 rounded-full overflow-hidden">
              <div className={`h-full ${c.valueColor.replace("text-", "bg-")} rounded-full transition-all duration-1000`}
                style={{ width: `${c.pctVal}%` }} />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">{c.pctVal}% of ward budget</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Records Summary ───────────────────────────────────────────────────────────
function RecordsSummary({ measurements, materials, abstracts }) {
  const tiles = [
    { label: "Verified MB",    val: measurements.filter(m => m.status === "VERIFIED").length, bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700"  },
    { label: "Delivered Mat.", val: materials.filter(m => m.status === "DELIVERED").length,   bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700"   },
    { label: "Approved Abs.",  val: abstracts.filter(a => a.status === "APPROVED").length,    bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  ];
  const pending = [
    { label: "Measurement Books", count: measurements.filter(m => m.status === "PENDING").length, color: "text-yellow-600" },
    { label: "Abstract Records",  count: abstracts.filter(a => a.status === "PENDING").length,    color: "text-orange-600" },
  ];
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-4 h-4 text-blue-600" />
        <h3 className="font-semibold text-gray-800 text-sm">Records Summary</h3>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {tiles.map(t => (
          <div key={t.label} className={`text-center p-3 ${t.bg} rounded-lg border ${t.border}`}>
            <p className={`text-xl font-bold ${t.text}`}>{t.val}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide leading-tight mt-0.5">{t.label}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 pt-3">
        <p className="text-xs font-medium text-gray-500 mb-2">Pending Reviews</p>
        <div className="space-y-1.5">
          {pending.map(p => (
            <div key={p.label} className="flex justify-between text-xs">
              <span className="text-gray-500">{p.label}</span>
              <span className={`font-semibold ${p.color}`}>{p.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Loading Skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-4">
          <div className="h-56 bg-gray-200 rounded-xl" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-48 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function FinanceDashboard() {
  const navigate = useNavigate();

  const [measurements, setMeasurements] = useState([]);
  const [materials,    setMaterials]    = useState([]);
  const [abstracts,    setAbstracts]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [alertIdx,     setAlertIdx]     = useState(0);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [mb, ma, ab] = await Promise.allSettled([
        api.get("finance/measurement-book/"),
        api.get("finance/materials/"),
        api.get("finance/abstract-record/"),
      ]);
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

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 60_000);
    return () => clearInterval(id);
  }, [fetchAll]);

  // ── Computed totals ──
  const totalUsed = sumBy(measurements.filter(m => m.status === "VERIFIED"), "total_amount")
                  + sumBy(materials.filter(m => m.status === "DELIVERED"),   "grand_total");

  const totalCommitted = sumBy(materials.filter(m => m.status === "ORDERED"), "grand_total")
                       + sumBy(abstracts.filter(a => ["PENDING", "APPROVED"].includes(a.status)), "grand_total");

  const pendingCount = measurements.filter(m => m.status === "PENDING").length
                     + abstracts.filter(a => a.status === "PENDING").length;

  // ── Banner alerts ──
  const bannerAlerts = [
    ...(pendingCount > 0
      ? [{ type: "warning", msg: `${pendingCount} item(s) pending approval` }]
      : []),
    ...(pct(totalUsed, TOTAL_WARD_BUDGET) >= 80
      ? [{ type: "warning", msg: `Ward budget ${pct(totalUsed, TOTAL_WARD_BUDGET)}% used` }]
      : []),
    { type: "info", msg: `Updated: ${lastUpdated?.toLocaleTimeString() || "—"}` },
  ];
  const banner = bannerAlerts[alertIdx % bannerAlerts.length];
  const bStyle = { error: "bg-red-600", warning: "bg-amber-500", info: "bg-slate-700" };

  const kpiCards = [
    { label: "Disbursed",     value: `NPR ${fmtM(totalUsed)}`,      sub: `${pct(totalUsed, TOTAL_WARD_BUDGET)}% of budget`,     icon: CheckCircle,   accentClass: "border-green-400",  textClass: "text-green-700",  iconClass: "text-green-300",  path: "/app/finance/measurements" },
    { label: "Committed",     value: `NPR ${fmtM(totalCommitted)}`, sub: `${pct(totalCommitted, TOTAL_WARD_BUDGET)}% committed`, icon: Clock,         accentClass: "border-amber-400",  textClass: "text-amber-700",  iconClass: "text-amber-200",  path: "/app/finance/report"       },
    { label: "Pending Items", value: pendingCount,                  sub: "Awaiting approval",                                   icon: AlertTriangle, accentClass: "border-yellow-400", textClass: "text-yellow-700", iconClass: "text-yellow-200", path: "/app/finance/measurements", badge: pendingCount > 0 },
    { label: "Materials",     value: materials.length,              sub: "Total materials",                                     icon: Building2,     accentClass: "border-blue-400",   textClass: "text-blue-700",   iconClass: "text-blue-200",   path: "/app/finance/materials"    },
    { label: "Abstracts",     value: abstracts.length,              sub: "Total abstracts",                                     icon: FileBarChart,  accentClass: "border-purple-400", textClass: "text-purple-700", iconClass: "text-purple-200", path: "/app/finance/abstracts"    },
  ];

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-5">

      {/* Banner */}
      {banner && (
        <div className={`${bStyle[banner.type]} text-white px-5 py-2.5 rounded-xl flex items-center justify-between shadow-sm`}>
          <div className="flex items-center gap-3 text-sm">
            <AlertTriangle size={16} />
            <span>{banner.msg}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {bannerAlerts.map((_, i) => (
                <button key={i} onClick={() => setAlertIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === alertIdx % bannerAlerts.length ? "bg-white" : "bg-white/40"}`} />
              ))}
            </div>
            <button onClick={fetchAll}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 text-xs rounded flex items-center gap-1 transition">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div onClick={() => navigate("/app/finance")}
          className="bg-gradient-to-br from-green-800 to-green-700 rounded-xl px-4 py-4 cursor-pointer hover:shadow-lg transition-all duration-200 flex items-center gap-3 relative overflow-hidden">
          <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-white/5" />
          <div className="absolute -right-1 -bottom-4 w-20 h-20 rounded-full bg-white/5" />
          <Wallet className="w-7 h-7 text-white/20 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-green-400 uppercase tracking-widest">Ward Budget</p>
            <p className="text-2xl font-bold text-white leading-tight">NPR {fmtM(TOTAL_WARD_BUDGET)}</p>
            <p className="text-[10px] text-green-400">FY 2081/82</p>
          </div>
        </div>
        {kpiCards.map(c => (
          <KpiCard key={c.label} {...c} onClick={() => navigate(c.path)} />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-500" />
                <h3 className="font-semibold text-gray-800">Finance Overview</h3>
                <span className="text-[10px] text-gray-400 ml-1">FY 2081/82</span>
              </div>
              <div className="flex items-center gap-3">
                {pct(totalUsed, TOTAL_WARD_BUDGET) >= 80 && (
                  <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                    ⚠ {pct(totalUsed, TOTAL_WARD_BUDGET)}% used
                  </span>
                )}
                <span className="text-sm font-bold text-gray-600">NPR {fmtM(TOTAL_WARD_BUDGET)}</span>
              </div>
            </div>
            <div className="px-6 py-5">
              <BudgetDonut used={totalUsed} committed={totalCommitted} total={TOTAL_WARD_BUDGET} />
            </div>
          </div>
          <FinancialBreakdown measurements={measurements} materials={materials} abstracts={abstracts} />
          <StatusDistribution measurements={measurements} materials={materials} abstracts={abstracts} />
          <PendingApprovals   measurements={measurements} abstracts={abstracts} />
        </div>

        <div className="space-y-5">
          <QuickActions />
          <BudgetHealth totalUsed={totalUsed} totalCommitted={totalCommitted} />
          <RecordsSummary measurements={measurements} materials={materials} abstracts={abstracts} />
        </div>
      </div>
    </div>
  );
}
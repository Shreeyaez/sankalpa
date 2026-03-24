// TODO: 100% ai generated code - needs review and refactor. Some components are very rough and could be improved with better design and structure.
// cc: @shreeya

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  DollarSign,
  BarChart3,
  PieChart,
  Receipt,
  CreditCard,
  FileBarChart,
  CheckCircle,
  Clock,
  Hourglass,
  AlertTriangle,
  ArrowRight,
  Target,
  TrendingUp,
  Activity,
  Wallet,
  Building2,
  RefreshCw,
} from "lucide-react";

// Helper functions
const fmt = (n) =>
  new Intl.NumberFormat("en-NP").format(Math.round(Number(n) || 0));
const fmtM = (n) => `${((Number(n) || 0) / 1_000_000).toFixed(2)}M`;
const pct = (a, b) => (b > 0 ? Math.min(100, Math.round((a / b) * 100)) : 0);
const sumBy = (arr, k) => arr.reduce((s, x) => s + (Number(x[k]) || 0), 0);

// Budget Status Chart Component
function BudgetStatusChart({ measurements, materials, abstracts }) {
  const { t } = useTranslation();

  const data = [
    {
      name: "Measurement Books",
      verified: measurements.filter((m) => m.status === "VERIFIED").length,
      pending: measurements.filter((m) => m.status === "PENDING").length,
    },
    {
      name: "Materials",
      delivered: materials.filter((m) => m.status === "DELIVERED").length,
      ordered: materials.filter((m) => m.status === "ORDERED").length,
    },
    {
      name: "Abstract Records",
      approved: abstracts.filter((a) => a.status === "APPROVED").length,
      pending: abstracts.filter((a) => a.status === "PENDING").length,
    },
  ];

  const colors = ["#10b981", "#f59e0b", "#3b82f6"];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">
          {t("dashboard.status_distribution")}
        </h3>
      </div>
      <div className="space-y-4">
        {data.map((item, i) => {
          const total = Object.values(item)
            .slice(1)
            .reduce((sum, val) => sum + val, 0);
          return (
            <div key={item.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  {item.name}
                </span>
                <span className="text-sm text-gray-500">Total: {total}</span>
              </div>
              <div className="flex h-3 bg-gray-100 rounded-full overflow-hidden">
                {Object.entries(item)
                  .slice(1)
                  .map(([status, count], j) => {
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    const statusColors = {
                      verified: "bg-green-500",
                      approved: "bg-green-500",
                      delivered: "bg-blue-500",
                      pending: "bg-yellow-500",
                      ordered: "bg-purple-500",
                    };
                    return (
                      <div
                        key={status}
                        className={`${statusColors[status]} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                        title={`${status}: ${count}`}
                      />
                    );
                  })}
              </div>
              <div className="flex gap-4 text-xs">
                {Object.entries(item)
                  .slice(1)
                  .map(([status, count]) => (
                    <div key={status} className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          {
                            verified: "bg-green-500",
                            approved: "bg-green-500",
                            delivered: "bg-blue-500",
                            pending: "bg-yellow-500",
                            ordered: "bg-purple-500",
                          }[status]
                        }`}
                      />
                      <span className="capitalize text-gray-600">
                        {status}: {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Financial Trends Chart
function FinancialTrendsChart({ measurements, materials, abstracts }) {
  const { t } = useTranslation();

  const categories = [
    {
      name: "Verified MB",
      value: sumBy(
        measurements.filter((m) => m.status === "VERIFIED"),
        "total_amount",
      ),
      color: "bg-green-500",
    },
    {
      name: "Pending MB",
      value: sumBy(
        measurements.filter((m) => m.status === "PENDING"),
        "total_amount",
      ),
      color: "bg-yellow-500",
    },
    {
      name: "Delivered Materials",
      value: sumBy(
        materials.filter((m) => m.status === "DELIVERED"),
        "grand_total",
      ),
      color: "bg-blue-500",
    },
    {
      name: "Ordered Materials",
      value: sumBy(
        materials.filter((m) => m.status === "ORDERED"),
        "grand_total",
      ),
      color: "bg-purple-500",
    },
    {
      name: "Approved Abstracts",
      value: sumBy(
        abstracts.filter((a) => a.status === "APPROVED"),
        "grand_total",
      ),
      color: "bg-emerald-500",
    },
    {
      name: "Pending Abstracts",
      value: sumBy(
        abstracts.filter((a) => a.status === "PENDING"),
        "grand_total",
      ),
      color: "bg-orange-500",
    },
  ];

  const maxValue = Math.max(...categories.map((c) => c.value));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">
          {t("dashboard.financial_trends")}
        </h3>
      </div>
      <div className="space-y-4">
        {categories.map((category, i) => (
          <div key={category.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                {category.name}
              </span>
              <span className="text-sm font-bold text-gray-800">
                NPR {fmtM(category.value)}
              </span>
            </div>
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${category.color} rounded-full transition-all duration-1000`}
                style={{
                  width: `${maxValue > 0 ? (category.value / maxValue) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Budget Breakdown Component
function FinanceBudgetBreakdown({ measurements, materials, abstracts }) {
  const { t } = useTranslation();

  const mbVerified = sumBy(
    measurements.filter((m) => m.status === "VERIFIED"),
    "total_amount",
  );
  const mbPending = sumBy(
    measurements.filter((m) => m.status === "PENDING"),
    "total_amount",
  );
  const matDelivered = sumBy(
    materials.filter((m) => m.status === "DELIVERED"),
    "grand_total",
  );
  const matOrdered = sumBy(
    materials.filter((m) => m.status === "ORDERED"),
    "grand_total",
  );
  const absApproved = sumBy(
    abstracts.filter((a) => a.status === "APPROVED"),
    "grand_total",
  );
  const absPending = sumBy(
    abstracts.filter((a) => a.status === "PENDING"),
    "grand_total",
  );

  const categories = [
    {
      label: "Measurement Books (Verified)",
      amount: mbVerified,
      color: "bg-green-500",
      icon: Receipt,
    },
    {
      label: "Measurement Books (Pending)",
      amount: mbPending,
      color: "bg-yellow-500",
      icon: Clock,
    },
    {
      label: "Materials (Delivered)",
      amount: matDelivered,
      color: "bg-blue-500",
      icon: CheckCircle,
    },
    {
      label: "Materials (Ordered)",
      amount: matOrdered,
      color: "bg-purple-500",
      icon: Hourglass,
    },
    {
      label: "Abstract Records (Approved)",
      amount: absApproved,
      color: "bg-emerald-500",
      icon: FileBarChart,
    },
    {
      label: "Abstract Records (Pending)",
      amount: absPending,
      color: "bg-orange-500",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">
          {t("dashboard.budget_breakdown")}
        </h3>
      </div>
      <div className="space-y-4">
        {categories.map((cat, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${cat.color}`}>
                <cat.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{cat.label}</p>
                <p className="text-xs text-gray-400">
                  {cat.amount > 0 ? fmtM(cat.amount) : "No records"}
                </p>
              </div>
            </div>
            <span className="text-lg font-bold text-gray-800">
              NPR {fmt(cat.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Quick Actions Component
function FinanceQuickActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const actions = [
    {
      label: "Add Measurement Book",
      icon: Receipt,
      path: "/app/finance/measurements/add",
      color: "bg-green-600 hover:bg-green-700 text-white",
    },
    {
      label: "Manage Materials",
      icon: CreditCard,
      path: "/app/finance/materials",
      color: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    {
      label: "Abstract Records",
      icon: FileBarChart,
      path: "/app/finance/abstracts",
      color: "bg-purple-600 hover:bg-purple-700 text-white",
    },
    {
      label: "Budget Reports",
      icon: PieChart,
      path: "/app/finance/reports",
      color: "bg-orange-600 hover:bg-orange-700 text-white",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-green-600" />
        {t("dashboard.finance_actions")}
      </h3>
      <div className="space-y-2">
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={() => navigate(a.path)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${a.color}`}
          >
            <a.icon className="w-4 h-4 flex-shrink-0" />
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Pending Items Component
function PendingItemsSection({ measurements, abstracts }) {
  const { t } = useTranslation();

  const pendingMeasurements = measurements
    .filter((m) => m.status === "PENDING")
    .slice(0, 5);
  const pendingAbstracts = abstracts
    .filter((a) => a.status === "PENDING")
    .slice(0, 5);
  const pendingItems = [
    ...pendingMeasurements.map((m) => ({ ...m, type: "measurement" })),
    ...pendingAbstracts.map((a) => ({ ...a, type: "abstract" })),
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-500" />
          <h3 className="font-semibold text-gray-800">
            {t("dashboard.pending_approvals")}
          </h3>
        </div>
        <span className="text-xs text-gray-400">
          {pendingItems.length} pending
        </span>
      </div>
      {pendingItems.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm text-gray-400">
            {t("dashboard.no_pending_items")}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {pendingItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex-shrink-0 w-2 h-2 rounded-full ${item.type === "measurement" ? "bg-blue-500" : "bg-purple-500"}`}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.type === "measurement"
                      ? `MB #${item.id}`
                      : `Abstract #${item.id}`}
                  </p>
                  <p className="text-xs text-gray-400">
                    NPR {fmt(item.total_amount || item.grand_total)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">
                  {t("dashboard.pending_review")}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Financial Health Component
function FinancialHealthSection({
  totalUsed,
  totalCommitted,
  TOTAL_WARD_BUDGET,
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-4 h-4 text-green-600" />
        <h3 className="font-semibold text-gray-800 text-sm">
          {t("dashboard.financial_health")}
        </h3>
      </div>
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {t("dashboard.total_disbursed")}
            </span>
            <span className="text-lg font-bold text-green-600">
              NPR {fmtM(totalUsed)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {pct(totalUsed, TOTAL_WARD_BUDGET)}% of total ward budget
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {t("dashboard.committed_amount")}
            </span>
            <span className="text-lg font-bold text-orange-600">
              NPR {fmtM(totalCommitted)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {pct(totalCommitted, TOTAL_WARD_BUDGET)}% of total ward budget
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {t("dashboard.remaining_budget")}
            </span>
            <span className="text-lg font-bold text-blue-600">
              NPR {fmtM(TOTAL_WARD_BUDGET - totalUsed - totalCommitted)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {pct(
              TOTAL_WARD_BUDGET - totalUsed - totalCommitted,
              TOTAL_WARD_BUDGET,
            )}
            % available
          </div>
        </div>
      </div>
    </div>
  );
}

// Records Summary Component
function RecordsSummary({ measurements, materials, abstracts }) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-4 h-4 text-blue-600" />
        <h3 className="font-semibold text-gray-800 text-sm">
          {t("dashboard.records_summary")}
        </h3>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-lg font-bold text-green-700">
              {measurements.filter((m) => m.status === "VERIFIED").length}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">
              {t("dashboard.verified_mb")}
            </p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-lg font-bold text-blue-700">
              {materials.filter((m) => m.status === "DELIVERED").length}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">
              {t("dashboard.delivered_mat")}
            </p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-lg font-bold text-purple-700">
              {abstracts.filter((a) => a.status === "APPROVED").length}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide">
              {t("dashboard.approved_abs")}
            </p>
          </div>
        </div>
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-600 mb-2">
            {t("dashboard.pending_reviews")}
          </p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">
                {t("dashboard.measurement_books")}
              </span>
              <span className="text-yellow-600 font-semibold">
                {measurements.filter((m) => m.status === "PENDING").length}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">
                {t("dashboard.abstract_records")}
              </span>
              <span className="text-orange-600 font-semibold">
                {abstracts.filter((a) => a.status === "PENDING").length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Finance Dashboard Component
export default function FinanceDashboard({
  measurements,
  materials,
  abstracts,
  totalUsed,
  totalCommitted,
  TOTAL_WARD_BUDGET,
  BudgetPieChart,
  banner,
  bStyle,
  bannerAlerts,
  alertIdx,
  setAlertIdx,
  fetchAll,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      {/* Banner */}
      {banner && (
        <div
          className={`${bStyle[banner.type]} text-white px-5 py-2.5 rounded-xl flex items-center justify-between shadow-sm`}
        >
          <div className="flex items-center gap-3 text-sm">
            <AlertTriangle size={16} />
            <span>{banner.msg}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {bannerAlerts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setAlertIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === alertIdx % bannerAlerts.length ? "bg-white" : "bg-white/40"}`}
                />
              ))}
            </div>
            <button
              onClick={fetchAll}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 text-xs rounded flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3" /> {t("dashboard.refresh")}
            </button>
          </div>
        </div>
      )}

      {/* Finance-specific KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => navigate("/app/finance")}
          className="bg-gradient-to-br from-green-800 to-green-700 rounded-xl px-4 py-4 cursor-pointer hover:shadow-lg transition-all duration-200 flex items-center gap-3 relative overflow-hidden"
        >
          <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-white/5" />
          <div className="absolute -right-1 -bottom-4 w-20 h-20 rounded-full bg-white/5" />
          <div className="text-white/20">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] text-green-400 uppercase tracking-widest">
              {t("dashboard.total_budget")}
            </p>
            <p className="text-2xl font-bold text-white leading-tight">
              NPR {fmtM(TOTAL_WARD_BUDGET)}
            </p>
            <p className="text-[10px] text-green-400">
              {t("dashboard.ward_allocation")}
            </p>
          </div>
        </div>

        {[
          {
            key: "used",
            label: t("dashboard.disbursed"),
            val: `NPR ${fmtM(totalUsed)}`,
            icon: CheckCircle,
            accent: "border-green-400",
            text: "text-green-700",
            iconColor: "text-green-200",
            bg: "bg-white",
            sub: `${pct(totalUsed, TOTAL_WARD_BUDGET)}% of budget`,
            path: "/app/finance/disbursed",
          },
          {
            key: "committed",
            label: t("dashboard.committed"),
            val: `NPR ${fmtM(totalCommitted)}`,
            icon: Clock,
            accent: "border-orange-400",
            text: "text-orange-700",
            iconColor: "text-orange-200",
            bg: "bg-white",
            sub: `${pct(totalCommitted, TOTAL_WARD_BUDGET)}% committed`,
            path: "/app/finance/committed",
          },
          {
            key: "pending",
            label: t("dashboard.pending"),
            val: `${measurements.filter((m) => m.status === "PENDING").length + abstracts.filter((a) => a.status === "PENDING").length}`,
            icon: AlertTriangle,
            accent: "border-yellow-400",
            text: "text-yellow-700",
            iconColor: "text-yellow-200",
            bg: "bg-white",
            sub: t("dashboard.items_pending"),
            path: "/app/finance/pending",
            badge: true,
          },
          {
            key: "materials",
            label: t("dashboard.materials"),
            val: materials.length,
            icon: Building2,
            accent: "border-blue-400",
            text: "text-blue-700",
            iconColor: "text-blue-200",
            bg: "bg-white",
            sub: t("dashboard.total_materials"),
            path: "/app/finance/materials",
          },
          {
            key: "abstracts",
            label: t("dashboard.abstracts"),
            val: abstracts.length,
            icon: FileBarChart,
            accent: "border-purple-400",
            text: "text-purple-700",
            iconColor: "text-purple-200",
            bg: "bg-white",
            sub: t("dashboard.total_abstracts"),
            path: "/app/finance/abstracts",
          },
        ].map((s) => (
          <div
            key={s.key}
            onClick={() => navigate(s.path)}
            className={`${s.bg} border-l-4 ${s.accent} rounded-xl px-4 py-4 relative cursor-pointer hover:shadow-md transition-all duration-200 flex items-center gap-3`}
          >
            <div className={`${s.iconColor} flex-shrink-0`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest truncate">
                {s.label}
              </p>
              <p className={`text-xl font-bold ${s.text} leading-tight`}>
                {s.val}
              </p>
              <p className="text-[10px] text-gray-400">{s.sub}</p>
            </div>
            {s.badge && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </div>
        ))}
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      {/* LEFT COLUMN */}
        {/* Budget Overview */}
        {/* Dashboard Content */}
        <div className="xl:col-span-2 space-y-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-500" />
                <h3 className="font-semibold text-gray-800">
                  {t("dashboard.finance_overview")}
                </h3>
                <span className="text-[10px] text-gray-400 ml-1">
                  FY 2081/82
                </span>
              </div>
              <div className="flex items-center gap-3">
                {pct(totalUsed, TOTAL_WARD_BUDGET) >= 80 && (
                  <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                    ⚠ {pct(totalUsed, TOTAL_WARD_BUDGET)}% {t("dashboard.used")}
                  </span>
                )}
                <span className="text-sm font-bold text-gray-600">
                  NPR {fmtM(TOTAL_WARD_BUDGET)}
                </span>
              </div>
            </div>
            <div className="px-6 py-5">
              <BudgetPieChart
                used={totalUsed}
                committed={totalCommitted}
                total={TOTAL_WARD_BUDGET}
              />
            </div>
          </div>

          {/* Budget Breakdown */}
          <FinanceBudgetBreakdown
            measurements={measurements}
            materials={materials}
            abstracts={abstracts}
          />

          {/* Financial Trends Chart */}
          <FinancialTrendsChart
            measurements={measurements}
            materials={materials}
            abstracts={abstracts}
          />

          {/* Pending Items */}
          <PendingItemsSection
            measurements={measurements}
            abstracts={abstracts}
          />
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <FinanceQuickActions />

          {/* Financial Health */}
          <FinancialHealthSection
            totalUsed={totalUsed}
            totalCommitted={totalCommitted}
            TOTAL_WARD_BUDGET={TOTAL_WARD_BUDGET}
          />

          {/* Budget Status Chart */}
          <BudgetStatusChart
            measurements={measurements}
            materials={materials}
            abstracts={abstracts}
          />

          {/* Records Summary */}
          <RecordsSummary
            measurements={measurements}
            materials={materials}
            abstracts={abstracts}
          />
        </div>
    </div>
    </div>
  );
}

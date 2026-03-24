import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, RefreshCw, CheckCircle2, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { milestonesAPI, projectsAPI } from "../../api/axios";

// ── Helpers ───────────────────────────────────────────────────────────────────
const today = new Date();
today.setHours(0, 0, 0, 0);

const parseDate = (str) => {
  if (!str) return null;
  const d = new Date(str);
  d.setHours(0, 0, 0, 0);
  return d;
};

const fmtShort = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";

const fmtMonthYear = (d) =>
  d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

function deriveStatus(m) {
  const plannedStart = parseDate(m.planned_start_date);
  const plannedEnd   = parseDate(m.planned_completion_date);

  if (m.is_completed) {
    if (plannedEnd && today <= plannedEnd) return "COMPLETED";
    return "COMPLETED_LATE";
  }

  if (!plannedStart && !plannedEnd) return "UPCOMING";
  if (plannedStart && today < plannedStart) return "UPCOMING";
  if (plannedEnd   && today > plannedEnd)   return "DELAYED";
  return "ONGOING";
}

const STATUS_CFG = {
  COMPLETED:      { labelKey: "gantt.completed",       barColor: "bg-emerald-500", badgeBg: "bg-emerald-100", badgeText: "text-emerald-800" },
  COMPLETED_LATE: { labelKey: "gantt.completed_late",  barColor: "bg-orange-400",  badgeBg: "bg-orange-100",  badgeText: "text-orange-800"  },
  DELAYED:        { labelKey: "gantt.delayed",         barColor: "bg-red-500",     badgeBg: "bg-red-100",     badgeText: "text-red-800"     },
  ONGOING:        { labelKey: "gantt.ongoing",         barColor: "bg-amber-400",   badgeBg: "bg-amber-100",   badgeText: "text-amber-800"   },
  UPCOMING:       { labelKey: "gantt.upcoming",        barColor: "bg-slate-400",   badgeBg: "bg-slate-100",   badgeText: "text-slate-700"   },
};

// ── Timeline math ─────────────────────────────────────────────────────────────
function buildTimeline(milestones) {
  const dates = milestones.flatMap(m => [
    parseDate(m.planned_start_date),
    parseDate(m.planned_completion_date),
  ]).filter(Boolean);

  if (dates.length === 0) {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end   = new Date(today.getFullYear(), today.getMonth() + 4, 1);
    return { start, end };
  }

  const minD = new Date(Math.min(...dates));
  const maxD = new Date(Math.max(...dates));
  const start = new Date(minD.getFullYear(), minD.getMonth() - 1, 1);
  const end   = new Date(maxD.getFullYear(), maxD.getMonth() + 2, 1);
  return { start, end };
}

function getMonths(start, end) {
  const months = [];
  let cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur < end) {
    months.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

function pctAlong(date, start, end) {
  const total = end - start;
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, ((date - start) / total) * 100));
}

// ── Gantt Bar Component ───────────────────────────────────────────────────────
function GanttBar({ milestone, timeStart, timeEnd, status }) {
  const cfg = STATUS_CFG[status];

  const plannedStart = parseDate(milestone.planned_start_date);
  const plannedEnd   = parseDate(milestone.planned_completion_date);

  const actualStart = plannedStart;
  const actualEnd   = milestone.is_completed
    ? (plannedEnd && plannedEnd < today ? plannedEnd : today)
    : (status === "UPCOMING" ? null : today);

  const plannedLeft  = plannedStart ? pctAlong(plannedStart, timeStart, timeEnd) : 0;
  const plannedRight = plannedEnd   ? pctAlong(plannedEnd,   timeStart, timeEnd) : 100;
  const plannedW     = Math.max(0.5, plannedRight - plannedLeft);

  const actualLeft  = actualStart ? pctAlong(actualStart, timeStart, timeEnd) : null;
  const actualRight = actualEnd   ? pctAlong(actualEnd,   timeStart, timeEnd) : null;
  const actualW     = actualLeft !== null && actualRight !== null ? Math.max(0.5, actualRight - actualLeft) : 0;

  const todayPct  = pctAlong(today, timeStart, timeEnd);
  const showToday = todayPct > 0 && todayPct < 100;
  const weight    = parseFloat(milestone.weight || 0).toFixed(1);

  return (
    <div className="relative h-10 w-full">
      {showToday && (
        <div className="absolute top-0 bottom-0 w-px bg-blue-500 z-20 pointer-events-none"
          style={{ left: `${todayPct}%` }} />
      )}
      {plannedStart && plannedEnd && (
        <div className="absolute top-2 h-6 rounded bg-gray-200 border border-gray-300 z-10"
          style={{ left: `${plannedLeft}%`, width: `${plannedW}%` }}
          title={`${fmtShort(milestone.planned_start_date)} → ${fmtShort(milestone.planned_completion_date)}`} />
      )}
      {actualW > 0 && actualLeft !== null && (
        <div className={`absolute top-2 h-6 rounded z-10 flex items-center justify-center overflow-hidden ${cfg.barColor}`}
          style={{ left: `${actualLeft}%`, width: `${actualW}%` }}>
          {actualW > 6 && (
            <span className="text-white text-[10px] font-bold px-1 truncate">
              {milestone.is_completed ? `${weight}% ✓` : `${weight}%`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProjectGantt() {
  const { projectId } = useParams();
  const { t } = useTranslation();

  const [project,    setProject]    = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [projRes, msRes] = await Promise.allSettled([
        projectsAPI.get(projectId),
        milestonesAPI.list(projectId),
      ]);
      if (projRes.status === "fulfilled") setProject(projRes.value.data);
      if (msRes.status  === "fulfilled") setMilestones(msRes.value.data || []);
      else setError(t("gantt.load_failed"));
    } catch (e) {
      setError(t("gantt.load_failed"));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600"/>
      <span className="ml-3 text-gray-600">{t("gantt.loading")}</span>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <AlertTriangle className="w-12 h-12 text-red-400 mb-3"/>
      <p className="text-gray-600">{error}</p>
      <button onClick={fetchData} className="mt-3 text-blue-600 hover:underline flex items-center gap-1">
        <RefreshCw className="w-4 h-4"/> {t("gantt.retry")}
      </button>
    </div>
  );

  if (milestones.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 text-center bg-white rounded-xl shadow-sm border border-gray-100 p-10">
      <TrendingUp className="w-12 h-12 text-gray-300 mb-3"/>
      <p className="text-gray-600 font-medium">{t("overview.no_milestones")}</p>
      <p className="text-sm text-gray-400 mt-1">{t("gantt.add_milestones_hint")}</p>
    </div>
  );

  const sorted     = [...milestones].sort((a, b) => a.milestone_order - b.milestone_order);
  const withStatus = sorted.map(m => ({ ...m, _status: deriveStatus(m) }));

  const { start: timeStart, end: timeEnd } = buildTimeline(milestones);
  const months = getMonths(timeStart, timeEnd);

  const todayPct       = pctAlong(today, timeStart, timeEnd);
  const showGlobalToday = todayPct > 0 && todayPct < 100;

  const completed    = withStatus.filter(m => m._status === "COMPLETED" || m._status === "COMPLETED_LATE");
  const delayed      = withStatus.filter(m => m._status === "DELAYED");
  const ongoing      = withStatus.filter(m => m._status === "ONGOING");
  const upcoming     = withStatus.filter(m => m._status === "UPCOMING");

  const totalWeight     = milestones.reduce((s, m) => s + parseFloat(m.weight || 0), 0);
  const completedWeight = milestones.filter(m => m.is_completed).reduce((s, m) => s + parseFloat(m.weight || 0), 0);
  const overallProgress = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  const onTime          = withStatus.filter(m => m._status === "COMPLETED").length;

  return (
    <div className="space-y-5">

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t("gantt.overall_progress"), value: `${overallProgress}%`, sub: t("gantt.of_total_scope"),        color: "text-gray-900"    },
          { label: t("gantt.on_time"),          value: onTime,                sub: t("gantt.completed_on_schedule"), color: "text-emerald-600" },
          { label: t("gantt.delayed"),          value: delayed.length,        sub: t("gantt.behind_schedule"),       color: "text-red-600"     },
          { label: t("gantt.ongoing"),          value: ongoing.length,        sub: t("gantt.currently_active"),      color: "text-amber-600"   },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-3">
        <div className="flex flex-wrap items-center gap-5 text-sm text-gray-600">
          <span className="font-semibold text-gray-700 text-xs uppercase tracking-wide">{t("gantt.legend")}:</span>
          {[
            { color: "bg-gray-200 border border-gray-300", label: t("gantt.legend_planned") },
            { color: "bg-emerald-500", label: t("gantt.legend_completed_ontime") },
            { color: "bg-orange-400",  label: t("gantt.legend_completed_late") },
            { color: "bg-red-500",     label: t("gantt.delayed") },
            { color: "bg-amber-400",   label: t("gantt.ongoing") },
            { color: "bg-slate-400",   label: t("gantt.upcoming") },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <span className={`w-6 h-3 rounded ${l.color} flex-shrink-0`}/>
              <span className="text-xs">{l.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="w-px h-4 bg-blue-500 flex-shrink-0"/>
            <span className="text-xs">{t("gantt.today")}</span>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">{t("gantt.title")}</h3>
          <button onClick={fetchData} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition">
            <RefreshCw className="w-3.5 h-3.5"/> {t("dashboard.refresh")}
          </button>
        </div>

        <div className="overflow-x-auto">
          <div style={{ minWidth: `${320 + months.length * 70}px` }}>

            {/* Month header */}
            <div className="flex border-b border-gray-100 bg-gray-50/60 sticky top-0 z-10">
              <div className="w-72 flex-shrink-0 px-4 py-2 border-r border-gray-100">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{t("overview.milestone")}</span>
              </div>
              <div className="flex-1 relative">
                <div className="flex h-full">
                  {months.map((m, i) => (
                    <div key={i} className="flex-1 px-1 py-2 text-center border-r border-gray-100 last:border-r-0">
                      <span className="text-[10px] font-medium text-gray-500">{fmtMonthYear(m)}</span>
                    </div>
                  ))}
                </div>
                {showGlobalToday && (
                  <div className="absolute top-0 bottom-0 w-px bg-blue-500 z-20 pointer-events-none"
                    style={{ left: `${todayPct}%` }} />
                )}
              </div>
            </div>

            {/* Milestone rows */}
            {withStatus.map((m, idx) => {
              const cfg = STATUS_CFG[m._status];
              return (
                <div key={m.id}
                  className={`flex border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? "" : "bg-gray-50/20"}`}>
                  <div className="w-72 flex-shrink-0 px-4 py-2 border-r border-gray-100">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                            {m.milestone_order}
                          </span>
                          {m.is_completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0"/>}
                        </div>
                        <p className="text-sm font-medium text-gray-800 leading-snug truncate">{m.milestone_name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {fmtShort(m.planned_start_date)} → {fmtShort(m.planned_completion_date)}
                        </p>
                        <p className="text-[10px] text-gray-400">{t("overview.weight_label")}: {parseFloat(m.weight||0).toFixed(1)}%</p>
                      </div>
                      <span className={`flex-shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded ${cfg.badgeBg} ${cfg.badgeText}`}>
                        {t(cfg.labelKey)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 px-2 py-1 relative">
                    <div className="absolute inset-0 flex pointer-events-none">
                      {months.map((_, i) => (
                        <div key={i} className="flex-1 border-r border-gray-100 last:border-r-0"/>
                      ))}
                    </div>
                    <GanttBar milestone={m} timeStart={timeStart} timeEnd={timeEnd} status={m._status} />
                  </div>
                </div>
              );
            })}

            {/* Summary footer */}
            <div className="flex border-t-2 border-gray-200 bg-gray-50/60">
              <div className="w-72 flex-shrink-0 px-4 py-2 border-r border-gray-100">
                <p className="text-xs font-semibold text-gray-600">
                  {completed.length}/{milestones.length} {t("gantt.milestones_complete")}
                </p>
                <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${overallProgress}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">{overallProgress}% {t("gantt.overall_progress").toLowerCase()}</p>
              </div>
              <div className="flex-1 px-4 py-2 flex items-center gap-6 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"/>{completed.length} {t("gantt.done")}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"/>{delayed.length} {t("gantt.delayed")}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"/>{ongoing.length} {t("gantt.ongoing")}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400"/>{upcoming.length} {t("gantt.upcoming")}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Delayed milestones callout */}
      {delayed.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600"/>
            <h4 className="font-semibold text-red-700 text-sm">{t("dashboard.overdue_milestones")}</h4>
          </div>
          <div className="space-y-1">
            {delayed.map(m => {
              const daysLate = m.planned_completion_date
                ? Math.ceil((today - parseDate(m.planned_completion_date)) / 86400000)
                : null;
              return (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <span className="text-red-700 font-medium">{m.milestone_order}. {m.milestone_name}</span>
                  <span className="text-red-500 text-xs font-semibold">
                    {daysLate !== null ? t("dashboard.days_overdue", { n: daysLate }) : t("gantt.no_end_date")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
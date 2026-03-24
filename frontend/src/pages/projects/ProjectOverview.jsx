import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, MapPin, Calendar, DollarSign, User,
  FileText, AlertCircle, CheckCircle2, Clock, Loader2,
  Plus, Edit, Trash2, X, AlertTriangle,
} from "lucide-react";
import api from "../../api/axios";
import BSDatePicker from "../../components/BSDatePicker";
import NepaliDate from "nepali-date-converter";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt   = (n) => new Intl.NumberFormat("en-NP").format(Math.round(Number(n) || 0));
const pct   = (a, b) => b > 0 ? Math.min(100, Math.round((a / b) * 100)) : 0;
const sumBy = (arr, k) => arr.reduce((s, x) => s + (Number(x[k]) || 0), 0);

const BS_MONTHS_EN = ["Baisakh","Jestha","Asar","Shrawan","Bhadra","Ashwin","Kartik","Mangsir","Poush","Magh","Falgun","Chaitra"];
const BS_MONTHS_NE = ["बैशाख","जेठ","असार","श्रावण","भाद्र","आश्विन","कार्तिक","मंसिर","पुष","माघ","फाल्गुण","चैत्र"];

function formatBSDate(adStr, lang = "en") {
  if (!adStr) return "N/A";
  try {
    const bs     = new NepaliDate(new Date(adStr));
    const months = lang === "ne" ? BS_MONTHS_NE : BS_MONTHS_EN;
    return `${bs.getDate()} ${months[bs.getMonth()]} ${bs.getYear()}`;
  } catch { return "N/A"; }
}

// ─── Per-project mini donut ───────────────────────────────────────────────────
function ProjectDonut({ estimated, used }) {
  const { t } = useTranslation();
  const cx = 80, cy = 80, r = 58, sw = 18;
  const circ      = 2 * Math.PI * r;
  const isOver    = used > estimated && estimated > 0;
  const remaining = Math.max(0, estimated - used);
  const total     = estimated || 1;
  const segs = isOver
    ? [{ p: 1, col: "#ef4444" }]
    : [{ p: Math.min(used, estimated) / total, col: "#1d4ed8" }, { p: remaining / total, col: "#e5e7eb" }];
  let cum = 0;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" className="w-36 h-36 flex-shrink-0">
        {segs.map((s, i) => {
          const dash = s.p * circ; const off = circ - cum * circ; cum += s.p;
          return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.col} strokeWidth={sw}
            strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={off} strokeLinecap="butt"
            style={{ transition: "stroke-dasharray 1s ease" }} />;
        })}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="10" fill={isOver ? "#ef4444" : "#6b7280"}>
          {isOver ? t("budget.over").toUpperCase() : t("budget.used").toUpperCase()}
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize="16" fill={isOver ? "#ef4444" : "#111827"} fontWeight="700">
          {pct(used, estimated)}%
        </text>
        <text x={cx} y={cy + 22} textAnchor="middle" fontSize="8" fill="#9ca3af">{t("overview.of_estimate")}</text>
      </svg>
      <div className="space-y-3 flex-1">
        {[
          { label: t("budget.approved"),  val: estimated, color: "border-blue-600 bg-blue-50",   text: "text-blue-700" },
          { label: t("budget.used"),       val: used,      color: isOver ? "border-red-500 bg-red-50" : "border-emerald-500 bg-emerald-50", text: isOver ? "text-red-700" : "text-emerald-700" },
          { label: t("budget.remaining"),  val: remaining, color: "border-gray-300 bg-gray-50",   text: remaining === 0 ? "text-red-400" : "text-gray-700" },
        ].map(l => (
          <div key={l.label} className={`border-l-3 pl-3 py-1.5 rounded-r ${l.color}`} style={{ borderLeftWidth: 3 }}>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{l.label}</p>
            <p className={`text-sm font-bold ${l.text}`}>NPR {fmt(l.val)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProjectOverview() {
  const { projectId } = useParams();
  const navigate      = useNavigate();
  const { t, i18n }   = useTranslation();
  const lang           = i18n.language;

  const [project,      setProject]      = useState(null);
  const [milestones,   setMilestones]   = useState([]);
  const [abstracts,    setAbstracts]    = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [materials,    setMaterials]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const [showForm,    setShowForm]    = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [formData,    setFormData]    = useState({ milestone_name:"", milestone_order:"", weight:"", planned_start_date:"", planned_completion_date:"" });
  const [formLoading, setFormLoading] = useState(false);
  const [formError,   setFormError]   = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const [projRes, msRes, absRes, mbRes, matRes] = await Promise.allSettled([
        api.get(`projects/project/${projectId}/`),
        api.get(`milestones/milestone/?project=${projectId}`),
        api.get(`finance/abstract-record/?project=${projectId}`),
        api.get(`finance/measurement-book/?project=${projectId}`),
        api.get(`finance/materials/?project=${projectId}`),
      ]);
      if (projRes.status === "fulfilled") setProject(projRes.value.data); else setError(t("overview.failed_load_project"));
      if (msRes.status  === "fulfilled") setMilestones(msRes.value.data || []);
      if (absRes.status === "fulfilled") setAbstracts(absRes.value.data || []);
      if (mbRes.status  === "fulfilled") setMeasurements(mbRes.value.data || []);
      if (matRes.status === "fulfilled") setMaterials(matRes.value.data || []);
    } catch { setError(t("overview.failed_load_details")); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, [projectId]);

  const estimatedBudget = sumBy(abstracts.filter(a => a.status === "APPROVED"), "grand_total");
  const usedMB          = sumBy(measurements.filter(m => m.status === "VERIFIED"), "total_amount");
  const usedMat         = sumBy(materials.filter(m => m.status === "DELIVERED"),   "grand_total");
  const totalUsed       = usedMB + usedMat;
  const committedMat    = sumBy(materials.filter(m => m.status === "ORDERED"),     "grand_total");
  const committedAbs    = sumBy(abstracts.filter(a => a.status === "PENDING"),     "grand_total");
  const totalWeight     = milestones.reduce((s, m) => s + parseFloat(m.weight || 0), 0);
  const completedWeight = milestones.filter(m => m.is_completed).reduce((s, m) => s + parseFloat(m.weight || 0), 0);
  const progress        = completedWeight;

  const availableWeight = (excludeId = null) => {
    const used = milestones.filter(m => m.id !== excludeId).reduce((s, m) => s + parseFloat(m.weight || 0), 0);
    return 100 - used;
  };

  const handleAddMilestone = () => {
    if (availableWeight() <= 0) { alert(t("overview.weight_full")); return; }
    setEditing(null);
    setFormData({ milestone_name:"", milestone_order: milestones.length + 1, weight:"", planned_start_date:"", planned_completion_date:"" });
    setShowForm(true);
  };

  const handleEditMilestone = (m) => {
    setEditing(m);
    setFormData({ milestone_name: m.milestone_name, milestone_order: m.milestone_order, weight: m.weight, planned_start_date: m.planned_start_date || "", planned_completion_date: m.planned_completion_date || "" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("msg.confirm_delete"))) return;
    try { await api.delete(`milestones/milestone/${id}/`); await load(); }
    catch { alert(t("overview.failed_delete")); }
  };

  const handleToggle = async (m) => {
    setMilestones(prev => prev.map(ms => ms.id === m.id ? { ...ms, is_completed: !ms.is_completed } : ms));
    try {
      await api.patch(`milestones/milestone/${m.id}/`, { is_completed: !m.is_completed });
      const res = await api.get(`milestones/milestone/?project=${projectId}`);
      setMilestones(res.data || []);
    } catch {
      setMilestones(prev => prev.map(ms => ms.id === m.id ? { ...ms, is_completed: m.is_completed } : ms));
      alert(t("overview.failed_update_milestone"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const w = parseFloat(formData.weight); const avail = availableWeight(editing?.id);
    if (isNaN(w) || w <= 0) { setFormError(t("overview.weight_positive")); return; }
    if (w > avail)           { setFormError(t("overview.weight_exceeds", { avail: avail.toFixed(2) })); return; }
    setFormLoading(true); setFormError(null);
    try {
      const payload = {
        project: parseInt(projectId), milestone_name: formData.milestone_name,
        milestone_order: parseInt(formData.milestone_order), weight: w,
        planned_start_date:      formData.planned_start_date      || null,
        planned_completion_date: formData.planned_completion_date || null,
        is_critical_path: false, is_completed: editing?.is_completed || false,
      };
      if (editing) await api.put(`milestones/milestone/${editing.id}/`, payload);
      else         await api.post("milestones/milestone/", payload);
      await load(); setShowForm(false); setEditing(null);
    } catch (e) {
      setFormError(e.response?.data ? JSON.stringify(e.response.data) : t("overview.failed_save"));
    } finally { setFormLoading(false); }
  };

  const statusConfig = {
    ONGOING:     { color:"bg-blue-100 text-blue-800",    icon:Clock,        label:t("project.status.ongoing")    },
    COMPLETED:   { color:"bg-green-100 text-green-800",  icon:CheckCircle2, label:t("project.status.completed")  },
    DELAYED:     { color:"bg-red-100 text-red-800",      icon:AlertCircle,  label:t("project.status.delayed")    },
    CANCELLED:   { color:"bg-gray-100 text-gray-800",    icon:AlertCircle,  label:t("project.status.cancelled")  },
    COMING_SOON: { color:"bg-purple-100 text-purple-800",icon:Clock,        label:t("project.status.coming_soon") },
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600"/><span className="ml-3 text-gray-600 font-medium">{t("loading")}</span></div>;
  if (error || !project) return (
    <div className="flex flex-col items-center justify-center h-64">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4"/>
      <p className="text-gray-600">{error || t("overview.not_found")}</p>
      <button onClick={() => navigate("/app/projects")} className="mt-4 text-blue-600 hover:underline">← {t("back")}</button>
    </div>
  );

  const sc = statusConfig[project.status] || statusConfig.ONGOING;
  const StatusIcon = sc.icon;
  const avail = availableWeight(editing?.id);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/app/projects")} className="p-2 hover:bg-gray-100 rounded-lg transition"><ArrowLeft className="w-5 h-5"/></button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{project.project_name}</h1>
            <p className="text-sm text-gray-500 mt-0.5 font-medium tracking-wide">{t("project.code")}: {project.project_code}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${sc.color}`}>
          <StatusIcon className="w-4 h-4"/> {sc.label}
        </span>
      </div>

      {/* Budget */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-3">
          <p className="text-slate-300 text-xs uppercase tracking-widest font-semibold">{t("overview.budget_overview")}</p>
        </div>
        <div className="p-6">
          {estimatedBudget > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <ProjectDonut estimated={estimatedBudget} used={totalUsed} />
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">{t("overview.breakdown")}</p>
                {[
                  { label:t("overview.approved_estimates"),  val:estimatedBudget, cls:"text-gray-800",   bg:"bg-gray-50"  },
                  { label:t("overview.verified_mb"),         val:usedMB,          cls:"text-blue-700",  bg:"bg-blue-50"  },
                  { label:t("overview.delivered_materials"), val:usedMat,         cls:"text-blue-700",  bg:"bg-blue-50"  },
                  { label:t("overview.ordered_materials"),   val:committedMat,    cls:"text-amber-700", bg:"bg-amber-50" },
                  { label:t("overview.pending_abstracts"),   val:committedAbs,    cls:"text-amber-700", bg:"bg-amber-50" },
                ].map(r => (
                  <div key={r.label} className={`flex justify-between items-center px-3 py-2 rounded-lg ${r.bg}`}>
                    <span className="text-xs text-gray-600 font-medium">{r.label}</span>
                    <span className={`text-sm font-bold ${r.cls}`}>NPR {fmt(r.val)}</span>
                  </div>
                ))}
                {(() => {
                  const up = pct(totalUsed, estimatedBudget);
                  const tc = totalUsed + committedMat + committedAbs;
                  const cp = pct(tc, estimatedBudget);
                  if (totalUsed > estimatedBudget) return (
                    <div className="flex items-start gap-2 bg-red-50 border-2 border-red-300 rounded-lg p-3">
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5"/>
                      <div><p className="text-xs font-bold text-red-700">⛔ {t("budget.over").toUpperCase()}</p>
                      <p className="text-xs text-red-600 mt-0.5">{t("overview.exceeded_by")} NPR {fmt(totalUsed - estimatedBudget)} ({up - 100}% {t("overview.over")}).</p></div>
                    </div>
                  );
                  if (tc > estimatedBudget) return (
                    <div className="flex items-start gap-2 bg-orange-50 border border-orange-300 rounded-lg p-3">
                      <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5"/>
                      <div><p className="text-xs font-bold text-orange-700">⚠ {t("overview.committed_exceed")}</p>
                      <p className="text-xs text-orange-600 mt-0.5">{t("overview.total_committed")} NPR {fmt(tc)} — {cp - 100}% {t("overview.over_estimate")}.</p></div>
                    </div>
                  );
                  if (up >= 80) return (
                    <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5"/>
                      <p className="text-xs text-yellow-700"><strong>{up}% {t("budget.used")}</strong> — {t("overview.approaching_limit")}. {t("budget.remaining")}: NPR {fmt(estimatedBudget - totalUsed)}.</p>
                    </div>
                  );
                  return (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0"/>
                      <p className="text-xs text-green-700"><strong>{up}% {t("budget.used")}</strong> — NPR {fmt(estimatedBudget - totalUsed)} {t("budget.remaining").toLowerCase()}.</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0"/>
              <div>
                <p className="text-sm font-semibold text-amber-800">{t("overview.no_budget_estimate")}</p>
                <p className="text-xs text-amber-600 mt-0.5">{t("overview.go_to_abstract")}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Milestone Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 tracking-tight">{t("project.progress")}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {milestones.filter(m => m.is_completed).length} {t("overview.of")} {milestones.length} {t("project.milestones").toLowerCase()} {t("overview.completed_lower")} · {t("overview.click_checkbox")}
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-blue-600 tracking-tight">{progress.toFixed(1)}%</span>
            <p className="text-xs text-gray-400 mt-0.5">{completedWeight.toFixed(1)}% {t("overview.of")} {totalWeight.toFixed(1)}% {t("overview.assigned_weight")}</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden mb-1">
          <div className="h-5 rounded-full transition-all duration-700 bg-blue-600 flex items-center justify-end pr-2" style={{ width:`${Math.min(progress,100)}%` }}>
            {progress >= 15 && <span className="text-white text-xs font-bold">{progress.toFixed(0)}%</span>}
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mb-4 font-medium"><span>0%</span><span>100%</span></div>

        {milestones.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">{t("overview.no_milestones")}</p>
        ) : (
          <div className="space-y-2 border-t border-gray-100 pt-4">
            {[...milestones].sort((a, b) => a.milestone_order - b.milestone_order).map(m => (
              <div key={m.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${m.is_completed ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200 hover:border-blue-200"}`}>
                <button type="button" onClick={() => handleToggle(m)}
                  title={m.is_completed ? t("overview.mark_incomplete") : t("overview.mark_complete")}
                  className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${m.is_completed ? "bg-green-500 border-green-500 hover:bg-green-600" : "border-gray-300 bg-white hover:border-blue-500"}`}>
                  {m.is_completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                </button>
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">{m.milestone_order}</span>
                <span className={`flex-1 text-sm font-medium ${m.is_completed ? "line-through text-gray-400" : "text-gray-800"}`}>{m.milestone_name}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.is_completed ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-600"}`}>{parseFloat(m.weight).toFixed(1)}%</span>
                {m.planned_completion_date && (
                  <span className="text-xs text-gray-400 hidden md:block font-medium">
                    {t("overview.due")} {formatBSDate(m.planned_completion_date, lang)}
                  </span>
                )}
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleEditMilestone(m)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(m.id)}     className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-500 font-medium">
            {t("overview.total_weight_assigned")}: <strong>{totalWeight.toFixed(1)}%</strong>
            {totalWeight < 100  && <span className="text-orange-500 ml-1">({(100-totalWeight).toFixed(1)}% {t("overview.unassigned")})</span>}
            {totalWeight >= 100 && <span className="text-green-600 ml-1">✓</span>}
          </span>
          {totalWeight < 100 && milestones.length > 0 && <span className="text-orange-500 italic text-xs">{t("overview.add_more_milestones")}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {project.project_description && (
            <Card title={t("project.description")} icon={FileText}>
              <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{project.project_description}</p>
            </Card>
          )}

          <Card title={t("overview.location_details")} icon={MapPin}>
            <InfoGrid>
              <InfoItem label={t("location.ward")}         value={project.ward_no || project.location_details?.ward_no} />
              <InfoItem label={t("location.municipality")} value={project.municipality || project.location_details?.municipality} />
              <InfoItem label={t("location.district")}     value={project.district || project.location_details?.district} />
              <InfoItem label={t("location.province")}     value={project.province || project.location_details?.province} />
              <InfoItem label={t("location.place")}        value={project.location_details?.place_or_street || project.location} fullWidth />
            </InfoGrid>
          </Card>

          <Card title={t("overview.project_timeline")} icon={Calendar}>
            <InfoGrid>
              <InfoItem label={t("overview.planned_start")}      value={formatBSDate(project.planned_start_date, lang)} />
              <InfoItem label={t("overview.planned_completion")} value={formatBSDate(project.planned_completion_date, lang)} />
              <InfoItem label={t("timeline.duration")}           value={project.planned_duration_days ? `${project.planned_duration_days} ${t("overview.days")}` : "N/A"} />
              <InfoItem label={t("budget.fiscal_year")}          value={project.fiscal_year_details?.year_label || project.fiscal_year} />
            </InfoGrid>
          </Card>

          <Card title={t("overview.personnel")} icon={User}>
            <InfoGrid>
              <InfoItem label={t("nav.engineers").replace(/s$/,"")}    value={project.assigned_engineer_details?.account?.full_name || t("overview.not_assigned")} />
              <InfoItem label={t("nav.chairpersons").replace(/s$/,"")} value={project.chairperson_details?.account?.full_name      || t("overview.not_assigned")} />
              <InfoItem label={t("nav.contractors").replace(/s$/,"")}  value={project.contractor_details?.contractor_name || project.contractor_details?.company_name || t("overview.not_assigned")} fullWidth />
            </InfoGrid>
          </Card>

          {/* Add / Edit Milestone form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 tracking-tight">
                <CheckCircle2 className="w-5 h-5 text-blue-600"/> {t("overview.add_edit_milestone")}
              </h3>
              <button onClick={handleAddMilestone} disabled={totalWeight >= 100}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
                <Plus className="w-4 h-4"/> {t("overview.add_milestone")}
              </button>
            </div>
            {showForm ? (
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 tracking-tight">{editing ? t("edit") : t("add")} {t("overview.milestone")}</h4>
                  <button onClick={() => { setShowForm(false); setEditing(null); setFormError(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                </div>
                {formError && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">{formError}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">{t("overview.milestone_name")} *</label>
                      <input type="text" required value={formData.milestone_name}
                        onChange={e => setFormData(p => ({ ...p, milestone_name: e.target.value }))}
                        placeholder={t("overview.milestone_name_placeholder")}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">{t("overview.order")} *</label>
                      <input type="number" required min="1" value={formData.milestone_order}
                        onChange={e => setFormData(p => ({ ...p, milestone_order: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                        {t("overview.weight_label")} * — {t("overview.max")} {avail.toFixed(1)}%
                      </label>
                      <input type="number" required step="0.01" min="0.01" max={avail} value={formData.weight}
                        onChange={e => setFormData(p => ({ ...p, weight: e.target.value }))}
                        placeholder={`${t("overview.max")} ${avail.toFixed(1)}`}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>

                    {/* ── BS date pickers ── */}
                    <BSDatePicker
                      label={t("timeline.proposed")}
                      name="planned_start_date"
                      value={formData.planned_start_date}
                      onChange={e => setFormData(p => ({ ...p, planned_start_date: e.target.value }))}
                    />
                    <BSDatePicker
                      label={t("timeline.completion")}
                      name="planned_completion_date"
                      value={formData.planned_completion_date}
                      onChange={e => setFormData(p => ({ ...p, planned_completion_date: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                    <button type="button" onClick={() => { setShowForm(false); setEditing(null); setFormError(null); }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">{t("cancel")}</button>
                    <button type="submit" disabled={formLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium disabled:opacity-50">
                      {formLoading && <Loader2 className="w-4 h-4 animate-spin"/>}
                      {editing ? t("edit") : t("add")} {t("overview.milestone")}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="px-6 py-4 text-sm text-gray-400">
                {totalWeight >= 100 ? t("overview.all_weight_assigned") : t("overview.weight_remaining", { pct: (100-totalWeight).toFixed(1) })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow text-white p-6">
            <h3 className="font-semibold mb-4 text-xs uppercase tracking-widest text-slate-300">{t("overview.quick_stats")}</h3>
            <div className="space-y-3">
              {[
                { label:t("status"),             val:project.status },
                { label:t("overview.priority"),  val:project.priority_details?.name || project.priority },
                { label:t("project.progress"),   val:`${Math.round(progress)}%` },
                { label:t("timeline.duration"),  val:project.planned_duration_days ? `${project.planned_duration_days}d` : "N/A" },
                { label:t("project.milestones"), val:`${milestones.filter(m=>m.is_completed).length}/${milestones.length}` },
                { label:t("overview.est_budget"),val:estimatedBudget > 0 ? `NPR ${fmt(estimatedBudget)}` : t("overview.no_estimate") },
                { label:t("budget.used"),         val:totalUsed > 0 ? `NPR ${fmt(totalUsed)}` : "NPR 0" },
              ].map(s => (
                <div key={s.label} className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">{s.label}</span>
                  <span className="font-semibold text-right max-w-[55%] text-xs">{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          <Card title={t("budget.source")} icon={DollarSign}>
            <div className="space-y-2 text-sm">
              <InfoItem label={t("budget.source")}         value={project.budget_source_details?.name || "N/A"} />
              <InfoItem label={t("budget.fiscal_year")}    value={project.fiscal_year_details?.year_label || "N/A"} />
              <InfoItem label={t("overview.project_type")} value={project.project_type_details?.name || "N/A"} />
            </div>
          </Card>

          {project.project_document && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm tracking-tight">
                <FileText className="w-4 h-4 text-blue-600"/> {t("overview.project_document")}
              </h3>
              <a href={project.project_document} target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1">{t("view")} →</a>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm tracking-tight">{t("overview.metadata")}</h3>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span className="font-medium">{t("overview.project_id")}</span>
                <span className="text-gray-700 font-mono">{project.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">{t("overview.created")}</span>
                <span className="text-gray-700">{formatBSDate(project.created_at, lang)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm tracking-tight">
          {Icon && <Icon className="w-4 h-4 text-blue-600"/>}{title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
function InfoGrid({ children }) { return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>; }
function InfoItem({ label, value, fullWidth = false }) {
  return (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className="text-sm text-gray-900 font-medium">{value || "N/A"}</dd>
    </div>
  );
}
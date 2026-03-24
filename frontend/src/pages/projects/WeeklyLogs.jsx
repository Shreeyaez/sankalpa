import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Calendar, Camera, Users, CloudRain, Wrench, FileText,
  AlertCircle, Plus, X, Loader2, Image as ImageIcon,
  Trash2, Edit, CheckCircle2
} from "lucide-react";
import BSDatePicker from "../../components/BSDatePicker";
import NepaliDate from "nepali-date-converter";

// ── BS formatDate helper ──────────────────────────────────────────────────────
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

export default function WeeklyLogs() {
  const { projectId } = useParams();
  const { t, i18n }   = useTranslation();
  const lang           = i18n.language;

  const [logs,       setLogs]       = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [engineers,  setEngineers]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editingLog, setEditingLog] = useState(null);

  const todayAD = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    log_date: todayAD, milestone: "", weather_conditions: "", crew_size: "",
    equipment_used: "", work_progress_detail: "", area_completed: "",
    issues_risks: "", next_week_plan: "", is_milestone_completed: false,
    created_by: "", log_photo: null
  });

  const [formLoading,  setFormLoading]  = useState(false);
  const [formError,    setFormError]    = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => { fetchData(); }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsRes, milestonesRes, engineersRes] = await Promise.all([
        fetch(`/api/logs/weekly-logs/?project=${projectId}`,     { credentials: "include" }),
        fetch(`/api/milestones/milestone/?project=${projectId}`, { credentials: "include" }),
        fetch(`/api/engineers/engineer/`,                        { credentials: "include" })
      ]);
      setLogs(await logsRes.json());
      setMilestones(await milestonesRes.json());
      setEngineers(await engineersRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "milestone") {
      const picked = milestones.find(m => m.id === Number(value));
      setFormData(prev => ({ ...prev, milestone: value, is_milestone_completed: picked ? picked.is_completed : false }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
    setFormError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, log_photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddLog = () => {
    setShowForm(true);
    setEditingLog(null);
    setFormData({
      log_date: todayAD, milestone: "", weather_conditions: "", crew_size: "",
      equipment_used: "", work_progress_detail: "", area_completed: "",
      issues_risks: "", next_week_plan: "", is_milestone_completed: false,
      created_by: "", log_photo: null
    });
    setPhotoPreview(null);
  };

  const handleEditLog = (log) => {
    setEditingLog(log);
    setShowForm(true);
    setFormData({
      log_date: log.log_date, milestone: log.milestone,
      weather_conditions: log.weather_conditions, crew_size: log.crew_size,
      equipment_used: log.equipment_used, work_progress_detail: log.work_progress_detail,
      area_completed: log.area_completed, issues_risks: log.issues_risks || "",
      next_week_plan: log.next_week_plan, is_milestone_completed: log.is_milestone_completed,
      created_by: log.created_by, log_photo: null
    });
    setPhotoPreview(log.log_photo || null);
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm(t("msg.confirm_delete"))) return;
    try {
      const response = await fetch(`/api/logs/weekly-logs/${logId}/`, {
        method: "DELETE", credentials: "include",
        headers: { "X-CSRFToken": getCookie("csrftoken") }
      });
      if (response.ok) { await fetchData(); alert(t("msg.deleted")); }
      else alert(t("weeklylogs.delete_failed"));
    } catch (error) {
      console.error("Error deleting log:", error);
      alert(t("weeklylogs.delete_failed"));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const fd = new FormData();
      fd.append("project", projectId);
      Object.entries(formData).forEach(([key, val]) => {
        if (key === "log_photo" && val instanceof File) fd.append(key, val);
        else if (key !== "log_photo") fd.append(key, val ?? "");
      });
      const url = editingLog ? `/api/logs/weekly-logs/${editingLog.id}/` : `/api/logs/weekly-logs/`;
      const response = await fetch(url, {
        method: editingLog ? "PUT" : "POST",
        credentials: "include",
        headers: { "X-CSRFToken": getCookie("csrftoken") },
        body: fd
      });
      if (response.ok) {
        await fetchData();
        setShowForm(false);
        setEditingLog(null);
        alert(editingLog ? t("weeklylogs.update_success") : t("weeklylogs.add_success"));
      } else {
        setFormError(JSON.stringify(await response.json()));
      }
    } catch (error) {
      console.error("Error saving log:", error);
      setFormError(t("weeklylogs.save_failed"));
    } finally {
      setFormLoading(false);
    }
  };

  const getMilestoneName   = (id) => milestones.find(m => m.id === id)?.milestone_name || "N/A";
  const getMilestoneWeight = (id) => { const m = milestones.find(m => m.id === id); return m ? parseFloat(m.weight) : null; };
  const getEngineerName    = (id) => engineers.find(e => e.id === id)?.account?.full_name || "N/A";
  const selectedMilestone  = milestones.find(m => m.id === Number(formData.milestone));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <span className="ml-3 text-gray-600">{t("loading")}</span>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{t("weeklylogs.title")}</h2>
        <button onClick={handleAddLog}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition">
          <Plus className="w-5 h-5" />{t("weeklylogs.add_log")}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingLog ? t("weeklylogs.edit_log") : t("weeklylogs.add_new_log")}
              </h3>
              <button onClick={() => { setShowForm(false); setEditingLog(null); setFormError(null); }}
                className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {formError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{formError}</div>}

              <div className="grid grid-cols-2 gap-4">
                {/* ── BS date picker for log date ── */}
                <BSDatePicker
                  label={<>{t("date")} <span className="text-red-500">*</span></>}
                  name="log_date"
                  value={formData.log_date}
                  onChange={handleInputChange}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("logs.milestone_label")} <span className="text-red-500">*</span>
                  </label>
                  <select name="milestone" value={formData.milestone} onChange={handleInputChange} required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
                    <option value="">{t("form.select")} {t("logs.milestone_label")}</option>
                    {milestones.map(m => (
                      <option key={m.id} value={m.id}>{m.milestone_order}. {m.milestone_name} ({parseFloat(m.weight).toFixed(1)}%)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("logs.weather")} <span className="text-red-500">*</span></label>
                  <input type="text" name="weather_conditions" value={formData.weather_conditions} onChange={handleInputChange} required
                    placeholder={t("weeklylogs.weather_placeholder")}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("logs.crew_size")} <span className="text-red-500">*</span></label>
                  <input type="number" name="crew_size" value={formData.crew_size} onChange={handleInputChange} required min="1"
                    placeholder={t("weeklylogs.crew_placeholder")}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("logs.equipment_used")} <span className="text-red-500">*</span></label>
                  <textarea name="equipment_used" value={formData.equipment_used} onChange={handleInputChange} required rows={2}
                    placeholder={t("weeklylogs.equipment_placeholder")}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("logs.work_progress")} <span className="text-red-500">*</span></label>
                  <textarea name="work_progress_detail" value={formData.work_progress_detail} onChange={handleInputChange} required rows={3}
                    placeholder={t("weeklylogs.progress_placeholder")}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("weeklylogs.area_completed")} <span className="text-red-500">*</span></label>
                  <input type="text" name="area_completed" value={formData.area_completed} onChange={handleInputChange} required
                    placeholder={t("weeklylogs.area_placeholder")}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("logs.issues_risks")}</label>
                  <textarea name="issues_risks" value={formData.issues_risks} onChange={handleInputChange} rows={2}
                    placeholder={t("weeklylogs.issues_placeholder")}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("weeklylogs.next_week_plan")} <span className="text-red-500">*</span></label>
                  <textarea name="next_week_plan" value={formData.next_week_plan} onChange={handleInputChange} required rows={2}
                    placeholder={t("weeklylogs.next_week_placeholder")}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("weeklylogs.logged_by")} <span className="text-red-500">*</span></label>
                  <select name="created_by" value={formData.created_by} onChange={handleInputChange} required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500">
                    <option value="">{t("form.select")} {t("nav.engineers").replace(/s$/, "")}</option>
                    {engineers.map(e => (
                      <option key={e.id} value={e.id}>{e.account?.full_name || `Engineer #${e.id}`}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-start pt-6">
                  {(() => {
                    const alreadyDone = selectedMilestone?.is_completed && !formData.is_milestone_completed;
                    return (
                      <label className={`flex items-start gap-3 rounded-lg border p-3 w-full transition-colors ${
                        selectedMilestone?.is_completed ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200 hover:border-blue-300"
                      } ${!selectedMilestone ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                        <input type="checkbox" name="is_milestone_completed" checked={formData.is_milestone_completed}
                          onChange={handleInputChange} disabled={!selectedMilestone || alreadyDone}
                          className="mt-0.5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                        <div className="flex-1 min-w-0">
                          {selectedMilestone ? (
                            <>
                              <p className="text-sm font-medium text-gray-800 leading-snug">
                                {t("weeklylogs.is_milestone_done")} <span className="text-blue-700 font-semibold">"{selectedMilestone.milestone_name}"</span>?
                              </p>
                              {alreadyDone
                                ? <p className="text-xs text-green-600 mt-0.5">{t("weeklylogs.already_completed")}</p>
                                : <p className="text-xs text-gray-500 mt-0.5">{t("weeklylogs.will_add")} <strong className="text-green-700">{parseFloat(selectedMilestone.weight).toFixed(1)}%</strong> {t("weeklylogs.to_progress")}.</p>
                              }
                            </>
                          ) : (
                            <p className="text-sm text-gray-400 italic">{t("weeklylogs.select_milestone_first")}</p>
                          )}
                        </div>
                        {selectedMilestone?.is_completed && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
                      </label>
                    );
                  })()}
                </div>
              </div>

              {/* Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("weeklylogs.site_photo")}</label>
                <div className="flex items-start gap-4">
                  <label className="flex-shrink-0 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition">
                      <div className="flex flex-col items-center gap-2">
                        <Camera className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-600">{t("weeklylogs.upload_photo")}</span>
                      </div>
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                  {photoPreview && (
                    <div className="relative">
                      <img src={photoPreview} alt={t("weeklylogs.preview")} className="w-32 h-32 object-cover rounded-lg border" />
                      <button type="button"
                        onClick={() => { setPhotoPreview(null); setFormData(prev => ({ ...prev, log_photo: null })); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => { setShowForm(false); setEditingLog(null); setFormError(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">{t("cancel")}</button>
                <button type="submit" disabled={formLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50">
                  {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingLog ? t("weeklylogs.update_log") : t("weeklylogs.add_log")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logs List */}
      {logs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("weeklylogs.empty_title")}</h3>
          <p className="text-gray-500 mb-4">{t("weeklylogs.empty_text")}</p>
          <button onClick={handleAddLog}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />{t("weeklylogs.add_first_log")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map(log => (
            <div key={log.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">{formatBSDate(log.log_date, lang)}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                      <span className="text-sm font-medium text-blue-700">{getMilestoneName(log.milestone)}</span>
                      {getMilestoneWeight(log.milestone) && (
                        <span className="text-xs text-blue-400">{getMilestoneWeight(log.milestone).toFixed(1)}%</span>
                      )}
                    </div>
                    {log.is_milestone_completed && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-green-50 rounded-full">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">{t("logs.milestone_completed")}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEditLog(log)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition" title={t("edit")}><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteLog(log.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition" title={t("delete")}><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <InfoItem icon={CloudRain} label={t("logs.weather")}        value={log.weather_conditions} />
                    <InfoItem icon={Users}     label={t("logs.crew_size")}      value={`${log.crew_size} ${t("logs.workers")}`} />
                    <InfoItem icon={Wrench}    label={t("logs.equipment_used")} value={log.equipment_used} />
                    <InfoItem                  label={t("weeklylogs.area_completed")} value={log.area_completed} />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">{t("logs.work_progress")}</h4>
                      <p className="text-sm text-gray-900">{log.work_progress_detail}</p>
                    </div>
                    {log.issues_risks && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 text-orange-500" />{t("logs.issues_risks")}
                        </h4>
                        <p className="text-sm text-gray-900">{log.issues_risks}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">{t("weeklylogs.next_week_plan")}</h4>
                      <p className="text-sm text-gray-900">{log.next_week_plan}</p>
                    </div>
                  </div>
                </div>

                {log.log_photo && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />{t("weeklylogs.site_photo")}
                    </h4>
                    <img src={log.log_photo} alt={t("weeklylogs.site_photo")} className="w-full max-w-md rounded-lg border" />
                  </div>
                )}

                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-500">
                  <span>{t("logs.created_by")}: <strong>{getEngineerName(log.created_by)}</strong></span>
                  <span>{t("overview.created")}: {formatBSDate(log.created_at, lang)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getCookie(name) {
  let v = null;
  if (document.cookie) {
    for (const c of document.cookie.split(";")) {
      const t = c.trim();
      if (t.startsWith(name + "=")) { v = decodeURIComponent(t.slice(name.length + 1)); break; }
    }
  }
  return v;
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
        {Icon && <Icon className="w-4 h-4" />}{label}
      </h4>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}
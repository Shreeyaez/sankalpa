import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertTriangle, X, Plus, Edit, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { delayLogsAPI, projectsAPI, lookupsAPI, authAPI } from "../../api/axios";

export default function DelayLogs() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [delayLogs, setDelayLogs] = useState([]);
  const [project, setProject] = useState(null);
  const [delayTypes, setDelayTypes] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingLog, setEditingLog] = useState(null);

  useEffect(() => {
    // Guard: redirect if projectId is not a valid number
    if (!projectId || isNaN(projectId)) {
      navigate("/app/projects/delayed", { replace: true });
      return;
    }
    fetchAll();
  }, [projectId]);

  const fetchAll = async () => {
    try {
      const [logsRes, projectRes, delayTypesRes, userRes] = await Promise.allSettled([
        delayLogsAPI.list(projectId),
        projectsAPI.get(projectId),
        lookupsAPI.delayTypes(),
        authAPI.me(),
      ]);

      if (logsRes.status === "fulfilled") setDelayLogs(logsRes.value.data);
      else console.error("Logs fetch failed:", logsRes.reason);

      if (projectRes.status === "fulfilled") setProject(projectRes.value.data);
      else console.error("Project fetch failed:", projectRes.reason);

      if (delayTypesRes.status === "fulfilled") setDelayTypes(delayTypesRes.value.data);
      else console.error("Delay types fetch failed:", delayTypesRes.reason);

      if (userRes.status === "fulfilled") setCurrentUser(userRes.value.data);
      else console.error("User fetch failed:", userRes.reason);

    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this delay log?")) return;
    try {
      await delayLogsAPI.delete(id);
      setDelayLogs(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete delay log.");
    }
  };

  const handleSaved = (log, isEdit) => {
    if (isEdit) {
      setDelayLogs(prev => prev.map(l => l.id === log.id ? log : l));
    } else {
      setDelayLogs(prev => [log, ...prev]);
    }
    setShowModal(false);
    setEditingLog(null);
  };

  const statusColor = (s) => ({
    RESOLVED: "bg-green-100 text-green-800",
    ONGOING: "bg-yellow-100 text-yellow-800",
    CRITICAL: "bg-red-100 text-red-800",
  }[s] || "bg-gray-100 text-gray-800");

  const statusLabel = (s) => ({ RESOLVED: "Resolved", ONGOING: "Ongoing", CRITICAL: "Critical" }[s] || s);

  const delayTypeLabel = (id) => delayTypes.find(d => d.id === id)?.name || id;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/app/projects/delayed")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Back">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Delay Logs</h1>
          {project && <p className="text-sm text-gray-500 mt-0.5">{project.project_name}</p>}
        </div>
      </div>

      {/* No-log alert */}
      {delayLogs.length === 0 && project && (
        <div className="border border-red-400 bg-red-50 rounded-xl p-5 flex justify-between items-center">
          <div>
            <p className="font-semibold text-red-800">{project.project_name}</p>
            <p className="text-sm text-red-600 mt-0.5">No delay documentation found for this project.</p>
          </div>
          <button onClick={() => { setEditingLog(null); setShowModal(true); }}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg transition text-sm">
            Submit Delay Log
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Delay Logs" value={delayLogs.length} color="text-gray-900" />
        <StatCard label="Resolved" value={delayLogs.filter(l => l.status === "RESOLVED").length} color="text-green-600" />
        <StatCard label="Ongoing / Critical" value={delayLogs.filter(l => l.status !== "RESOLVED").length} color="text-yellow-600" />
      </div>

      {/* Table */}
      {delayLogs.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Log Date", "Delay Type", "Est. Days", "Progress", "Description", "Status", "Actions"].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {delayLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.log_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{delayTypeLabel(log.delay_type)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                      {log.estimated_days ?? "—"} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.progress_percent != null ? `${log.progress_percent}%` : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{log.delay_description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${statusColor(log.status)}`}>
                        {statusLabel(log.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingLog(log); setShowModal(true); }}
                          className="text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(log.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <DelayLogModal
          projectId={projectId}
          projectName={project?.project_name}
          delayTypes={delayTypes}
          currentUser={currentUser}
          editingLog={editingLog}
          onClose={() => { setShowModal(false); setEditingLog(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function DelayLogModal({ projectId, projectName, delayTypes, currentUser, editingLog, onClose, onSaved }) {
  const isEdit = Boolean(editingLog);

  const [formData, setFormData] = useState({
    log_date: editingLog?.log_date || "",
    delay_type: editingLog?.delay_type || "",
    estimated_days: editingLog?.estimated_days || "",
    progress_percent: editingLog?.progress_percent || "",
    delay_description: editingLog?.delay_description || "",
    actions_taken: editingLog?.actions_taken || "",
    impact_on_schedule: editingLog?.impact_on_schedule || "",
    status: editingLog?.status || "ONGOING",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      project: parseInt(projectId),
      reported_by: currentUser?.id || null,
      log_date: formData.log_date,
      delay_type: parseInt(formData.delay_type),
      estimated_days: formData.estimated_days ? parseInt(formData.estimated_days) : null,
      progress_percent: formData.progress_percent ? parseFloat(formData.progress_percent) : null,
      delay_description: formData.delay_description,
      actions_taken: formData.actions_taken,
      impact_on_schedule: formData.impact_on_schedule || "",
      status: formData.status,
    };

    try {
      const res = isEdit
        ? await delayLogsAPI.update(editingLog.id, payload)
        : await delayLogsAPI.create(payload);
      onSaved(res.data, isEdit);
    } catch (err) {
      console.error("Error saving delay log:", err);
      const data = err.response?.data;
      setError(
        data && typeof data === "object"
          ? Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" | ")
          : `Failed to ${isEdit ? "update" : "create"} delay log.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={22} />
            <h2 className="text-lg font-semibold">
              {isEdit ? "Edit Delay Log" : "Add Delay Log"}
              {projectName && <span className="text-gray-500 font-normal"> — {projectName}</span>}
            </h2>
          </div>
          <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded"><X size={20} /></button>
        </div>

        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">
          <strong>Important:</strong> Use this form to document any delays affecting the project timeline.
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <ModalInput label="Log Date *" type="date" name="log_date" value={formData.log_date} onChange={handleChange} required />

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Delay Type *</label>
            <select name="delay_type" value={formData.delay_type} onChange={handleChange} required
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="">Select Delay Type</option>
              {delayTypes.map(dt => <option key={dt.id} value={dt.id}>{dt.name}</option>)}
            </select>
          </div>

          <ModalInput label="Estimated Delay (Days)" type="number" name="estimated_days" value={formData.estimated_days} onChange={handleChange} placeholder="e.g., 15" min="0" />
          <ModalInput label="Current Progress (%)" type="number" name="progress_percent" value={formData.progress_percent} onChange={handleChange} placeholder="e.g., 65" min="0" max="100" />
          <ModalTextarea label="Delay Description *" name="delay_description" value={formData.delay_description} onChange={handleChange} placeholder="Provide detailed description..." required />
          <ModalTextarea label="Actions Taken *" name="actions_taken" value={formData.actions_taken} onChange={handleChange} placeholder="Describe corrective actions..." required />
          <ModalTextarea label="Impact on Schedule" name="impact_on_schedule" value={formData.impact_on_schedule} onChange={handleChange} placeholder="Describe schedule impact..." />

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select name="status" value={formData.status} onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="ONGOING">Ongoing</option>
              <option value="CRITICAL">Critical</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg transition font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition font-medium flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Saving..." : isEdit ? "Update Delay Log" : "Submit Delay Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <p className="text-sm text-gray-500 mb-1 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function ModalInput({ label, name, type = "text", placeholder, onChange, value, required, min, max }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input type={type} name={name} value={value} placeholder={placeholder}
        onChange={onChange} required={required} min={min} max={max}
        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
    </div>
  );
}

function ModalTextarea({ label, name, placeholder, onChange, value, required }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <textarea name={name} value={value} rows={4} placeholder={placeholder}
        onChange={onChange} required={required}
        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
    </div>
  );
}
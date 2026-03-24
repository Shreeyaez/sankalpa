import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, Eye, Loader2, X } from "lucide-react";
import api from "../../api/axios";

// ─── API helpers ─────────────────────────────────────────────────────────────
const measurementAPI = {
  list:   (pid)     => api.get(`finance/measurement-book/?project=${pid}`),
  create: (data)    => api.post(`finance/measurement-book/`, data),
  update: (id, data)=> api.put(`finance/measurement-book/${id}/`, data),
  delete: (id)      => api.delete(`finance/measurement-book/${id}/`),
};

const fmt = (n) =>
  new Intl.NumberFormat('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0);

const STATUS_COLOR = {
  VERIFIED: "bg-green-100 text-green-800",
  PENDING:  "bg-yellow-100 text-yellow-800",
  DRAFT:    "bg-gray-100 text-gray-800",
};
const CAT_COLOR = {
  EARTHWORK: "bg-orange-100 text-orange-800",
  PAVEMENT:  "bg-purple-100 text-purple-800",
  CONCRETE:  "bg-blue-100 text-blue-800",
  DRAINAGE:  "bg-cyan-100 text-cyan-800",
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProjectMeasurement() {
  const { projectId } = useParams();
  const { t } = useTranslation();
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editing, setEditing]           = useState(null);
  const [viewing, setViewing]           = useState(null);
  const [filter, setFilter]             = useState("ALL");

  useEffect(() => { load(); }, [projectId]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await measurementAPI.list(projectId);
      setMeasurements(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("measurement.delete_confirm"))) return;
    try {
      await measurementAPI.delete(id);
      setMeasurements(prev => prev.filter(m => m.id !== id));
    } catch { alert(t("measurement.delete_failed")); }
  };

  const handleSave = async (payload) => {
    try {
      if (editing) {
        await measurementAPI.update(editing.id, payload);
      } else {
        await measurementAPI.create(payload);
      }
      await load();
      setShowForm(false);
      setEditing(null);
    } catch (e) {
      const errData = e.response?.data;
      console.error("Save failed:", errData);
      throw e;
    }
  };

  const filtered = filter === "ALL" ? measurements : measurements.filter(m => m.status === filter);

  const counts = {
    total:         measurements.length,
    verified:      measurements.filter(m => m.status === "VERIFIED").length,
    pending:       measurements.filter(m => m.status === "PENDING").length,
    draft:         measurements.filter(m => m.status === "DRAFT").length,
    totalAmount:   measurements.reduce((s, m) => s + (Number(m.total_amount) || 0), 0),
    verifiedAmount: measurements
      .filter(m => m.status === "VERIFIED")
      .reduce((s, m) => s + (Number(m.total_amount) || 0), 0),
  };

  if (showForm) return (
    <MeasurementForm
      projectId={projectId}
      initial={editing}
      onSave={handleSave}
      onCancel={() => { setShowForm(false); setEditing(null); }}
    />
  );

  if (viewing) return (
    <MeasurementView item={viewing} onClose={() => setViewing(null)} />
  );

  if (loading) return (
    <div className="flex justify-center items-center h-40">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">{t("measurement.book")}</h3>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> {t("measurement.add")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: t("measurement.total_records"),   val: counts.total,                        cls: "text-gray-800",   isAmount: false },
          { label: t("measurement.verified"),        val: counts.verified,                     cls: "text-green-600",  isAmount: false },
          { label: t("measurement.pending"),         val: counts.pending,                      cls: "text-yellow-600", isAmount: false },
          { label: t("measurement.draft"),           val: counts.draft,                        cls: "text-gray-500",   isAmount: false },
          { label: t("measurement.total_amount"),    val: "NPR " + fmt(counts.totalAmount),    cls: "text-blue-600",   isAmount: true  },
          { label: t("measurement.verified_amount"), val: "NPR " + fmt(counts.verifiedAmount), cls: "text-green-700",  isAmount: true  },
        ].map(s => (
          <div key={s.label} className="bg-white p-4 rounded-lg shadow">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`font-bold ${s.cls} ${s.isAmount ? "text-sm" : "text-2xl"}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "VERIFIED", "PENDING", "DRAFT"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition ${
              filter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            {f === "ALL" ? t("all") : t(`measurement.${f.toLowerCase()}`)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {[
                t("measurement.mb_no"),
                t("measurement.date"),
                t("measurement.category"),
                t("measurement.items"),
                t("measurement.total_amount"),
                t("measurement.status"),
                t("actions"),
              ].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                  {t("measurement.empty")}
                </td>
              </tr>
            ) : filtered.map(m => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  MB-{String(m.id).padStart(4, '0')}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{m.date}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded font-medium ${CAT_COLOR[m.category] || "bg-gray-100 text-gray-800"}`}>
                    {m.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{m.items?.length || 0} {t("measurement.items")}</td>
                <td className="px-4 py-3 text-sm font-semibold text-blue-700">
                  NPR {fmt(m.total_amount)}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded font-medium ${STATUS_COLOR[m.status] || "bg-gray-100 text-gray-800"}`}>
                    {t(`measurement.${m.status.toLowerCase()}`)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setViewing(m)} title={t("view")}
                      className="text-gray-500 hover:text-gray-800 p-1 rounded hover:bg-gray-100">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setEditing(m); setShowForm(true); }} title={t("edit")}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(m.id)} title={t("delete")}
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                <td colSpan={4} className="px-4 py-2 text-sm font-semibold text-gray-700 text-right">
                  {filter === "ALL" ? t("total") : `${t(`measurement.${filter.toLowerCase()}`)} ${t("total")}`}
                </td>
                <td className="px-4 py-2 text-sm font-bold text-blue-700">
                  NPR {fmt(filtered.reduce((s, m) => s + (Number(m.total_amount) || 0), 0))}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

// ─── View details ─────────────────────────────────────────────────────────────
function MeasurementView({ item, onClose }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">MB-{String(item.id).padStart(4, '0')} — {t("measurement.details")}</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
      </div>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm border-b pb-4">
          <div><p className="text-gray-500">{t("measurement.date")}</p><p className="font-medium">{item.date}</p></div>
          <div><p className="text-gray-500">{t("measurement.category")}</p><p className="font-medium">{item.category}</p></div>
          <div><p className="text-gray-500">{t("measurement.status")}</p><p className="font-medium">{t(`measurement.${item.status.toLowerCase()}`)}</p></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["#", t("measurement.description"), t("measurement.nos"), "L", "B", "H",
                  t("measurement.quantity"), t("measurement.unit"), t("measurement.rate"), t("measurement.amount")
                ].map(h => (
                  <th key={h} className="px-3 py-2 text-left border font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(item.items || []).map((it, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2 border">{i + 1}</td>
                  <td className="px-3 py-2 border">{it.description}</td>
                  <td className="px-3 py-2 border">{it.nos}</td>
                  <td className="px-3 py-2 border">{it.length}</td>
                  <td className="px-3 py-2 border">{it.breadth}</td>
                  <td className="px-3 py-2 border">{it.height}</td>
                  <td className="px-3 py-2 border">{it.quantity}</td>
                  <td className="px-3 py-2 border">{it.unit}</td>
                  <td className="px-3 py-2 border">{fmt(it.rate)}</td>
                  <td className="px-3 py-2 border font-semibold text-blue-700">{fmt(it.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-blue-50 font-bold">
                <td colSpan={9} className="px-3 py-2 border text-right">{t("measurement.total_amount")}</td>
                <td className="px-3 py-2 border text-blue-700">NPR {fmt(item.total_amount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={onClose} className="px-6 py-2 border rounded text-gray-700 hover:bg-gray-50">{t("close")}</button>
      </div>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────
function MeasurementForm({ projectId, initial, onSave, onCancel }) {
  const { t } = useTranslation();
  const [header, setHeader] = useState({
    date:     initial?.date     || "",
    category: initial?.category || "",
    status:   initial?.status   || "DRAFT",
  });
  const [saveError, setSaveError] = useState(null);
  const [saving,    setSaving]    = useState(false);

  const [estimatedBudget, setEstimatedBudget] = useState(0);
  const [currentUsed,     setCurrentUsed]     = useState(0);

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const [absRes, mbRes, matRes] = await Promise.allSettled([
          api.get(`finance/abstract-record/?project=${projectId}`),
          api.get(`finance/measurement-book/?project=${projectId}`),
          api.get(`finance/materials/?project=${projectId}`),
        ]);
        if (absRes.status === "fulfilled") {
          const approved = (absRes.value.data || []).filter(a => a.status === "APPROVED");
          setEstimatedBudget(approved.reduce((s, a) => s + (Number(a.grand_total) || 0), 0));
        }
        if (mbRes.status === "fulfilled" && matRes.status === "fulfilled") {
          const verifiedMB  = (mbRes.value.data  || [])
            .filter(m => m.status === "VERIFIED" && m.id !== initial?.id)
            .reduce((s, m) => s + (Number(m.total_amount) || 0), 0);
          const deliveredMat = (matRes.value.data || [])
            .filter(m => m.status === "DELIVERED")
            .reduce((s, m) => s + (Number(m.grand_total) || 0), 0);
          setCurrentUsed(verifiedMB + deliveredMat);
        }
      } catch (e) {
        console.warn("Could not fetch budget context:", e);
      }
    };
    fetchBudget();
  }, [projectId, initial?.id]);

  const newRow = () => ({
    _key: Date.now() + Math.random(),
    description: "", nos: "1",
    length: "", breadth: "", height: "",
    quantity: 0, unit: "m³", rate: "", amount: 0,
  });

  const [rows, setRows] = useState(
    initial?.items?.length
      ? initial.items.map(r => ({ ...r, _key: r.id }))
      : [newRow()]
  );

  const updateRow = (key, field, val) => {
    setRows(prev => prev.map(r => {
      if (r._key !== key) return r;
      const u = { ...r, [field]: val };
      const nos = parseFloat(field === 'nos'     ? val : r.nos)     || 1;
      const l   = parseFloat(field === 'length'  ? val : r.length)  || 0;
      const b   = parseFloat(field === 'breadth' ? val : r.breadth) || 0;
      const h   = parseFloat(field === 'height'  ? val : r.height)  || 0;
      const rt  = parseFloat(field === 'rate'    ? val : r.rate)    || 0;
      let qty = nos;
      if (l) qty *= l;
      if (b) qty *= b;
      if (h) qty *= h;
      u.quantity = parseFloat(qty.toFixed(4));
      u.amount   = parseFloat((qty * rt).toFixed(2));
      return u;
    }));
  };

  const subtotal = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  const wouldExceedBudget = () => {
    if (estimatedBudget <= 0) return false;
    if (header.status !== "VERIFIED") return false;
    return (currentUsed + subtotal) > estimatedBudget;
  };
  const budgetOverage    = estimatedBudget > 0 ? (currentUsed + subtotal) - estimatedBudget : 0;
  const remainingBudget  = estimatedBudget - currentUsed;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError(null);
    if (!header.date || !header.category) {
      setSaveError(t("measurement.error_date_category"));
      return;
    }
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.description || !r.description.trim()) {
        setSaveError(t("measurement.error_description", { row: i + 1 }));
        return;
      }
      if (!r.rate || parseFloat(r.rate) <= 0) {
        setSaveError(t("measurement.error_rate", { row: i + 1 }));
        return;
      }
    }
    if (wouldExceedBudget()) {
      setSaveError(
        `${t("measurement.budget_exceed_error")}\n` +
        `${t("measurement.remaining_budget")}: NPR ${fmt(remainingBudget)} · ${t("measurement.over_by")}: NPR ${fmt(budgetOverage)}.\n` +
        t("measurement.budget_exceed_hint")
      );
      return;
    }
    const payload = {
      project:  parseInt(projectId),
      date:     header.date,
      category: header.category,
      status:   header.status,
      items: rows.map(({ _key, id, ...r }) => ({
        description: r.description.trim(),
        nos:      parseInt(r.nos)          || 1,
        length:   parseFloat(r.length)    || 0,
        breadth:  parseFloat(r.breadth)   || 0,
        height:   parseFloat(r.height)    || 0,
        quantity: parseFloat(r.quantity) > 0 ? parseFloat(r.quantity) : (parseInt(r.nos) || 1),
        unit:     r.unit                 || "m³",
        rate:     parseFloat(r.rate)     || 0,
        amount:   parseFloat(r.amount)   || 0,
      })),
    };
    try {
      setSaving(true);
      await onSave(payload);
    } catch (e) {
      const errData = e?.response?.data;
      if (errData && typeof errData === "object") {
        const lines = Object.entries(errData).map(([f, v]) => `${f}: ${Array.isArray(v) ? v.join(", ") : v}`);
        setSaveError(lines.join("\n"));
      } else {
        setSaveError(e?.message || t("measurement.save_failed"));
      }
    } finally {
      setSaving(false);
    }
  };

  const numCell = (key, field, ph, w = "w-16") => (
    <input type="number" step="any" placeholder={ph}
      value={rows.find(r => r._key === key)?.[field] ?? ""}
      onChange={e => updateRow(key, field, e.target.value)}
      className={`${w} px-1 py-1 text-sm rounded focus:ring-1 focus:ring-blue-400 border-0`}
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">
          {initial ? t("measurement.edit_entry") : t("measurement.new_entry")}
        </h3>
        <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("measurement.date")} *</label>
            <input type="date" required value={header.date}
              onChange={e => setHeader(p => ({ ...p, date: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("measurement.category")} *</label>
            <select required value={header.category}
              onChange={e => setHeader(p => ({ ...p, category: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
              <option value="">{t("form.select")}</option>
              {["EARTHWORK", "PAVEMENT", "CONCRETE", "DRAINAGE"].map(c =>
                <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("measurement.status")}</label>
            <select value={header.status}
              onChange={e => setHeader(p => ({ ...p, status: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
              {["DRAFT", "PENDING", "VERIFIED"].map(s =>
                <option key={s} value={s}>{t(`measurement.${s.toLowerCase()}`)}</option>
              )}
            </select>
          </div>
        </div>

        {/* Budget Status */}
        {estimatedBudget > 0 && (
          <div className={`rounded-lg border p-3 ${
            wouldExceedBudget()
              ? "bg-red-50 border-red-300"
              : (currentUsed + subtotal) > estimatedBudget * 0.8
              ? "bg-yellow-50 border-yellow-300"
              : "bg-green-50 border-green-200"
          }`}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-gray-700">{t("measurement.budget_status")}</span>
              <span className={`font-bold ${wouldExceedBudget() ? "text-red-600" : "text-green-700"}`}>
                {wouldExceedBudget()
                  ? `⛔ ${t("measurement.would_exceed")} NPR ${fmt(budgetOverage)}`
                  : `NPR ${fmt(Math.max(0, remainingBudget - subtotal))} ${t("measurement.remaining_after_save")}`}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
              <div className="bg-blue-500 h-full transition-all"
                style={{ width: `${Math.min((currentUsed / estimatedBudget) * 100, 100)}%` }} />
              <div className={`h-full transition-all ${wouldExceedBudget() ? "bg-red-500" : "bg-blue-300"}`}
                style={{ width: `${Math.min((subtotal / estimatedBudget) * 100, Math.max(0, 100 - (currentUsed / estimatedBudget) * 100))}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
              <span>{t("measurement.already_used")}: NPR {fmt(currentUsed)} · {t("measurement.this_entry")}: NPR {fmt(subtotal)}</span>
              <span>{t("measurement.approved_estimate")}: NPR {fmt(estimatedBudget)}</span>
            </div>
            {wouldExceedBudget() && header.status === "VERIFIED" && (
              <p className="text-xs text-red-600 font-semibold mt-1.5">
                ⚠ {t("measurement.cannot_verify")}
              </p>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "#",
                  t("measurement.description"),
                  t("measurement.nos"),
                  t("measurement.length"),
                  t("measurement.breadth"),
                  t("measurement.height"),
                  t("measurement.qty_auto"),
                  t("measurement.unit"),
                  t("measurement.rate"),
                  t("measurement.amount"),
                  ""
                ].map((h, i) => (
                  <th key={i} className="px-2 py-2 text-left border text-xs font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row._key} className="hover:bg-gray-50">
                  <td className="px-2 py-2 border text-center text-gray-500 text-xs">{idx + 1}</td>
                  <td className="px-2 py-2 border">
                    <input type="text" placeholder={t("measurement.description")} value={row.description}
                      onChange={e => updateRow(row._key, 'description', e.target.value)}
                      className="w-40 px-2 py-1 text-sm rounded focus:ring-1 focus:ring-blue-400 border-0" />
                  </td>
                  <td className="px-2 py-2 border">{numCell(row._key, 'nos',     '1',    'w-12')}</td>
                  <td className="px-2 py-2 border">{numCell(row._key, 'length',  '0.00', 'w-16')}</td>
                  <td className="px-2 py-2 border">{numCell(row._key, 'breadth', '0.00', 'w-16')}</td>
                  <td className="px-2 py-2 border">{numCell(row._key, 'height',  '0.00', 'w-16')}</td>
                  <td className="px-2 py-2 border bg-gray-50 text-sm font-medium text-gray-700">
                    {Number(row.quantity).toFixed(3)}
                  </td>
                  <td className="px-2 py-2 border">
                    <select value={row.unit} onChange={e => updateRow(row._key, 'unit', e.target.value)}
                      className="w-16 text-sm border-0 focus:ring-1 focus:ring-blue-400 rounded">
                      {["m³", "m²", "m", "kg", "nos", "ls"].map(u => <option key={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-2 border">{numCell(row._key, 'rate', '0.00', 'w-24')}</td>
                  <td className="px-2 py-2 border bg-blue-50 font-semibold text-blue-700 text-sm">
                    {fmt(row.amount)}
                  </td>
                  <td className="px-2 py-2 border text-center">
                    <button type="button" disabled={rows.length === 1}
                      onClick={() => setRows(r => r.filter(x => x._key !== row._key))}
                      className="text-red-500 hover:text-red-700 disabled:opacity-30">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button type="button" onClick={() => setRows(r => [...r, newRow()])}
          className="text-blue-600 hover:underline text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> {t("measurement.add_row")}
        </button>

        <div className="flex justify-end">
          <div className="w-72 border rounded-lg overflow-hidden">
            <div className="flex justify-between px-4 py-2 text-sm">
              <span className="text-gray-600">{t("measurement.subtotal")}</span>
              <span className="font-medium">NPR {fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between px-4 py-2 text-sm bg-gray-50">
              <span className="text-gray-600">{t("measurement.vat")}</span>
              <span className="font-medium">NPR {fmt(subtotal * 0.13)}</span>
            </div>
            <div className="flex justify-between px-4 py-3 text-sm bg-blue-600 text-white font-bold">
              <span>{t("measurement.grand_total")}</span>
              <span>NPR {fmt(subtotal * 1.13)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          {saveError && (
            <div className="flex-1 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700 whitespace-pre-line">
              {saveError}
            </div>
          )}
          <button type="button" onClick={onCancel}
            className="px-6 py-2 border rounded text-gray-700 hover:bg-gray-50">{t("cancel")}</button>
          <button type="submit" disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {t("measurement.save")}
          </button>
        </div>
      </form>
    </div>
  );
}
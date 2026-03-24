import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Trash2, Eye, Loader2, X } from "lucide-react";
import api from "../../api/axios";

const materialAPI = {
  list:   (pid)      => api.get(`finance/materials/?project=${pid}`),
  create: (data)     => api.post(`finance/materials/`, data),
  update: (id, data) => api.put(`finance/materials/${id}/`, data),
  delete: (id)       => api.delete(`finance/materials/${id}/`),
};

const fmt = (n) =>
  new Intl.NumberFormat('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0);

const STATUS_COLOR = {
  DELIVERED: "bg-green-100 text-green-800",
  ORDERED:   "bg-yellow-100 text-yellow-800",
  PENDING:   "bg-orange-100 text-orange-800",
};

export default function ProjectMaterials() {
  const { projectId } = useParams();
  const { t } = useTranslation();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [viewing, setViewing]     = useState(null);
  const [filter, setFilter]       = useState("ALL");

  useEffect(() => { load(); }, [projectId]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await materialAPI.list(projectId);
      setMaterials(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("msg.confirm_delete"))) return;
    try {
      await materialAPI.delete(id);
      setMaterials(prev => prev.filter(m => m.id !== id));
    } catch { alert(t("overview.failed_delete")); }
  };

  const handleSave = async (payload) => {
    try {
      if (editing) await materialAPI.update(editing.id, payload);
      else         await materialAPI.create(payload);
      await load();
      setShowForm(false);
      setEditing(null);
    } catch (e) {
      console.error(e.response?.data);
      alert(t("overview.failed_save"));
    }
  };

  const filtered = filter === "ALL" ? materials : materials.filter(m => m.status === filter);

  const counts = {
    total:           materials.length,
    delivered:       materials.filter(m => m.status === "DELIVERED").length,
    ordered:         materials.filter(m => m.status === "ORDERED").length,
    pending:         materials.filter(m => m.status === "PENDING").length,
    totalAmount:     materials.reduce((s, m) => s + (Number(m.grand_total) || 0), 0),
    deliveredAmount: materials.filter(m => m.status === "DELIVERED").reduce((s, m) => s + (Number(m.grand_total) || 0), 0),
  };

  if (showForm) return (
    <MaterialsForm projectId={projectId} initial={editing} onSave={handleSave}
      onCancel={() => { setShowForm(false); setEditing(null); }} />
  );

  if (viewing) return <MaterialsView item={viewing} onClose={() => setViewing(null)} />;

  if (loading) return (
    <div className="flex justify-center items-center h-40">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">{t("project.materials")}</h3>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> {t("materials.add")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: t("materials.total_records"),    val: counts.total,                         cls: "text-gray-800",   isAmount: false },
          { label: t("material.delivered"),         val: counts.delivered,                     cls: "text-green-600",  isAmount: false },
          { label: t("material.ordered"),           val: counts.ordered,                       cls: "text-yellow-600", isAmount: false },
          { label: t("measurement.pending"),        val: counts.pending,                       cls: "text-orange-500", isAmount: false },
          { label: t("materials.total_amount"),     val: "NPR " + fmt(counts.totalAmount),     cls: "text-blue-600",   isAmount: true  },
          { label: t("materials.delivered_amount"), val: "NPR " + fmt(counts.deliveredAmount), cls: "text-green-700",  isAmount: true  },
        ].map(s => (
          <div key={s.label} className="bg-white p-4 rounded-lg shadow">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`font-bold ${s.cls} ${s.isAmount ? "text-sm" : "text-2xl"}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "DELIVERED", "ORDERED", "PENDING"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition ${
              filter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            {f === "ALL" ? t("all") : t(`materials.status.${f.toLowerCase()}`)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {[t("materials.id"), t("date"), t("materials.items"), t("abstract.grand_total"), t("status"), t("actions")].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                  {t("materials.empty")}
                </td>
              </tr>
            ) : filtered.map(m => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">MAT-{String(m.id).padStart(4, '0')}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{m.date}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{m.items?.length || 0} {t("materials.items_suffix")}</td>
                <td className="px-4 py-3 text-sm font-semibold text-blue-700">NPR {fmt(m.grand_total)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded font-medium ${STATUS_COLOR[m.status] || "bg-gray-100 text-gray-800"}`}>
                    {t(`materials.status.${m.status.toLowerCase()}`)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setViewing(m)} title={t("view")} className="text-gray-500 hover:text-gray-800 p-1 rounded hover:bg-gray-100"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => { setEditing(m); setShowForm(true); }} title={t("edit")} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(m.id)} title={t("delete")} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                <td colSpan={3} className="px-4 py-2 text-sm font-semibold text-gray-700 text-right">
                  {filter === "ALL" ? t("total") : `${t(`materials.status.${filter.toLowerCase()}`)} ${t("total")}`}
                </td>
                <td className="px-4 py-2 text-sm font-bold text-blue-700">
                  NPR {fmt(filtered.reduce((s, m) => s + (Number(m.grand_total) || 0), 0))}
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

// ─── View ─────────────────────────────────────────────────────────────────────
function MaterialsView({ item, onClose }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">MAT-{String(item.id).padStart(4, '0')} — {t("materials.details")}</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
      </div>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
          <div><p className="text-gray-500">{t("date")}</p><p className="font-medium">{item.date}</p></div>
          <div><p className="text-gray-500">{t("status")}</p><p className="font-medium">{t(`materials.status.${item.status.toLowerCase()}`)}</p></div>
        </div>
        <table className="w-full border text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["#", t("material.name"), t("material.specification"), t("measurement.unit"), t("measurement.quantity"), t("material.unit_rate"), t("material.total")].map(h => (
                <th key={h} className="px-3 py-2 text-left border font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(item.items || []).map((it, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2 border">{i + 1}</td>
                <td className="px-3 py-2 border font-medium">{it.material_name}</td>
                <td className="px-3 py-2 border text-gray-600">{it.specification}</td>
                <td className="px-3 py-2 border">{it.unit}</td>
                <td className="px-3 py-2 border">{it.quantity}</td>
                <td className="px-3 py-2 border">NPR {fmt(it.unit_rate)}</td>
                <td className="px-3 py-2 border font-semibold text-blue-700">NPR {fmt(it.total_amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-blue-50 font-bold">
              <td colSpan={6} className="px-3 py-2 border text-right">{t("abstract.grand_total")}</td>
              <td className="px-3 py-2 border text-blue-700">NPR {fmt(item.grand_total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="flex justify-end">
        <button onClick={onClose} className="px-6 py-2 border rounded text-gray-700 hover:bg-gray-50">{t("close")}</button>
      </div>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────
function MaterialsForm({ projectId, initial, onSave, onCancel }) {
  const { t } = useTranslation();

  const [header, setHeader] = useState({
    date:   initial?.date   || "",
    status: initial?.status || "PENDING",
  });

  const newRow = () => ({
    _key: Date.now() + Math.random(),
    material_name: "", specification: "",
    unit: "bags", quantity: "", unit_rate: "", total_amount: 0,
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
      const qty  = parseFloat(field === 'quantity'  ? val : r.quantity)  || 0;
      const rate = parseFloat(field === 'unit_rate' ? val : r.unit_rate) || 0;
      u.total_amount = parseFloat((qty * rate).toFixed(2));
      return u;
    }));
  };

  const grandTotal = rows.reduce((s, r) => s + (Number(r.total_amount) || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!header.date) { alert(t("materials.date_required")); return; }
    const payload = {
      project: parseInt(projectId),
      date:    header.date,
      status:  header.status,
      items: rows.map(({ _key, ...r }) => ({
        material_name: r.material_name,
        specification: r.specification,
        unit:          r.unit,
        quantity:      parseFloat(r.quantity)    || 0,
        unit_rate:     parseFloat(r.unit_rate)   || 0,
        total_amount:  parseFloat(r.total_amount) || 0,
      })),
    };
    onSave(payload);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{initial ? t("edit") : t("add")} {t("project.materials")}</h3>
        <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("date")} *</label>
            <input type="date" required value={header.date}
              onChange={e => setHeader(p => ({ ...p, date: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("status")}</label>
            <select value={header.status}
              onChange={e => setHeader(p => ({ ...p, status: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
              {["PENDING", "ORDERED", "DELIVERED"].map(s =>
                <option key={s} value={s}>{t(`materials.status.${s.toLowerCase()}`)}</option>
              )}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["#", t("material.name"), t("material.specification"), t("measurement.unit"), t("measurement.quantity"), `${t("material.unit_rate")} (NPR)`, `${t("material.total")} (NPR)`, ""].map(h => (
                  <th key={h} className="px-3 py-2 text-left border text-xs font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row._key} className="hover:bg-gray-50">
                  <td className="px-2 py-2 border text-center text-gray-500 text-xs">{idx + 1}</td>
                  <td className="px-2 py-2 border">
                    <input type="text" placeholder={t("materials.cement_eg")} value={row.material_name}
                      onChange={e => updateRow(row._key, 'material_name', e.target.value)}
                      className="w-36 px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-400 rounded" />
                  </td>
                  <td className="px-2 py-2 border">
                    <input type="text" placeholder={t("materials.spec_eg")} value={row.specification}
                      onChange={e => updateRow(row._key, 'specification', e.target.value)}
                      className="w-36 px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-400 rounded" />
                  </td>
                  <td className="px-2 py-2 border">
                    <select value={row.unit} onChange={e => updateRow(row._key, 'unit', e.target.value)}
                      className="w-20 text-sm border-0 focus:ring-1 focus:ring-blue-400 rounded">
                      {["bags", "kg", "ton", "m³", "m²", "m", "pcs", "nos", "ls"].map(u =>
                        <option key={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-2 border">
                    <input type="number" step="any" placeholder="0" value={row.quantity}
                      onChange={e => updateRow(row._key, 'quantity', e.target.value)}
                      className="w-24 px-1 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-400 rounded" />
                  </td>
                  <td className="px-2 py-2 border">
                    <input type="number" step="any" placeholder="0.00" value={row.unit_rate}
                      onChange={e => updateRow(row._key, 'unit_rate', e.target.value)}
                      className="w-28 px-1 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-400 rounded" />
                  </td>
                  <td className="px-2 py-2 border bg-blue-50 font-semibold text-blue-700 text-sm">
                    {fmt(row.total_amount)}
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
          <Plus className="w-4 h-4" /> {t("materials.add_row")}
        </button>

        <div className="flex justify-end">
          <div className="w-64 border rounded-lg overflow-hidden">
            <div className="flex justify-between px-4 py-3 bg-blue-600 text-white font-bold">
              <span>{t("abstract.grand_total")}</span>
              <span>NPR {fmt(grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={onCancel} className="px-6 py-2 border rounded text-gray-700 hover:bg-gray-50">{t("cancel")}</button>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{t("materials.save")}</button>
        </div>
      </form>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Trash2, Eye, Loader2, X } from "lucide-react";
import api from "../../api/axios";

const abstractAPI = {
  list:   (pid)      => api.get(`finance/abstract-record/?project=${pid}`),
  create: (data)     => api.post(`finance/abstract-record/`, data),
  update: (id, data) => api.put(`finance/abstract-record/${id}/`, data),
  delete: (id)       => api.delete(`finance/abstract-record/${id}/`),
};

const fmt = (n) =>
  new Intl.NumberFormat('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(n) || 0);

const STATUS_COLOR = {
  APPROVED: "bg-green-100 text-green-800",
  PENDING:  "bg-yellow-100 text-yellow-800",
  DRAFT:    "bg-gray-100 text-gray-800",
};

export default function ProjectAbstract() {
  const { projectId } = useParams();
  const { t } = useTranslation();
  const [abstracts, setAbstracts] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [viewing, setViewing]     = useState(null);
  const [filter, setFilter]       = useState("ALL");

  useEffect(() => { load(); }, [projectId]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await abstractAPI.list(projectId);
      setAbstracts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("msg.confirm_delete"))) return;
    try {
      await abstractAPI.delete(id);
      setAbstracts(prev => prev.filter(a => a.id !== id));
    } catch { alert(t("overview.failed_delete")); }
  };

  const handleSave = async (payload) => {
    try {
      if (editing) {
        await abstractAPI.update(editing.id, payload);
      } else {
        await abstractAPI.create(payload);
      }
      await load();
      setShowForm(false);
      setEditing(null);
    } catch (e) {
      console.error(e.response?.data);
      alert(t("overview.failed_save"));
    }
  };

  const filtered = filter === "ALL" ? abstracts : abstracts.filter(a => a.status === filter);

  const counts = {
    total:          abstracts.length,
    approved:       abstracts.filter(a => a.status === "APPROVED").length,
    pending:        abstracts.filter(a => a.status === "PENDING").length,
    draft:          abstracts.filter(a => a.status === "DRAFT").length,
    totalAmount:    abstracts.reduce((s, a) => s + (Number(a.grand_total) || 0), 0),
    approvedAmount: abstracts
      .filter(a => a.status === "APPROVED")
      .reduce((s, a) => s + (Number(a.grand_total) || 0), 0),
  };

  if (showForm) return (
    <AbstractForm projectId={projectId} initial={editing} onSave={handleSave}
      onCancel={() => { setShowForm(false); setEditing(null); }} />
  );

  if (viewing) return (
    <AbstractView item={viewing} onClose={() => setViewing(null)} />
  );

  if (loading) return (
    <div className="flex justify-center items-center h-40">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">{t("project.abstract")}</h3>
        <button onClick={() => { setEditing(null); setShowForm(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> {t("abstract.create")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: t("measurement.total_records"),  val: counts.total,                         cls: "text-gray-800",   isAmount: false },
          { label: t("measurement.verified"),       val: counts.approved,                      cls: "text-green-600",  isAmount: false },
          { label: t("measurement.pending"),        val: counts.pending,                       cls: "text-yellow-600", isAmount: false },
          { label: t("measurement.draft"),          val: counts.draft,                         cls: "text-gray-500",   isAmount: false },
          { label: t("materials.total_amount"),     val: "NPR " + fmt(counts.totalAmount),     cls: "text-blue-600",   isAmount: true  },
          { label: t("overview.approved_estimates"),val: "NPR " + fmt(counts.approvedAmount),  cls: "text-green-700",  isAmount: true  },
        ].map(s => (
          <div key={s.label} className="bg-white p-4 rounded-lg shadow">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`font-bold ${s.cls} ${s.isAmount ? "text-sm" : "text-2xl"}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["ALL", "APPROVED", "PENDING", "DRAFT"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded text-sm font-medium transition ${
              filter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            {f === "ALL" ? t("all") :
             f === "APPROVED" ? t("measurement.verified") :
             f === "PENDING"  ? t("measurement.pending") :
                                t("measurement.draft")}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {[
                t("materials.id"), t("date"), t("materials.items"),
                t("abstract.subtotal"), `${t("abstract.vat")}`, `${t("abstract.contingency")}`,
                t("abstract.grand_total"), t("status"), t("actions")
              ].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                  {t("abstract.empty")}
                </td>
              </tr>
            ) : filtered.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">AC-{String(a.id).padStart(4, '0')}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{a.date}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{a.items?.length || 0} {t("materials.items_suffix")}</td>
                <td className="px-4 py-3 text-sm text-gray-700">NPR {fmt(a.subtotal)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">NPR {fmt(a.vat_amount)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">NPR {fmt(a.contingency_amount)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-blue-700">NPR {fmt(a.grand_total)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded font-medium ${STATUS_COLOR[a.status] || "bg-gray-100 text-gray-800"}`}>
                    {a.status === "APPROVED" ? t("measurement.verified") :
                     a.status === "PENDING"  ? t("measurement.pending") :
                                               t("measurement.draft")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setViewing(a)} title={t("view")}
                      className="text-gray-500 hover:text-gray-800 p-1 rounded hover:bg-gray-100"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => { setEditing(a); setShowForm(true); }} title={t("edit")}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(a.id)} title={t("delete")}
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                <td colSpan={3} className="px-4 py-2 text-sm font-semibold text-gray-700 text-right">
                  {filter === "ALL" ? t("total") : `${filter} ${t("total")}`}
                </td>
                <td className="px-4 py-2 text-sm font-bold text-gray-700">
                  NPR {fmt(filtered.reduce((s, a) => s + (Number(a.subtotal) || 0), 0))}
                </td>
                <td className="px-4 py-2 text-sm font-bold text-gray-700">
                  NPR {fmt(filtered.reduce((s, a) => s + (Number(a.vat_amount) || 0), 0))}
                </td>
                <td className="px-4 py-2 text-sm font-bold text-gray-700">
                  NPR {fmt(filtered.reduce((s, a) => s + (Number(a.contingency_amount) || 0), 0))}
                </td>
                <td className="px-4 py-2 text-sm font-bold text-blue-700">
                  NPR {fmt(filtered.reduce((s, a) => s + (Number(a.grand_total) || 0), 0))}
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
function AbstractView({ item, onClose }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">AC-{String(item.id).padStart(4, '0')} — {t("materials.details")}</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
      </div>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
          <div><p className="text-gray-500">{t("date")}</p><p className="font-medium">{item.date}</p></div>
          <div><p className="text-gray-500">{t("status")}</p><p className="font-medium">
            {item.status === "APPROVED" ? t("measurement.verified") :
             item.status === "PENDING"  ? t("measurement.pending") :
                                          t("measurement.draft")}
          </p></div>
        </div>

        <table className="w-full border text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["#", t("abstract.description"), t("measurement.unit"), t("measurement.quantity"), `${t("measurement.rate")}`, `${t("measurement.amount")}`].map(h => (
                <th key={h} className="px-3 py-2 text-left border font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(item.items || []).map((it, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2 border">{i + 1}</td>
                <td className="px-3 py-2 border">{it.description}</td>
                <td className="px-3 py-2 border">{it.unit}</td>
                <td className="px-3 py-2 border">{it.quantity}</td>
                <td className="px-3 py-2 border">{fmt(it.rate)}</td>
                <td className="px-3 py-2 border font-semibold">{fmt(it.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-72 border rounded-lg overflow-hidden text-sm">
            <div className="flex justify-between px-4 py-2 border-b">
              <span className="text-gray-600">{t("abstract.subtotal")}</span>
              <span className="font-medium">NPR {fmt(item.subtotal)}</span>
            </div>
            <div className="flex justify-between px-4 py-2 border-b bg-gray-50">
              <span className="text-gray-600">{t("abstract.vat")}</span>
              <span className="font-medium">NPR {fmt(item.vat_amount)}</span>
            </div>
            <div className="flex justify-between px-4 py-2 border-b bg-gray-50">
              <span className="text-gray-600">{t("abstract.contingency")}</span>
              <span className="font-medium">NPR {fmt(item.contingency_amount)}</span>
            </div>
            <div className="flex justify-between px-4 py-3 bg-blue-600 text-white font-bold">
              <span>{t("abstract.grand_total")}</span>
              <span>NPR {fmt(item.grand_total)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={onClose} className="px-6 py-2 border rounded text-gray-700 hover:bg-gray-50">{t("close")}</button>
      </div>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────
function AbstractForm({ projectId, initial, onSave, onCancel }) {
  const { t } = useTranslation();

  const [header, setHeader] = useState({
    date:   initial?.date   || "",
    status: initial?.status || "DRAFT",
  });

  const newRow = () => ({
    _key: Date.now() + Math.random(),
    description: "", unit: "m³", quantity: "", rate: "", amount: 0,
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
      const qty  = parseFloat(field === 'quantity' ? val : r.quantity) || 0;
      const rate = parseFloat(field === 'rate'     ? val : r.rate)     || 0;
      u.amount = parseFloat((qty * rate).toFixed(2));
      return u;
    }));
  };

  const subtotal    = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const vat         = subtotal * 0.13;
  const contingency = subtotal * 0.04;
  const grandTotal  = subtotal + vat + contingency;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!header.date) { alert(t("materials.date_required")); return; }
    const payload = {
      project: parseInt(projectId),
      date:    header.date,
      status:  header.status,
      items: rows.map(({ _key, ...r }) => ({
        description: r.description,
        unit:        r.unit,
        quantity:    parseFloat(r.quantity) || 0,
        rate:        parseFloat(r.rate)     || 0,
        amount:      parseFloat(r.amount)   || 0,
      })),
    };
    onSave(payload);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">
          {initial ? t("edit") : t("abstract.create")} — {t("project.abstract")}
        </h3>
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
              <option value="DRAFT">{t("measurement.draft")}</option>
              <option value="PENDING">{t("measurement.pending")}</option>
              <option value="APPROVED">{t("measurement.verified")}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["#", t("abstract.description"), t("measurement.unit"), t("measurement.quantity"), t("measurement.rate"), t("measurement.amount"), ""].map(h => (
                  <th key={h} className="px-3 py-2 text-left border text-xs font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row._key} className="hover:bg-gray-50">
                  <td className="px-2 py-2 border text-center text-gray-500 text-xs">{idx + 1}</td>
                  <td className="px-2 py-2 border">
                    <input type="text" placeholder={t("abstract.description")} value={row.description}
                      onChange={e => updateRow(row._key, 'description', e.target.value)}
                      className="w-52 px-2 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-400 rounded" />
                  </td>
                  <td className="px-2 py-2 border">
                    <select value={row.unit} onChange={e => updateRow(row._key, 'unit', e.target.value)}
                      className="w-20 text-sm border-0 focus:ring-1 focus:ring-blue-400 rounded">
                      {["m³", "m²", "m", "kg", "ton", "nos", "ls"].map(u => <option key={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-2 border">
                    <input type="number" step="any" placeholder="0" value={row.quantity}
                      onChange={e => updateRow(row._key, 'quantity', e.target.value)}
                      className="w-24 px-1 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-400 rounded" />
                  </td>
                  <td className="px-2 py-2 border">
                    <input type="number" step="any" placeholder="0.00" value={row.rate}
                      onChange={e => updateRow(row._key, 'rate', e.target.value)}
                      className="w-28 px-1 py-1 text-sm border-0 focus:ring-1 focus:ring-blue-400 rounded" />
                  </td>
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
          <div className="w-72 border rounded-lg overflow-hidden text-sm">
            <div className="flex justify-between px-4 py-2 border-b">
              <span className="text-gray-600">{t("abstract.subtotal")}</span>
              <span className="font-medium">NPR {fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between px-4 py-2 border-b bg-gray-50">
              <span className="text-gray-600">{t("abstract.vat")}</span>
              <span className="font-medium">NPR {fmt(vat)}</span>
            </div>
            <div className="flex justify-between px-4 py-2 border-b bg-gray-50">
              <span className="text-gray-600">{t("abstract.contingency")}</span>
              <span className="font-medium">NPR {fmt(contingency)}</span>
            </div>
            <div className="flex justify-between px-4 py-3 bg-blue-600 text-white font-bold">
              <span>{t("abstract.grand_total")}</span>
              <span>NPR {fmt(grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={onCancel}
            className="px-6 py-2 border rounded text-gray-700 hover:bg-gray-50">{t("cancel")}</button>
          <button type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{t("measurement.save")}</button>
        </div>
      </form>
    </div>
  );
}
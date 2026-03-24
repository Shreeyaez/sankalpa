import { useState, useEffect } from "react";
import { auditAPI } from "../api/axios";
import { Loader2, Shield, Search, Filter, Eye, X } from "lucide-react";

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    table: "",
    action: "",
  });
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => { fetchLogs(); }, []);

  useEffect(() => {
    let filtered = logs;
    if (filters.search) {
      filtered = filtered.filter(l =>
        l.table_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        l.changed_by?.full_name?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.table) filtered = filtered.filter(l => l.table_name === filters.table);
    if (filters.action) filtered = filtered.filter(l => l.action === filters.action);
    setFilteredLogs(filtered);
  }, [filters, logs]);

  const fetchLogs = async () => {
    try {
      const res = await auditAPI.list();
      setLogs(res.data);
      setFilteredLogs(res.data);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const uniqueTables = [...new Set(logs.map(l => l.table_name))].sort();

  const actionColor = (a) => ({
    INSERT: "bg-green-100 text-green-800",
    UPDATE: "bg-blue-100 text-blue-800",
    DELETE: "bg-red-100 text-red-800",
  }[a] || "bg-gray-100 text-gray-800");

  const formatDate = (str) => {
    if (!str) return "—";
    return new Date(str).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Audit Trail</h1>
          <p className="text-sm text-gray-500">Complete system activity log</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search table or user..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Table filter */}
          <select
            value={filters.table}
            onChange={(e) => setFilters(prev => ({ ...prev, table: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Tables</option>
            {uniqueTables.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Action filter */}
          <select
            value={filters.action}
            onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Actions</option>
            <option value="INSERT">Insert</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
          </select>
        </div>

        {(filters.search || filters.table || filters.action) && (
          <button
            onClick={() => setFilters({ search: "", table: "", action: "" })}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <X size={14} /> Clear filters
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Logs" value={logs.length} color="text-gray-900" />
        <StatCard label="Inserts" value={logs.filter(l => l.action === "INSERT").length} color="text-green-600" />
        <StatCard label="Updates" value={logs.filter(l => l.action === "UPDATE").length} color="text-blue-600" />
        <StatCard label="Deletes" value={logs.filter(l => l.action === "DELETE").length} color="text-red-600" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <Filter className="w-14 h-14 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No audit logs found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Timestamp","Table","Record ID","Action","Changed By",""].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(log.changed_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.table_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      #{log.record_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${actionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.changed_by?.full_name || `User #${log.changed_by}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}

/* ---- DETAIL MODAL ---- */

function LogDetailModal({ log, onClose }) {
  const parseData = (str) => {
    if (!str) return null;
    try { return JSON.parse(str); }
    catch { return str; }
  };

  const oldData = parseData(log.old_data);
  const newData = parseData(log.new_data);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Shield className="text-indigo-600" size={20} />
            <h2 className="text-lg font-semibold">Audit Log Details</h2>
          </div>
          <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <DetailRow label="Table" value={log.table_name} />
          <DetailRow label="Record ID" value={`#${log.record_id}`} />
          <DetailRow label="Action" value={log.action} />
          <DetailRow label="Changed By" value={log.changed_by?.full_name || `User #${log.changed_by}`} />
          <DetailRow label="Timestamp" value={new Date(log.changed_at).toLocaleString()} />

          {log.action === "UPDATE" && oldData && newData && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Changes</h3>
              <div className="space-y-2 bg-gray-50 rounded-lg p-4">
                {Object.keys(newData).map(key => {
                  const changed = JSON.stringify(oldData[key]) !== JSON.stringify(newData[key]);
                  if (!changed) return null;
                  return (
                    <div key={key} className="text-sm">
                      <span className="font-medium text-gray-600">{key}:</span>
                      <div className="ml-4 mt-1">
                        <div className="text-red-600">- {JSON.stringify(oldData[key])}</div>
                        <div className="text-green-600">+ {JSON.stringify(newData[key])}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {log.action === "INSERT" && newData && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">New Data</h3>
              <pre className="bg-gray-50 rounded-lg p-4 text-xs overflow-auto">
                {JSON.stringify(newData, null, 2)}
              </pre>
            </div>
          )}

          {log.action === "DELETE" && oldData && (
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Deleted Data</h3>
              <pre className="bg-gray-50 rounded-lg p-4 text-xs overflow-auto">
                {JSON.stringify(oldData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-sm font-medium text-gray-500 w-32 shrink-0">{label}:</span>
      <span className="text-sm text-gray-900 font-medium">{value}</span>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
      <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
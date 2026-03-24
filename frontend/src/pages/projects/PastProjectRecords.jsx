import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { pastProjectRecordsAPI } from "../../api/axios";
import {
  Loader2, Upload, FileSpreadsheet, Trash2,
  Download, Clock, AlertCircle
} from "lucide-react";

export default function PastProjectRecords() {
  const { t } = useTranslation();
  const [records, setRecords]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState(null);
  const [dragOver, setDragOver]   = useState(false);
  const fileInputRef              = useRef(null);

  useEffect(() => { fetchRecords(); }, []);

  const fetchRecords = async () => {
    try {
      const res = await pastProjectRecordsAPI.list();
      setRecords(res.data);
    } catch (err) {
      console.error("Error fetching records:", err);
      setError(t("records.load_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;

    const allowed = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv"
    ];
    if (!allowed.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError(t("records.invalid_file"));
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await pastProjectRecordsAPI.upload(formData);
      setRecords(prev => [res.data, ...prev]);
    } catch (err) {
      console.error("Upload error:", err);
      setError(t("records.upload_failed"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("records.delete_confirm"))) return;
    try {
      await pastProjectRecordsAPI.delete(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert(t("records.delete_failed"));
    }
  };

  const formatDate = (str) => {
    if (!str) return "—";
    return new Date(str).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  const getFileName = (url) => url?.split("/").pop() || "file";

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">

      {/* Header */}
      <div className="flex items-center gap-3">
        <FileSpreadsheet className="w-8 h-8 text-green-600" />
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{t("records.title")}</h1>
          <p className="text-sm text-gray-500">{t("records.subtitle")}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <AlertCircle size={16} className="shrink-0" />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl px-6 py-10 text-center cursor-pointer transition-all
          ${dragOver ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-green-400 hover:bg-gray-50"}
          ${uploading ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInput}
          className="hidden"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <p className="text-sm font-medium">{t("records.uploading")}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">
              {t("records.drag_drop")} <span className="text-green-600 underline">{t("records.browse")}</span>
            </p>
            <p className="text-xs text-gray-400">{t("records.supported")}</p>
          </div>
        )}
      </div>

      {/* Records List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <FileSpreadsheet className="w-14 h-14 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{t("records.empty_title")}</p>
          <p className="text-sm text-gray-400 mt-1">{t("records.empty_text")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">{t("records.uploaded_files")}</h2>
            <span className="text-xs text-gray-400">
              {records.length} {t("records.file_count")}
            </span>
          </div>
          <ul className="divide-y divide-gray-50">
            {records.map(record => (
              <li key={record.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                  <FileSpreadsheet size={20} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {getFileName(record.file)}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={11} className="text-gray-400" />
                    <p className="text-xs text-gray-400">{formatDate(record.uploaded_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={record.file}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                    title={t("view")}
                  >
                    <Download size={16} />
                  </a>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title={t("delete")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
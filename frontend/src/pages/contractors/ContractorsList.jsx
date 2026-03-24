import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Loader2, Briefcase, Eye, Pencil } from "lucide-react";
import { contractorsAPI } from "../../api/axios";

export default function ContractorsList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchContractors(); }, []);

  const fetchContractors = async () => {
    try {
      const res = await contractorsAPI.list();
      setContractors(res.data);
    } catch (err) {
      console.error("Error fetching contractors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("contractors.delete_confirm"))) {
      try {
        await contractorsAPI.delete(id);
        setContractors(prev => prev.filter(c => c.id !== id));
        alert(t("contractors.delete_success"));
      } catch (err) {
        console.error("Error deleting contractor:", err);
        alert(t("contractors.delete_failed"));
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-800">{t("contractors.title")}</h1>
        </div>
        <button
          onClick={() => navigate("/app/contractors/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t("contractors.add_btn")}
        </button>
      </div>

      {contractors.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("contractors.no_contractors")}</h3>
          <p className="text-gray-500 mb-4">{t("contractors.no_contractors_sub")}</p>
          <button
            onClick={() => navigate("/app/contractors/add")}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t("contractors.add_btn")}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("contractors.col_name")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("contractors.col_company")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("contractors.col_type")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("contractors.col_contact")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("contractors.col_suchidarta")}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contractors.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{c.contractor_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.company_name || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {t("contractors.col_type")} {c.contractor_type || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {c.contact_number || c.email || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {c.suchidarta_flagged ? (
                      <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
                        ✓ {t("contractors.active_approved")}
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs rounded-full bg-orange-100 text-orange-800 font-medium">
                        ⏳ {t("contractors.pending_approval")}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => navigate(`/app/contractors/${c.id}/view`)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title={t("view")}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/app/contractors/${c.id}/edit`)}
                        className="text-gray-400 hover:text-amber-500 transition-colors"
                        title={t("edit")}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title={t("delete")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Loader2, Users } from "lucide-react";
import { chairpersonsAPI } from "../../api/axios";

export default function ChairpersonsList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [chairpersons, setChairpersons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchChairpersons(); }, []);

  const fetchChairpersons = async () => {
    try {
      const response = await chairpersonsAPI.list();
      setChairpersons(response.data);
    } catch (error) {
      console.error("Error fetching chairpersons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("chairpersonlist.delete_confirm"))) {
      try {
        await chairpersonsAPI.delete(id);
        setChairpersons(chairpersons.filter(c => c.id !== id));
        alert(t("chairpersonlist.delete_success"));
      } catch (error) {
        console.error("Error deleting chairperson:", error);
        alert(t("chairpersonlist.delete_failed"));
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
          <Users className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-800">{t("nav.chairpersons")}</h1>
        </div>
        <button onClick={() => navigate("/app/chairpersons/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {t("chairperson.add_title")}
        </button>
      </div>

      {chairpersons.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("chairpersonlist.empty_title")}</h3>
          <p className="text-gray-500 mb-4">{t("chairpersonlist.empty_text")}</p>
          <button onClick={() => navigate("/app/chairpersons/add")}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t("chairperson.add_title")}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[t("contractors.col_name"), t("contractor.email"), t("chairperson.term_start"), t("chairperson.term_end"), t("actions")].map(h => (
                  <th key={h} className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase ${h === t("actions") ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {chairpersons.map((chairperson) => (
                <tr key={chairperson.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {chairperson.account?.full_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {chairperson.account?.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {chairperson.term_start || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {chairperson.term_end || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDelete(chairperson.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Loader2, XCircle, RotateCcw } from "lucide-react";
import { projectsAPI } from "../../api/axios";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../context/AuthContext";
import { canEdit } from "../../constants/userRoles.jsx";

export default function CancelledProjects() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userRole } = useAuth();
  const canWrite = canEdit(userRole);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.list();
      const cancelled = response.data.filter(p => p.status === "CANCELLED");
      setProjects(cancelled);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreProject = async (project) => {
    if (window.confirm(t("cancelled.restore_confirm", { name: project.project_name }))) {
      try {
        await projectsAPI.update(project.id, { ...project, status: "ONGOING" });
        fetchProjects();
        alert(t("cancelled.restore_success"));
      } catch (error) {
        console.error("Error restoring project:", error);
        alert(t("cancelled.restore_failed"));
      }
    }
  };

  const handlePermanentDelete = async (project) => {
    const userInput = prompt(t("cancelled.delete_confirm", { name: project.project_name, code: project.project_code }));
    if (userInput === project.project_code) {
      try {
        await projectsAPI.delete(project.id);
        fetchProjects();
        alert(t("cancelled.delete_success"));
      } catch (error) {
        console.error("Error deleting project:", error);
        alert(t("cancelled.delete_failed"));
      }
    } else if (userInput !== null) {
      alert(t("cancelled.delete_mismatch"));
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <XCircle className="w-8 h-8 text-gray-600" />
        <h1 className="text-2xl font-semibold text-gray-800">{t("cancelled.title")}</h1>
        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">{projects.length}</span>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800"><strong>{t("cancelled.info_note")}</strong> {t("cancelled.info_text")}</p>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("cancelled.empty_title")}</h3>
          <p className="text-gray-500">{t("cancelled.empty_text")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("project.code")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("project.name")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("project.location")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("contractor.name")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("cancelled.cancelled_date")}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{project.project_code}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">{project.project_name}</div>
                    <div className="text-xs text-gray-500">{project.municipality}, {t("location.ward")} {project.ward_no}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.location || t("form.select")}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.contractor?.contractor_name || t("overview.not_assigned")}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.updated_at ? new Date(project.updated_at).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {/* View — everyone */}
                      <button onClick={() => navigate(`/app/projects/${project.id}`)}
                        className="text-blue-600 hover:text-blue-900" title={t("view")}>
                        <Eye className="w-5 h-5" />
                      </button>
                      {/* Restore + Delete — admin/engineer only */}
                      {canWrite && (
                        <>
                          <button onClick={() => handleRestoreProject(project)}
                            className="text-green-600 hover:text-green-900" title={t("cancelled.restore")}>
                            <RotateCcw className="w-5 h-5" />
                          </button>
                          <button onClick={() => handlePermanentDelete(project)}
                            className="text-red-600 hover:text-red-900" title={t("cancelled.permanent_delete")}>
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
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
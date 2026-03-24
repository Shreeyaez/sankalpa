import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { projectsAPI } from "../../api/axios";
import { useTranslation } from 'react-i18next';
export default function CompletedProjects() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedProjects();
  }, []);

  const fetchCompletedProjects = async () => {
    try {
      const response = await projectsAPI.list();
      const completed = response.data.filter((p) => p.status === "COMPLETED");
      setProjects(completed);
    } catch (error) {
      console.error("Error fetching completed projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (projectId) => {
    navigate(`/app/projects/${projectId}/overview`, {
      state: { from: "completed" },
    });
  };

  const handleLogs = (projectId) => {
    navigate(`/app/projects/${projectId}/logs`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600 font-medium">{t("loading")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/app/projects")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title={t("back")}
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t("completed.title")}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {t("completed.count", { count: projects.length })}
          </p>
        </div>
      </div>

      {/* Empty State */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("completed.empty_title")}</h3>
          <p className="text-gray-500">{t("completed.empty_text")}</p>
        </div>
      ) : (
        /* Projects List */
        <div className="bg-white rounded-lg shadow">
          <div className="divide-y divide-gray-200">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4"
              >
                {/* Project Info */}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{project.project_name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {project.project_code} · {project.municipality}, {t("location.ward")} {project.ward_no}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleView(project.id)}
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    {t("view")}
                  </button>
                  <button
                    onClick={() => handleLogs(project.id)}
                    className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    {t("project.weekly_logs")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
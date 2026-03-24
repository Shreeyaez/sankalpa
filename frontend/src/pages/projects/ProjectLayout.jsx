import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  FileText, Ruler, FileSpreadsheet, 
  Package, BarChart3, Calendar, ArrowLeft 
} from "lucide-react";

export default function ProjectLayout() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId || isNaN(projectId)) {
      navigate("/app/projects");
      return;
    }
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/project/${projectId}/`, {
        credentials: "include",
      });
      const data = await response.json();
      setProject(data);
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { name: t("project.overview"),     path: "overview",    icon: FileText },
    { name: t("project.measurement"),  path: "measurement", icon: Ruler },
    { name: t("project.abstract"),     path: "abstract",    icon: FileSpreadsheet },
    { name: t("project.materials"),    path: "materials",   icon: Package },
    { name: t("project.gantt"),        path: "gantt",       icon: BarChart3 },
    { name: t("project.weekly_logs"),  path: "weekly-logs", icon: Calendar },
  ];

  const currentPath = location.pathname.split("/").pop();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/app/projects")}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {project?.project_name || t("project.all")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("project.code")}: {project?.project_code || "N/A"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.path === currentPath;
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(`/app/projects/${projectId}/${tab.path}`)}
                  className={`group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${isActive
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"}`} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
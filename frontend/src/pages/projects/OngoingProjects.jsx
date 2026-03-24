import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, Clock } from "lucide-react";

export default function OngoingProjects() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOngoing: 0,
    onTime: 0,
    delaying: 0
  });

  useEffect(() => {
    fetchOngoingProjects();
  }, []);

  const fetchOngoingProjects = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockAllProjects = [
        {
          id: 1,
          name: "Road Widening Project",
          projectCode: "PRJ-2024-001",
          location: { ward: "16", municipality: "Kathmandu", district: "Kathmandu" },
          contractor: { name: "ABC Builders" },
          schedule: {
            plannedStartDate: "2024-01-15",
            plannedCompletionDate: "2024-12-31",
            actualStartDate: "2024-01-15"
          },
          progress: 45
        },
        {
          id: 2,
          name: "Bridge Construction",
          projectCode: "PRJ-2024-002",
          location: { ward: "10", municipality: "Kathmandu", district: "Kathmandu" },
          contractor: { name: "Urban Infra" },
          schedule: {
            plannedStartDate: "2024-02-01",
            plannedCompletionDate: "2024-08-30",
            actualStartDate: "2024-02-01"
          },
          progress: 75
        },
        {
          id: 3,
          name: "Drainage System",
          projectCode: "PRJ-2024-003",
          location: { ward: "5", municipality: "Lalitpur", district: "Lalitpur" },
          contractor: { name: "City Constructors" },
          schedule: {
            plannedStartDate: "2024-01-10",
            plannedCompletionDate: "2024-06-30",
            actualStartDate: "2024-01-10"
          },
          progress: 55
        }
      ];

      const ongoingProjects = mockAllProjects.filter(project => {
        const startDate = new Date(project.schedule.plannedStartDate);
        const completionDate = new Date(project.schedule.plannedCompletionDate);
        startDate.setHours(0, 0, 0, 0);
        completionDate.setHours(0, 0, 0, 0);
        return today >= startDate && today <= completionDate && project.progress < 100;
      });

      const projectsWithStatus = ongoingProjects.map(project => {
        const completionDate = new Date(project.schedule.plannedCompletionDate);
        const startDate = new Date(project.schedule.plannedStartDate);
        completionDate.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);

        const totalDuration = completionDate - startDate;
        const elapsedTime = today - startDate;
        const expectedProgress = (elapsedTime / totalDuration) * 100;
        const isDelaying = project.progress < (expectedProgress - 10);

        return {
          ...project,
          expectedProgress: Math.round(expectedProgress),
          status: isDelaying ? "delaying" : "on-time"
        };
      });

      setProjects(projectsWithStatus);

      const onTimeCount = projectsWithStatus.filter(p => p.status === "on-time").length;
      const delayingCount = projectsWithStatus.filter(p => p.status === "delaying").length;

      setStats({
        totalOngoing: projectsWithStatus.length,
        onTime: onTimeCount,
        delaying: delayingCount
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching ongoing projects:", error);
      setLoading(false);
    }
  };

  const handleViewProject = (projectId) => {
    navigate(`/app/projects/${projectId}/overview`, { state: { from: 'ongoing' } });
  };

  const handleUpdateLog = (projectId) => {
    navigate(`/app/projects/${projectId}/weekly-logs`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">{t("ongoing.title")}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title={t("ongoing.total")}    value={stats.totalOngoing} color="bg-blue-50"  textColor="text-blue-600"  />
        <StatCard title={t("ongoing.on_time")}  value={stats.onTime}       color="bg-green-50" textColor="text-green-600" />
        <StatCard title={t("ongoing.delaying")} value={stats.delaying}     color="bg-red-50"   textColor="text-red-600"   />
      </div>

      {projects.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("ongoing.empty_title")}</h3>
          <p className="text-gray-500">{t("ongoing.empty_text")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y">
          {projects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              onView={handleViewProject}
              onUpdateLog={handleUpdateLog}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, color, textColor }) {
  return (
    <div className={`p-6 rounded-lg ${color}`}>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
}

function ProjectRow({ project, onView, onUpdateLog }) {
  const { t } = useTranslation();
  const isDelaying = project.status === "delaying";

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="font-semibold text-gray-900">{project.name}</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {project.projectCode}
          </span>
          <span className={`px-3 py-1 text-xs font-medium rounded ${isDelaying ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
            {isDelaying ? t("ongoing.delaying") : t("ongoing.on_time")}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-2">
          {t("location.ward")} {project.location.ward}, {project.location.municipality} • {project.contractor.name}
        </p>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">{t("project.progress")}</span>
              <span className="text-xs font-medium text-gray-900">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${isDelaying ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {t("ongoing.expected")}: {project.expectedProgress}%
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onUpdateLog(project.id)}
          className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          {t("ongoing.update_log")}
        </button>
        <button
          onClick={() => onView(project.id)}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          {t("ongoing.view_details")}
        </button>
      </div>
    </div>
  );
}
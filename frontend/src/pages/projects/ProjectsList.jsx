import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, XCircle, Loader2, FolderOpen, Pencil } from "lucide-react";
import { projectsAPI } from "../../api/axios";
import { useTranslation } from 'react-i18next';
export default function ProjectsList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const projectsRes = await projectsAPI.list();
      console.log("Projects data:", projectsRes.data);
      setProjects(projectsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const getContractorName = (project) => {
    if (project.contractor_details) {
      return project.contractor_details.contractor_name || 
             project.contractor_details.company_name || 
             t('msg.no_data');
    }
    return t('msg.no_data');
  };

  const getEngineerName = (project) => {
    if (project.assigned_engineer_details?.account?.full_name) {
      return project.assigned_engineer_details.account.full_name;
    }
    return t('msg.no_data');
  };

  const getChairpersonName = (project) => {
    if (project.chairperson_details?.account?.full_name) {
      return project.chairperson_details.account.full_name;
    }
    return t('msg.no_data');
  };

  const handleViewProject = (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/app/projects/${projectId}/overview`, {
      state: { from: 'all' }
    });
  };

  const handleEditProject = (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/app/projects/${projectId}/edit`);
  };

  const handleCancelProject = async (e, project) => {
    e.preventDefault();
    e.stopPropagation();
    
    const confirmMessage = `${t('msg.confirm_delete')} "${project.project_name}"?\n\n${t('project_cancel_info')}`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await projectsAPI.update(project.id, {
          ...project,
          status: "CANCELLED"
        });
        fetchData();
        alert(t('project_cancelled'));
      } catch (error) {
        console.error("Error cancelling project:", error);
        alert(t('failed_cancel'));
      }
    }
  };

  const getFilteredProjects = () => {
    if (filter === "ALL") return projects;
    return projects.filter(p => p.status === filter);
  };

  const getStatusBadge = (status) => {
    const badges = {
      COMING_SOON: { bg: "bg-blue-100", text: "text-blue-800", label: t('project.status.coming_soon') },
      ONGOING:     { bg: "bg-green-100", text: "text-green-800", label: t('project.status.ongoing') },
      DELAYED:     { bg: "bg-red-100", text: "text-red-800", label: t('project.status.delayed') },
      COMPLETED:   { bg: "bg-purple-100", text: "text-purple-800", label: t('project.status.completed') },
      CANCELLED:   { bg: "bg-gray-100", text: "text-gray-800", label: t('project.status.cancelled') }
    };
    const badge = badges[status] || badges.ONGOING;
    return (
      <span className={`px-3 py-1 text-xs rounded-full font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getStatusCounts = () => ({
    all:        projects.length,
    coming_soon: projects.filter(p => p.status === "COMING_SOON").length,
    ongoing:    projects.filter(p => p.status === "ONGOING").length,
    delayed:    projects.filter(p => p.status === "DELAYED").length,
    completed:  projects.filter(p => p.status === "COMPLETED").length,
    cancelled:  projects.filter(p => p.status === "CANCELLED").length,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const counts = getStatusCounts();
  const filteredProjects = getFilteredProjects();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FolderOpen className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-800">
            {t('project.all')}
          </h1>
        </div>
        <button
          onClick={() => navigate("/app/projects/add")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('project.add')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-3">
          <FilterButton label={t('all')} count={counts.all} isActive={filter === "ALL"} onClick={() => setFilter("ALL")} />
          <FilterButton label={t('project.status.coming_soon')} count={counts.coming_soon} isActive={filter === "COMING_SOON"} onClick={() => setFilter("COMING_SOON")} color="blue" />
          <FilterButton label={t('project.status.ongoing')} count={counts.ongoing} isActive={filter === "ONGOING"} onClick={() => setFilter("ONGOING")} color="green" />
          <FilterButton label={t('project.status.delayed')} count={counts.delayed} isActive={filter === "DELAYED"} onClick={() => setFilter("DELAYED")} color="red" />
          <FilterButton label={t('project.status.completed')} count={counts.completed} isActive={filter === "COMPLETED"} onClick={() => setFilter("COMPLETED")} color="purple" />
          <FilterButton label={t('project.status.cancelled')} count={counts.cancelled} isActive={filter === "CANCELLED"} onClick={() => setFilter("CANCELLED")} color="gray" />
        </div>
      </div>

      {/* Table */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {t('msg.no_data')}
          </h3>
          <p className="text-gray-500 mb-4">
            {filter === "ALL" ? t('get_started') : t('no_projects_status')}
          </p>
          {filter === "ALL" && (
            <button onClick={() => navigate("/app/projects/add")} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {t('project.add')}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('project.code')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('project.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('project.location')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('contractor.name')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('nav.engineers')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('nav.chairpersons')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{project.project_code}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">{project.project_name}</div>
                    <div className="text-xs text-gray-500">{project.municipality}, {t('location.ward')} {project.ward_no}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.location || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getContractorName(project)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getEngineerName(project)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getChairpersonName(project)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(project.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {/* View */}
                      <button
                        onClick={(e) => handleViewProject(e, project.id)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition"
                        title={t('view_details')}
                        type="button"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      {/* Edit — hidden for cancelled projects */}
                      {project.status !== "CANCELLED" && (
                        <button
                          onClick={(e) => handleEditProject(e, project.id)}
                          className="text-amber-600 hover:text-amber-900 p-1 hover:bg-amber-50 rounded transition"
                          title={t('edit_project')}
                          type="button"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                      )}

                      {/* Cancel — hidden for cancelled and completed projects */}
                      {project.status !== "CANCELLED" && project.status !== "COMPLETED" && (
                        <button
                          onClick={(e) => handleCancelProject(e, project)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition"
                          title={t('cancel_project')}
                          type="button"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
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

function FilterButton({ label, count, isActive, onClick, color = "gray" }) {
  const colors = {
    blue:   "border-blue-500 bg-blue-50 text-blue-700",
    green:  "border-green-500 bg-green-50 text-green-700",
    red:    "border-red-500 bg-red-50 text-red-700",
    purple: "border-purple-500 bg-purple-50 text-purple-700",
    gray:   "border-gray-500 bg-gray-50 text-gray-700",
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border-2 transition-all ${
        isActive ? colors[color] : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
      }`}
    >
      <span className="font-medium">{label}</span>
      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${isActive ? "bg-white bg-opacity-50" : "bg-gray-100"}`}>
        {count}
      </span>
    </button>
  );
}
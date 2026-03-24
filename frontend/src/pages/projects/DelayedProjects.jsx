import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, FileText, AlertTriangle, Clock } from "lucide-react";
import { projectsAPI } from "../../api/axios";

export default function DelayedProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDelayedProjects();
  }, []);

  const fetchDelayedProjects = async () => {
    try {
      setLoading(true);
      const res = await projectsAPI.list();
      const delayed = res.data.filter(p => p.status === "DELAYED");
      setProjects(delayed);
    } catch (err) {
      console.error("Error fetching delayed projects:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading delayed projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-800">Delayed Projects</h1>
        </div>
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-semibold">
          {projects.length} Projects
        </div>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <p className="text-gray-500">No delayed projects found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id}
              className="flex items-center justify-between bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">

              {/* Project Info */}
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-mono">{project.project_code}</p>
                <h3 className="font-semibold text-gray-900 mt-0.5">{project.project_name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {project.location} • Ward {project.ward_no}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/app/projects/${project.id}/overview`)}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  <Eye className="w-4 h-4" /> View
                </button>

                <button
                  onClick={() => navigate(`/app/projects/${project.id}/weekly-logs`)}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                >
                  <FileText className="w-4 h-4" /> Weekly Logs
                </button>

                <button
                  onClick={() => navigate(`/app/delay-logs/${project.id}`)}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                  <Clock className="w-4 h-4" /> Delay Logs
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
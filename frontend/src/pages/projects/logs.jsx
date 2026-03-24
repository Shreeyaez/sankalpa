import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Calendar, X } from "lucide-react";

export default function ProjectLogs() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchProjectLogs();
  }, [projectId]);

  const fetchProjectLogs = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get(`/projects/${projectId}/logs/`);
      
      const mockLogs = [
        {
          id: "WL-001",
          weekNumber: "Week 1",
          logDate: "2023-01-20",
          milestone: "Land Acquisition & Clearance",
          weatherConditions: "Sunny, 25°C",
          crewSize: 15,
          equipmentUsed: "Excavator, Roller, Paver",
          workProgressDetail: "Completed land clearing for section A. Removed vegetation and debris. Total area cleared: 2.5 hectares. All land acquisition formalities completed and documented.",
          issuesRisks: "Minor delay due to equipment maintenance resolved. All safety protocols implemented successfully.",
          planForTomorrow: "Completed as planned. Handover to next phase team scheduled.",
          sitePhotos: [
            "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1590586767908-20d6d1b6db58?w=400&h=300&fit=crop"
          ],
          milestoneCompleted: true,
          createdBy: "Site Engineer",
          createdAt: "2023-01-20"
        },
        {
          id: "WL-002",
          weekNumber: "Week 4",
          logDate: "2023-02-15",
          milestone: "Design & Engineering",
          weatherConditions: "Partly cloudy, 23°C",
          crewSize: 12,
          equipmentUsed: "Surveying equipment, AutoCAD stations",
          workProgressDetail: "Final design drawings approved. All engineering calculations verified. Structural design completed and submitted to authorities. Received all necessary approvals.",
          issuesRisks: "All design challenges resolved. No outstanding issues.",
          planForTomorrow: "Design phase completed. Documentation archived.",
          sitePhotos: [
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&h=300&fit=crop"
          ],
          milestoneCompleted: true,
          createdBy: "Design Team Lead",
          createdAt: "2023-02-15"
        },
        {
          id: "WL-003",
          weekNumber: "Week 30",
          logDate: "2023-10-12",
          milestone: "Final Inspection & Handover",
          weatherConditions: "Clear, 24°C",
          crewSize: 10,
          equipmentUsed: "Inspection equipment, Documentation tools",
          workProgressDetail: "Final inspection completed by authorities. All quality checks passed. Defect list addressed. Project acceptance certificate received. Handover documentation completed. Project successfully completed.",
          issuesRisks: "All inspections passed. Project completed successfully with no pending issues.",
          planForTomorrow: "Project completed and handed over. Demobilization in progress.",
          sitePhotos: [
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop"
          ],
          milestoneCompleted: true,
          createdBy: "Project Manager",
          createdAt: "2023-10-25"
        }
      ];

      setLogs(mockLogs);
      setProjectName("Ward Road Improvement Project");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching project logs:", error);
      setLoading(false);
    }
  };

  const handleViewLog = (log) => {
    setSelectedLog(log);
    setShowViewModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading project logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Project Logs (Completed)</h2>
            <p className="text-sm text-gray-500 mt-1">{projectName} - {logs.length} logs</p>
          </div>
        </div>
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
          Read Only
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">TOTAL LOGS</p>
          <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">MILESTONES COMPLETED</p>
          <p className="text-2xl font-bold text-green-600">
            {logs.filter(l => l.milestoneCompleted).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">TOTAL SITE PHOTOS</p>
          <p className="text-2xl font-bold text-blue-600">
            {logs.reduce((total, log) => total + log.sitePhotos.length, 0)}
          </p>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-lg shadow">
        <div className="divide-y divide-gray-200">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No logs available for this project.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <h3 className="font-semibold text-gray-900">{log.weekNumber}</h3>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600">{formatDate(log.logDate)}</span>
                      {log.milestoneCompleted && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                          Milestone Completed
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 font-medium mb-2 ml-8">
                      Milestone: {log.milestone}
                    </p>
                    
                    <div className="text-sm text-gray-600 ml-8 space-y-1">
                      <p><span className="font-medium">Weather:</span> {log.weatherConditions}</p>
                      <p><span className="font-medium">Crew Size:</span> {log.crewSize} workers</p>
                      <p className="line-clamp-2">{log.workProgressDetail}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewLog(log)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedLog.weekNumber} - Log Details</h2>
                <p className="text-sm text-gray-500">{formatDate(selectedLog.logDate)}</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Log Date</label>
                <p className="text-gray-900">{formatDate(selectedLog.logDate)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Milestone</label>
                <p className="text-gray-900">{selectedLog.milestone}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weather Conditions</label>
                <p className="text-gray-900">{selectedLog.weatherConditions}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crew Size</label>
                <p className="text-gray-900">{selectedLog.crewSize} workers</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Used</label>
                <p className="text-gray-900">{selectedLog.equipmentUsed}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Progress Detail</label>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedLog.workProgressDetail}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issues & Risks Encountered</label>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedLog.issuesRisks}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan for Tomorrow</label>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedLog.planForTomorrow}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Evidence / Photos</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedLog.sitePhotos.map((photo, idx) => (
                    <div key={idx} className="aspect-video rounded-lg overflow-hidden border">
                      <img 
                        src={photo} 
                        alt={`Site photo ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(photo, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedLog.milestoneCompleted}
                    disabled
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Milestone completed</span>
                </label>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Created by: <span className="font-medium text-gray-900">{selectedLog.createdBy}</span>
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
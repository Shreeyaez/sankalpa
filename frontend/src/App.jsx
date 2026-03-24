import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import './i18n';

import { AuthProvider } from "./context/AuthContext";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Login from "./auth/Login";
import RequireAuth from "./auth/RequireAuth";

import Dashboard from "./pages/Dashboard";

// PROJECTS
import ProjectsList from "./pages/projects/ProjectsList";
import OngoingProjects from "./pages/projects/OngoingProjects";
import CompletedProjects from "./pages/projects/CompletedProjects";
import DelayedProjects from "./pages/projects/DelayedProjects";
import CancelledProjects from "./pages/projects/CancelledProjects";
import AddProject from "./pages/projects/AddProject";
import EditProject from "./pages/projects/EditProject";

// PROJECT DETAILS
import ProjectLayout from "./pages/projects/ProjectLayout";
import ProjectOverview from "./pages/projects/ProjectOverview";
import ProjectMeasurement from "./pages/projects/ProjectMeasurement";
import ProjectAbstract from "./pages/projects/ProjectAbstract";
import ProjectMaterials from "./pages/projects/ProjectMaterials";
import ProjectGantt from "./pages/projects/ProjectGantt";
import WeeklyLogs from "./pages/projects/WeeklyLogs";

// CONTRACTORS
import ContractorsList from "./pages/contractors/ContractorsList";
import AddContractor from "./pages/contractors/AddContractor";
import ContractorDetails from "./pages/contractors/ContractorDetails";

// ENGINEERS
import EngineersList from "./pages/engineers/EngineersList";
import AddEngineer from "./pages/engineers/AddEngineer";
import EngineerDetails from "./pages/engineers/EngineerDetails";

// CHAIRPERSONS
import ChairpersonsList from "./pages/chairpersons/ChairpersonsList";
import AddChairperson from "./pages/chairpersons/AddChairperson";

// PAST PROJECT RECORDS
import PastProjectRecords from "./pages/projects/PastProjectRecords";

// DELAY LOGS
import DelayLogs from "./pages/delay/DelayLogs";
import DelayLogsList from "./pages/delay/DelayLogsList";

// AUDIT TRAIL
import AuditTrail from "./pages/AuditTrail";

function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 overflow-y-auto flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/app"
            element={
              <RequireAuth allowedRoles={["ADMIN", "USER"]}>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />

            <Route path="projects" element={<ProjectsList />} />
            <Route path="projects/ongoing" element={<OngoingProjects />} />
            <Route path="projects/completed" element={<CompletedProjects />} />
            <Route path="projects/delayed" element={<DelayedProjects />} />
            <Route path="projects/cancelled" element={<CancelledProjects />} />
            <Route path="projects/add" element={<AddProject />} />
            <Route path="projects/:projectId/edit" element={<EditProject />} />

            <Route path="projects/:projectId" element={<ProjectLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<ProjectOverview />} />
              <Route path="measurement" element={<ProjectMeasurement />} />
              <Route path="abstract" element={<ProjectAbstract />} />
              <Route path="materials" element={<ProjectMaterials />} />
              <Route path="gantt" element={<ProjectGantt />} />
              <Route path="weekly-logs" element={<WeeklyLogs />} />
            </Route>

            <Route path="delay-logs" element={<DelayLogsList />} />
            <Route path="delay-logs/:projectId" element={<DelayLogs />} />

            <Route path="contractors" element={<ContractorsList />} />
            <Route path="contractors/add" element={<AddContractor />} />
            <Route path="contractors/:id/view" element={<ContractorDetails />} />
            <Route path="contractors/:id/edit" element={<AddContractor />} />

            <Route path="engineers" element={<EngineersList />} />
            <Route path="engineers/add" element={<AddEngineer />} />
            <Route path="engineers/:id/view" element={<EngineerDetails />} />
            <Route path="engineers/:id/edit" element={<AddEngineer />} />

            <Route path="past-records" element={<PastProjectRecords />} />

            <Route path="chairpersons" element={<ChairpersonsList />} />
            <Route path="chairpersons/add" element={<AddChairperson />} />

            <Route path="audit" element={<AuditTrail />} />

            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
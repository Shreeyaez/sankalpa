import {
  BrowserRouter as Router, Routes, Route, Navigate, Outlet,
} from "react-router-dom";

import "./i18n";
import { AuthProvider } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Login from "./auth/Login";
import RequireAuth from "./auth/RequireAuth";
import { ROLES } from "./constants/userRoles.jsx";

import Dashboard from "./pages/Dashboard";

// PROJECTS
import ProjectsList       from "./pages/projects/ProjectsList";
import OngoingProjects    from "./pages/projects/OngoingProjects";
import CompletedProjects  from "./pages/projects/CompletedProjects";
import DelayedProjects    from "./pages/projects/DelayedProjects";
import CancelledProjects  from "./pages/projects/CancelledProjects";
import AddProject         from "./pages/projects/AddProject";
import EditProject        from "./pages/projects/EditProject";

// PROJECT DETAILS
import ProjectLayout      from "./pages/projects/ProjectLayout";
import ProjectOverview    from "./pages/projects/ProjectOverview";
import ProjectMeasurement from "./pages/projects/ProjectMeasurement";
import ProjectAbstract    from "./pages/projects/ProjectAbstract";
import ProjectMaterials   from "./pages/projects/ProjectMaterials";
import ProjectGantt       from "./pages/projects/ProjectGantt";
import WeeklyLogs         from "./pages/projects/WeeklyLogs";

// CONTRACTORS
import ContractorsList    from "./pages/contractors/ContractorsList";
import AddContractor      from "./pages/contractors/AddContractor";
import ContractorDetails  from "./pages/contractors/ContractorDetails";

// ENGINEERS
import EngineersList      from "./pages/engineers/EngineersList";
import AddEngineer        from "./pages/engineers/AddEngineer";
import EngineerDetails    from "./pages/engineers/EngineerDetails";

// CHAIRPERSONS
import ChairpersonsList   from "./pages/chairpersons/ChairpersonsList";
import AddChairperson     from "./pages/chairpersons/AddChairperson";

// PAST PROJECT RECORDS
import PastProjectRecords from "./pages/projects/PastProjectRecords";

// DELAY LOGS
import DelayLogs          from "./pages/delay/DelayLogs";
import DelayLogsList      from "./pages/delay/DelayLogsList";

// AUDIT TRAIL
import AuditTrail         from "./pages/AuditTrail";

// FINANCE
import FinanceLayout      from "./pages/dashboard/FinanceLayout";
import FinanceDashboard   from "./pages/dashboard/FinanceDashboard";
import BudgetReport       from "./pages/finance/BudgetReport";

import { isFinanceOnly }  from "./constants/userRoles.jsx";

// Role groups
const MAIN_APP_ROLES = [ROLES.ADMIN, ROLES.ENGINEER, ROLES.CHAIRPERSON, ROLES.USER];
const ADMIN_ENGINEER = [ROLES.ADMIN, ROLES.ENGINEER];
const ADMIN_ONLY     = [ROLES.ADMIN];
const AUDIT_ROLES     = [ROLES.ADMIN, ROLES.CHAIRPERSON];

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

          {/* ── Finance layout ── */}
          <Route
            path="/app/finance"
            element={
              <RequireAuth allowedRoles={[ROLES.FINANCE, ROLES.ADMIN]}>
                <FinanceLayout />
              </RequireAuth>
            }
          >
            <Route index             element={<FinanceDashboard />}   />
            <Route path="measurements" element={<ProjectMeasurement />} />
            <Route path="materials"    element={<ProjectMaterials />}   />
            <Route path="abstracts"    element={<ProjectAbstract />}    />
            <Route path="report"       element={<BudgetReport />}       />
          </Route>

          {/* ── Main app ── */}
          <Route
            path="/app"
            element={
              <RequireAuth allowedRoles={MAIN_APP_ROLES}>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />

            {/* Projects — all main app roles can VIEW */}
            <Route path="projects"           element={<ProjectsList />}      />
            <Route path="projects/ongoing"   element={<OngoingProjects />}   />
            <Route path="projects/completed" element={<CompletedProjects />} />
            <Route path="projects/delayed"   element={<DelayedProjects />}   />
            <Route path="projects/cancelled" element={<CancelledProjects />} />

            {/* Add/Edit — Admin + Engineer only */}
            <Route path="projects/add"
              element={<RequireAuth allowedRoles={ADMIN_ENGINEER}><AddProject /></RequireAuth>}
            />
            <Route path="projects/:projectId/edit"
              element={<RequireAuth allowedRoles={ADMIN_ENGINEER}><EditProject /></RequireAuth>}
            />

            {/* Project detail tabs — all roles can view */}
            <Route path="projects/:projectId" element={<ProjectLayout />}>
  <Route index element={<Navigate to="overview" replace />} />
  <Route path="overview"    element={<ProjectOverview />} />

  {/* Blocked for chairperson */}
  <Route path="measurement"
    element={<RequireAuth allowedRoles={ADMIN_ENGINEER}><ProjectMeasurement /></RequireAuth>}
  />
  <Route path="abstract"
    element={<RequireAuth allowedRoles={ADMIN_ENGINEER}><ProjectAbstract /></RequireAuth>}
  />
  <Route path="materials"
    element={<RequireAuth allowedRoles={ADMIN_ENGINEER}><ProjectMaterials /></RequireAuth>}
  />
  <Route path="weekly-logs"
    element={<RequireAuth allowedRoles={ADMIN_ENGINEER}><WeeklyLogs /></RequireAuth>}
  />
  <Route path="gantt" element={<ProjectGantt />} />
</Route>

            {/* Delay logs — all main app roles can view */}
            <Route path="delay-logs"
              element={<RequireAuth allowedRoles={ADMIN_ENGINEER}><DelayLogsList /></RequireAuth>}
            />
            <Route path="delay-logs/:projectId"
              element={<RequireAuth allowedRoles={ADMIN_ENGINEER}><DelayLogs /></RequireAuth>}
            />
            {/* Contractors — all can view, only Admin+Engineer can add/edit */}
            <Route path="contractors"          element={<ContractorsList />}   />
            <Route path="contractors/:id/view" element={<ContractorDetails />} />
            <Route path="contractors/add"
              element={<RequireAuth allowedRoles={ADMIN_ENGINEER}><AddContractor /></RequireAuth>}
            />
            <Route path="contractors/:id/edit"
              element={<RequireAuth allowedRoles={ADMIN_ENGINEER}><AddContractor /></RequireAuth>}
            />

            {/* Engineers — all can view, only Admin+Engineer can add/edit */}
            <Route path="engineers"
  element={<RequireAuth allowedRoles={ADMIN_ONLY}><EngineersList /></RequireAuth>}
/>
<Route path="engineers/add"
  element={<RequireAuth allowedRoles={ADMIN_ONLY}><AddEngineer /></RequireAuth>}
/>
<Route path="engineers/:id/view"
  element={<RequireAuth allowedRoles={ADMIN_ONLY}><EngineerDetails /></RequireAuth>}
/>
<Route path="engineers/:id/edit"
  element={<RequireAuth allowedRoles={ADMIN_ONLY}><AddEngineer /></RequireAuth>}
/>

            {/* Chairpersons — all can view, only Admin can add */}
            <Route path="chairpersons"
  element={<RequireAuth allowedRoles={ADMIN_ONLY}><ChairpersonsList /></RequireAuth>}
/>
<Route path="chairpersons/add"
  element={<RequireAuth allowedRoles={ADMIN_ONLY}><AddChairperson /></RequireAuth>}
/>

            {/* Past records — all can view */}
            <Route path="past-records" element={<PastProjectRecords />} />

            {/* Audit — Admin only */}
            <Route path="audit"
  element={<RequireAuth allowedRoles={[ROLES.ADMIN, ROLES.CHAIRPERSON]}><AuditTrail /></RequireAuth>}
/>

            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
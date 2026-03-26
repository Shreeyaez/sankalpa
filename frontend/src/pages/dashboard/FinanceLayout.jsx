import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, Receipt, Package, FileBarChart, PieChart, LogOut,
} from "lucide-react";
import Topbar from "../../components/Topbar";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard",          path: "/app/finance",              icon: LayoutDashboard, end: true },
  { label: "Measurement Books",  path: "/app/finance/measurements", icon: Receipt         },
  { label: "Materials",          path: "/app/finance/materials",    icon: Package         },
  { label: "Abstract Records",   path: "/app/finance/abstracts",    icon: FileBarChart    },
  { label: "Budget Report",      path: "/app/finance/report",       icon: PieChart        },
];

export default function FinanceLayout() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Topbar — same as rest of app */}
      <Topbar />

      {/* Finance tab nav */}
      <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="px-6">
          <nav className="flex gap-1 overflow-x-auto scrollbar-none">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-150 ${
                    isActive
                      ? "border-green-600 text-green-700"
                      : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                  }`
                }
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
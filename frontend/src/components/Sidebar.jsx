import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Briefcase, FolderKanban,
  Clock, LogOut, ChevronLeft, ChevronRight,
  Users, HardHat, FileSpreadsheet, ChevronDown, ChevronUp,
  Shield,
} from "lucide-react";
import { projectsAPI, delayLogsAPI } from "../api/axios";

const OFFICIALS_ITEMS = [
  { to: "/app/engineers", icon: HardHat, labelKey: "nav.engineers" },
  { to: "/app/chairpersons", icon: Users, labelKey: "nav.chairpersons" },
];

export default function Sidebar() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [officialsOpen, setOfficialsOpen] = useState(false);
  const [missingDelayLogs, setMissingDelayLogs] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMissingDelayLogsCount();
  }, []);

  const fetchMissingDelayLogsCount = async () => {
    try {
      const [projectsRes, logsRes] = await Promise.allSettled([
        projectsAPI.list(),
        delayLogsAPI.list(),
      ]);
      if (projectsRes.status !== "fulfilled" || logsRes.status !== "fulfilled") return;
      const delayedProjects = projectsRes.value.data.filter(p => p.status === "DELAYED");
      const delayLogs = logsRes.value.data;
      const projectsWithLogs = new Set(delayLogs.map(log => log.project));
      const missing = delayedProjects.filter(p => !projectsWithLogs.has(p.id)).length;
      setMissingDelayLogs(missing);
    } catch (err) {
      console.error("Failed to fetch delay log counts:", err);
    }
  };

  const NAV_ITEMS = [
    { to: "/app/dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard" },
    { to: "/app/projects", icon: FolderKanban, labelKey: "nav.projects" },
    { to: "/app/contractors", icon: Briefcase, labelKey: "nav.contractors" },
    { to: "/app/delay-logs", icon: Clock, labelKey: "nav.delay_logs", badge: missingDelayLogs },
    { to: "/app/past-records", icon: FileSpreadsheet, labelKey: "nav.past_records" },
    { to: "/app/audit", icon: Shield, labelKey: "nav.audit_trail" },
  ];

  const handleLogout = async () => {
    try {
      const csrf = document.cookie.split(';').find(c => c.trim().startsWith('csrftoken='))?.split('=')[1] || "";
      await fetch("/api/auth/logout/", {
        method: "POST",
        credentials: "include",
        headers: { "X-CSRFToken": csrf },
      });
    } catch (_) { }
    navigate("/login");
  };

  return (
    <aside className={`${collapsed ? "w-[68px]" : "w-60"} bg-[#062A4D] text-white flex flex-col transition-all duration-300 shrink-0`}>

      {/* LOGO */}
      <div className={`h-16 flex items-center border-b border-white/10 shrink-0 ${collapsed ? "justify-center px-0" : "justify-between px-5"}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-400/30 flex items-center justify-center">
              <FolderKanban size={15} className="text-blue-200" />
            </div>
            <span className="text-[15px] font-bold tracking-wide text-white">
              {t('app_name')}
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          title={collapsed ? t('expand') : t('collapse')}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-3 mb-2">
            {t('menu')}
          </p>
        )}

        {/* Main nav items */}
        {NAV_ITEMS.map(({ to, icon: Icon, labelKey, badge }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? t(labelKey) : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group relative
              ${isActive
                ? "bg-white/15 text-white font-medium"
                : "text-white/60 hover:bg-white/8 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-300 rounded-r-full" />
                )}
                <Icon size={17} className={`shrink-0 ${isActive ? "text-blue-300" : "text-white/50 group-hover:text-white/80"}`} />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{t(labelKey)}</span>
                    {badge > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                        {badge}
                      </span>
                    )}
                  </>
                )}
                {collapsed && badge > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Officials dropdown */}
        <div className="pt-1">
          {!collapsed ? (
            <>
              <button
                onClick={() => setOfficialsOpen(v => !v)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/8 hover:text-white transition-all duration-150"
              >
                <Users size={17} className="text-white/50 shrink-0" />
                <span className="flex-1 text-left truncate">{t('nav.officials')}</span>
                {officialsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {officialsOpen && (
                <div className="mt-0.5 ml-6 space-y-0.5 border-l border-white/10 pl-2">
                  {OFFICIALS_ITEMS.map(({ to, icon: Icon, labelKey }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150
                        ${isActive
                          ? "bg-white/15 text-white font-medium"
                          : "text-white/60 hover:bg-white/8 hover:text-white"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon size={15} className={`shrink-0 ${isActive ? "text-blue-300" : "text-white/50"}`} />
                          <span className="truncate">{t(labelKey)}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </>
          ) : (
            OFFICIALS_ITEMS.map(({ to, icon: Icon, labelKey }) => (
              <NavLink
                key={to}
                to={to}
                title={t(labelKey)}
                className={({ isActive }) =>
                  `flex items-center justify-center px-3 py-2.5 rounded-lg text-sm transition-all duration-150
                  ${isActive ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/8 hover:text-white"}`
                }
              >
                {({ isActive }) => (
                  <Icon size={17} className={isActive ? "text-blue-300" : "text-white/50"} />
                )}
              </NavLink>
            ))
          )}
        </div>
      </nav>

      {/* BOTTOM — logout only */}
      <div className="px-2 pb-4 border-t border-white/10 pt-3">
        <button
          onClick={handleLogout}
          title={collapsed ? t('nav.logout') : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-white/60 hover:bg-red-500/15 hover:text-red-300 transition-all duration-150 group"
        >
          <LogOut size={17} className="shrink-0 group-hover:text-red-300" />
          {!collapsed && <span>{t('nav.logout')}</span>}
        </button>
      </div>
    </aside>
  );
}
import { useEffect, useState, useRef } from "react";
import { Bell, X, CheckCheck, AlertCircle, Info, AlertTriangle, Globe } from "lucide-react";
import { useTranslation } from 'react-i18next';
export default function Topbar() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef(null);

  // Fetch current user
  useEffect(() => {
    fetch("/api/auth/me/", { credentials: "include" })
      .then(r => r.json())
      .then(data => setUser(data))
      .catch(() => {});
  }, []);

  // Fetch alerts
  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = () => {
    fetch("/api/alerts/alerts/", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.results ?? [];
        setAlerts(list);
        setUnreadCount(list.filter(a => !a.is_read).length);
      })
      .catch(() => {});
  };

  // Close panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowPanel(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAsRead = async (id) => {
    await fetch(`/api/alerts/alerts/${id}/`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCsrf(),
      },
      body: JSON.stringify({ is_read: true }),
    });
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    const unread = alerts.filter(a => !a.is_read);
    await Promise.all(unread.map(a => markAsRead(a.id)));
  };

  const getCsrf = () =>
    document.cookie.split(';').find(c => c.trim().startsWith('csrftoken='))?.split('=')[1] || "";

  const getAlertIcon = (type) => {
    switch (String(type)) {
      case "1": return <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />;
      case "2": return <AlertTriangle size={15} className="text-yellow-500 shrink-0 mt-0.5" />;
      default:  return <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />;
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return t('time.just_now');
    if (diff < 3600) return `${Math.floor(diff / 60)}${t('time.minutes_ago')}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}${t('time.hours_ago')}`;
    return `${Math.floor(diff / 86400)}${t('time.days_ago')}`;
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ne' : 'en';
    i18n.changeLanguage(newLang);
  };

  const initials = user?.full_name
    ? user.full_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <header className="h-16 bg-white flex items-center justify-between px-6 border-b border-gray-100 z-30 relative">

      {/* Left — greeting */}
      <div>
        <h1 className="text-base font-semibold text-gray-800 leading-tight">
          {user ? `${t('welcome_back')}, ${user.full_name.split(" ")[0]} 👋` : `${t('welcome')} 👋`}
        </h1>
        <p className="text-xs text-gray-400">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3" ref={panelRef}>

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
          title={t('change_language')}
        >
          <Globe className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {i18n.language === 'en' ? 'नेपाली' : 'English'}
          </span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowPanel(v => !v)}
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            title={t('notifications')}
          >
            <Bell size={19} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {showPanel && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-800">{t('notifications')}</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {unreadCount} {t('new')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} title={t('mark_all_read')}
                      className="text-blue-600 hover:text-blue-800 transition-colors">
                      <CheckCheck size={16} />
                    </button>
                  )}
                  <button onClick={() => setShowPanel(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Alert List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <Bell size={28} className="mb-2 opacity-30" />
                    <p className="text-sm">{t('no_notifications')}</p>
                  </div>
                ) : (
                  alerts.map(alert => (
                    <div
                      key={alert.id}
                      onClick={() => !alert.is_read && markAsRead(alert.id)}
                      className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                        !alert.is_read ? "bg-blue-50/60" : ""
                      }`}
                    >
                      {getAlertIcon(alert.alert_type)}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-snug ${!alert.is_read ? "font-medium text-gray-800" : "text-gray-600"}`}>
                          {alert.message}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {alert.created_at ? timeAgo(alert.created_at) : ""}
                        </p>
                      </div>
                      {!alert.is_read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* User Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="text-sm leading-tight">
            <p className="font-medium text-gray-800 whitespace-nowrap">
              {user?.full_name ?? t('loading')}
            </p>
            <p className="text-xs text-gray-400 capitalize">
              {user?.role?.toLowerCase() ?? ""}
            </p>
          </div>
        </div>

      </div>
    </header>
  );
}
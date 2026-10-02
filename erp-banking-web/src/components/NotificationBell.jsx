import { Bell, CheckCheck } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";
import "../styles/notification.css";

function timeAgo(dateStr) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const min = Math.floor(diffMs / 60000);

  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;

  const hours = Math.floor(min / 60);
  if (hours < 24) return `il y a ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days} j`;

  return date.toLocaleDateString("fr-FR");
}

function NotificationBell() {
  const navigate = useNavigate();
  const {
    notifications,
    unread,
    loading,
    open,
    toggleOpen,
    close,
    markRead,
    markAllRead,
  } = useNotifications();

  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        close();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open, close]);

  const handleItemClick = (notification) => {
    if (!notification.lu) markRead(notification.id);
    close();
    if (notification.lien && notification.lien.startsWith("/")) {
      navigate(notification.lien);
    }
  };

  return (
    <div className="notification-wrap" ref={wrapRef}>
      <button
        className="notification"
        onClick={toggleOpen}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="icon" size={20} />
        {unread > 0 && (
          <span className="badge">{unread > 99 ? "99+" : unread}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <strong>Notifications</strong>
            {unread > 0 && (
              <button className="mark-all-btn" onClick={markAllRead}>
                <CheckCheck size={14} />
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading && notifications.length === 0 ? (
              <div className="notification-empty">Chargement…</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">Aucune notification</div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={`notification-item ${
                    notification.lu ? "" : "unread"
                  }`}
                  onClick={() => handleItemClick(notification)}
                >
                  <span className="notification-emoji">
                    {notification.emoji || "🔔"}
                  </span>

                  <span className="notification-content">
                    <span className="notification-message">
                      {notification.message}
                    </span>
                    <span className="notification-time">
                      {timeAgo(notification.dateCreation)}
                    </span>
                  </span>

                  {!notification.lu && <span className="notification-dot" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
import React from 'react';
import { useOSStore, ToastNotification } from '../../store/useOSStore';
import { PORTFOLIO_META } from '../../data/config';
import { Bell, Trophy, CheckCircle, Info, AlertTriangle, AlertCircle, X, Trash2, ExternalLink } from 'lucide-react';

const TYPE_ICON: Record<ToastNotification['type'], React.ElementType> = {
  achievement: Trophy,
  success:     CheckCircle,
  warning:     AlertTriangle,
  info:        Info,
  error:       AlertCircle,
};

interface Props {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: Props) {
  const { notifications, dismissNotification, clearNotifications, theme, openWindow } = useOSStore();

  const isLight = theme === 'light';
  const panelBg = isLight
    ? 'bg-white/95 border-gray-200 text-gray-800'
    : 'bg-[#0f0c20]/95 border-white/10 text-purple-100';
  const itemBg = isLight
    ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
    : 'bg-white/5 border-white/10 hover:bg-white/10';

  const handleNotificationClick = (notif: ToastNotification) => {
    if (notif.action) {
      if (notif.action.startsWith('http://') || notif.action.startsWith('https://')) {
        window.open(notif.action, '_blank', 'noopener,noreferrer');
      } else if (notif.action === 'github') {
        window.open(PORTFOLIO_META.github, '_blank', 'noopener,noreferrer');
      } else if (notif.action === 'linkedin') {
        window.open(PORTFOLIO_META.linkedin, '_blank', 'noopener,noreferrer');
      } else {
        openWindow(notif.action, true);
      }
    }
    dismissNotification(notif.id);
    onClose();
  };

  return (
    <div
      id="notification-drawer"
      className={`fixed right-4 top-14 w-88 max-w-[calc(100vw-2rem)] max-h-[82vh] flex flex-col rounded-2xl border shadow-2xl z-10000 backdrop-blur-3xl overflow-hidden ${panelBg} animate-slide-up`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isLight ? 'border-gray-200' : 'border-white/10'} shrink-0`}>
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider">Notifications</h3>
          {notifications.length > 0 && (
            <span className="bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {notifications.length}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {notifications.length > 0 && (
            <button
              onClick={() => clearNotifications()}
              className="flex items-center space-x-1 text-[10px] text-gray-400 hover:text-red-400 transition"
              title="Clear all"
              aria-label="Clear all notifications"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition" aria-label="Close notifications panel">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="grow overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3 text-center">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-400 opacity-50" />
            </div>
            <p className="text-xs text-gray-500 text-center">No notifications yet.<br />Explore the OS to unlock events.</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const TypeIcon = TYPE_ICON[notif.type];
            return (
              <div
                key={notif.id}
                role="button"
                tabIndex={0}
                aria-label={`${notif.title}. ${notif.message}${notif.action ? ' Activate to open.' : ' Activate to dismiss.'}`}
                onClick={() => handleNotificationClick(notif)}
                onKeyDown={(e) => {
                  if (e.target !== e.currentTarget) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNotificationClick(notif);
                  } else if (e.key === 'Delete' || e.key === 'Backspace') {
                    e.preventDefault();
                    dismissNotification(notif.id);
                  }
                }}
                className={`relative p-3 rounded-xl border flex flex-col space-y-1.5 group transition cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-purple-400 ${itemBg} ${
                  notif.type === 'achievement' ? 'border-yellow-500/25 shadow-[0_0_10px_rgba(234,179,8,0.05)]' : ''
                } ${notif.action ? 'hover:ring-1 hover:ring-purple-400/30' : ''}`}
              >
                {/* Dismiss button: always visible on touch screens; on hover devices shown on hover or focus */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissNotification(notif.id);
                  }}
                  className="absolute top-2 right-2 p-0.5 rounded-md opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-purple-400 text-gray-400 hover:text-white hover:bg-white/10 transition"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Title Row */}
                <div className="flex items-center space-x-2 pr-5">
                  <TypeIcon className={`w-3.5 h-3.5 shrink-0 ${
                    notif.type === 'achievement' ? 'text-yellow-400' :
                    notif.type === 'success'     ? 'text-emerald-400' :
                    notif.type === 'warning'     ? 'text-amber-400' :
                    notif.type === 'error'       ? 'text-rose-400' : 'text-blue-400'
                  }`} />
                  <span className="text-[11px] font-bold leading-tight">{notif.title}</span>
                  {notif.action && <ExternalLink className="w-2.5 h-2.5 text-gray-400 ml-auto" />}
                </div>

                {/* Message */}
                <p className="text-[10px] text-gray-400 leading-normal pl-5">{notif.message}</p>

                {/* Footer */}
                <div className="flex items-center justify-end pl-5 pt-0.5">
                  <span className="text-[8px] text-gray-500">{notif.timestamp}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tip Footer */}
      {notifications.length === 0 && (
        <div className={`px-4 py-2.5 text-[9px] text-center border-t ${isLight ? 'border-gray-100 text-gray-400' : 'border-white/5 text-gray-600'} shrink-0`}>
          Explore apps, run commands, play games — earn events!
        </div>
      )}
    </div>
  );
}

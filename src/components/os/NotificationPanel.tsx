import React, { useState } from 'react';
import { useOSStore, ToastNotification } from '../../store/useOSStore';
import { Bell, Trophy, CheckCircle, Info, AlertTriangle, Gamepad2, Briefcase, Globe, Laugh, X, Trash2 } from 'lucide-react';

const CATEGORY_META: Record<ToastNotification['category'], { label: string; icon: React.ElementType; color: string }> = {
  system:    { label: 'System',    icon: Info,       color: 'text-blue-400'   },
  career:    { label: 'Career',    icon: Briefcase,  color: 'text-cyan-400'   },
  portfolio: { label: 'Portfolio', icon: Globe,      color: 'text-purple-400' },
  gaming:    { label: 'Gaming',    icon: Gamepad2,   color: 'text-emerald-400'},
  social:    { label: 'Social',    icon: Bell,       color: 'text-pink-400'   },
  funny:     { label: 'Funny',     icon: Laugh,      color: 'text-amber-400'  },
};

const TYPE_ICON: Record<ToastNotification['type'], React.ElementType> = {
  achievement: Trophy,
  success:     CheckCircle,
  warning:     AlertTriangle,
  info:        Info,
};

interface Props {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: Props) {
  const { notifications, dismissNotification, clearNotifications, theme } = useOSStore();
  const [activeFilter, setActiveFilter] = useState<'all' | ToastNotification['category']>('all');

  const isLight = theme === 'light';
  const panelBg = isLight
    ? 'bg-white/95 border-gray-200 text-gray-800'
    : 'bg-[#0f0c20]/95 border-white/10 text-purple-100';
  const itemBg = isLight
    ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
    : 'bg-white/5 border-white/8 hover:bg-white/10';

  const filtered = activeFilter === 'all'
    ? notifications
    : notifications.filter((n) => n.category === activeFilter);

  const categories = Array.from(new Set(notifications.map((n) => n.category)));

  return (
    <div
      id="notification-drawer"
      className={`fixed right-4 top-14 w-88 max-h-[82vh] flex flex-col rounded-2xl border shadow-2xl z-[10000] backdrop-blur-3xl overflow-hidden ${panelBg} animate-slide-up`}
      style={{ width: '22rem' }}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isLight ? 'border-gray-200' : 'border-white/8'} shrink-0`}>
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
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      {categories.length > 0 && (
        <div className={`flex items-center space-x-1 px-3 py-2 overflow-x-auto border-b ${isLight ? 'border-gray-100' : 'border-white/5'} shrink-0`}>
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-full text-[9px] font-bold whitespace-nowrap transition ${
              activeFilter === 'all'
                ? 'bg-purple-600 text-white'
                : isLight ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            All ({notifications.length})
          </button>
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat];
            const Icon = meta.icon;
            const count = notifications.filter((n) => n.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[9px] font-bold whitespace-nowrap transition ${
                  activeFilter === cat
                    ? 'bg-purple-600 text-white'
                    : isLight ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <Icon className={`w-2.5 h-2.5 ${activeFilter === cat ? 'text-white' : meta.color}`} />
                <span>{meta.label} ({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Notification List */}
      <div className="flex-grow overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3 text-center">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-400 opacity-50" />
            </div>
            <p className="text-xs text-gray-500">No notifications yet.<br />Explore the OS to unlock events.</p>
          </div>
        ) : (
          filtered.map((notif) => {
            const TypeIcon = TYPE_ICON[notif.type];
            const catMeta  = CATEGORY_META[notif.category];
            const CatIcon  = catMeta.icon;
            return (
              <div
                key={notif.id}
                className={`relative p-3 rounded-xl border flex flex-col space-y-1.5 group transition ${itemBg} ${
                  notif.type === 'achievement' ? 'border-yellow-500/25 shadow-[0_0_10px_rgba(234,179,8,0.05)]' : ''
                }`}
              >
                {/* Dismiss button */}
                <button
                  onClick={() => dismissNotification(notif.id)}
                  className="absolute top-2 right-2 p-0.5 rounded-md opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Title Row */}
                <div className="flex items-center space-x-2 pr-5">
                  <TypeIcon className={`w-3.5 h-3.5 shrink-0 ${
                    notif.type === 'achievement' ? 'text-yellow-400' :
                    notif.type === 'success'     ? 'text-emerald-400' :
                    notif.type === 'warning'     ? 'text-amber-400' : 'text-blue-400'
                  }`} />
                  <span className="text-[11px] font-bold leading-tight">{notif.title}</span>
                </div>

                {/* Message */}
                <p className="text-[10px] text-gray-400 leading-normal pl-5">{notif.message}</p>

                {/* Footer */}
                <div className="flex items-center justify-between pl-5 pt-0.5">
                  <div className="flex items-center space-x-1">
                    <CatIcon className={`w-2.5 h-2.5 ${catMeta.color}`} />
                    <span className={`text-[8px] font-bold uppercase tracking-wider ${catMeta.color}`}>{catMeta.label}</span>
                  </div>
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

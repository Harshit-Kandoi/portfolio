import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';

export interface AppTab {
  id: string;
  label: string;
  icon: LucideIcon;
  render: () => ReactNode;
}

/**
 * Shell for apps that group several former apps as tabs (Arcade, Writing).
 * The active tab lives in the store so `openWindow('snake')` etc. can jump straight to it.
 */
export default function TabbedApp({ appId, tabs }: { appId: string; tabs: AppTab[] }) {
  const theme = useOSStore((s) => s.theme);
  const activeTab = useOSStore((s) => s.appTabs[appId]) ?? tabs[0].id;
  const setAppTab = useOSStore((s) => s.setAppTab);
  const isLight = theme === 'light';
  const current = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        role="tablist"
        aria-label="App sections"
        className={`flex shrink-0 gap-1 p-1.5 border-b ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/10'}`}
      >
        {tabs.map(({ id, label, icon: Icon }) => {
          const selected = id === current.id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setAppTab(appId, id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selected
                  ? isLight ? 'bg-white text-slate-900 shadow-sm' : 'bg-white/10 text-white'
                  : isLight ? 'text-slate-500 hover:text-slate-800' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          );
        })}
      </div>
      {/* key remounts the tab so each former app keeps its own lifecycle (timers, key handlers) */}
      <div key={current.id} role="tabpanel" className="flex-1 min-h-0 overflow-auto flex flex-col">
        {current.render()}
      </div>
    </div>
  );
}

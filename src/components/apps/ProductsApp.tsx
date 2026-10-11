import { useState, useEffect } from 'react';
import { Package, Github, ExternalLink, Zap, CheckCircle2, Clock, Archive, Globe, Terminal as TerminalIcon } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { Product, fetchProducts } from '../../services/supabase';
import { PRODUCTS_SEED } from '../../data/products';

// live = deployed and usable · complete = finished, not deployed · archived = learning / shelved
const STATUS_CONFIG = {
  live:     { label: 'Live',     color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: Globe },
  beta:     { label: 'Beta',     color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/30',       icon: Zap },
  complete: { label: 'Complete', color: 'text-teal-400',    bg: 'bg-teal-500/10 border-teal-500/30',       icon: CheckCircle2 },
  wip:      { label: 'WIP',      color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30',     icon: Clock },
  archived: { label: 'Archived', color: 'text-gray-500',    bg: 'bg-gray-500/10 border-gray-500/30',       icon: Archive },
};

const ICON_EMOJI_MAP: Record<string, string> = {
  '1': '💻',
  '2': '🪞',
  '3': '🐶',
  '4': '🖼️',
  '5': '🎬',
  '6': '💰',
  '7': '🛒',
  '8': '🚢',
  '9': '🏠',
  '10': '☁️',
  '11': '🧠',
};

type Status = Product['status'];
const FILTERS = [
  { id: 'all', label: 'all', heading: 'All Projects', statuses: null },
  { id: 'live', label: 'live', heading: '🌐 Live & beta', statuses: ['live', 'beta'] },
  { id: 'complete', label: 'complete', heading: '✅ Complete', statuses: ['complete'] },
  { id: 'wip', label: 'wip', heading: '🔧 Work in progress', statuses: ['wip'] },
  { id: 'archived', label: 'archived', heading: '📦 Archived & learning', statuses: ['archived'] },
] as const satisfies readonly { id: string; label: string; heading: string; statuses: readonly Status[] | null }[];
type FilterId = (typeof FILTERS)[number]['id'];
const matches = (filterId: FilterId, status: Status) => {
  const f = FILTERS.find((x) => x.id === filterId)!;
  return f.statuses === null || (f.statuses as readonly Status[]).includes(status);
};

function demoHost(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return `${u.host}${u.pathname.replace(/\/$/, '')}`;
  } catch {
    return null;
  }
}

export default function ProductsApp({ isMobileView }: { isMobileView?: boolean } = {}) {
  const theme = useOSStore((s) => s.theme);
  const globalViewMode = useOSStore((s) => s.viewMode);
  const isSimulatingMobile = useOSStore((s) => s.isSimulatingMobile);
  const isMobile = isMobileView || globalViewMode === 'mobile' || isSimulatingMobile;
  const isLight = theme === 'light';

  const [products, setProducts] = useState<Product[]>(PRODUCTS_SEED);
  const [filter, setFilter] = useState<FilterId>('all');

  useEffect(() => { fetchProducts(PRODUCTS_SEED).then(setProducts); }, []);

  const featured = products.filter((p) => p.is_featured);
  const filtered = products.filter((p) => matches(filter, p.status));
  const getFilterCount = (id: FilterId) => products.filter((p) => matches(id, p.status)).length;
  // Hide empty filters (e.g. nothing is in progress right now).
  const visibleFilters = FILTERS.filter((f) => f.id === 'all' || getFilterCount(f.id) > 0);

  const containerBg = isLight ? 'bg-gray-50 text-gray-800' : 'bg-[#080912] text-white';
  const cardBg = isLight ? 'bg-white border-gray-200' : 'bg-[#0f1019] border-white/5';

  return (
    <div className={`flex flex-col h-full overflow-hidden ${containerBg}`}>
      {/* Header */}
      <div className={`shrink-0 px-5 pt-5 pb-4 border-b ${isLight ? 'border-gray-200 bg-gray-100' : 'border-white/5 bg-[#0a0b10]'}`}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
            <Package className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold">Products</h1>
            <p className="text-[10px] text-gray-500">{products.length} projects · Side projects & open-source</p>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {visibleFilters.map(({ id: s, label }) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition-all capitalize flex items-center gap-1.5 ${
                filter === s
                  ? 'bg-violet-500/20 border-violet-500/50 text-violet-400'
                  : isLight ? 'bg-white border-gray-200 text-gray-600' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
              }`}
            >
              <span>{label}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                filter === s ? 'bg-violet-500/30 text-violet-300' : 'bg-white/10 text-gray-400'
              }`}>
                {getFilterCount(s)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
        {/* Featured Banner */}
        {filter === 'all' && featured.length > 0 && (
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-3">⭐ Featured</p>
            <div className="grid grid-cols-1 gap-4">
              {featured.map((p) => {
                const StatusConf = STATUS_CONFIG[p.status];
                const StatusIcon = StatusConf.icon;
                return (
                  <div key={p.id} className={`rounded-2xl border p-5 ${cardBg} hover:border-violet-500/30 transition-all hover:shadow-lg hover:shadow-violet-900/10`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-violet-600 to-purple-700 flex items-center justify-center text-2xl shadow-md shrink-0">
                          {ICON_EMOJI_MAP[p.id] ?? '📦'}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold">{p.name}</h3>
                          <p className="text-[11px] text-gray-400 mt-0.5">{p.tagline}</p>
                        </div>
                      </div>
                      <div className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-semibold ${StatusConf.bg} ${StatusConf.color}`}>
                        <StatusIcon className="w-2.5 h-2.5" />
                        {StatusConf.label}
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed mt-3">{p.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(p.tags ?? []).slice(0, 5).map((tag) => (
                        <span key={tag} className="text-[10px] bg-white/5 border border-white/5 text-gray-400 px-2 py-0.5 rounded-md">{tag}</span>
                      ))}
                    </div>
                    {/* Terminal snippet for featured products with a live demo */}
                    {demoHost(p.demo_url) && (
                      <div className="mt-3 bg-black/40 border border-white/5 rounded-lg px-3 py-2 font-mono text-[10px] text-emerald-400 flex items-center gap-2">
                        <TerminalIcon className="w-3 h-3 text-green-500 shrink-0" />
                        <span className="truncate">$ open {demoHost(p.demo_url)}</span>
                      </div>
                    )}
                    <div className="flex gap-2 mt-4">
                      {p.repo_url && (
                        <a href={p.repo_url} target="_blank" rel="noopener noreferrer"
                          className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-xl transition border ${
                            isLight ? 'bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-900 shadow-2xs' : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white'
                          }`}>
                          <Github className="w-3.5 h-3.5" /> Source
                        </a>
                      )}
                      {p.demo_url && (
                        <a href={p.demo_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[11px] font-semibold bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 px-3 py-1.5 rounded-xl transition text-violet-300">
                          <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Products Grid */}
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-3">
            {FILTERS.find((f) => f.id === filter)!.heading}
          </p>
          
          {filtered.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border ${cardBg}`}>
              <div className="w-12 h-12 rounded-2xl bg-gray-500/10 border border-gray-500/20 flex items-center justify-center text-gray-400 mb-3">
                <Archive className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold">No Projects Found</h3>
              <p className="text-[11px] text-gray-400 max-w-xs mt-1">
                There are currently no projects matching the &quot;{filter}&quot; filter.
              </p>
            </div>
          ) : (
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 sm:grid-cols-2 gap-3'}`}>
              {filtered.map((p) => {
                const StatusConf = STATUS_CONFIG[p.status];
                const StatusIcon = StatusConf.icon;
                return (
                  <div key={p.id} className={`rounded-2xl border p-4 ${cardBg} hover:border-violet-500/30 transition-all group`}>
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-lg">{ICON_EMOJI_MAP[p.id] ?? '📦'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold truncate">{p.name}</p>
                        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[9px] font-semibold mt-0.5 ${StatusConf.bg} ${StatusConf.color}`}>
                          <StatusIcon className="w-2 h-2" />{StatusConf.label}
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">{p.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(p.tags ?? []).slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[9px] bg-white/5 border border-white/5 text-gray-500 px-1.5 py-0.5 rounded-md">{tag}</span>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {p.repo_url && (
                        <a href={p.repo_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white transition">
                          <Github className="w-3 h-3" /> Repo
                        </a>
                      )}
                      {p.demo_url && (
                        <a href={p.demo_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 transition">
                          <ExternalLink className="w-3 h-3" /> Demo
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


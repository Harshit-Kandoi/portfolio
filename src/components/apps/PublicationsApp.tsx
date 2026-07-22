import { useState, useEffect } from 'react';
import { BookMarked, ExternalLink, Clock, Eye, Search, Tag } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { Publication, fetchPublications } from '../../services/supabase';
import { PUBLICATIONS_SEED } from '../../data/publications';

const PLATFORM_COLORS: Record<string, string> = {
  'Towards AI (Medium)': 'bg-green-500/15 text-green-400 border-green-500/30',
  'Medium': 'bg-green-500/15 text-green-400 border-green-500/30',
  'Dev.to': 'bg-gray-500/15 text-gray-300 border-gray-500/30',
  'Research Paper': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  default: 'bg-white/10 text-gray-400 border-white/10',
};

function getPlatformStyle(platform: string) {
  return PLATFORM_COLORS[platform] || PLATFORM_COLORS.default;
}

export default function PublicationsApp() {
  const theme = useOSStore((s) => s.theme);
  const isLight = theme === 'light';

  const [pubs, setPubs] = useState<Publication[]>(PUBLICATIONS_SEED);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selected, setSelected] = useState<Publication | null>(null);

  useEffect(() => { fetchPublications(PUBLICATIONS_SEED).then(setPubs); }, []);

  const allTags = Array.from(new Set(pubs.flatMap((p) => p.tags)));
  const filtered = pubs.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchTag = !activeTag || p.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  const containerBg = isLight ? 'bg-gray-50 text-gray-800' : 'bg-[#080912] text-white';
  const cardBg = isLight ? 'bg-white border-gray-200' : 'bg-[#0f1019] border-white/5';
  const inputBg = isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10';

  return (
    <div className={`flex flex-col h-full overflow-hidden ${containerBg}`}>
      {/* Header */}
      <div className={`shrink-0 px-5 pt-5 pb-4 border-b ${isLight ? 'border-gray-200 bg-gray-100' : 'border-white/5 bg-[#0a0b10]'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
              <BookMarked className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold">Publications</h1>
              <p className="text-[10px] text-gray-500">{pubs.length} articles · {pubs.reduce((s, p) => s + (p.views ?? 0), 0).toLocaleString()} total views</p>
            </div>
          </div>
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`pl-7 pr-3 py-1.5 text-[11px] rounded-lg border focus:outline-none focus:ring-1 focus:ring-green-500/30 w-36 ${inputBg}`}
            />
          </div>
        </div>
        {/* Tags */}
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold border transition ${!activeTag ? 'bg-green-500/20 border-green-500/40 text-green-400' : isLight ? 'bg-white border-gray-200 text-gray-600' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'}`}
          >All</button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold border transition ${
                activeTag === tag
                  ? 'bg-green-500/20 border-green-500/40 text-green-400'
                  : isLight ? 'bg-white border-gray-200 text-gray-600' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
              }`}
            >{tag}</button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {filtered.map((pub) => (
          <div
            key={pub.id}
            className={`rounded-2xl border overflow-hidden hover:border-green-500/40 transition-all cursor-pointer group ${cardBg}`}
            onClick={() => setSelected(pub === selected ? null : pub)}
          >
            {pub.cover_url && (
              <div className="relative overflow-hidden h-36">
                <img src={pub.cover_url} alt={pub.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${getPlatformStyle(pub.platform)}`}>{pub.platform}</span>
                </div>
              </div>
            )}
            <div className="p-4">
              {!pub.cover_url && (
                <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold mb-2 inline-block ${getPlatformStyle(pub.platform)}`}>{pub.platform}</span>
              )}
              <h3 className="text-sm font-bold leading-snug group-hover:text-green-400 transition-colors">{pub.title}</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed mt-1.5">{pub.summary}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{pub.read_time_mins} min</span>
                  {pub.views && <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" />{pub.views.toLocaleString()} views</span>}
                  <span>{new Date(pub.date).toLocaleDateString('en', { month: 'short', year: 'numeric' })}</span>
                </div>
                <a
                  href={pub.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-[11px] font-semibold text-green-400 hover:text-green-300 transition"
                >
                  Read <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex gap-1.5 flex-wrap mt-3">
                {pub.tags.map((tag) => (
                  <span key={tag} className="text-[9px] bg-white/5 border border-white/5 text-gray-500 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                    <Tag className="w-2 h-2" />{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

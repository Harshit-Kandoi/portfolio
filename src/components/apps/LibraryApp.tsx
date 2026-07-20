import { useState, useEffect } from 'react';
import { BookOpen, Star, CheckCircle2, Clock, Search, ChevronRight, Tag } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { Book, fetchBooks } from '../../services/supabase';
import { BOOKS_SEED } from '../../data/books';

const STATUS_CONFIG = {
  reading: { label: 'Reading', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', icon: BookOpen },
  read: { label: 'Read', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2 },
  wishlist: { label: 'Wishlist', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: Clock },
};

const COVER_FALLBACK = (title: string) =>
  `https://via.placeholder.com/120x180/1a1b2e/a855f7?text=${encodeURIComponent(title.slice(0, 8))}`;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3 h-3 ${n <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`}
        />
      ))}
    </div>
  );
}

export default function LibraryApp({ isMobileView }: { isMobileView?: boolean } = {}) {
  const theme = useOSStore((s) => s.theme);
  const isLight = theme === 'light';

  const [books, setBooks] = useState<Book[]>(BOOKS_SEED);
  const [filter, setFilter] = useState<'all' | 'reading' | 'read' | 'wishlist'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Book | null>(null);

  useEffect(() => {
    fetchBooks(BOOKS_SEED).then(setBooks);
  }, []);

  const filtered = books.filter((b) => {
    const matchStatus = filter === 'all' || b.status === filter;
    const matchSearch =
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const containerBg = isLight ? 'bg-gray-50 text-gray-800' : 'bg-[#080912] text-white';
  const cardBg = isLight ? 'bg-white border-gray-200' : 'bg-[#0f1019] border-white/5';
  const inputBg = isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-white/5 border-white/10 text-white';

  return (
    <div className={`flex flex-col h-full overflow-hidden ${containerBg}`}>
      {/* Header */}
      <div className={`shrink-0 px-5 pt-5 pb-4 border-b ${isLight ? 'border-gray-200 bg-gray-100' : 'border-white/5 bg-[#0a0b10]'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold">Library</h1>
              <p className="text-[10px] text-gray-500">{books.length} books · {books.filter(b => b.status === 'reading').length} in progress</p>
            </div>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`pl-8 pr-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500/40 w-40 ${inputBg}`}
            />
          </div>
        </div>
        <div className="flex gap-1.5">
          {(['all', 'reading', 'read', 'wishlist'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                filter === s
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : isLight ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
              }`}
            >
              {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
              {s !== 'all' && (
                <span className="ml-1 text-[9px] opacity-60">
                  ({books.filter(b => b.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Book Grid */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <BookOpen className="w-10 h-10 text-gray-700 mb-3" />
              <p className="text-sm text-gray-500">No books found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered.map((book) => {
                const StatusIcon = STATUS_CONFIG[book.status].icon;
                return (
                  <button
                    key={book.id}
                    onClick={() => setSelected(book)}
                    className={`text-left rounded-2xl border overflow-hidden hover:border-amber-500/40 transition-all hover:shadow-lg hover:shadow-amber-900/10 group ${cardBg} ${selected?.id === book.id ? 'ring-1 ring-amber-500/50' : ''}`}
                  >
                    {/* Cover */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1b2e] to-[#0d0e18] aspect-[3/4]">
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = COVER_FALLBACK(book.title);
                        }}
                      />
                      <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded-md border text-[9px] font-bold flex items-center gap-1 ${STATUS_CONFIG[book.status].bg} ${STATUS_CONFIG[book.status].color}`}>
                        <StatusIcon className="w-2.5 h-2.5" />
                        {STATUS_CONFIG[book.status].label}
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <p className="text-[11px] font-bold leading-tight line-clamp-2 mb-0.5">{book.title}</p>
                      <p className="text-[10px] text-gray-500 truncate">{book.author}</p>
                      {book.rating > 0 && (
                        <div className="mt-1.5">
                          <StarRating rating={book.rating} />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className={`w-72 shrink-0 border-l overflow-y-auto custom-scrollbar ${isLight ? 'border-gray-200 bg-white' : 'border-white/5 bg-[#0a0b10]'}`}>
            <div className="p-5 space-y-4">
              <button
                onClick={() => setSelected(null)}
                className="text-[11px] text-gray-500 hover:text-white flex items-center gap-1 transition"
              >
                <ChevronRight className="w-3 h-3 rotate-180" /> Close
              </button>
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#1a1b2e] max-h-48">
                <img
                  src={selected.cover_url}
                  alt={selected.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = COVER_FALLBACK(selected.title); }}
                />
              </div>
              <div>
                <h2 className="text-sm font-bold leading-snug">{selected.title}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{selected.author}</p>
                {selected.rating > 0 && <div className="mt-2"><StarRating rating={selected.rating} /></div>}
              </div>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${STATUS_CONFIG[selected.status].bg} ${STATUS_CONFIG[selected.status].color}`}>
                {selected.status === 'reading' && <BookOpen className="w-3 h-3" />}
                {selected.status === 'read' && <CheckCircle2 className="w-3 h-3" />}
                {selected.status === 'wishlist' && <Clock className="w-3 h-3" />}
                {STATUS_CONFIG[selected.status].label}
              </div>
              {selected.review && (
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 font-semibold">My Review</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{selected.review}</p>
                </div>
              )}
              {selected.takeaways.length > 0 && (
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-semibold">Key Takeaways</p>
                  <ul className="space-y-1.5">
                    {selected.takeaways.map((t, i) => (
                      <li key={i} className="flex gap-2 text-xs text-gray-300">
                        <span className="text-amber-500 mt-0.5 shrink-0">▸</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-gray-600" />
                <span className="text-[10px] text-gray-500">{selected.category}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

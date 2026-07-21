import { useState, useEffect, useRef } from 'react';
import { BookOpen, Star, CheckCircle2, Clock, Search, ChevronLeft, Tag, X, Sparkles, BookMarked } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { Book, fetchBooks } from '../../services/supabase';
import { BOOKS_SEED } from '../../data/books';

const STATUS_CONFIG = {
  reading: { label: 'Reading', color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30 text-blue-400', icon: BookOpen },
  read: { label: 'Read', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400', icon: CheckCircle2 },
  wishlist: { label: 'Wishlist', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400', icon: Clock },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${n <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`}
        />
      ))}
    </div>
  );
}

export default function LibraryApp({ isMobileView }: { isMobileView?: boolean } = {}) {
  const theme = useOSStore((s) => s.theme);
  const globalViewMode = useOSStore((s) => s.viewMode);
  const isSimulatingMobile = useOSStore((s) => s.isSimulatingMobile);
  const isMobile = isMobileView || globalViewMode === 'mobile' || isSimulatingMobile;
  const isLight = theme === 'light';

  const [books, setBooks] = useState<Book[]>(BOOKS_SEED);
  const [filter, setFilter] = useState<'all' | 'reading' | 'read' | 'wishlist'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Book | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [detailWidth, setDetailWidth] = useState<number>(320);
  const resizeRef = useRef<{ clientX: number; startWidth: number } | null>(null);

  const handlePointerDownResize = (e: React.PointerEvent) => {
    resizeRef.current = { clientX: e.clientX, startWidth: detailWidth };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMoveResize = (e: React.PointerEvent) => {
    if (!resizeRef.current) return;
    const delta = e.clientX - resizeRef.current.clientX;
    const newWidth = resizeRef.current.startWidth - delta;
    setDetailWidth(Math.max(240, Math.min(600, newWidth)));
  };

  const handlePointerUpResize = (e: React.PointerEvent) => {
    resizeRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  useEffect(() => {
    fetchBooks(BOOKS_SEED).then(setBooks);
  }, []);

  const handleImageError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

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
      {/* Mobile Detail View */}
      {isMobile && selected ? (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Mobile Detail Header */}
          <div className={`shrink-0 px-4 py-3 border-b flex items-center justify-between gap-3 ${isLight ? 'border-gray-200 bg-gray-100' : 'border-white/5 bg-[#0a0b10]'}`}>
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Library</span>
            </button>
            <span className="text-xs font-bold truncate text-gray-400">{selected.category}</span>
          </div>

          {/* Mobile Detail Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
            <div className="flex flex-col items-center text-center">
              <div className="w-36 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl shadow-amber-950/20 border border-white/10 relative bg-gradient-to-br from-[#1a1b2e] to-[#0d0e18] mb-4">
                {!imgErrors[selected.id] ? (
                  <img
                    src={selected.cover_url}
                    alt={selected.title}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(selected.id)}
                  />
                ) : (
                  <div className="w-full h-full p-4 flex flex-col justify-between items-center text-center bg-gradient-to-br from-amber-900/40 to-purple-900/40">
                    <BookMarked className="w-8 h-8 text-amber-400 mt-4" />
                    <p className="text-xs font-bold leading-tight">{selected.title}</p>
                    <span className="text-[10px] text-gray-400">{selected.author}</span>
                  </div>
                )}
              </div>

              <h2 className="text-base font-bold leading-snug px-2">{selected.title}</h2>
              <p className="text-xs text-gray-400 mt-1">{selected.author}</p>

              <div className="flex items-center gap-2 mt-3">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${STATUS_CONFIG[selected.status].bg}`}>
                  {selected.status === 'reading' && <BookOpen className="w-3.5 h-3.5" />}
                  {selected.status === 'read' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {selected.status === 'wishlist' && <Clock className="w-3.5 h-3.5" />}
                  {STATUS_CONFIG[selected.status].label}
                </div>
                {selected.year_read && (
                  <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 text-gray-400 bg-white/5 font-medium">
                    {selected.year_read}
                  </span>
                )}
              </div>

              {selected.rating > 0 && (
                <div className="mt-3 flex items-center gap-2 bg-amber-500/5 px-3 py-1.5 rounded-lg border border-amber-500/20">
                  <StarRating rating={selected.rating} />
                  <span className="text-xs font-bold text-amber-400">{selected.rating}.0</span>
                </div>
              )}
            </div>

            {selected.review && (
              <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/5'}`}>
                <p className="text-[10px] text-amber-400 uppercase tracking-wider mb-1.5 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> My Review
                </p>
                <p className="text-xs text-gray-300 leading-relaxed italic">"{selected.review}"</p>
              </div>
            )}

            {selected.takeaways.length > 0 && (
              <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/5'}`}>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2.5 font-bold">Key Takeaways</p>
                <ul className="space-y-2">
                  {selected.takeaways.map((t, i) => (
                    <li key={i} className="flex gap-2.5 text-xs text-gray-300 leading-normal">
                      <span className="text-amber-400 shrink-0 font-bold">▸</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Main Header */}
          <div className={`shrink-0 px-4 sm:px-5 pt-4 pb-3 border-b ${isLight ? 'border-gray-200 bg-gray-100' : 'border-white/5 bg-[#0a0b10]'}`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0 shadow-md">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm font-bold truncate leading-tight">Library</h1>
                  <p className="text-[10px] text-gray-500 truncate">
                    {books.length} books · {books.filter((b) => b.status === 'reading').length} in progress
                  </p>
                </div>
              </div>
              <div className="relative shrink-0">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`pl-8 ${search ? 'pr-7' : 'pr-3'} py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-amber-500/40 w-32 sm:w-44 transition-all ${inputBg}`}
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-2 text-gray-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {(['all', 'reading', 'read', 'wishlist'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold border whitespace-nowrap transition-all shrink-0 ${
                    filter === s
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                      : isLight
                      ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                      : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
                  <span className="ml-1 text-[9px] opacity-75">
                    ({s === 'all' ? books.length : books.filter((b) => b.status === s).length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Grid + Desktop Detail Panel */}
          <div className="flex flex-1 overflow-hidden relative">
            {/* Book Grid */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 custom-scrollbar">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <BookOpen className="w-10 h-10 text-gray-600 mb-3 opacity-50" />
                  <p className="text-xs font-semibold text-gray-400">No books found</p>
                  <p className="text-[11px] text-gray-500 mt-1">Try resetting your search or filter</p>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-4 max-w-[920px] mx-auto">
                  {filtered.map((book) => {
                    const StatusIcon = STATUS_CONFIG[book.status].icon;
                    const isSelected = selected?.id === book.id;

                    return (
                      <button
                        key={book.id}
                        onClick={() => setSelected(book)}
                        className={`text-left rounded-xl border overflow-hidden transition-all duration-200 active:scale-[0.98] group flex flex-col ${cardBg} ${
                          isSelected ? 'ring-2 ring-amber-500 border-amber-500/50' : 'hover:border-amber-500/40 hover:shadow-lg'
                        }`}
                      >
                        {/* Cover image container */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1b2e] to-[#0d0e18] aspect-[3/4] w-full">
                          {!imgErrors[book.id] ? (
                            <img
                              src={book.cover_url}
                              alt={book.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={() => handleImageError(book.id)}
                            />
                          ) : (
                            <div className="w-full h-full p-3 flex flex-col justify-between items-center text-center bg-gradient-to-br from-amber-900/30 to-slate-900/60">
                              <BookMarked className="w-6 h-6 text-amber-400 mt-2" />
                              <p className="text-[10px] font-bold leading-tight line-clamp-3">{book.title}</p>
                              <span className="text-[9px] text-gray-400">{book.author}</span>
                            </div>
                          )}
                          <div
                            className={`absolute top-2 right-2 px-2 py-0.5 rounded-md border text-[9px] font-bold flex items-center gap-1 backdrop-blur-md shadow-sm ${STATUS_CONFIG[book.status].bg}`}
                          >
                            <StatusIcon className="w-2.5 h-2.5" />
                            <span>{STATUS_CONFIG[book.status].label}</span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-xs font-bold leading-tight line-clamp-2 mb-0.5 group-hover:text-amber-400 transition-colors">
                              {book.title}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate">{book.author}</p>
                          </div>
                          {book.rating > 0 && (
                            <div className="mt-2.5 pt-1.5 border-t border-white/5 flex items-center justify-between gap-1">
                              <StarRating rating={book.rating} />
                              <span className="text-[9px] font-semibold text-gray-400 truncate">{book.category}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Desktop Detail Panel */}
            {!isMobile && selected && (
              <>
                {/* Resize Handle */}
                <div
                  onPointerDown={handlePointerDownResize}
                  onPointerMove={handlePointerMoveResize}
                  onPointerUp={handlePointerUpResize}
                  className="w-1.5 cursor-col-resize hover:bg-amber-500/50 active:bg-amber-500 transition-colors self-stretch flex-shrink-0 relative z-10 select-none group flex items-center justify-center border-l border-r border-transparent hover:border-amber-500/30"
                  style={{ marginLeft: '-3px', marginRight: '-3px' }}
                  title="Drag to resize detail panel"
                >
                  <div className="w-0.5 h-8 rounded-full bg-white/20 group-hover:bg-amber-400 transition-colors" />
                </div>

                <div
                  style={{ width: `${detailWidth}px`, maxWidth: '55%' }}
                  className={`shrink-0 border-l overflow-y-auto custom-scrollbar select-none ${
                    isLight ? 'border-gray-200 bg-white' : 'border-white/5 bg-[#0a0b10]'
                  }`}
                >
                  <div className="p-5 space-y-4 max-w-md mx-auto">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Book Details</span>
                      <button
                        onClick={() => setSelected(null)}
                        className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex justify-center">
                      <div className="w-40 aspect-[3/4] rounded-xl overflow-hidden bg-[#1a1b2e] shadow-xl border border-white/10 relative">
                        {!imgErrors[selected.id] ? (
                          <img
                            src={selected.cover_url}
                            alt={selected.title}
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(selected.id)}
                          />
                        ) : (
                          <div className="w-full h-full p-4 flex flex-col justify-between items-center text-center bg-gradient-to-br from-amber-900/40 to-purple-900/40">
                            <BookMarked className="w-8 h-8 text-amber-400 mt-4" />
                            <p className="text-xs font-bold leading-tight">{selected.title}</p>
                            <span className="text-[10px] text-gray-400">{selected.author}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-center w-full flex flex-col items-center justify-center">
                      <h2 className="text-base font-bold leading-snug text-center w-full">{selected.title}</h2>
                      <p className="text-xs text-gray-400 mt-1 text-center w-full">{selected.author}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${
                          STATUS_CONFIG[selected.status].bg
                        }`}
                      >
                        {selected.status === 'reading' && <BookOpen className="w-3.5 h-3.5" />}
                        {selected.status === 'read' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {selected.status === 'wishlist' && <Clock className="w-3.5 h-3.5" />}
                        {STATUS_CONFIG[selected.status].label}
                      </div>
                      {selected.year_read && (
                        <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 text-gray-400 bg-white/5 font-medium">
                          {selected.year_read}
                        </span>
                      )}
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 text-xs text-gray-300 bg-white/5 font-medium">
                        <Tag className="w-3 h-3 text-amber-400" />
                        <span>{selected.category}</span>
                      </div>
                    </div>

                    {selected.rating > 0 && (
                      <div className="flex items-center justify-center gap-2 bg-amber-500/5 px-3 py-1.5 rounded-lg border border-amber-500/20 max-w-xs mx-auto">
                        <StarRating rating={selected.rating} />
                        <span className="text-xs font-bold text-amber-400">{selected.rating}.0</span>
                      </div>
                    )}

                    {selected.review && (
                      <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/5'}`}>
                        <p className="text-[10px] text-amber-400 uppercase tracking-wider mb-1.5 font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> My Review
                        </p>
                        <p className="text-xs text-gray-300 leading-relaxed italic">"{selected.review}"</p>
                      </div>
                    )}

                    {selected.takeaways.length > 0 && (
                      <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/5'}`}>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2.5 font-bold">Key Takeaways</p>
                        <ul className="space-y-2">
                          {selected.takeaways.map((t, i) => (
                            <li key={i} className="flex gap-2.5 text-xs text-gray-300 leading-normal">
                              <span className="text-amber-400 shrink-0 font-bold">▸</span>
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}


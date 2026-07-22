import { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Star, CheckCircle2, Search, ChevronLeft, X, 
  BookMarked, Lightbulb, Bookmark, MessageSquareText, ExternalLink 
} from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { Book, fetchBooks } from '../../services/supabase';
import { BOOKS_SEED } from '../../data/books';

const STATUS_CONFIG = {
  read: { label: 'Read', badge: '✅ Read', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400', icon: CheckCircle2 },
  reading: { label: 'Reading', badge: '📖 Reading', color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30 text-blue-400', icon: BookOpen },
  wishlist: { label: 'Wishlist', badge: '⭐ Wishlist', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400', icon: Star },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
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
  const globalViewMode = useOSStore((s) => s.viewMode);
  const isSimulatingMobile = useOSStore((s) => s.isSimulatingMobile);
  const isMobile = isMobileView || globalViewMode === 'mobile' || isSimulatingMobile;
  const isLight = theme === 'light';

  const [books, setBooks] = useState<Book[]>(BOOKS_SEED);
  const [filter, setFilter] = useState<'all' | 'read' | 'reading' | 'wishlist'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Book | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [detailWidth, setDetailWidth] = useState<number>(340);
  const resizeRef = useRef<{ clientX: number; startWidth: number } | null>(null);

  // Dynamic grid column calculation matching exact desktop constraints:
  // Normal/Minimized window: 3 books/row
  // Maximized window: 4 books/row
  // Detail panel open: 2 books/row (or 3 if maximized wide)
  const [gridCols, setGridCols] = useState<number>(3);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w >= 960) {
          setGridCols(4); // Maximized window: 4 books per row max
        } else if (w >= 560) {
          setGridCols(3); // Normal/Minimized window: 3 books per row
        } else {
          setGridCols(2); // Detail panel open or narrow width: 2 books per row
        }
      }
    });
    observer.observe(gridContainerRef.current);
    return () => observer.disconnect();
  }, [selected]);

  const handlePointerDownResize = (e: React.PointerEvent) => {
    resizeRef.current = { clientX: e.clientX, startWidth: detailWidth };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMoveResize = (e: React.PointerEvent) => {
    if (!resizeRef.current) return;
    const delta = e.clientX - resizeRef.current.clientX;
    const newWidth = resizeRef.current.startWidth - delta;
    setDetailWidth(Math.max(260, Math.min(600, newWidth)));
  };

  const handlePointerUpResize = (e: React.PointerEvent) => {
    resizeRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore pointer capture error
    }
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
      (b.category && b.category.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const containerBg = isLight ? 'bg-gray-50 text-gray-800' : 'bg-[#080912] text-white';
  const cardBg = isLight ? 'bg-white border-gray-200' : 'bg-[#0f1019] border-white/5';
  const inputBg = isLight ? 'bg-white border-gray-200 text-gray-800' : 'bg-white/5 border-white/10 text-white';

  const renderBookDetailContent = (book: Book) => {
    const isRead = book.status === 'read';
    const noteText = isRead ? book.note : (book.whyOnShelf || book.note);

    return (
      <div className="flex flex-col h-full justify-between space-y-4">
        <div className="space-y-4">
          {/* Cover & Basic Info Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-36 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl shadow-amber-950/20 border border-white/10 relative bg-gradient-to-br from-[#1a1b2e] to-[#0d0e18] mb-3 shrink-0">
              {!imgErrors[book.id] ? (
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(book.id)}
                />
              ) : (
                <div className="w-full h-full p-4 flex flex-col justify-between items-center text-center bg-gradient-to-br from-amber-900/40 to-purple-900/40">
                  <BookMarked className="w-8 h-8 text-amber-400 mt-4" />
                  <p className="text-xs font-bold leading-tight">{book.title}</p>
                  <span className="text-[10px] text-gray-400">{book.author}</span>
                </div>
              )}
            </div>

            <h2 className="text-base font-bold leading-snug px-2">{book.title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{book.author}</p>

            {/* Status Pill & Optional Read Year */}
            <div className="flex items-center justify-center gap-1.5 mt-2.5 flex-wrap">
              <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${STATUS_CONFIG[book.status].bg}`}>
                <span>{STATUS_CONFIG[book.status].badge}</span>
              </div>
              {book.year_read && (
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-gray-400 bg-white/5 font-medium">
                  {book.year_read}
                </span>
              )}
            </div>

            {/* Subtle Reduced Weight Rating */}
            {isRead && book.rating && book.rating > 0 && (
              <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <StarRating rating={book.rating} />
                <span className="text-[11px] text-gray-400 font-medium">{book.rating}.0 / 5</span>
              </div>
            )}
          </div>

          {/* Primary Content: Margin Notes / Why it's on my shelf */}
          {noteText && (
            <div className={`p-4 rounded-xl border ${isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-white/5 border-white/10'}`}>
              <p className="text-[10px] uppercase tracking-wider mb-1.5 font-bold flex items-center gap-1.5 text-amber-400">
                {isRead ? (
                  <>
                    <MessageSquareText className="w-3.5 h-3.5 text-amber-400" />
                    Margin Notes
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    Why it's on my shelf
                  </>
                )}
              </p>
              <p className="text-xs text-gray-300 leading-relaxed font-normal">{noteText}</p>
            </div>
          )}

          {/* Lightweight Callout: One Thing That Stayed With Me */}
          {book.oneThing && (
            <div className="border-l-2 border-amber-400/80 pl-3 py-1.5 my-2 bg-amber-500/5 rounded-r-lg">
              <p className="text-[9px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-400" />
                One thing that stayed with me
              </p>
              <p className="text-xs text-amber-100/90 italic font-medium mt-0.5">
                "{book.oneThing}"
              </p>
            </div>
          )}
        </div>

        {/* Subtle Footer CTA: Affiliate Section */}
        {book.buyUrl && (
          <div className="mt-6 pt-3 border-t border-white/10 flex flex-col items-center text-center shrink-0">
            <a
              href={book.buyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white transition-all active:scale-95 group"
            >
              <span>Buy on Amazon</span>
              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
            </a>
            <p className="text-[10px] text-gray-500 mt-1.5 italic">
              Same Amazon price. Helps fund my caffeine addiction ☕
            </p>
          </div>
        )}
      </div>
    );
  };

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
            <span className="text-xs font-bold truncate text-amber-400/90">{selected.category}</span>
          </div>

          {/* Mobile Detail Content */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {renderBookDetailContent(selected)}
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
                    {books.length} books · {books.filter((b) => b.status === 'read').length} read · {books.filter((b) => b.status === 'reading').length} reading
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
              {(['all', 'read', 'reading', 'wishlist'] as const).map((s) => (
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
                  {s === 'all' ? 'All' : STATUS_CONFIG[s].badge}
                  <span className="ml-1 text-[9px] opacity-75">
                    ({s === 'all' ? books.length : books.filter((b) => b.status === s).length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Grid + Desktop Detail Panel */}
          <div className="flex flex-1 overflow-hidden relative">
            {/* Book Grid Container with ResizeObserver */}
            <div 
              ref={gridContainerRef}
              className="flex-1 overflow-y-auto p-3.5 sm:p-5 custom-scrollbar"
            >
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <BookOpen className="w-10 h-10 text-gray-600 mb-3 opacity-50" />
                  <p className="text-xs font-semibold text-gray-400">No books found</p>
                  <p className="text-[11px] text-gray-500 mt-1">Try resetting your search or filter</p>
                </div>
              ) : (
                <div 
                  className={`grid gap-4 max-w-[1100px] mx-auto ${
                    isMobile
                      ? 'grid-cols-2'
                      : gridCols === 4
                      ? 'grid-cols-4'
                      : gridCols === 3
                      ? 'grid-cols-3'
                      : 'grid-cols-2'
                  }`}
                >
                  {filtered.map((book) => {
                    const isSelected = selected?.id === book.id;
                    const isRead = book.status === 'read';

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
                            <span>{STATUS_CONFIG[book.status].badge}</span>
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

                          <div className="mt-2.5 pt-1.5 border-t border-white/5 flex items-center justify-between gap-1 text-[9px] font-medium text-gray-400">
                            {isRead && book.rating && book.rating > 0 ? (
                              <StarRating rating={book.rating} />
                            ) : (
                              <div />
                            )}
                            {book.category && (
                              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-gray-400 truncate max-w-[100px]">
                                {book.category}
                              </span>
                            )}
                          </div>
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
                  <div className="p-5 space-y-4 max-w-md mx-auto relative h-full">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Book Details</span>
                        {selected.category && (
                          <span className="text-[10px] font-bold text-amber-400/90">• {selected.category}</span>
                        )}
                      </div>
                      <button
                        onClick={() => setSelected(null)}
                        className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {renderBookDetailContent(selected)}
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

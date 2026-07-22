import React, { useState } from 'react';
import { blogPosts } from '../../data/blogs';
import { BlogPost } from '../../types';
import { Search, Bookmark, Calendar, Clock, ExternalLink, ArrowLeft, Share2 } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { trackEvent } from '../../utils/analytics';

export default function BlogApp({ isMobileView }: { isMobileView?: boolean } = {}) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const theme = useOSStore((state) => state.theme);
  const viewMode = useOSStore((state) => state.viewMode);
  const isSimulatingMobile = useOSStore((state) => state.isSimulatingMobile);
  const blogWindow = useOSStore((state) => state.windows.find((w) => w.id === 'blog'));
  const unlockAchievement = useOSStore((state) => state.unlockAchievement);
  const addNotification = useOSStore((state) => state.addNotification);

  const isMaximized = blogWindow?.isMaximized || false;
  const isMobile = isMobileView || viewMode === 'mobile' || isSimulatingMobile;

  const gridColsClass = isMobile
    ? 'grid-cols-1'
    : isMaximized
      ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
      : 'grid-cols-1 sm:grid-cols-2';

  const handleShare = () => {
    if (!selectedPost) return;
    try {
      navigator.clipboard.writeText(selectedPost.link);
      addNotification('🔗 Link Copied', 'Article link copied to clipboard!', 'success', 'portfolio');
      trackEvent('blog_article_share', { article_title: selectedPost.title, article_id: selectedPost.id });
    } catch {
      // Fallback
    }
  };

  const handleSelectPost = (post: BlogPost) => {
    setSelectedPost(post);
    trackEvent('blog_article_open', { article_title: post.title, article_id: post.id });
    unlockAchievement('blog_reader');
  };

  const categories = ['All', 'LLM & RAG', 'Python & Mojo', 'DevOps & Docker', 'Data Science', 'AI & ML', 'Bookmarked'];

  const toggleBookmark = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    );
  };

  const filteredPosts = blogPosts.filter((post) => {
    let matchesCat = false;
    if (selectedCat === 'All') {
      matchesCat = true;
    } else if (selectedCat === 'Bookmarked') {
      matchesCat = bookmarks.includes(post.id);
    } else {
      matchesCat =
        post.category.toLowerCase() === selectedCat.toLowerCase() ||
        (post.tags?.some((t) => t.toLowerCase().includes(selectedCat.toLowerCase())) ?? false);
    }

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      post.category.toLowerCase().includes(q) ||
      (post.tags?.some((t) => t.toLowerCase().includes(q)) ?? false);

    return matchesCat && matchesSearch;
  });

  const isLight = theme === 'light';
  const appBg = isLight ? 'bg-white text-gray-800' : 'bg-slate-950 text-purple-100';
  const headerBg = isLight ? 'bg-gray-150 border-b border-gray-200' : 'bg-slate-900/60 border-b border-white/5';
  const cardBg = isLight ? 'bg-white border-gray-200 hover:bg-gray-50' : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/40';
  const textMuted = isLight ? 'text-gray-500' : 'text-gray-400';

  // Read full detailed layout
  if (selectedPost) {
    const isBookmarked = bookmarks.includes(selectedPost.id);
    return (
      <div className={`flex flex-col flex-grow h-full overflow-hidden ${appBg} animate-fade-in`}>
        {/* Detail Header */}
        <div className={`p-4 flex items-center justify-between shrink-0 ${headerBg}`}>
          <button
            onClick={() => setSelectedPost(null)}
            className="flex items-center space-x-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to feed</span>
          </button>
          
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              title="Share Article"
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={(e) => toggleBookmark(selectedPost.id, e)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              title="Bookmark Article"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Read Article Details Container */}
        <div className="flex-grow overflow-y-auto p-6 max-w-2xl mx-auto w-full space-y-6 custom-scrollbar">
          <div className="w-full h-56 rounded-2xl overflow-hidden shadow-lg border border-white/10 relative">
            <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-full object-cover" />
            {selectedPost.featured && (
              <span className="absolute top-3 left-3 bg-amber-500/90 backdrop-blur-md text-black font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                🔥 Top Story
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center flex-wrap gap-2">
              <span className="bg-purple-600/20 text-purple-400 text-[10px] font-bold px-2.5 py-0.5 rounded border border-purple-500/25 uppercase tracking-wider">
                {selectedPost.category}
              </span>
              {(selectedPost.claps ?? 0) > 0 && (
                <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                  👏 {selectedPost.claps} claps
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-2xl font-bold leading-normal text-white">{selectedPost.title}</h2>
            
            <div className={`flex items-center space-x-4 text-xs font-semibold ${textMuted}`}>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>{selectedPost.date}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>{selectedPost.readingTime || 5} min read</span>
              </span>
            </div>
          </div>

          {selectedPost.tags && selectedPost.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedPost.tags.map((tag) => (
                <span key={tag} className="text-[10px] bg-white/5 border border-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="border-t border-white/10 dark:border-gray-800 pt-5">
            <p className={`text-sm leading-relaxed text-justify mb-8 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
              {selectedPost.excerpt}
              <br /><br />
              This article covers deep technical concepts regarding AI/ML, compiler acceleration, optimization, dependency caching, or container management. Read the complete publication on Medium to view code snippets, benchmarks, and interactive community discussions.
            </p>

            <a
              href={selectedPost.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('blog_article_complete', { article_title: selectedPost.title, article_id: selectedPost.id })}
              className="w-full bg-purple-650 hover:bg-purple-700 text-white font-semibold text-xs py-3 px-4 rounded-xl flex items-center justify-center space-x-1.5 transition shadow-lg shadow-purple-500/10 active:scale-[0.98]"
            >
              <span>Read Full Article on Medium</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col flex-grow h-full overflow-hidden ${appBg} custom-scrollbar`}>
      {/* Blog Explorer Header / Toolbar */}
      <div className={`p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 ${headerBg}`}>
        <div className="flex space-x-1.5 overflow-x-auto custom-scrollbar flex-grow mr-2 pb-1 sm:pb-0">
          {categories.map((cat) => {
            const isSel = selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSel
                    ? 'bg-purple-600 border-purple-500 text-white shadow-sm'
                    : isLight
                      ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-150'
                      : 'bg-slate-900 border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {cat === 'Bookmarked' ? `🔖 Bookmarked (${bookmarks.length})` : cat}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-48 shrink-0">
          <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${textMuted}`} />
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-9 pr-4 py-1.5 rounded-lg text-xs w-full focus:outline-none focus:ring-1 focus:ring-purple-500/50 bg-white/5 border border-white/10 ${
              isLight ? 'bg-black/5 border-black/10 text-gray-800' : ''
            }`}
          />
        </div>
      </div>

      {/* Blogs List */}
      <div className="flex-grow overflow-y-auto p-5 custom-scrollbar">
        {filteredPosts.length === 0 ? (
          <p className={`text-center text-xs py-12 ${textMuted}`}>No blog posts found</p>
        ) : (
          <div className={`grid ${gridColsClass} gap-4.5 w-full max-w-7xl mx-auto`}>
            {filteredPosts.map((post) => {
              const isBookmarked = bookmarks.includes(post.id);
              return (
                <div
                  key={post.id}
                  onClick={() => handleSelectPost(post)}
                  className={`p-4 rounded-2xl border flex flex-col space-y-3 cursor-pointer transition select-none ${cardBg}`}
                >
                  <div className="w-full h-32 rounded-xl overflow-hidden relative shadow">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover transition transform hover:scale-105" />
                    <button
                      onClick={(e) => toggleBookmark(post.id, e)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-gray-400 hover:text-white transition"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                    </button>
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap max-w-[80%]">
                      <span className="bg-purple-600/90 backdrop-blur-md text-white font-bold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded border border-purple-500/30 shadow-sm">
                        {post.category}
                      </span>
                      {post.featured && (
                        <span className="bg-amber-500/90 backdrop-blur-md text-black font-extrabold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm">
                          🔥 Top Pick
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-bold leading-relaxed line-clamp-2 text-white">{post.title}</h3>
                    <p className={`text-[10px] line-clamp-2 leading-relaxed ${textMuted}`}>{post.excerpt}</p>
                  </div>

                  <div className={`flex items-center justify-between text-[8px] font-bold uppercase tracking-wider mt-auto pt-2 border-t border-white/5 ${textMuted}`}>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-purple-400" />
                      <span>{post.date}</span>
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      {(post.claps ?? 0) > 0 && (
                        <span className="text-amber-400 font-extrabold flex items-center gap-0.5 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          👏 {post.claps}
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-purple-400" />
                        <span>{post.readingTime || 5} min read</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

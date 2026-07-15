import React, { useState } from 'react';
import { blogPosts } from '../../data/blogs';
import { BlogPost } from '../../types';
import { Search, Bookmark, Calendar, Clock, ExternalLink, ArrowLeft } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';

export default function BlogApp() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const theme = useOSStore((state) => state.theme);

  const categories = ['All', 'Mojo', 'LLM', 'Docker', 'Python'];

  const toggleBookmark = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    );
  };

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCat =
      selectedCat === 'All' ||
      post.category.toLowerCase().includes(selectedCat.toLowerCase()) ||
      selectedCat.toLowerCase().includes(post.category.toLowerCase());
    
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

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
          
          <button
            onClick={(e) => toggleBookmark(selectedPost.id, e)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`} />
          </button>
        </div>

        {/* Read Article Details Container */}
        <div className="flex-grow overflow-y-auto p-6 max-w-2xl mx-auto w-full space-y-6 custom-scrollbar">
          <div className="w-full h-56 rounded-2xl overflow-hidden shadow-lg border border-white/10">
            <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-2.5">
            <span className="bg-purple-600/20 text-purple-400 text-[10px] font-bold px-2.5 py-0.5 rounded border border-purple-500/25 uppercase tracking-wider">
              {selectedPost.category}
            </span>
            <h2 className="text-lg sm:text-2xl font-bold leading-normal text-white">{selectedPost.title}</h2>
            
            <div className={`flex items-center space-x-4 text-xs font-semibold ${textMuted}`}>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>{selectedPost.date}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>5 min read</span>
              </span>
            </div>
          </div>

          <div className="border-t border-white/10 dark:border-gray-800 pt-5">
            <p className={`text-sm leading-relaxed text-justify mb-8 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
              {selectedPost.excerpt}
              <br /><br />
              This article covers deep technical concepts regarding compiler acceleration, optimization, dependency caching, or container management. Read the complete publication on Medium to view code snippets, benchmarks, and interactive community discussions.
            </p>

            <a
              href={selectedPost.link}
              target="_blank"
              rel="noopener noreferrer"
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
        <div className="flex space-x-1.5 overflow-x-auto custom-scrollbar flex-grow mr-2">
          {categories.map((cat) => {
            const isSel = selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSel
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : isLight
                      ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-150'
                      : 'bg-slate-900 border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {cat}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            {filteredPosts.map((post) => {
              const isBookmarked = bookmarks.includes(post.id);
              return (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
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
                    <span className="absolute top-2.5 left-2.5 bg-purple-600/80 backdrop-blur-md text-white font-bold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded border border-purple-500/30 shadow-sm">
                      {post.category}
                    </span>
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
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-purple-400" />
                      <span>5 min read</span>
                    </span>
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

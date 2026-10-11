import React, { useState, useEffect } from 'react';
import { projects } from '../../data/projects';
import { Project } from '../../types';
import { Folder, Grid, List, Search, Github, ExternalLink, X, Star } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { trackEvent, trackSearch } from '../../utils/analytics';

import { resolveAsset } from '../../utils/paths';
const FAVORITES_STORAGE_KEY = 'portfolio-os-project-favorites';

function loadFavorites(): number[] {
  const defaults = projects.filter((p) => p.featured).map((p) => p.id);
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === 'number') : defaults;
  } catch {
    return defaults;
  }
}

export default function ProjectsApp({ isMobileView }: { isMobileView?: boolean }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [favorites, setFavorites] = useState<number[]>(loadFavorites);
  const theme = useOSStore((state) => state.theme);
  const unlockAchievement = useOSStore((state) => state.unlockAchievement);
  const globalViewMode = useOSStore((state) => state.viewMode);
  const isSimulatingMobile = useOSStore((state) => state.isSimulatingMobile);

  // Fire project_browser achievement once on first open
  useEffect(() => { unlockAchievement('project_browser'); }, [unlockAchievement]);

  // Persist favourites across sessions
  useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Storage unavailable (private mode, quota) — favourites stay in memory only
    }
  }, [favorites]);

  // Track search query. trackSearch debounces per scope (1.5s) and ignores empty
  // queries, so only one event fires after typing pauses.
  useEffect(() => {
    trackSearch('projects', searchQuery);
  }, [searchQuery]);

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  };

  const [sidebarWidth, setSidebarWidth] = useState(288);
  const sidebarStartRef = React.useRef<{ clientX: number; startWidth: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const checkIsMobile = () => {
      return !!(isMobileView || isSimulatingMobile || mql.matches || globalViewMode === 'mobile');
    };
    setIsMobile(checkIsMobile());

    const handler = () => setIsMobile(checkIsMobile());
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [isMobileView, isSimulatingMobile, globalViewMode]);

  const handlePointerDownResize = (e: React.PointerEvent) => {
    e.preventDefault();
    sidebarStartRef.current = { clientX: e.clientX, startWidth: sidebarWidth };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMoveResize = (e: React.PointerEvent) => {
    if (!sidebarStartRef.current) return;
    const delta = e.clientX - sidebarStartRef.current.clientX;
    const newWidth = sidebarStartRef.current.startWidth - delta;
    setSidebarWidth(Math.max(200, Math.min(600, newWidth)));
  };

  const handlePointerUpResize = (e: React.PointerEvent) => {
    sidebarStartRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Categorize
  const categories = [
    'All',
    'Products & Software',
    'AI & ML',
    'Reinforcement Learning',
    'Data & Analytics',
    'Cloud & Backend',
    'Course & Practice',
    '⭐ Favorites'
  ];

  const filteredProjects = projects.filter((project) => {
    if (selectedCategory === '⭐ Favorites') return favorites.includes(project.id);

    const matchesCategory =
      selectedCategory === 'All' ||
      project.category.some((cat) => {
        const pCat = cat.toLowerCase();
        const sCat = selectedCategory.toLowerCase();
        if (sCat === 'products & software') {
          return pCat.includes('product') || pCat.includes('software');
        }
        if (sCat === 'ai & ml') {
          return pCat.includes('ai') || pCat.includes('machine learning');
        }
        if (sCat === 'reinforcement learning') {
          return pCat.includes('reinforcement');
        }
        if (sCat === 'data & analytics') {
          return pCat.includes('data') || pCat.includes('analytics');
        }
        if (sCat === 'cloud & backend') {
          return pCat.includes('cloud') || pCat.includes('backend');
        }
        if (sCat === 'course & practice') {
          return pCat.includes('course') || pCat.includes('practice');
        }
        return pCat.includes(sCat) || sCat.includes(pCat);
      });
    
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Base styling per theme
  const isLight = theme === 'light';
  const explorerBg = isLight ? 'bg-gray-50 text-gray-800' : 'bg-slate-950 text-purple-100';
  const sidebarBg = isLight ? 'bg-white border-r border-gray-200' : 'bg-slate-900/60 border-r border-white/5';
  const cardBg = isLight ? 'bg-white border-gray-200 hover:bg-gray-50' : 'bg-slate-900/50 border-white/5 hover:bg-slate-800/40';
  const textMuted = isLight ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className={`flex grow h-full overflow-hidden ${explorerBg} custom-scrollbar`}>
      {/* Sidebar Categories - desktop only */}
      {!isMobile && <div className={`flex w-48 shrink-0 p-4 flex-col space-y-2 select-none ${sidebarBg}`}>
        <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${textMuted}`}>Categories</h3>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                trackEvent('project_category_change', { category: cat });
                setSelectedProject(null); // Hide preview on category switch
              }}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                isSelected 
                  ? 'bg-purple-600/20 text-purple-300 border-l-2 border-purple-500'
                  : 'hover:bg-white/5 text-gray-300 hover:text-white'
              } ${isLight && isSelected ? 'bg-purple-50 text-purple-600 border-purple-600' : ''} ${isLight && !isSelected ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' : ''}`}
            >
              <Folder className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-gray-400'}`} />
              <span className="truncate">{cat}</span>
            </button>
          );
        })}
      </div>}

      {/* Explorer Central Container */}
      <div className="grow flex flex-col min-w-0">
        
        {/* Mobile Categories Bar */}
        {isMobile && <div className="flex px-3 py-2 border-b border-white/5 space-x-1.5 overflow-x-auto shrink-0 select-none custom-scrollbar bg-black/10">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  trackEvent('project_category_change', { category: cat });
                  setSelectedProject(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition whitespace-nowrap border shrink-0 ${
                  isSelected
                    ? isLight
                      ? 'bg-purple-50 border-purple-650 text-purple-650'
                      : 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : isLight
                      ? 'bg-white border-gray-200 text-gray-600'
                      : 'bg-slate-900 border-white/5 text-gray-400'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>}

        {/* Explorer Address Bar / Search & Controls */}
        <div className={`p-3 border-b flex items-center justify-between space-x-4 ${isLight ? 'border-gray-200' : 'border-white/5'}`}>
          <div className="relative grow max-w-md">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${textMuted}`} />
            <input
              type="text"
              placeholder="Search in projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 pr-4 py-1.5 rounded-lg text-xs w-full focus:outline-hidden focus:ring-1 focus:ring-purple-500/50 bg-white/5 border border-white/10 ${
                isLight ? 'bg-black/5 border-black/10 text-gray-800' : ''
              }`}
            />
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg hover:bg-white/10 ${viewMode === 'grid' ? 'text-purple-400 bg-white/5' : 'text-gray-400'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg hover:bg-white/10 ${viewMode === 'list' ? 'text-purple-400 bg-white/5' : 'text-gray-400'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Folder Grid */}
        <div className="grow flex overflow-hidden">
          <div className="grow overflow-y-auto p-4 min-w-0 custom-scrollbar">
            {filteredProjects.length === 0 ? (
              <p className={`text-center text-xs py-12 ${textMuted}`}>No projects match search filters</p>
            ) : viewMode === 'grid' ? (
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => {
                      setSelectedProject(project);
                      trackEvent('project_open', { project_title: project.title, project_id: project.id });
                    }}
                    className={`p-4 rounded-xl border flex flex-col space-y-3 cursor-pointer transition select-none ${cardBg} ${
                      selectedProject?.id === project.id ? 'ring-1 ring-purple-500 border-purple-500/40 bg-purple-500/5' : ''
                    }`}
                  >
                    <div className="w-full h-28 rounded-lg overflow-hidden relative">
                      <img src={resolveAsset(project.image)} alt={project.title} className="w-full h-full object-cover transition transform hover:scale-105" loading="lazy" />
                      {project.featured && (
                        <span className="absolute top-2 left-2 bg-linear-to-r from-amber-500 to-yellow-400 text-slate-900 font-bold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-md shadow-sm">
                          Favorite
                        </span>
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-bold truncate">{project.title}</h4>
                      <button
                        onClick={(e) => toggleFavorite(project.id, e)}
                        className="shrink-0 p-0.5 rounded-sm hover:bg-white/10 transition"
                        title={favorites.includes(project.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                      >
                        <Star className={`w-3 h-3 transition ${favorites.includes(project.id) ? 'fill-amber-400 text-amber-400' : 'text-gray-600 hover:text-amber-400'}`} />
                      </button>
                    </div>
                    <p className={`text-[10px] line-clamp-2 mt-1 leading-normal ${textMuted}`}>{project.description}</p>
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span key={tech} className="bg-purple-950/40 text-purple-300 text-[8px] font-bold px-1.5 py-0.5 rounded-sm border border-purple-800/30">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="text-[8px] text-gray-400 font-bold self-center">+{project.technologies.length - 3} more</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col space-y-1.5">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => {
                      setSelectedProject(project);
                      trackEvent('project_open', { project_title: project.title, project_id: project.id });
                    }}
                    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition ${cardBg} ${
                      selectedProject?.id === project.id ? 'border-purple-500 bg-purple-500/5' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <Folder className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="text-xs font-semibold truncate">{project.title}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[9px] text-gray-400">
                      {!isMobile && <span className="truncate">{project.category[0]}</span>}
                      <span className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-sm text-[8px]">{project.technologies[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Sidebar Pane */}
          {selectedProject && (
            <>
              {/* Resize Handle - desktop only */}
              {!isMobile && <div
                onPointerDown={handlePointerDownResize}
                onPointerMove={handlePointerMoveResize}
                onPointerUp={handlePointerUpResize}
                className="w-1 cursor-col-resize hover:bg-purple-500/40 active:bg-purple-600 transition-colors self-stretch shrink-0 relative z-10"
                style={{ marginLeft: '-2px' }}
              />}
              <div 
                style={{ width: isMobile ? '100%' : `${sidebarWidth}px` }}
                className={`shrink-0 p-5 border-l flex flex-col space-y-4 overflow-y-auto select-none ${
                  isLight ? 'bg-white border-gray-200' : 'bg-slate-900 border-white/10'
                } custom-scrollbar ${isMobile ? 'absolute inset-y-0 right-0 z-30' : 'relative'}`}
              >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider">{selectedProject.category.join(' / ')}</span>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition"
                  title="Close Preview"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-full h-36 rounded-xl overflow-hidden shadow-inner">
                <img src={resolveAsset(selectedProject.image)} alt={selectedProject.title} className="w-full h-full object-cover" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-bold leading-snug">{selectedProject.title}</h3>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className={`p-2.5 rounded-lg border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                  <span className={`block text-[8px] uppercase tracking-wider ${isLight ? 'text-slate-600 font-bold' : 'text-gray-400'}`}>Duration</span>
                  <span className={`font-bold mt-0.5 block ${isLight ? 'text-slate-900' : 'text-white'}`}>{selectedProject.duration || 'N/A'}</span>
                </div>
                <div className={`p-2.5 rounded-lg border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                  <span className={`block text-[8px] uppercase tracking-wider ${isLight ? 'text-slate-600 font-bold' : 'text-gray-400'}`}>Status</span>
                  <span className="font-bold text-emerald-500 mt-0.5 block">{selectedProject.status || 'Completed'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : textMuted}`}>Summary</h4>
                <p className={`text-xs leading-relaxed text-justify ${isLight ? 'text-slate-800 font-medium' : 'text-gray-300'}`}>{selectedProject.description}</p>
              </div>

              <div className="space-y-2">
                <h4 className={`text-[10px] font-bold uppercase tracking-wider ${textMuted}`}>Tech Stack</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.technologies.map((tech) => (
                    <span key={tech} className="bg-purple-600/10 text-purple-400 text-[9px] font-bold px-2 py-0.5 rounded-sm border border-purple-500/25">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-2 mt-auto">
                {selectedProject.github && (
                  <a
                    href={selectedProject.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('project_github_click', { project_title: selectedProject.title })}
                    className="grow bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 px-3 rounded-lg border border-gray-800 flex items-center justify-center space-x-1.5 transition"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>Repository</span>
                  </a>
                )}
                {selectedProject.demo && (
                  <a
                    href={selectedProject.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent('project_demo_click', { project_title: selectedProject.title })}
                    className="grow bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Launch</span>
                  </a>
                )}
              </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { projects } from '../../data/projects';
import { Project } from '../../types';
import { Folder, Grid, List, Search, Github, ExternalLink, X } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';

export default function ProjectsApp() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null); // Hide preview panel by default
  const theme = useOSStore((state) => state.theme);

  // Categorize
  const categories = ['All', 'AI & ML', 'Cloud & Backend', 'Data & Automation'];

  const filteredProjects = projects.filter((project) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      project.category.some((cat) => {
        const pCat = cat.toLowerCase();
        const sCat = selectedCategory.toLowerCase();
        if (sCat === 'ai & ml') {
          return pCat.includes('ai') || pCat.includes('machine learning');
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
    <div className={`flex flex-grow h-full overflow-hidden ${explorerBg} custom-scrollbar`}>
      {/* Sidebar Categories */}
      <div className={`w-48 flex-shrink-0 p-4 flex flex-col space-y-2 select-none ${sidebarBg}`}>
        <h3 className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${textMuted}`}>Categories</h3>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
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
      </div>

      {/* Explorer Central Container */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Explorer Address Bar / Search & Controls */}
        <div className={`p-3 border-b flex items-center justify-between space-x-4 ${isLight ? 'border-gray-200' : 'border-white/5'}`}>
          <div className="relative flex-grow max-w-md">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${textMuted}`} />
            <input
              type="text"
              placeholder="Search in projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 pr-4 py-1.5 rounded-lg text-xs w-full focus:outline-none focus:ring-1 focus:ring-purple-500/50 bg-white/5 border border-white/10 ${
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
        <div className="flex-grow flex overflow-hidden">
          <div className="flex-grow overflow-y-auto p-4 min-w-0 custom-scrollbar">
            {filteredProjects.length === 0 ? (
              <p className={`text-center text-xs py-12 ${textMuted}`}>No projects match search filters</p>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`p-4 rounded-xl border flex flex-col space-y-3 cursor-pointer transition select-none ${cardBg} ${
                      selectedProject?.id === project.id ? 'ring-1 ring-purple-500 border-purple-500/40 bg-purple-500/5' : ''
                    }`}
                  >
                    <div className="w-full h-28 rounded-lg overflow-hidden relative">
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover transition transform hover:scale-105" loading="lazy" />
                      {project.featured && (
                        <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 font-bold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-md shadow">
                          Favorite
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold truncate">{project.title}</h4>
                      <p className={`text-[10px] line-clamp-2 mt-1 leading-normal ${textMuted}`}>{project.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span key={tech} className="bg-purple-950/40 text-purple-300 text-[8px] font-bold px-1.5 py-0.5 rounded border border-purple-800/30">
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
                    onClick={() => setSelectedProject(project)}
                    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition ${cardBg} ${
                      selectedProject?.id === project.id ? 'border-purple-500 bg-purple-500/5' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <Folder className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span className="text-xs font-semibold truncate">{project.title}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[9px] text-gray-400">
                      <span className="hidden md:inline truncate">{project.category[0]}</span>
                      <span className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[8px]">{project.technologies[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Sidebar Pane */}
          {selectedProject && (
            <div className={`w-72 flex-shrink-0 p-5 border-l flex flex-col space-y-4 overflow-y-auto select-none ${
              isLight ? 'bg-white border-gray-200' : 'bg-slate-900/40 border-white/5'
            } custom-scrollbar`}>
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
                <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-bold leading-snug">{selectedProject.title}</h3>
              </div>

              {/* Duration and Status metadata widgets */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className={`p-2.5 rounded-lg border ${isLight ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/5'}`}>
                  <span className="text-gray-400 block text-[8px] uppercase tracking-wider">Duration</span>
                  <span className="font-bold text-white mt-0.5 block">{selectedProject.duration || 'N/A'}</span>
                </div>
                <div className={`p-2.5 rounded-lg border ${isLight ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/5'}`}>
                  <span className="text-gray-400 block text-[8px] uppercase tracking-wider">Status</span>
                  <span className="font-bold text-emerald-400 mt-0.5 block">{selectedProject.status || 'Completed'}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className={`text-[10px] font-bold uppercase tracking-wider ${textMuted}`}>Summary</h4>
                <p className={`text-xs leading-relaxed text-justify ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>{selectedProject.description}</p>
              </div>

              <div className="space-y-2">
                <h4 className={`text-[10px] font-bold uppercase tracking-wider ${textMuted}`}>Tech Stack</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.technologies.map((tech) => (
                    <span key={tech} className="bg-purple-600/10 text-purple-400 text-[9px] font-bold px-2 py-0.5 rounded border border-purple-500/25">
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
                    className="flex-grow bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 px-3 rounded-lg border border-gray-800 flex items-center justify-center space-x-1.5 transition"
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
                    className="flex-grow bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Launch</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { skills } from '../../data/skills';
import { projects } from '../../data/projects';
import { Skill } from '../../types';
import { Info, Sparkles, Target, Library, ZoomIn, ZoomOut, RotateCcw, LayoutGrid, GitBranch } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';

const SKILL_ALIASES: Record<string, string[]> = {
  'GCP': ['cloud', 'gcp', 'firestore', 'pub/sub', 'serverless'],
  'Java': ['java', 'spring', 'springboot', 'apis'],
  'Python': ['python', 'pytorch', 'yolov5', 'opencv', 'flask', 'streamlit', 'scikit-learn', 'selenium', 'scrapper'],
  'React': ['react', 'javascript', 'typescript', 'frontend', 'html', 'css'],
  'SQL': ['sql', 'sqlite', 'postgresql', 'mysql', 'database', 'sqlalchemy', 'power bi'],
  'GitHub': ['github', 'git', 'repository'],
  'YOLO': ['yolov5', 'yolo', 'pytorch', 'computer vision', 'opencv'],
  'Machine Learning': ['machine learning', 'pytorch', 'scikit-learn', 'whisper', 'reinforcement learning', 'cnn', 'yolov5', 'neural']
};

export default function SkillsApp() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null);
  const [activeSkill, setActiveSkill] = useState<Skill | null>(skills[0] || null);
  const [viewType, setViewType] = useState<'constellation' | 'grid'>('constellation');
  const theme = useOSStore((state) => state.theme);

  // Zoom/Pan State
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const categories = ['All', 'Languages', 'Backend', 'Frontend', 'Databases', 'Cloud', 'AI', 'Tools'];
  const targetSkill = hoveredSkill || activeSkill;

  // Find projects that use this skill (match by technology name and keywords)
  const relatedProjects = targetSkill
    ? projects.filter((p) => {
        const skillNameLower = targetSkill.name.toLowerCase();
        const aliases = SKILL_ALIASES[targetSkill.name] || [skillNameLower];
        
        return p.technologies.some((tech) => {
          const techLower = tech.toLowerCase();
          return (
            techLower.includes(skillNameLower) ||
            skillNameLower.includes(techLower) ||
            aliases.some((alias) => techLower.includes(alias.toLowerCase()) || alias.toLowerCase().includes(techLower))
          );
        });
      })
    : [];

  const isLight = theme === 'light';
  const appBg = isLight ? 'bg-white text-gray-800' : 'bg-slate-950 text-purple-100';
  const sidebarBg = isLight ? 'bg-gray-50 border-l border-gray-200' : 'bg-slate-900/40 border-l border-white/5';
  const nodeFill = isLight ? '#f3e8ff' : '#2e1065';
  const nodeStroke = isLight ? '#a855f7' : '#c084fc';
  const centerFill = isLight ? '#ede9fe' : '#1e1b4b';
  const centerStroke = '#818cf8';

  // SVG dimensions
  const width = 500;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;

  // Generate constellation coordinates for categories
  const categoryAngles: Record<string, number> = {
    'Languages': 0,
    'Backend': 50,
    'Frontend': 100,
    'Databases': 150,
    'Cloud': 200,
    'AI': 260,
    'Tools': 310
  };

  const getCoordinates = (category: string, index: number, total: number, isSubNode: boolean = false) => {
    const angleOffset = categoryAngles[category] || 0;
    const rad = (angleOffset * Math.PI) / 180;
    
    if (!isSubNode) {
      // Main category node radius
      const radius = 95;
      return {
        x: centerX + radius * Math.cos(rad),
        y: centerY + radius * Math.sin(rad),
      };
    } else {
      // Skill sub-node branching out from category node
      // Alternate radius to prevent overlaps!
      const radius = index % 2 === 0 ? 145 : 180;
      const subSpread = 22; // spread angle
      const spreadAngle = ((index - (total - 1) / 2) * subSpread * Math.PI) / 180;
      return {
        x: centerX + radius * Math.cos(rad + spreadAngle),
        y: centerY + radius * Math.sin(rad + spreadAngle),
      };
    }
  };

  // Drag and zoom handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomIntensity = 0.05;
    const nextScale = Math.max(0.6, Math.min(2.5, scale - e.deltaY * zoomIntensity * 0.01));
    setScale(nextScale);
  };

  const resetZoomPan = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className={`flex flex-col md:flex-row flex-grow h-full overflow-hidden ${appBg} custom-scrollbar`}>
      {/* Constellation Workspace */}
      <div className="flex-grow flex flex-col min-w-0 p-4 select-none relative">
        {/* Navigation Categories tab */}
        <div className="flex justify-between items-center pb-3 border-b border-white/5 space-x-4">
          <div className="flex space-x-1.5 overflow-x-auto custom-scrollbar flex-grow">
            {categories.map((cat) => {
              const isSel = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border shrink-0 ${
                    isSel
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : isLight
                        ? 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                        : 'bg-slate-900 border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Zoom Controls + View Toggle */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {viewType === 'constellation' && (
              <div className="flex items-center space-x-1 bg-slate-900 border border-white/5 rounded-lg p-0.5">
                <button onClick={() => setScale(Math.min(2.5, scale + 0.15))} className="p-1 text-gray-400 hover:text-white transition" title="Zoom In">
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setScale(Math.max(0.6, scale - 0.15))} className="p-1 text-gray-400 hover:text-white transition" title="Zoom Out">
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button onClick={resetZoomPan} className="p-1 text-gray-400 hover:text-white transition" title="Reset View">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="flex items-center bg-slate-900 border border-white/5 rounded-lg p-0.5">
              <button
                onClick={() => setViewType('constellation')}
                className={`p-1.5 rounded-md transition ${viewType === 'constellation' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                title="Constellation View"
              >
                <GitBranch className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewType('grid')}
                className={`p-1.5 rounded-md transition ${viewType === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

          {/* Constellation Chart (SVG Canvas) */}
          {viewType === 'constellation' ? (
            <>
          <div className="flex-grow flex items-center justify-center relative overflow-hidden mt-2 min-h-[300px]">
          <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full max-w-[480px] h-auto drop-shadow-[0_0_10px_rgba(99,102,241,0.1)] touch-none cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
          >
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`} className="origin-center transition-transform duration-75">
              
              {/* Draw Constellation connecting lines */}
              {categories.slice(1).map((cat) => {
                const catPos = getCoordinates(cat, 0, 0, false);
                const catSkills = skills.filter((s) => s.category === cat);
                const isCatActive = selectedCategory === 'All' || selectedCategory === cat;

                return (
                  <g key={cat} className="transition-opacity duration-300" style={{ opacity: isCatActive ? 1 : 0.15 }}>
                    {/* Central Node to Category Node */}
                    <line
                      x1={centerX}
                      y1={centerY}
                      x2={catPos.x}
                      y2={catPos.y}
                      stroke="rgba(129, 140, 248, 0.4)"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                    />
                    
                    {/* Category Node to sub skill nodes */}
                    {catSkills.map((sk, idx) => {
                      const skPos = getCoordinates(cat, idx, catSkills.length, true);
                      const isSkillActive = targetSkill?.name === sk.name;
                      return (
                        <line
                          key={sk.name}
                          x1={catPos.x}
                          y1={catPos.y}
                          x2={skPos.x}
                          y2={skPos.y}
                          stroke={isSkillActive ? '#c084fc' : 'rgba(168, 85, 247, 0.2)'}
                          strokeWidth={isSkillActive ? 2 : 1}
                        />
                      );
                    })}
                  </g>
                );
              })}

              {/* Central Node (Developer node) */}
              <circle
                cx={centerX}
                cy={centerY}
                r={18}
                fill={centerFill}
                stroke={centerStroke}
                strokeWidth={2}
                className="animate-pulse"
              />
              <text
                x={centerX}
                y={centerY + 3}
                textAnchor="middle"
                className={`text-[7px] font-extrabold font-mono ${isLight ? 'fill-indigo-900' : 'fill-indigo-200'}`}
              >
                HARSHIT
              </text>

              {/* Category Nodes */}
              {categories.slice(1).map((cat) => {
                const catPos = getCoordinates(cat, 0, 0, false);
                const isCatActive = selectedCategory === 'All' || selectedCategory === cat;
                return (
                  <g
                    key={cat}
                    className="transition-opacity duration-300"
                    style={{ opacity: isCatActive ? 1 : 0.15 }}
                  >
                    <circle
                      cx={catPos.x}
                      cy={catPos.y}
                      r={10}
                      fill={isLight ? '#f5f3ff' : '#1e1b4b'}
                      stroke={nodeStroke}
                      strokeWidth={1.5}
                    />
                    <text
                      x={catPos.x}
                      y={catPos.y + 13}
                      textAnchor="middle"
                      className={`text-[8px] font-bold ${isLight ? 'fill-gray-600' : 'fill-purple-300'}`}
                    >
                      {cat.substring(0, 4)}
                    </text>
                  </g>
                );
              })}

              {/* Skill Sub-Nodes */}
              {categories.slice(1).map((cat) => {
                const catSkills = skills.filter((s) => s.category === cat);
                const isCatActive = selectedCategory === 'All' || selectedCategory === cat;

                return (
                  <g key={cat} className="transition-opacity duration-300" style={{ opacity: isCatActive ? 1 : 0.15 }}>
                    {catSkills.map((sk, idx) => {
                      const skPos = getCoordinates(cat, idx, catSkills.length, true);
                      const isHovered = targetSkill?.name === sk.name;

                      return (
                        <g
                          key={sk.name}
                          onMouseEnter={() => setHoveredSkill(sk)}
                          onMouseLeave={() => setHoveredSkill(null)}
                          onClick={() => setActiveSkill(sk)}
                          className="cursor-pointer"
                        >
                          <circle
                            cx={skPos.x}
                            cy={skPos.y}
                            r={isHovered ? 7.5 : 5.5}
                            fill={isHovered ? '#a855f7' : nodeFill}
                            stroke={nodeStroke}
                            strokeWidth={1.2}
                            className="transition-all duration-205"
                          />
                          <text
                            x={skPos.x}
                            y={skPos.y - 8}
                            textAnchor="middle"
                            className={`text-[7px] font-semibold transition-all ${
                              isHovered 
                                ? 'fill-purple-300 font-extrabold text-[8px]' 
                                : isLight ? 'fill-gray-500' : 'fill-gray-400'
                            }`}
                          >
                            {sk.name.split(' ')[0]}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </g>
          </svg>

          </div>
          </>
          ) : (
            /* ── Grid View ─────────────────────────────────────────────────── */
            <div className="flex-grow overflow-y-auto mt-3 custom-scrollbar">
              {categories.slice(1).map((cat) => {
                const catSkills = skills.filter((s) =>
                  (selectedCategory === 'All' || selectedCategory === cat) && s.category === cat
                );
                if (catSkills.length === 0) return null;
                return (
                  <div key={cat} className="mb-5">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-purple-400 mb-2 flex items-center space-x-1">
                      <span className="w-4 h-0.5 bg-purple-500 inline-block" />
                      <span>{cat}</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {catSkills.map((skill) => {
                        const projCount = projects.filter((p) =>
                          p.technologies.some((t) => t.toLowerCase().includes(skill.name.toLowerCase()) || skill.name.toLowerCase().includes(t.toLowerCase()))
                        ).length;
                        return (
                          <button
                            key={skill.name}
                            onClick={() => setActiveSkill(skill)}
                            className={`text-left p-2.5 rounded-xl border transition text-xs ${
                              activeSkill?.name === skill.name
                                ? 'border-purple-500 bg-purple-600/10'
                                : isLight ? 'border-gray-200 bg-white hover:border-purple-300' : 'border-white/8 bg-white/3 hover:border-purple-500/40'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-[11px] truncate">{skill.name}</span>
                              {projCount > 0 && (
                                <span className="text-[8px] text-emerald-400 font-bold shrink-0">{projCount}P</span>
                              )}
                            </div>
                            <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400"
                                style={{ width: `${skill.proficiency}%` }}
                              />
                            </div>
                            <p className="text-[8px] text-gray-500 mt-1">{skill.proficiency}%</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {/* Details sidebar pane */}
      {targetSkill && (
        <div className={`w-full md:w-72 flex-shrink-0 p-5 flex flex-col space-y-4 select-none ${sidebarBg} overflow-y-auto max-h-full custom-scrollbar`}>
          <div className="flex items-center space-x-2.5 pb-2.5 border-b border-white/5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/25">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold leading-snug">{targetSkill.name}</h3>
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">{targetSkill.category}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-400">
              <span>Experience Rank</span>
              <span className="text-purple-400">{targetSkill.proficiency}%</span>
            </div>
            <div className="w-full bg-white/5 border border-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${targetSkill.proficiency}%` }}
              />
            </div>
          </div>

          {/* Connected Projects */}
          <div className="flex-grow overflow-y-auto space-y-2.5 min-h-[140px] custom-scrollbar">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1.5">
              <Library className="w-3.5 h-3.5 text-indigo-400" />
              <span>Matching Projects</span>
            </h4>
            
            {relatedProjects.length === 0 ? (
              <div className={`p-4 rounded-xl border border-white/5 text-center flex flex-col items-center justify-center space-y-2 ${isLight ? 'bg-gray-100/50 border-gray-200' : 'bg-white/5'}`}>
                <Info className="w-5 h-5 text-purple-400 animate-pulse" />
                <div>
                  <p className="text-[10px] font-bold text-white">General Competency</p>
                  <p className="text-[9px] text-gray-400 mt-1 leading-normal">
                    This skill is utilized across script automations, offline tools, and auxiliary workflows not currently cataloged.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-1.5">
                {relatedProjects.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between text-[11px]"
                  >
                    <span className="font-semibold truncate max-w-[160px]">{p.title}</span>
                    {p.github && (
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 font-bold text-[9px] uppercase flex items-center space-x-0.5 shrink-0"
                      >
                        <span>Code</span>
                        <Target className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-purple-950/20 border border-purple-800/35 p-3 rounded-xl flex items-start space-x-2 text-[10px]">
            <Info className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
            <p className="text-gray-400 leading-normal">
              Proficiency ranks represent classroom and production hours spent integrating this technology.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { skills } from '../../data/skills';
import { projects } from '../../data/projects';
import { Skill, Project } from '../../types';
import { Info, Sparkles, Target, Library, ZoomIn, ZoomOut, RotateCcw, LayoutGrid, GitBranch, CheckCircle2, Lock, Unlock } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { trackEvent } from '../../utils/analytics';

// Short SVG node label mappings to prevent text collision
const SKILL_SHORT_NAMES: Record<string, string> = {
  'Google Cloud Platform (GCP)': 'GCP',
  'Cloud Functions & Pub/Sub': 'Cloud Functions',
  'Google App Engine': 'App Engine',
  'Docker & Containerization': 'Docker',
  'CI/CD & GitHub Actions': 'CI/CD Actions',
  'React (Frontend Dev)': 'React',
  'HTML5 & CSS3': 'HTML5 & CSS',
  'SQL Querying': 'SQL Querying',
  'Computer Vision (YOLO)': 'YOLO / CV',
  'Workflow Automation': 'Automation',
  'AI-driven Data Processing': 'AI Processing',
  'Model Integration': 'Model Serving',
  'AI-assisted development (Claude Code, Codex)': 'AI-assisted Dev',
  'Jira & VS Code': 'Jira & VS Code',
  'Git & GitHub': 'Git & GitHub',
  'Jupyter Notebook': 'Jupyter',
  'Backend Services': 'Backend Services',
  'REST APIs': 'REST APIs',
  'API Integration': 'API Integration',
  'Cross-Team Collaboration': 'Collaboration',
  'Problem Solving': 'Problem Solving',
  'Time Management': 'Time Mgmt',
  'Communication': 'Communication'
};

// Tailored domain competencies and key architectural highlights for every skill
const SKILL_DETAILS: Record<string, { summary: string; keyPoints: string[] }> = {
  'Python': {
    summary: 'Core language for AI/ML modeling, backend automation, web scraping, and production cloud services.',
    keyPoints: ['PyTorch & Deep Q-Learning', 'FastAPI & Pydantic Data Validation', 'Automated Web Scraping (Selenium/BS4)', 'Script & CLI Tooling']
  },
  'Java': {
    summary: 'Object-oriented application development and core algorithmic problem solving.',
    keyPoints: ['Core OOP Architecture', 'Data Structures & Algorithms', 'Concurrent Workflows', 'Backend Enterprise Patterns']
  },
  'SQL': {
    summary: 'Relational data modeling, complex querying, DAX calculations, and financial analytics.',
    keyPoints: ['Analytical Aggregations', 'Schema Normalization', 'Power BI & DAX Integration', 'SQLite & MySQL Integration']
  },
  'JavaScript': {
    summary: 'Full-stack web logic, interactive desktop environments, and async event handling.',
    keyPoints: ['ES6+ Modern Syntax', 'Async / Await & Promises', 'DOM & Canvas Operations', 'React & State Integration']
  },
  'Backend Services': {
    summary: 'Microservice architecture, asynchronous messaging, and scalable backend event pipelines.',
    keyPoints: ['REST & Async Endpoint Design', 'Cloud Trigger Integration', 'Database ORM & Queries', 'Authentication & Middleware']
  },
  'REST APIs': {
    summary: 'Designing robust HTTP interfaces with strict JSON schemas and error handling.',
    keyPoints: ['HTTP Methods & Status Standards', 'Pydantic Payload Validation', 'Rate Limiting & CORS', 'API Documentation & OpenAPI']
  },
  'API Integration': {
    summary: 'Integrating 3rd-party services, payment gateways, and cloud APIs into applications.',
    keyPoints: ['Spotify & Web APIs', 'Google Cloud Pub/Sub & Functions', 'OAuth & API Key Authentication', 'Resilient Retry Logic']
  },
  'Flask': {
    summary: 'Lightweight WSGI Python microframework for rapid API prototyping and ML model serving.',
    keyPoints: ['RESTful Endpoint Routing', 'ML Model Serialization (Pickle/Joblib)', 'CORS & Frontend Hookup', 'Lightweight Microservices']
  },
  'React (Frontend Dev)': {
    summary: 'Building state-of-the-art responsive UIs, custom OS desktop interfaces, and web applications.',
    keyPoints: ['Custom React Hooks & Context', 'Zustand Global State Management', 'Tailwind CSS & Glassmorphism UI', 'Vite & High Performance Bundling']
  },
  'HTML5 & CSS3': {
    summary: 'Semantic web structure, responsive fluid layouts, and modern CSS animation techniques.',
    keyPoints: ['Semantic Layout Elements', 'CSS Grid & Flexbox Master', 'Custom Micro-animations', 'Dark/Light Theme Styling']
  },
  'Firestore': {
    summary: 'NoSQL document-based database for real-time app sync, document collections, and cloud backends.',
    keyPoints: ['Real-time Event Listeners', 'Document & Collection Schemas', 'Local Emulator Testing', 'GCP Cloud Integration']
  },
  'SQL Querying': {
    summary: 'High-performance SQL querying, complex joins, CTEs, and window functions.',
    keyPoints: ['Subqueries & CTEs', 'Window Functions & Ranking', 'Data Cleaning & Transformation', 'Analytical KPI Dashboards']
  },
  'MySQL': {
    summary: 'Relational database management for production web backends and structured data storage.',
    keyPoints: ['Relational Schema Design', 'Foreign Key Constraints', 'Indexing & Query Speed', 'Backend ORM Connections']
  },
  'Google Cloud Platform (GCP)': {
    summary: 'Google Cloud ecosystem engineering including serverless triggers, pub/sub queues, and storage.',
    keyPoints: ['Cloud Functions & App Engine', 'Pub/Sub Event Messaging', 'IAM Permissions & Service Accounts', 'Local Emulator Environments']
  },
  'Cloud Functions & Pub/Sub': {
    summary: 'Event-driven serverless architecture connecting asynchronous queues with cloud execution.',
    keyPoints: ['Asynchronous Event Processing', 'Pub/Sub Topic & Push Subscriptions', 'Serverless Auto-scaling', 'Automated Email & Data Pipelines']
  },
  'Google App Engine': {
    summary: 'PaaS deployment for containerized Python backend apps with automated scaling.',
    keyPoints: ['App.yaml Configuration', 'Zero-downtime Deployments', 'Traffic Splitting & Health Checks', 'Cloud Logging & Metrics']
  },
  'Docker & Containerization': {
    summary: 'Containerizing environments for consistent local dev, CI/CD testing, and cloud deployment.',
    keyPoints: ['Dockerfile Multi-stage Builds', 'Docker Compose Local Stacks', 'Local GCP Emulator Containers', 'Isolated Service Environments']
  },
  'CI/CD & GitHub Actions': {
    summary: 'Automating build checks, linting, unit testing, and deployment pipelines on GitHub.',
    keyPoints: ['Workflows & YAML Runners', 'Vite Production Build Checks', 'Automated Testing Suites', 'Deployment Automation']
  },
  'Workflow Automation': {
    summary: 'Building autonomous scripts to automate repetitive data collection, processing, and alerts.',
    keyPoints: ['Web Scraping Pipelines', 'Headless Browser Automation', 'Email & Notification Triggers', 'Scheduled Cron Jobs']
  },
  'AI-driven Data Processing': {
    summary: 'Leveraging ML pipelines to clean, extract features, and transform raw structured/unstructured data.',
    keyPoints: ['Feature Engineering & Normalization', 'NLP Spam & Text Processing', 'Predictive Recommendation', 'Dataset Wrangling (Pandas)']
  },
  'Computer Vision (YOLO)': {
    summary: 'Real-time object detection models for plastic classification and sign language recognition.',
    keyPoints: ['YOLO Object Detection (YOLOv5)', 'Bounding Box Annotation & Training', 'OpenCV Frame Manipulation', 'PyTorch Model Export']
  },
  'Model Integration': {
    summary: 'Exporting, packaging, and serving ML/DL models within web applications and desktop tools.',
    keyPoints: ['Model Quantization & Inference', 'Streamlit & Web UI Wrappers', 'PyTorch & Scikit-learn APIs', 'Real-time Video Processing']
  },
  'Git & GitHub': {
    summary: 'Distributed version control, feature branching, pull requests, and open-source collaboration.',
    keyPoints: ['Git Rebase & Branch Workflows', 'PR Code Reviews & Merges', 'GitHub Issues & Milestones', 'Commit History Management']
  },
  'AI-assisted development (Claude Code, Codex)': {
    summary: 'Using AI coding assistants for refactoring, prototyping, and test writing, with every change reviewed and verified by hand.',
    keyPoints: ['Prompting for Refactors', 'Reviewing AI-generated Code', 'Prototyping', 'Test Generation']
  },
  'Jira & VS Code': {
    summary: 'Agile project management, sprint tracking, issue ticketing, and IDE extension workflows.',
    keyPoints: ['Agile Kanban & Sprint Boards', 'VS Code Debugging & Extensions', 'Cross-functional Ticket Lifecycle', 'Developer Workspace Config']
  },
  'Jupyter Notebook': {
    summary: 'Interactive Python environment for data exploration, ML experimentation, and visual plots.',
    keyPoints: ['Exploratory Data Analysis (EDA)', 'Matplotlib & Seaborn Visualization', 'Model Prototype Verification', 'Notebook Documentation']
  },
  'Problem Solving': {
    summary: 'Algorithmic thinking, system debugging, root cause analysis, and efficient solutions.',
    keyPoints: ['Data Structure Optimization', 'Root Cause Debugging', 'Edge-case Handling', 'Scalable Code Design']
  },
  'Cross-Team Collaboration': {
    summary: 'Working smoothly with cross-functional team members across frontend, backend, and cloud.',
    keyPoints: ['Agile Standups & Sprint Planning', 'Clear Technical Documentation', 'API Contract Alignment', 'Peer Code Reviews']
  },
  'Time Management': {
    summary: 'Prioritizing critical path tasks, managing sprint deliverables, and shipping on schedule.',
    keyPoints: ['Sprint Task Decomposition', 'Milestone Tracking', 'Efficient Problem Escalation', 'Focus & Deep Work']
  },
  'Communication': {
    summary: 'Articulating technical architectural decisions clearly to both developers and stakeholders.',
    keyPoints: ['Technical Writing & Docs', 'Architecture Diagrams & Specs', 'Clear Bug Reports', 'Active Listening & Alignment']
  }
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** True when `term` appears in `text` as a whole word (so "java" doesn't match "javascript"). */
function containsTerm(text: string, term: string): boolean {
  if (!term) return false;
  if (text === term) return true;
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(term)}($|[^a-z0-9])`).test(text);
}

/**
 * Robust technology matcher connecting skills to relevant portfolio projects
 */
function getRelatedProjects(skill: Skill | null): Project[] {
  if (!skill) return [];

  const rawName = skill.name.toLowerCase();
  
  // Extract keywords
  const keywords = new Set<string>();
  skill.name.replace(/[()&,/]/g, ' ').split(/\s+/).forEach((token) => {
    const t = token.toLowerCase();
    if (t.length > 1 && !['and', 'the', 'dev', 'for', 'with'].includes(t)) {
      keywords.add(t);
    }
  });

  const ALIAS_MAP: Record<string, string[]> = {
    'python': ['python', 'pandas', 'scikit-learn', 'streamlit', 'pytorch', 'opencv', 'selenium'],
    'java': ['java', 'dsa', 'c++'],
    'sql': ['sql', 'sqlite', 'mysql', 'power bi', 'dax'],
    'javascript': ['javascript', 'typescript', 'react', 'node.js', 'electron'],
    'backend': ['python', 'node.js', 'express', 'fastapi', 'rest', 'api', 'docker', 'gcp', 'sql'],
    'rest': ['api', 'express', 'node.js', 'python', 'fastapi', 'rest'],
    'api': ['api', 'express', 'node.js', 'python', 'fastapi', 'gcp', 'rest'],
    'flask': ['python', 'flask', 'api', 'streamlit'],
    'react': ['react', 'typescript', 'javascript', 'tailwind', 'electron', 'vite'],
    'html5': ['react', 'html', 'css', 'tailwind', 'javascript'],
    'firestore': ['firestore', 'gcp', 'database', 'cloud'],
    'gcp': ['gcp', 'docker', 'cloud', 'firestore', 'pub/sub', 'cloud run'],
    'google': ['gcp', 'docker', 'cloud', 'firestore', 'pub/sub', 'cloud run'],
    'cloud': ['gcp', 'docker', 'cloud', 'firestore', 'pub/sub', 'cloud run'],
    'docker': ['docker', 'gcp', 'container'],
    'ci/cd': ['github actions', 'docker', 'git', 'github'],
    'automation': ['python', 'selenium', 'beautifulsoup4', 'scraping', 'ai'],
    'ai': ['ai', 'python', 'pytorch', 'scikit-learn', 'yolo', 'ml'],
    'yolo': ['yolo', 'yolov5', 'yolov8', 'opencv', 'computer vision', 'pytorch'],
    'model': ['pytorch', 'scikit-learn', 'yolo', 'streamlit', 'ml'],
    'git': ['git', 'github', 'react', 'typescript', 'python'],
    'codex': ['react', 'typescript', 'python', 'vite', 'zustand'],
    'claude': ['react', 'typescript', 'python', 'vite', 'zustand'],
    'jira': ['react', 'python', 'git', 'electron'],
    'jupyter': ['python', 'pandas', 'scikit-learn', 'data analytics', 'sql'],
    'problem': ['python', 'c++', 'algorithms', 'dsa', 'react'],
    'collaboration': ['react', 'typescript', 'git', 'github'],
    'time': ['react', 'typescript', 'electron'],
    'communication': ['react', 'typescript', 'python']
  };

  keywords.forEach((kw) => {
    if (ALIAS_MAP[kw]) {
      ALIAS_MAP[kw].forEach((alias) => keywords.add(alias));
    }
  });

  const kwList = Array.from(keywords);
  const matched = projects.filter((p) => {
    const techMatches = p.technologies.some((tech) => {
      const techLower = tech.toLowerCase();
      return (
        containsTerm(techLower, rawName) ||
        containsTerm(rawName, techLower) ||
        kwList.some((kw) => containsTerm(techLower, kw) || containsTerm(kw, techLower))
      );
    });

    const title = p.title.toLowerCase();
    const description = p.description.toLowerCase();
    const textMatches = kwList.some(
      (kw) => kw.length > 2 && (containsTerm(title, kw) || containsTerm(description, kw))
    );

    return techMatches || textMatches;
  });

  if (matched.length > 0) return matched;
  return projects.filter((p) => p.featured).slice(0, 3);
}

export default function SkillsApp({ isMobileView }: { isMobileView?: boolean } = {}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Selection and Hover states
  const defaultSkill = skills.find((s) => s.name === 'Python') || skills[0] || null;
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(defaultSkill);
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(true);

  const [viewType, setViewType] = useState<'constellation' | 'grid'>('constellation');
  const theme = useOSStore((state) => state.theme);
  const globalViewMode = useOSStore((state) => state.viewMode);
  const isSimulatingMobile = useOSStore((state) => state.isSimulatingMobile);
  const isMobile = isMobileView || globalViewMode === 'mobile' || isSimulatingMobile;

  // Zoom/Pan State
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const categories = ['All', 'Languages', 'Backend', 'Frontend', 'Databases', 'Cloud', 'AI', 'Tools', 'Soft Skills'];
  
  // Target skill displayed in sidebar:
  // Hovering temporarily previews node in sidebar; mouse leave returns to locked selectedSkill
  const targetSkill = hoveredSkill || (isLocked ? selectedSkill : null) || defaultSkill;

  // Related projects matched via smart matcher
  const relatedProjects = getRelatedProjects(targetSkill);

  // Skill domain summary & key points
  const skillMeta = targetSkill ? SKILL_DETAILS[targetSkill.name] || {
    summary: `${targetSkill.name} is used extensively across Harshit's development stack and cloud architecture workflows.`,
    keyPoints: ['Production Integration', 'Performance Optimization', 'Architecture Scaling']
  } : null;

  const isLight = theme === 'light';
  const appBg = isLight ? 'bg-white text-gray-800' : 'bg-[#090a10] text-purple-100';
  const sidebarBg = isLight ? 'bg-gray-50 border-l border-gray-200' : 'bg-[#0d0e17] border-l border-white/5';
  const nodeFill = isLight ? '#f3e8ff' : '#2e1065';
  const nodeStroke = isLight ? '#a855f7' : '#c084fc';
  const centerFill = isLight ? '#ede9fe' : '#1e1b4b';
  const centerStroke = '#818cf8';

  // Spacious 880x680 canvas with center (440, 340) for larger nodes
  const width = 880;
  const height = 680;
  const centerX = width / 2;
  const centerY = height / 2;

  // Categories evenly spaced around the centre, starting at -90° (top)
  const categoriesList = categories.slice(1);
  const categoryAngles: Record<string, number> = {};
  categoriesList.forEach((cat, idx) => {
    categoryAngles[cat] = idx * (360 / categoriesList.length) - 90;
  });

  /**
   * Sector-Ray Layout Engine:
   * Arranges sub-nodes strictly along their category's directional ray with alternating perpendicular offsets.
   * Guaranteed ZERO collision between different category branches!
   */
  const getCoordinates = (category: string, index: number, isSubNode: boolean = false) => {
    const angleOffset = categoryAngles[category] ?? 0;
    const rad = (angleOffset * Math.PI) / 180;
    
    if (!isSubNode) {
      // Category node distance along ray
      const radius = 125;
      return {
        x: centerX + radius * Math.cos(rad),
        y: centerY + radius * Math.sin(rad),
      };
    } else {
      // Skill sub-nodes stay strictly along the category ray sector
      const R_base = 185;
      const R_step = 38;
      const R_skill = R_base + index * R_step;
      
      // Alternating perpendicular offset relative to ray angle
      const perp = (index % 2 === 0 ? -1 : 1) * (20 + Math.floor(index / 2) * 6);
      
      return {
        x: centerX + R_skill * Math.cos(rad) - perp * Math.sin(rad),
        y: centerY + R_skill * Math.sin(rad) + perp * Math.cos(rad),
      };
    }
  };

  // Select + Auto-Lock handler on click
  const handleSelectSkill = (sk: Skill, view: string) => {
    setSelectedSkill(sk);
    setIsLocked(true); // Automatically lock on click!
    trackEvent('skills_node_click', { skill_name: sk.name, view });
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
    const nextScale = Math.max(0.5, Math.min(3.0, scale - e.deltaY * zoomIntensity * 0.01));
    setScale(nextScale);
  };

  const resetZoomPan = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} grow h-full overflow-hidden ${appBg} custom-scrollbar`}>
      {/* Constellation Workspace */}
      <div className="grow flex flex-col min-w-0 p-4 select-none relative">
        {/* Navigation Categories bar */}
        <div className="flex justify-between items-center pb-3 border-b border-white/5 space-x-4">
          <div className="flex space-x-1.5 overflow-x-auto custom-scrollbar grow">
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
                  aria-label={`Select category ${cat}`}
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
                <button onClick={() => setScale(Math.min(3.0, scale + 0.2))} className="p-1 text-gray-400 hover:text-white transition" title="Zoom In" aria-label="Zoom in">
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setScale(Math.max(0.5, scale - 0.2))} className="p-1 text-gray-400 hover:text-white transition" title="Zoom Out" aria-label="Zoom out">
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button onClick={resetZoomPan} className="p-1 text-gray-400 hover:text-white transition" title="Reset View" aria-label="Reset zoom and pan">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="flex items-center bg-slate-900 border border-white/5 rounded-lg p-0.5">
              <button
                onClick={() => setViewType('constellation')}
                className={`p-1.5 rounded-md transition ${viewType === 'constellation' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                title="Constellation View"
                aria-label="Switch to constellation view"
              >
                <GitBranch className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewType('grid')}
                className={`p-1.5 rounded-md transition ${viewType === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                title="Grid View"
                aria-label="Switch to grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Constellation Chart (Flexible full-area SVG Canvas) */}
        {viewType === 'constellation' ? (
          <div className="grow relative overflow-hidden mt-2 w-full h-full min-h-[350px]">
            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full absolute inset-0 drop-shadow-[0_0_15px_rgba(99,102,241,0.18)] touch-none cursor-grab active:cursor-grabbing"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onWheel={handleWheel}
              onMouseLeave={() => setHoveredSkill(null)}
            >
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`} className="origin-center transition-transform duration-75">
                
                {/* Draw Constellation connecting lines */}
                {categories.slice(1).map((cat) => {
                  const catPos = getCoordinates(cat, 0, false);
                  const catSkills = skills.filter((s) => s.category === cat);
                  const isCatActive = selectedCategory === 'All' || selectedCategory === cat;

                  return (
                    <g key={cat} className="transition-opacity duration-300" style={{ opacity: isCatActive ? 1 : 0.12 }}>
                      {/* Central Node to Category Node */}
                      <line
                        x1={centerX}
                        y1={centerY}
                        x2={catPos.x}
                        y2={catPos.y}
                        stroke="rgba(129, 140, 248, 0.45)"
                        strokeWidth={2.5}
                        strokeDasharray="4 2"
                      />
                      
                      {/* Category Node to sub skill nodes */}
                      {catSkills.map((sk, idx) => {
                        const skPos = getCoordinates(cat, idx, true);
                        const isSelected = selectedSkill?.name === sk.name && isLocked;
                        const isHovered = hoveredSkill?.name === sk.name;
                        const isHighlighted = isSelected || isHovered;

                        return (
                          <line
                            key={sk.name}
                            x1={catPos.x}
                            y1={catPos.y}
                            x2={skPos.x}
                            y2={skPos.y}
                            stroke={isHighlighted ? '#c084fc' : 'rgba(168, 85, 247, 0.3)'}
                            strokeWidth={isHighlighted ? 3 : 1.5}
                          />
                        );
                      })}
                    </g>
                  );
                })}

                {/* Central Node (Developer node - larger r=26) */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={26}
                  fill={centerFill}
                  stroke={centerStroke}
                  strokeWidth={3}
                  className="animate-pulse"
                />
                <text
                  x={centerX}
                  y={centerY + 4}
                  textAnchor="middle"
                  className={`text-[10px] font-black font-mono pointer-events-none select-none ${isLight ? 'fill-indigo-900' : 'fill-indigo-200'}`}
                >
                  HARSHIT
                </text>

                {/* Category Nodes (larger r=16) */}
                {categories.slice(1).map((cat) => {
                  const catPos = getCoordinates(cat, 0, false);
                  const isCatActive = selectedCategory === 'All' || selectedCategory === cat;
                  return (
                    <g
                      key={cat}
                      className="transition-opacity duration-300"
                      style={{ opacity: isCatActive ? 1 : 0.12 }}
                    >
                      <circle
                        cx={catPos.x}
                        cy={catPos.y}
                        r={16}
                        fill={isLight ? '#f5f3ff' : '#1e1b4b'}
                        stroke={nodeStroke}
                        strokeWidth={2.5}
                      />
                      <text
                        x={catPos.x}
                        y={catPos.y + 20}
                        textAnchor="middle"
                        className={`text-[11px] font-bold pointer-events-none select-none ${isLight ? 'fill-gray-700' : 'fill-purple-300'}`}
                      >
                        {cat}
                      </text>
                    </g>
                  );
                })}

                {/* Skill Sub-Nodes (larger 15-20% radius r=8 to r=11) */}
                {categories.slice(1).map((cat) => {
                  const catSkills = skills.filter((s) => s.category === cat);
                  const isCatActive = selectedCategory === 'All' || selectedCategory === cat;

                  return (
                    <g key={cat} className="transition-opacity duration-300" style={{ opacity: isCatActive ? 1 : 0.12 }}>
                      {catSkills.map((sk, idx) => {
                        const skPos = getCoordinates(cat, idx, true);
                        const isSelected = selectedSkill?.name === sk.name && isLocked;
                        const isTarget = targetSkill?.name === sk.name;
                        const shortName = SKILL_SHORT_NAMES[sk.name] || sk.name;

                        // Position text above node if in top half, below if in bottom half
                        const labelY = skPos.y < centerY ? skPos.y - 14 : skPos.y + 20;

                        return (
                          <g key={sk.name} className="group">
                            {/* Outer animated ring for target node */}
                            {isTarget && (
                              <circle
                                cx={skPos.x}
                                cy={skPos.y}
                                r={17}
                                fill="none"
                                stroke={isSelected ? '#c084fc' : '#a855f7'}
                                strokeWidth={1.8}
                                strokeDasharray="4 3"
                                className="animate-spin-slow pointer-events-none"
                              />
                            )}
                            {/* Clickable Node Circle - 15-20% Larger Size */}
                            <circle
                              cx={skPos.x}
                              cy={skPos.y}
                              r={isTarget ? 11 : isSelected ? 9.5 : 8}
                              fill={isTarget ? '#c084fc' : nodeFill}
                              stroke={isSelected ? '#ffffff' : nodeStroke}
                              strokeWidth={isSelected ? 2.8 : 1.8}
                              className="cursor-pointer transition-all duration-150"
                              onMouseEnter={() => setHoveredSkill(sk)}
                              onMouseLeave={() => setHoveredSkill(null)}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectSkill(sk, 'constellation');
                              }}
                            />
                            {/* SVG text label with 4px paint-order halo stroke */}
                            <text
                              x={skPos.x}
                              y={labelY}
                              textAnchor="middle"
                              className={`text-[10.5px] font-sans transition-all pointer-events-none select-none ${
                                isTarget
                                  ? 'fill-purple-300 font-black text-[12px]'
                                  : isSelected
                                    ? 'fill-purple-400 font-bold text-[11px]'
                                    : isLight ? 'fill-gray-700 font-semibold' : 'fill-gray-300 font-medium'
                              }`}
                              style={{
                                paintOrder: 'stroke fill',
                                stroke: isLight ? '#ffffff' : '#090a10',
                                strokeWidth: 4,
                                strokeLinejoin: 'round'
                              }}
                            >
                              {shortName}
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
        ) : (
          /* ── Grid View ─────────────────────────────────────────────────── */
          <div className="grow overflow-y-auto mt-3 custom-scrollbar">
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
                      const isSelected = selectedSkill?.name === skill.name && isLocked;
                      const projCount = getRelatedProjects(skill).length;
                      return (
                        <button
                          key={skill.name}
                          onMouseEnter={() => setHoveredSkill(skill)}
                          onMouseLeave={() => setHoveredSkill(null)}
                          onClick={() => handleSelectSkill(skill, 'grid')}
                          className={`text-left p-2.5 rounded-xl border transition text-xs ${
                            isSelected
                              ? 'border-purple-500 bg-purple-600/20 text-white shadow-xs ring-1 ring-purple-500/40'
                              : isLight ? 'border-gray-200 bg-white hover:border-purple-300' : 'border-white/8 bg-white/3 hover:border-purple-500/40 text-gray-300'
                          }`}
                          aria-label={`Select skill ${skill.name}`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-[11px] truncate">{skill.name}</span>
                            {projCount > 0 && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold shrink-0">
                                {projCount} {projCount === 1 ? 'Project' : 'Projects'}
                              </span>
                            )}
                          </div>
                          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-linear-to-r from-purple-500 to-indigo-400"
                              style={{ width: `${skill.proficiency}%` }}
                            />
                          </div>
                          <p className="text-[8px] text-gray-400 mt-1 font-semibold">{skill.proficiency}% Competency</p>
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

      {/* Details sidebar pane - Strict Non-Overlapping Flex Layout */}
      {targetSkill && (
        <div className={`${isMobile ? 'w-full' : 'w-80'} shrink-0 p-4 flex flex-col h-full overflow-hidden select-none ${sidebarBg}`}>
          {/* Top Section: Header & Automatic Lock Toggle Button */}
          <div className="shrink-0 flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center space-x-2.5 min-w-0 pr-2">
              <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/25 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold leading-snug truncate">{targetSkill.name}</h3>
                <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">{targetSkill.category}</p>
              </div>
            </div>

            {/* Interactive Lock / Unlock Badge */}
            <div className="shrink-0">
              {hoveredSkill && hoveredSkill.name !== selectedSkill?.name ? (
                <span className="text-amber-400 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold">
                  <Unlock className="w-3 h-3 text-amber-400" />
                  <span>Preview</span>
                </span>
              ) : isLocked && selectedSkill?.name === targetSkill.name ? (
                <button
                  onClick={() => setIsLocked(false)}
                  className="text-purple-300 hover:text-white flex items-center space-x-1 px-2.5 py-1 rounded-full bg-purple-600/30 border border-purple-500/40 text-[9px] font-bold transition shadow-xs"
                  title="Click to unlock hover preview mode"
                >
                  <Lock className="w-3 h-3 text-purple-400" />
                  <span>Locked</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedSkill(targetSkill);
                    setIsLocked(true);
                  }}
                  className="text-gray-400 hover:text-white flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-medium transition"
                  title="Click to lock this node"
                >
                  <Unlock className="w-3 h-3 text-gray-400" />
                  <span>Preview</span>
                </button>
              )}
            </div>
          </div>

          {/* Experience Rank Bar */}
          <div className="shrink-0 my-3 space-y-1.5">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-400">
              <span>Experience Rank</span>
              <span className="text-purple-400 font-mono">{targetSkill.proficiency}%</span>
            </div>
            <div className="w-full bg-white/5 border border-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${targetSkill.proficiency}%` }}
              />
            </div>
          </div>

          {/* Skill Domain Summary & Key Architectural Highlights */}
          {skillMeta && (
            <div className={`shrink-0 p-3 rounded-xl border space-y-2 mb-2 ${isLight ? 'bg-slate-100/90 border-slate-200 text-slate-800' : 'bg-white/5 border-white/5 text-gray-300'}`}>
              <p className={`text-[11px] leading-relaxed font-normal ${isLight ? 'text-slate-800' : 'text-gray-300'}`}>
                {skillMeta.summary}
              </p>
              <div className={`pt-1.5 border-t space-y-1 ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                <p className="text-[9px] font-bold uppercase tracking-wider text-purple-500">Domain Highlights</p>
                <div className="grid grid-cols-1 gap-1">
                  {skillMeta.keyPoints.map((point, pIdx) => (
                    <div key={pIdx} className={`flex items-center space-x-1.5 text-[10px] ${isLight ? 'text-slate-800 font-medium' : 'text-gray-300'}`}>
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="truncate">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Connected Portfolio Projects - Scrollable Container */}
          <div className="flex-1 min-h-0 flex flex-col my-1">
            <h4 className={`shrink-0 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between mb-2 ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>
              <span className="flex items-center space-x-1.5">
                <Library className="w-3.5 h-3.5 text-indigo-500" />
                <span>Matching Projects</span>
              </span>
              <span className="text-[9px] font-mono text-purple-500 font-bold">({relatedProjects.length})</span>
            </h4>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
              {relatedProjects.map((p) => (
                <div
                  key={p.id}
                  className={`p-2.5 rounded-lg border flex items-center justify-between text-[11px] transition ${
                    isLight 
                      ? 'bg-slate-100/90 border-slate-200 hover:border-purple-400' 
                      : 'bg-white/5 border-white/5 hover:border-purple-500/30'
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className={`font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{p.title}</span>
                    <span className={`text-[9px] truncate ${isLight ? 'text-slate-600 font-medium' : 'text-gray-400'}`}>{p.technologies.slice(0, 3).join(', ')}</span>
                  </div>
                  {p.github || p.demo ? (
                    <a
                      href={p.github || p.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-500 hover:text-purple-600 font-bold text-[9px] uppercase flex items-center space-x-0.5 shrink-0 px-2 py-1 bg-purple-500/10 rounded-sm border border-purple-500/20"
                    >
                      <span>View</span>
                      <Target className="w-2.5 h-2.5" />
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          
          {/* Bottom Info Box - Fully Opaque */}
          <div className={`shrink-0 mt-2 p-3 rounded-xl border flex items-start space-x-2 text-[10px] shadow-md ${
            isLight ? 'bg-purple-50 border-purple-200 text-purple-950 font-medium' : 'bg-[#141327] border-purple-500/30 text-gray-300'
          }`}>
            <Info className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {isLocked
                ? `Node "${selectedSkill?.name}" is locked. Click any node to lock a new selection.`
                : 'Hover over any node to preview. Click any node to lock it in place.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import {
  Github, Linkedin, Mail, Phone, BookOpen, Database,
  MapPin, Briefcase, GraduationCap, Award, ChevronDown, ChevronUp,
  ExternalLink, Send, CheckCircle, ArrowDown, Sparkles, FileText,
} from 'lucide-react';
import ClassicNavbar from './ClassicNavbar';
import MonitorWidget from './MonitorWidget';
import OSTransitionOverlay from './OSTransitionOverlay';
import { projects } from '../../data/projects';
import { experience } from '../../data/experience';
import { skills } from '../../data/skills';
import { resumeLink } from '../../data/navigation';
import { PORTFOLIO_META } from '../../data/config';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useIntersectionObserver(ids: string[]): string {
  const [activeId, setActiveId] = useState(ids[0] || '');
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
        { rootMargin: '-20% 0px -60% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return activeId;
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ isDark }: { isDark: boolean }) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-20"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{
        background: isDark
          ? 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(168,85,247,0.12) 0%, transparent 70%)'
          : 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(168,85,247,0.08) 0%, transparent 70%)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: isDark
          ? 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)'
          : 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        {/* Profile photo & status badge */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <div
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden p-1 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #6366f1, #ec4899)',
                boxShadow: isDark ? '0 0 32px rgba(168,85,247,0.3)' : '0 10px 25px rgba(168,85,247,0.2)',
              }}
            >
              <img
                src="/profile.webp"
                alt="Harshit Kandoi"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>

          <div
            className="flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-semibold shadow-md"
            style={{
              background: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.1)',
              border: isDark ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(16, 185, 129, 0.3)',
              color: isDark ? '#34d399' : '#059669',
              boxShadow: '0 0 12px rgba(16, 185, 129, 0.15)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Open to Opportunities</span>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: isDark ? '#a855f7' : '#9333ea' }}>
            Software & AI Engineer
          </div>
          <h1 className={`text-4xl sm:text-6xl font-black leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Harshit{' '}
            <span style={{ backgroundImage: 'linear-gradient(135deg, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Kandoi
            </span>
          </h1>
          <div className="flex items-center justify-center space-x-1.5 mt-3" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#64748b' }}>
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-sm">Jaipur, Rajasthan, India</span>
          </div>
        </div>

        <p className="text-base sm:text-lg leading-relaxed max-w-xl mx-auto"
          style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#475569', textAlign: 'center' }}>
          I build AI-powered products and backend systems. Currently an Associate Software Engineer at ThoughtIn Solutions, focused on GCP, React, and workflow automation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', boxShadow: '0 0 24px rgba(168,85,247,0.35)' }}
          >
            <Sparkles className="w-4 h-4" />
            <span>View Projects</span>
          </button>
          <a href={resumeLink} target="_blank" rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
            style={{
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)',
              color: isDark ? 'rgba(255,255,255,0.85)' : '#1e293b',
            }}>
            <FileText className="w-4 h-4" />
            <span>Download Resume</span>
          </a>
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
            style={{
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)',
              color: isDark ? 'rgba(255,255,255,0.85)' : '#1e293b',
            }}>
            <Mail className="w-4 h-4" />
            <span>Contact Me</span>
          </button>
        </div>

        <div className="flex items-center justify-center space-x-5 pt-2">
          {[
            { href: PORTFOLIO_META.github, icon: Github, label: 'GitHub', color: isDark ? '#c084fc' : '#9333ea' },
            { href: PORTFOLIO_META.linkedin, icon: Linkedin, label: 'LinkedIn', color: '#6366f1' },
            { href: `mailto:${PORTFOLIO_META.email}`, icon: Mail, label: 'Email', color: '#ec4899' },
            { href: `tel:${PORTFOLIO_META.phone}`, icon: Phone, label: 'Phone', color: '#10b981' },
            { href: PORTFOLIO_META.medium, icon: BookOpen, label: 'Medium', color: '#0284c7' },
            { href: PORTFOLIO_META.kaggle, icon: Database, label: 'Kaggle', color: '#d97706' },
          ].map(({ href, icon: Icon, label, color }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
              className="p-2 rounded-lg transition-all hover:scale-110 active:scale-95"
              style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#64748b' }}
              onMouseEnter={e => (e.currentTarget.style.color = color)}
              onMouseLeave={e => (e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.4)' : '#64748b')}>
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>

        <div className="flex flex-col items-center space-y-1 pt-8" style={{ color: isDark ? 'rgba(255,255,255,0.25)' : '#94a3b8' }}>
          <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </div>
      </div>
    </section>
  );
}

// ─── Projects ────────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Products & Software', 'AI & Machine Learning', 'Cloud & Backend'];

function Projects({ isDark }: { isDark: boolean }) {
  const [activeCategory, setActiveCategory] = useState('All');

  // Curated showcase: Top 6 Software Engineering & AI projects with GitHub repositories
  const bestFeaturedProjects = projects.filter(p => p.featured && Boolean(p.github && p.github.trim() !== ''));

  const displayed = bestFeaturedProjects.filter(p =>
    activeCategory === 'All' ? true : p.category.includes(activeCategory)
  );

  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: isDark ? '#a855f7' : '#9333ea' }}>Featured Work</div>
          <h2 className={`text-3xl sm:text-4xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Projects</h2>
          <p className="text-sm max-w-xl mx-auto" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#64748b', textAlign: 'center' }}>
            Top Software Engineering and AI projects featuring open-source repositories.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: activeCategory === cat
                  ? (isDark ? 'rgba(168,85,247,0.2)' : 'rgba(147,51,234,0.12)')
                  : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                border: activeCategory === cat
                  ? (isDark ? '1px solid rgba(168,85,247,0.5)' : '1px solid rgba(147,51,234,0.4)')
                  : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)'),
                color: activeCategory === cat
                  ? (isDark ? '#c084fc' : '#7e22ce')
                  : (isDark ? 'rgba(255,255,255,0.5)' : '#64748b'),
              }}>
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((project) => (
            <div key={project.id}
              className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col"
              style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(226,232,240,0.9)',
                boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(148,163,184,0.12)',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = isDark ? 'rgba(168,85,247,0.3)' : 'rgba(147,51,234,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(226,232,240,0.9)')}>
              <div className="relative h-44 overflow-hidden shrink-0">
                <img src={project.image} alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0"
                  style={{
                    background: isDark
                      ? 'linear-gradient(to bottom, rgba(5,6,15,0.1) 0%, rgba(5,6,15,0.85) 100%)'
                      : 'linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, rgba(15,23,42,0.65) 100%)',
                  }} />
                {project.status && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: 'rgba(168,85,247,0.3)', border: '1px solid rgba(168,85,247,0.5)', color: '#e9d5ff' }}>
                    ⭐ {project.status}
                  </span>
                )}
              </div>

              <div className="p-5 flex flex-col flex-1 space-y-3">
                <h3 className={`font-bold text-base leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{project.title}</h3>
                <p className="text-xs leading-relaxed flex-1" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#475569', textAlign: 'left' }}>
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.slice(0, 4).map(tech => (
                    <span key={tech} className="px-2 py-0.5 rounded text-[10px] font-medium"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(241,245,249,0.9)',
                        color: isDark ? 'rgba(255,255,255,0.55)' : '#475569',
                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(203,213,225,0.6)',
                      }}>
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(226,232,240,0.8)' }}>
                  <div className="flex items-center space-x-4">
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-xs font-medium hover:text-purple-500 transition-colors"
                        style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#475569' }}>
                        <Github className="w-3.5 h-3.5" /><span>Code</span>
                      </a>
                    )}
                    {project.demo && (
                      <a href={project.demo} target="_blank" rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-xs font-medium transition-colors"
                        style={{ color: isDark ? '#c084fc' : '#9333ea' }}>
                        <ExternalLink className="w-3.5 h-3.5" /><span>Live Demo</span>
                      </a>
                    )}
                  </div>
                  {project.duration && (
                    <span className="text-[10px] font-medium shrink-0" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#64748b' }}>{project.duration}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Experience ──────────────────────────────────────────────────────────────

type ExpTab = 'Work' | 'Education' | 'Certifications';
const TAB_ICONS: Record<ExpTab, React.ElementType> = { Work: Briefcase, Education: GraduationCap, Certifications: Award };

function Experience({ isDark }: { isDark: boolean }) {
  const [activeTab, setActiveTab] = useState<ExpTab>('Work');

  const workItems = experience.filter(e => e.type === 'work');
  const educationItems = experience.filter(e => e.type === 'education');
  const certItems = experience.filter(e => e.type === 'Course' || e.type === 'Participation');
  const displayedItems = activeTab === 'Work' ? workItems : activeTab === 'Education' ? educationItems : certItems;

  return (
    <section id="experience" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: isDark ? '#a855f7' : '#9333ea' }}>Background</div>
          <h2 className={`text-3xl sm:text-4xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Experience</h2>
        </div>

        <div className="flex justify-center mb-10">
          <div className="flex rounded-xl p-1" style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)',
          }}>
            {(['Work', 'Education', 'Certifications'] as ExpTab[]).map(tab => {
              const Icon = TAB_ICONS[tab];
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: activeTab === tab ? (isDark ? 'rgba(168,85,247,0.2)' : 'rgba(147,51,234,0.12)') : 'transparent',
                    color: activeTab === tab ? (isDark ? '#c084fc' : '#7e22ce') : (isDark ? 'rgba(255,255,255,0.45)' : '#64748b'),
                    border: activeTab === tab ? (isDark ? '1px solid rgba(168,85,247,0.35)' : '1px solid rgba(147,51,234,0.3)') : '1px solid transparent',
                  }}>
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline container: pl-6 sm:pl-8 ensures item dots are centered at x = 24px (mobile) / x = 32px (desktop) */}
        <div className="relative space-y-6 pl-6 sm:pl-8">
          {/* Timeline vertical line - centered at x = 24px (mobile) / 32px (desktop), matching dot centers */}
          <div className="absolute left-6 sm:left-8 top-5 bottom-5 w-0.5 -translate-x-1/2"
            style={{
              background: isDark
                ? 'linear-gradient(to bottom, #a855f7, rgba(99,102,241,0.2))'
                : 'linear-gradient(to bottom, #9333ea, rgba(99,102,241,0.25))',
            }} />

          {displayedItems.map((item, idx) => (
            <div key={item.id} className="relative pl-6 sm:pl-8">
              {/* Dot - centered on timeline line */}
              <div className="absolute left-0 top-5 -translate-x-1/2 w-3.5 h-3.5 rounded-full z-10"
                style={{
                  background: idx === 0 ? '#a855f7' : (isDark ? 'rgba(168,85,247,0.3)' : 'rgba(168,85,247,0.2)'),
                  boxShadow: idx === 0 ? '0 0 10px rgba(168,85,247,0.7)' : 'none',
                  border: `2px solid ${idx === 0 ? '#a855f7' : (isDark ? 'rgba(168,85,247,0.5)' : 'rgba(168,85,247,0.4)')}`,
                }} />

              <div className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.025)' : '#ffffff',
                  border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(226,232,240,0.9)',
                  boxShadow: isDark ? 'none' : '0 4px 16px rgba(148,163,184,0.08)',
                }}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                  <div>
                    <h3 className={`font-bold text-sm leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.role || item.title}</h3>
                    <p className="text-xs mt-0.5" style={{ color: isDark ? '#a855f7' : '#9333ea' }}>
                      {item.company || item.organization}
                      {item.location && <span style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8' }}> · {item.location}</span>}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 self-start"
                    style={{
                      background: isDark ? 'rgba(168,85,247,0.1)' : 'rgba(147,51,234,0.08)',
                      color: isDark ? '#c084fc' : '#7e22ce',
                      border: isDark ? '1px solid rgba(168,85,247,0.2)' : '1px solid rgba(147,51,234,0.2)',
                    }}>
                    {item.period || item.date}
                  </span>
                </div>

                {Array.isArray(item.description) ? (
                  <ul className="space-y-1.5 mb-3">
                    {item.description.map((d, i) => (
                      <li key={i} className="flex items-start space-x-2 text-xs"
                        style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#334155', textAlign: 'left' }}>
                        <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full bg-purple-500/80" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs mb-3" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#334155', textAlign: 'left' }}>
                    {item.description}
                  </p>
                )}

                {item.skills && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded text-[10px]"
                        style={{
                          background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)',
                          color: isDark ? 'rgba(129,140,248,0.9)' : '#4f46e5',
                          border: isDark ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(99,102,241,0.2)',
                        }}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 mt-3 text-xs font-medium"
                    style={{ color: isDark ? '#a855f7' : '#9333ea' }}>
                    <ExternalLink className="w-3 h-3" />
                    <span>View Certificate</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Skills ──────────────────────────────────────────────────────────────────

const CATEGORY_STYLES_DARK: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  'Languages':     { bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.3)',  text: '#c084fc', dot: '#a855f7' },
  'Backend':       { bg: 'rgba(99,102,241,0.12)',   border: 'rgba(99,102,241,0.3)',  text: '#818cf8', dot: '#6366f1' },
  'Frontend':      { bg: 'rgba(236,72,153,0.12)',   border: 'rgba(236,72,153,0.3)',  text: '#f472b6', dot: '#ec4899' },
  'Databases':     { bg: 'rgba(59,130,246,0.12)',   border: 'rgba(59,130,246,0.3)',  text: '#60a5fa', dot: '#3b82f6' },
  'Cloud':         { bg: 'rgba(16,185,129,0.12)',   border: 'rgba(16,185,129,0.3)',  text: '#34d399', dot: '#10b981' },
  'AI':            { bg: 'rgba(245,158,11,0.12)',   border: 'rgba(245,158,11,0.3)',  text: '#fcd34d', dot: '#f59e0b' },
  'Tools':         { bg: 'rgba(239,68,68,0.12)',    border: 'rgba(239,68,68,0.3)',   text: '#f87171', dot: '#ef4444' },
  'Soft Skills':   { bg: 'rgba(20,184,166,0.12)',   border: 'rgba(20,184,166,0.3)',  text: '#2dd4bf', dot: '#14b8a6' },
};

const CATEGORY_STYLES_LIGHT: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  'Languages':     { bg: 'rgba(147,51,234,0.08)',  border: 'rgba(147,51,234,0.25)', text: '#7e22ce', dot: '#9333ea' },
  'Backend':       { bg: 'rgba(79,70,229,0.08)',   border: 'rgba(79,70,229,0.25)',  text: '#3730a3', dot: '#4f46e5' },
  'Frontend':      { bg: 'rgba(219,39,119,0.08)',  border: 'rgba(219,39,119,0.25)', text: '#9d174d', dot: '#db2777' },
  'Databases':     { bg: 'rgba(37,99,235,0.08)',   border: 'rgba(37,99,235,0.25)',  text: '#1e40af', dot: '#2563eb' },
  'Cloud':         { bg: 'rgba(5,150,105,0.08)',   border: 'rgba(5,150,105,0.25)',  text: '#065f46', dot: '#059669' },
  'AI':            { bg: 'rgba(217,119,6,0.08)',   border: 'rgba(217,119,6,0.25)',  text: '#92400e', dot: '#d97706' },
  'Tools':         { bg: 'rgba(220,38,38,0.08)',   border: 'rgba(220,38,38,0.25)',  text: '#991b1b', dot: '#dc2626' },
  'Soft Skills':   { bg: 'rgba(13,148,136,0.08)',  border: 'rgba(13,148,136,0.25)', text: '#115e59', dot: '#0d9488' },
};

function Skills({ isDark }: { isDark: boolean }) {
  const grouped = skills.reduce<Record<string, typeof skills>>((acc, skill) => {
    const cat = skill.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  const stylesMap = isDark ? CATEGORY_STYLES_DARK : CATEGORY_STYLES_LIGHT;
  const defaultStyle = isDark
    ? { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', text: 'rgba(255,255,255,0.6)', dot: '#fff' }
    : { bg: 'rgba(0,0,0,0.05)', border: 'rgba(0,0,0,0.1)', text: '#334155', dot: '#000' };

  return (
    <section id="skills" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: isDark ? '#a855f7' : '#9333ea' }}>What I work with</div>
          <h2 className={`text-3xl sm:text-4xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Skills</h2>
          <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#64748b', textAlign: 'center' }}>
            Technologies, tools, and frameworks I work with daily.
          </p>
        </div>

        <div className="space-y-8">
          {Object.entries(grouped).map(([category, categorySkills]) => {
            const style = stylesMap[category] || defaultStyle;
            return (
              <div key={category}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-2 h-2 rounded-full" style={{ background: style.dot, boxShadow: `0 0 8px ${style.dot}` }} />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: style.text }}>
                    {category}
                  </span>
                  <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${style.border}, transparent)` }} />
                  <span className="text-[10px]" style={{ color: isDark ? 'rgba(255,255,255,0.25)' : '#94a3b8' }}>{categorySkills.length} skills</span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {categorySkills
                    .sort((a, b) => b.proficiency - a.proficiency)
                    .map(skill => (
                      <div
                        key={skill.name}
                        className="group relative flex items-center space-x-2 px-3.5 py-2 rounded-xl transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 cursor-default shadow-sm"
                        style={{
                          background: style.bg,
                          border: `1px solid ${style.border}`,
                        }}
                        title={`${skill.proficiency}% proficiency`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{
                            background: skill.proficiency >= 85 ? style.dot : skill.proficiency >= 65 ? style.text : (isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8'),
                            boxShadow: skill.proficiency >= 85 ? `0 0 6px ${style.dot}` : 'none',
                          }} />
                        <span className="text-xs font-semibold" style={{ color: style.text }}>
                          {skill.name}
                        </span>
                        <span className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#64748b' }}>
                          {skill.proficiency}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* <div className="flex items-center justify-center space-x-6 mt-10 pt-6 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }}>
          {[
            { dot: 'bg-emerald-400 shadow-emerald-400/50', label: 'Expert (85%+)' },
            { dot: 'bg-purple-400 shadow-purple-400/50', label: 'Proficient (65-84%)' },
            { dot: 'bg-gray-400', label: 'Learning' },
          ].map(item => (
            <div key={item.label} className="flex items-center space-x-1.5">
              <div className={`w-2 h-2 rounded-full ${item.dot} shadow-[0_0_6px]`} />
              <span className="text-[10px]" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#64748b' }}>{item.label}</span>
            </div>
          ))}
        </div> */}
      </div>
    </section>
  );
}

// ─── Contact ─────────────────────────────────────────────────────────────────

function Contact({ isDark }: { isDark: boolean }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending' || status === 'sent') return;
    setStatus('sending');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          subject: `Portfolio Contact from ${form.name.trim()}`,
          message: `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`,
        }),
      });
      if (res.ok) {
        setStatus('sent');
      } else {
        window.location.href = `mailto:${PORTFOLIO_META.email}?subject=${encodeURIComponent(`Portfolio Contact from ${form.name}`)}&body=${encodeURIComponent(form.message)}`;
        setStatus('sent');
      }
    } catch {
      window.location.href = `mailto:${PORTFOLIO_META.email}?subject=${encodeURIComponent(`Portfolio Contact from ${form.name}`)}&body=${encodeURIComponent(form.message)}`;
      setStatus('sent');
    }
  };

  const inputStyle = {
    background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(203,213,225,0.8)',
    color: isDark ? '#ffffff' : '#0f172a',
  };

  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: isDark ? '#a855f7' : '#9333ea' }}>Get in touch</div>
          <h2 className={`text-3xl sm:text-4xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Contact</h2>
          <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#64748b', textAlign: 'center' }}>
            Open to full-time roles, freelance, and collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { id: 'name', label: 'Name', type: 'text', placeholder: 'Your name' },
              { id: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
            ].map(f => (
              <div key={f.id}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#475569' }}>{f.label}</label>
                <input type={f.type} required placeholder={f.placeholder}
                  value={form[f.id as 'name' | 'email']}
                  onChange={e => setForm(prev => ({ ...prev, [f.id]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all shadow-sm"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = isDark ? 'rgba(168,85,247,0.4)' : '#9333ea')}
                  onBlur={e => (e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(203,213,225,0.8)')} />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#475569' }}>Message</label>
              <textarea required rows={5} placeholder="Tell me about your project or opportunity..."
                value={form.message}
                onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all resize-none shadow-sm"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = isDark ? 'rgba(168,85,247,0.4)' : '#9333ea')}
                onBlur={e => (e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(203,213,225,0.8)')} />
            </div>
            <button type="submit" disabled={status === 'sending' || status === 'sent'}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', boxShadow: '0 0 24px rgba(168,85,247,0.3)' }}>
              {status === 'sending' && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {status === 'sent' && <CheckCircle className="w-4 h-4" />}
              {(status === 'idle' || status === 'error') && <Send className="w-4 h-4" />}
              <span>{status === 'sending' ? 'Sending...' : status === 'sent' ? 'Message Sent!' : status === 'error' ? 'Failed — Try Again' : 'Send Message'}</span>
            </button>
          </form>

          <div className="space-y-6 lg:pl-6">
            <div>
              <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Let's work together</h3>
              <p className="text-sm leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#475569', textAlign: 'left' }}>
                I'm currently open to full-time Software Engineering and AI Engineering roles, freelance projects, and research collaborations.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { icon: Mail, label: 'Email', value: PORTFOLIO_META.email, href: `mailto:${PORTFOLIO_META.email}` },
                { icon: Phone, label: 'Phone', value: PORTFOLIO_META.phone, href: `tel:${PORTFOLIO_META.phone}` },
                { icon: MapPin, label: 'Location', value: 'Jaipur, Rajasthan, India', href: undefined },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-center space-x-3 p-3 rounded-xl"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.025)' : '#ffffff',
                    border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226,232,240,0.9)',
                    boxShadow: isDark ? 'none' : '0 2px 10px rgba(148,163,184,0.06)',
                  }}>
                  <div className="p-2 rounded-lg" style={{ background: isDark ? 'rgba(168,85,247,0.15)' : 'rgba(147,51,234,0.1)' }}>
                    <Icon className="w-4 h-4" style={{ color: isDark ? '#a855f7' : '#9333ea' }} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8' }}>{label}</div>
                    {href ? (
                      <a href={href} className={`text-sm font-medium transition-colors ${isDark ? 'text-white hover:text-purple-400' : 'text-slate-900 hover:text-purple-700'}`}>{value}</a>
                    ) : (
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              {[
                { href: PORTFOLIO_META.github, icon: Github, label: 'GitHub' },
                { href: PORTFOLIO_META.linkedin, icon: Linkedin, label: 'LinkedIn' },
                { href: PORTFOLIO_META.medium, icon: BookOpen, label: 'Medium' },
                { href: PORTFOLIO_META.kaggle, icon: Database, label: 'Kaggle' },
              ].map(({ href, icon: Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(203,213,225,0.8)',
                    color: isDark ? 'rgba(255,255,255,0.55)' : '#475569',
                    boxShadow: isDark ? 'none' : '0 2px 8px rgba(148,163,184,0.08)',
                  }}>
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── OS Portal Section ────────────────────────────────────────────────────────

function OSPortal({ onLaunch }: { onLaunch: (rect: DOMRect) => void }) {
  return (
    <section id="os-portal" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Divider */}
        <div className="flex items-center space-x-6 mb-16">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(168,85,247,0.3))' }} />
          <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', color: '#c084fc' }}>
            <span>✦</span>
            <span>One more thing</span>
            <span>✦</span>
          </div>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(168,85,247,0.3))' }} />
        </div>

        <div className="flex justify-center">
          <MonitorWidget onLaunch={onLaunch} />
        </div>
      </div>
    </section>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function ClassicPortfolio({ onTransition }: { onTransition: (rect: DOMRect) => void }) {
  const sectionIds = ['hero', 'projects', 'experience', 'skills', 'contact', 'os-portal'];
  const activeSection = useIntersectionObserver(sectionIds);
  const [transitionRect, setTransitionRect] = useState<DOMRect | null>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('classic_theme') as 'dark' | 'light') || 'dark';
  });

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('classic_theme', next);
      return next;
    });
  }, []);

  const isDark = theme === 'dark';

  const handleLaunch = useCallback((rect: DOMRect) => {
    setTransitionRect(rect);
    setTimeout(() => onTransition(rect), 50);
  }, [onTransition]);

  const handleFallbackLaunch = useCallback((rect?: DOMRect) => {
    const fallback = rect || new DOMRect(
      window.innerWidth / 2 - 130, window.innerHeight / 2 - 80, 260, 160
    );
    handleLaunch(fallback);
  }, [handleLaunch]);

  return (
    <div style={{
      background: isDark ? '#05060f' : '#f8fafc',
      minHeight: '100vh',
      color: isDark ? '#ffffff' : '#0f172a',
      fontFamily: 'Inter, sans-serif',
      transition: 'background-color 0.3s ease, color 0.3s ease',
    }}>
      <ClassicNavbar
        activeSection={activeSection}
        onEnterOS={handleFallbackLaunch}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <Hero isDark={isDark} />
      <Projects isDark={isDark} />
      <Experience isDark={isDark} />
      <Skills isDark={isDark} />
      <Contact isDark={isDark} />
      <OSPortal onLaunch={handleLaunch} />

      {/* Transition overlay */}
      {transitionRect && <OSTransitionOverlay initialRect={transitionRect} />}
    </div>
  );
}

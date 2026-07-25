import { useState, useEffect } from 'react';
import { Menu, X, Monitor, Sun, Moon } from 'lucide-react';

interface Props {
  activeSection: string;
  onEnterOS: (rect?: DOMRect) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const NAV_LINKS = [
  { id: 'about',      label: 'About'      },
  { id: 'projects',   label: 'Projects'   },
  { id: 'experience', label: 'Experience' },
  { id: 'skills',     label: 'Skills'     },
  { id: 'contact',    label: 'Contact'    },
];

export default function ClassicNavbar({ activeSection, onEnterOS, theme, onToggleTheme }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? (isDark ? 'rgba(5, 6, 15, 0.92)' : 'rgba(255, 255, 255, 0.92)')
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          borderBottom: scrolled
            ? (isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)')
            : '1px solid transparent',
          boxShadow: scrolled ? (isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.06)') : 'none',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => scrollTo('hero')}
            className="flex items-center space-x-2 group"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)' }}
            >
              <span className="text-white text-xs font-black">HK</span>
            </div>
            <span className={`font-bold text-sm hidden sm:block tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Harshit Kandoi
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-1">
            {NAV_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  color: activeSection === link.id
                    ? (isDark ? '#c084fc' : '#7e22ce')
                    : (isDark ? 'rgba(255,255,255,0.65)' : '#475569'),
                  background: activeSection === link.id
                    ? (isDark ? 'rgba(168,85,247,0.12)' : 'rgba(168,85,247,0.08)')
                    : 'transparent',
                }}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Actions: Theme Toggle + OS Mode toggle pill */}
          <div className="flex items-center space-x-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                color: isDark ? '#fcd34d' : '#0f172a',
              }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-purple-700" />}
            </button>

            <button
              onClick={(e) => onEnterOS(e.currentTarget.getBoundingClientRect())}
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.15))'
                  : 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(99,102,241,0.1))',
                border: isDark ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(168,85,247,0.4)',
                color: isDark ? '#c084fc' : '#7e22ce',
              }}
              title="Switch to Portfolio OS"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>OS Mode</span>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2 rounded-lg transition ${isDark ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden flex flex-col justify-between pb-8"
          style={{
            background: isDark ? 'rgba(5,6,15,0.97)' : 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            paddingTop: 72,
          }}
        >
          <div className="flex flex-col px-6 space-y-2">
            {NAV_LINKS.map(link => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="py-3 text-left text-lg font-medium border-b transition-colors"
                style={{
                  color: activeSection === link.id
                    ? (isDark ? '#c084fc' : '#7e22ce')
                    : (isDark ? 'rgba(255,255,255,0.7)' : '#334155'),
                  borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                }}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={(e) => { setMobileOpen(false); onEnterOS(e.currentTarget.getBoundingClientRect()); }}
              className="mt-4 flex items-center space-x-2 py-3 text-left text-lg font-semibold"
              style={{ color: isDark ? '#c084fc' : '#7e22ce' }}
            >
              <Monitor className="w-5 h-5" />
              <span>Enter OS Mode</span>
            </button>
          </div>

          <div className="px-6 flex items-center justify-between border-t pt-4"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <span className="text-sm font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#475569' }}>
              Theme: {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
            <button
              onClick={onToggleTheme}
              className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2"
              style={{
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                color: isDark ? '#fcd34d' : '#0f172a',
              }}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-purple-700" />}
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}


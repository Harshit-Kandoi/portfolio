import { useState, useEffect } from 'react';
import { Menu, X, Monitor, Sun, Moon } from 'lucide-react';
import { scrollToSection } from '../../utils/scrollToSection';

interface Props {
  activeSection: string;
  onEnterOS: (rect?: DOMRect) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const NAV_LINKS = [
  { id: 'work',       label: 'Work'       },
  { id: 'services',   label: 'Services'   },
  { id: 'experience', label: 'Experience' },
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
    scrollToSection(id);
    setMobileOpen(false);
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 minimal-nav"
        style={{
          background: scrolled
            ? (isDark ? 'rgba(20, 19, 17, 0.88)' : 'rgba(247, 244, 237, 0.9)')
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          borderBottom: scrolled
            ? (isDark ? '1px solid rgba(239,228,207,0.1)' : '1px solid rgba(36,31,25,0.1)')
            : '1px solid transparent',
          boxShadow: scrolled ? '0 16px 50px rgba(18, 16, 12, 0.08)' : 'none',
        }}
      >
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => scrollTo('hero')}
            className="flex items-center space-x-2 group"
          >
            <div className="minimal-nav-mark">
              <span>HK</span>
            </div>
            <span className={`font-bold text-sm hidden sm:block tracking-wide ${isDark ? 'text-[#f4ebdd]' : 'text-[#241f19]'}`}>
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
                    ? (isDark ? '#ff9f6e' : '#b94716')
                    : (isDark ? 'rgba(244,235,221,0.66)' : '#695f53'),
                  background: activeSection === link.id
                    ? (isDark ? 'rgba(255,111,54,0.12)' : 'rgba(255,111,54,0.1)')
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
                border: isDark ? '1px solid rgba(239,228,207,0.13)' : '1px solid rgba(36,31,25,0.12)',
                color: isDark ? '#f3c17a' : '#241f19',
              }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-[#b94716]" />}
            </button>

            <button
              onClick={(e) => onEnterOS(e.currentTarget.getBoundingClientRect())}
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: isDark
                  ? 'rgba(255,111,54,0.12)'
                  : 'rgba(255,111,54,0.1)',
                border: isDark ? '1px solid rgba(255,159,110,0.3)' : '1px solid rgba(185,71,22,0.28)',
                color: isDark ? '#ffb089' : '#b94716',
              }}
              title="Open interactive portfolio mode"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Interactive</span>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className={`md:hidden p-2 rounded-lg transition ${isDark ? 'text-[#f4ebdd]/60 hover:text-[#f4ebdd]' : 'text-[#695f53] hover:text-[#241f19]'}`}
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
            background: isDark ? 'rgba(20,19,17,0.97)' : 'rgba(247,244,237,0.97)',
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
                    ? (isDark ? '#ffb089' : '#b94716')
                    : (isDark ? 'rgba(244,235,221,0.7)' : '#3c352d'),
                  borderColor: isDark ? 'rgba(239,228,207,0.1)' : 'rgba(36,31,25,0.08)',
                }}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={(e) => { setMobileOpen(false); onEnterOS(e.currentTarget.getBoundingClientRect()); }}
              className="mt-4 flex items-center space-x-2 py-3 text-left text-lg font-semibold"
              style={{ color: isDark ? '#ffb089' : '#b94716' }}
            >
              <Monitor className="w-5 h-5" />
              <span>Open interactive mode</span>
            </button>
          </div>

          <div className="px-6 flex items-center justify-between border-t pt-4"
            style={{ borderColor: isDark ? 'rgba(239,228,207,0.1)' : 'rgba(36,31,25,0.1)' }}>
            <span className="text-sm font-medium" style={{ color: isDark ? 'rgba(244,235,221,0.6)' : '#695f53' }}>
              Theme: {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
            <button
              onClick={onToggleTheme}
              className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2"
              style={{
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(36,31,25,0.06)',
                color: isDark ? '#f3c17a' : '#241f19',
              }}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-[#b94716]" />}
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

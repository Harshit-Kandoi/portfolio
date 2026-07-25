import { useRef, useState } from 'react';
import { Monitor, Zap } from 'lucide-react';

interface Props {
  onLaunch: (rect: DOMRect) => void;
  isDark?: boolean;
}

// Mini animated nebula for the monitor preview screen
function MiniNebula() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: '#060212' }}
    >
      {/* Animated gas clouds via CSS */}
      <div
        className="absolute rounded-full"
        style={{
          width: 180, height: 180,
          top: '20%', left: '15%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)',
          animation: 'monitorFloat 5s ease-in-out infinite',
          animationDelay: '0s',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 150, height: 150,
          top: '40%', right: '10%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.28) 0%, transparent 70%)',
          animation: 'monitorFloat 6s ease-in-out infinite',
          animationDelay: '-2s',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 120, height: 120,
          bottom: '20%', left: '35%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.32) 0%, transparent 70%)',
          animation: 'monitorFloat 7s ease-in-out infinite',
          animationDelay: '-4s',
        }}
      />
      {/* Neon horizon line */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: 60,
          background: 'linear-gradient(to bottom, transparent, rgba(236,72,153,0.12))',
          borderTop: '1px solid rgba(236,72,153,0.3)',
        }}
      />
      {/* Stars */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() > 0.7 ? 2 : 1,
            height: Math.random() > 0.7 ? 2 : 1,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            background: ['#c084fc', '#f472b6', '#818cf8', '#fff'][Math.floor(Math.random() * 4)],
            opacity: 0.6 + Math.random() * 0.4,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}

      {/* Desktop dock preview at bottom */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-1 px-3 py-1.5 rounded-xl"
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {['from-blue-500 to-cyan-400','from-purple-500 to-indigo-500','from-emerald-500 to-teal-500','from-rose-500 to-red-500','from-teal-400 to-emerald-500'].map((color, i) => (
          <div key={i} className={`w-3 h-3 rounded-md bg-gradient-to-br ${color}`} />
        ))}
      </div>

      {/* Fake open window in screen */}
      <div
        className="absolute rounded-lg overflow-hidden"
        style={{
          top: '12%', left: '12%', right: '12%', bottom: '22%',
          background: 'rgba(10,11,18,0.85)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(4px)',
        }}
      >
        {/* Window chrome */}
        <div className="flex items-center px-2 py-1.5 space-x-1" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-red-500/70" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/70" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-500/70" />
          <span className="text-[5px] text-gray-500 ml-1 font-mono">Projects.exe</span>
        </div>
        <div className="p-2 space-y-1">
          {[70, 85, 60].map((w, i) => (
            <div key={i} className="rounded" style={{ height: 4, width: `${w}%`, background: 'rgba(168,85,247,0.25)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MonitorWidget({ onLaunch, isDark = true }: Props) {
  const screenRef = useRef<HTMLDivElement>(null);
  const [powered, setPowered] = useState(false);
  const [launching, setLaunching] = useState(false);

  const handleLaunch = () => {
    if (launching) return;
    setLaunching(true);
    setPowered(true);

    // After power-on animation (350ms), trigger the clip-path zoom
    setTimeout(() => {
      if (screenRef.current) {
        const rect = screenRef.current.getBoundingClientRect();
        onLaunch(rect);
      }
    }, 350);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Monitor body */}
      <div
        className="relative group cursor-pointer select-none"
        onClick={handleLaunch}
        style={{ filter: launching ? 'none' : undefined }}
      >
        {/* Outer bezel */}
        <div
          className="relative rounded-2xl overflow-hidden transition-all duration-500"
          style={{
            width: 'min(520px, 88vw)',
            background: 'linear-gradient(145deg, #1a1a2e 0%, #111127 50%, #0d0d1e 100%)',
            padding: '10px 10px 28px 10px',
            boxShadow: launching
              ? '0 0 0 2px rgba(168,85,247,0.1), 0 40px 80px rgba(0,0,0,0.8)'
              : 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.07)',
            transition: 'box-shadow 0.35s ease, transform 0.35s ease',
            transform: launching ? 'scale(0.98)' : undefined,
          }}
        >
          {/* Bezel inner edge highlight */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, transparent 50%)',
            }}
          />

          {/* Camera dot */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
            style={{ background: '#0d0d1e', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'inset 0 0 3px rgba(0,0,0,0.8)' }}
          />

          {/* Screen area — this is the element we getBoundingClientRect() from */}
          <div
            ref={screenRef}
            className="relative overflow-hidden"
            style={{
              aspectRatio: '16/10',
              borderRadius: 8,
              border: '2px solid rgba(255,255,255,0.06)',
              background: '#060212',
            }}
          >
            {/* Screen off overlay */}
            <div
              className="absolute inset-0 z-10 transition-all duration-300 rounded"
              style={{
                background: powered ? 'transparent' : 'rgba(3,2,10,0.96)',
                opacity: powered ? 0 : 1,
                pointerEvents: 'none',
              }}
            />

            {/* Screen glow on power-on */}
            {powered && (
              <div
                className="absolute inset-0 z-20 rounded pointer-events-none monitor-power-on"
                style={{ background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.15) 0%, transparent 70%)' }}
              />
            )}

            {/* Screen content — mini OS preview */}
            <MiniNebula />

            {/* Screen scanline texture */}
            <div
              className="absolute inset-0 pointer-events-none z-30 rounded"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 2px)',
                backgroundSize: '100% 2px',
              }}
            />

            {/* Screen glass glare */}
            <div
              className="absolute top-0 left-0 right-0 pointer-events-none"
              style={{
                height: '35%',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
                borderRadius: '6px 6px 0 0',
              }}
            />

            {/* Hover CTA overlay — "Launch Workspace" button slides up */}
            <div
              className="absolute inset-0 z-40 flex items-center justify-center transition-all duration-300"
              style={{
                background: 'rgba(6,2,18,0.5)',
                backdropFilter: 'blur(2px)',
                opacity: launching ? 0 : undefined,
              }}
            >
              <div
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white"
                style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.9), rgba(99,102,241,0.9))',
                  boxShadow: '0 0 24px rgba(168,85,247,0.4), 0 4px 12px rgba(0,0,0,0.4)',
                  border: '1px solid rgba(168,85,247,0.4)',
                  transform: 'translateY(0)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                }}
              >
                <Zap className="w-4 h-4" />
                <span>Launch Workspace</span>
              </div>
            </div>
          </div>

          {/* Bezel logo / brand text */}
          <div className="flex items-center justify-center mt-2.5">
            <span className="text-[9px] tracking-[0.2em] uppercase font-semibold"
              style={{ color: 'rgba(255,255,255,0.18)' }}>
              Portfolio OS · v2.4
            </span>
          </div>
        </div>

        {/* Monitor stand */}
        <div className="flex flex-col items-center">
          <div style={{ width: 60, height: 20, background: 'linear-gradient(180deg, #111127 0%, #0a0a1a 100%)', clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)', borderRadius: '0 0 2px 2px' }} />
          <div style={{ width: 120, height: 8, background: 'linear-gradient(180deg, #0d0d1e, #070712)', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.6)' }} />
        </div>

        {/* Glow ring under the monitor (ambient light) */}
        <div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 transition-all duration-500"
          style={{
            width: 220, height: 20,
            background: 'radial-gradient(ellipse, rgba(168,85,247,0.2) 0%, transparent 70%)',
            filter: 'blur(8px)',
            opacity: launching ? 0.8 : 0.4,
          }}
        />
      </div>

      {/* Caption below the monitor */}
      <div className="mt-10 text-center space-y-2 max-w-md mx-auto flex flex-col items-center justify-center">
        <div className="flex items-center justify-center space-x-2">
          <Monitor className="w-4 h-4" style={{ color: isDark ? '#a855f7' : '#9333ea' }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: isDark ? '#c084fc' : '#7e22ce' }}>
            Interactive Edition
          </span>
        </div>
        <h3 className={`text-2xl font-bold text-center ${isDark ? 'text-white' : 'text-slate-900'}`} style={{ textAlign: 'center' }}>
          Portfolio OS
        </h3>
        <p className="text-sm leading-relaxed text-center" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : '#475569', textAlign: 'center' }}>
          Experience this portfolio as a desktop operating system.
          <br />
          Apps, terminal, AI assistant, games and more.
        </p>
        <p className="text-xs text-center font-medium pt-1" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : '#64748b', textAlign: 'center' }}>
          Click the monitor to enter
        </p>
      </div>
    </div>
  );
}

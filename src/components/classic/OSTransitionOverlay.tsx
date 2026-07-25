import { useEffect, useState, useRef } from 'react';

interface Props {
  initialRect: DOMRect;
}

// Lightweight animated wallpaper for transition — matches the OS nebula wallpaper palette
function TransitionWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Nebula gas clouds — same colors as Wallpaper.tsx nebula theme
    const clouds = [
      { x: canvas.width * 0.3, y: canvas.height * 0.4, vx: 0.15, vy: 0.08, r: 250, color: 'rgba(168, 85, 247, 0.18)' },
      { x: canvas.width * 0.7, y: canvas.height * 0.6, vx: -0.1,  vy: 0.12, r: 320, color: 'rgba(236, 72, 153, 0.14)' },
      { x: canvas.width * 0.5, y: canvas.height * 0.3, vx: 0.08,  vy: -0.09, r: 280, color: 'rgba(99, 102, 241, 0.18)' },
    ];

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.8 + 0.6,
      color: (['#c084fc', '#f472b6', '#818cf8'] as const)[Math.floor(Math.random() * 3)],
    }));

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.fillStyle = '#060212';
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'screen';
      for (const c of clouds) {
        c.x += c.vx; c.y += c.vy;
        if (c.x < 0 || c.x > W) c.vx *= -1;
        if (c.y < 0 || c.y > H) c.vy *= -1;
        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
        g.addColorStop(0, c.color);
        g.addColorStop(1, 'rgba(6,2,18,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10; ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Neon horizon
      const hg = ctx.createLinearGradient(0, H - 180, 0, H);
      hg.addColorStop(0, 'rgba(168,85,247,0)');
      hg.addColorStop(1, 'rgba(236,72,153,0.15)');
      ctx.fillStyle = hg;
      ctx.fillRect(0, H - 180, W, 180);

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

export default function OSTransitionOverlay({ initialRect }: Props) {
  const [expanded, setExpanded] = useState(false);

  const isPill = initialRect.width < 300 && initialRect.height < 60;

  const top    = Math.max(0, initialRect.top);
  const left   = Math.max(0, initialRect.left);
  const right  = Math.max(0, window.innerWidth  - initialRect.right);
  const bottom = Math.max(0, window.innerHeight - initialRect.bottom);

  // Trigger expansion on first frame for ultra-fast response
  useEffect(() => {
    const id = requestAnimationFrame(() => setExpanded(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const clipPath = expanded
    ? 'inset(0px 0px 0px 0px round 0px)'
    : `inset(${top}px ${right}px ${bottom}px ${left}px round ${isPill ? '9999px' : '14px'})`;

  return (
    <div
      className="os-transition-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        clipPath,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <TransitionWallpaper />

      {/* Vignette fades out as the screen expands */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(3,0,20,0.7) 100%)',
          opacity: expanded ? 0 : 1,
          transition: 'opacity 0.2s ease',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

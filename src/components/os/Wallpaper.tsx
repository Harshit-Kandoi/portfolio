import { useEffect, useRef, useState } from 'react';
import { WallpaperType, useOSStore } from '../../store/useOSStore';

interface WallpaperProps {
  type: WallpaperType;
  /**
   * Which surface this canvas belongs to. The desktop instance freezes while the
   * mobile simulator overlay is open, so only one canvas animates at a time.
   */
  instance?: 'desktop' | 'mobile';
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

export default function Wallpaper({ type, instance = 'desktop' }: WallpaperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useOSStore((state) => state.theme);
  const performanceMode = useOSStore((state) => state.performanceMode);
  const batterySaver = useOSStore((state) => state.batterySaver);
  const isSimulatingMobile = useOSStore((state) => state.isSimulatingMobile);
  const reducedMotion = usePrefersReducedMotion();
  const isLight = theme === 'light';

  // Static frame: reduced motion, battery saver, or a desktop canvas hidden behind the simulator.
  const isStatic = reducedMotion || batterySaver || performanceMode === 'battery'
    || (instance === 'desktop' && isSimulatingMobile);
  // 'performance' = all effects at 60fps; 'balanced' (default) = 30fps with fewer particles.
  const fullQuality = performanceMode === 'performance';
  const targetFps = fullQuality ? 60 : 30;
  const numParticles = fullQuality ? 65 : 40;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number | null = null;
    let lastFrame = 0;
    const frameInterval = 1000 / targetFps;
    // Velocities are tuned for 60fps; scale them so motion speed is fps-independent.
    const k = 60 / targetFps;

    let width = (canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth);
    let height = (canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight);

    // Cosmic Gas Clouds for Nebula Theme
    const gasClouds = [
      { x: width * 0.3, y: height * 0.4, vx: 0.15, vy: 0.08, r: 250, color: isLight ? 'rgba(168, 85, 247, 0.18)' : 'rgba(168, 85, 247, 0.15)' }, // Purple
      { x: width * 0.7, y: height * 0.6, vx: -0.1, vy: 0.12, r: 320, color: isLight ? 'rgba(236, 72, 153, 0.15)' : 'rgba(236, 72, 153, 0.12)' }, // Pink
      { x: width * 0.5, y: height * 0.3, vx: 0.08, vy: -0.09, r: 280, color: isLight ? 'rgba(99, 102, 241, 0.18)' : 'rgba(99, 102, 241, 0.15)' }, // Blue Indigo
    ];

    // Constellation Particles
    const colors = isLight
      ? ['#9333ea', '#db2777', '#4f46e5', '#0284c7']
      : ['#c084fc', '#f472b6', '#818cf8', '#38bdf8'];
    const particles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: Math.random() * 2 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulseSpeed: 0.01 + Math.random() * 0.02,
      pulseVal: Math.random() * Math.PI,
    }));

    // Matrix Digital Rain Drops
    const columns = Math.floor(width / 20) + 1;
    const yPositions: number[] = Array(columns).fill(0);
    const chars = '01AI-CLOUD-REACT-NEXT-MATRIX-PYTHON-GCP-SUPABASE-HTML-TS-JS-YOLO-PYTORCH';

    // Grid Offset
    let gridOffset = 0;

    const draw = () => {
      if (type === 'nebula') {
        ctx.fillStyle = isLight ? '#f1f5f9' : '#060212';
        ctx.fillRect(0, 0, width, height);

        ctx.globalCompositeOperation = isLight ? 'multiply' : 'screen';
        gasClouds.forEach((cloud) => {
          cloud.x += cloud.vx * k;
          cloud.y += cloud.vy * k;
          if (cloud.x < 0 || cloud.x > width) cloud.vx *= -1;
          if (cloud.y < 0 || cloud.y > height) cloud.vy *= -1;

          const radGrad = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.r);
          radGrad.addColorStop(0, cloud.color);
          radGrad.addColorStop(1, isLight ? 'rgba(241, 245, 249, 0)' : 'rgba(6, 2, 18, 0)');
          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalCompositeOperation = 'source-over';

        const horizonGrad = ctx.createLinearGradient(0, height - 200, 0, height);
        horizonGrad.addColorStop(0, 'rgba(168, 85, 247, 0)');
        horizonGrad.addColorStop(0.7, isLight ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.08)');
        horizonGrad.addColorStop(1, isLight ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.18)');
        ctx.fillStyle = horizonGrad;
        ctx.fillRect(0, height - 200, width, 200);

        ctx.strokeStyle = isLight ? 'rgba(219, 39, 119, 0.3)' : 'rgba(236, 72, 153, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, height - 1);
        ctx.lineTo(width, height - 1);
        ctx.stroke();

        particles.forEach((p, idx) => {
          p.x += p.vx * k;
          p.y += p.vy * k;
          p.pulseVal += p.pulseSpeed * k;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          const currentRadius = p.radius + Math.sin(p.pulseVal) * 0.8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();

          for (let j = idx + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 130) {
              const alpha = (1 - dist / 130) * (isLight ? 0.25 : 0.18);
              ctx.strokeStyle = isLight ? `rgba(124, 58, 237, ${alpha})` : `rgba(139, 92, 246, ${alpha})`;
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        });
      } else if (type === 'particles') {
        ctx.fillStyle = isLight ? '#f8fafc' : '#05030a';
        ctx.fillRect(0, 0, width, height);

        ctx.font = '9px Courier New';
        ctx.fillStyle = isLight ? 'rgba(124, 58, 237, 0.35)' : 'rgba(99, 102, 241, 0.28)';
        particles.forEach((p) => {
          p.x += p.vx * 1.5 * k;
          p.y += p.vy * 1.5 * k;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
          ctx.fillText('<code/>', p.x, p.y);
        });
      } else if (type === 'matrix') {
        ctx.fillStyle = isLight ? 'rgba(248, 250, 252, 0.15)' : 'rgba(0, 0, 0, 0.06)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = isLight ? '#059669' : '#0f0';
        ctx.font = '14px Courier New';
        yPositions.forEach((y, index) => {
          const text = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillText(text, index * 20, y);
          yPositions[index] = y > 100 + Math.random() * 10000 ? 0 : y + 20;
        });
      } else if (type === 'grid') {
        ctx.fillStyle = isLight ? '#f8fafc' : '#02000a';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = isLight ? 'rgba(147, 51, 234, 0.1)' : 'rgba(0, 242, 254, 0.04)';
        ctx.lineWidth = 1;
        gridOffset = (gridOffset + 0.25 * k) % 40;
        for (let y = gridOffset; y < height; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        for (let x = 0; x < width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        ctx.strokeStyle = isLight ? 'rgba(147, 51, 234, 0.12)' : 'rgba(168, 85, 247, 0.06)';
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 250, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 500, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const drawStaticFrame = () => {
      // Matrix rain needs a few iterations to build up a visible still image.
      const iterations = type === 'matrix' ? 40 : 1;
      for (let i = 0; i < iterations; i++) draw();
    };

    const loop = (now: number) => {
      animationId = requestAnimationFrame(loop);
      if (now - lastFrame < frameInterval - 1) return;
      lastFrame = now;
      draw();
    };

    const start = () => {
      if (animationId === null && !document.hidden) {
        animationId = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    };

    const handleResize = () => {
      width = canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
      height = canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
      if (isStatic) drawStaticFrame();
    };
    window.addEventListener('resize', handleResize);

    const handleVisibility = () => (document.hidden ? stop() : start());

    if (isStatic) {
      drawStaticFrame();
    } else {
      document.addEventListener('visibilitychange', handleVisibility);
      start();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      stop();
    };
  }, [type, isLight, isStatic, targetFps, numParticles]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" />;
}

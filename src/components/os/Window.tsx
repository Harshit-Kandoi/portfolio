import React, { useRef, useCallback, useEffect } from 'react';
import { motion, useDragControls, PanInfo, Transition } from 'framer-motion';
import { useOSStore } from '../../store/useOSStore';
import { playWindowSound } from '../../utils/sounds';
import { Minus, Square, Copy, X } from 'lucide-react';

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

// Minimum and maximum window bounds
const MIN_W = 360;
const MIN_H = 280;

export default function Window({ id, title, children }: WindowProps) {
  const windowInstance = useOSStore((state) => state.windows.find((w) => w.id === id));
  const activeWindowId = useOSStore((state) => state.activeWindowId);
  const theme = useOSStore((state) => state.theme);
  const viewMode = useOSStore((state) => state.viewMode);
  const windowAnimation = useOSStore((state) => state.windowAnimation);

  const focusWindow    = useOSStore((state) => state.focusWindow);
  const closeWindow    = useOSStore((state) => state.closeWindow);
  const minimizeWindow = useOSStore((state) => state.minimizeWindow);
  const maximizeWindow = useOSStore((state) => state.maximizeWindow);
  const restoreWindow  = useOSStore((state) => state.restoreWindow);
  const updateWindowPosition = useOSStore((state) => state.updateWindowPosition);
  const updateWindowSize     = useOSStore((state) => state.updateWindowSize);
  const persistWindowState   = useOSStore((state) => state.persistWindowState);

  const dragControls = useDragControls();
  const windowRef    = useRef<HTMLDivElement>(null);

  // ── Resize state ─────────────────────────────────────────────────────────
  const resizeStart = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const resizeRafId = useRef<number | null>(null);

  const handleResizePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!windowInstance) return;
    resizeStart.current = { x: e.clientX, y: e.clientY, w: windowInstance.width, h: windowInstance.height };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [windowInstance]);

  const handleResizePointerMove = useCallback((e: React.PointerEvent) => {
    if (!resizeStart.current || !windowInstance) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    if (resizeRafId.current !== null) {
      cancelAnimationFrame(resizeRafId.current);
    }

    resizeRafId.current = requestAnimationFrame(() => {
      if (!resizeStart.current) return;
      const dx = clientX - resizeStart.current.x;
      const dy = clientY - resizeStart.current.y;
      const maxW = window.innerWidth  * 0.95;
      const maxH = window.innerHeight * 0.90;
      const newW = Math.max(MIN_W, Math.min(maxW, resizeStart.current.w + dx));
      const newH = Math.max(MIN_H, Math.min(maxH, resizeStart.current.h + dy));
      updateWindowSize(id, newW, newH);
    });
  }, [id, windowInstance, updateWindowSize]);

  // Ends a resize on pointerup, pointercancel (e.g. the browser takes over a touch)
  // or when pointer capture is lost, so the handle never gets stuck in "resizing".
  const handleResizePointerEnd = useCallback((e: React.PointerEvent) => {
    if (resizeRafId.current !== null) {
      cancelAnimationFrame(resizeRafId.current);
      resizeRafId.current = null;
    }
    const wasResizing = resizeStart.current !== null;
    resizeStart.current = null;
    const el = e.currentTarget as HTMLElement;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    if (wasResizing) persistWindowState();
  }, [persistWindowState]);

  // Focus window container when opened or focused for keyboard navigators
  useEffect(() => {
    if (activeWindowId === id && windowRef.current) {
      windowRef.current.focus();
    }
  }, [activeWindowId, id]);

  if (!windowInstance || !windowInstance.isOpen) return null;

  const isMinimized = windowInstance.isMinimized;
  const isActive    = activeWindowId === id;
  const isMaximized = windowInstance.isMaximized || viewMode === 'tablet';

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    playWindowSound('close');
    closeWindow(id);
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    playWindowSound('minimize');
    minimizeWindow(id);
  };

  const handleMaximizeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    playWindowSound('open');
    if (isMaximized) restoreWindow(id);
    else maximizeWindow(id);
  };

  const startDrag = (event: React.PointerEvent) => {
    focusWindow(id);
    if (!isMaximized) dragControls.start(event);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isMaximized) return;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    let currentX = windowInstance.x + info.offset.x;
    let currentY = Math.max(48, windowInstance.y) + info.offset.y;

    // Viewport boundaries constraints
    const minX = -windowInstance.width + 100;
    const maxX = screenWidth - 100;
    const minY = 48; // Taskbar height is 48px
    const maxY = screenHeight - 80;

    currentX = Math.max(minX, Math.min(maxX, currentX));
    currentY = Math.max(minY, Math.min(maxY, currentY));

    if (info.point.x < 30) {
      updateWindowPosition(id, 0, 48);
      updateWindowSize(id, screenWidth / 2, window.innerHeight - 96);
      playWindowSound('open');
    } else if (info.point.x > screenWidth - 30) {
      updateWindowPosition(id, screenWidth / 2, 48);
      updateWindowSize(id, screenWidth / 2, window.innerHeight - 96);
      playWindowSound('open');
    } else {
      updateWindowPosition(id, currentX, currentY);
    }
    persistWindowState();
  };

  // ── Theme class ──────────────────────────────────────────────────────────
  let windowThemeClass = 'bg-primary-950/80 border-primary-800/40 text-purple-100';
  if (theme === 'light')     windowThemeClass = 'bg-white/90 border-gray-200 text-gray-800 shadow-md';
  else if (theme === 'dark') windowThemeClass = 'bg-gray-900/90 border-gray-800 text-gray-100 shadow-2xl';
  else if (theme === 'cyberpunk') windowThemeClass = 'bg-black border-2 border-yellow-400 text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.2)]';
  else if (theme === 'nord') windowThemeClass = 'bg-[#2e3440]/95 border-[#4c566a] text-[#d8dee9]';
  else if (theme === 'glass') windowThemeClass = 'bg-white/10 backdrop-blur-2xl border border-white/20 text-white shadow-xl';
  else if (theme === 'retro') windowThemeClass = 'bg-black border border-green-500 text-green-500 font-mono shadow-[0_0_10px_rgba(34,197,94,0.3)]';

  const activeBorder = isActive
    ? theme === 'cyberpunk' ? 'border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)]'
    : theme === 'retro'    ? 'border-green-400'
    : 'border-primary-500/80 shadow-2xl ring-1 ring-primary-500/30'
    : '';

  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  const minX = -windowInstance.width + 100;
  const maxX = screenWidth - 100;
  const minY = 48; // Top taskbar/menu bar height is 48px
  const maxY = screenHeight - 80;
  const effectiveY = Math.max(minY, windowInstance.y);

  const maxUpwardOffset = Math.min(0, minY - effectiveY);
  const maxDownwardOffset = Math.max(0, maxY - effectiveY);
  const maxLeftwardOffset = Math.min(0, minX - windowInstance.x);
  const maxRightwardOffset = Math.max(0, maxX - windowInstance.x);

  const dragProps = isMaximized ? {} : {
    drag: true,
    dragControls,
    dragListener: false,
    dragMomentum: false,
    dragElastic: 0,
    dragConstraints: {
      top: maxUpwardOffset,
      bottom: maxDownwardOffset,
      left: maxLeftwardOffset,
      right: maxRightwardOffset,
    },
    onDragEnd: handleDragEnd,
  };

  const initialAnim = windowAnimation === 'instant'
    ? { opacity: 1, scale: 1 }
    : windowAnimation === 'retro'
    ? { opacity: 0, scale: 0.9 }
    : { opacity: 0, scale: 0.92, filter: 'blur(6px)' };

  const transitionConfig: Transition = windowAnimation === 'instant'
    ? { duration: 0 }
    : windowAnimation === 'retro'
    ? { type: 'spring', stiffness: 400, damping: 25 }
    : { type: 'spring', stiffness: 380, damping: 30, mass: 0.8 };

  return (
    <motion.div
      ref={windowRef}
      tabIndex={-1}
      role="dialog"
      aria-labelledby={`${id}-window-title`}
      {...dragProps}
      transformTemplate={({ x, y, scale }) => {
        const numericY = typeof y === 'number' ? y : parseFloat(String(y) || '48');
        const clampedY = isNaN(numericY) ? 48 : Math.max(48, numericY);
        const xStr = x !== undefined ? (typeof x === 'number' ? `${x}px` : x) : '0px';
        const scaleStr = scale !== undefined ? `scale(${scale})` : '';
        return `translate3d(${xStr}, ${clampedY}px, 0px) ${scaleStr}`.trim();
      }}
      initial={initialAnim}
      animate={{
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        x: isMaximized ? 0 : windowInstance.x,
        y: isMaximized ? 48 : effectiveY,
        width:  isMaximized ? '100vw' : windowInstance.width,
        height: viewMode === 'tablet' ? 'calc(100vh - 144px)' : (isMaximized ? 'calc(100vh - 96px)' : windowInstance.height),
        zIndex: windowInstance.zIndex,
      }}
      transition={transitionConfig}
      onPointerDown={() => focusWindow(id)}
      className={`fixed top-0 left-0 rounded-xl overflow-hidden border flex flex-col backdrop-blur-md ${windowThemeClass} ${activeBorder}`}
      style={{
        maxHeight: viewMode === 'tablet' ? 'calc(100vh - 144px)' : 'calc(100vh - 96px)',
        visibility: isMinimized ? 'hidden' : 'visible',
        pointerEvents: isMinimized ? 'none' : 'auto',
      }}
      aria-hidden={isMinimized}
    >
      {/* Window Title Bar */}
      <div
        onPointerDown={startDrag}
        onDoubleClick={handleMaximizeToggle}
        className={`px-4 py-2.5 flex items-center justify-between cursor-move select-none touch-none border-b ${
          theme === 'retro' ? 'border-green-500/50' : (theme === 'light' ? 'border-slate-200 bg-slate-100/80' : 'border-white/10')
        } ${isActive ? (theme === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-white/5 text-white') : ''}`}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)] animate-pulse' : 'bg-purple-500/40'}`} />
          <span id={`${id}-window-title`} className={`text-xs font-bold tracking-wide ${theme === 'light' ? 'text-slate-900' : ''} ${theme === 'retro' ? 'uppercase font-mono' : ''}`}>
            {title}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={handleMinimize} className={`p-1 rounded-md transition ${theme === 'light' ? 'text-slate-600 hover:bg-slate-200 hover:text-slate-900' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`} title="Minimize" aria-label="Minimize Window">
            <Minus className="w-3.5 h-3.5" />
          </button>
          {viewMode !== 'tablet' && (
            <button onClick={handleMaximizeToggle} className={`p-1 rounded-md transition ${theme === 'light' ? 'text-slate-600 hover:bg-slate-200 hover:text-slate-900' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`} title={isMaximized ? 'Restore' : 'Maximize'} aria-label={isMaximized ? 'Restore Window Size' : 'Maximize Window'}>
              {isMaximized ? <Copy className="w-3 h-3" /> : <Square className="w-3 h-3" />}
            </button>
          )}
          <button onClick={handleClose} className={`p-1 rounded-md hover:bg-red-500/80 hover:text-white transition ${theme === 'light' ? 'text-slate-600' : 'text-gray-400'}`} title="Close" aria-label="Close Window">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Window Contents */}
      <div className="grow overflow-y-auto min-h-0 flex flex-col">
        {children}
      </div>

      {/* ── Resize Handle (bottom-right corner) ─────────────────────────── */}
      {!isMaximized && (
        <div
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerEnd}
          onPointerCancel={handleResizePointerEnd}
          onLostPointerCapture={handleResizePointerEnd}
          className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-50 group touch-none"
          title="Drag to resize"
        >
          {/* Visual resize grip dots */}
          <svg viewBox="0 0 10 10" className="w-full h-full opacity-20 group-hover:opacity-60 transition-opacity">
            <circle cx="8" cy="8" r="1.2" fill="currentColor" />
            <circle cx="5" cy="8" r="1.2" fill="currentColor" />
            <circle cx="8" cy="5" r="1.2" fill="currentColor" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}

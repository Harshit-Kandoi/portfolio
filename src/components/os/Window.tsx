import React, { useRef } from 'react';
import { motion, useDragControls, PanInfo } from 'framer-motion';
import { useOSStore } from '../../store/useOSStore';
import { playWindowSound } from '../../utils/sounds';
import { Minus, Square, Copy, X } from 'lucide-react';

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export default function Window({ id, title, children }: WindowProps) {
  const windowInstance = useOSStore((state) => state.windows.find((w) => w.id === id));
  const activeWindowId = useOSStore((state) => state.activeWindowId);
  const theme = useOSStore((state) => state.theme);
  const viewMode = useOSStore((state) => state.viewMode);
  
  const focusWindow = useOSStore((state) => state.focusWindow);
  const closeWindow = useOSStore((state) => state.closeWindow);
  const minimizeWindow = useOSStore((state) => state.minimizeWindow);
  const maximizeWindow = useOSStore((state) => state.maximizeWindow);
  const restoreWindow = useOSStore((state) => state.restoreWindow);
  const updateWindowPosition = useOSStore((state) => state.updateWindowPosition);

  const dragControls = useDragControls();
  const windowRef = useRef<HTMLDivElement>(null);

  if (!windowInstance || !windowInstance.isOpen || windowInstance.isMinimized) return null;

  const isActive = activeWindowId === id;
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
    if (isMaximized) {
      restoreWindow(id);
    } else {
      maximizeWindow(id);
    }
  };

  const startDrag = (event: React.PointerEvent) => {
    focusWindow(id);
    if (!isMaximized) {
      dragControls.start(event);
    }
  };

  // Drag snapping logic
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isMaximized) return;

    const screenWidth = window.innerWidth;
    const currentX = windowInstance.x + info.offset.x;
    const currentY = windowInstance.y + info.offset.y;

    // Check if dragged to left edge
    if (info.point.x < 30) {
      updateWindowPosition(id, 0, 48); // 48px is top taskbar
      // We could set size to 50% width here
      useOSStore.getState().updateWindowSize(id, screenWidth / 2, window.innerHeight - 96);
      playWindowSound('open');
    } 
    // Check if dragged to right edge
    else if (info.point.x > screenWidth - 30) {
      updateWindowPosition(id, screenWidth / 2, 48);
      useOSStore.getState().updateWindowSize(id, screenWidth / 2, window.innerHeight - 96);
      playWindowSound('open');
    } 
    // Normal update
    else {
      updateWindowPosition(id, currentX, currentY);
    }
  };

  // Style class configuration depending on active/inactive states and themes
  let windowThemeClass = 'bg-[#1e1b4b]/80 border-[#3730a3]/40 text-purple-100'; // Default midnight
  
  if (theme === 'light') {
    windowThemeClass = 'bg-white/90 border-gray-200 text-gray-800 shadow-md';
  } else if (theme === 'dark') {
    windowThemeClass = 'bg-gray-900/90 border-gray-800 text-gray-100 shadow-2xl';
  } else if (theme === 'cyberpunk') {
    windowThemeClass = 'bg-black border-2 border-yellow-400 text-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.2)]';
  } else if (theme === 'nord') {
    windowThemeClass = 'bg-[#2e3440]/95 border-[#4c566a] text-[#d8dee9]';
  } else if (theme === 'glass') {
    windowThemeClass = 'bg-white/10 backdrop-blur-2xl border border-white/20 text-white shadow-xl';
  } else if (theme === 'retro') {
    windowThemeClass = 'bg-black border border-green-500 text-green-500 font-mono shadow-[0_0_10px_rgba(34,197,94,0.3)]';
  }

  // Active border highlighting
  const activeBorder = isActive 
    ? theme === 'cyberpunk' 
      ? 'border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)]' 
      : theme === 'retro' 
        ? 'border-green-400' 
        : 'border-primary-500/80 shadow-2xl ring-1 ring-primary-500/30'
    : '';

  const dragProps = isMaximized ? {} : {
    drag: true,
    dragControls: dragControls,
    dragListener: false,
    dragMomentum: false,
    dragElastic: 0,
    onDragEnd: handleDragEnd,
  };

  return (
    <motion.div
      ref={windowRef}
      {...dragProps}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        x: isMaximized ? 0 : windowInstance.x,
        y: isMaximized ? 48 : windowInstance.y,
        width: isMaximized ? '100vw' : windowInstance.width,
        height: viewMode === 'tablet' ? 'calc(100vh - 144px)' : (isMaximized ? 'calc(100vh - 96px)' : windowInstance.height),
        zIndex: windowInstance.zIndex,
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      onPointerDown={() => focusWindow(id)}
      className={`fixed rounded-xl overflow-hidden border flex flex-col backdrop-blur-md ${windowThemeClass} ${activeBorder}`}
      style={{
        maxHeight: viewMode === 'tablet' ? 'calc(100vh - 144px)' : 'calc(100vh - 96px)',
      }}
    >

      {/* Window Title Bar / Drag Handler */}
      <div
        onPointerDown={startDrag}
        onDoubleClick={handleMaximizeToggle}
        className={`px-4 py-2.5 flex items-center justify-between cursor-move select-none border-b ${
          theme === 'retro' ? 'border-green-500/50' : 'border-white/10 dark:border-gray-800/60'
        } ${isActive ? 'bg-white/5' : 'bg-transparent'}`}
      >
        <div className="flex items-center space-x-2">
          {/* OS Title Icon */}
          <div className="w-2.5 h-2.5 rounded-full bg-purple-500/40" />
          <span className={`text-xs font-semibold tracking-wide ${theme === 'retro' ? 'uppercase font-mono' : ''}`}>
            {title}
          </span>
        </div>

        {/* Window controls */}
        <div className="flex items-center space-x-2">
          {/* Minimize */}
          <button
            onClick={handleMinimize}
            className="p-1 rounded-md hover:bg-white/10 transition text-gray-400 hover:text-white"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          
          {/* Maximize / Restore */}
          {viewMode !== 'tablet' && (
            <button
              onClick={handleMaximizeToggle}
              className="p-1 rounded-md hover:bg-white/10 transition text-gray-400 hover:text-white"
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? <Copy className="w-3 h-3" /> : <Square className="w-3 h-3" />}
            </button>
          )}

          {/* Close */}
          <button
            onClick={handleClose}
            className="p-1 rounded-md hover:bg-red-500/80 hover:text-white transition text-gray-400"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Window Contents */}
      <div className="flex-grow overflow-y-auto min-h-0 flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}

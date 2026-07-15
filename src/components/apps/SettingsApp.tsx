import React from 'react';
import { useOSStore, AppTheme, WallpaperType } from '../../store/useOSStore';
import { Monitor, Volume2, Palette, ShieldAlert, Smartphone, Cpu, CheckCircle2, Sun } from 'lucide-react';
import { playThemeSwitchSound } from '../../utils/sounds';

export default function SettingsApp({ isMobileView = false }: { isMobileView?: boolean }) {
  const { 
    theme, setTheme, wallpaper, setWallpaper, soundEnabled, setSoundEnabled, volume, setVolume,
    layoutOverride, setLayoutOverride, mobileBrightness, setMobileBrightness
  } = useOSStore();

  const handleThemeChange = (newTheme: AppTheme) => {
    setTheme(newTheme);
    playThemeSwitchSound();
  };

  const isLight = theme === 'light';
  const boxBg = isLight ? 'bg-gray-150 text-gray-800' : 'bg-slate-900/40 border-white/5 text-purple-100';

  if (isMobileView) {
    return (
      <div className={`flex flex-col flex-grow h-full overflow-y-auto p-4 space-y-5 ${isLight ? 'bg-white text-gray-800' : 'bg-slate-950 text-purple-100'} custom-scrollbar`}>
        {/* Mobile Header */}
        <div className="flex items-center space-x-2.5 pb-2.5 border-b border-white/5">
          <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/25">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold leading-snug">Phone Settings</h3>
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Device Configuration</p>
          </div>
        </div>

        {/* Sliders: Brightness and Sound Volume */}
        <div className={`p-4 rounded-xl border space-y-4 ${boxBg}`}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
            <Sun className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span>Display & Audio</span>
          </h3>
          
          {/* Brightness Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-semibold text-gray-400">
              <span>Screen Brightness</span>
              <span>{Math.round(mobileBrightness * 100)}%</span>
            </div>
            <input 
              type="range"
              min="0.15"
              max="1.0"
              step="0.05"
              value={mobileBrightness}
              onChange={(e) => setMobileBrightness(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Sound Volume Slider */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between items-center text-[10px] font-semibold text-gray-400">
              <span>System Volume</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
              disabled={!soundEnabled}
            />
          </div>

          <label className="flex items-center space-x-2.5 text-xs font-semibold cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500 bg-black/20 border-white/10"
            />
            <span>Enable System Sound Effects</span>
          </label>
        </div>

        {/* Mobile Storage Simulation */}
        <div className={`p-4 rounded-xl border space-y-3 ${boxBg}`}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4 text-sky-400" />
            <span>Device Storage</span>
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-gray-400">
              <span>Internal Memory Used</span>
              <span>98.4 GB / 128 GB</span>
            </div>
            <div className="w-full bg-slate-900 border border-white/5 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: '76.8%' }} />
            </div>
            <p className="text-[9px] text-gray-500">Free space: 29.6 GB · System cache is optimal</p>
          </div>
        </div>

        {/* System Info & Update */}
        <div className={`p-4 rounded-xl border space-y-4 ${boxBg}`}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>System Update</span>
          </h3>
          <div className="flex flex-col justify-between gap-3 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-[11px] font-bold text-white">Android OS 13 / Portfolio OS v2.2</h4>
              </div>
              <p className="text-[9.5px] text-emerald-300 font-semibold">System is up to date</p>
              <p className="text-[9px] text-gray-500">Checked: Today 17:16 · Jaipur, India</p>
            </div>
            <button 
              onClick={() => alert("Checking for updates... \nYour phone is already running the latest version of Portfolio OS (v2.2).")}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg transition self-start"
            >
              Check Update
            </button>
          </div>
        </div>
      </div>
    );
  }

  const themesList: { id: AppTheme; label: string; desc: string; color: string }[] = [
    { id: 'midnight', label: 'Midnight Purple', desc: 'Default galactic deep purples and violet accent glows', color: 'from-[#03001e] to-[#7303c0]' },
    { id: 'dark', label: 'Eclipse Dark', desc: 'Standard slate grey developer theme with high contrast', color: 'from-gray-900 to-black' },
    { id: 'light', label: 'Arctic Light', desc: 'Clean paper theme with soft shades and clear typography', color: 'from-white to-gray-200' },
    { id: 'cyberpunk', label: 'Cyberpunk 2077', desc: 'High-contrast neon yellow and hot pink styling overrides', color: 'from-black to-yellow-500' },
    { id: 'nord', label: 'Nord Icy', desc: 'Chilled polar colors, soft arctic blues, and clean visuals', color: 'from-[#2e3440] to-[#88c0d0]' },
    { id: 'glass', label: 'Glassmorphism', desc: 'High transparency layouts with structural backdrop filters', color: 'from-[#ffffff]/10 to-[#ffffff]/20' },
    { id: 'retro', label: 'Retro CRT Green', desc: 'Monochrome green terminal scanlines and horizontal flickers', color: 'from-black to-green-600' }
  ];

  const wallpapersList: { id: WallpaperType; label: string }[] = [
    { id: 'nebula', label: 'Pulsing Star Network' },
    { id: 'particles', label: 'Space Dust & Code Symbols' },
    { id: 'matrix', label: 'Green Digital Rain' },
    { id: 'grid', label: 'Technical Cyber Grid' }
  ];

  return (
    <div className={`flex flex-col flex-grow h-full overflow-y-auto p-5 md:p-6 space-y-6 ${isLight ? 'bg-white text-gray-800' : 'bg-slate-950 text-purple-100'}`}>
      
      {/* Themes Settings Section */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
          <Palette className="w-4 h-4 text-pink-400" />
          <span>Active Interface Theme</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {themesList.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className={`p-4 rounded-2xl border text-left flex items-start space-x-3.5 transition-all ${
                  isSelected 
                    ? 'bg-purple-600/20 border-purple-500 shadow-md shadow-purple-500/10' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${t.color} border border-white/10 shrink-0`} />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white leading-tight">{t.label}</h4>
                  <p className="text-[10px] text-gray-400 mt-1 leading-normal">{t.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Wallpapers Selection */}
        <div className={`p-4 rounded-xl border space-y-3.5 ${boxBg}`}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
            <Monitor className="w-4 h-4 text-sky-400" />
            <span>Desktop Wallpaper</span>
          </h3>
          
          <div className="flex flex-col space-y-2 text-xs">
            {wallpapersList.map((w) => {
              const isSelected = wallpaper === w.id;
              return (
                <button
                  key={w.id}
                  onClick={() => setWallpaper(w.id)}
                  className={`w-full p-2.5 rounded-lg text-left border transition-all ${
                    isSelected 
                      ? 'bg-purple-600/20 border-purple-500 font-semibold text-white' 
                      : 'bg-black/20 border-white/5 hover:bg-white/5'
                  }`}
                >
                  {w.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Audio Control settings panel */}
        <div className={`p-4 rounded-xl border space-y-4 ${boxBg}`}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Audio & Sound Tones</span>
          </h3>

          <div className="space-y-3.5">
            <label className="flex items-center space-x-2.5 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500 bg-black/20 border-white/10"
              />
              <span>Enable Interface Sounds</span>
            </label>

            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400">
                <span>Sound Volume</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
                disabled={!soundEnabled}
              />
            </div>
          </div>

          <div className="bg-purple-950/20 border border-purple-900/35 p-3 rounded-xl flex items-start space-x-2 text-[10px]">
            <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p className="text-gray-400 leading-normal">
              Sound effects are generated dynamically inside the browser via Web Audio synth logic, keeping initial package load light.
            </p>
          </div>
        </div>

        {/* System Layout Override Control Panel */}
        <div className={`p-4 rounded-xl border space-y-4 md:col-span-2 ${boxBg}`}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
            <Monitor className="w-4 h-4 text-pink-400" />
            <span>System Layout Profile</span>
          </h3>
          <p className="text-[10px] text-gray-400 mt-1 max-w-xl leading-normal">
            Force a specific screen layout mode to preview how the portfolio displays on different devices, or keep it set to Auto to react to your browser window width.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            {[
              { id: 'auto', label: 'Auto (Responsive)', desc: 'Responsive width check' },
              { id: 'desktop', label: 'Desktop Mode', desc: 'Standard windows layout' },
              { id: 'tablet', label: 'Tablet Mode', desc: 'Auto-maximized touch' },
              { id: 'mobile', label: 'Mobile Android', desc: 'Android OS interface' }
            ].map((opt) => {
              const isSelected = layoutOverride === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setLayoutOverride(opt.id as 'auto' | 'desktop' | 'tablet' | 'mobile')}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-purple-600/25 border-purple-500 text-white font-semibold shadow-md shadow-purple-500/10'
                      : 'bg-black/20 border-white/5 hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <span className="text-xs font-bold">{opt.label}</span>
                  <span className="text-[9px] text-gray-400 mt-1 leading-tight">{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Simulator Control Panel (Desktop only) */}
        {useOSStore.getState().viewMode === 'desktop' && (
          <div className={`p-4 rounded-xl border space-y-4 md:col-span-2 ${boxBg}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>Android Smartphone OS Simulator</span>
            </h3>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="text-xs font-bold text-white">Toggle Simulated View</h4>
                <p className="text-[10px] text-gray-400 mt-1 max-w-md leading-normal">
                  Renders a hyper-realistic virtual smartphone device frame running our custom Android-style OS. Allows you to test the mobile layout right from your desktop.
                </p>
              </div>
              <button
                onClick={() => useOSStore.setState({ isSimulatingMobile: !useOSStore.getState().isSimulatingMobile })}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  useOSStore.getState().isSimulatingMobile
                    ? 'bg-purple-600 border-purple-500 hover:bg-purple-700 text-white'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
                }`}
              >
                {useOSStore.getState().isSimulatingMobile ? 'Disable Simulator' : 'Enable Simulator'}
              </button>
            </div>
          </div>
        )}

        {/* System Update & Device Info Panel */}
        <div className={`p-4 rounded-xl border space-y-4 md:col-span-2 ${boxBg}`}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>System Update & Device Info</span>
          </h3>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white">Android OS 13 / Portfolio OS v2.2</h4>
              </div>
              <p className="text-[10px] text-emerald-300 font-medium font-semibold">System is up to date</p>
              <p className="text-[9.5px] text-gray-500">Security patch level: July 2026 · Jaipur, Rajasthan</p>
            </div>
            <button 
              onClick={() => alert("Checking for updates... \nYour system is already running the latest version of Portfolio OS (v2.2).")}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[11px] font-bold py-2 px-4 rounded-xl transition"
            >
              Check for Update
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

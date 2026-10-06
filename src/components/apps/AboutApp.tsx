import React, { useState, useEffect } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { SPOTIFY_CONFIG } from '../../data/config';
import { Music, Award, MapPin, Code2, Sparkles, Quote, Target, Terminal, GitBranch, Cpu, Clock, ExternalLink, RotateCw } from 'lucide-react';
import { trackEvent } from '../../utils/analytics';
import { useGitHubStats } from '../../services/github';
import { formatUptimeHHMMSS } from '../../utils/system';
import { toSpotifyEmbedUrl, toSpotifyExternalUrl } from '../../utils/spotify';

const QUOTES = [
  "Good backend systems disappear. Users notice them only when they're broken.",
  "If a process can fail silently, it eventually will.",
  "I enjoy building systems that keep working after I stop thinking about them.",
  "Event-driven is not an architecture — it's a mindset.",
];

const QUEST_CARDS = [
  { label: 'CURRENT QUEST',      value: 'Building useful AI and cloud systems', color: 'text-purple-400',  border: 'border-purple-500/20' },
  { label: 'CURRENTLY BUILDING', value: 'Financial Mirror • ClearCue-AI • Pixel Buddy', color: 'text-emerald-400', border: 'border-emerald-500/20' },
  { label: 'CURRENT OBSESSION',  value: 'Event-driven Architectures',        color: 'text-amber-400',   border: 'border-amber-500/20' },
  { label: 'LEVELING UP',        value: 'Kubernetes • Clouds • Agents',      color: 'text-blue-400',    border: 'border-blue-500/20' },
];

const MISSION_LOG = [
  { done: true,  text: 'Google ACE Certified'              },
  { done: true,  text: 'System Design Masterclass'         },
  { done: false, text: 'M.Tech AI & ML in progress'        },
  { done: false, text: 'Build & Launch SaaS Product'       },
  { done: false, text: 'Active on LinkedIn & Medium'       },
  { done: false, text: 'Publish Kaggle Dataset'            },
];

function UptimeCounter() {
  const [uptimeStr, setUptimeStr] = useState(() => formatUptimeHHMMSS());
  useEffect(() => {
    const t = setInterval(() => setUptimeStr(formatUptimeHHMMSS()), 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="font-mono text-emerald-400">{uptimeStr}</span>;
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-purple-300">
      {time.toLocaleTimeString('en-IN', { hour12: false })}
    </span>
  );
}

function SpotifyPlayerCard({ boxBg }: { boxBg: string }) {
  const [selectedUrl, setSelectedUrl] = useState(SPOTIFY_CONFIG.embedUrl);
  const [currentEmbedUrl, setCurrentEmbedUrl] = useState(() => toSpotifyEmbedUrl(SPOTIFY_CONFIG.embedUrl));
  const [retryKey, setRetryKey] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  const handleSelectPlaylist = (rawUrl: string) => {
    setSelectedUrl(rawUrl);
    setCurrentEmbedUrl(toSpotifyEmbedUrl(rawUrl));
    setIsFallback(false);
    setIsRetrying(false);
    setRetryKey((k) => k + 1);
  };

  const handleManualRetry = () => {
    setIsRetrying(true);
    setRetryKey((k) => k + 1);
    setTimeout(() => setIsRetrying(false), 800);
  };

  const externalUrl = toSpotifyExternalUrl(selectedUrl || SPOTIFY_CONFIG.externalUrl);

  return (
    <div className={`flex p-4 rounded-xl border flex-col space-y-2.5 ${boxBg}`}>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
          <Music className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          <span>Now Playing (Spotify)</span>
          {isFallback && (
            <span className="text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono">
              Fallback Active
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRetry}
            className="text-[9px] text-gray-400 hover:text-white flex items-center gap-1 font-medium transition"
            title="Reload/Retry player iframe"
          >
            <RotateCw className={`w-2.5 h-2.5 ${isRetrying ? 'animate-spin text-pink-400' : ''}`} />
            <span>Retry</span>
          </button>
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] text-pink-400 hover:text-pink-300 flex items-center gap-1 font-semibold transition"
            title="Open playlist directly on Spotify App/Browser"
          >
            <span>Spotify App</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      <div className="flex items-center gap-1.5 pb-1 flex-wrap">
        {SPOTIFY_CONFIG.playlists.map((pl) => {
          const isSelected = selectedUrl === pl.url;
          return (
            <button
              key={pl.id}
              onClick={() => handleSelectPlaylist(pl.url)}
              className={`px-2 py-0.5 rounded-md text-[9px] font-medium transition ${
                isSelected
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              {pl.label}
            </button>
          );
        })}
      </div>

      <div className="w-full rounded-xl overflow-hidden shadow-md bg-black/40 relative">
        <iframe
          key={`${currentEmbedUrl}-${retryKey}`}
          style={{ borderRadius: '12px', display: 'block' }}
          src={currentEmbedUrl}
          width="100%"
          height="152"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
    </div>
  );
}

export default function AboutApp({ isMobileView }: { isMobileView?: boolean } = {}) {
  const theme = useOSStore((state) => state.theme);
  const globalViewMode = useOSStore((state) => state.viewMode);
  const isSimulatingMobile = useOSStore((state) => state.isSimulatingMobile);
  const isMobile = isMobileView || globalViewMode === 'mobile' || isSimulatingMobile;
  const [activeQuote, setActiveQuote] = useState(QUOTES[0]);
  const { stats: ghStats, loading: ghLoading } = useGitHubStats();

  useEffect(() => {
    if (!isMobile) {
      trackEvent('about_spotify_open');
    }
  }, [isMobile]);

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setActiveQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }, 12000);
    return () => clearInterval(quoteTimer);
  }, []);

  const isLight = theme === 'light';
  const boxBg = isLight
    ? 'bg-white border-gray-200/80 shadow-sm'
    : 'bg-white/5 border-white/10 backdrop-blur-md';

  return (
    <div className={`flex flex-col flex-grow h-full overflow-y-auto p-5 space-y-6 ${isLight ? 'bg-gray-50 text-gray-800' : 'bg-slate-950 text-purple-100'} custom-scrollbar`}>

      {/* Live system stats bar */}
      <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 rounded-xl border text-[10px] font-mono ${isLight ? 'bg-gray-100 border-gray-200 text-gray-600' : 'bg-slate-900 border-white/5 text-gray-400'}`}>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          <span className="text-emerald-400 font-bold">STATUS OK</span>
        </span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-purple-400" /> uptime: <UptimeCounter /></span>
        <span className="flex items-center gap-1"><Terminal className="w-3 h-3 text-indigo-400" /> <LiveClock /></span>
        <span className="flex items-center gap-1">
          <GitBranch className="w-3 h-3 text-amber-400" />
          commits:{' '}
          {ghLoading ? (
            <span className="animate-pulse text-gray-500">···</span>
          ) : (
            <span className="text-amber-300">{(ghStats?.total_commits ?? 0).toLocaleString()}</span>
          )}
        </span>
        <span className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-pink-400" />
          repos: <span className="text-pink-300">{ghStats?.public_repos ?? '···'}</span>
        </span>
        <span className="ml-auto text-[9px] text-gray-600 hidden sm:block">PID: 1024 · mem: 37 MB</span>
      </div>

      {/* Bio and Profile */}
      <div className={`grid gap-6 items-start ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>

        {/* Profile Card */}
        <div className={`${isMobile ? '' : 'col-span-1'} border p-6 rounded-2xl flex flex-col items-center text-center space-y-4 shadow-xl ${boxBg}`}>
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500/50 flex items-center justify-center shadow-lg shadow-purple-500/10">
              <img src={ghStats?.avatar_url || '/profile.webp'} alt={ghStats?.name || 'Harshit Kandoi'} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span
              className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse cursor-default"
              title="Available for interesting projects"
            />
          </div>

          <div className="w-full">
            <h2 className={`text-sm font-bold tracking-wide text-center ${isLight ? 'text-slate-900' : 'text-white'}`}>{ghStats?.name || 'Harshit Kandoi'}</h2>
            <p className="text-[10px] text-purple-500 font-semibold mt-0.5 text-center">Full Stack Software Engineer</p>
            <p className="text-[9px] text-emerald-500 font-bold mt-1 animate-pulse text-center">● Available for interesting projects</p>
          </div>

          <div className={`w-full space-y-2 text-[10px] sm:text-xs pt-3 border-t border-white/10 text-left ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span>{ghStats?.location || 'Jaipur, Rajasthan, India'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Code2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Java • Python • GCP • React</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Google ACE • System Design</span>
            </div>
          </div>
        </div>

        {/* Professional Bio */}
        <div className={`${isMobile ? '' : 'col-span-2'} space-y-4`}>
          <div className="flex items-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-ping" />
            <h3 className="text-sm font-bold tracking-wider uppercase text-purple-500">Bio Profile</h3>
          </div>
          <p className={`text-xs leading-relaxed text-justify ${isLight ? 'text-slate-800 font-medium' : 'text-gray-300'}`}>
            I build full-stack applications that automate business workflows and simplify operational processes. My work focuses on API integrations, cloud-native services on Google Cloud Platform, AI proof-of-concepts, and backend development using Java and Python.
          </p>
          <p className={`text-xs leading-relaxed text-justify ${isLight ? 'text-slate-800 font-medium' : 'text-gray-300'}`}>
            Currently, I'm an Associate Software Engineer at <strong>ThoughtIn Solutions</strong>, where I develop internal business applications, event-driven cloud workflows, and analytics/reporting tools using Java, Python, React, and GCP services such as Cloud Functions, Pub/Sub, and Firestore. Outside of work, I am starting an M.Tech in AI & ML and building practical product experiments.
          </p>

          {/* Quest Cards */}
          <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
            {QUEST_CARDS.map((card) => (
              <div key={card.label} className={`p-3 rounded-xl border ${boxBg} ${card.border} hover:scale-[1.02] transition-transform duration-200`}>
                <span className={`text-[8px] font-black uppercase tracking-widest ${card.color}`}>{card.label}</span>
                <p className={`font-semibold mt-1 text-[11px] leading-snug ${isLight ? 'text-slate-900' : 'text-white'}`}>{card.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Widgets Row */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>

        {/* Spotify — shown on all devices */}
        <SpotifyPlayerCard boxBg={boxBg} />

        {/* Quote + Mission Log */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${boxBg} shadow-lg`}>
          <div className="flex items-start space-x-2">
            <Quote className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p className={`text-[11px] italic leading-normal transition-all duration-500 ${isLight ? 'text-slate-800 font-medium' : 'text-gray-300'}`}>
              "{activeQuote}"
            </p>
          </div>

          {/* Mission Log */}
          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center space-x-1.5 mb-2">
              <Target className="w-3 h-3 text-indigo-400" />
              <span className="text-[9px] font-black uppercase tracking-wider text-indigo-500">Mission Log · 2026</span>
            </div>
            <div className="space-y-1">
              {MISSION_LOG.map((item) => (
                <div key={item.text} className="flex items-center space-x-2 text-[10px]">
                  <span className={item.done ? 'text-emerald-500 font-bold' : (isLight ? 'text-slate-400' : 'text-gray-500')}>
                    {item.done ? '✓' : '□'}
                  </span>
                  <span className={item.done ? (isLight ? 'text-emerald-700 font-semibold line-through decoration-emerald-500' : 'text-emerald-300 line-through decoration-emerald-700') : (isLight ? 'text-slate-700 font-medium' : 'text-gray-300')}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Behind the Screen */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold tracking-wider uppercase text-purple-500 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Behind the Screen</span>
        </h3>
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] ${isLight ? 'text-slate-800' : 'text-gray-300'}`}>

          <div className={`p-4 rounded-xl border ${boxBg} hover:border-purple-500/30 transition group`}>
            <p className={`font-bold text-[11px] mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>🔍 Offline GCP Emulator</p>
            <div className={`space-y-1 text-[10px] ${isLight ? 'text-slate-700 font-medium' : 'text-gray-400'}`}>
              <div>✓ <span className="text-emerald-600 font-bold">Zero cloud cost</span> during development</div>
              <div>✓ <span className="text-emerald-600 font-bold">Local Pub/Sub</span> + Firestore support</div>
              <div>✓ <span className="text-emerald-600 font-bold">Reduced debug cycles</span> by ~10×</div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${boxBg} hover:border-purple-500/30 transition group`}>
            <p className={`font-bold text-[11px] mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>⚡ YOLOv5 ASL Detector</p>
            <div className={`space-y-1 text-[10px] ${isLight ? 'text-slate-700 font-medium' : 'text-gray-400'}`}>
              <div>✓ <span className="text-emerald-600 font-bold">90%+ accuracy</span> in real-time inference</div>
              <div>✓ <span className="text-emerald-600 font-bold">Custom dataset</span> curated from scratch</div>
              <div>✓ <span className="text-emerald-600 font-bold">OpenCV pipeline</span> with webcam input</div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${boxBg} hover:border-purple-500/30 transition group`}>
            <p className={`font-bold text-[11px] mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>☕ Fuel Source Protocol</p>
            <div className={`space-y-1 text-[10px] ${isLight ? 'text-slate-700 font-medium' : 'text-gray-400'}`}>
              <div>✓ <span className="text-emerald-600 font-bold">Synthwave</span> for deep focus sessions</div>
              <div>✓ <span className="text-emerald-600 font-bold">4–6 cups</span> average coding day</div>
              <div>✓ <span className="text-emerald-600 font-bold">Rajasthani Folk</span> for architecture design</div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

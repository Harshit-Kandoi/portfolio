import React, { useState, useEffect } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { Music, Award, MapPin, Code2, Sparkles, BookOpen, Quote } from 'lucide-react';

const QUOTES = [
  "Simplify, then add lightness. — Colin Chapman",
  "The best error message is the one that never shows up. — Thomas Fuchs",
  "Before software can be reusable it first has to be usable. — Ralph Johnson",
  "GCP Cloud Functions are the glue that binds modern enterprise automations together."
];

export default function AboutApp() {
  const theme = useOSStore((state) => state.theme);
  const viewMode = useOSStore((state) => state.viewMode);
  const [activeQuote, setActiveQuote] = useState(QUOTES[0]);

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setActiveQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }, 15000);

    return () => {
      clearInterval(quoteTimer);
    };
  }, []);

  const isLight = theme === 'light';
  const isMobile = viewMode === 'mobile';
  const textMuted = isLight ? 'text-gray-500' : 'text-gray-400';
  const boxBg = isLight 
    ? 'bg-white border-gray-200/80 shadow-sm' 
    : 'bg-white/5 border-white/10 backdrop-blur-md';

  return (
    <div className={`flex flex-col flex-grow h-full overflow-y-auto p-5 md:p-6 space-y-6 ${isLight ? 'bg-gray-50 text-gray-800' : 'bg-slate-950 text-purple-100'} custom-scrollbar`}>
      
      {/* Bio and Card Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Profile Card */}
        <div className={`md:col-span-1 border p-6 rounded-2xl flex flex-col items-center text-center space-y-4 shadow-xl ${boxBg}`}>
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500/50 flex items-center justify-center shadow-lg shadow-purple-500/10">
              <img src="/profile.jpg" alt="Harshit Kandoi" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">Harshit Kandoi</h2>
            <p className="text-[10px] text-purple-400 font-semibold mt-0.5">Software & AI Engineer</p>
          </div>

          <div className={`w-full space-y-2 text-[10px] sm:text-xs pt-3 border-t border-white/10 text-left ${textMuted}`}>
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Jaipur, Rajasthan, India</span>
            </div>
            <div className="flex items-center space-x-2">
              <Code2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>React, Java, Python, GCP</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Google ACE Certified</span>
            </div>
          </div>
        </div>

        {/* Professional Bio */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-ping" />
            <h3 className="text-sm font-bold tracking-wider uppercase text-purple-400">Bio Profile</h3>
          </div>
          <p className="text-xs leading-relaxed text-justify text-gray-300">
            I'm a Software Engineer who specializes in backend workflows, cloud infrastructure, and AI integration. Currently working at <strong>ThoughtIn Solutions</strong>, I architect event-driven serverless systems on Google Cloud Platform, writing clean components in Java, Python, and TypeScript.
          </p>
          <p className="text-xs leading-relaxed text-justify text-gray-300">
            Starting with data pipeline engineering and YOLO machine learning models, I developed a passion for building local dev-tools (like my custom offline Firestore GCP Emulator) to accelerate debugging cycles.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs pt-2">
            <div className={`p-4 rounded-xl border ${boxBg}`}>
              <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400">Current Focus</span>
              <p className="font-semibold mt-1 text-white">GCP Cloud Architecture & LLM Orchestration</p>
            </div>
            <div className={`p-4 rounded-xl border ${boxBg}`}>
              <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400">Current Learning</span>
              <p className="font-semibold mt-1 text-white">Kubernetes, Go (Golang), and Agentic AI Workflows</p>
            </div>
          </div>
        </div>

      </div>

      {/* Widgets & Live Updates Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Spotify Now Playing Widget (Desktop / Tablet only) */}
        {!isMobile ? (
          <div className={`p-4 rounded-xl border flex flex-col space-y-2.5 ${boxBg}`}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
                <Music className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                <span>Now Playing (Spotify)</span>
              </span>
              <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Chill Beats</span>
            </div>
            <div className="w-full rounded-xl overflow-hidden shadow-md">
              <iframe 
                style={{ borderRadius: '12px' }} 
                src="https://open.spotify.com/embed/playlist/37i9dQZF1DX8UebhnwHgIF?utm_source=generator&theme=0" 
                width="100%" 
                height="80" 
                frameBorder="0" 
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
              ></iframe>
            </div>
          </div>
        ) : (
          <div className={`p-4 rounded-xl border flex flex-col space-y-3 justify-center items-center text-center ${boxBg}`}>
            <Music className="w-6 h-6 text-pink-400 animate-bounce" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-white">Lofi Coding Vibes</p>
              <p className="text-[10px] text-gray-400">Spotify embed is disabled on mobile for performance speedups.</p>
            </div>
          </div>
        )}

        {/* Career Goals & Random Quote */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${boxBg} shadow-lg`}>
          <div className="flex items-start space-x-2">
            <Quote className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p className="text-[11px] italic text-gray-300 leading-normal">
              "{activeQuote}"
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[9px] text-gray-400 font-bold uppercase tracking-wider pt-2 border-t border-white/5 mt-3">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Goals: Scale event-driven architectures & build state-of-the-art AI agents</span>
          </div>
        </div>

      </div>

      {/* Behind the Screen facts */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold tracking-wider uppercase text-purple-400 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Behind the Screen</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-gray-300">
          <div className={`p-4 rounded-xl border text-center ${boxBg} hover:border-purple-500/20 transition`}>
            🔍 <strong>Offline GCP Emulator</strong>: Built to run Firestore and Pub/Sub queues locally without cloud bills.
          </div>
          <div className={`p-4 rounded-xl border text-center ${boxBg} hover:border-purple-500/20 transition`}>
            ⚡ <strong>Model Deployment</strong>: Deployed custom YOLOv5 models for ASL detection with 90%+ real-time accuracy.
          </div>
          <div className={`p-4 rounded-xl border text-center ${boxBg} hover:border-purple-500/20 transition`}>
            ☕ <strong>Fuel Source</strong>: Solves complex backend threads while listening to instrumental synthwave beats.
          </div>
        </div>
      </div>

    </div>
  );
}

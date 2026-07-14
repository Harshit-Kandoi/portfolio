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
  const [songProgress, setSongProgress] = useState(35);
  const [activeQuote, setActiveQuote] = useState(QUOTES[0]);

  // Update lofi song play progress bar
  useEffect(() => {
    const timer = setInterval(() => {
      setSongProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 1500);

    const quoteTimer = setInterval(() => {
      setActiveQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    }, 15000);

    return () => {
      clearInterval(timer);
      clearInterval(quoteTimer);
    };
  }, []);

  const isLight = theme === 'light';
  const textMuted = isLight ? 'text-gray-500' : 'text-gray-400';
  const boxBg = isLight ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/10';

  return (
    <div className={`flex flex-col flex-grow h-full overflow-y-auto p-5 md:p-6 space-y-6 ${isLight ? 'bg-white text-gray-800' : 'bg-slate-950 text-purple-100'}`}>
      
      {/* Bio and Card Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Profile Card */}
        <div className={`md:col-span-1 border p-5 rounded-2xl flex flex-col items-center text-center space-y-4 shadow-md ${boxBg}`}>
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-tr from-purple-500 to-indigo-500 border border-white/20 flex items-center justify-center text-2xl font-extrabold text-white">
              HK
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
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
          <h3 className="text-sm font-bold tracking-wider uppercase text-purple-400">Bio Profile</h3>
          <p className="text-xs leading-relaxed text-justify">
            I'm a Software Engineer who specializes in backend workflows, cloud infrastructure, and AI integration. Currently working at <strong>ThoughtIn Solutions</strong>, I architect event-driven serverless systems on Google Cloud Platform, writing clean components in Java, Python, and TypeScript.
          </p>
          <p className="text-xs leading-relaxed text-justify">
            Starting with data pipeline engineering and YOLO machine learning models, I developed a passion for building local dev-tools (like my custom offline Firestore GCP Emulator) to accelerate debugging cycles.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs pt-2">
            <div className={`p-3.5 rounded-xl border ${boxBg}`}>
              <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400">Current Focus</span>
              <p className="font-semibold mt-1">GCP Serverless & Backend APIs</p>
            </div>
            <div className={`p-3.5 rounded-xl border ${boxBg}`}>
              <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400">Current Learning</span>
              <p className="font-semibold mt-1">Rust & Mojo Compiler Speedups</p>
            </div>
          </div>
        </div>

      </div>

      {/* Widgets & Live Updates Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Now Playing Widget */}
        <div className={`p-4 rounded-xl border flex flex-col space-y-2.5 ${boxBg}`}>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
              <Music className="w-3.5 h-3.5 text-pink-400 animate-bounce" />
              <span>Now Playing</span>
            </span>
            <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Lofi Beat stream</span>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-800 to-pink-600 rounded-lg flex items-center justify-center shadow-lg border border-white/10">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-white truncate">Lofi Code Session v2</p>
              <p className="text-[9px] text-gray-400 truncate">Chill synth beats for developer flow</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-white/5 border border-white/10 h-1 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${songProgress}%` }} />
            </div>
            <div className="flex justify-between text-[8px] text-gray-500 font-bold">
              <span>0:{songProgress < 10 ? `0${songProgress}` : songProgress}</span>
              <span>1:40</span>
            </div>
          </div>
        </div>

        {/* Career Goals & Random Quote */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${boxBg}`}>
          <div className="flex items-start space-x-2">
            <Quote className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <p className="text-[11px] italic text-gray-300 leading-normal">
              "{activeQuote}"
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[9px] text-gray-500 font-bold uppercase tracking-wider pt-2 border-t border-white/5 mt-3">
            <BookOpen className="w-3 h-3 text-indigo-400" />
            <span>Goals: Build highly robust developer toolchains</span>
          </div>
        </div>

      </div>

      {/* Fun Facts Row */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold tracking-wider uppercase text-purple-400 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fun Developer Facts</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-gray-300">
          <div className={`p-3 rounded-lg border text-center ${boxBg}`}>
            ⚡ Offline GCP emulator runs entire serverless queues locally without clouds.
          </div>
          <div className={`p-3 rounded-lg border text-center ${boxBg}`}>
            🎮 Reinforcement Agent plays Doom using PyTorch convolutional reward networks.
          </div>
          <div className={`p-3 rounded-lg border text-center ${boxBg}`}>
            ☕ Solves optimization problems while listening to retro instrumental synthwaves.
          </div>
        </div>
      </div>

    </div>
  );
}

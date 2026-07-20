import React, { useState, useRef } from 'react';
import { useOSStore } from '../../store/useOSStore';
import { Heart, X, Star, Briefcase, ArrowLeft, CheckCircle, Clock, ChevronRight, Code2, MessageCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { trackEvent } from '../../utils/analytics';

// ─── Role Definitions ────────────────────────────────────────────────────────
interface Role {
  id: string;
  title: string;
  company: string;
  match: number;
  location: string;
  experience: string;
  stack: string[];
  availability: string;
  tagline: string;
  heroGradient: string;
  emoji: string;
  verified: boolean;
  aboutMe: string;
  whyFit: string;
  projects: string[];
  certifications: string[];
  funFacts: string[];
}

const ROLES: Role[] = [
  {
    id: 'ml-engineer',
    title: 'Machine Learning Engineer',
    company: 'AI/ML Startup',
    match: 97,
    location: 'Remote / Jaipur',
    experience: '2+ Years',
    stack: ['Python', 'TensorFlow', 'MLflow', 'GCP', 'Docker'],
    availability: 'Immediate',
    tagline: 'Production ML pipelines that actually scale.',
    heroGradient: 'from-purple-600 via-indigo-600 to-blue-600',
    emoji: '🤖',
    verified: true,
    aboutMe: 'I design and ship ML systems end-to-end — from raw data pipelines to deployed model APIs. I\'ve built recommendation engines, NLP classifiers, and GCP-native offline containers.',
    whyFit: 'Strong ML fundamentals, TensorFlow certified, production GCP experience, and a track record of shipping projects from prototype to deployment.',
    projects: ['Local GCP Emulator (Docker offline infra)', 'Movie Recommendation Engine (SVD + Content)'],
    certifications: ['Google TensorFlow Developer', 'DeepLearning.AI MLOps Specialization'],
    funFacts: ['Trained a model on 10M+ rows on a laptop', 'Can read a confusion matrix faster than a restaurant menu'],
  },
  {
    id: 'backend-engineer',
    title: 'Backend / API Engineer',
    company: 'Product Company',
    match: 91,
    location: 'Remote / Hybrid',
    experience: '1.5+ Years',
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'GCP'],
    availability: 'Within 2 Weeks',
    tagline: 'Clean APIs, clean architecture, zero drama.',
    heroGradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    emoji: '🛠️',
    verified: true,
    aboutMe: 'I build reliable, well-documented APIs that teams actually want to consume. Strong on system design, database modeling, and infra-as-code with GCP.',
    whyFit: 'REST and async API design, production database experience, containerized deployments, and a strong habit of writing self-documenting code.',
    projects: ['FastAPI + PostgreSQL REST Service', 'Async Pipeline with Redis Queue'],
    certifications: ['GCP Associate Cloud Engineer (In Progress)', 'Docker Certified Associate'],
    funFacts: ['Wrote a 0-downtime migration script at 2am and it worked', 'README is not a suggestion — it\'s a contract'],
  },
  {
    id: 'data-engineer',
    title: 'Data / AI Engineer',
    company: 'Analytics Platform',
    match: 88,
    location: 'Remote',
    experience: '1+ Year',
    stack: ['Python', 'Pandas', 'BigQuery', 'Airflow', 'dbt'],
    availability: 'Within 4 Weeks',
    tagline: 'Clean data in. Good decisions out.',
    heroGradient: 'from-amber-600 via-orange-600 to-red-600',
    emoji: '📊',
    verified: false,
    aboutMe: 'I design data architectures that make downstream analysis trivial. From ingestion to orchestration to BI dashboards — I cover the full pipeline.',
    whyFit: 'BigQuery analytics, Python ETL pipelines, GCP-native data tooling, and a data-first mindset built on real-world projects.',
    projects: ['Demand Forecasting Pipeline (Retail)', 'Excel Normalization & Ingestion Engine'],
    certifications: ['Google Data Analytics Professional', 'Kaggle Competition Top 20% NLP'],
    funFacts: ['Can spot a dirty join from a mile away', 'My EDA always uncovers at least one hidden insight'],
  },
  {
    id: 'ai-product',
    title: 'AI Product Engineer',
    company: 'Series A / B Startup',
    match: 85,
    location: 'Remote / Jaipur',
    experience: '1+ Year',
    stack: ['Python', 'LangChain', 'OpenAI', 'React', 'FastAPI'],
    availability: 'Within 4 Weeks',
    tagline: 'Turning AI capabilities into products people love.',
    heroGradient: 'from-pink-600 via-rose-500 to-red-500',
    emoji: '✨',
    verified: true,
    aboutMe: 'I bridge the gap between AI research and user-facing products. I build AI-powered features, prompt engineering systems, and RAG pipelines that delight users.',
    whyFit: 'Strong ML foundation + frontend exposure + product sense. I think in user journeys and ship fast without sacrificing quality.',
    projects: ['AI Resume Screening Pipeline', 'Contextual Recommendation Chatbot'],
    certifications: ['DeepLearning.AI LLMOps', 'Google Prompting Essentials'],
    funFacts: ['I\'ve argued with GPT-4 and won', 'Prompt engineering is a mix of art, science, and stubbornness'],
  },
  {
    id: 'fullstack',
    title: 'Full-Stack Developer',
    company: 'Tech Agency / Product',
    match: 78,
    location: 'Remote',
    experience: '1+ Year',
    stack: ['React', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL'],
    availability: 'Within 4 Weeks',
    tagline: 'From empty div to production. End-to-end.',
    heroGradient: 'from-blue-600 via-violet-600 to-purple-600',
    emoji: '💻',
    verified: false,
    aboutMe: 'I build full-stack applications with modern React frontends and Python backends. Currently, you\'re looking at one of my side projects.',
    whyFit: 'TypeScript, React, and FastAPI experience. Strong on performance, responsiveness, and user experience — this portfolio is the proof.',
    projects: ['This Portfolio OS (React + Zustand)', 'Full-Stack Admin Dashboard'],
    certifications: ['Meta React Developer Professional', 'freeCodeCamp Full-Stack'],
    funFacts: ['Built this entire portfolio in 2 weeks', 'I write CSS without Tailwind and I am proud of it'],
  },
];

// ─── Bot Messages ─────────────────────────────────────────────────────────────
const BOT_MESSAGES = [
  '👀 Someone thinks you\'re interested...',
  '💼 Recruiters usually open Resume.pdf next.',
  '⭐ This candidate has shipped production projects.',
  '🤖 Still deciding? Try asking the AI Assistant.',
  '🏆 This role has a 90%+ match rate today.',
  '⚡ Most visitors swipe right on this one.',
];

export default function PortfolioSwipe({ isMobileView }: { isMobileView?: boolean } = {}) {
  const theme = useOSStore((s) => s.theme);
  const unlockAchievement = useOSStore((s) => s.unlockAchievement);
  const addNotification   = useOSStore((s) => s.addNotification);
  const openWindow        = useOSStore((s) => s.openWindow);

  const [stack, setStack]         = useState<Role[]>(ROLES);
  const [liked, setLiked]         = useState<Role[]>([]);
  const [selected, setSelected]   = useState<Role | null>(null);

  const handleViewProfile = (role: Role) => {
    setSelected(role);
    trackEvent('swipe_profile_open', { role_title: role.title });
  };

  const [botMsg, setBotMsg]       = useState(BOT_MESSAGES[0]);
  const [swiping, setSwiping]     = useState<'left' | 'right' | null>(null);
  const [swipeCount, setSwipeCount] = useState(0);

  const cardRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';
  const bg = isLight ? 'bg-gray-50 text-gray-900' : 'bg-gradient-to-b from-slate-950 via-purple-950/10 to-slate-950 text-white';

  const showBotMessage = () => {
    const idx = Math.floor(Math.random() * BOT_MESSAGES.length);
    setBotMsg(BOT_MESSAGES[idx]);
  };

  const swipe = (direction: 'left' | 'right') => {
    if (stack.length === 0) return;
    setSwiping(direction);
    const current = stack[0];

    setTimeout(() => {
      setSwiping(null);
      const rest = stack.slice(1);
      setStack(rest);
      setSwipeCount((c) => c + 1);

      if (direction === 'right') {
        setLiked((l) => [current, ...l]);
        trackEvent('swipe_role_like', { role_title: current.title, match_percentage: current.match });
        trackEvent('swipe_match_create', { role_title: current.title, match_percentage: current.match });
        addNotification(`❤️ Liked: ${current.title}`, `${current.match}% match!`, 'success', 'career');
      } else {
        trackEvent('swipe_role_pass', { role_title: current.title });
        addNotification(`👋 Passed on: ${current.title}`, 'Maybe next time!', 'info', 'portfolio');
      }

      if (rest.length === 0) {
        unlockAchievement('tinder_swiper');
        addNotification('🎉 All roles swiped!', 'You\'ve seen all available roles. Check your matches!', 'achievement', 'career');
      } else {
        showBotMessage();
      }
    }, 300);
  };

  const currentRole = stack[0];

  // ── Profile View ───────────────────────────────────────────────────────────
  if (selected) {
    return (
      <div className={`flex flex-col flex-grow h-full overflow-y-auto custom-scrollbar ${bg}`}>
        {/* Hero */}
        <div className={`relative bg-gradient-to-br ${selected.heroGradient} p-6 flex flex-col items-center space-y-2 shrink-0`}>
          <button onClick={() => setSelected(null)} className="absolute top-4 left-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition text-white">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-5xl mt-2">{selected.emoji}</div>
          <h2 className="text-xl font-black text-white text-center">{selected.title}</h2>
          <p className="text-white/70 text-xs font-medium">{selected.company}</p>
          {selected.verified && (
            <div className="flex items-center space-x-1 bg-white/10 rounded-full px-2 py-0.5">
              <CheckCircle className="w-3 h-3 text-blue-300" />
              <span className="text-[9px] text-white font-bold">Verified Candidate</span>
            </div>
          )}
          <div className="flex items-center space-x-3 text-white/80 text-[10px]">
            <span className="flex items-center space-x-1"><Briefcase className="w-3 h-3" /><span>{selected.experience}</span></span>
            <span className="flex items-center space-x-1"><Clock className="w-3 h-3" /><span>{selected.availability}</span></span>
          </div>
          <div className="flex items-center space-x-1 bg-white/10 rounded-full px-3 py-1">
            <Heart className="w-3 h-3 text-rose-300 fill-rose-300" />
            <span className="text-xs text-white font-bold">{selected.match}% Match</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          <Section title="About Me" icon={<Code2 className="w-3.5 h-3.5 text-purple-400" />}>
            <p className="text-sm leading-relaxed opacity-80">{selected.aboutMe}</p>
          </Section>

          <Section title="Why I'm a Good Fit" icon={<Star className="w-3.5 h-3.5 text-amber-400" />}>
            <p className="text-sm leading-relaxed opacity-80">{selected.whyFit}</p>
          </Section>

          <Section title="Skills" icon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}>
            <div className="flex flex-wrap gap-2">
              {selected.stack.map((skill) => (
                <span key={skill} className="bg-purple-500/15 border border-purple-500/25 text-purple-300 text-[10px] font-bold px-2.5 py-1 rounded-full">{skill}</span>
              ))}
            </div>
          </Section>

          <Section title="Featured Projects" icon={<Briefcase className="w-3.5 h-3.5 text-emerald-400" />}>
            <ul className="space-y-1.5">
              {selected.projects.map((p) => (
                <li key={p} className="flex items-start space-x-2 text-sm opacity-80">
                  <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-emerald-400 shrink-0" /><span>{p}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Certifications" icon={<CheckCircle className="w-3.5 h-3.5 text-blue-400" />}>
            <ul className="space-y-1.5">
              {selected.certifications.map((c) => (
                <li key={c} className="flex items-start space-x-2 text-sm opacity-80">
                  <CheckCircle className="w-3 h-3 mt-0.5 text-blue-400 shrink-0" /><span>{c}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Fun Facts" icon={<MessageCircle className="w-3.5 h-3.5 text-pink-400" />}>
            <ul className="space-y-1.5">
              {selected.funFacts.map((f) => (
                <li key={f} className="text-sm opacity-80">• {f}</li>
              ))}
            </ul>
          </Section>

          {/* CTA */}
          <div className="flex space-x-3 pt-2">
            <button onClick={() => openWindow('contact')} className="flex-1 bg-gradient-to-r from-purple-600 to-rose-500 text-white text-xs font-bold py-2.5 rounded-xl hover:opacity-90 transition active:scale-95">
              📬 Contact Me
            </button>
            <button onClick={() => openWindow('resume')} className="flex-1 bg-white/5 border border-white/10 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-white/10 transition active:scale-95">
              📄 View Resume
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Swipe View ────────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col flex-grow h-full ${bg}`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
          <div>
            <h2 className="text-sm font-black">Portfolio Swipe</h2>
            <p className="text-[9px] text-gray-400">Find your perfect engineering match</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {liked.length > 0 && (
            <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{liked.length} ❤️</span>
          )}
          <span className="text-[9px] text-gray-500">{stack.length} remaining</span>
        </div>
      </div>

      {/* Bot Message Bar */}
      {swipeCount > 0 && (
        <div className="px-5 py-2 bg-purple-900/30 border-b border-purple-500/10 shrink-0">
          <p className="text-[10px] text-purple-300 text-center">{botMsg}</p>
        </div>
      )}

      {/* Card Area */}
      <div className="flex-grow flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {stack.length === 0 ? (
          <div className="flex flex-col items-center space-y-4 text-center py-10">
            <div className="text-5xl">🎉</div>
            <h3 className="text-lg font-black">You've seen all roles!</h3>
            <p className="text-sm text-gray-400 max-w-xs">
              {liked.length > 0
                ? `You liked ${liked.length} role${liked.length > 1 ? 's' : ''}. Reach out via Contact.exe to make it official!`
                : 'Tough crowd! Try opening About.exe to learn more about Harshit.'}
            </p>
            {liked.length > 0 && (
              <button onClick={() => openWindow('contact')} className="bg-gradient-to-r from-purple-600 to-rose-500 text-white text-xs font-bold px-5 py-2 rounded-xl hover:opacity-90 transition">
                💌 Send a Message
              </button>
            )}
            <button onClick={() => { setStack(ROLES); setLiked([]); setSwipeCount(0); }}
              className="text-[11px] text-gray-500 hover:text-white transition underline">
              Start Over
            </button>
          </div>
        ) : (
          <>
            {/* Background card peeks (stacked deck) */}
            {stack[2] && (
              <div className={`absolute w-72 rounded-3xl overflow-hidden shadow-lg bg-gradient-to-br ${stack[2].heroGradient} opacity-10 scale-90 translate-y-3 -rotate-2`} style={{ height: 380 }} />
            )}
            {stack[1] && (
              <div className={`absolute w-72 rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br ${stack[1].heroGradient} opacity-25 scale-95 translate-y-1.5 rotate-1.5`} style={{ height: 380 }} />
            )}

            {/* Main Card */}
            <motion.div
              ref={cardRef}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={(event, info) => {
                const threshold = 120;
                if (info.offset.x > threshold) {
                  swipe('right');
                } else if (info.offset.x < -threshold) {
                  swipe('left');
                }
              }}
              className={`relative w-72 rounded-3xl overflow-hidden shadow-2xl border border-white/10 cursor-grab active:cursor-grabbing transition-all duration-300 ${
                swiping === 'right' ? 'translate-x-32 rotate-12 opacity-0' :
                swiping === 'left'  ? '-translate-x-32 -rotate-12 opacity-0' : ''
              }`}
              style={{ height: 380 }}
              onClick={() => handleViewProfile(currentRole)}
            >
              {/* Hero Gradient */}
              <div className={`h-44 bg-gradient-to-br ${currentRole.heroGradient} flex flex-col items-center justify-center relative`}>
                <div className="text-6xl mb-1.5 drop-shadow-md">{currentRole.emoji}</div>
                {currentRole.verified && (
                  <div className="absolute top-3 right-3 flex items-center space-x-1 bg-white/20 backdrop-blur-md rounded-full px-2 py-0.5 border border-white/10">
                    <CheckCircle className="w-2.5 h-2.5 text-white" />
                    <span className="text-[8px] text-white font-bold">Verified</span>
                  </div>
                )}
                {/* Match badge */}
                <div className="absolute top-3 left-3 bg-rose-500 text-white rounded-full px-2.5 py-0.5 text-[9px] font-black tracking-wider shadow-md">
                  {currentRole.match}% Match
                </div>
              </div>

              {/* Card Body */}
              <div className="bg-gradient-to-b from-[#121026] to-[#090714] p-4.5 space-y-3 border-t border-white/5 h-[204px] flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-white leading-tight truncate">{currentRole.title}</h3>
                  <p className="text-[10px] text-purple-400 font-bold mt-0.5">{currentRole.company}</p>
                </div>
                <p className="text-[10.5px] text-gray-300 italic leading-snug line-clamp-2">&quot;{currentRole.tagline}&quot;</p>

                <div className="flex flex-wrap gap-1">
                  {currentRole.stack.slice(0, 3).map((s) => (
                    <span key={s} className="bg-purple-500/10 text-purple-300 text-[8.5px] font-bold px-2 py-0.5 rounded-full border border-purple-500/20">{s}</span>
                  ))}
                  {currentRole.stack.length > 3 && (
                    <span className="text-[8px] text-gray-500 self-center font-bold">+{currentRole.stack.length - 3}</span>
                  )}
                </div>

                <div className="flex items-center justify-center text-[8px] text-gray-500 font-bold uppercase tracking-wider pt-1 border-t border-white/5">
                  <span>⏱ {currentRole.availability}</span>
                </div>
              </div>
            </motion.div>

            {/* Swipe Buttons (High Fidelity Tinder Style) */}
            <div className="flex items-center space-x-6 mt-6">
              {/* Pass Button */}
              <button
                onClick={() => swipe('left')}
                className="w-12 h-12 rounded-full bg-slate-900 border border-red-500/20 text-red-500 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition"
                title="Pass"
              >
                <X className="w-5 h-5" />
              </button>

              {/* View Profile Button (Super Like) */}
              <button
                onClick={() => handleViewProfile(currentRole)}
                className="w-14 h-14 rounded-full bg-slate-900 border border-purple-500/30 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition"
                title="Super Like / View Profile"
              >
                <Star className="w-6 h-6 fill-purple-400/20" />
              </button>

              {/* Like Button */}
              <button
                onClick={() => swipe('right')}
                className="w-12 h-12 rounded-full bg-slate-900 border border-emerald-500/20 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition"
                title="Like"
              >
                <Heart className="w-5 h-5 fill-emerald-500/20" />
              </button>
            </div>
            <p className="text-[9px] text-gray-600 mt-2 font-medium">← Pass &nbsp;&nbsp;|&nbsp;&nbsp; View &nbsp;&nbsp;|&nbsp;&nbsp; Like →</p>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        {icon}
        <h4 className="text-xs font-bold uppercase tracking-wider opacity-70">{title}</h4>
      </div>
      {children}
    </div>
  );
}

import React, { useState } from 'react';
import { useOSStore, VISITOR_ACHIEVEMENTS } from '../../store/useOSStore';
import { Trophy, Star, Lock, CheckCircle, Zap, Award, ExternalLink } from 'lucide-react';

interface DevCredential {
  id: string;
  title: string;
  org: string;
  issued: string;
  expires?: string;
  credentialId?: string;
  credentialUrl: string;
  skills: string[];
  emoji: string;
  color: string;
  description: string;
  year?: string;
}

// ─── Developer Credentials (Harshit's real achievements) ─────────────────────
const DEV_CREDENTIALS: DevCredential[] = [
  {
    id: 'qa_automation',
    title: 'Software QA & Test Automation Engineering',
    org: 'Coursera',
    year: '2026',
    issued: 'Jun 2026',
    expires: 'Jun 2036',
    credentialId: '5NG9S17LYY48',
    credentialUrl: 'https://coursera.org/share/0810f3ef5e95663b8a1d979afd5cf464',
    skills: ['Selenium', 'Agile QA', 'Cypress', 'JMeter', 'xUnit', 'Postman'],
    emoji: '🧪',
    color: 'from-blue-600 to-indigo-600',
    description: 'QA automation through hands-on experience with industry-leading testing tools and methodologies. This specialization covers Selenium web automation, agile QA processes, open-source testing frameworks (Cypress, JMeter, xUnit), advanced Cypress techniques, and API validation with Postman.',
  },
  {
    id: 'gcp_ace',
    title: 'Associate Cloud Engineer Certification',
    org: 'Google',
    year: '2026',
    issued: 'Mar 2026',
    expires: 'Mar 2029',
    credentialId: '193739',
    credentialUrl: 'https://www.credly.com/badges/dce123b5-e38c-4619-86d6-8ff49362c926/linked_in_profile',
    skills: ['Google Cloud Platform (GCP)'],
    emoji: '☁️',
    color: 'from-blue-500 to-cyan-500',
    description: 'Google Associate Cloud Engineer certification validating hands-on expertise with GCP infrastructure, Compute Engine, GKE, Cloud Storage, IAM, and cloud resource management.',
  },
  {
    id: 'docker_foundations',
    title: 'Docker Foundations Professional Certificate',
    org: 'Docker',
    year: '2025',
    issued: 'Aug 2025',
    credentialUrl: 'https://www.linkedin.com/learning/certificates/9642001c23ee467631715f91472bc09ffd79bd1ceca1419cac4f1024651bcf29',
    skills: ['Docker Products', 'Containerization'],
    emoji: '🐳',
    color: 'from-cyan-600 to-blue-600',
    description: 'Foundational expertise in Docker containerization, image creation, multi-container applications, Docker Compose, and container deployment workflows.',
  },
  {
    id: 'ms_genai_prod',
    title: 'Build Your Generative AI Productivity Skills with Microsoft and LinkedIn',
    org: 'Microsoft & LinkedIn',
    year: '2025',
    issued: 'Aug 2025',
    credentialUrl: 'https://www.linkedin.com/learning/certificates/a7b30896f7262856c94dcc9dbbce5844dad7ce8cb4e3ac1acf5116e293c248ed',
    skills: ['Productivity Improvement', 'Generative AI'],
    emoji: '✨',
    color: 'from-sky-500 to-indigo-500',
    description: 'Leveraging Generative AI tools and strategies across workplace applications to boost efficiency, workflow automation, and productivity.',
  },
  {
    id: 'github_pro',
    title: 'Career Essentials in GitHub Professional Certificate',
    org: 'GitHub',
    year: '2025',
    issued: 'Aug 2025',
    credentialUrl: 'https://www.linkedin.com/learning/certificates/f643a002e0de4d73b940256e5b8c14a6e31ea678bc4c19dba1e794625ccee25f',
    skills: ['GitHub', 'Git', 'Version Control'],
    emoji: '🐙',
    color: 'from-slate-700 to-slate-900',
    description: 'Professional GitHub proficiency covering version control, pull requests, issue tracking, project management, and collaborative open-source development.',
  },
  {
    id: 'azure_ai_essentials',
    title: 'Microsoft Azure AI Essentials: Workloads and Machine Learning on Azure',
    org: 'LinkedIn Learning',
    year: '2025',
    issued: 'Aug 2025',
    credentialId: '66444b1c98dada9eadb5dd9fd08cbb84c3a107633c55520fedca2b2ea5d14f2d',
    credentialUrl: 'https://www.linkedin.com/learning/certificates/66444b1c98dada9eadb5dd9fd08cbb84c3a107633c55520fedca2b2ea5d14f2d',
    skills: ['Microsoft Azure', 'Azure AI Foundry', 'Machine Learning'],
    emoji: '🔷',
    color: 'from-blue-600 to-sky-400',
    description: 'Understanding AI workloads, computer vision, natural language processing, and deploying machine learning solutions with Azure AI Foundry.',
  },
  {
    id: 'ms_genai_essentials',
    title: 'Career Essentials in Generative AI by Microsoft and LinkedIn',
    org: 'Microsoft & LinkedIn',
    year: '2023',
    issued: 'Sep 2023',
    credentialUrl: 'https://www.linkedin.com/learning/certificates/b49c37aa015b852352b5baa8f01d3457ca2a7869e14843045ddc807ca0f65d84',
    skills: ['Prompt Engineering', 'Microsoft Copilot', 'Generative AI'],
    emoji: '🤖',
    color: 'from-teal-500 to-emerald-600',
    description: 'Core principles of Artificial Intelligence, generative models, prompt engineering, Microsoft Copilot integration, and ethical AI deployment.',
  },
  {
    id: 'github_copilot',
    title: 'Career Essentials in GitHub Copilot Professional Certificate',
    org: 'GitHub',
    year: '2025',
    issued: 'Aug 2025',
    credentialUrl: 'https://www.linkedin.com/learning/certificates/ec842b1f8a1a2b3c2c439c8d4adfa5471b607088840f171ca6d1642f3f894d9a',
    skills: ['GitHub Copilot', 'Git', 'AI Pair Programming'],
    emoji: '💡',
    color: 'from-purple-600 to-pink-600',
    description: 'Utilizing GitHub Copilot for AI-assisted coding, automated code generation, refactoring, test writing, and boosting overall developer velocity.',
  },
  {
    id: 'ml_az',
    title: 'Machine Learning A-Z: AI, Python & R',
    org: 'Udemy',
    year: '2024',
    issued: 'Nov 2024',
    credentialId: 'UC-a4c0bbee-c659-4d51-ad51-5b1211e9cc4f',
    credentialUrl: 'https://www.udemy.com/certificate/UC-a4c0bbee-c659-4d51-ad51-5b1211e9cc4f/',
    skills: ['Python (Programming Language)', 'Deep Learning', 'Machine Learning', 'R'],
    emoji: '🧠',
    color: 'from-violet-600 to-purple-600',
    description: 'Comprehensive training in machine learning algorithms, regression, classification, clustering, deep learning, NLP, and neural networks using Python & R.',
  },
  {
    id: 'python_bootcamp',
    title: '100 Days of Code: The Complete Python Pro Bootcamp',
    org: 'Udemy',
    year: '2025',
    issued: 'Feb 2025',
    credentialId: 'UC-7ae3e699-3a95-404f-a9cd-e074b5f1553d',
    credentialUrl: 'https://www.udemy.com/certificate/UC-7ae3e699-3a95-404f-a9cd-e074b5f1553d/',
    skills: ['Databases', 'Flask', 'Python', 'Web Development', 'Automation'],
    emoji: '🐍',
    color: 'from-amber-500 to-orange-500',
    description: 'Mastered Python by building 100 real-world applications in 100 days, spanning Flask web apps, SQL databases, web scraping, data analysis, and automation.',
  },
];

// ─── XP Level Thresholds ─────────────────────────────────────────────────────
const getLevelInfo = (xp: number) => {
  const levels = [
    { min: 0,    max: 199,  label: 'Visitor',      color: 'text-gray-400' },
    { min: 200,  max: 499,  label: 'Explorer',     color: 'text-blue-400' },
    { min: 500,  max: 999,  label: 'Curious Mind', color: 'text-purple-400' },
    { min: 1000, max: 1999, label: 'Code Warrior', color: 'text-amber-400' },
    { min: 2000, max: Infinity, label: 'Elite Visitor', color: 'text-rose-400' },
  ];
  const current = levels.find((l) => xp >= l.min && xp < l.max) ?? levels[levels.length - 1];
  const next = levels[levels.indexOf(current) + 1];
  const progress = next ? ((xp - current.min) / (next.min - current.min)) * 100 : 100;
  return { current, next, progress };
};

export default function AchievementsApp({ isMobileView }: { isMobileView?: boolean } = {}) {
  const xp             = useOSStore((s) => s.xp);
  const unlockedIds    = useOSStore((s) => s.unlockedAchievements);
  const theme          = useOSStore((s) => s.theme);
  const globalViewMode = useOSStore((s) => s.viewMode);
  const isSimulatingMobile = useOSStore((s) => s.isSimulatingMobile);
  const isMobile       = isMobileView || globalViewMode === 'mobile' || isSimulatingMobile;
  const [tab, setTab]  = useState<'visitor' | 'dev'>('dev');

  const { current, next, progress } = getLevelInfo(xp);
  const isLight = theme === 'light';
  const bg = isLight ? 'bg-gray-50 text-gray-800' : 'bg-slate-950 text-white';
  const cardBg = isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10';

  const unlockedCount = unlockedIds.length;
  const totalAchieves = VISITOR_ACHIEVEMENTS.length;
  const earnedXP      = VISITOR_ACHIEVEMENTS.filter((a) => unlockedIds.includes(a.id)).reduce((sum, a) => sum + a.xp, 0);

  return (
    <div className={`flex flex-col flex-grow h-full overflow-hidden ${bg}`}>
      {/* XP Header */}
      <div className={`bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-purple-900/60 ${isMobile ? 'px-3.5 py-3' : 'px-5 py-4'} border-b border-white/5 shrink-0`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg`}>
              <Award className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">Certifications & Credentials</h2>
              <p className={`text-xs font-bold text-purple-300`}>Verified Developer Achievements</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`${isMobile ? 'text-xl' : 'text-2xl'} font-black text-amber-400 font-mono`}>{xp} XP</p>
            <p className="text-[9px] text-gray-400">{unlockedCount}/{totalAchieves} badges earned</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div>
          <div className="flex justify-between text-[9px] text-gray-400 mb-1">
            <span>{current.label}</span>
            {next && <span>{next.label} ({next.min} XP)</span>}
          </div>
          <div className="h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-amber-400 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-white/5 shrink-0">
        {(['dev', 'visitor'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider transition flex items-center justify-center space-x-1.5 ${
              tab === t
                ? 'border-b-2 border-purple-500 text-purple-300 bg-white/5'
                : isLight ? 'text-gray-500 hover:text-gray-800' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {t === 'dev' ? <Award className="w-3.5 h-3.5 text-purple-400" /> : <Trophy className="w-3.5 h-3.5 text-amber-400" />}
            <span>{t === 'dev' ? 'Certifications' : 'Explorer Badges'}</span>
          </button>
        ))}
      </div>

      {/* ── Visitor Achievements Tab ─────────────────────────────────────── */}
      {tab === 'visitor' && (
        <div className={`flex-grow overflow-y-auto ${isMobile ? 'p-3 space-y-2.5' : 'p-4 space-y-3'} custom-scrollbar`}>
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2.5 mb-2">
            {[
              { label: 'Achievements', value: `${unlockedCount}/${totalAchieves}`, icon: Trophy, color: 'text-amber-500' },
              { label: 'Earned XP', value: `${earnedXP}`, icon: Zap, color: 'text-purple-500' },
              { label: 'Progress', value: `${Math.round((unlockedCount / totalAchieves) * 100)}%`, icon: Star, color: 'text-cyan-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className={`rounded-xl p-2 border text-center ${cardBg}`}>
                <Icon className={`w-3.5 h-3.5 mx-auto mb-0.5 ${color}`} />
                <p className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{value}</p>
                <p className={`text-[8px] truncate ${isLight ? 'text-slate-600 font-bold' : 'text-gray-400'}`}>{label}</p>
              </div>
            ))}
          </div>

          {VISITOR_ACHIEVEMENTS.map((ach) => {
            const unlocked = unlockedIds.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`flex items-start space-x-3 ${isMobile ? 'p-2.5' : 'p-3'} rounded-xl border transition ${cardBg} ${
                  unlocked ? 'border-purple-500/25 shadow-sm' : 'opacity-55'
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                  unlocked ? (isLight ? 'bg-amber-100 border border-amber-300' : 'bg-amber-500/10 border border-amber-500/20') : (isLight ? 'bg-slate-100 border border-slate-200 grayscale' : 'bg-white/3 border border-white/5 grayscale')
                }`}>
                  {unlocked ? ach.emoji : <Lock className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-gray-600'}`} />}
                </div>

                {/* Content */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between space-x-2">
                    <p className={`text-xs font-bold leading-tight ${unlocked ? (isLight ? 'text-slate-900' : 'text-white') : 'opacity-50'}`}>
                      {unlocked ? ach.title : '???'}
                    </p>
                    {unlocked && (
                      <div className="flex items-center space-x-1 shrink-0">
                        <Zap className="w-2.5 h-2.5 text-amber-500" />
                        <span className="text-[10px] text-amber-500 font-bold">+{ach.xp}</span>
                      </div>
                    )}
                  </div>
                  <p className={`text-[10px] mt-0.5 leading-snug ${unlocked ? (isLight ? 'text-slate-700 font-medium' : 'text-gray-300') : (isLight ? 'text-slate-500 italic' : 'text-gray-600 italic')}`}>
                    {unlocked ? ach.description : 'Keep exploring to unlock this achievement...'}
                  </p>
                </div>

                {/* Status */}
                <div className="shrink-0">
                  {unlocked
                    ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                    : <Lock className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-gray-700'}`} />
                  }
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Dev Credentials Tab ─────────────────────────────────────────── */}
      {tab === 'dev' && (
        <div className={`flex-grow overflow-y-auto ${isMobile ? 'p-3 space-y-3' : 'p-4 space-y-4'} custom-scrollbar`}>
          <p className={`text-[10px] text-center pb-1 ${isLight ? 'text-slate-700 font-bold' : 'text-gray-400'}`}>
            Harshit's certifications, awards &amp; professional milestones.
          </p>
          {DEV_CREDENTIALS.map((cert) => (
            <div key={cert.id} className={`rounded-2xl border overflow-hidden transition-all duration-300 hover:border-purple-500/40 ${cardBg}`}>
              <div className={`bg-gradient-to-r ${cert.color} px-4 py-3 flex items-center justify-between`}>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl shrink-0">{cert.emoji}</span>
                  <div>
                    <h3 className="text-xs font-black text-white leading-tight">{cert.title}</h3>
                    <p className="text-[10px] text-white/90 font-semibold mt-0.5">
                      {cert.org} · Issued {cert.issued}{cert.expires ? ` · Expires ${cert.expires}` : ''}
                    </p>
                  </div>
                </div>
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 ml-2 flex items-center space-x-1 bg-white/20 hover:bg-white/35 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-sm transition shadow-sm"
                    title="Show Credential"
                  >
                    <span>Show Credential</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="px-4 py-3 space-y-2.5">
                <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-800 font-medium' : 'text-gray-300'}`}>{cert.description}</p>
                
                {cert.credentialId && (
                  <div className="flex items-center space-x-1.5 text-[10px]">
                    <span className="font-bold text-purple-500">Credential ID:</span>
                    <code className={`px-1.5 py-0.5 rounded font-mono text-[9.5px] border ${
                      isLight ? 'bg-purple-50 text-purple-900 border-purple-200 font-bold' : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                    }`}>{cert.credentialId}</code>
                  </div>
                )}

                {cert.skills && cert.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cert.skills.map((skill, sIdx) => (
                      <span
                        key={`${cert.id}-${skill}-${sIdx}`}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          isLight ? 'bg-purple-50 text-purple-800 border-purple-200' : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

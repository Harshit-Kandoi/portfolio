import { useState } from 'react';
import { ShoppingBag, Download, Star, Github, ExternalLink, Code2, FileCode2, Wrench, Package, Handshake } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';

interface MarketplaceItem {
  id: string;
  name: string;
  category: 'tool' | 'template' | 'service' | 'open-source';
  tagline: string;
  description: string;
  icon: string;
  price: string;
  repo_url?: string;
  install_cmd?: string;
  tags: string[];
  downloads?: number;
  is_featured: boolean;
  color: string;
}

const ITEMS: MarketplaceItem[] = [
  {
    id: '1',
    name: 'Local GCP Emulator',
    category: 'open-source',
    tagline: 'Develop GCP apps completely offline',
    description: 'Docker-based Firestore + Pub/Sub emulator. No credentials needed. Works with any GCP SDK.',
    icon: '☁️',
    price: 'Free',
    repo_url: 'https://github.com/Harshit-Kandoi/Local-GCP-Emulator',
    install_cmd: 'docker pull harshitkandoi/local-gcp-emulator',
    tags: ['Docker', 'GCP', 'Python'],
    downloads: 0,
    is_featured: true,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: '2',
    name: 'Portfolio OS Template',
    category: 'template',
    tagline: 'OS-themed developer portfolio starter',
    description: 'The full Portfolio OS codebase — adapt it as your own interactive developer portfolio. React + TypeScript + Zustand.',
    icon: '💻',
    price: 'Free',
    repo_url: 'https://github.com/Harshit-Kandoi/portfolio',
    tags: ['React', 'TypeScript', 'Vite', 'Portfolio'],
    is_featured: true,
    color: 'from-purple-500 to-indigo-500',
  },
  {
    id: '3',
    name: 'ASL Detection Model',
    category: 'open-source',
    tagline: 'Pre-trained YOLOv5 for sign language',
    description: 'Trained YOLOv5 weights for real-time American Sign Language detection. 90%+ mAP@0.5 on custom dataset.',
    icon: '🤟',
    price: 'Free',
    repo_url: 'https://github.com/Harshit-Kandoi/ASL-Sign-Language-Detection',
    tags: ['Python', 'YOLOv5', 'AI', 'Vision'],
    is_featured: false,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: '4',
    name: 'GCP Event Pipeline',
    category: 'template',
    tagline: 'Pub/Sub → Cloud Functions → Firestore starter',
    description: 'Production-ready event-driven pipeline template. Includes GitHub Actions CI/CD, Dockerfile, and local emulation support.',
    icon: '⚡',
    price: 'Free',
    repo_url: 'https://github.com/Harshit-Kandoi',
    tags: ['GCP', 'Python', 'Pub/Sub', 'Firestore'],
    is_featured: false,
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: '5',
    name: 'Cloud Architecture Consulting',
    category: 'service',
    tagline: 'GCP architecture review & design sessions',
    description: 'I offer 1-on-1 consulting sessions on GCP architecture, serverless design, and cloud migration strategies.',
    icon: '🏗️',
    price: 'Contact',
    tags: ['GCP', 'Consulting', 'Architecture'],
    is_featured: false,
    color: 'from-rose-500 to-pink-500',
  },
  {
    id: '6',
    name: 'ML Pipeline Review',
    category: 'service',
    tagline: 'Code review for your ML training pipeline',
    description: 'Expert review of your ML workflows — from data preprocessing to model deployment. Includes a detailed report.',
    icon: '🧠',
    price: 'Contact',
    tags: ['ML', 'Python', 'Consulting', 'Code Review'],
    is_featured: false,
    color: 'from-fuchsia-500 to-purple-500',
  },
];

const CATEGORY_CONFIG = {
  'open-source': { label: 'Open Source', icon: Github, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  'template': { label: 'Template', icon: FileCode2, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  'tool': { label: 'Tool', icon: Wrench, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  'service': { label: 'Service', icon: Handshake, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/30' },
};

const FILTERS = ['All', 'Open Source', 'Templates', 'Services'];

export default function MarketplaceApp() {
  const theme = useOSStore((s) => s.theme);
  const isLight = theme === 'light';
  const [filter, setFilter] = useState('All');

  const filtered = ITEMS.filter((item) => {
    if (filter === 'All') return true;
    if (filter === 'Open Source') return item.category === 'open-source';
    if (filter === 'Templates') return item.category === 'template';
    if (filter === 'Services') return item.category === 'service';
    return true;
  });

  const containerBg = isLight ? 'bg-gray-50 text-gray-800' : 'bg-[#080912] text-white';
  const cardBg = isLight ? 'bg-white border-gray-200' : 'bg-[#0f1019] border-white/5';

  return (
    <div className={`flex flex-col h-full overflow-hidden ${containerBg}`}>
      {/* Header */}
      <div className={`shrink-0 px-5 pt-5 pb-4 border-b ${isLight ? 'border-gray-200 bg-gray-100' : 'border-white/5 bg-[#0a0b10]'}`}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold">Marketplace</h1>
            <p className="text-[10px] text-gray-500">Tools, templates & services by Harshit</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                filter === f
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                  : isLight ? 'bg-white border-gray-200 text-gray-600' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
              }`}
            >{f}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {/* Featured Banner */}
        {filter === 'All' && (
          <div className="mb-6">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-3">🌟 Featured</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ITEMS.filter((i) => i.is_featured).map((item) => {
                const catConf = CATEGORY_CONFIG[item.category];
                const CatIcon = catConf.icon;
                return (
                  <div key={item.id} className={`rounded-2xl border overflow-hidden hover:border-rose-500/30 transition-all hover:shadow-lg group ${cardBg}`}>
                    <div className={`h-20 bg-gradient-to-br ${item.color} relative flex items-center justify-center`}>
                      <span className="text-4xl filter drop-shadow">{item.icon}</span>
                      <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-bold ${catConf.bg} ${catConf.color}`}>
                        <CatIcon className="w-2.5 h-2.5" />{catConf.label}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-bold">{item.name}</h3>
                        <span className={`text-xs font-bold ${item.price === 'Free' ? 'text-emerald-400' : 'text-rose-400'}`}>{item.price}</span>
                      </div>
                      <p className="text-[11px] text-gray-400">{item.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.slice(0, 3).map((t) => (
                          <span key={t} className="text-[9px] bg-white/5 border border-white/5 text-gray-500 px-1.5 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-3">
                        {item.repo_url && (
                          <a href={item.repo_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] font-semibold bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl transition text-gray-300 hover:text-white">
                            <Github className="w-3 h-3" /> View
                          </a>
                        )}
                        {item.install_cmd && (
                          <button
                            onClick={() => navigator.clipboard.writeText(item.install_cmd!)}
                            className="flex items-center gap-1 text-[11px] font-semibold bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 px-3 py-1.5 rounded-xl transition text-rose-300">
                            <Download className="w-3 h-3" /> Copy Install
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Items */}
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-3">
          {filter === 'All' ? 'All Items' : filter}
        </p>
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((item) => {
            const catConf = CATEGORY_CONFIG[item.category];
            const CatIcon = catConf.icon;
            return (
              <div key={item.id} className={`rounded-2xl border p-4 flex items-start gap-4 hover:border-rose-500/30 transition-all group ${cardBg}`}>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-[11px] font-bold">{item.name}</h3>
                    <span className={`flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded border ${catConf.bg} ${catConf.color}`}>
                      <CatIcon className="w-2 h-2" />{catConf.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">{item.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-xs font-bold ${item.price === 'Free' ? 'text-emerald-400' : 'text-rose-400'}`}>{item.price}</span>
                  {item.repo_url ? (
                    <a href={item.repo_url} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 transition">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <a href="mailto:kandoiharshitsdlp@gmail.com"
                      className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 transition">
                      Contact
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

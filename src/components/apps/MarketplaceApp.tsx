import React, { useState } from 'react';
import {
  ShoppingBag,
  Download,
  Github,
  ExternalLink,
  BookOpen,
  Copy,
  Check,
  Search,
  Sparkles,
  Calendar,
  Heart,
  Eye,
  Star,
  Info,
  Tag,
  Clock,
  Layers,
  Code2,
  Terminal,
  CreditCard,
  X,
  Box,
  Wrench,
  Palette,
  Briefcase,
} from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { openRazorpayCheckout } from '../../utils/razorpay';
import { MarketplaceItem, MarketplaceCategory } from '../../services/supabase';
import { MARKETPLACE_ITEMS } from '../../data/marketplaceData';

type FilterCategory = 'All' | 'Featured' | MarketplaceCategory;

const CATEGORY_META: Record<
  MarketplaceCategory,
  { label: string; icon: React.ElementType; color: string; bg: string; description: string }
> = {
  template: {
    label: 'Templates',
    icon: Box,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/30',
    description: 'Reusable codebases and starters',
  },
  tool: {
    label: 'Developer Tools',
    icon: Wrench,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/30',
    description: 'Open source utilities & emulators',
  },
  asset: {
    label: 'Digital Assets',
    icon: Palette,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/30',
    description: 'Templates, UI packs & themes',
  },
  service: {
    label: 'Services',
    icon: Briefcase,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/30',
    description: 'Custom development & reviews',
  },
  personal: {
    label: 'Personal Creations',
    icon: Heart,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/30',
    description: 'Sentimental & fun projects',
  },
};

export default function MarketplaceApp({ isMobileView }: { isMobileView?: boolean } = {}) {
  const theme = useOSStore((s) => s.theme);
  const globalViewMode = useOSStore((s) => s.viewMode);
  const isSimulatingMobile = useOSStore((s) => s.isSimulatingMobile);
  const addNotification = useOSStore((s) => s.addNotification);
  const isMobile = isMobileView || globalViewMode === 'mobile' || isSimulatingMobile;
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<FilterCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Modals state
  const [selectedStoryItem, setSelectedStoryItem] = useState<MarketplaceItem | null>(null);
  const [selectedServiceItem, setSelectedServiceItem] = useState<MarketplaceItem | null>(null);

  // Copy install command helper
  const handleCopyInstall = (item: MarketplaceItem) => {
    if (!item.install_cmd) return;
    navigator.clipboard.writeText(item.install_cmd);
    setCopiedId(item.id);
    addNotification('📋 Command Copied', `Copied "${item.install_cmd}" to clipboard`, 'info', 'system');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Razorpay Checkout handler
  const handleCheckout = async (item: MarketplaceItem) => {
    const paise = item.amountPaise || 49900;
    setProcessingId(item.id);

    await openRazorpayCheckout({
      amountInPaise: paise,
      currency: 'INR',
      name: 'Harshit Kandoi Marketplace',
      description: `Purchase: ${item.name}`,
      onSuccess: (details) => {
        setProcessingId(null);
        addNotification(
          '🛒 Order Confirmed!',
          `Payment verified for ${item.name}. Ref: ${details.paymentId}`,
          'success',
          'system'
        );
      },
      onError: (err) => {
        setProcessingId(null);
        addNotification('❌ Payment Failed', err, 'error', 'system');
      },
      onDismiss: () => {
        setProcessingId(null);
      },
    });
  };

  // Filter items
  const filteredItems = MARKETPLACE_ITEMS.filter((item) => {
    const matchesTab =
      activeTab === 'All'
        ? true
        : activeTab === 'Featured'
        ? item.is_featured
        : item.category === activeTab;

    if (!matchesTab) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.tagline.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q)) ||
      (item.framework && item.framework.toLowerCase().includes(q)) ||
      (item.license && item.license.toLowerCase().includes(q))
    );
  });

  const featuredItems = MARKETPLACE_ITEMS.filter((i) => i.is_featured);

  // Group items by category for 'All' view
  const categorizedSections: { cat: MarketplaceCategory; items: MarketplaceItem[] }[] = [
    { cat: 'template' as MarketplaceCategory, items: filteredItems.filter((i) => i.category === 'template') },
    { cat: 'tool' as MarketplaceCategory, items: filteredItems.filter((i) => i.category === 'tool') },
    { cat: 'asset' as MarketplaceCategory, items: filteredItems.filter((i) => i.category === 'asset') },
    { cat: 'service' as MarketplaceCategory, items: filteredItems.filter((i) => i.category === 'service') },
    { cat: 'personal' as MarketplaceCategory, items: filteredItems.filter((i) => i.category === 'personal') },
  ].filter((sec) => sec.items.length > 0);

  const containerBg = isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#0b0c14] text-slate-100';
  const cardBg = isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#121320] border-white/10 hover:border-indigo-500/40';
  const badgeBg = isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-white/5 text-slate-300 border-white/10';

  return (
    <div className={`flex flex-col h-full overflow-hidden font-sans ${containerBg}`}>
      {/* ── Top Marketplace Header ── */}
      <div className={`shrink-0 px-5 pt-4 pb-3 border-b ${isLight ? 'border-slate-200 bg-white/80' : 'border-white/10 bg-[#0e0f1a]/90'} backdrop-blur-md`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight">Store.exe</h1>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Dev Marketplace
                </span>
              </div>
              <p className="text-xs text-slate-400">Discover software, templates, open-source tools & developer resources</p>
            </div>
          </div>

          {/* Real-time Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tools, templates, stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none border transition-all ${
                isLight
                  ? 'bg-slate-100 border-slate-200 focus:border-indigo-500 text-slate-800'
                  : 'bg-white/5 border-white/10 focus:border-indigo-500 text-slate-200 placeholder:text-slate-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* ── Category Navigation Tabs ── */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 pb-0.5">
          <button
            onClick={() => setActiveTab('All')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              activeTab === 'All'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                : isLight
                ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> All Resources
          </button>

          <button
            onClick={() => setActiveTab('Featured')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              activeTab === 'Featured'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 font-bold'
                : isLight
                ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Featured
          </button>

          {(['template', 'tool', 'asset', 'service', 'personal'] as MarketplaceCategory[]).map((cat) => {
            const meta = CATEGORY_META[cat];
            const Icon = meta.icon;
            const isActive = activeTab === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-slate-800 text-white border-indigo-500 shadow-sm'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${meta.color}`} /> {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Content Body ── */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-7">
        {/* ── HERO FEATURED CARDS SECTION (Top 2-3 highlights) ── */}
        {(activeTab === 'All' || activeTab === 'Featured') && !searchQuery && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs uppercase tracking-widest font-extrabold text-slate-400">Featured Creations</h2>
              </div>
              <span className="text-[11px] text-slate-500">Hand-crafted highlight projects</span>
            </div>

            <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-3 gap-4'}`}>
              {featuredItems.map((item) => {
                const meta = CATEGORY_META[item.category];
                return (
                  <div
                    key={item.id}
                    className={`relative group rounded-2xl border p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
                      isLight
                        ? 'bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-md'
                        : 'bg-gradient-to-b from-[#16182a] to-[#0f101d] border-indigo-500/20 hover:border-indigo-500/50 shadow-lg'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-xl shadow-md shrink-0`}>
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold tracking-tight text-white leading-snug">{item.name}</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {item.version && (
                              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {item.version}
                              </span>
                            )}
                            {item.license && (
                              <span className="text-[10px] font-mono text-slate-400">{item.license}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${meta.bg} ${meta.color}`}>
                        {item.price}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">{item.tagline}</p>

                    {/* Metadata strip */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 mb-4 pt-2 border-t border-white/5">
                      {item.framework && (
                        <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          <Code2 className="w-3 h-3 text-indigo-400" /> {item.framework}
                        </span>
                      )}
                      {item.downloads && (
                        <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          <Download className="w-3 h-3 text-emerald-400" /> {item.downloads} downloads
                        </span>
                      )}
                      {item.githubStars && (
                        <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          <Star className="w-3 h-3 text-amber-400" /> {item.githubStars} stars
                        </span>
                      )}
                    </div>

                    {/* CTA Actions for Featured */}
                    <div className="flex items-center gap-2 pt-1 mt-auto">
                      {item.category === 'template' && (
                        <>
                          <a
                            href={item.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </a>
                          <button
                            onClick={() => handleCheckout(item)}
                            disabled={processingId === item.id}
                            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 text-white flex items-center justify-center gap-1.5 transition shadow-md shadow-indigo-500/20"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> {processingId === item.id ? 'Processing...' : 'Buy Template'}
                          </button>
                        </>
                      )}

                      {item.category === 'tool' && (
                        <>
                          {item.repo_url && (
                            <a
                              href={item.repo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition"
                            >
                              <Github className="w-3.5 h-3.5" /> View Source
                            </a>
                          )}
                          <button
                            onClick={() => handleCopyInstall(item)}
                            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center justify-center gap-1.5 transition"
                          >
                            {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedId === item.id ? 'Copied!' : 'Copy Install'}
                          </button>
                        </>
                      )}

                      {item.category === 'personal' && (
                        <>
                          <a
                            href={item.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 flex items-center justify-center gap-1.5 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Open
                          </a>
                          <button
                            onClick={() => setSelectedStoryItem(item)}
                            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center gap-1.5 transition"
                          >
                            <Heart className="w-3.5 h-3.5 text-pink-400" /> Read Story
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SECTIONAL CATEGORY RENDERING ── */}
        {categorizedSections.map(({ cat, items }) => {
          const meta = CATEGORY_META[cat];
          const CategoryIcon = meta.icon;

          return (
            <div key={cat} className="space-y-3">
              {/* Category Section Header */}
              <div className="flex items-center justify-between border-b pb-2 border-white/5">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${meta.bg}`}>
                    <CategoryIcon className={`w-4 h-4 ${meta.color}`} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold tracking-tight">{meta.label}</h2>
                    <p className="text-[11px] text-slate-400">{meta.description}</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Items Grid */}
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 gap-4'}`}>
                {items.map((item) => (
                  <MarketplaceCard
                    key={item.id}
                    item={item}
                    cardBg={cardBg}
                    badgeBg={badgeBg}
                    copiedId={copiedId}
                    processingId={processingId}
                    onCopyInstall={handleCopyInstall}
                    onCheckout={handleCheckout}
                    onOpenStory={(i) => setSelectedStoryItem(i)}
                    onBookCall={(i) => setSelectedServiceItem(i)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No items found matching "{searchQuery}"</p>
            <p className="text-xs text-slate-500 mt-1">Try searching for keywords like "React", "GCP", "Next.js", or clear filters.</p>
          </div>
        )}
      </div>

      {/* ── MODAL: READ STORY (For Personal Creations) ── */}
      {selectedStoryItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#121322] border-white/15 text-slate-100'
          }`}>
            <button
              onClick={() => setSelectedStoryItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-2xl shadow-lg shadow-pink-500/20">
                {selectedStoryItem.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold">{selectedStoryItem.name}</h3>
                <p className="text-xs text-pink-400 font-semibold">{selectedStoryItem.tagline}</p>
              </div>
            </div>

            <div className={`p-4 rounded-xl text-xs leading-relaxed space-y-3 whitespace-pre-line border mb-5 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/5 border-white/5 text-slate-300'
            }`}>
              {selectedStoryItem.story_content || selectedStoryItem.description}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-pink-400" /> Sentimental Project • Not For Sale
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedStoryItem(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/15 transition text-slate-300"
                >
                  Close
                </button>
                {selectedStoryItem.demo_url && (
                  <a
                    href={selectedStoryItem.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:opacity-90 text-white flex items-center gap-1.5 transition shadow-md shadow-pink-500/20"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: SERVICE BOOKING / DETAILS ── */}
      {selectedServiceItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#121322] border-white/15 text-slate-100'
          }`}>
            <button
              onClick={() => setSelectedServiceItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-2xl shadow-lg shadow-rose-500/20">
                {selectedServiceItem.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold">{selectedServiceItem.name}</h3>
                <p className="text-xs text-rose-400 font-semibold">{selectedServiceItem.price}</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">{selectedServiceItem.description}</p>

            <div className={`grid grid-cols-2 gap-3 p-3 rounded-xl border mb-5 text-xs ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'
            }`}>
              <div>
                <span className="text-[10px] text-slate-500 block">Delivery Time</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> {selectedServiceItem.delivery_time || '24-48 Hours'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Availability</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                  {selectedServiceItem.availability || '🟢 Available'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedServiceItem(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/15 transition text-slate-300"
              >
                Cancel
              </button>
              <a
                href={`mailto:kandoiharshitsdlp@gmail.com?subject=Booking Inquiry: ${encodeURIComponent(selectedServiceItem.name)}&body=Hi Harshit,%0A%0AI would like to book or inquire about your service: ${encodeURIComponent(selectedServiceItem.name)}.`}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:opacity-90 text-white flex items-center gap-1.5 transition shadow-md shadow-rose-500/20"
              >
                <Calendar className="w-3.5 h-3.5" /> Book Call / Inquire via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CARD COMPONENT WITH CTA HIERARCHY & COMPACT METADATA ───
function MarketplaceCard({
  item,
  cardBg,
  badgeBg,
  copiedId,
  processingId,
  onCopyInstall,
  onCheckout,
  onOpenStory,
  onBookCall,
}: {
  item: MarketplaceItem;
  cardBg: string;
  badgeBg: string;
  copiedId: string | null;
  processingId: string | null;
  onCopyInstall: (item: MarketplaceItem) => void;
  onCheckout: (item: MarketplaceItem) => void;
  onOpenStory: (item: MarketplaceItem) => void;
  onBookCall: (item: MarketplaceItem) => void;
}) {
  const isPersonal = item.category === 'personal';
  const isService = item.category === 'service';
  const isTool = item.category === 'tool';
  const isTemplate = item.category === 'template';
  const isAsset = item.category === 'asset';

  return (
    <div className={`rounded-2xl border p-4 flex flex-col justify-between transition-all duration-200 ${cardBg}`}>
      <div>
        {/* Header line */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color || 'from-indigo-500 to-purple-600'} flex items-center justify-center text-xl shrink-0 shadow-md`}>
              {item.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs font-bold tracking-tight truncate">{item.name}</h3>
                {item.version && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                    {item.version}
                  </span>
                )}
                {item.license && (
                  <span className="text-[9px] font-mono text-slate-500 px-1.5 py-0.2 rounded bg-white/5 border border-white/5">
                    {item.license}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.tagline}</p>
            </div>
          </div>
          <span className={`text-xs font-extrabold whitespace-nowrap shrink-0 ${
            item.price === 'Free' ? 'text-emerald-400' : isPersonal ? 'text-pink-400' : 'text-indigo-400'
          }`}>
            {item.price}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">{item.description}</p>

        {/* ── Compact Software Metadata ── */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 mb-3">
          {/* Framework */}
          {item.framework && (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded border ${badgeBg}`}>
              <Code2 className="w-3 h-3 text-indigo-400" /> {item.framework}
            </span>
          )}

          {/* Last Updated */}
          {item.lastUpdated && (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded border ${badgeBg}`}>
              <Clock className="w-3 h-3 text-slate-400" /> {item.lastUpdated}
            </span>
          )}

          {/* File Size */}
          {item.fileSize && (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded border ${badgeBg}`}>
              <Tag className="w-3 h-3 text-purple-400" /> {item.fileSize}
            </span>
          )}

          {/* Downloads */}
          {item.downloads && (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded border ${badgeBg}`}>
              <Download className="w-3 h-3 text-emerald-400" /> {item.downloads}
            </span>
          )}

          {/* GitHub Stars */}
          {item.githubStars && (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded border ${badgeBg}`}>
              <Star className="w-3 h-3 text-amber-400" /> {item.githubStars} stars
            </span>
          )}

          {/* File Format */}
          {item.file_format && (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded border ${badgeBg}`}>
              Format: {item.file_format}
            </span>
          )}

          {/* Compatible With */}
          {item.compatible_with && (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded border ${badgeBg}`}>
              Compatible: {item.compatible_with}
            </span>
          )}

          {/* Delivery Time */}
          {item.delivery_time && (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded border ${badgeBg}`}>
              <Clock className="w-3 h-3 text-rose-400" /> {item.delivery_time}
            </span>
          )}

          {/* Availability */}
          {item.availability && (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded border ${badgeBg}`}>
              {item.availability}
            </span>
          )}
        </div>

        {/* ── Install Command Box for Open Source Tools ── */}
        {isTool && item.install_cmd && (
          <div className="mb-3 rounded-lg bg-slate-950/80 border border-white/10 p-2 font-mono text-[11px] flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="whitespace-nowrap selection:bg-cyan-500/30">$ {item.install_cmd}</span>
            </div>
            <button
              onClick={() => onCopyInstall(item)}
              title="Copy Command"
              className="ml-2 p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition shrink-0"
            >
              {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* ── CTA HIERARCHY BUTTONS ── */}
      <div className="pt-2 border-t border-white/5 flex items-center gap-2">
        {/* 1. OPEN SOURCE / DEV TOOLS: View Source | Copy Install | Documentation */}
        {isTool && (
          <>
            {item.repo_url && (
              <a
                href={item.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center gap-1 transition"
              >
                <Github className="w-3 h-3" /> View Source
              </a>
            )}
            {item.install_cmd && (
              <button
                onClick={() => onCopyInstall(item)}
                className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 flex items-center justify-center gap-1 transition"
              >
                {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedId === item.id ? 'Copied' : 'Copy Install'}
              </button>
            )}
            {item.docs_url && (
              <a
                href={item.docs_url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 transition"
              >
                <BookOpen className="w-3 h-3" /> Docs
              </a>
            )}
          </>
        )}

        {/* 2. TEMPLATES: Live Preview | Documentation | Buy Template */}
        {isTemplate && (
          <>
            {item.demo_url && (
              <a
                href={item.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center gap-1 transition"
              >
                <Eye className="w-3 h-3" /> Preview
              </a>
            )}
            {item.docs_url && (
              <a
                href={item.docs_url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 transition"
              >
                <BookOpen className="w-3 h-3" /> Docs
              </a>
            )}
            {item.price !== 'Free' ? (
              <button
                onClick={() => onCheckout(item)}
                disabled={processingId === item.id}
                className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white flex items-center justify-center gap-1 transition shadow-sm"
              >
                <CreditCard className="w-3 h-3" /> {processingId === item.id ? 'Processing...' : 'Buy Template'}
              </button>
            ) : (
              <a
                href={item.docs_url || item.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 flex items-center justify-center gap-1 transition"
              >
                <Download className="w-3 h-3" /> Download
              </a>
            )}
          </>
        )}

        {/* 3. DIGITAL ASSETS: Preview | Download | Buy */}
        {isAsset && (
          <>
            {item.demo_url && (
              <a
                href={item.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center gap-1 transition"
              >
                <Eye className="w-3 h-3" /> Preview
              </a>
            )}
            {item.price !== 'Free' ? (
              <button
                onClick={() => onCheckout(item)}
                disabled={processingId === item.id}
                className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-slate-950 font-bold flex items-center justify-center gap-1 transition shadow-sm"
              >
                <CreditCard className="w-3 h-3" /> Buy ({item.price})
              </button>
            ) : (
              <a
                href={item.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 flex items-center justify-center gap-1 transition"
              >
                <Download className="w-3 h-3" /> Download
              </a>
            )}
          </>
        )}

        {/* 4. SERVICES: Learn More | Book Call */}
        {isService && (
          <>
            <button
              onClick={() => onBookCall(item)}
              className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center gap-1 transition"
            >
              <Info className="w-3 h-3" /> Learn More
            </button>
            <button
              onClick={() => onBookCall(item)}
              className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-gradient-to-r from-rose-500 to-pink-600 hover:opacity-90 text-white flex items-center justify-center gap-1 transition shadow-sm shadow-rose-500/20"
            >
              <Calendar className="w-3 h-3" /> Book Call
            </button>
          </>
        )}

        {/* 5. PERSONAL CREATIONS: Open | Read Story */}
        {isPersonal && (
          <>
            {item.demo_url && (
              <a
                href={item.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 flex items-center justify-center gap-1 transition"
              >
                <ExternalLink className="w-3 h-3" /> Open
              </a>
            )}
            <button
              onClick={() => onOpenStory(item)}
              className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center gap-1 transition"
            >
              <Heart className="w-3 h-3 text-pink-400" /> Read Story
            </button>
          </>
        )}
      </div>
    </div>
  );
}

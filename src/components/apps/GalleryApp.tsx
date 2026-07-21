import { useState } from 'react';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Grid, Tag } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  tags: string[];
}

// Placeholder gallery items — user will replace with real photos
const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: '1',
    title: 'Local GCP Emulator in Action',
    description: 'The offline GCP dev environment running Firestore + Pub/Sub locally via Docker.',
    image_url: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Projects',
    tags: ['GCP', 'Docker', 'Cloud'],
  },
  {
    id: '2',
    title: 'ASL Detection Demo',
    description: 'Real-time American Sign Language detection achieving 90%+ accuracy with YOLOv5.',
    image_url: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Projects',
    tags: ['AI', 'Computer Vision', 'YOLO'],
  },
  {
    id: '3',
    title: 'Portfolio OS Desktop',
    description: 'The full-screen OS desktop with apps, dock, and wallpaper.',
    image_url: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Projects',
    tags: ['React', 'TypeScript', 'Portfolio'],
  },
  {
    id: '4',
    title: 'Jaipur — Golden Hour',
    description: 'Sunset over the Pink City, shot during a weekend trip.',
    image_url: 'https://images.pexels.com/photos/3581369/pexels-photo-3581369.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Travel',
    tags: ['Jaipur', 'Photography', 'India'],
  },
  {
    id: '5',
    title: 'Pilani Nightscape',
    description: 'Long exposure photograph from the BKBIET campus rooftop at 2am.',
    image_url: 'https://images.pexels.com/photos/1402787/pexels-photo-1402787.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Creative',
    tags: ['Photography', 'Night', 'Campus'],
  },
  {
    id: '6',
    title: 'Deep Learning Model Training',
    description: 'GPU training run for the Doom RL agent — PyTorch + CUDA.',
    image_url: 'https://images.pexels.com/photos/2653362/pexels-photo-2653362.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Projects',
    tags: ['AI', 'PyTorch', 'Deep Learning'],
  },
  {
    id: '7',
    title: 'Hackathon Night',
    description: '24-hour hackathon at college — building our cloud automation project.',
    image_url: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Hobbies',
    tags: ['Hackathon', 'College', 'Team'],
  },
  {
    id: '8',
    title: 'Developer Setup',
    description: 'My daily driver — dual monitor setup with terminal always open.',
    image_url: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Creative',
    tags: ['Setup', 'Tech', 'Workspace'],
  },
];

const CATEGORIES = ['All', 'Projects', 'Travel', 'Creative', 'Hobbies'];

export default function GalleryApp({ isMobileView }: { isMobileView?: boolean } = {}) {
  const theme = useOSStore((s) => s.theme);
  const globalViewMode = useOSStore((s) => s.viewMode);
  const isSimulatingMobile = useOSStore((s) => s.isSimulatingMobile);
  const isMobile = isMobileView || globalViewMode === 'mobile' || isSimulatingMobile;
  const isLight = theme === 'light';

  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const filtered = filter === 'All' ? GALLERY_ITEMS : GALLERY_ITEMS.filter((i) => i.category === filter);

  const openLightbox = (item: GalleryItem) => {
    const idx = filtered.findIndex((i) => i.id === item.id);
    setLightboxIdx(idx);
    setLightbox(item);
  };

  const navLightbox = (dir: 1 | -1) => {
    const newIdx = (lightboxIdx + dir + filtered.length) % filtered.length;
    setLightboxIdx(newIdx);
    setLightbox(filtered[newIdx]);
  };

  const containerBg = isLight ? 'bg-gray-50 text-gray-800' : 'bg-[#080912] text-white';

  return (
    <div className={`flex flex-col h-full overflow-hidden ${containerBg}`}>
      {/* Header */}
      <div className={`shrink-0 px-5 pt-5 pb-4 border-b flex items-center justify-between ${isLight ? 'border-gray-200 bg-gray-100' : 'border-white/5 bg-[#0a0b10]'}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-md">
            <ImageIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold">Gallery</h1>
            <p className="text-[10px] text-gray-500">{GALLERY_ITEMS.length} photos · Personal & Projects</p>
          </div>
        </div>
        <Grid className="w-4 h-4 text-gray-500" />
      </div>

      {/* Category Filter */}
      <div className={`shrink-0 px-5 py-3 border-b flex gap-2 overflow-x-auto custom-scrollbar ${isLight ? 'border-gray-200' : 'border-white/5'}`}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap border transition-all ${
              filter === cat
                ? 'bg-pink-500/20 border-pink-500/50 text-pink-400'
                : isLight ? 'bg-white border-gray-200 text-gray-600' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
            }`}
          >{cat}</button>
        ))}
      </div>

      {/* Masonry-ish Grid */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <div className={`columns-2 ${isMobile ? '' : 'sm:columns-3'} gap-3 space-y-3`}>
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => openLightbox(item)}
              className="break-inside-avoid rounded-2xl overflow-hidden cursor-pointer group relative border border-white/5 hover:border-pink-500/40 transition-all"
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-[11px] font-bold text-white leading-tight">{item.title}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {item.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-md">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[99990] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            onClick={() => setLightbox(null)}
            aria-label="Close lightbox"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            onClick={(e) => { e.stopPropagation(); navLightbox(-1); }}
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <div
            className="max-w-4xl max-h-[80vh] flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightbox.image_url}
              alt={lightbox.title}
              className="max-h-[65vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <div className="text-center">
              <h3 className="text-sm font-bold text-white">{lightbox.title}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{lightbox.description}</p>
              <div className="flex gap-1.5 mt-2 justify-center">
                {lightbox.tags.map((tag) => (
                  <span key={tag} className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" />{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            onClick={(e) => { e.stopPropagation(); navLightbox(1); }}
            aria-label="Next photo"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          <div className="absolute bottom-4 flex gap-1.5">
            {filtered.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setLightboxIdx(i); setLightbox(filtered[i]); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === lightboxIdx ? 'bg-pink-400 w-4' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

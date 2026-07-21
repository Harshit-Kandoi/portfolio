import React, { useState, useEffect } from 'react';
import {
  Brain,
  Search,
  Clock,
  Pin,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Layers,
  Lightbulb,
  MessageSquareQuote,
  Tag,
} from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { Note, fetchNotes } from '../../services/supabase';
import { NOTES_SEED } from '../../data/notes';

const STATUS_CONFIG: Record<string, { label: string; badgeBg: string }> = {
  stable: {
    label: '🟢 Stable',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  },
  evolving: {
    label: '🟡 Evolving',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  },
  experiment: {
    label: '🔴 Experiment',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  }
};

const THOUGHT_TYPES = [
  'All',
  'Thought',
  'Observation',
  'Principle',
  'Question',
  'Mistake',
  'Experiment',
  'Lesson',
  'Framework'
];

// Helper getters for browser-persisted user pins & recent history
const getInitialPinnedIds = (): string[] => {
  try {
    const saved = localStorage.getItem('notes_user_pinned');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return NOTES_SEED.filter((n) => n.is_featured).map((n) => n.id);
};

const getInitialRecentIds = (): string[] => {
  try {
    const saved = localStorage.getItem('notes_recently_viewed');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
};

// Custom Markdown renderer tailored for personal notebook entries
function RenderContent({ content, isMaximized }: { content: string; isMaximized: boolean }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCode = false;
  let codeLines: string[] = [];

  const flushCode = (key: string) => {
    if (inCode) {
      elements.push(
        <pre key={`code-${key}`} className="bg-black/40 border border-white/5 rounded-xl p-3 overflow-x-auto my-2">
          <code className={`font-mono text-emerald-300 whitespace-pre ${isMaximized ? 'text-xs' : 'text-[11px]'}`}>
            {codeLines.join('\n')}
          </code>
        </pre>
      );
      codeLines = [];
      inCode = false;
    }
  };

  lines.forEach((line, i) => {
    const key = String(i);
    if (line.startsWith('```')) {
      if (inCode) {
        flushCode(key);
      } else {
        inCode = true;
      }
      return;
    }
    if (inCode) {
      codeLines.push(line);
      return;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key} className={`font-bold text-purple-300 mt-4 mb-1.5 ${isMaximized ? 'text-sm' : 'text-xs'}`}>
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key} className={`font-extrabold text-white mt-4 mb-2 ${isMaximized ? 'text-base' : 'text-sm'}`}>
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={key} className={`text-gray-300 leading-relaxed ml-4 list-disc ${isMaximized ? 'text-xs my-0.5' : 'text-[11px] my-0.5'}`}>
          <span dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
        </li>
      );
    } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
      elements.push(
        <div key={key} className={`flex items-start gap-2 text-gray-300 ${isMaximized ? 'text-xs my-1' : 'text-[11px] my-1'}`}>
          <span className="font-semibold text-purple-400 select-none">{line.slice(0, 3)}</span>
          <span dangerouslySetInnerHTML={{ __html: formatInline(line.slice(3)) }} />
        </div>
      );
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={key} className={`border-l-2 border-purple-500 pl-3 my-2 text-purple-200/90 italic bg-purple-500/5 py-1 rounded-r-md ${isMaximized ? 'text-xs' : 'text-[11px]'}`}>
          <span dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
        </blockquote>
      );
    } else if (line.trim()) {
      elements.push(
        <p
          key={key}
          className={`text-gray-300 leading-relaxed my-1.5 ${isMaximized ? 'text-xs' : 'text-[11px]'}`}
          dangerouslySetInnerHTML={{ __html: formatInline(line) }}
        />
      );
    } else {
      elements.push(<div key={key} className="h-0.5" />);
    }
  });
  flushCode('end');

  return <div className="space-y-1">{elements}</div>;
}

function formatInline(str: string): string {
  return str
    .replace(/`([^`]+)`/g, '<code class="bg-black/30 text-emerald-300 px-1 py-0.5 rounded font-mono text-[10px]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic text-purple-200/90">$1</em>');
}

export default function NotesApp({ isMobileView }: { isMobileView?: boolean } = {}) {
  const theme = useOSStore((s) => s.theme);
  const windows = useOSStore((s) => s.windows);
  const notesWin = windows.find((w) => w.id === 'notes');
  const isMaximized = notesWin?.isMaximized ?? false;

  const isLight = theme === 'light';

  const [notes, setNotes] = useState<Note[]>(NOTES_SEED);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'recent'>('all');
  const [userPinnedIds, setUserPinnedIds] = useState<string[]>(getInitialPinnedIds);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(getInitialRecentIds);
  const [selected, setSelected] = useState<Note | null>(notes[0] ?? null);

  // Select note and record in user's recently viewed list
  const handleSelectNote = (note: Note) => {
    setSelected(note);
    setRecentlyViewedIds((prev) => {
      const next = [note.id, ...prev.filter((id) => id !== note.id)];
      try {
        localStorage.setItem('notes_recently_viewed', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Toggle user pin status for a note (persisted per browser)
  const togglePinNote = (noteId: string) => {
    setUserPinnedIds((prev) => {
      const isPinned = prev.includes(noteId);
      const next = isPinned ? prev.filter((id) => id !== noteId) : [...prev, noteId];
      try {
        localStorage.setItem('notes_user_pinned', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  useEffect(() => {
    fetchNotes(NOTES_SEED).then((data) => {
      setNotes(data);
      if (!selected && data.length > 0) {
        handleSelectNote(data[0]);
      }
    });
  }, []);

  // Filter notes based on search, active type, and quick nav tab
  const searchLower = search.toLowerCase();
  let filteredNotes = notes.filter((n) => {
    const matchesSearch =
      !search ||
      n.title.toLowerCase().includes(searchLower) ||
      (n.observation && n.observation.toLowerCase().includes(searchLower)) ||
      (n.still_thinking && n.still_thinking.toLowerCase().includes(searchLower)) ||
      (n.content && n.content.toLowerCase().includes(searchLower)) ||
      (n.tags && n.tags.some((t) => t.toLowerCase().includes(searchLower))) ||
      (n.category && n.category.toLowerCase().includes(searchLower));

    const matchesType = activeType === 'All' || n.thought_type === activeType;

    return matchesSearch && matchesType;
  });

  if (activeTab === 'favorites') {
    filteredNotes = filteredNotes.filter((n) => userPinnedIds.includes(n.id));
  } else if (activeTab === 'recent') {
    // Render only notes viewed by the user, ordered by most recently viewed
    filteredNotes = recentlyViewedIds
      .map((id) => filteredNotes.find((n) => n.id === id))
      .filter((n): n is Note => Boolean(n));
  }

  const containerBg = isLight ? 'bg-gray-50 text-gray-800' : 'bg-[#090a0f] text-white';
  const sidebarBg = isLight ? 'bg-white border-gray-200' : 'bg-[#0d0e14] border-white/5';
  const noteCardBg = isLight ? 'hover:bg-gray-100' : 'hover:bg-white/[0.04]';

  // Get related notes for selected note
  const relatedNotes = selected?.related_note_ids
    ? notes.filter((n) => selected.related_note_ids?.includes(n.id))
    : [];

  const isSelectedPinned = selected ? userPinnedIds.includes(selected.id) : false;

  return (
    <div className={`flex h-full overflow-hidden select-none ${containerBg}`}>
      {/* Sidebar */}
      <div
        className={`${
          selected && isMobileView ? 'hidden sm:flex' : 'flex'
        } w-full sm:w-80 shrink-0 border-r flex-col overflow-hidden ${sidebarBg}`}
      >
        {/* Header & Search */}
        <div className="p-3.5 border-b border-white/5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 via-indigo-500 to-amber-500 flex items-center justify-center shadow-sm">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h1 className="text-xs font-bold tracking-tight">Private Notebook</h1>
                <p className="text-[9px] text-gray-500">Timeline of Thinking & Lessons</p>
              </div>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">
              {notes.length} entries
            </span>
          </div>

          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search thoughts & lessons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-7 pr-3 py-1.5 text-[11px] rounded-lg border focus:outline-none focus:ring-1 focus:ring-purple-500/30 ${
                isLight
                  ? 'bg-gray-100 border-gray-200 text-gray-800 placeholder-gray-400'
                  : 'bg-white/5 border-white/10 text-white placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Quick Nav Tabs */}
        <div className="px-2 py-1.5 border-b border-white/5 grid grid-cols-3 gap-1 text-[10px]">
          <button
            onClick={() => {
              setActiveTab('all');
              setActiveType('All');
            }}
            className={`py-1 px-1 rounded-md flex items-center justify-center gap-1 font-medium transition ${
              activeTab === 'all' && activeType === 'All'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-2.5 h-2.5" /> All ({notes.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`py-1 px-1 rounded-md flex items-center justify-center gap-1 font-medium transition ${
              activeTab === 'favorites'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Pin className="w-2.5 h-2.5" /> Pinned ({userPinnedIds.length})
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`py-1 px-1 rounded-md flex items-center justify-center gap-1 font-medium transition ${
              activeTab === 'recent'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Clock className="w-2.5 h-2.5" /> Recent ({recentlyViewedIds.length})
          </button>
        </div>

        {/* Thought Types Bar */}
        <div className="px-3 py-2 border-b border-white/5 overflow-x-auto custom-scrollbar flex gap-1">
          {THOUGHT_TYPES.map((type) => {
            const isActive = activeType === type;
            return (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-2 py-0.5 rounded-full text-[9px] font-medium whitespace-nowrap border transition ${
                  isActive
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/5">
          {filteredNotes.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-[11px] space-y-1">
              <p className="font-medium text-gray-400">
                {activeTab === 'recent'
                  ? 'No recently viewed notes yet.'
                  : activeTab === 'favorites'
                  ? 'No pinned notes yet.'
                  : 'No thoughts match your criteria.'}
              </p>
              <p className="text-[10px]">
                {activeTab === 'recent'
                  ? 'Click on any entry to add it to your recent history.'
                  : activeTab === 'favorites'
                  ? 'Open any note and click "Pin Note" to keep it handy.'
                  : 'Try clearing your search query.'}
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isSel = selected?.id === note.id;
              const isPinned = userPinnedIds.includes(note.id);
              const statusCfg = STATUS_CONFIG[note.status || 'stable'];

              return (
                <button
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`w-full text-left p-3 transition relative group ${noteCardBg} ${
                    isSel
                      ? 'bg-purple-500/10 border-l-2 border-l-purple-500'
                      : 'border-l-2 border-l-transparent'
                  }`}
                >
                  {/* Top bar: Tags & Pin / Status */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex flex-wrap gap-1 items-center">
                      {note.tags && note.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.2 rounded-full text-[8.5px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isPinned && (
                        <Pin className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      )}
                      {statusCfg && (
                        <span className="text-[9px] font-mono opacity-80">{statusCfg.label.split(' ')[0]}</span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <p className="text-[11px] font-semibold text-gray-100 leading-snug line-clamp-2">
                    {note.title}
                  </p>

                  {/* Observation */}
                  {note.observation && (
                    <p className="text-[10px] text-gray-400 line-clamp-1 mt-1 font-normal italic opacity-80">
                      "{note.observation}"
                    </p>
                  )}

                  {/* Footer metadata */}
                  <div className="flex items-center justify-between mt-2 text-[9px] text-gray-500 font-mono">
                    <span>{note.last_updated || note.date}</span>
                    {note.thought_type && (
                      <span className="px-1.5 py-0.2 rounded bg-white/5 text-gray-300 border border-white/10">
                        {note.thought_type}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`${
          !selected && isMobileView ? 'hidden sm:block' : 'block'
        } flex-1 overflow-y-auto custom-scrollbar`}
      >
        {selected ? (
          <div
            className={`mx-auto transition-all duration-200 ${
              isMaximized ? 'max-w-3xl p-6 sm:p-8 space-y-4' : 'max-w-2xl p-4 sm:p-5 space-y-3'
            }`}
          >
            {/* Mobile Back Button */}
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white mb-2 transition sm:hidden"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Back to Notebook
            </button>

            {/* Note Header Info */}
            <div className="space-y-2 border-b border-white/5 pb-3">
              {/* Tag Pills, Thought Type, Status & Pin Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {selected.tags && selected.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5 opacity-70" />
                      #{tag}
                    </span>
                  ))}

                  {selected.thought_type && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {selected.thought_type}
                    </span>
                  )}

                  {selected.status && STATUS_CONFIG[selected.status] && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                        STATUS_CONFIG[selected.status].badgeBg
                      }`}
                    >
                      {STATUS_CONFIG[selected.status].label}
                    </span>
                  )}
                </div>

                {/* Interactive User Pin/Unpin Button */}
                <button
                  onClick={() => togglePinNote(selected.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition border flex items-center gap-1.5 shrink-0 ${
                    isSelectedPinned
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'
                  }`}
                  title={isSelectedPinned ? 'Unpin from your notebook' : 'Pin to your notebook'}
                >
                  <Pin className={`w-3 h-3 ${isSelectedPinned ? 'fill-amber-400 text-amber-400' : 'text-gray-400'}`} />
                  <span>{isSelectedPinned ? 'Pinned' : 'Pin Note'}</span>
                </button>
              </div>

              {/* Title */}
              <h1
                className={`font-extrabold tracking-tight text-white leading-snug ${
                  isMaximized ? 'text-2xl' : 'text-lg sm:text-xl'
                }`}
              >
                {selected.title}
              </h1>

              {/* Metadata row */}
              <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-500" /> Updated: {selected.last_updated || selected.date}
                </span>
                <span>•</span>
                <span>{selected.read_time_mins || 2} min read</span>
                {isSelectedPinned && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-400 font-medium">
                      <Pin className="w-2.5 h-2.5 fill-amber-400" /> Pinned in your browser
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Personal Observation / Experience Box */}
            {selected.observation && (
              <div
                className={`rounded-xl border p-3.5 relative overflow-hidden ${
                  isLight
                    ? 'bg-purple-50 border-purple-200 text-purple-900'
                    : 'bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/40 border-purple-500/20 text-purple-100'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-300">
                  <MessageSquareQuote className="w-3.5 h-3.5 text-purple-400" /> Personal Trigger & Context
                </div>
                <p className={`leading-relaxed italic ${isMaximized ? 'text-xs sm:text-sm' : 'text-xs'}`}>
                  "{selected.observation}"
                </p>
              </div>
            )}

            {/* Key Reflections / Takeaways Box */}
            {selected.takeaways && selected.takeaways.length > 0 && (
              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Key Reflections
                </div>
                <ul className="space-y-1.5">
                  {selected.takeaways.map((takeaway, idx) => (
                    <li
                      key={idx}
                      className={`flex items-start gap-2 text-gray-200 ${
                        isMaximized ? 'text-xs' : 'text-[11px]'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Main Content Body */}
            {selected.content && (
              <div className="pt-2 border-t border-white/5">
                <RenderContent content={selected.content} isMaximized={isMaximized} />
              </div>
            )}

            {/* "Still Thinking..." Vulnerable Closing Block */}
            {selected.still_thinking && (
              <div className="rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/30 p-4 space-y-1.5 relative overflow-hidden my-4">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Still Thinking...
                </div>
                <p className={`italic text-amber-100/90 leading-relaxed ${isMaximized ? 'text-xs sm:text-sm' : 'text-xs'}`}>
                  "{selected.still_thinking}"
                </p>
                <div className="pt-1 text-[9px] text-amber-400/60 font-mono">
                  — Unresolved curiosity (open to evolving)
                </div>
              </div>
            )}

            {/* Interconnected Connected Thoughts Section */}
            {relatedNotes.length > 0 && (
              <div className="pt-4 border-t border-white/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-3 h-3 text-amber-400" /> Connected Thoughts ({relatedNotes.length})
                  </h3>
                  <span className="text-[9px] text-gray-500 italic">Interconnected Vault</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {relatedNotes.map((relNote) => {
                    const statusCfg = STATUS_CONFIG[relNote.status || 'stable'];
                    return (
                      <button
                        key={relNote.id}
                        onClick={() => handleSelectNote(relNote)}
                        className="text-left p-2.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-purple-500/30 transition group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[9px] text-purple-400 mb-1">
                            <div className="flex items-center gap-1">
                              {relNote.tags && relNote.tags[0] && <span>#{relNote.tags[0]}</span>}
                            </div>
                            {statusCfg && <span>{statusCfg.label.split(' ')[0]}</span>}
                          </div>
                          <h4 className="text-[11px] font-semibold text-gray-200 group-hover:text-purple-300 transition line-clamp-1">
                            {relNote.title}
                          </h4>
                          {relNote.observation && (
                            <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5 italic">
                              "{relNote.observation}"
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-end gap-1 text-[9px] text-purple-400 font-medium mt-2">
                          Read entry <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Brain className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-200">Private Notebook</h3>
              <p className="text-xs text-gray-500 max-w-xs mt-1">
                Select an entry from the sidebar to read honest reflections, mistakes, questions, and evolving principles.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

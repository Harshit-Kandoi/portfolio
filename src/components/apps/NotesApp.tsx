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
  HelpCircle,
  BookOpen,
  Compass,
  AlertCircle,
  FileText,
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

const NOTE_TYPES = [
  'All',
  'Reflection',
  'Memory',
  'Principle',
  'Question',
  'Journal'
];

// Helper getters for browser-persisted user pins & recent history
const getInitialPinnedIds = (): string[] => {
  try {
    const saved = localStorage.getItem('notes_user_pinned');
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore storage error
  }
  return NOTES_SEED.filter((n) => n.is_featured).map((n) => n.id);
};

const getInitialRecentIds = (): string[] => {
  try {
    const saved = localStorage.getItem('notes_recently_viewed');
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore storage error
  }
  return [];
};

// Custom Markdown renderer tailored for personal notebook entries
function RenderContent({ content, isMaximized, isLight = false }: { content: string; isMaximized: boolean; isLight?: boolean }) {
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
        <h2 key={key} className={`font-extrabold mt-4 mb-2 ${isLight ? 'text-slate-900' : 'text-white'} ${isMaximized ? 'text-base' : 'text-sm'}`}>
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={key} className={`leading-relaxed ml-4 list-disc ${isLight ? 'text-slate-800 font-medium' : 'text-gray-300'} ${isMaximized ? 'text-xs my-0.5' : 'text-[11px] my-0.5'}`}>
          <span dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
        </li>
      );
    } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
      elements.push(
        <div key={key} className={`flex items-start gap-2 ${isLight ? 'text-slate-800 font-medium' : 'text-gray-300'} ${isMaximized ? 'text-xs my-1' : 'text-[11px] my-1'}`}>
          <span className="font-semibold text-purple-500 select-none">{line.slice(0, 3)}</span>
          <span dangerouslySetInnerHTML={{ __html: formatInline(line.slice(3)) }} />
        </div>
      );
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={key} className={`border-l-2 border-purple-500 pl-3 my-2 italic py-1 rounded-r-md ${
          isLight ? 'bg-purple-100/60 text-purple-950 font-medium' : 'bg-purple-500/5 text-purple-200/90'
        } ${isMaximized ? 'text-xs' : 'text-[11px]'}`}>
          <span dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
        </blockquote>
      );
    } else if (line.trim()) {
      elements.push(
        <p
          key={key}
          className={`leading-relaxed my-1.5 ${isLight ? 'text-slate-800 font-medium' : 'text-gray-300'} ${isMaximized ? 'text-xs' : 'text-[11px]'}`}
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

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

// Notes can come from Supabase, so escape first and only then add our own markup.
function formatInline(str: string): string {
  return escapeHtml(str)
    .replace(/`([^`]+)`/g, '<code class="bg-black/30 text-emerald-300 px-1 py-0.5 rounded-sm font-mono text-[10px]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic text-purple-200/90">$1</em>');
}

export default function NotesApp({ isMobileView }: { isMobileView?: boolean } = {}) {
  const theme = useOSStore((s) => s.theme);
  const windows = useOSStore((s) => s.windows);
  const notesWin = windows.find((w) => w.id === 'writing');
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
      } catch {
        // ignore storage error
      }
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
      } catch {
        // ignore storage error
      }
      return next;
    });
  };

  useEffect(() => {
    fetchNotes(NOTES_SEED).then((data) => {
      setNotes(data);
      setSelected((prev) => prev ?? data[0] ?? null);
    });
  }, []);

  // Filter notes based on search, active type, and quick nav tab
  const searchLower = search.toLowerCase();
  let filteredNotes = notes.filter((n) => {
    const matchesSearch =
      !search ||
      n.title.toLowerCase().includes(searchLower) ||
      (n.observation && n.observation.toLowerCase().includes(searchLower)) ||
      (n.thought && n.thought.toLowerCase().includes(searchLower)) ||
      (n.still_thinking && n.still_thinking.toLowerCase().includes(searchLower)) ||
      (n.what_i_remember && n.what_i_remember.toLowerCase().includes(searchLower)) ||
      (n.the_rule && n.the_rule.toLowerCase().includes(searchLower)) ||
      (n.question && n.question.toLowerCase().includes(searchLower)) ||
      (n.what_happened && n.what_happened.toLowerCase().includes(searchLower)) ||
      (n.content && n.content.toLowerCase().includes(searchLower)) ||
      (n.category && n.category.toLowerCase().includes(searchLower));

    const noteType = n.type || n.thought_type || '';
    const matchesType = activeType === 'All' || noteType.toLowerCase() === activeType.toLowerCase();

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
  const noteCardBg = isLight ? 'hover:bg-gray-100' : 'hover:bg-white/4';

  // Get related notes for selected note
  const relatedNotes = selected?.related_note_ids
    ? notes.filter((n) => selected.related_note_ids?.includes(n.id))
    : [];

  const isSelectedPinned = selected ? userPinnedIds.includes(selected.id) : false;

  // Helper to extract a snippet for the note preview card
  const getNoteSnippet = (n: Note) => {
    return (
      n.observation ||
      n.the_rule ||
      n.question ||
      n.what_happened ||
      n.what_i_remember ||
      n.thought ||
      ''
    );
  };

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
              <div className="w-7 h-7 rounded-lg bg-linear-to-br from-purple-500 via-indigo-500 to-amber-500 flex items-center justify-center shadow-xs">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h1 className="text-xs font-bold tracking-tight">Private Notebook</h1>
                <p className="text-[9px] text-gray-500">Timeline of Thinking & Lessons</p>
              </div>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-purple-500/10 border border-purple-500/20 text-purple-300">
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
              className={`w-full pl-7 pr-3 py-1.5 text-[11px] rounded-lg border focus:outline-hidden focus:ring-1 focus:ring-purple-500/30 ${
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

        {/* Note Types Bar */}
        <div className="px-3 py-2 border-b border-white/5 overflow-x-auto custom-scrollbar flex gap-1">
          {NOTE_TYPES.map((type) => {
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
              const snippet = getNoteSnippet(note);
              const noteType = note.type || note.thought_type || 'Note';

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
                  {/* Top bar: Category & Pin / Status */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9.5px] font-medium text-purple-400/90 truncate max-w-[140px]">
                      {note.category || 'General'}
                    </span>

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
                  <p className={`text-[11px] leading-snug line-clamp-2 ${isLight ? 'text-slate-900 font-bold' : 'text-gray-100 font-semibold'}`}>
                    {note.title}
                  </p>

                  {/* Snippet */}
                  {snippet && (
                    <p className={`text-[10px] line-clamp-1 mt-1 font-normal italic opacity-90 ${isLight ? 'text-slate-600 font-medium' : 'text-gray-400'}`}>
                      "{snippet}"
                    </p>
                  )}

                  {/* Footer metadata */}
                  <div className={`flex items-center justify-between mt-2 text-[9px] font-mono ${isLight ? 'text-slate-600 font-medium' : 'text-gray-400'}`}>
                    <span>{note.last_updated || note.date}</span>
                    <span className={`px-1.5 py-0.2 rounded border capitalize ${
                      isLight ? 'bg-slate-200/80 text-slate-800 border-slate-300 font-semibold' : 'bg-white/5 text-gray-300 border-white/10'
                    }`}>
                      {noteType}
                    </span>
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
              isMaximized ? 'max-w-3xl p-6 sm:p-8 space-y-4' : 'max-w-2xl p-4 sm:p-5 space-y-3.5'
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
              {/* Category, Type, Status & Pin Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <Compass className="w-2.5 h-2.5" /> {selected.category || 'General'}
                  </span>

                  {(selected.type || selected.thought_type) && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 capitalize">
                      {selected.type || selected.thought_type}
                    </span>
                  )}

                  {selected.status && STATUS_CONFIG[selected.status] && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
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
                className={`font-extrabold tracking-tight leading-snug ${
                  isLight ? 'text-slate-900' : 'text-white'
                } ${
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

            {/* Render Note Fields based on Type */}

            {/* 1. TYPE: REFLECTION */}
            {selected.observation && (
              <div
                className={`rounded-xl border p-3.5 relative overflow-hidden ${
                  isLight
                    ? 'bg-purple-50 border-purple-200 text-purple-900'
                    : 'bg-linear-to-r from-purple-950/40 via-indigo-950/30 to-slate-900/40 border-purple-500/20 text-purple-100'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-300">
                  <MessageSquareQuote className="w-3.5 h-3.5 text-purple-400" /> Trigger & Context
                </div>
                <p className={`leading-relaxed italic ${isMaximized ? 'text-xs sm:text-sm' : 'text-xs'}`}>
                  "{selected.observation}"
                </p>
              </div>
            )}

            {selected.thought && (
              <div className={`rounded-xl border p-4 space-y-2 ${isLight ? 'bg-slate-100/90 border-slate-200 text-slate-900' : 'bg-white/2 border-white/5'}`}>
                <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
                  <Brain className="w-3.5 h-3.5 text-purple-500" /> Unfiltered Thought
                </div>
                <p className={`leading-relaxed ${isLight ? 'text-slate-800 font-medium' : 'text-gray-200'} ${isMaximized ? 'text-xs sm:text-sm' : 'text-xs'}`}>
                  {selected.thought}
                </p>
              </div>
            )}

            {/* 2. TYPE: MEMORY */}
            {selected.what_i_remember && (
              <div className={`rounded-xl border p-4 space-y-2 ${
                isLight ? 'bg-amber-50 border-amber-200 text-amber-950 font-medium' : 'bg-linear-to-r from-amber-950/30 via-orange-950/20 to-slate-900/40 border-amber-500/20'
              }`}>
                <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                  <BookOpen className="w-3.5 h-3.5 text-amber-500" /> What I Remember
                </div>
                <p className={`leading-relaxed italic ${isLight ? 'text-amber-950 font-medium' : 'text-amber-100/90'} ${isMaximized ? 'text-xs sm:text-sm' : 'text-xs'}`}>
                  "{selected.what_i_remember}"
                </p>
              </div>
            )}

            {selected.why_it_stuck && (
              <div className={`rounded-xl border p-3.5 space-y-1.5 ${isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-white/2 border-white/5'}`}>
                <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-orange-700' : 'text-orange-400'}`}>
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Why It Stuck
                </div>
                <p className={`leading-relaxed ${isLight ? 'text-slate-800 font-medium' : 'text-gray-200'} ${isMaximized ? 'text-xs sm:text-sm' : 'text-xs'}`}>
                  {selected.why_it_stuck}
                </p>
              </div>
            )}

            {/* 3. TYPE: PRINCIPLE */}
            {selected.the_rule && (
              <div className={`rounded-xl border p-4 space-y-2 ${
                isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-semibold' : 'bg-linear-to-r from-emerald-950/40 via-teal-950/30 to-slate-900/40 border-emerald-500/25'
              }`}>
                <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-emerald-700' : 'text-emerald-300'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> The Operating Rule
                </div>
                <p className={`font-semibold leading-relaxed ${isLight ? 'text-emerald-950' : 'text-emerald-100'} ${isMaximized ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
                  "{selected.the_rule}"
                </p>
              </div>
            )}

            {selected.where_i_learned_it && (
              <div className={`rounded-xl border p-3.5 space-y-1.5 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/2 border-white/5'}`}>
                <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>
                  <FileText className="w-3.5 h-3.5 text-purple-500" /> Where I Learned It
                </div>
                <p className={`leading-relaxed ${isLight ? 'text-slate-800 font-medium' : 'text-gray-300'} ${isMaximized ? 'text-xs sm:text-sm' : 'text-xs'}`}>
                  {selected.where_i_learned_it}
                </p>
              </div>
            )}

            {selected.exception && (
              <div className={`rounded-xl border p-3.5 space-y-1.5 ${isLight ? 'bg-rose-50 border-rose-200 text-rose-950' : 'bg-rose-500/5 border-rose-500/20'}`}>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-600">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> The Exception / Caveat
                </div>
                <p className={`italic leading-relaxed ${isLight ? 'text-rose-950 font-medium' : 'text-rose-100/90'} ${isMaximized ? 'text-xs sm:text-sm' : 'text-xs'}`}>
                  "{selected.exception}"
                </p>
              </div>
            )}

            {/* 4. TYPE: QUESTION */}
            {selected.question && (
              <div className={`rounded-xl border p-4 space-y-2 ${isLight ? 'bg-sky-50 border-sky-200 text-sky-950' : 'bg-linear-to-r from-sky-950/40 via-indigo-950/30 to-slate-900/40 border-sky-500/25'}`}>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-600">
                  <HelpCircle className="w-3.5 h-3.5 text-sky-500" /> Core Question
                </div>
                <p className={`font-bold leading-relaxed ${isLight ? 'text-sky-950' : 'text-sky-100'} ${isMaximized ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>
                  "{selected.question}"
                </p>
              </div>
            )}

            {selected.why_i_care && (
              <div className={`rounded-xl border p-3.5 space-y-1.5 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/2 border-white/5'}`}>
                <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>
                  <Brain className="w-3.5 h-3.5 text-sky-500" /> Why I Care
                </div>
                <p className={`leading-relaxed ${isLight ? 'text-slate-800 font-medium' : 'text-gray-300'} ${isMaximized ? 'text-xs sm:text-sm' : 'text-xs'}`}>
                  {selected.why_i_care}
                </p>
              </div>
            )}

            {selected.possible_answers && selected.possible_answers.length > 0 && (
              <div className={`rounded-xl border p-3.5 space-y-2 ${isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-white/2 border-white/5'}`}>
                <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-sky-700' : 'text-sky-400'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" /> Possible Answers / Working Hypotheses
                </div>
                <ul className="space-y-1.5">
                  {selected.possible_answers.map((ans, idx) => (
                    <li
                      key={idx}
                      className={`flex items-start gap-2 ${isLight ? 'text-slate-800 font-medium' : 'text-gray-200'} ${
                        isMaximized ? 'text-xs' : 'text-[11px]'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{ans}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 5. TYPE: JOURNAL */}
            {selected.what_happened && (
              <div className={`rounded-xl border p-4 space-y-2 ${isLight ? 'bg-slate-100/90 border-slate-200' : 'bg-white/2 border-white/5'}`}>
                <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-purple-700' : 'text-purple-300'}`}>
                  <FileText className="w-3.5 h-3.5 text-purple-500" /> Unfiltered Entry
                </div>
                <p className={`leading-relaxed ${isLight ? 'text-slate-800 font-medium' : 'text-gray-200'} ${isMaximized ? 'text-xs sm:text-sm' : 'text-xs'}`}>
                  {selected.what_happened}
                </p>
              </div>
            )}

            {selected.what_surprised_me && (
              <div className={`rounded-xl border p-3.5 space-y-1.5 ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/10 border-amber-500/25'}`}>
                <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> What Surprised Me
                </div>
                <p className={`italic leading-relaxed ${isLight ? 'text-amber-950 font-medium' : 'text-amber-100/90'} ${isMaximized ? 'text-xs sm:text-sm' : 'text-xs'}`}>
                  "{selected.what_surprised_me}"
                </p>
              </div>
            )}

            {/* Markdown Content (if any) */}
            {selected.content && (
              <div className={`pt-2 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                <RenderContent content={selected.content} isMaximized={isMaximized} isLight={isLight} />
              </div>
            )}

            {/* "Still Thinking..." Closing Block */}
            {selected.still_thinking && (
              <div className={`rounded-xl border p-4 space-y-1.5 relative overflow-hidden my-4 ${
                isLight ? 'bg-amber-50 border-amber-200 text-amber-950' : 'bg-linear-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border-amber-500/30 text-amber-100/90'
              }`}>
                <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Still Thinking...
                </div>
                <p className={`italic leading-relaxed ${isLight ? 'text-amber-950 font-medium' : 'text-amber-100/90'} ${isMaximized ? 'text-xs sm:text-sm' : 'text-xs'}`}>
                  "{selected.still_thinking}"
                </p>
                <div className={`pt-1 text-[9px] font-mono ${isLight ? 'text-amber-800 font-semibold' : 'text-amber-400/60'}`}>
                  — Unresolved curiosity (open to evolving)
                </div>
              </div>
            )}

            {/* Interconnected Connected Thoughts Section */}
            {relatedNotes.length > 0 && (
              <div className={`pt-4 border-t space-y-2.5 ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>
                    <Lightbulb className="w-3 h-3 text-amber-500" /> Connected Thoughts ({relatedNotes.length})
                  </h3>
                  <span className={`text-[9px] italic ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>Interconnected Vault</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {relatedNotes.map((relNote) => {
                    const statusCfg = STATUS_CONFIG[relNote.status || 'stable'];
                    const snippet = getNoteSnippet(relNote);
                    const noteType = relNote.type || relNote.thought_type || 'note';
                    return (
                      <button
                        key={relNote.id}
                        onClick={() => handleSelectNote(relNote)}
                        className={`text-left p-2.5 rounded-lg border transition group flex flex-col justify-between ${
                          isLight
                            ? 'bg-white border-slate-200 hover:bg-slate-100 hover:border-purple-400 shadow-2xs text-slate-900'
                            : 'border-white/5 bg-white/2 hover:bg-white/6 hover:border-purple-500/30'
                        }`}
                      >
                        <div>
                          <div className={`flex items-center justify-between text-[9px] mb-1 ${isLight ? 'text-purple-600 font-bold' : 'text-purple-400'}`}>
                            <span className="capitalize">{noteType}</span>
                            {statusCfg && <span>{statusCfg.label.split(' ')[0]}</span>}
                          </div>
                          <h4 className={`text-[11px] font-bold transition line-clamp-1 ${isLight ? 'text-slate-900 group-hover:text-purple-700' : 'text-gray-200 group-hover:text-purple-300'}`}>
                            {relNote.title}
                          </h4>
                          {snippet && (
                            <p className={`text-[10px] line-clamp-1 mt-0.5 italic ${isLight ? 'text-slate-600 font-medium' : 'text-gray-400'}`}>
                              "{snippet}"
                            </p>
                          )}
                        </div>
                        <div className={`flex items-center justify-end gap-1 text-[9px] font-bold mt-2 ${isLight ? 'text-purple-600' : 'text-purple-400'}`}>
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
                Select an entry from the sidebar to read honest reflections, memories, principles, questions, and journal thoughts.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

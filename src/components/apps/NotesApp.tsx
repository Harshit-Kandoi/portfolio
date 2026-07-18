import { useState, useEffect } from 'react';
import { FileText, Search, Tag, Clock, Star, ChevronLeft } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { Note, fetchNotes } from '../../services/supabase';
import { NOTES_SEED } from '../../data/notes';

const TAG_COLORS: Record<string, string> = {
  GCP: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Cloud: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  Python: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  Docker: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  AI: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  React: 'bg-blue-400/15 text-blue-300 border-blue-400/30',
  TypeScript: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  DevOps: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  default: 'bg-white/5 text-gray-400 border-white/10',
};

function getTagStyle(tag: string) {
  return TAG_COLORS[tag] || TAG_COLORS.default;
}

// Super simple markdown-ish renderer
function RenderContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCode = false;
  let codeLines: string[] = [];
  let codeLang = '';
  let inTable = false;
  const tableRows: string[][] = [];

  const flush = (key: string) => {
    if (inCode) {
      elements.push(
        <pre key={`code-${key}`} className="bg-black/40 border border-white/5 rounded-xl p-4 overflow-x-auto my-3">
          <code className="text-[11px] font-mono text-emerald-300 whitespace-pre">{codeLines.join('\n')}</code>
        </pre>
      );
      codeLines = [];
      inCode = false;
    }
    if (inTable && tableRows.length) {
      elements.push(
        <table key={`table-${key}`} className="w-full my-3 border-collapse text-xs">
          <tbody>
            {tableRows.map((row, ri) => (
              <tr key={ri} className={ri === 0 ? 'border-b border-white/10' : ''}>
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-1.5 text-gray-300">{cell.trim()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
      tableRows.length = 0;
      inTable = false;
    }
  };

  lines.forEach((line, i) => {
    const key = String(i);
    if (line.startsWith('```')) {
      if (inCode) {
        flush(key);
      } else {
        flush(key);
        codeLang = line.slice(3);
        inCode = true;
      }
      return;
    }
    if (inCode) { codeLines.push(line); return; }

    if (line.startsWith('| ')) {
      if (line.startsWith('|---') || line.startsWith('| ---')) return;
      inTable = true;
      tableRows.push(line.split('|').filter(Boolean));
      return;
    }
    if (inTable) flush(key);

    if (line.startsWith('# ')) {
      elements.push(<h2 key={key} className="text-base font-bold text-white mt-4 mb-2">{line.slice(2)}</h2>);
    } else if (line.startsWith('## ')) {
      elements.push(<h3 key={key} className="text-sm font-bold text-purple-300 mt-3 mb-1.5">{line.slice(3)}</h3>);
    } else if (line.startsWith('- ')) {
      elements.push(<li key={key} className="text-[12px] text-gray-300 leading-relaxed ml-4 list-disc">{line.slice(2)}</li>);
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={key} className="border-l-2 border-purple-500 pl-3 my-2 text-[12px] text-purple-200 italic">{line.slice(2)}</blockquote>
      );
    } else if (line.trim()) {
      // Inline code + bold
      const parts = line
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      elements.push(
        <p key={key} className="text-[12px] text-gray-300 leading-relaxed my-1"
          dangerouslySetInnerHTML={{ __html: parts }} />
      );
    } else {
      elements.push(<div key={key} className="h-1" />);
    }
  });
  flush('end');

  return <div className="prose-sm">{elements}</div>;
}

export default function NotesApp() {
  const theme = useOSStore((s) => s.theme);
  const isLight = theme === 'light';

  const [notes, setNotes] = useState<Note[]>(NOTES_SEED);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selected, setSelected] = useState<Note | null>(notes[0] ?? null);

  useEffect(() => { fetchNotes(NOTES_SEED).then(setNotes); }, []);

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags)));

  const filtered = notes.filter((n) => {
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchTag = !activeTag || n.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  const containerBg = isLight ? 'bg-gray-50 text-gray-800' : 'bg-[#080912] text-white';
  const sidebarBg = isLight ? 'bg-white border-gray-200' : 'bg-[#0a0b10] border-white/5';
  const noteCardBg = isLight ? 'hover:bg-gray-100' : 'hover:bg-white/5';

  return (
    <div className={`flex h-full overflow-hidden ${containerBg}`}>
      {/* Sidebar */}
      <div className={`w-72 shrink-0 border-r flex flex-col overflow-hidden ${sidebarBg}`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="text-sm font-bold">Notes</h1>
          </div>
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-7 pr-3 py-2 text-[11px] rounded-lg border focus:outline-none focus:ring-1 focus:ring-purple-500/30 ${
                isLight ? 'bg-gray-100 border-gray-200 text-gray-800' : 'bg-white/5 border-white/10 text-white placeholder-gray-600'
              }`}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-[9px] text-gray-600 uppercase tracking-widest font-semibold mb-2">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition ${
                !activeTag ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'border-white/5 text-gray-500 hover:text-white'
              }`}
            >All</button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition ${
                  tag === activeTag ? getTagStyle(tag) : 'border-white/5 text-gray-500 hover:text-white'
                }`}
              >{tag}</button>
            ))}
          </div>
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filtered.map((note) => (
            <button
              key={note.id}
              onClick={() => setSelected(note)}
              className={`w-full text-left px-4 py-3 border-b border-white/5 transition ${noteCardBg} ${
                selected?.id === note.id ? 'bg-purple-500/10 border-l-2 border-l-purple-500' : ''
              }`}
            >
              {note.is_featured && (
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  <span className="text-[9px] text-amber-400 font-semibold">Featured</span>
                </div>
              )}
              <p className="text-[11px] font-semibold leading-snug line-clamp-2">{note.title}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Clock className="w-2.5 h-2.5 text-gray-600" />
                <span className="text-[9px] text-gray-500">{note.read_time_mins} min read</span>
                <span className="text-[9px] text-gray-600">· {new Date(note.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Note Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {selected ? (
          <div className="max-w-2xl mx-auto">
            <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-white mb-4 transition sm:hidden">
              <ChevronLeft className="w-3 h-3" /> All Notes
            </button>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {selected.tags.map((tag) => (
                <span key={tag} className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${getTagStyle(tag)}`}>
                  <Tag className="w-2.5 h-2.5 inline mr-1" />{tag}
                </span>
              ))}
            </div>
            <h1 className="text-xl font-bold leading-tight mb-1">{selected.title}</h1>
            <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-6">
              <span>{new Date(selected.date).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span>·</span>
              <span>{selected.read_time_mins} min read</span>
            </div>
            <div className="border-t border-white/5 pt-6">
              <RenderContent content={selected.content} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileText className="w-12 h-12 text-gray-700 mb-3" />
            <p className="text-sm text-gray-500">Select a note to read</p>
          </div>
        )}
      </div>
    </div>
  );
}

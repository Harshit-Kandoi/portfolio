import { BookOpen, StickyNote } from 'lucide-react';
import TabbedApp from './TabbedApp';
import BlogApp from './BlogApp';
import NotesApp from './NotesApp';

export default function WritingApp({ isMobileView }: { isMobileView?: boolean } = {}) {
  return (
    <TabbedApp
      appId="writing"
      tabs={[
        { id: 'blog', label: 'Blog', icon: BookOpen, render: () => <BlogApp isMobileView={isMobileView} /> },
        { id: 'notes', label: 'Dev notes', icon: StickyNote, render: () => <NotesApp isMobileView={isMobileView} /> },
      ]}
    />
  );
}

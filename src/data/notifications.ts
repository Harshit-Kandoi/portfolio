export interface ToastDef {
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'achievement' | 'error';
  category: 'system' | 'career' | 'portfolio' | 'gaming' | 'social' | 'funny';
  action?: string;
}

export const SYSTEM_NOTIFICATION_POOL: ToastDef[] = [
  {
    title: '🏆 Cloud ACE Certified',
    message: 'Google Cloud Associate Cloud Engineer credential verified! View awards.',
    type: 'achievement',
    category: 'career',
    action: 'achievements',
  },
  {
    title: '📝 Python UV Package Manager',
    message: 'Featured article on Towards AI: "From pip to uv — A Modern Take on Python Management".',
    type: 'info',
    category: 'portfolio',
    action: 'blog',
  },
  {
    title: '👁️ YOLOv5 ASL Detector',
    message: 'Real-time Sign Language detector with custom dataset & OpenCV pipeline.',
    type: 'success',
    category: 'portfolio',
    action: 'projects',
  },
  {
    title: '📦 Products Catalog Live',
    message: 'Explore developer tools, GCP backend services & AI models in Products.exe.',
    type: 'info',
    category: 'portfolio',
    action: 'products',
  },
  {
    title: '💼 Software & AI Engineer',
    message: 'Harshit builds GCP cloud workflows & ML models at ThoughtIn Solutions.',
    type: 'info',
    category: 'career',
    action: 'experience',
  },
  {
    title: '✉️ Direct Messaging Line',
    message: 'Send an encrypted message directly to Harshit via Contact.exe.',
    type: 'success',
    category: 'career',
    action: 'contact',
  },
  {
    title: '📄 2026 Resume Ready',
    message: 'Download or view Harshit Kandoi’s full Software & AI Engineer resume.',
    type: 'info',
    category: 'career',
    action: 'resume',
  },
  {
    title: '❤️ Candidate Match System',
    message: 'Swipe through hiring roles & evaluate role fit in Swipe.exe!',
    type: 'info',
    category: 'career',
    action: 'swipe',
  },
  {
    title: '⚔️ Bug Slayer RPG Profile',
    message: 'Battle code bugs, earn XP & level up your visitor badge in Gaming.exe!',
    type: 'achievement',
    category: 'gaming',
    action: 'gaming',
  },
  {
    title: '🎨 Theme Customizer',
    message: 'Switch between Midnight, Cyberpunk, Nord, Retro CRT & Glass themes in Settings.',
    type: 'info',
    category: 'system',
    action: 'settings',
  },
  {
    title: '💻 Interactive Terminal',
    message: 'Run CLI commands, inspect skills & execute scripts in Terminal.exe.',
    type: 'info',
    category: 'system',
    action: 'terminal',
  },
  {
    title: '🤖 AI Assistant Online',
    message: 'Ask Harshit’s AI assistant about projects, work experience, or custom queries.',
    type: 'info',
    category: 'system',
    action: 'ai',
  },
  {
    title: '🚀 Local GCP Emulator',
    message: 'Lightweight Docker container mocking Pub/Sub & Cloud Storage for offline dev.',
    type: 'success',
    category: 'portfolio',
    action: 'projects',
  },
  {
    title: '☕ Fuel the Engineering',
    message: 'Consider supporting open-source development in Buy Me A Coffee app!',
    type: 'info',
    category: 'funny',
    action: 'coffee',
  },
  {
    title: '🐍 Retro Snake Arcade',
    message: 'Test your reflexes and aim for the top score in Snake.exe!',
    type: 'info',
    category: 'gaming',
    action: 'snake',
  },
  {
    title: '⭐ GitHub Projects',
    message: 'Check out open-source repositories and cloud backend repos on GitHub.',
    type: 'info',
    category: 'portfolio',
    action: 'github',
  },
  {
    title: '⚡ Tech Stack & Skills',
    message: 'Inspect Python, GCP, FastAPI, TypeScript, React & Docker capabilities.',
    type: 'info',
    category: 'portfolio',
    action: 'skills',
  },
  {
    title: '🎓 GenAI & Cloud Certs',
    message: 'View Microsoft & LinkedIn Learning Generative AI professional credentials.',
    type: 'achievement',
    category: 'career',
    action: 'achievements',
  },
];

import { PORTFOLIO_META } from './config';

export interface ToastDef {
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'achievement' | 'error';
  category: 'system' | 'career' | 'portfolio' | 'gaming' | 'social' | 'funny';
  action?: string;
}

// Occasional "did you know" tips shown on the desktop. These are informational
// only ('info' type) so they never grant XP. Keep copy short and true.
export const SYSTEM_NOTIFICATION_POOL: ToastDef[] = [
  {
    title: '🏆 Google Cloud ACE',
    message: 'Harshit holds the Google Associate Cloud Engineer certification.',
    type: 'info',
    category: 'career',
    action: 'achievements',
  },
  {
    title: '📝 From pip to uv',
    message: 'Read his Towards AI article on modern Python project management.',
    type: 'info',
    category: 'portfolio',
    action: 'blog',
  },
  {
    title: '👁️ ASL Sign Detector',
    message: 'Real-time ASL letter detection with YOLOv5 and OpenCV.',
    type: 'info',
    category: 'portfolio',
    action: 'projects',
  },
  {
    title: '📦 Products',
    message: 'Tools and apps Harshit has built, in Products.exe.',
    type: 'info',
    category: 'portfolio',
    action: 'products',
  },
  {
    title: `💼 ${PORTFOLIO_META.role}`,
    message: `Currently at ${PORTFOLIO_META.company}. See Experience.exe.`,
    type: 'info',
    category: 'career',
    action: 'experience',
  },
  {
    title: '✉️ Say Hello',
    message: `${PORTFOLIO_META.availability}. Reach out via Contact.exe.`,
    type: 'info',
    category: 'career',
    action: 'contact',
  },
  {
    title: '📄 Resume',
    message: 'View or download the latest resume in Resume.pdf.',
    type: 'info',
    category: 'career',
    action: 'resume',
  },
  {
    title: '❤️ Role Match',
    message: 'Swipe through roles to see how his work fits each one.',
    type: 'info',
    category: 'career',
    action: 'swipe',
  },
  {
    title: '⚔️ Bug Slayer',
    message: 'Battle code bugs in the Arcade RPG.',
    type: 'info',
    category: 'gaming',
    action: 'gaming',
  },
  {
    title: '🎨 Themes',
    message: 'Try Cyberpunk, Nord, Retro CRT and more in Settings.',
    type: 'info',
    category: 'system',
    action: 'settings',
  },
  {
    title: '💻 Terminal',
    message: 'Type "help" in Terminal.exe to see what it can do.',
    type: 'info',
    category: 'system',
    action: 'terminal',
  },
  {
    title: '🤖 Ask the Chatbot',
    message: 'Ask about projects, skills or experience.',
    type: 'info',
    category: 'system',
    action: 'ai',
  },
  {
    title: '🚀 Local GCP Emulator',
    message: 'Dockerized Firestore and Pub/Sub emulation for offline cloud dev.',
    type: 'info',
    category: 'portfolio',
    action: 'projects',
  },
  {
    title: '🐍 Snake',
    message: 'Chase a high score in Arcade.exe.',
    type: 'info',
    category: 'gaming',
    action: 'snake',
  },
  {
    title: '⭐ GitHub',
    message: 'Browse his open-source repositories.',
    type: 'info',
    category: 'portfolio',
    action: 'github',
  },
  {
    title: '🎓 Certifications',
    message: 'Cloud, system design and more in Certifications.exe.',
    type: 'info',
    category: 'career',
    action: 'achievements',
  },
];

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useOSStore } from '../../store/useOSStore';
import {
  Heart,
  X,
  Star,
  Briefcase,
  ArrowLeft,
  CheckCircle,
  Clock,
  ChevronRight,
  Code2,
  Sparkles,
  Github,
  Linkedin,
  RotateCcw,
  Send,
  FileText,
  Zap,
  ExternalLink,
  Award,
  Terminal,
  Cpu,
  Database,
  Layers,
  Check,
  BookOpen,
  Target,
  Compass,
  AppWindow,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { trackEvent } from '../../utils/analytics';

// ─── Interfaces & Decoupled View Model Architecture ───────────────────────────
export interface ProjectItem {
  name: string;
  desc: string;
  stars?: number;
  lang: string;
  langColor: string;
  github?: string;
  demo?: string;
}

export interface BlogPostItem {
  title: string;
  excerpt: string;
  readingTime: number;
  claps?: number;
  link: string;
  category: string;
}

export interface ImpactMetric {
  icon: string;
  metric: string;
  label: string;
  category?: 'Projects' | 'Blogs' | 'Technologies' | 'Experience' | 'GitHub' | 'OpenSource' | 'AI Models' | 'Users';
}

export interface RelatedApp {
  id: string; // OS Window ID: 'ai' | 'blog' | 'terminal' | 'projects' | 'resume' | 'contact' | 'skills'
  name: string;
  icon: React.ReactNode;
}

export interface SkillItem {
  name: string;
  glow: string;
}

// 1. Role Domain Identity
export interface RoleIdentity {
  id: string;
  title: string;
  company: string;
  match: number;
  location: string;
  experience: string;
  availability: string;
  tagline: string;
  heroGradient: string;
  avatarBg: string;
  avatarIcon: React.ReactNode;
  bannerText: string;
  statusChip: string;
  resumeFileName: string;
  tailoredSkills: string[];
  verified: boolean;
  accentGlow: string;
}

// 2. Resolved Role Content
export interface RoleContent {
  bestSuitedFor: string;             // Positioning statement ("AI research labs & computer vision startups")
  idealRoles: string[];               // Matching recruiter titles (e.g., ["ML Engineer", "AI Engineer", "CV Specialist"])
  currentlyExploring: string[];       // Scannable topics (e.g., ["Local LLMs", "MCP", "PyTorch Optimization"])
  featuredProject?: ProjectItem;      // Primary flagship project
  recommendedRead?: BlogPostItem;    // Primary published article
  supportingProjects: ProjectItem[]; // 2-3 secondary domain projects
  stack: SkillItem[];                // Top 5 technologies with glow pills
  impactMetrics: ImpactMetric[];      // Categorized metric tiles
  relatedApps: RelatedApp[];          // Dynamic OS App navigation launchers
  aboutMe: string;
  whyFit: string;
}

// 3. Composite Resolved Role Profile (View Model passed to UI)
export interface Role extends RoleIdentity {
  content: RoleContent;
}

// ─── Curation Dataset (Real Candidate Content from Harshit Kandoi) ──────────────
const ROLES: Role[] = [
  {
    id: 'ml-engineer',
    title: 'Machine Learning Engineer',
    company: 'Computer Vision & AI Lab',
    match: 97,
    location: 'Remote / Jaipur',
    experience: '2+ Years',
    bannerText: '🔥 High-conviction candidate for CV & ML infrastructure.',
    resumeFileName: 'Harshit_Kandoi_ML_Engineer_Resume.pdf',
    tailoredSkills: ['PyTorch', 'YOLOv8', 'OpenCV', 'Scikit-learn', 'Model Optimization'],
    avatarBg: 'bg-gradient-to-tr from-purple-600 to-indigo-500 ring-4 ring-purple-400/30',
    avatarIcon: <Cpu className="w-9 h-9 text-white drop-shadow-md" />,
    availability: 'Immediate',
    tagline: 'End-to-end ML pipelines and Computer Vision models that scale.',
    heroGradient: 'from-purple-600 via-indigo-600 to-blue-600',
    verified: true,
    statusChip: '🔥 97% Match • Top 5%',
    accentGlow: 'rgba(99, 102, 241, 0.25)',
    content: {
      bestSuitedFor: 'AI research labs & computer vision startups building production ML tools',
      idealRoles: ['ML Engineer', 'AI Engineer', 'Computer Vision Specialist', 'NLP Engineer'],
      currentlyExploring: ['Local LLMs', 'LoRA Fine-tuning', 'PyTorch Inference Optimization'],
      featuredProject: {
        name: 'YOLO Plastic Classification',
        desc: 'Computer Vision model classifying plastic waste types (PET, HDPE) with ~75% accuracy for automated recycling systems.',
        stars: 142,
        lang: 'Python',
        langColor: '#3572A5',
        github: 'https://github.com/Harshit-Kandoi/Yolo_Plastic_Classification'
      },
      recommendedRead: {
        title: 'Mastering LoRA: A Gentle Path to Custom Large Language Models',
        excerpt: 'Step-by-step guide to fine-tuning LLMs with Low-Rank Adaptation (LoRA) — dramatically reducing compute requirements.',
        readingTime: 10,
        claps: 240,
        link: 'https://medium.com/towards-artificial-intelligence/mastering-lora-a-gentle-path-to-custom-large-language-models-a37e2d65b627',
        category: 'LLM & Fine-tuning'
      },
      supportingProjects: [
        {
          name: 'Snake Reinforcement Learning',
          desc: 'Deep Q-Network RL agent trained in PyTorch and Pygame to play Snake autonomously with high scores.',
          stars: 98,
          lang: 'Python',
          langColor: '#3572A5',
          github: 'https://github.com/Harshit-Kandoi/Snake-Reinforcement-Learning'
        },
        {
          name: 'ASL Letter Detection',
          desc: 'Real-time American Sign Language alphabet detection using YOLOv5 & PyTorch computer vision pipelines.',
          stars: 76,
          lang: 'Python',
          langColor: '#3572A5',
          github: 'https://github.com/Harshit-Kandoi/ASL-letter-detection'
        }
      ],
      stack: [
        { name: 'Python', glow: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 shadow-indigo-500/20' },
        { name: 'PyTorch', glow: 'bg-rose-500/15 border-rose-500/30 text-rose-300 shadow-rose-500/20' },
        { name: 'YOLOv8', glow: 'bg-amber-500/15 border-amber-500/30 text-amber-300 shadow-amber-500/20' },
        { name: 'OpenCV', glow: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 shadow-cyan-500/20' },
        { name: 'Scikit-learn', glow: 'bg-orange-500/15 border-orange-500/30 text-orange-300 shadow-orange-500/20' }
      ],
      impactMetrics: [
        { icon: '🎯', metric: '~75% Acc.', label: 'CV Detection Model', category: 'AI Models' },
        { icon: '⚡', metric: 'Deep Q-Net', label: 'Autonomous RL Agent', category: 'Projects' },
        { icon: '🧠', metric: '10k+ Readers', label: 'Towards AI Articles', category: 'Blogs' },
        { icon: '🎓', metric: '8.35 CGPA', label: 'B.Tech CSE Data Science', category: 'Experience' }
      ],
      relatedApps: [
        { id: 'ai', name: 'AI Assistant', icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" /> },
        { id: 'blog', name: 'Blog.exe', icon: <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> },
        { id: 'terminal', name: 'Terminal', icon: <Terminal className="w-3.5 h-3.5 text-emerald-400" /> }
      ],
      aboutMe: 'I design, train, and deploy end-to-end Machine Learning and Computer Vision models. Experienced in object detection (YOLO), reinforcement learning (DQN), and model optimization.',
      whyFit: 'Strong mathematical intuition, hands-on PyTorch experience, computer vision internship background at Anantagni, and published AI technical author.'
    }
  },
  {
    id: 'backend-engineer',
    title: 'Backend / API Engineer',
    company: 'ThoughtIn Solutions (Cloud Core)',
    match: 91,
    location: 'Gurugram / Remote',
    experience: '1.5+ Years',
    bannerText: '⭐ Production experience with GCP Pub/Sub & Cloud Functions.',
    resumeFileName: 'Harshit_Kandoi_Backend_Engineer_Resume.pdf',
    tailoredSkills: ['FastAPI', 'GCP Cloud Functions', 'Pub/Sub', 'Firestore', 'Docker'],
    avatarBg: 'bg-gradient-to-tr from-emerald-600 to-teal-500 ring-4 ring-emerald-400/30',
    avatarIcon: <Terminal className="w-9 h-9 text-white drop-shadow-md" />,
    availability: 'Within 2 Weeks',
    tagline: 'Clean APIs, event-driven cloud workflows, zero downtime.',
    heroGradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    verified: true,
    statusChip: '⚡ 91% Match • Cloud Systems',
    accentGlow: 'rgba(16, 185, 129, 0.25)',
    content: {
      bestSuitedFor: 'Scalable cloud systems & high-throughput API infrastructure teams',
      idealRoles: ['Backend Engineer', 'Platform Engineer', 'API Engineer', 'Cloud Engineer'],
      currentlyExploring: ['Async Worker Queues', 'Event-Driven GCP Architectures', 'Pydantic Schema Validation'],
      featuredProject: {
        name: 'Local GCP Emulator',
        desc: 'Dockerized local cloud dev environment simulating Firestore & Pub/Sub offline to speed up cloud dev workflows & cut testing costs.',
        stars: 184,
        lang: 'Python',
        langColor: '#3572A5',
        github: 'https://github.com/Harshit-Kandoi/Local-GCP-Emulator'
      },
      recommendedRead: {
        title: 'Docker Demystified: An In-Depth Guide for Students & Working Professionals',
        excerpt: 'Conquer container complexity covering Docker images, multi-stage builds, and Docker Compose for production deployments.',
        readingTime: 9,
        claps: 180,
        link: 'https://medium.com/p/4685cd6414aa',
        category: 'DevOps & Containers'
      },
      supportingProjects: [
        {
          name: 'Pydantic Schema Validator',
          desc: 'Dataclass serialization & high-throughput API payload parsing benchmarks for clean Python API layers.',
          stars: 92,
          lang: 'Python',
          langColor: '#3572A5',
          github: 'https://github.com/Harshit-Kandoi/pydantic-learning'
        },
        {
          name: 'Personal Budget Tracker CLI',
          desc: 'Command line application with SQLite database persistence and clean transaction isolation.',
          stars: 64,
          lang: 'Python',
          langColor: '#3572A5',
          github: 'https://github.com/Harshit-Kandoi/Personal-budget-tracker'
        }
      ],
      stack: [
        { name: 'Python', glow: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 shadow-indigo-500/20' },
        { name: 'FastAPI', glow: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-emerald-500/20' },
        { name: 'GCP Pub/Sub', glow: 'bg-blue-500/15 border-blue-500/30 text-blue-300 shadow-blue-500/20' },
        { name: 'Docker', glow: 'bg-sky-500/15 border-sky-500/30 text-sky-300 shadow-sky-500/20' },
        { name: 'Firestore', glow: 'bg-amber-500/15 border-amber-500/30 text-amber-300 shadow-amber-500/20' }
      ],
      impactMetrics: [
        { icon: '🚀', metric: '100% Offline', label: 'Local GCP Emulator', category: 'OpenSource' },
        { icon: '📜', metric: 'Pub/Sub + Cloud Fn', label: 'Event-Driven Microservices', category: 'Experience' },
        { icon: '🐳', metric: 'Containerized', label: 'Multi-stage Docker Builds', category: 'Technologies' },
        { icon: '⚡', metric: 'Non-blocking I/O', label: 'Async API Services', category: 'Projects' }
      ],
      relatedApps: [
        { id: 'terminal', name: 'Terminal.exe', icon: <Terminal className="w-3.5 h-3.5 text-emerald-400" /> },
        { id: 'projects', name: 'Projects.exe', icon: <Briefcase className="w-3.5 h-3.5 text-purple-400" /> },
        { id: 'resume', name: 'Resume.pdf', icon: <FileText className="w-3.5 h-3.5 text-rose-400" /> }
      ],
      aboutMe: 'Associate Software Engineer at ThoughtIn Solutions building internal cloud apps and event-driven backend workflows using React, Python, Java, Cloud Functions, Pub/Sub, and Firestore.',
      whyFit: 'Production experience engineering event-driven microservices on GCP, writing unit tests, creating Docker builds, and delivering self-documenting REST APIs.'
    }
  },
  {
    id: 'fullstack',
    title: 'Full-Stack Developer',
    company: 'Interactive Web Systems',
    match: 94,
    location: 'Remote',
    experience: '1.5+ Years',
    bannerText: '🚀 Creator of this entire Portfolio Operating System.',
    resumeFileName: 'Harshit_Kandoi_FullStack_Developer_Resume.pdf',
    tailoredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Zustand', 'Node.js', 'Electron'],
    avatarBg: 'bg-gradient-to-tr from-blue-600 to-purple-600 ring-4 ring-blue-400/30',
    avatarIcon: <Layers className="w-9 h-9 text-white drop-shadow-md" />,
    availability: 'Within 2 Weeks',
    tagline: 'From empty div to production. End-to-end web craftsmanship.',
    heroGradient: 'from-blue-600 via-violet-600 to-purple-600',
    verified: true,
    statusChip: '🛡️ 94% Match • OS Creator',
    accentGlow: 'rgba(139, 92, 246, 0.25)',
    content: {
      bestSuitedFor: 'High-velocity product teams wanting end-to-end web craftsmanship',
      idealRoles: ['Full Stack Engineer', 'Frontend Engineer', 'Web OS Architect', 'Product Developer'],
      currentlyExploring: ['Vite Engine Speed', 'Zustand State Architecture', 'Custom CSS Micro-animations'],
      featuredProject: {
        name: 'Portfolio OS',
        desc: 'Interactive desktop-inspired Web OS simulation featuring window management, built-in AI assistant, retro terminal, games, analytics, and performance optimization.',
        stars: 310,
        lang: 'TypeScript',
        langColor: '#3178c6',
        demo: 'https://harshitkandoi.in'
      },
      recommendedRead: {
        title: 'From Pip to UV: A Modern Take on Python Project Management',
        excerpt: 'Say goodbye to slow package resolution. Discover how UV, an ultra-fast Rust-based tool, is revolutionizing developer workflows.',
        readingTime: 12,
        claps: 150,
        link: 'https://medium.com/p/2f4a7fdec860',
        category: 'Developer Tooling'
      },
      supportingProjects: [
        {
          name: 'Pixel Buddy',
          desc: 'Desktop productivity companion built with Electron & React to remind developers to maintain healthy computer habits.',
          stars: 120,
          lang: 'TypeScript',
          langColor: '#3178c6',
          github: 'https://github.com/Harshit-Kandoi/pixel-buddy'
        },
        {
          name: 'Ecommerce Web App',
          desc: 'Full-stack shopping portal with interactive cart state, product catalogs, and Express backend order processing.',
          stars: 85,
          lang: 'JavaScript',
          langColor: '#f1e05a',
          github: 'https://github.com/Harshit-Kandoi/ecommerce'
        }
      ],
      stack: [
        { name: 'React', glow: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 shadow-cyan-500/20' },
        { name: 'TypeScript', glow: 'bg-blue-500/15 border-blue-500/30 text-blue-300 shadow-blue-500/20' },
        { name: 'Tailwind CSS', glow: 'bg-sky-500/15 border-sky-500/30 text-sky-300 shadow-sky-500/20' },
        { name: 'Zustand', glow: 'bg-purple-500/15 border-purple-500/30 text-purple-300 shadow-purple-500/20' },
        { name: 'Electron', glow: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 shadow-indigo-500/20' }
      ],
      impactMetrics: [
        { icon: '🚀', metric: 'Web OS', label: 'Creator of this OS App', category: 'Projects' },
        { icon: '🎨', metric: 'Vanilla CSS', label: 'Custom Design Token System', category: 'Technologies' },
        { icon: '⌨️', metric: 'Shortcuts', label: 'Full OS Keyboard Nav', category: 'Users' },
        { icon: '📱', metric: '100% Responsive', label: 'Flawless Desktop + Mobile UI', category: 'Experience' }
      ],
      relatedApps: [
        { id: 'projects', name: 'Projects.exe', icon: <Briefcase className="w-3.5 h-3.5 text-purple-400" /> },
        { id: 'gaming', name: 'Gaming.exe', icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" /> },
        { id: 'contact', name: 'Contact.exe', icon: <Send className="w-3.5 h-3.5 text-emerald-400" /> }
      ],
      aboutMe: 'Full-stack software developer experienced in crafting rich interactive user interfaces in React & TypeScript backed by robust Python, Node.js, and GCP cloud infrastructure.',
      whyFit: 'Creator of this complete Portfolio OS environment. Strong UI/UX polish, state management proficiency with Zustand, and proven frontend + backend experience.'
    }
  },
  {
    id: 'data-engineer',
    title: 'Data & AI Platform Engineer',
    company: 'Analytics & Pipeline Engine',
    match: 89,
    location: 'Remote / Jaipur',
    experience: '1+ Year',
    bannerText: '💡 B.Tech CSE Data Science Specialization (CGPA 8.35).',
    resumeFileName: 'Harshit_Kandoi_Data_Engineer_Resume.pdf',
    tailoredSkills: ['SQL', 'Python', 'Pandas', 'Power BI', 'ETL Pipelines', 'BigQuery'],
    avatarBg: 'bg-gradient-to-tr from-amber-600 to-orange-500 ring-4 ring-amber-400/30',
    avatarIcon: <Database className="w-9 h-9 text-white drop-shadow-md" />,
    availability: 'Within 2 Weeks',
    tagline: 'Clean data in. High-conviction decisions out.',
    heroGradient: 'from-amber-600 via-orange-600 to-red-600',
    verified: true,
    statusChip: '🧠 89% Match • BigQuery & SQL',
    accentGlow: 'rgba(245, 158, 11, 0.25)',
    content: {
      bestSuitedFor: 'Data platforms requiring clean analytics & automated ETL pipelines',
      idealRoles: ['Data Engineer', 'Analytics Engineer', 'ETL Developer', 'BI Specialist'],
      currentlyExploring: ['BigQuery Partitioning', 'Automated Web Scraping', 'dbt Data Modeling'],
      featuredProject: {
        name: 'Credit Card Financial Dashboard',
        desc: 'Interactive BI analytics suite in Power BI analyzing customer credit card spending behaviors, demographic breakdown, and financial KPIs.',
        stars: 135,
        lang: 'Power BI',
        langColor: '#f2c811',
        github: 'https://github.com/Harshit-Kandoi/Credit-Card-Financial-Dashboard'
      },
      recommendedRead: {
        title: 'Your Data is the New Currency: Are You Protecting It?',
        excerpt: 'Examine the privacy risks of digital footprints, data broker monetization, and essential strategies for safeguarding organizational data.',
        readingTime: 10,
        claps: 140,
        link: 'https://medium.com/p/016971ae0792',
        category: 'Data Science & Privacy'
      },
      supportingProjects: [
        {
          name: 'Pizza Sales Analytics Engine',
          desc: 'SQL query optimization and Power BI dashboard evaluating peak order volume, revenue distribution, and inventory velocity.',
          stars: 95,
          lang: 'SQL',
          langColor: '#e38c00',
          github: 'https://github.com/Harshit-Kandoi/pizza-sales'
        },
        {
          name: 'Crop Recommendation ML Pipeline',
          desc: 'Predictive agritech ETL pipeline analyzing soil metrics (N, P, K) with ~95% classification accuracy.',
          stars: 110,
          lang: 'Python',
          langColor: '#3572A5',
          github: 'https://github.com/Harshit-Kandoi/crops'
        }
      ],
      stack: [
        { name: 'SQL', glow: 'bg-amber-500/15 border-amber-500/30 text-amber-300 shadow-amber-500/20' },
        { name: 'Python', glow: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 shadow-indigo-500/20' },
        { name: 'Pandas', glow: 'bg-orange-500/15 border-orange-500/30 text-orange-300 shadow-orange-500/20' },
        { name: 'Power BI', glow: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300 shadow-yellow-500/20' },
        { name: 'BigQuery', glow: 'bg-blue-500/15 border-blue-500/30 text-blue-300 shadow-blue-500/20' }
      ],
      impactMetrics: [
        { icon: '📊', metric: '~95% Acc.', label: 'Crop ML Model Precision', category: 'Experience' },
        { icon: '🔍', metric: 'Zero Nulls', label: 'Strict Schema Validation', category: 'Technologies' },
        { icon: '🎓', metric: 'B.Tech CSE', label: 'Data Science Specialization', category: 'Experience' },
        { icon: '💡', metric: 'Power BI + SQL', label: 'Production BI Dashboards', category: 'Projects' }
      ],
      relatedApps: [
        { id: 'skills', name: 'Skills.exe', icon: <Cpu className="w-3.5 h-3.5 text-amber-400" /> },
        // { id: 'publications', name: 'Papers.exe', icon: <FileText className="w-3.5 h-3.5 text-amber-400" /> },
        { id: 'blog', name: 'Blog.exe', icon: <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> },
        { id: 'projects', name: 'Projects.exe', icon: <Briefcase className="w-3.5 h-3.5 text-purple-400" /> }
      ],
      aboutMe: 'B.Tech CSE graduate in Data Science (CGPA 8.35/10) with hands-on experience building structured ETL pipelines, SQL aggregation scripts, and BI dashboards.',
      whyFit: 'Strong SQL mastery, experience handling agricultural & financial datasets, data engineering internship at Upflairs, and analytical approach to schema design.'
    }
  },
  {
    id: 'ai-product',
    title: 'AI Product Engineer',
    company: 'Generative AI & UX Lab',
    match: 96,
    location: 'Remote / Jaipur',
    experience: '1.5+ Years',
    bannerText: '⚡ Founder of Financial Mirror & Generative AI builder.',
    resumeFileName: 'Harshit_Kandoi_AI_Product_Engineer_Resume.pdf',
    tailoredSkills: ['LangChain', 'OpenAI API', 'RAG Architecture', 'React', 'FastAPI', 'Vector Stores'],
    avatarBg: 'bg-gradient-to-tr from-pink-600 to-rose-500 ring-4 ring-pink-400/30',
    avatarIcon: <Sparkles className="w-9 h-9 text-white drop-shadow-md" />,
    availability: 'Immediate',
    tagline: 'Turning AI capabilities into intuitive, user-loved products.',
    heroGradient: 'from-pink-600 via-rose-500 to-fuchsia-600',
    verified: true,
    statusChip: '🎯 96% Match • AI + UX Creator',
    accentGlow: 'rgba(236, 72, 153, 0.25)',
    content: {
      bestSuitedFor: 'AI-first startups bridging cutting-edge LLMs with human-centered UX',
      idealRoles: ['AI Product Engineer', 'Generative AI Developer', 'LLM UX Specialist', 'Product Builder'],
      currentlyExploring: ['RAG Pipelines with Vector Memory', 'Agentic Function Calling', 'Prompt Engineering'],
      featuredProject: {
        name: 'Financial Mirror',
        desc: 'AI-powered financial awareness platform helping users analyze spending habits, financial personality, and future planning using machine learning.',
        stars: 240,
        lang: 'Python',
        langColor: '#3572A5',
        demo: 'https://mirror.harshitkandoi.in'
      },
      recommendedRead: {
        title: 'Building Smarter LLMs with LangChain and RAG: A Beginner’s Guide',
        excerpt: 'Master Retrieval-Augmented Generation (RAG) and learn how LangChain connects external vector data to LLMs to build context-aware AI apps.',
        readingTime: 15,
        claps: 310,
        link: 'https://pub.towardsai.net/building-smarter-llms-with-langchain-and-rag-a-beginners-guide-1fdfbac6c672',
        category: 'LLM & RAG'
      },
      supportingProjects: [
        {
          name: 'Portfolio OS AI Assistant',
          desc: 'Built-in natural language AI assistant supporting conversational commands, OS window navigation, and real-time contextual help.',
          stars: 310,
          lang: 'TypeScript',
          langColor: '#3178c6',
          demo: 'https://harshitkandoi.in'
        },
        {
          name: 'Movie Recommender System',
          desc: 'ML-based recommendation engine built with Streamlit suggesting movies based on SVD matrix factorization.',
          stars: 89,
          lang: 'Python',
          langColor: '#3572A5',
          github: 'https://github.com/Harshit-Kandoi/movie-recommender'
        }
      ],
      stack: [
        { name: 'LangChain', glow: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-emerald-500/20' },
        { name: 'OpenAI API', glow: 'bg-pink-500/15 border-pink-500/30 text-pink-300 shadow-pink-500/20' },
        { name: 'Python', glow: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 shadow-indigo-500/20' },
        { name: 'React', glow: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 shadow-cyan-500/20' },
        { name: 'FastAPI', glow: 'bg-teal-500/15 border-teal-500/30 text-teal-300 shadow-teal-500/20' }
      ],
      impactMetrics: [
        { icon: '✨', metric: 'AI Startup', label: 'Founder of Financial Mirror', category: 'Projects' },
        { icon: '🤖', metric: 'RAG & Agents', label: 'LangChain Vector Retrieval', category: 'Technologies' },
        { icon: '📚', metric: 'Top AI Author', label: 'Published on Towards AI', category: 'Blogs' },
        { icon: '⚡', metric: '<400ms Latency', label: 'Context Retrieval Speed', category: 'AI Models' }
      ],
      relatedApps: [
        { id: 'ai', name: 'AI Assistant', icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" /> },
        { id: 'blog', name: 'Blog.exe', icon: <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> },
        { id: 'contact', name: 'Contact.exe', icon: <Send className="w-3.5 h-3.5 text-emerald-400" /> }
      ],
      aboutMe: 'I build intelligent products at the intersection of Generative AI, natural language processing, and intuitive user interface design. Creator of Financial Mirror and Portfolio OS AI Assistant.',
      whyFit: 'Proven capability shipping AI products end-to-end. Author of viral RAG technical guides on Towards AI, with a strong focus on user experience.'
    }
  }
];

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export default function PortfolioSwipe(props?: { isMobileView?: boolean }) {
  const theme = useOSStore((s) => s.theme);
  const unlockAchievement = useOSStore((s) => s.unlockAchievement);
  const addNotification   = useOSStore((s) => s.addNotification);
  const openWindow        = useOSStore((s) => s.openWindow);

  const [stack, setStack]               = useState<Role[]>(ROLES);
  const [liked, setLiked]               = useState<Role[]>([]);
  const [selected, setSelected]         = useState<Role | null>(null);

  // Global App State for Match Overlay & Non-blocking Fast Morph Loader
  const [matchOverlay, setMatchOverlay] = useState<Role | null>(null);
  const [launchingRole, setLaunchingRole] = useState<Role | null>(null);
  const [launchProgress, setLaunchProgress] = useState<number>(0);
  const [resumeDownloading, setResumeDownloading] = useState<string | null>(null);

  const [swiping, setSwiping]           = useState<'left' | 'right' | null>(null);
  const [swipeCount, setSwipeCount]     = useState(0);

  const cardRef = useRef<HTMLDivElement>(null);
  const totalRoles = ROLES.length;
  const currentRole = stack[0];

  // Motion values for card drag physics & peeking underneath card
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const passOpacity = useTransform(x, [-20, -120], [0, 1]);
  
  const xAbs = useTransform(x, (val) => Math.abs(val));
  const peekScale = useTransform(xAbs, [0, 150], [0.94, 0.99]);
  const peekY = useTransform(xAbs, [0, 150], [12, 0]);
  const peekOpacity = useTransform(xAbs, [0, 150], [0.6, 0.95]);

  const isLight = theme === 'light';
  const bg = isLight
    ? 'bg-slate-50 text-slate-900'
    : 'bg-gradient-to-b from-slate-950 via-[#0d0a1a] to-slate-950 text-white';

  const handleViewProfileDirect = (role: Role) => {
    setSelected(role);
    trackEvent('swipe_profile_open', { role_title: role.title });
  };

  // Fast non-blocking morph loader (Launch Candidate.exe [35% -> 75% -> 100%] in 350ms)
  const launchCandidateProfile = (role: Role) => {
    setMatchOverlay(null);
    setLaunchingRole(role);
    setLaunchProgress(35);

    setTimeout(() => setLaunchProgress(75), 120);
    setTimeout(() => setLaunchProgress(100), 240);
    setTimeout(() => {
      setLaunchingRole(null);
      setSelected(role);
      trackEvent('swipe_profile_launch', { role_title: role.title });
    }, 350);
  };

  // Tailored resume download helper
  const handleDownloadTailoredResume = (role: Role) => {
    setResumeDownloading(role.resumeFileName);
    setTimeout(() => {
      setResumeDownloading(null);
      openWindow('resume');
      addNotification(
        `📄 Tailored Resume Prepared: ${role.resumeFileName}`,
        `Customized for ${role.title} tech stack.`,
        'success',
        'career'
      );
    }, 320);
  };

  const swipe = useCallback((direction: 'left' | 'right') => {
    if (stack.length === 0 || swiping) return;
    setSwiping(direction);
    const current = stack[0];

    setTimeout(() => {
      setSwiping(null);
      x.set(0);
      const rest = stack.slice(1);
      setStack(rest);
      setSwipeCount((c) => c + 1);

      if (direction === 'right') {
        setLiked((l) => [current, ...l]);
        trackEvent('swipe_role_like', { role_title: current.title, match_percentage: current.match });
        setMatchOverlay(current);
      } else {
        trackEvent('swipe_role_pass', { role_title: current.title });
        addNotification(`👋 Passed: ${current.title}`, 'Swiped pass', 'info', 'portfolio');
      }

      if (rest.length === 0) {
        unlockAchievement('tinder_swiper');
        addNotification('🎉 All roles swiped!', 'You\'ve explored all available engineering roles.', 'achievement', 'career');
      }
    }, 300);
  }, [stack, swiping, x, addNotification, unlockAchievement]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (selected) {
        if (e.key === 'Escape') setSelected(null);
        return;
      }
      if (matchOverlay) {
        if (e.key === 'Escape') setMatchOverlay(null);
        if (e.key === 'Enter') {
          launchCandidateProfile(matchOverlay);
        }
        return;
      }

      if (stack.length === 0) return;

      if (e.key === 'ArrowLeft' || e.key === 'a') {
        e.preventDefault();
        swipe('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        e.preventDefault();
        swipe('right');
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleViewProfileDirect(stack[0]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stack, selected, matchOverlay, swipe]);

  // ─── Detailed Profile View ──────────────────────────────────────────────────
  if (selected) {
    const { content } = selected;
    return (
      <div className={`flex flex-col flex-grow h-full overflow-y-auto custom-scrollbar ${bg}`}>
        {/* Profile Hero Header - Cohesive Tight Unit (8-12px Title/Subtitle spacing) */}
        <div className={`relative bg-gradient-to-br ${selected.heroGradient} p-5 sm:p-7 flex flex-col items-center shrink-0 border-b border-white/10 shadow-2xl space-y-2.5`}>
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 left-4 p-2 rounded-full bg-black/25 hover:bg-black/40 text-white transition active:scale-95 flex items-center space-x-1 border border-white/10 z-20"
            title="Back to Matchmaker (Esc)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[10.5px] font-bold pr-1 hidden sm:inline">Back</span>
          </button>

          {/* Developer Avatar Vector Badge */}
          <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-3xl ${selected.avatarBg} flex items-center justify-center shadow-2xl animate-float mt-1`}>
            {selected.avatarIcon}
          </div>

          {/* Title & Subtitle Block - Tight 8-12px vertical rhythm */}
          <div className="text-center min-w-0 px-2 space-y-1 w-full flex flex-col items-center justify-center">
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight break-words text-center w-full">{selected.title}</h2>
            <p className="text-purple-200 text-xs sm:text-sm font-semibold tracking-wide text-center w-full">{selected.company}</p>
          </div>

          {/* Best Suited For Positioning Chip */}
          <div className="bg-black/35 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-md max-w-md text-center">
            <Compass className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
            <span className="text-[10.5px] text-cyan-100 font-bold tracking-wide leading-tight line-clamp-1">
              Best Suited For: {content.bestSuitedFor}
            </span>
          </div>

          {/* Match Score & Verified Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
            <div className="flex items-center space-x-1.5 bg-rose-500 text-white rounded-full px-3 py-0.5 text-xs font-black shadow-lg">
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>{selected.match}% Match Score</span>
            </div>
            {selected.verified && (
              <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-md rounded-full px-3 py-0.5 border border-white/20">
                <CheckCircle className="w-3.5 h-3.5 text-cyan-300" />
                <span className="text-[10px] text-white font-bold tracking-wide">Verified Candidate</span>
              </div>
            )}
          </div>

          {/* Metadata Strip */}
          <div className="flex items-center space-x-4 text-white/80 text-xs font-medium pt-0.5">
            <span className="flex items-center space-x-1"><Briefcase className="w-3.5 h-3.5 text-white/70" /><span>{selected.experience}</span></span>
            <span className="flex items-center space-x-1"><Clock className="w-3.5 h-3.5 text-white/70" /><span>{selected.availability}</span></span>
          </div>
        </div>

        {/* Profile Content Body */}
        <div className="p-5 max-w-xl mx-auto w-full space-y-5">
          {/* Ideal Roles & Best Fit */}
          <Section title="Ideal Matching Roles" icon={<Target className="w-4 h-4 text-cyan-400" />}>
            <div className="flex flex-wrap gap-1.5 bg-slate-900/80 p-3.5 rounded-2xl border border-white/5 shadow-md">
              {content.idealRoles.map((roleTitle) => (
                <span key={roleTitle} className="text-xs font-bold px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 flex items-center space-x-1">
                  <Check className="w-3 h-3 text-cyan-400" />
                  <span>{roleTitle}</span>
                </span>
              ))}
            </div>
          </Section>

          <hr className="border-white/5" />

          {/* Currently Exploring (Scannable Badges) */}
          <Section title="Currently Exploring" icon={<TrendingUp className="w-4 h-4 text-purple-400" />}>
            <div className="flex flex-wrap gap-2 bg-slate-900/80 p-3.5 rounded-2xl border border-white/5 shadow-md">
              {content.currentlyExploring.map((item) => (
                <span key={item} className="text-xs font-bold px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-200">
                  ⚡ {item}
                </span>
              ))}
            </div>
          </Section>

          <hr className="border-white/5" />

          {/* About Section */}
          <Section title="Candidate Overview" icon={<Code2 className="w-4 h-4 text-purple-400" />}>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300 font-normal bg-slate-900/80 p-4 rounded-2xl border border-white/5 shadow-md">
              {content.aboutMe}
            </p>
          </Section>

          <hr className="border-white/5" />

          {/* Why Fit Section */}
          <Section title="Why Fit For This Role" icon={<Star className="w-4 h-4 text-amber-400" />}>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300 font-normal bg-slate-900/80 p-4 rounded-2xl border border-white/5 shadow-md">
              {content.whyFit}
            </p>
          </Section>

          <hr className="border-white/5" />

          {/* Interactive Skill Chips */}
          <Section title="Favorite Stack" icon={<Sparkles className="w-4 h-4 text-cyan-400" />}>
            <div className="flex flex-wrap gap-2">
              {content.stack.map((skill) => (
                <motion.span
                  key={skill.name}
                  whileHover={{ y: -3, scale: 1.06 }}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border shadow-md transition cursor-default ${skill.glow}`}
                >
                  {skill.name}
                </motion.span>
              ))}
            </div>
          </Section>

          <hr className="border-white/5" />

          {/* 🏆 Featured Project (Flagship) */}
          {content.featuredProject && (
            <>
              <Section title="Featured Project" icon={<Award className="w-4 h-4 text-amber-400" />}>
                <div className="p-4 bg-gradient-to-br from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 rounded-2xl shadow-xl space-y-3">
                  <div className="flex items-start justify-between min-w-0">
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 font-black px-2 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wide">
                          Flagship
                        </span>
                        <span className="text-[10px] text-purple-300 font-bold">⭐ Featured Work</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-white truncate mt-1">{content.featuredProject.name}</h3>
                    </div>
                    {content.featuredProject.demo ? (
                      <a
                        href={content.featuredProject.demo}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/30 transition shrink-0"
                        title="Open Demo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : content.featuredProject.github ? (
                      <a
                        href={content.featuredProject.github}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/30 transition shrink-0"
                        title="View GitHub Repository"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed break-words">{content.featuredProject.desc}</p>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-2 border-t border-white/10">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: content.featuredProject.langColor }} />
                      <span className="text-slate-200">{content.featuredProject.lang}</span>
                    </span>
                  </div>
                </div>
              </Section>
              <hr className="border-white/5" />
            </>
          )}

          {/* ✍️ Recommended Read (Published Article) - Resilient fallback if missing */}
          {content.recommendedRead && (
            <>
              <Section title="Recommended Read" icon={<BookOpen className="w-4 h-4 text-emerald-400" />}>
                <a
                  href={content.recommendedRead.link}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-4 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/60 hover:border-emerald-500/50 rounded-2xl transition group shadow-lg space-y-2"
                >
                  <div className="flex items-center justify-between min-w-0">
                    <span className="text-[9.5px] bg-emerald-500/20 text-emerald-300 font-black px-2 py-0.5 rounded-full border border-emerald-500/30">
                      {content.recommendedRead.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{content.recommendedRead.readingTime} min read</span>
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition break-words">
                    {content.recommendedRead.title}
                  </h3>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed break-words">
                    {content.recommendedRead.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-2 border-t border-white/5">
                    <span className="text-emerald-400 flex items-center space-x-1">
                      <span>Read on Medium / Towards AI</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition" />
                  </div>
                </a>
              </Section>
              <hr className="border-white/5" />
            </>
          )}

          {/* Supporting Projects (Strict text containment) */}
          <Section title="Supporting Projects" icon={<Briefcase className="w-4 h-4 text-indigo-400" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-stretch">
              {content.supportingProjects.map((p) => (
                <motion.div
                  key={p.name}
                  whileHover={{ y: -3, scale: 1.01 }}
                  onClick={() => {
                    if (p.github) window.open(p.github, '_blank');
                    else openWindow('projects');
                  }}
                  className="p-3.5 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/50 hover:border-purple-500/50 rounded-2xl transition cursor-pointer flex flex-col justify-between space-y-2 group shadow-lg min-w-0 overflow-hidden h-full"
                >
                  <div className="flex items-start justify-between min-w-0">
                    <div className="flex items-center space-x-1.5 font-bold text-xs text-white group-hover:text-purple-300 transition min-w-0 flex-1 pr-1">
                      <Github className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="truncate min-w-0">{p.name}</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-purple-400 transition shrink-0" />
                  </div>
                  <p className="text-[10.5px] text-slate-300 line-clamp-2 leading-snug break-words">{p.desc}</p>
                  <div className="flex items-center justify-between text-[9.5px] font-bold text-slate-400 pt-1.5 border-t border-white/5">
                    <span className="flex items-center space-x-1 min-w-0">
                      <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: p.langColor }} />
                      <span className="truncate">{p.lang}</span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>

          <hr className="border-white/5" />

          {/* Metric Tiles (Impact Metrics) */}
          <Section title="Impact Metrics" icon={<Zap className="w-4 h-4 text-pink-400" />}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {content.impactMetrics.map((fact, idx) => (
                <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center text-center space-y-1 hover:bg-white/10 transition shadow-sm min-w-0">
                  <div className="text-xl">{fact.icon}</div>
                  <div className="text-xs font-black text-white truncate max-w-full">{fact.metric}</div>
                  <div className="text-[9px] text-slate-400 font-medium leading-tight line-clamp-2">{fact.label}</div>
                </div>
              ))}
            </div>
          </Section>

          <hr className="border-white/5" />

          {/* 🔗 Related OS Apps Navigation Launcher */}
          <Section title="Related OS Apps" icon={<AppWindow className="w-4 h-4 text-cyan-400" />}>
            <div className="grid grid-cols-3 gap-2">
              {content.relatedApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => openWindow(app.id)}
                  className="flex items-center justify-center space-x-1.5 bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/40 p-2.5 rounded-xl transition text-xs font-bold text-slate-200 hover:text-white active:scale-95 shadow-sm"
                >
                  {app.icon}
                  <span className="truncate">{app.name}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* Context-Aware Resume Action */}
          <div className="p-4 bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white">Context-Aware Resume</span>
              </div>
              <span className="text-[9px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/30">
                Tailored Spec
              </span>
            </div>
            <p className="text-[10.5px] text-slate-300 leading-snug">
              Emphasizes <strong className="text-purple-300">{selected.tailoredSkills.join(', ')}</strong>.
            </p>
            <button
              onClick={() => handleDownloadTailoredResume(selected)}
              disabled={!!resumeDownloading}
              className="w-full mt-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg active:scale-95 disabled:opacity-50"
            >
              {resumeDownloading === selected.resumeFileName ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Preparing {selected.resumeFileName}...</span>
                </>
              ) : (
                <>
                  <span>📄 Open {selected.resumeFileName}</span>
                </>
              )}
            </button>
          </div>

          {/* Connect & Take Action Buttons */}
          <div className="pt-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Connect & Take Action</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => openWindow('contact')}
                className="flex items-center justify-center space-x-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold py-2.5 px-3 rounded-xl hover:opacity-90 active:scale-95 transition shadow-lg"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Contact</span>
              </button>
              <button
                onClick={() => openWindow('resume')}
                className="flex items-center justify-center space-x-1.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-bold py-2.5 px-3 rounded-xl active:scale-95 transition shadow"
              >
                <FileText className="w-3.5 h-3.5 text-rose-400" />
                <span>Resume</span>
              </button>
              <button
                onClick={() => window.open('https://linkedin.com', '_blank')}
                className="flex items-center justify-center space-x-1.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-bold py-2.5 px-3 rounded-xl active:scale-95 transition shadow"
              >
                <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                <span>LinkedIn</span>
              </button>
              <button
                onClick={() => window.open('https://github.com/Harshit-Kandoi', '_blank')}
                className="flex items-center justify-center space-x-1.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-bold py-2.5 px-3 rounded-xl active:scale-95 transition shadow"
              >
                <Github className="w-3.5 h-3.5 text-purple-400" />
                <span>GitHub</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Swipe View Deck ──────────────────────────────────────────────────
  return (
    <div className={`flex flex-col flex-grow h-full relative overflow-hidden select-none ${isLight ? 'bg-gray-50 text-slate-900' : 'bg-slate-950 text-white'}`}>
      {/* Background Particles & Grid */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Top Header Bar */}
      <div className={`flex items-center justify-between px-5 py-3 border-b shrink-0 z-20 backdrop-blur-md ${
        isLight ? 'bg-white/90 border-slate-200 text-slate-900 shadow-xs' : 'bg-slate-950/60 border-white/10 text-white'
      }`}>
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0 animate-pulse">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <h2 className={`text-xs sm:text-sm font-black tracking-tight truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>Engineering Matchmaker</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            </div>
            <p className={`text-[9.5px] font-medium truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Role-based developer specialization profiles</p>
          </div>
        </div>

        {/* Progress & Counter */}
        <div className="flex items-center space-x-3 shrink-0 ml-2">
          <div className="hidden sm:flex items-center space-x-1">
            {ROLES.map((r, i) => {
              const isSwiped = i < swipeCount;
              return (
                <span
                  key={r.id}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isSwiped ? 'bg-purple-500 scale-90' : i === swipeCount ? 'bg-rose-400 scale-125 ring-2 ring-rose-400/30' : 'bg-slate-700'
                  }`}
                />
              );
            })}
          </div>

          <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-[10.5px] font-bold text-slate-300 shadow-sm flex items-center space-x-1">
            {liked.length > 0 && <span className="text-rose-400 font-black pr-1">{liked.length} ❤️</span>}
            <span className="text-white font-black">{stack.length}</span>
            <span className="text-slate-500">/ {totalRoles} Remaining</span>
          </div>
        </div>
      </div>

      {/* Role Banner Strip */}
      {currentRole && stack.length > 0 && (
        <div className="px-5 py-1.5 bg-purple-950/40 border-b border-purple-500/10 shrink-0 z-20 flex items-center justify-center space-x-1.5">
          <span className="text-[10px] text-purple-300 font-medium tracking-wide text-center">
            {currentRole.bannerText}
          </span>
        </div>
      )}

      {/* Main Card Viewport */}
      <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 relative z-10 overflow-hidden">
        {stack.length === 0 ? (
          /* Stack Complete Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center space-y-4 text-center py-8 px-6 max-w-sm bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md"
          >
            <div className="text-6xl animate-bounce">🎉</div>
            <h3 className="text-xl font-black text-white tracking-tight">Stack Complete!</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {liked.length > 0
                ? `You shortlisted ${liked.length} engineering role${liked.length > 1 ? 's' : ''}. Open Contact or Resume to get in touch!`
                : 'You passed on all roles. Click below to restart the stack and explore again!'}
            </p>
            
            <div className="flex flex-col w-full space-y-2 pt-2">
              {liked.length > 0 && (
                <button
                  onClick={() => openWindow('contact')}
                  className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs font-bold py-2.5 rounded-xl hover:opacity-90 transition active:scale-95 shadow-lg"
                >
                  💌 Send a Message
                </button>
              )}
              <button
                onClick={() => openWindow('resume')}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold py-2.5 rounded-xl transition active:scale-95"
              >
                📄 View Resume
              </button>
              <button
                onClick={() => {
                  setStack(ROLES);
                  setLiked([]);
                  setSwipeCount(0);
                }}
                className="flex items-center justify-center space-x-1 text-[11px] text-purple-400 hover:text-purple-300 font-bold pt-1 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restart Stack</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Cards Stack Container */}
            <div className="relative w-72 sm:w-80 h-[430px] flex items-center justify-center">
              {/* Card #3 */}
              {stack[2] && (
                <div
                  className={`absolute inset-0 rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br ${stack[2].heroGradient} border border-white/10 opacity-35 pointer-events-none`}
                  style={{
                    transform: 'translateY(24px) scale(0.88) rotate(-3deg)',
                    zIndex: 1,
                  }}
                />
              )}

              {/* Card #2 */}
              {stack[1] && (
                <motion.div
                  className={`absolute inset-0 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${stack[1].heroGradient} border border-white/15 pointer-events-none`}
                  style={{
                    scale: peekScale,
                    y: peekY,
                    opacity: peekOpacity,
                    rotate: 2.5,
                    zIndex: 2,
                  }}
                >
                  <div className="h-full w-full bg-black/40 backdrop-blur-[2px] flex flex-col justify-end p-5">
                    <span className="text-xs text-white/70 font-bold">{stack[1].title}</span>
                  </div>
                </motion.div>
              )}

              {/* Top Active Card */}
              <motion.div
                ref={cardRef}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.65}
                style={{ x, rotate, zIndex: 10 }}
                onDragEnd={(event, info) => {
                  const threshold = 120;
                  if (info.offset.x > threshold) {
                    swipe('right');
                  } else if (info.offset.x < -threshold) {
                    swipe('left');
                  }
                }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleViewProfileDirect(currentRole)}
                className={`absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border border-white/20 cursor-grab active:cursor-grabbing bg-slate-900 transition-shadow duration-200 ${
                  swiping === 'right' ? 'translate-x-[450px] rotate-25 opacity-0 transition-all duration-300' :
                  swiping === 'left'  ? '-translate-x-[450px] -rotate-25 opacity-0 transition-all duration-300' : ''
                }`}
              >
                {/* LIKE Stamp */}
                <motion.div
                  style={{ opacity: likeOpacity }}
                  className="absolute top-6 left-6 border-4 border-emerald-400 text-emerald-400 font-black text-2xl px-3 py-1 rounded-xl rotate-[-15deg] z-30 pointer-events-none tracking-wider shadow-lg bg-emerald-950/70 backdrop-blur-sm"
                >
                  MATCH ❤️
                </motion.div>

                {/* PASS Stamp */}
                <motion.div
                  style={{ opacity: passOpacity }}
                  className="absolute top-6 right-6 border-4 border-rose-500 text-rose-500 font-black text-2xl px-3 py-1 rounded-xl rotate-[15deg] z-30 pointer-events-none tracking-wider shadow-lg bg-rose-950/70 backdrop-blur-sm"
                >
                  PASS ❌
                </motion.div>

                {/* Card Hero Header */}
                <div className={`h-48 bg-gradient-to-br ${currentRole.heroGradient} p-4 flex flex-col justify-between relative shadow-inner`}>
                  <div className="flex items-start justify-between z-10">
                    <span className="bg-black/40 backdrop-blur-md border border-white/20 text-white rounded-full px-2.5 py-0.5 text-[9.5px] font-black tracking-wide shadow-md">
                      {currentRole.statusChip}
                    </span>
                    {currentRole.verified && (
                      <span className="bg-white/20 backdrop-blur-md rounded-full px-2 py-0.5 flex items-center space-x-1 border border-white/10">
                        <CheckCircle className="w-3 h-3 text-cyan-300" />
                        <span className="text-[8.5px] text-white font-bold">Verified</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center z-10 -mt-1">
                    <div className={`w-16 h-16 rounded-2xl ${currentRole.avatarBg} flex items-center justify-center shadow-2xl`}>
                      {currentRole.avatarIcon}
                    </div>
                  </div>

                  <div className="z-10 flex items-center justify-between text-white/90 text-[10px] font-bold">
                    <span className="bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-md">⏱ {currentRole.availability}</span>
                    <span className="bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-md">📍 {currentRole.location}</span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0d0a1a] to-transparent pointer-events-none" />
                </div>

                {/* Card Body */}
                <div className="bg-[#0d0a1a] p-4 flex flex-col justify-between h-[238px] border-t border-white/10 text-center">
                  <div className="flex flex-col items-center justify-center w-full">
                    <h3 className="text-base font-black text-white truncate tracking-tight w-full text-center">{currentRole.title}</h3>
                    <p className="text-[11px] text-purple-400 font-bold mt-0.5 w-full text-center">{currentRole.company}</p>
                    <p className="text-[11px] text-slate-300 italic leading-snug line-clamp-2 mt-2 font-normal w-full text-center">
                      &quot;{currentRole.tagline}&quot;
                    </p>
                  </div>

                  {/* Stack Badges */}
                  <div className="flex flex-wrap justify-center gap-1.5 my-2">
                    {currentRole.content.stack.slice(0, 4).map((s) => (
                      <span key={s.name} className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border ${s.glow}`}>
                        {s.name}
                      </span>
                    ))}
                    {currentRole.content.stack.length > 4 && (
                      <span className="text-[8.5px] text-slate-500 self-center font-bold">
                        +{currentRole.content.stack.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-center space-x-1.5 text-[9.5px] text-slate-400 font-bold">
                    <span>Click or Enter to view full profile</span>
                    <ChevronRight className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Swipe Action Buttons */}
            <div className="flex items-center space-x-6 mt-6 z-20">
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => swipe('left')}
                className="w-14 h-14 rounded-full bg-slate-900/90 border border-rose-500/30 text-rose-500 hover:text-rose-400 hover:bg-rose-500/20 flex items-center justify-center shadow-xl hover:shadow-rose-500/20 transition active:scale-95 group"
                title="Pass (← or A)"
                aria-label="Pass role"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition duration-200" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleViewProfileDirect(currentRole)}
                className="w-16 h-16 rounded-full bg-slate-900/90 border border-purple-500/40 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 flex items-center justify-center shadow-2xl hover:shadow-purple-500/30 transition active:scale-95 group"
                title="View Profile (Enter or Space)"
                aria-label="View role details"
              >
                <Star className="w-7 h-7 fill-purple-400/30 group-hover:rotate-12 transition duration-200" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => swipe('right')}
                className="w-14 h-14 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center shadow-xl hover:shadow-emerald-500/20 transition active:scale-95 group"
                title="Like (→ or D)"
                aria-label="Like role"
              >
                <Heart className="w-6 h-6 fill-emerald-500/30 group-hover:scale-110 transition duration-200" />
              </motion.button>
            </div>

            <p className="text-[10px] text-slate-500 mt-3 font-semibold tracking-wide flex items-center space-x-2">
              <span>← Pass [A]</span>
              <span>•</span>
              <span>View Profile [Enter]</span>
              <span>•</span>
              <span>Like [D] →</span>
            </p>
          </>
        )}
      </div>

      {/* Recruiter Match Confirmed Overlay Modal */}
      <AnimatePresence>
        {matchOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.7, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="bg-gradient-to-b from-slate-900 via-[#130f28] to-purple-950 border border-purple-500/40 p-7 sm:p-8 rounded-3xl max-w-sm w-full shadow-2xl relative overflow-hidden flex flex-col items-center space-y-5"
            >
              <div className="absolute top-3 right-4 text-amber-400 animate-ping">✨</div>
              <div className="absolute bottom-4 left-4 text-rose-400 animate-pulse">🎉</div>

              <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                RECRUITER MATCH CONFIRMED
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-200 to-cyan-300 tracking-tight">
                  {matchOverlay.match}% MATCH SCORE
                </h2>
                <p className="text-xs text-purple-300 font-bold">Candidate Shortlisted</p>
              </div>

              <div className="flex items-center justify-center space-x-4 py-2">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-purple-400 flex items-center justify-center text-3xl shadow-lg">
                  🧑‍💼
                </div>
                <Heart className="w-6 h-6 text-rose-500 fill-rose-500 animate-pulse shrink-0" />
                <div className={`w-16 h-16 rounded-2xl ${matchOverlay.avatarBg} border-2 border-rose-400 flex items-center justify-center shadow-lg`}>
                  {matchOverlay.avatarIcon}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                You and <strong className="text-white">{matchOverlay.title}</strong> share a{' '}
                <span className="text-rose-400 font-black">{matchOverlay.match}% match rating</span>.
              </p>

              <div className="flex flex-col w-full space-y-2.5 pt-2">
                <button
                  onClick={() => launchCandidateProfile(matchOverlay)}
                  className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:opacity-95 text-white text-xs font-black py-3 rounded-xl transition active:scale-95 shadow-xl flex items-center justify-center space-x-2"
                >
                  <span>🚀 Launch Candidate.exe</span>
                </button>
                <button
                  onClick={() => setMatchOverlay(null)}
                  className="w-full bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold py-2.5 rounded-xl border border-white/10 transition active:scale-95"
                >
                  Keep Swiping
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal Morph Loader */}
      <AnimatePresence>
        {launchingRole && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 1.05, opacity: 0 }}
              className="bg-slate-900 border border-purple-500/50 p-6 rounded-2xl max-w-xs w-full shadow-2xl space-y-4 font-mono text-left"
            >
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-purple-300">Launching Candidate.exe</span>
              </div>
              <div className="space-y-1.5 text-[10px] text-slate-300">
                <p>&gt; Initializing profile matrix...</p>
                <p className="text-purple-400 font-bold">&gt; Loading {launchingRole.title}</p>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-rose-500 h-full transition-all duration-150"
                    style={{ width: `${launchProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 font-bold pt-0.5">
                  <span>SYSTEM_READY</span>
                  <span>{launchProgress}%</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Section Helper ──────────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center space-x-2 pb-1">
        {icon}
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">{title}</h4>
      </div>
      {children}
    </div>
  );
}

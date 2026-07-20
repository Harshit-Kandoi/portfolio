export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string[];
  technologies: string[];
  github?: string;
  demo?: string;
  featured: boolean;
  duration?: string;
  status?: string;
}

export interface Skill {
  name: string;
  proficiency: number;
  category: string;
  icon?: string;
}

export interface ExperienceItem {
  id: number;
  role?: string;
  title?: string;
  company?: string;
  organization?: string;
  location?: string;
  period?: string;
  date?: string;
  description: string[] | string;
  type: 'work' | 'education' | 'Course' | 'Participation';
  link?: string;
  skills?: string[];
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  subtitle?: string;
  date: string;
  category: string;
  image: string;
  link: string;
  canonical?: string;
  claps?: number;
  responses?: number;
  readingTime?: number;
  tags?: string[];
  featured?: boolean;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface NavLink {
  name: string;
  href: string;
}
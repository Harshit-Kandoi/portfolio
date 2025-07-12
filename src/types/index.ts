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
}

export interface Skill {
  name: string;
  proficiency: number;
  category: 'Languages' | 'Libraries' | 'Tools' | 'Soft Skills';
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
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  link: string;
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
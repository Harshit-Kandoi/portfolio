import { NavLink, SocialLink } from '../types';

export const navLinks: NavLink[] = [
  { name: 'Home', href: 'home' },
  { name: 'About', href: 'about' },
  { name: 'Experience', href: 'experience' },
  { name: 'Projects', href: 'projects' },
  { name: 'Skills', href: 'skills' },
  { name: 'Blog', href: 'blog' },
  { name: 'Contact', href: 'contact' }
];

export const socialLinks: SocialLink[] = [
  {
    platform: 'GitHub',
    url: 'https://github.com/Harshit-Kandoi',
    icon: 'github'
  },
  {
    platform: 'LinkedIn',
    url: 'https://linkedin.com/in/harshit-kandoi',
    icon: 'linkedin'
  },
  {
    platform: 'Email',
    url: 'mailto:hello@harshitkandoi.in',
    icon: 'mail'
  },
  {
    platform: 'Phone',
    url: 'tel:+917850098453',
    icon: 'phone'
  }
];

export const resumeLink = '/Resume.pdf';

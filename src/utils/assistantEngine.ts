// ============================================================
// Offline Q&A engine for the AI Assistant app.
// No network calls: every answer is generated from src/data so it
// stays current when experience / projects / skills change.
// ============================================================

import { PORTFOLIO_META } from '../data/config';
import { experience as defaultExperience } from '../data/experience';
import { projects as defaultProjects } from '../data/projects';
import { skills as defaultSkills } from '../data/skills';
import type { ExperienceItem, Project, Skill } from '../types';

export type AssistantAction =
  | { label: string; type: 'open'; target: string }
  | { label: string; type: 'link'; url: string };

export type IntentId =
  | 'greeting'
  | 'thanks'
  | 'help'
  | 'bot_identity'
  | 'self_destruct'
  | 'about'
  | 'current_role'
  | 'experience'
  | 'skills'
  | 'skill_query'
  | 'projects'
  | 'projects_by_tech'
  | 'project_detail'
  | 'education'
  | 'certifications'
  | 'contact'
  | 'hire'
  | 'resume'
  | 'links'
  | 'location'
  | 'writing'
  | 'apps'
  | 'open_app'
  | 'fallback';

export interface AssistantReply {
  intent: IntentId;
  text: string;
  actions: AssistantAction[];
}

export interface AssistantData {
  experience: ExperienceItem[];
  projects: Project[];
  skills: Skill[];
  meta: typeof PORTFOLIO_META;
}

const DEFAULT_DATA: AssistantData = {
  experience: defaultExperience,
  projects: defaultProjects,
  skills: defaultSkills,
  meta: PORTFOLIO_META,
};

// Repositories that must never be linked (private / commercial source).
const NO_SOURCE_LINK = new Set(['company page', 'clearcue-ai']);

export const EXAMPLE_QUESTIONS = [
  'What does Harshit do now?',
  'Does he know Docker?',
  'Show Python projects',
  'Tell me about Financial Mirror',
  'What certifications does he have?',
  'How can I contact him?',
];

// ─── Text processing ─────────────────────────────────────────────────────────

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'is', 'are', 'was', 'were',
  'be', 'it', 'me', 'my', 'i', 'he', 'his', 'him', 'you', 'your', 'do', 'does', 'did', 'can', 'could',
  'what', 'which', 'who', 'how', 'show', 'tell', 'about', 'please', 'any', 'some', 'there', 'this',
  'that', 'has', 'have', 'harshit', 'kandoi', 'project', 'system', 'app', 'web', 'application',
]);

/** Lower-cases and splits a query into word tokens, keeping tech punctuation (c++, node.js, pub/sub). */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/['’]s\b/g, '')
    .replace(/[^a-z0-9+#./-]+/g, ' ')
    .split(' ')
    .map((t) => t.replace(/^[./-]+|[./-]+$/g, ''))
    .filter((t) => /[a-z0-9]/.test(t));
}

const singular = (t: string) => (t.length > 3 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t);

interface Query {
  tokens: Set<string>;
  /** Space-padded token string (original + singular forms) for word-boundary phrase matching. */
  padded: string;
}

function parseQuery(text: string): Query {
  const raw = tokenize(text);
  const sing = raw.map(singular);
  const tokens = new Set([...raw, ...sing, ...raw.flatMap((t) => (t.includes('-') ? t.split('-') : []))]);
  return { tokens, padded: ` ${raw.join(' ')} | ${sing.join(' ')} ` };
}

/** Word-boundary match of a single word or multi-word phrase. */
const has = (q: Query, term: string) =>
  term.includes(' ') ? q.padded.includes(` ${term} `) : q.tokens.has(term);

// ─── Intent definitions ──────────────────────────────────────────────────────

const INTENT_TERMS: Partial<Record<IntentId, Record<string, number>>> = {
  greeting: { hi: 3, hello: 3, hey: 3, hola: 3, namaste: 3, yo: 2, sup: 2, 'good morning': 3, 'good evening': 3, 'good afternoon': 3 },
  thanks: { thanks: 4, thank: 4, thx: 4, ty: 3, cheers: 3, appreciate: 3 },
  help: { help: 4, 'what can you do': 5, 'what can i ask': 5, option: 2, command: 2, example: 2, 'how do i use': 3 },
  bot_identity: { 'who are you': 5, 'what are you': 5, 'are you real': 5, 'are you an ai': 6, 'are you a bot': 6, chatgpt: 4, gpt: 3, llm: 3 },
  self_destruct: { 'self destruct': 8, 'self-destruct': 8, selfdestruct: 8, destruct: 6 },
  about: {
    about: 1, who: 2, summary: 3, summarize: 3, bio: 3, background: 3, introduce: 3, introduction: 3,
    overview: 3, profile: 2, harshit: 1, 'who is': 3, 'tell me about him': 4, 'tell me about harshit': 5,
    'about harshit': 4, 'about him': 3, yourself: 2,
  },
  current_role: {
    role: 3, job: 3, position: 3, designation: 3, employer: 4, company: 3, currently: 3, current: 2,
    now: 2, 'work at': 4, 'works at': 4, 'where does he work': 6, 'what does he do': 5, 'what does harshit do': 5, thoughtin: 4,
  },
  experience: {
    experience: 4, timeline: 4, career: 4, history: 3, internship: 4, intern: 3, worked: 2, previous: 3,
    past: 2, 'work experience': 5, journey: 3,
  },
  skills: {
    skill: 4, stack: 4, 'tech stack': 5, technologies: 3, technology: 3, tools: 3, tool: 3, language: 3,
    framework: 3, expertise: 3, strength: 3, 'good at': 3, proficient: 2,
  },
  projects: {
    project: 4, built: 3, build: 2, made: 2, portfolio: 1, repo: 3, repository: 3, work: 1, showcase: 3,
    'side project': 4,
  },
  education: {
    education: 5, degree: 5, college: 5, university: 5, study: 4, studied: 4, studying: 4, bits: 4,
    'm.tech': 5, mtech: 5, 'b.tech': 5, btech: 5, cgpa: 5, gpa: 5, school: 4, qualification: 4, masters: 4, bachelor: 4,
  },
  certifications: {
    certification: 5, certifications: 5, certified: 5, certificate: 5, cert: 5, course: 4, credential: 4,
    badge: 3, ace: 3, udemy: 3, coursera: 3, achievement: 3,
  },
  contact: {
    contact: 5, email: 5, mail: 4, 'e-mail': 5, reach: 4, phone: 4, call: 3, message: 3,
    'get in touch': 6, touch: 2, number: 2,
  },
  hire: {
    hire: 5, hiring: 5, freelance: 5, freelancer: 5, available: 4, availability: 5, rate: 3, collaborate: 4,
    'work with him': 5, 'open to work': 6, opportunity: 3, gig: 4, contract: 3, 'why hire': 6,
  },
  resume: { resume: 6, cv: 6, 'résumé': 6, pdf: 2 },
  links: {
    github: 5, linkedin: 5, medium: 4, kaggle: 5, link: 3, social: 4, socials: 4, profiles: 3, handle: 3,
  },
  location: { where: 2, based: 4, live: 3, location: 5, located: 5, city: 4, country: 3, 'where is he': 4 },
  writing: { blog: 5, article: 5, writing: 5, write: 3, post: 3, note: 3, medium: 2 },
  apps: { 'what apps': 6, 'which apps': 6, apps: 4, 'this os': 4, desktop: 3, 'what can i open': 6, window: 2 },
};

// ─── App directory (things the assistant can open) ───────────────────────────

interface AppEntry { id: string; label: string; keys: string[]; blurb: string }

export const APP_DIRECTORY: AppEntry[] = [
  { id: 'about', label: 'About.exe', keys: ['about window', 'about app', 'about.exe'], blurb: 'who Harshit is' },
  { id: 'projects', label: 'Projects.exe', keys: ['projects', 'projects.exe', 'project explorer'], blurb: 'every project with filters' },
  { id: 'experience', label: 'Experience.exe', keys: ['experience', 'experience.exe', 'timeline'], blurb: 'roles and education timeline' },
  { id: 'skills', label: 'Skills.exe', keys: ['skills', 'skills.exe'], blurb: 'skills by category' },
  { id: 'resume', label: 'Resume.pdf', keys: ['resume', 'cv', 'resume.pdf'], blurb: 'the resume, viewable and downloadable' },
  { id: 'achievements', label: 'Certifications.exe', keys: ['certifications', 'certificates', 'certifications.exe', 'achievements'], blurb: 'certifications and courses' },
  { id: 'contact', label: 'Contact.exe', keys: ['contact', 'contact.exe'], blurb: 'email and social links' },
  { id: 'terminal', label: 'Terminal.exe', keys: ['terminal', 'terminal.exe', 'shell', 'console', 'cli'], blurb: 'a portfolio shell (try `help`)' },
  { id: 'arcade', label: 'Arcade.exe', keys: ['arcade', 'arcade.exe', 'game', 'games', 'gaming', 'snake', 'rpg'], blurb: 'Snake and a small bug-battle RPG' },
  { id: 'writing', label: 'Writing.exe', keys: ['writing', 'writing.exe', 'blog', 'blogs', 'notes', 'articles'], blurb: 'blog posts and dev notes' },
  { id: 'swipe', label: 'Swipe.exe', keys: ['swipe', 'swipe.exe'], blurb: 'swipe through role profiles' },
  { id: 'products', label: 'Products.exe', keys: ['products', 'products.exe'], blurb: 'products he is building' },
  { id: 'settings', label: 'Settings.exe', keys: ['settings', 'settings.exe', 'preferences'], blurb: 'themes, wallpaper and sound' },
];

const OPEN_VERBS = ['open', 'launch', 'start', 'run', 'play', 'go to', 'take me to', 'bring up'];

const openAction = (id: string): AssistantAction => {
  const app = APP_DIRECTORY.find((a) => a.id === id);
  return { label: `Open ${app?.label ?? id}`, type: 'open', target: id };
};
const linkAction = (label: string, url: string): AssistantAction => ({ label, type: 'link', url });

// ─── Tech index (built from data) ────────────────────────────────────────────

// Query words that mean the same thing as a key used in the data.
const TECH_SYNONYMS: Record<string, string> = {
  js: 'javascript', ts: 'typescript', py: 'python', node: 'node.js', nodejs: 'node.js',
  reactjs: 'react', 'react.js': 'react', nextjs: 'next.js', next: 'next.js', tailwind: 'tailwind css',
  k8s: 'kubernetes', ml: 'machine learning', dl: 'deep learning', rl: 'reinforcement learning',
  'artificial intelligence': 'ai', genai: 'ai', sklearn: 'scikit-learn', 'scikit learn': 'scikit-learn',
  torch: 'pytorch', 'google cloud': 'gcp', cloud: 'gcp', azure: 'microsoft azure', postman: 'postman',
  'github actions': 'github actions', cicd: 'ci/cd', 'ci cd': 'ci/cd', containers: 'docker', container: 'docker',
  'computer vision': 'computer vision', opencv: 'opencv', mongo: 'mongodb', powerbi: 'power bi',
  'pub sub': 'pub/sub', pubsub: 'pub/sub', yolo: 'yolo', html: 'html', css: 'css', sql: 'sql',
};

/** Generic words that appear inside tech names but shouldn't count as a tech on their own. */
const NON_TECH_KEYS = new Set([
  'product engineering', 'content design', 'type system', 'cli', 'webcam inference',
  'products', 'software', 'products software', 'course', 'practice', 'course practice',
]);

function techKeys(name: string): string[] {
  const keys = new Set<string>();
  const lower = name.toLowerCase().trim();
  const paren = lower.match(/\(([^)]+)\)/);
  const base = lower.replace(/\([^)]*\)/g, '').trim();
  const parts = [base, ...base.split(/\s*&\s*|\s+and\s+/)];
  if (paren && !paren[1].includes(' ')) parts.push(paren[1]);
  for (const p of parts) {
    const k = tokenize(p).join(' ');
    if (!k) continue;
    keys.add(k);
    const noVer = k.replace(/v?\d+$/, '');
    if (noVer && noVer !== k && noVer.length > 1) keys.add(noVer);
    if (k.endsWith('.js')) keys.add(k.slice(0, -3) + 'js');
  }
  return [...keys].filter((k) => k.length > 1 && !NON_TECH_KEYS.has(k));
}

interface TechMatch {
  /** Canonical keys the query mentioned, longest first. */
  keys: string[];
  label: string;
}

function detectTech(q: Query, data: AssistantData): TechMatch | null {
  const vocab = new Map<string, string>(); // key -> display label
  const add = (name: string) => techKeys(name).forEach((k) => { if (!vocab.has(k)) vocab.set(k, name.replace(/\s*\([^)]*\)/, '')); });
  data.skills.forEach((s) => add(s.name));
  data.projects.forEach((p) => { p.technologies.forEach(add); p.category.forEach(add); });
  data.experience.forEach((e) => e.skills?.forEach(add)); // work skills + certification skills

  const found: string[] = [];
  for (const key of vocab.keys()) if (has(q, key)) found.push(key);
  for (const [syn, canon] of Object.entries(TECH_SYNONYMS)) if (has(q, syn)) found.push(canon);
  if (found.length === 0) return null;
  // Prefer longer keys and drop keys contained in a longer match ("cloud" inside "cloud run").
  const uniq = [...new Set(found)].sort((a, b) => b.length - a.length);
  const keys = uniq.filter((k, i) => !uniq.slice(0, i).some((longer) => ` ${longer} `.includes(` ${k} `)));
  const primary = keys[0];
  const label = vocab.get(primary) ?? (primary === 'ai' ? 'AI' : primary.replace(/\b\w/g, (c) => c.toUpperCase()));
  return { keys, label };
}

const matchesTech = (name: string, keys: string[]) => {
  const nk = techKeys(name);
  return keys.some((k) => nk.includes(k));
};

const projectMatchesTech = (p: Project, keys: string[]) =>
  p.technologies.some((t) => matchesTech(t, keys)) || p.category.some((c) => matchesTech(c, keys));

// ─── Project name matching ───────────────────────────────────────────────────

const GENERIC_TITLE_WORDS = new Set([
  'learning', 'prediction', 'detection', 'classification', 'dashboard', 'analytics', 'engine', 'tracker',
  'repository', 'experiments', 'coursework', 'schema', 'validation', 'data', 'machine', 'reinforcement',
  'personal', 'page', 'lab', 'local', 'sales', 'financial', 'survival', 'price', 'sale', 'hand', 'sign',
  'structures', 'algorithms', 'web', 'udemy',
]);

function findProject(q: Query, data: AssistantData): { project: Project; score: number } | null {
  let best: { project: Project; score: number } | null = null;
  for (const p of data.projects) {
    const titleTokens = tokenize(p.title);
    const fullTitle = titleTokens.join(' ');
    const words = titleTokens.flatMap((t) => t.split('-'));
    let score = has(q, fullTitle) ? 6 : 0;
    const significant = words.filter((t) => !STOPWORDS.has(t) && !GENERIC_TITLE_WORDS.has(t) && t.length > 2);
    const hits = significant.filter((t) => q.tokens.has(t)).length;
    score += hits * 2;
    if (score > 0 && (!best || score > best.score)) best = { project: p, score };
  }
  return best;
}

// ─── Answer builders ─────────────────────────────────────────────────────────

const list = (items: string[], max = items.length) => {
  const shown = items.slice(0, max);
  const more = items.length - shown.length;
  return shown.join(', ') + (more > 0 ? ` and ${more} more` : '');
};

const bullets = (items: string[]) => items.map((i) => `• ${i}`).join('\n');

const workItems = (d: AssistantData) => d.experience.filter((e) => e.type === 'work');
const educationItems = (d: AssistantData) => d.experience.filter((e) => e.type === 'education');
const certItems = (d: AssistantData) => d.experience.filter((e) => e.title && (e.type === 'Course' || e.type === 'Participation'));
const currentRole = (d: AssistantData) => workItems(d).find((e) => /present/i.test(e.period ?? '')) ?? workItems(d)[0];
const firstLine = (desc: string[] | string) => (Array.isArray(desc) ? desc[0] : desc) ?? '';

const topSkills = (d: AssistantData, n: number) =>
  [...d.skills]
    .filter((s) => !['Soft Skills', 'Tools'].includes(s.category))
    .sort((a, b) => b.proficiency - a.proficiency)
    .slice(0, n)
    .map((s) => s.name.replace(/\s*\([^)]*\)/, ''));

function projectLinks(p: Project): AssistantAction[] {
  const actions: AssistantAction[] = [openAction('projects')];
  if (p.github && !NO_SOURCE_LINK.has(p.title.toLowerCase())) actions.push(linkAction('View on GitHub', p.github));
  if (p.demo) actions.push(linkAction('Live demo', p.demo));
  return actions;
}

function build(intent: IntentId, q: Query, d: AssistantData, tech: TechMatch | null, proj: Project | null): AssistantReply {
  const m = d.meta;
  const role = currentRole(d);
  const reply = (text: string, actions: AssistantAction[] = []): AssistantReply => ({ intent, text, actions });

  switch (intent) {
    case 'greeting':
      return reply(`Hi! I'm a small offline guide to ${m.name}'s portfolio. Ask about his work, skills, projects or how to reach him.`, [openAction('about')]);
    case 'thanks':
      return reply('Happy to help! Anything else you want to know?');
    case 'help':
      return reply(`I answer from the portfolio data, offline. Try:\n${bullets(EXAMPLE_QUESTIONS)}\nOr say "open terminal", "open arcade", "open writing".`);
    case 'bot_identity':
      return reply(`I'm a tiny rule-based assistant that runs entirely in your browser, no AI API behind me. I know ${m.name}'s experience, skills, projects and this OS. ${m.name} is an ${m.role} at ${m.company}.`, [openAction('about')]);
    case 'self_destruct':
      return reply("Self-destruct was retired in v3. I'm staying right here. Ask me something about Harshit instead?");
    case 'about': {
      const certs = certItems(d).length;
      const focus = m.headline.split('·')[1]?.trim();
      return reply(
        `${m.name} is an ${m.role} at ${m.company}, based in ${m.location}.${focus ? ` Focus: ${focus}.` : ''} This portfolio lists ${d.projects.length} projects and ${certs} certifications/courses. He's also ${m.availability.toLowerCase()}.`,
        [openAction('about'), openAction('experience')],
      );
    }
    case 'current_role':
      return reply(
        `${m.name} is currently an ${m.role} at ${m.company}${role?.period ? ` (since ${role.period.split(/\s*-\s*/)[0]})` : ''}${role?.location ? `, ${role.location}` : ''}. ${role ? firstLine(role.description) : ''}`.trim(),
        [openAction('experience')],
      );
    case 'experience':
      return reply(
        `Work timeline:\n${bullets(workItems(d).map((e) => `${e.role} at ${e.company} (${e.period})`))}`,
        [openAction('experience'), openAction('resume')],
      );
    case 'skills': {
      const byCat = new Map<string, string[]>();
      d.skills.forEach((s) => byCat.set(s.category, [...(byCat.get(s.category) ?? []), s.name.replace(/\s*\([^)]*\)/, '')]));
      const lines = [...byCat.entries()].filter(([c]) => c !== 'Soft Skills').map(([c, names]) => `${c}: ${list(names, 4)}`);
      return reply(`Strongest areas: ${list(topSkills(d, 5))}.\n${bullets(lines)}\nAsk "does he know X?" for a specific tool.`, [openAction('skills')]);
    }
    case 'skill_query': {
      if (!tech) {
        return reply(`I don't see that in ${m.name}'s listed skills or projects. His core stack is ${list(topSkills(d, 6))}. Ask "does he know Docker?" to check a specific tool.`, [openAction('skills')]);
      }
      const skillHits = d.skills.filter((s) => matchesTech(s.name, tech.keys)).map((s) => s.name.replace(/\s*\([^)]*\)/, ''));
      const projHits = d.projects.filter((p) => projectMatchesTech(p, tech.keys)).map((p) => p.title);
      const workHits = workItems(d).filter((e) => e.skills?.some((s) => matchesTech(s, tech.keys))).map((e) => `${e.role} at ${e.company?.replace(/ (India )?Pvt\. Ltd\./, '')}`);
      const certHits = certItems(d).filter((c) => c.skills?.some((s) => matchesTech(s, tech.keys)) || matchesTech(c.title ?? '', tech.keys)).map((c) => c.title as string);
      const parts: string[] = [];
      if (skillHits.length) parts.push(`Listed skill: ${list(skillHits)}`);
      if (workHits.length) parts.push(`Used at work: ${list(workHits)}`);
      if (projHits.length) parts.push(`Projects: ${list(projHits, 5)}`);
      if (certHits.length) parts.push(`Certification: ${list(certHits)}`);
      const actions: AssistantAction[] = [openAction('skills')];
      if (projHits.length) actions.push(openAction('projects'));
      if (certHits.length) actions.push(openAction('achievements'));
      return reply(`Yes, ${tech.label} shows up in his work.\n${bullets(parts)}`, actions);
    }
    case 'projects': {
      const featured = d.projects.filter((p) => p.featured).map((p) => p.title);
      return reply(
        `There are ${d.projects.length} projects. Highlights: ${list(featured, 6)}. Ask about one by name, or by tech (e.g. "Python projects").`,
        [openAction('projects')],
      );
    }
    case 'projects_by_tech': {
      if (!tech) return build('projects', q, d, tech, proj);
      const hits = d.projects.filter((p) => projectMatchesTech(p, tech.keys));
      if (hits.length === 0) {
        return reply(`No projects here are tagged with ${tech.label}. There are ${d.projects.length} projects in total, open Projects.exe to browse them.`, [openAction('projects')]);
      }
      return reply(`${hits.length} project${hits.length === 1 ? '' : 's'} using ${tech.label}:\n${bullets(hits.slice(0, 8).map((p) => p.title))}${hits.length > 8 ? `\n…and ${hits.length - 8} more in Projects.exe.` : ''}`, [openAction('projects')]);
    }
    case 'project_detail': {
      if (!proj) return build('projects', q, d, tech, proj);
      return reply(
        `${proj.title}: ${proj.description} Tech: ${list(proj.technologies)}.${proj.status ? ` Status: ${proj.status.replace(/[^\w\s()/-]/g, '').trim()}.` : ''}`,
        projectLinks(proj),
      );
    }
    case 'education':
      return reply(
        `Education:\n${bullets(educationItems(d).map((e) => {
          const score = Array.isArray(e.description) ? e.description.find((l) => /cgpa|score/i.test(l)) : undefined;
          return `${e.role}, ${e.company} (${e.period})${score ? ` · ${score}` : ''}`;
        }))}`,
        [openAction('experience')],
      );
    case 'certifications':
      return reply(
        `Certifications & courses:\n${bullets(certItems(d).map((c) => `${c.title} (${c.organization}, ${c.date})`))}`,
        [openAction('achievements')],
      );
    case 'contact':
      return reply(`Email ${m.email}, or use Contact.exe. He's also on LinkedIn and GitHub.`, [
        openAction('contact'), linkAction('Email', `mailto:${m.email}`), linkAction('LinkedIn', m.linkedin),
      ]);
    case 'hire':
      return reply(
        `${m.name} works full-time as an ${m.role} at ${m.company}, and is ${m.availability.toLowerCase()}. Best way to reach him: ${m.email}.`,
        [openAction('contact'), openAction('resume')],
      );
    case 'resume':
      return reply('Resume.pdf has his resume, ready to view or download.', [openAction('resume')]);
    case 'links': {
      const all: [string, string, string][] = [
        ['github', 'GitHub', m.github], ['linkedin', 'LinkedIn', m.linkedin], ['medium', 'Medium', m.medium], ['kaggle', 'Kaggle', m.kaggle],
      ];
      const asked = all.filter(([k]) => has(q, k));
      const chosen = asked.length ? asked : all;
      return reply(chosen.map(([, label, url]) => `${label}: ${url.replace(/^https?:\/\/(www\.)?/, '')}`).join('\n'), chosen.map(([, label, url]) => linkAction(`Open ${label}`, url)));
    }
    case 'location':
      return reply(`${m.name} is based in ${m.location}.${role?.location ? ` Current role: ${role.location}.` : ''}`, [openAction('contact')]);
    case 'writing':
      return reply('His blog posts (from Medium) and dev notes live in Writing.exe.', [openAction('writing'), linkAction('Open Medium', m.medium)]);
    case 'apps':
      return reply(`Apps on this desktop:\n${bullets(APP_DIRECTORY.map((a) => `${a.label}: ${a.blurb}`))}`, [openAction('projects'), openAction('arcade'), openAction('terminal')]);
    case 'open_app': {
      const app = APP_DIRECTORY.find((a) => a.keys.some((k) => has(q, k)));
      if (!app) return build('apps', q, d, tech, proj);
      return reply(`${app.label} has ${app.blurb}. Tap below to open it.`, [openAction(app.id)]);
    }
    default:
      return reply(
        `I'm a small offline assistant, so I only know about ${m.name}'s work and this OS. Try:\n${bullets(EXAMPLE_QUESTIONS.slice(0, 5))}`,
        [openAction('about'), openAction('projects')],
      );
  }
}

const SKILL_QUERY_TERMS: Record<string, number> = {
  know: 3, knows: 3, use: 2, used: 2, uses: 2, using: 2, familiar: 3, proficient: 3, 'experience with': 4,
  'worked with': 4, 'work with': 2, 'good at': 3,
};

/** Scores every intent for a query and returns the generated answer. */
export function answer(input: string, data: AssistantData = DEFAULT_DATA): AssistantReply {
  const q = parseQuery(input);
  const scores = new Map<IntentId, number>();
  const bump = (id: IntentId, n: number) => scores.set(id, (scores.get(id) ?? 0) + n);

  for (const [id, terms] of Object.entries(INTENT_TERMS) as [IntentId, Record<string, number>][]) {
    for (const [term, w] of Object.entries(terms)) if (has(q, term)) bump(id, w);
  }

  const tech = detectTech(q, data);
  const skillVerb = Object.entries(SKILL_QUERY_TERMS).reduce((s, [t, w]) => (has(q, t) ? s + w : s), 0);
  if (tech) bump('skill_query', 3 + skillVerb);
  else if (skillVerb >= 3) bump('skill_query', 2);

  const projMatch = findProject(q, data);
  if (projMatch) bump('project_detail', projMatch.score + (has(q, 'project') ? 2 : 0));

  const wantsOpen = OPEN_VERBS.some((v) => has(q, v));
  const namedApp = APP_DIRECTORY.find((a) => a.keys.some((k) => has(q, k)));
  if (namedApp) bump('open_app', wantsOpen ? 10 : 2.5);

  // "Show AI projects" / "Python projects": a tech plus a projects word.
  if (tech && (scores.get('projects') ?? 0) > 0) {
    const projectsScore = scores.get('projects') ?? 0;
    const detail = scores.get('project_detail') ?? 0;
    if (detail < 6) bump('projects_by_tech', projectsScore + 4);
  }

  let best: IntentId = 'fallback';
  let bestScore = 1.5; // minimum confidence
  for (const [id, s] of scores) {
    if (s > bestScore) { best = id; bestScore = s; }
  }
  return build(best, q, data, tech, projMatch?.project ?? null);
}

import { useState, useEffect, useCallback } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle,
  Code2,
  Database,
  ExternalLink,
  FileText,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Monitor,
  Phone,
  Send,
} from 'lucide-react';
import ClassicNavbar from './ClassicNavbar';
import MonitorWidget from './MonitorWidget';
import OSTransitionOverlay from './OSTransitionOverlay';
import { projects } from '../../data/projects';
import { experience } from '../../data/experience';
import { skills } from '../../data/skills';
import { resumeLink } from '../../data/navigation';
import { PORTFOLIO_META } from '../../data/config';

function useIntersectionObserver(ids: string[]): string {
  const [activeId, setActiveId] = useState(ids[0] || '');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id);
        },
        { rootMargin: '-22% 0px -62% 0px' },
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, [ids]);

  return activeId;
}

const heroTabs = [
  {
    id: 'now',
    label: 'Now',
    title: 'Associate Software Engineer',
    meta: 'ThoughtIn Solutions · GCP · backend automation',
    body: 'Building cloud-native workflows, API integrations, and internal systems that remove repetitive operational work.',
  },
  {
    id: 'work',
    label: 'Work',
    title: 'Financial Mirror, ClearCue-AI, Pixel Buddy',
    meta: 'Active builds · AI products · desktop tools',
    body: 'Currently shaping a tighter set of products while keeping the portfolio and company page aligned for freelance work.',
  },
  {
    id: 'stack',
    label: 'Stack',
    title: 'Python, Java, React, GCP',
    meta: 'Firestore · Pub/Sub · Docker · SQL',
    body: 'Comfortable across backend services, data workflows, cloud functions, dashboards, and practical AI integrations.',
  },
  {
    id: 'contact',
    label: 'Contact',
    title: 'Open to projects and roles',
    meta: 'Jaipur, India · remote-friendly',
    body: 'Reach out for freelance work, software engineering roles, AI engineering roles, or a focused collaboration.',
  },
];

const proofCards = [
  { label: 'Current role', value: 'Associate Software Engineer', note: 'Backend, GCP, automation' },
  { label: 'Certification', value: 'System Design + Google ACE', note: 'Architecture and cloud proof' },
  { label: 'Education', value: 'M.Tech AI & ML', note: 'BITS Pilani distance program' },
  { label: 'Availability', value: 'Open', note: 'Freelance and recruiter conversations' },
];

const services = [
  {
    title: 'Web apps & MVPs',
    body: 'Clickable product versions for founders who need to validate fast without agency overhead.',
    tags: ['React', 'APIs', 'Launch'],
  },
  {
    title: 'Dashboards & internal tools',
    body: 'Operational screens, reporting flows, admin panels, and team tools that replace spreadsheet chaos.',
    tags: ['Data', 'UX', 'Automation'],
  },
  {
    title: 'Backend automation',
    body: 'Event-driven workflows, API integrations, email processing, cloud functions, and scheduled jobs.',
    tags: ['GCP', 'Python', 'Java'],
  },
  {
    title: 'AI & data workflows',
    body: 'Practical AI features, computer vision experiments, model integration, and data processing pipelines.',
    tags: ['ML', 'CV', 'Pipelines'],
  },
  {
    title: 'Product websites',
    body: 'Clear, fast sites for small products, portfolios, and service pages with strong conversion paths.',
    tags: ['SEO', 'Copy', 'Performance'],
  },
];

const processSteps = [
  ['01', 'Scope', 'Clarify the problem, users, constraints, and what a useful first version must prove.'],
  ['02', 'Build', 'Ship working increments with simple demos, clear tradeoffs, and visible progress.'],
  ['03', 'Launch', 'Deploy, document the handoff, and polish the details that make the product usable.'],
];

const projectTitles = [
  'Financial Mirror',
  'ClearCue-AI',
  'Pixel Buddy',
  'Company Page',
  'Portfolio OS',
];

const featuredProjects = projectTitles
  .map((title) => projects.find((project) => project.title === title))
  .filter(Boolean)
  .map((project) => project!);

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="minimal-section-heading">
      <p className="minimal-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {body && <p>{body}</p>}
    </div>
  );
}

function Hero({ onLaunch }: { onLaunch: (rect?: DOMRect) => void }) {
  const [activeTab, setActiveTab] = useState(heroTabs[0].id);
  const active = heroTabs.find((tab) => tab.id === activeTab) || heroTabs[0];

  return (
    <section id="hero" className="minimal-hero">
      <div className="minimal-hero-copy">
        <div className="minimal-status-row">
          <span className="minimal-live-dot" />
          <span>Open for freelance and recruiter conversations</span>
        </div>

        <p className="minimal-eyebrow">Full Stack Software Engineer</p>
        <h1>Harshit Kandoi builds backend automation, cloud workflows, AI tools, and useful web apps.</h1>
        <p className="minimal-hero-lead">
          I work across Python, Java, React, GCP, and data-heavy systems to turn messy processes into software that
          teams can trust.
        </p>

        <div className="minimal-actions">
          <a href="#contact" className="minimal-button minimal-button-primary">
            <Mail className="w-4 h-4" />
            <span>Contact me</span>
          </a>
          <a href={resumeLink} target="_blank" rel="noopener noreferrer" className="minimal-button minimal-button-secondary">
            <FileText className="w-4 h-4" />
            <span>Resume</span>
          </a>
          <a href="#work" className="minimal-button minimal-button-ghost">
            <ArrowRight className="w-4 h-4" />
            <span>View work</span>
          </a>
        </div>
      </div>

      <aside className="minimal-hero-panel" aria-label="Profile snapshot">
        <div className="minimal-profile-card">
          <img src="/profile.webp" alt="Harshit Kandoi" />
          <div>
            <span>HK / 2026</span>
            <strong>{PORTFOLIO_META.name}</strong>
            <small>{PORTFOLIO_META.location}</small>
          </div>
        </div>

        <div className="minimal-tab-card">
          <div className="minimal-tab-list" role="tablist" aria-label="Portfolio snapshot">
            {heroTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="minimal-tab-content">
            <span>{active.meta}</span>
            <h2>{active.title}</h2>
            <p>{active.body}</p>
          </div>
        </div>

        <div className="minimal-panel-grid">
          <a href={PORTFOLIO_META.github} target="_blank" rel="noopener noreferrer">
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
          <a href={PORTFOLIO_META.linkedin} target="_blank" rel="noopener noreferrer">
            <Linkedin className="w-4 h-4" />
            <span>LinkedIn</span>
          </a>
          <button type="button" onClick={(event) => onLaunch(event.currentTarget.getBoundingClientRect())}>
            <Monitor className="w-4 h-4" />
            <span>Interactive mode</span>
          </button>
        </div>
      </aside>
    </section>
  );
}

function ProofStrip() {
  return (
    <section className="minimal-proof" aria-label="Quick proof">
      {proofCards.map((card) => (
        <div key={card.label}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          <p>{card.note}</p>
        </div>
      ))}
    </section>
  );
}

function WorkSection() {
  return (
    <section id="work" className="minimal-section">
      <SectionHeading
        eyebrow="Selected work"
        title="A smaller set of stronger proof."
        body="A focused portfolio beats a long gallery. These projects show product thinking, backend depth, cloud work, AI, and analytics."
      />

      <div className="minimal-project-grid">
        {featuredProjects.map((project, index) => (
          <article key={project.id} className={index === 0 ? 'minimal-project-card featured' : 'minimal-project-card'}>
            <div className="minimal-project-media">
              <img src={project.image} alt="" />
              <span>{project.status || project.duration || 'Project'}</span>
            </div>
            <div className="minimal-project-body">
              <p className="minimal-eyebrow">{project.category[0]}</p>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="minimal-tag-row">
                {project.technologies.slice(0, 5).map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
              <div className="minimal-link-row">
                {project.github && (
                  <a href={project.github} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4" />
                    Code
                  </a>
                )}
                {project.demo && (
                  <a href={project.demo} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    Live
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="services" className="minimal-section minimal-services-section">
      <SectionHeading
        eyebrow="Freelance services"
        title="Clear builds for founders, teams, and product ideas."
        body="The offer is intentionally practical: scope the smallest real version, build it cleanly, and keep the path to launch visible."
      />

      <div className="minimal-services-grid">
        {services.map((service, index) => (
          <article key={service.title} className="minimal-service-card">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{service.title}</h3>
            <p>{service.body}</p>
            <div className="minimal-tag-row">
              {service.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ExperienceSection() {
  const workItems = experience.filter((item) => item.type === 'work').slice(0, 4);
  const educationItems = experience.filter((item) => item.type === 'education').slice(0, 2);
  const certItems = experience.filter((item) => item.type === 'Course').slice(0, 3);
  const keySkillGroups = ['Backend', 'Cloud', 'AI', 'Languages'];

  return (
    <section id="experience" className="minimal-section">
      <SectionHeading
        eyebrow="Recruiter proof"
        title="Experience, stack, and credentials without the clutter."
        body="A quick read for hiring teams, with enough detail to show what I have actually been doing."
      />

      <div className="minimal-evidence-layout">
        <div className="minimal-timeline">
          {workItems.map((item, index) => (
            <article key={item.id}>
              <span>{item.period}</span>
              <h3>{item.role}</h3>
              <strong>{item.company}</strong>
              <p>{Array.isArray(item.description) ? item.description[0] : item.description}</p>
              <div className="minimal-tag-row">
                {item.skills?.slice(0, 5).map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
              {index === 0 && <small>Current</small>}
            </article>
          ))}
        </div>

        <aside className="minimal-evidence-side">
          <div className="minimal-side-card">
            <div className="minimal-side-title">
              <Award className="w-4 h-4" />
              <span>Certifications</span>
            </div>
            {certItems.map((cert) => (
              <a key={cert.id} href={cert.link || '#'} target="_blank" rel="noopener noreferrer">
                <strong>{cert.title}</strong>
                <span>{cert.organization} · {cert.date}</span>
              </a>
            ))}
          </div>

          <div className="minimal-side-card">
            <div className="minimal-side-title">
              <BookOpen className="w-4 h-4" />
              <span>Education</span>
            </div>
            {educationItems.map((item) => (
              <div key={item.id} className="minimal-skill-group">
                <strong>{item.role}</strong>
                <p>{item.company} · {item.period}</p>
              </div>
            ))}
          </div>

          <div className="minimal-side-card">
            <div className="minimal-side-title">
              <Code2 className="w-4 h-4" />
              <span>Toolkit</span>
            </div>
            {keySkillGroups.map((group) => (
              <div key={group} className="minimal-skill-group">
                <strong>{group}</strong>
                <p>
                  {skills
                    .filter((skill) => skill.category === group)
                    .sort((a, b) => b.proficiency - a.proficiency)
                    .slice(0, 4)
                    .map((skill) => skill.name)
                    .join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="minimal-section minimal-process-section">
      <SectionHeading eyebrow="Process" title="Simple enough to move fast. Structured enough to trust." />

      <div className="minimal-process-grid">
        {processSteps.map(([number, title, body]) => (
          <article key={number}>
            <span>{number}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === 'sending' || status === 'sent') return;

    setStatus('sending');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          subject: `Portfolio Contact from ${form.name.trim()}`,
          message: `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`,
        }),
      });

      if (res.ok) {
        setStatus('sent');
      } else {
        setStatus('error');
        window.location.href = `mailto:${PORTFOLIO_META.email}?subject=${encodeURIComponent(`Portfolio Contact from ${form.name}`)}&body=${encodeURIComponent(form.message)}`;
      }
    } catch {
      setStatus('error');
      window.location.href = `mailto:${PORTFOLIO_META.email}?subject=${encodeURIComponent(`Portfolio Contact from ${form.name}`)}&body=${encodeURIComponent(form.message)}`;
    }
  };

  return (
    <section id="contact" className="minimal-section minimal-contact-section">
      <div className="minimal-contact-copy">
        <p className="minimal-eyebrow">Contact</p>
        <h2>Have a role, project, or idea worth building?</h2>
        <p>
          Send a short note. I am open to software engineering roles, AI/backend work, and freelance builds for founders
          or small teams.
        </p>
        <div className="minimal-contact-links">
          <a href={`mailto:${PORTFOLIO_META.email}`}>
            <Mail className="w-4 h-4" />
            {PORTFOLIO_META.email}
          </a>
          <a href={`tel:${PORTFOLIO_META.phone}`}>
            <Phone className="w-4 h-4" />
            {PORTFOLIO_META.phone}
          </a>
          <span>
            <MapPin className="w-4 h-4" />
            Jaipur, Rajasthan, India
          </span>
        </div>
        <div className="minimal-social-row">
          <a href={PORTFOLIO_META.github} target="_blank" rel="noopener noreferrer"><Github className="w-4 h-4" />GitHub</a>
          <a href={PORTFOLIO_META.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin className="w-4 h-4" />LinkedIn</a>
          <a href={PORTFOLIO_META.medium} target="_blank" rel="noopener noreferrer"><BookOpen className="w-4 h-4" />Medium</a>
          <a href={PORTFOLIO_META.kaggle} target="_blank" rel="noopener noreferrer"><Database className="w-4 h-4" />Kaggle</a>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="minimal-contact-form">
        <label>
          <span>Name</span>
          <input
            required
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
        </label>
        <label>
          <span>Email</span>
          <input
            required
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
        </label>
        <label>
          <span>Message</span>
          <textarea
            required
            rows={5}
            placeholder="Tell me what you are building or hiring for."
            value={form.message}
            onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
          />
        </label>
        <button type="submit" className="minimal-button minimal-button-primary" disabled={status === 'sending' || status === 'sent'}>
          {status === 'sending' && <span className="minimal-spinner" />}
          {status === 'sent' && <CheckCircle className="w-4 h-4" />}
          {(status === 'idle' || status === 'error') && <Send className="w-4 h-4" />}
          <span>{status === 'sending' ? 'Sending...' : status === 'sent' ? 'Sent' : 'Send message'}</span>
        </button>
      </form>
    </section>
  );
}

function LabSection({ onLaunch }: { onLaunch: (rect: DOMRect) => void }) {
  return (
    <section id="lab" className="minimal-section minimal-lab-section">
      <div className="minimal-lab-copy">
        <p className="minimal-eyebrow">Optional interactive layer</p>
        <h2>The portfolio OS still exists, just no longer blocks the main story.</h2>
        <p>
          Open it when you want the playful version: windows, apps, terminal commands, games, and the older experimental
          portfolio interface.
        </p>
      </div>
      <MonitorWidget onLaunch={onLaunch} isDark />
    </section>
  );
}

export default function ClassicPortfolio({ onTransition }: { onTransition: (rect: DOMRect) => void }) {
  const sectionIds = ['hero', 'work', 'services', 'experience', 'contact', 'lab'];
  const activeSection = useIntersectionObserver(sectionIds);
  const [transitionRect, setTransitionRect] = useState<DOMRect | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('classic_theme') as 'dark' | 'light') || 'light';
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('classic_theme', next);
      return next;
    });
  }, []);

  const handleLaunch = useCallback((rect?: DOMRect) => {
    const fallback = rect || new DOMRect(window.innerWidth / 2 - 130, window.innerHeight / 2 - 80, 260, 160);
    setTransitionRect(fallback);
    setTimeout(() => onTransition(fallback), 50);
  }, [onTransition]);

  return (
    <div className={`minimal-portfolio ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <ClassicNavbar
        activeSection={activeSection}
        onEnterOS={handleLaunch}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main>
        <Hero onLaunch={handleLaunch} />
        <ProofStrip />
        <WorkSection />
        <ServicesSection />
        <ExperienceSection />
        <ProcessSection />
        <ContactSection />
        <LabSection onLaunch={(rect) => handleLaunch(rect)} />
      </main>

      {transitionRect && <OSTransitionOverlay initialRect={transitionRect} />}
      <footer className="minimal-footer">
        <span>HK portfolio · v3</span>
        <span>Built for clarity, proof, and a little personality.</span>
      </footer>
    </div>
  );
}

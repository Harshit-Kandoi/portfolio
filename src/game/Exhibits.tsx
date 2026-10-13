import { useId, useState } from 'react';
import { ArrowUpRight, BadgeCheck, Cloud, Database, FileText, FlaskConical, GraduationCap, MapPin, ServerCog, Sparkles } from 'lucide-react';
import type { ExperienceItem, Project } from '../types';
import { experience } from '../data/experience';
import { resumeLink } from '../data/navigation';
import { engineeringRecords, skillGroups } from './content';
import { resolveAsset } from '../utils/paths';
import TouchButton from './TouchButton';

interface Props { projects: Project[]; onInspect: (project: Project) => void }

const careerViews = [
  { type: null, label: 'All', heading: 'The complete journey' },
  { type: 'work', label: 'Work Experience', heading: 'Work experience' },
  { type: 'education', label: 'Education', heading: 'Education' },
  { type: 'Course', label: 'Certifications', heading: 'Certifications & courses' },
] as const;

export function CareerExhibit() {
  const [view, setView] = useState<(typeof careerViews)[number]>(careerViews[0]);
  const recordsId = useId();
  const entries = experience.filter(entry => view.type === null || entry.type === view.type);
  return <>
    <p className="verse-body-copy">The real journey, from learning the foundations to building software for people.</p>
    <a className="verse-secondary" href={resumeLink} target="_blank" rel="noopener noreferrer"><FileText size={17}/> View resume <ArrowUpRight size={16}/></a>
    <nav className="verse-career-views" aria-label="Career Guild categories">{careerViews.map(category => <TouchButton key={category.label} aria-pressed={view === category} aria-controls={recordsId} onClick={() => setView(category)}>{category.label}<span aria-hidden="true">{experience.filter(entry => category.type === null || entry.type === category.type).length}</span></TouchButton>)}</nav>
    <div id={recordsId}><p className="verse-career-summary" role="status">{view.heading} · {entries.length} records</p><ExperienceRecords entries={entries}/></div>
    <h3 className="verse-section-title">Complete skills library</h3><SkillLibrary/>
  </>;
}

function ExperienceRecords({ entries }: { entries: ExperienceItem[] }) {
  return <div className="verse-timeline">{entries.map(entry => <article key={entry.id}><small>{entry.period || entry.date} / {entry.type.toUpperCase()}</small><h3>{entry.role || entry.title}</h3><h4>{entry.company || entry.organization}</h4>{entry.location && <p className="verse-record-location"><MapPin size={13}/> {entry.location}</p>}{(Array.isArray(entry.description) ? entry.description : [entry.description]).map((description, i) => <p key={i}>{description}</p>)}{entry.skills && <div className="verse-tags">{entry.skills.map(skill => <span key={skill}>{skill}</span>)}</div>}{entry.link && <a href={entry.link} target="_blank" rel="noopener noreferrer">View credential <ArrowUpRight size={13}/></a>}</article>)}</div>;
}

export function CloudExhibit({ projects, onInspect }: Props) {
  const records = engineeringRecords('cloud');
  return <div className="verse-cloud-exhibit">
    <div className="verse-exhibit-intro"><span className="verse-exhibit-emblem"><Cloud size={29}/></span><div><p className="verse-eyebrow">CLOUD & BACKEND</p><h3>Services, data & delivery.</h3><p>Backend services, local cloud environments, and the tools behind reliable workflows.</p></div></div>
    <div className="verse-cloud-modules">{['Cloud', 'Backend', 'Databases'].map(category => {
      const group = skillGroups.find(group => group.category === category)!;
      const Icon = category === 'Cloud' ? Cloud : category === 'Backend' ? ServerCog : Database;
      return <section key={category}><Icon size={24}/><h4>{category}</h4><div className="verse-tags">{group.skills.map(skill => <span key={skill.name}>{skill.name}</span>)}</div></section>;
    })}</div>
    <h3 className="verse-section-title">Public learning labs</h3>
    <div className="verse-cloud-projects">{projects.map(project => <TouchButton key={project.id} onClick={() => onInspect(project)} aria-label={`Inspect ${project.title}`}><span className="verse-cloud-project-icon"><ServerCog size={24}/></span><div><div className="verse-cloud-project-heading"><h4>{project.title}</h4><small>{project.status}</small></div><p>{project.description}</p><div className="verse-tags">{project.technologies.map(technology => <span key={technology}>{technology}</span>)}</div></div><ArrowUpRight size={19}/></TouchButton>)}</div>
    <h3 className="verse-section-title">Engineering in practice</h3>
    <div className="verse-cloud-records">{records.filter(record => record.type === 'work').map(record => <RecordCard key={record.id} record={record} area="cloud"/>)}</div>
    <h3 className="verse-section-title">Credentials & foundations</h3>
    <div className="verse-cloud-records">{records.filter(record => record.type !== 'work').map(record => <RecordCard key={record.id} record={record} area="cloud"/>)}</div>
    <h3 className="verse-section-title">Supporting toolkit</h3><SkillLibrary categories={['Languages', 'Tools']}/>
  </div>;
}

export function AILab({ projects, onInspect }: Props) {
  const [view, setView] = useState<'projects' | 'applied' | 'learning'>('projects');
  const records = engineeringRecords('ai');
  return <div className="verse-ai-exhibit">
    <div className="verse-exhibit-intro"><span className="verse-exhibit-emblem"><Sparkles size={29}/></span><div><p className="verse-eyebrow">THE EXPERIMENT LAB</p><h3>Products, models & experiments.</h3><p>Explore public projects, applied AI work, and the study behind them.</p></div></div>
    <nav className="verse-ai-views" aria-label="AI Nexus sections">{(['projects', 'applied', 'learning'] as const).map(section => <TouchButton key={section} aria-pressed={view === section} onClick={() => setView(section)}>{section === 'projects' ? 'Projects' : section === 'applied' ? 'Applied AI' : 'Learning'}</TouchButton>)}</nav>
    {view === 'projects' && <><h3 className="verse-section-title">Public projects & experiments</h3><div className="verse-ai-projects">{projects.map((project, index) => <TouchButton key={project.id} onClick={() => onInspect(project)} aria-label={`Inspect ${project.title}`}><div className="verse-ai-project-image"><img src={resolveAsset(project.image)} alt="" loading={index < 2 ? 'eager' : 'lazy'}/><span>{project.status ?? project.category[0]}</span></div><div className="verse-ai-project-copy"><h4>{project.title}</h4><p>{project.description}</p><div className="verse-tags">{project.technologies.map(technology => <span key={technology}>{technology}</span>)}</div><span className="verse-ai-project-action">Explore experiment <ArrowUpRight size={16}/></span></div></TouchButton>)}</div></>}
    {view === 'applied' && <><h3 className="verse-section-title">Applied AI toolkit</h3><SkillLibrary categories={['AI']}/><h3 className="verse-section-title">From experiments to applied work</h3><div className="verse-ai-records">{records.filter(record => record.type === 'work').map(record => <RecordCard key={record.id} record={record} area="ai"/>)}</div></>}
    {view === 'learning' && <><h3 className="verse-section-title">Study & credentials</h3><p className="verse-body-copy">The courses and education behind the experiments.</p><div className="verse-ai-records">{records.filter(record => record.type !== 'work').map(record => <RecordCard key={record.id} record={record} area="ai"/>)}</div></>}
  </div>;
}

function RecordCard({ record, area }: { record: ExperienceItem; area: 'cloud' | 'ai' }) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const descriptions = Array.isArray(record.description) ? record.description : [record.description];
  const relevant = area === 'ai' ? descriptions.findIndex(description => /\bAI\b|machine learning|computer vision|YOLO|data science/i.test(description)) : 0;
  const lead = Math.max(0, relevant), rest = descriptions.filter((_, i) => i !== lead);
  const Icon = record.type === 'work' ? (area === 'cloud' ? ServerCog : FlaskConical) : record.type === 'education' ? GraduationCap : BadgeCheck;
  return <article className={`verse-${area}-record`}>
    <header><span className="verse-record-icon"><Icon size={22}/></span><div><small>{record.type === 'work' ? 'APPLIED WORK' : record.type === 'education' ? 'EDUCATION' : 'CREDENTIAL'} · {record.period || record.date}</small><h4>{record.role || record.title}</h4><p>{record.company || record.organization}{record.location && ` · ${record.location}`}</p></div></header>
    <p className="verse-record-lead">{descriptions[lead]}</p>
    {rest.length > 0 && <><TouchButton className="verse-record-toggle" aria-expanded={expanded} aria-controls={detailsId} onClick={() => setExpanded(!expanded)}>{expanded ? 'Hide details' : 'Read details'} <span aria-hidden="true">{expanded ? '−' : '+'}</span></TouchButton><div id={detailsId} className="verse-record-details" hidden={!expanded}>{rest.map((description, i) => <p key={i}>{description}</p>)}</div></>}
    {record.skills && <div className="verse-tags">{record.skills.map(skill => <span key={skill}>{skill}</span>)}</div>}
    {record.link && <a className="verse-credential-link" href={record.link} target="_blank" rel="noopener noreferrer">View credential <ArrowUpRight size={14}/></a>}
  </article>;
}

export function SkillLibrary({ categories }: { categories?: string[] }) {
  return <div className="verse-skill-library">{skillGroups.filter(group => !categories || categories.includes(group.category)).sort((a, b) => categories ? categories.indexOf(a.category) - categories.indexOf(b.category) : 0).map(group => <section key={group.category}><h4>{group.category}</h4><div className="verse-tags">{group.skills.map(skill => <span key={skill.name}>{skill.name}</span>)}</div></section>)}</div>;
}

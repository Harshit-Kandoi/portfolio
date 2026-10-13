import { experience } from '../data/experience';
import { skills } from '../data/skills';

// Reuse portfolio records so exhibits stay current when the classic portfolio changes.
export const skillGroups = [...new Set(skills.map(skill => skill.category))].map(category => ({
  category, skills: skills.filter(skill => skill.category === category),
}));
const cloudTopics = /GCP|Google Cloud|Cloud|Firestore|Pub\/Sub|App Engine|Docker|Container|API|Backend|System Design|Distributed Systems|Architecture/i;
const aiTopics = /\bAI\b|Machine Learning|Deep Learning|Computer Vision|YOLO|PyTorch|Data Science|Scikit/i;
export function engineeringRecords(area: 'cloud' | 'ai') {
  const topics = area === 'cloud' ? cloudTopics : aiTopics;
  return experience.filter(entry => topics.test([entry.role, entry.title, ...(entry.skills ?? [])].join(' ')));
}

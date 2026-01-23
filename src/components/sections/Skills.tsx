import React from 'react';
import SectionTitle from '../ui/SectionTitle';
import ProgressBar from '../ui/ProgressBar';
import { skills } from '../../data/skills';

const Skills: React.FC = () => {
  // Updated categories to match backend + cloud positioning
  const categories = ['Languages', 'Backend', 'Cloud', 'AI', 'Tools', 'Soft Skills'];

  const skillsByCategory = categories.reduce((acc, category) => {
    acc[category] = skills.filter(skill => skill.category === category);
    return acc;
  }, {} as Record<string, typeof skills>);

  return (
    <section id="skills" className="py-20 bg-white dark:bg-gray-900">
      <div className="section-container">
        <SectionTitle 
          title="Technical Skills" 
          subtitle="Technologies and competencies I use to build backend systems, cloud-native services, and AI-enabled solutions."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Left column */}
          <div>
            {/* Languages */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-2 border-b">
                Programming Languages
              </h3>
              <div className="space-y-6">
                {skillsByCategory['Languages'].map((skill, index) => (
                  <ProgressBar 
                    key={index}
                    label={skill.name}
                    percentage={skill.proficiency}
                    color="bg-primary-500"
                    height="h-3"
                  />
                ))}
              </div>
            </div>

            {/* Backend */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-2 border-b">
                Backend & APIs
              </h3>
              <div className="space-y-6">
                {skillsByCategory['Backend'].map((skill, index) => (
                  <ProgressBar 
                    key={index}
                    label={skill.name}
                    percentage={skill.proficiency}
                    color="bg-secondary-500"
                    height="h-3"
                  />
                ))}
              </div>
            </div>

            {/* AI */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-2 border-b">
                Applied AI
              </h3>
              <div className="space-y-6">
                {skillsByCategory['AI'].map((skill, index) => (
                  <ProgressBar 
                    key={index}
                    label={skill.name}
                    percentage={skill.proficiency}
                    color="bg-accent-500"
                    height="h-3"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div>
            {/* Cloud */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-2 border-b">
                Cloud & DevOps
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {skillsByCategory['Cloud'].map((skill, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{skill.name}</h4>
                      <span className="text-sm font-medium text-primary-600">
                        {skill.proficiency}%
                      </span>
                    </div>
                    <ProgressBar 
                      percentage={skill.proficiency}
                      color="bg-primary-500"
                      showPercentage={false}
                      height="h-2"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-2 border-b">
                Tools & Workflow
              </h3>
              <div className="grid grid-cols-2 gap-6">
                {skillsByCategory['Tools'].map((skill, index) => (
                  <ProgressBar 
                    key={index}
                    label={skill.name}
                    percentage={skill.proficiency}
                    color="bg-secondary-500"
                    height="h-3"
                  />
                ))}
              </div>
            </div>

            {/* Soft Skills */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-2 border-b">
                Professional Skills
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {skillsByCategory['Soft Skills'].map((skill, index) => (
                  <ProgressBar 
                    key={index}
                    label={skill.name}
                    percentage={skill.proficiency}
                    color="bg-accent-500"
                    height="h-3"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Specialized Areas */}
        <div className="mt-16">
          <h3 className="text-xl font-semibold text-center mb-10">
            Core Engineering Focus
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Backend Engineering',
                description: 'Designing scalable backend services, APIs, and internal tools to support production workflows.',
              },
              {
                title: 'Cloud-Native Systems',
                description: 'Building and deploying applications on GCP using Cloud Functions, App Engine, and event-driven services.',
              },
              {
                title: 'AI-Driven Automation',
                description: 'Applying AI to reduce manual data processing, improve accuracy, and optimize backend systems.',
              },
              {
                title: 'System Reliability',
                description: 'Focusing on performance, maintainability, and reliability across cloud-based applications.',
              }
            ].map((area, index) => (
              <div
                key={index}
                className="rounded-lg p-6 bg-gray-50 dark:bg-gray-800 hover:-translate-y-1 transition-transform"
              >
                <h4 className="text-lg font-semibold mb-3">
                  {area.title}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {area.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Skills;
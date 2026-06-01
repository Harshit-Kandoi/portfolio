import React, { useState } from 'react';
import SectionTitle from '../ui/SectionTitle';
import { experience } from '../../data/experience';
import { Briefcase, GraduationCap, Award, ExternalLink } from 'lucide-react';

const Experience: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'education' | 'work' | 'certification'>('work');

  // Filter experience items based on active tab
  const filteredExperience = experience.filter(item => {
    if (activeTab === 'certification') {
      return item.type === 'Course' || item.type === 'Participation';
    }
    return item.type === activeTab;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'work':
        return <Briefcase size={20} className="text-primary-500" />;
      case 'education':
        return <GraduationCap size={20} className="text-secondary-500" />;
      case 'Course':
      case 'Participation':
        return <Award size={20} className="text-accent-500" />;
      default:
        return null;
    }
  };

  return (
    <section id="experience" className="py-20 bg-white dark:bg-gray-900">
      <div className="section-container">
        <SectionTitle
          title="Experience"
          subtitle="A chronological snapshot of my professional roles, academic background, and technical certifications."
        />

        {/* Tab navigation */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12">
          <button
            onClick={() => setActiveTab('work')}
            className={`px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${activeTab === 'work'
              ? 'bg-primary-500 text-white shadow-lg scale-105'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
          >
            Work Experience
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={`px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${activeTab === 'education'
              ? 'bg-primary-500 text-white shadow-lg scale-105'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
          >
            Education
          </button>
          <button
            onClick={() => setActiveTab('certification')}
            className={`px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${activeTab === 'certification'
              ? 'bg-primary-500 text-white shadow-lg scale-105'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
          >
            Certifications
          </button>
        </div>

        {/* Content sections */}
        <div className="max-w-4xl mx-auto">
          {activeTab !== 'certification' ? (
            // Timeline view for education and work
            <div className="relative pl-5 ml-2 sm:ml-0 border-l-2 border-gray-200 dark:border-gray-700">
              {filteredExperience.map((item, index) => (
                <div
                  key={item.id}
                  className={`mb-12 ml-6 ${index === 0 ? 'animate-fade-in' : ''}`}
                >
                  {/* Timeline point */}
                  <div className="absolute w-12 h-12 rounded-full bg-white dark:bg-gray-800 border-4 border-primary-500 dark:border-primary-400 flex items-center justify-center -left-6">
                    {getIcon(item.type)}
                  </div>

                  {/* Content card */}
                  <div className="card hover:-translate-y-1 transition-transform">
                    <div className="p-6">
                      {/* Header section with title and date */}
                      <div className="mb-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {item.role}
                          </h3>
                          <span className="text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-full self-start sm:self-auto">
                            {item.period}
                          </span>
                        </div>
                      </div>

                      {/* Company and location */}
                      <div className="flex flex-col sm:flex-row sm:items-center text-gray-600 dark:text-gray-400 mb-4 gap-1 sm:gap-0">
                        <span className="font-medium">{item.company}</span>
                        <span className="hidden sm:inline mx-2">•</span>
                        <span className="text-sm sm:text-base">{item.location}</span>
                      </div>

                      <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                        {Array.isArray(item.description) ? (
                          item.description.map((desc: string, idx: number) => (
                            <li key={idx}>{desc}</li>
                          ))
                        ) : (
                          <li>{item.description}</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Grid view for certifications
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredExperience.map((cert) => (
                <div key={cert.id} className="card hover:-translate-y-1 transition-transform">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {cert.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {cert.organization}
                        </p>
                      </div>
                      <div className="text-accent-500">
                        <Award size={24} />
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                      {cert.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {cert.date}
                      </span>
                      <a
                        href={cert.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:underline text-sm"
                      >
                        View Certificate
                        <ExternalLink size={14} className="ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Experience;
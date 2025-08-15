import React from 'react';
import SectionTitle from '../ui/SectionTitle';
import ProgressBar from '../ui/ProgressBar';
import { skills } from '../../data/skills';

const Skills: React.FC = () => {
  // Group skills by category
  const categories = ['Languages', 'Libraries', 'Tools', 'Soft Skills'];
  const skillsByCategory = categories.reduce((acc, category) => {
    acc[category] = skills.filter(skill => skill.category === category);
    return acc;
  }, {} as Record<string, typeof skills>);

  return (
    <section id="skills" className="py-20 bg-white dark:bg-gray-900">
      <div className="section-container">
        <SectionTitle 
          title="My Skills" 
          subtitle="A comprehensive overview of my technical and professional capabilities in data science."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left column - Languages and Libraries */}
          <div>
            {/* Languages */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
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
            
            {/* Libraries */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                Libraries & Frameworks
              </h3>
              <div className="grid grid-cols-2 gap-6">
                {skillsByCategory['Libraries'].map((skill, index) => (
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
          </div>
          
          {/* Right column - Tools and Soft Skills */}
          <div>
            {/* Tools */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                Tools & Platforms
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {skillsByCategory['Tools'].map((skill, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-800 dark:text-gray-200">{skill.name}</h4>
                      <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                        {skill.proficiency}%
                      </span>
                    </div>
                    <ProgressBar 
                      percentage={skill.proficiency}
                      color="bg-accent-500"
                      showPercentage={false}
                      height="h-2"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Soft Skills */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                Soft Skills
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {skillsByCategory['Soft Skills'].map((skill, index) => (
                  <div key={index} className="text-center">
                    <div className="relative mx-auto mb-4">
                      <svg className="w-24 h-24">
                        <circle
                          className="text-gray-200 dark:text-gray-700"
                          strokeWidth="6"
                          stroke="currentColor"
                          fill="transparent"
                          r="36"
                          cx="44"
                          cy="44"
                        />
                        <circle
                          className="text-primary-500 dark:text-primary-400"
                          strokeWidth="6"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="36"
                          cx="44"
                          cy="44"
                          strokeDasharray={`${2 * Math.PI * 36}`}
                          strokeDashoffset={`${2 * Math.PI * 36 * (1 - skill.proficiency / 100)}`}
                          style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                        />
                      </svg>
                      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-semibold text-gray-700 dark:text-gray-300">
                        {skill.proficiency}%
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {skill.name}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Skill Areas */}
        <div className="mt-16">
          <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-10">
            Specialized Areas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Machine Learning & Predictive Modeling',
                description: 'Designing and deploying models for classification, regression, and recommendation systems using real-world datasets.',
                bgColor: 'bg-primary-500/10 dark:bg-primary-900/20',
                textColor: 'text-primary-700 dark:text-primary-300'
              },
              {
                title: 'Deep Learning & Computer Vision',
                description: 'Working with CNNs, TensorFlow, and YOLOv5 for image-based solutions like ASL hand sign detection and custom object detection.',
                bgColor: 'bg-pink-500/10 dark:bg-pink-900/20',
                textColor: 'text-pink-700 dark:text-pink-300'
              },
              {
                title: 'Data Visualization & Storytelling',
                description: 'Creating insightful dashboards and visual reports using Tableau, Matplotlib, and Seaborn for decision-making.',
                bgColor: 'bg-accent-500/10 dark:bg-accent-900/20',
                textColor: 'text-accent-700 dark:text-accent-300'
              },
              {
                title: 'Web App Development & API Integration',
                description: 'Building interactive web apps with Streamlit and Flask, integrating APIs, and automating workflows for scalable solutions.',
                bgColor: 'bg-yellow-500/10 dark:bg-yellow-900/20',
                textColor: 'text-yellow-700 dark:text-yellow-300'
              }
            ].map((area, index) => (
              <div 
                key={index}
                className={`rounded-lg p-6 ${area.bgColor} transition-transform hover:-translate-y-1`}
              >
                <h4 className={`text-lg font-semibold mb-3 ${area.textColor}`}>
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
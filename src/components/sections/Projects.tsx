import React, { useState } from 'react';
import { ExternalLink, Github } from 'lucide-react';
import { projects } from '../../data/projects';
import SectionTitle from '../ui/SectionTitle';

const Projects: React.FC = () => {
  const allCategories = ['All', ...new Set(projects.flatMap(project => project.category))];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProjects = activeCategory === 'All'
    ? projects.filter(project => !project.featured)
    : projects.filter(project => project.category.includes(activeCategory));

  const ProjectCard = ({ project, isFeatured = false }: { project: any; isFeatured?: boolean }) => (
    <div 
      key={project.id} 
      className="card group hover:transform hover:-translate-y-2 transition-all overflow-hidden"
    >
      <div className={`relative ${isFeatured ? 'h-56' : 'h-48'} overflow-hidden`}>
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
          <div className="p-4 w-full">
            <div className="flex justify-end space-x-3">
              {project.github && (
                <a 
                  href={project.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors"
                  aria-label="View GitHub Repository"
                >
                  <Github size={20} />
                </a>
              )}
              {project.demo && (
                <a 
                  href={project.demo} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors"
                  aria-label="View Live Demo"
                >
                  <ExternalLink size={20} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className={`text-${isFeatured ? 'xl' : 'lg'} font-semibold text-gray-900 dark:text-white mb-2`}>
          {project.title}
        </h3>
        <p className={`text-gray-600 dark:text-gray-400 mb-4 ${isFeatured ? '' : 'text-sm'}`}>
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {project.technologies.slice(0, 3).map((tech: string, index: number) => (
            <span 
              key={index}
              className="px-3 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 text-xs rounded-full"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 3 && (
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
              +{project.technologies.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <section id="projects" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="section-container">
        <SectionTitle 
          title="My Projects" 
          subtitle="Explore a selection of data science and machine learning projects I've worked on."
        />
        
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-primary-500 text-white dark:bg-primary-600'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Projects */}
        {activeCategory === 'All' && (
          <div className="mb-16">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-8 text-center">
              Featured Projects
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {projects.filter(project => project.featured).map((project) => (
                <ProjectCard key={project.id} project={project} isFeatured />
              ))}
            </div>
          </div>
        )}

        {/* All Projects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;

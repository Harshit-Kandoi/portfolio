import React from 'react';
import SectionTitle from '../ui/SectionTitle';
import { blogPosts } from '../../data/blogs';
import { Calendar, ExternalLink } from 'lucide-react';

const Blog: React.FC = () => {
  return (
    <section id="blog" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="section-container">
        <SectionTitle 
          title="Blog & Articles" 
          subtitle="Sharing insights, tutorials, and thoughts on data science, machine learning, and more."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogPosts.map((post) => (
            <a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="card hover:-translate-y-2 hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-medium px-3 py-1">
                  {post.category}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                  {post.title}
                  <ExternalLink size={16} className="inline-block ml-2" />
                </h3>
                
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
                  <Calendar size={16} className="mr-1" />
                  <span>{post.date}</span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {post.excerpt}
                </p>
                
                <div className="text-primary-600 dark:text-primary-400 font-medium text-sm group-hover:underline">
                  Read More
                </div>
              </div>
            </a>
          ))}
        </div>
        
        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2 text-center">
            Interested in more articles about data science?
          </p>
          <a
            href="https://medium.com/@kandoiharshitsdlp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-primary-600 dark:text-primary-400 font-medium hover:underline"
          >
            Follow me on Medium
            <ExternalLink size={16} className="ml-1" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Blog;

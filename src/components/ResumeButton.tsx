import React from 'react';
import { FileText } from 'lucide-react';
import { resumeLink } from '../data/navigation';
import Button from './ui/Button';

const ResumeButton: React.FC = () => {
  return (
    <section className="py-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Interested in my qualifications?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
          Download my resume to get a detailed overview of my skills, experience, and education.
        </p>
        <a 
          href={resumeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
        >
          <Button
            variant="primary"
            size="lg"
            icon={<FileText size={20} />}
          >
            Download Resume
          </Button>
        </a>
      </div>
    </section>
  );
};

export default ResumeButton;
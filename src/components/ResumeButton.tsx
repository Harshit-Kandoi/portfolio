import React from 'react';
import { FileText } from 'lucide-react';
import { resumeLink } from '../data/navigation';
import Button from './ui/Button';

const ResumeButton: React.FC = () => {
  return (
    <section className="py-8 sm:py-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Interested in my qualifications?
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-5 sm:mb-6 max-w-2xl mx-auto">
          Download my resume to get a detailed overview of my skills, experience, and education.
        </p>
        <div className="flex justify-center">
          <a
            href={resumeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full sm:w-auto max-w-xs"
          >
            <Button
              variant="primary"
              size="lg"
              icon={<FileText size={20} />}
              className="w-full sm:w-auto"
            >
              Download Resume
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ResumeButton;
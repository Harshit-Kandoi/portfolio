import React from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  center?: boolean;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  center = true
}) => {
  return (
    <div className={`mb-12 ${center ? 'text-center' : ''}`}>
      <h2 className="section-title inline-block pb-4 mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto ${center ? 'text-center' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;
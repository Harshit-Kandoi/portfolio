import React from 'react';

interface ProgressBarProps {
  percentage: number;
  label?: string;
  color?: string;
  showPercentage?: boolean;
  height?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  label,
  color = 'bg-primary-500',
  showPercentage = true,
  height = 'h-2.5'
}) => {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{percentage}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full dark:bg-gray-700 ${height}`}>
        <div 
          className={`${color} rounded-full ${height} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
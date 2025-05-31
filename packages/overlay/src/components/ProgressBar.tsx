import React from 'react';
import { OverlayTheme } from '@elite-locker/shared-types';
import './ProgressBar.css';

interface ProgressBarProps {
  progress: {
    current: number;
    total: number;
    percentage: number;
    label?: string;
  };
  theme: OverlayTheme;
  showLabel?: boolean;
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  theme,
  showLabel = true,
  showPercentage = true,
}) => {
  const { current, total, percentage, label } = progress;

  return (
    <div className={`progress-bar-container theme-${theme}`}>
      {showLabel && label && (
        <div className="progress-label">
          {label}
        </div>
      )}
      
      <div className="progress-bar-wrapper">
        <div className="progress-bar-track">
          <div 
            className="progress-bar-fill"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        
        {showPercentage && (
          <div className="progress-text">
            {current}/{total} ({Math.round(percentage)}%)
          </div>
        )}
      </div>
    </div>
  );
};

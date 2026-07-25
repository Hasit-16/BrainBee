import React from 'react';

export interface ProgressBarProps {
  progressPercentage: number;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progressPercentage,
  label,
  className = '',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progressPercentage));

  return (
    <div className={`w-full ${className}`.trim()}>
      {label && <label className="clay-label">{label}</label>}
      <div className="clay-progress-track">
        <div
          className="clay-progress-bar"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

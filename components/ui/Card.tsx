import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'blue' | 'green' | 'yellow' | 'orange' | 'pink' | 'purple';
  interactive?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'white',
  interactive = false,
  children,
  className = '',
  ...props
}) => {
  const baseClass = 'clay-card';
  
  let variantClass = '';
  if (variant !== 'white') {
    variantClass = `clay-card-${variant}`;
  }

  const interactiveClass = interactive ? 'clay-card-interactive' : '';

  const combinedClassName = `${baseClass} ${variantClass} ${interactiveClass} ${className}`.trim();

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
};

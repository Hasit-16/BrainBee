import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'blue' | 'yellow' | 'green' | 'pink' | 'purple' | 'orange' | 'default';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
  ...props
}) => {
  const baseClass = 'clay-badge';
  const variantClass = variant !== 'default' ? `clay-badge-${variant}` : '';
  const combinedClassName = `${baseClass} ${variantClass} ${className}`.trim();

  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
};

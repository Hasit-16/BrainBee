import React from 'react';
import { playSound } from '@/lib/sound';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'warning' | 'danger' | 'purple' | 'orange' | 'white' | 'disabled';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  disableSound?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  disableSound = false,
  onClick,
  ...props
}) => {
  const baseClass = 'clay-btn';
  
  let variantClass = '';
  switch (variant) {
    case 'secondary':
      variantClass = 'clay-btn-secondary';
      break;
    case 'warning':
      variantClass = 'clay-btn-warning';
      break;
    case 'danger':
      variantClass = 'clay-btn-danger';
      break;
    case 'purple':
      variantClass = 'clay-btn-purple';
      break;
    case 'orange':
      variantClass = 'clay-btn-orange';
      break;
    case 'white':
      variantClass = 'clay-btn-white';
      break;
    case 'disabled':
      variantClass = 'clay-btn-disabled';
      break;
    default:
      variantClass = ''; // primary uses default .clay-btn styling
  }

  let sizeClass = '';
  if (size === 'sm') sizeClass = 'clay-btn-sm';
  if (size === 'lg') sizeClass = 'clay-btn-lg';

  const combinedClassName = `${baseClass} ${variantClass} ${sizeClass} ${className}`.trim();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disableSound) {
      playSound('click');
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button className={combinedClassName} disabled={disabled || variant === 'disabled'} onClick={handleClick} {...props}>
      {children}
    </button>
  );
};

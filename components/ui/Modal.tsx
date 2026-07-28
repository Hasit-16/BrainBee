import React from 'react';
import { TrophyIcon } from '@/components/ui/Icons';

export interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay active">
      <div className="clay-modal flex flex-col items-center">
        {icon ? (
          <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>
            {icon}
          </div>
        ) : (
          <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6 shadow-inner border border-amber-200">
            <TrophyIcon className="w-12 h-12" />
          </div>
        )}
        {title && (
          <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem', color: 'var(--clay-blue)' }}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
};

import React from 'react';

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
  icon = '🏆',
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay active">
      <div className="clay-modal">
        {icon && (
          <div style={{ fontSize: '4.5rem', marginBottom: '1.5rem', animation: 'floating 2s ease-in-out infinite alternate' }}>
            {icon}
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

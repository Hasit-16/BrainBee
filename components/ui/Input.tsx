import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  id,
  className = '',
  ...props
}) => {
  return (
    <div className="clay-input-wrapper">
      {label && (
        <label className="clay-label" htmlFor={id}>
          {label}
        </label>
      )}
      <input id={id} className={`clay-input ${className}`.trim()} {...props} />
    </div>
  );
};

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  id,
  className = '',
  ...props
}) => {
  return (
    <div className="clay-input-wrapper">
      {label && (
        <label className="clay-label" htmlFor={id}>
          {label}
        </label>
      )}
      <textarea id={id} className={`clay-input clay-textarea ${className}`.trim()} {...props} />
    </div>
  );
};

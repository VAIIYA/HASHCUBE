import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-pill font-bold transition-all active:scale-95 disabled:opacity-50';

    const variants = {
      primary: 'bg-metamask-purple text-white hover:bg-opacity-90 shadow-md',
      secondary: 'bg-metamask-orange text-white hover:bg-opacity-90 shadow-md',
      outline: 'border-2 border-metamask-purple text-metamask-purple hover:bg-metamask-purple hover:text-white',
    };

    const sizes = {
      sm: 'px-4 py-1.5 text-sm',
      md: 'px-8 py-3 text-base',
      lg: 'px-10 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full bg-white border border-gray-200 rounded-pill px-6 py-4 focus:outline-none focus:ring-2 focus:ring-metamask-orange/50 pill-shadow transition-all ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full bg-white border border-gray-200 rounded-[24px] px-6 py-4 focus:outline-none focus:ring-2 focus:ring-metamask-orange/50 pill-shadow transition-all min-h-[120px] resize-none ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

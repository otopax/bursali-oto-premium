import React from 'react';

/**
 * Enterprise Reusable Button Component
 * Supports variants: primary, secondary, outline, ghost
 */
export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false,
  ...props 
}) {
  
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--border-radius)',
    fontWeight: '500',
    transition: 'var(--transition)',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.7 : 1,
    border: 'none',
    fontFamily: 'var(--font-inter)',
  };

  const sizes = {
    sm: { padding: '8px 16px', fontSize: '0.875rem' },
    md: { padding: '12px 24px', fontSize: '1rem' },
    lg: { padding: '16px 32px', fontSize: '1.125rem' }
  };

  const variants = {
    primary: {
      background: 'var(--accent-blue)',
      color: '#fff',
      boxShadow: '0 4px 14px 0 rgba(0, 113, 227, 0.39)',
    },
    secondary: {
      background: 'var(--bg-lighter)',
      color: 'var(--text-light)',
      border: '1px solid var(--glass-border)'
    },
    outline: {
      background: 'transparent',
      color: 'var(--accent-gold)',
      border: '1px solid var(--accent-gold)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-muted)'
    }
  };

  const mergedStyle = {
    ...baseStyle,
    ...sizes[size],
    ...variants[variant]
  };

  return (
    <button style={mergedStyle} className={`ui-button ${className}`} disabled={isLoading} {...props}>
      {isLoading ? <span style={{ marginRight: '8px' }}>Loading...</span> : null}
      {children}
    </button>
  );
}

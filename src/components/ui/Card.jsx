import React from 'react';

/**
 * Enterprise Reusable Card Component
 * Leverages Glassmorphism and premium border radius.
 */
export default function Card({ 
  children, 
  title, 
  description,
  className = '', 
  ...props 
}) {
  
  const cardStyle = {
    background: 'var(--bg-card)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: 'var(--glass-glow)',
    transition: 'var(--transition)',
    color: 'var(--text-light)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  return (
    <div style={cardStyle} className={`ui-card ${className}`} {...props}>
      {(title || description) && (
        <div style={{ marginBottom: '8px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
          {title && <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--accent-gold)' }}>{title}</h3>}
          {description && <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{description}</p>}
        </div>
      )}
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}

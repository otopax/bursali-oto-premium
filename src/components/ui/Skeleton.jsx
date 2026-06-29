import React from 'react';

/**
 * Skeleton Loader Component
 * Displays the shimmering placeholder animation while AI/API loads data.
 */
export default function Skeleton({ 
  width = '100%', 
  height = '24px', 
  borderRadius = 'var(--border-radius)',
  className = '' 
}) {
  
  const style = {
    width,
    height,
    borderRadius,
    display: 'inline-block'
  };

  // Uses the .skeleton-loader class defined in globals.css
  return (
    <div 
      style={style} 
      className={`skeleton-loader ${className}`} 
      aria-hidden="true"
    />
  );
}

/**
 * Convenience wrapper for a paragraph of skeletons
 */
export function SkeletonParagraph({ lines = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          width={i === lines - 1 ? '70%' : '100%'} 
          height="16px" 
        />
      ))}
    </div>
  );
}

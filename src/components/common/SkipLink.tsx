
import React from 'react';

interface SkipLinkProps {
  href?: string;
  target?: string;
  label?: string;
}

/**
 * Skip link allows keyboard users to bypass navigation and jump straight to main content
 * It's visually hidden but appears when focused with keyboard navigation
 */
const SkipLink: React.FC<SkipLinkProps> = ({ 
  href = "#main-content", 
  target,
  label = "Skip to main content" 
}) => {
  const skipTarget = target || href;
  
  return (
    <a
      href={skipTarget}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:outline-none focus:rounded-md"
    >
      {label}
    </a>
  );
};

export default SkipLink;

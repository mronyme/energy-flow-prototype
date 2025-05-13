
import React from 'react';

/**
 * Skip link allows keyboard users to bypass navigation and jump straight to main content
 * It's visually hidden but appears when focused with keyboard navigation
 */
const SkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:outline-none focus:rounded-md"
    >
      Skip to main content
    </a>
  );
};

export default SkipLink;

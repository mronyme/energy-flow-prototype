
import React from 'react';
import SkipLink from './SkipLink';

// Adapter component to handle prop difference
interface SkipLinkProps {
  href?: string;
  label?: string;
  target?: string;
  [key: string]: any; // Allow additional props
}

const SkipLinkAdapter = ({
  href,
  label,
  target,
  ...rest
}: SkipLinkProps) => {
  // Use either href or target, with target taking precedence if provided
  const linkTarget = target || href || '#main-content';
  
  return <SkipLink href={linkTarget} label={label || 'Skip to content'} {...rest} />;
};

export default SkipLinkAdapter;

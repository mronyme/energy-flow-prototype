
import React from 'react';
import SkipLink from './SkipLink';
import { SkipLinkProps } from '@/types';

// Adapter component to handle prop difference
const SkipLinkAdapter = ({
  href,
  label,
  target
}: SkipLinkProps) => {
  // Use either href or target, with target taking precedence if provided
  const linkTarget = target || href || '#main-content';
  
  return <SkipLink href={linkTarget} label={label} />;
};

export default SkipLinkAdapter;

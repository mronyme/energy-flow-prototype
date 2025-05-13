
import React from 'react';
import SkipLink from './SkipLink';
import { SkipLinkProps } from '@/types';

// Adapter component to handle prop difference
const SkipLinkAdapter = ({
  href,
  label
}: SkipLinkProps) => {
  return <SkipLink target={href} label={label} />;
};

export default SkipLinkAdapter;

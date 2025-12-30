'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * VM2 Text Component
 * Renders text with usageHint support for different HTML elements
 * Requirements: 4.2
 * 
 * @param {Object} props
 * @param {Object} props.text - Text content with literalString property
 * @param {string} props.usageHint - HTML element hint (h1, h2, h3, p, span)
 */
export function Text({ text, usageHint = 'p' }) {
  const content = text?.literalString || '';

  const styles = {
    h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
    h2: 'scroll-m-20 text-3xl font-semibold tracking-tight',
    h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
    p: 'leading-7 [&:not(:first-child)]:mt-6',
    span: ''
  };

  const className = cn(styles[usageHint] || styles.p);

  switch (usageHint) {
    case 'h1':
      return <h1 className={className}>{content}</h1>;
    case 'h2':
      return <h2 className={className}>{content}</h2>;
    case 'h3':
      return <h3 className={className}>{content}</h3>;
    case 'span':
      return <span className={className}>{content}</span>;
    case 'p':
    default:
      return <p className={className}>{content}</p>;
  }
}

export default Text;

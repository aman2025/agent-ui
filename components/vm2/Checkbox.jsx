'use client';

import * as React from 'react';
import { Checkbox as CheckboxBase } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

/**
 * VM2 Checkbox Component
 * Renders a checkbox with state binding support
 * Requirements: 4.2, 4.3
 * 
 * @param {Object} props
 * @param {Object} props.value - Value binding with path property
 * @param {string} props.label - Label text
 * @param {Function} props.onValueChange - Callback when value changes
 * @param {boolean} props.currentValue - Current checked state from state
 */
export function Checkbox({
  value,
  label,
  onValueChange,
  currentValue = false
}) {
  const path = value?.path;

  const handleChange = (e) => {
    if (onValueChange && path) {
      onValueChange(path, e.target.checked);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <CheckboxBase
        id={path}
        checked={currentValue}
        onChange={handleChange}
      />
      {label && (
        <Label htmlFor={path} className="cursor-pointer">
          {label}
        </Label>
      )}
    </div>
  );
}

export default Checkbox;

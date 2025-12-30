'use client';

import * as React from 'react';
import { Select as SelectBase, SelectOption } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

/**
 * VM2 Select Component
 * Renders a select dropdown with options
 * Requirements: 4.2, 4.3
 * 
 * @param {Object} props
 * @param {Object} props.value - Value binding with path property
 * @param {Array} props.options - Array of { value, label } options
 * @param {string} props.label - Label text
 * @param {boolean} props.required - Whether field is required
 * @param {Function} props.onValueChange - Callback when value changes
 * @param {string} props.currentValue - Current value from state
 */
export function Select({
  value,
  options = [],
  label,
  required,
  onValueChange,
  currentValue = ''
}) {
  const path = value?.path;

  const handleChange = (e) => {
    if (onValueChange && path) {
      onValueChange(path, e.target.value);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={path}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <SelectBase
        id={path}
        value={currentValue}
        onChange={handleChange}
        required={required}
      >
        <SelectOption value="">Select an option...</SelectOption>
        {options.map((option, index) => (
          <SelectOption key={option.value || index} value={option.value}>
            {option.label}
          </SelectOption>
        ))}
      </SelectBase>
    </div>
  );
}

export default Select;

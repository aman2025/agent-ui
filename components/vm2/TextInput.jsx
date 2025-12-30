'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * VM2 TextInput Component
 * Renders a text input with state binding support
 * Requirements: 4.2, 4.3
 * 
 * @param {Object} props
 * @param {Object} props.value - Value binding with path property
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.label - Label text
 * @param {boolean} props.required - Whether field is required
 * @param {Function} props.onValueChange - Callback when value changes
 * @param {string} props.currentValue - Current value from state
 */
export function TextInput({
  value,
  placeholder,
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
      <Input
        id={path}
        type="text"
        placeholder={placeholder}
        value={currentValue}
        onChange={handleChange}
        required={required}
      />
    </div>
  );
}

export default TextInput;

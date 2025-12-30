'use client';

import * as React from 'react';
import { Button as ButtonBase } from '@/components/ui/button';

/**
 * VM2 Button Component
 * Renders a button with action handler and child reference support
 * Requirements: 4.2, 4.4, 4.5
 * 
 * @param {Object} props
 * @param {string} props.child - Reference to child component ID
 * @param {Object} props.action - Action definition with name property (action_id)
 * @param {string} props.variant - Button variant (primary, secondary, destructive)
 * @param {Function} props.onAction - Callback when button is clicked
 * @param {React.ReactNode} props.childComponent - Resolved child component to render
 */
export function Button({
  child,
  action,
  variant = 'primary',
  onAction,
  childComponent
}) {
  // Map VM2 variants to shadcn/ui variants
  const variantMap = {
    primary: 'default',
    secondary: 'secondary',
    destructive: 'destructive'
  };

  const buttonVariant = variantMap[variant] || 'default';
  const actionId = action?.name;

  const handleClick = () => {
    if (onAction && actionId) {
      onAction(actionId);
    }
  };

  return (
    <ButtonBase
      variant={buttonVariant}
      onClick={handleClick}
    >
      {childComponent || 'Submit'}
    </ButtonBase>
  );
}

export default Button;

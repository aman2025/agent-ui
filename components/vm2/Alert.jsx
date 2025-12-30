'use client';

import * as React from 'react';
import { Alert as AlertBase, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

/**
 * VM2 Alert Component
 * Renders an alert with type variants (success, error, warning, info)
 * Requirements: 4.2
 * 
 * @param {Object} props
 * @param {string} props.type - Alert type (success, error, warning, info)
 * @param {string} props.title - Alert title
 * @param {string} props.message - Alert message
 */
export function Alert({ type = 'info', title, message }) {
  // Map VM2 types to shadcn/ui variants
  const variantMap = {
    success: 'success',
    error: 'destructive',
    warning: 'warning',
    info: 'info'
  };

  const IconMap = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const variant = variantMap[type] || 'default';
  const Icon = IconMap[type] || Info;

  return (
    <AlertBase variant={variant}>
      <Icon className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      {message && <AlertDescription>{message}</AlertDescription>}
    </AlertBase>
  );
}

export default Alert;

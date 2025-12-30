import React from 'react';
import { AlertCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  className?: string;
  onDismiss?: () => void;
}

/**
 * Error/message display component.
 * 
 * Displays styled messages with appropriate icons and colors.
 * 
 * Usage:
 *   <ErrorMessage message="Something went wrong" type="error" />
 *   <ErrorMessage message="Success!" type="success" onDismiss={handleClose} />
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  type = 'error',
  className,
  onDismiss
}) => {
  const typeConfig = {
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50 dark:bg-red-900/10',
      textColor: 'text-red-800 dark:text-red-400',
      iconColor: 'text-red-500',
      borderColor: 'border-red-200 dark:border-red-800',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/10',
      textColor: 'text-yellow-800 dark:text-yellow-400',
      iconColor: 'text-yellow-500',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50 dark:bg-blue-900/10',
      textColor: 'text-blue-800 dark:text-blue-400',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    success: {
      icon: AlertCircle,
      bgColor: 'bg-green-50 dark:bg-green-900/10',
      textColor: 'text-green-800 dark:text-green-400',
      iconColor: 'text-green-500',
      borderColor: 'border-green-200 dark:border-green-800',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        config.bgColor,
        config.borderColor,
        className
      )}
      role="alert"
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0', config.iconColor)} />
      <p className={cn('flex-1 text-sm font-medium', config.textColor)}>
        {message}
      </p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 hover:opacity-70 transition-opacity',
            config.textColor
          )}
          aria-label="Dismiss"
        >
          <XCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;


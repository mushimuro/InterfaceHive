import React from 'react';
import { Award } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

interface CreditBadgeProps {
  credits: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

const CreditBadge: React.FC<CreditBadgeProps> = ({
  credits,
  size = 'md',
  showIcon = true,
  showLabel = false,
  className,
}) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        'flex items-center gap-1',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Award className={iconSizes[size]} />}
      <span>
        {credits} {showLabel && (credits === 1 ? 'credit' : 'credits')}
      </span>
    </Badge>
  );
};

export default CreditBadge;


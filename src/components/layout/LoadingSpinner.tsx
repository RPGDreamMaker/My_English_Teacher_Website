import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex items-center justify-center',
        className
      )}
    >
      <Loader2 
        className={cn(
          'animate-spin',
          {
            'h-4 w-4': size === 'sm',
            'h-8 w-8': size === 'md',
            'h-12 w-12': size === 'lg',
          }
        )} 
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
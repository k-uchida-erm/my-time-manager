import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionButton?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  actionButton,
  className = "" 
}: EmptyStateProps) {
  return (
    <div className={`text-center space-y-6 ${className}`}>
      <div className="flex justify-center">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {actionButton}
    </div>
  );
} 
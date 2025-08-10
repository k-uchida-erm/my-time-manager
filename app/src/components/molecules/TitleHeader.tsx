import React from 'react';
import { Icon, Title, Subtitle } from '../atoms/ui';

interface TitleHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

export function TitleHeader({ icon, title, subtitle }: TitleHeaderProps) {
  return (
    <div className="flex items-center gap-3 lg:gap-4">
      <Icon 
        icon={icon} 
        size="w-6 h-6 lg:w-8 lg:h-8" 
        className="w-12 h-12 lg:w-16 lg:h-16" 
      />
      <div className="min-w-0 flex-1">
        <Title className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">
          {title}
        </Title>
        <Subtitle className="text-sm sm:text-base lg:text-lg mt-1 lg:mt-2">
          {subtitle}
        </Subtitle>
      </div>
    </div>
  );
} 
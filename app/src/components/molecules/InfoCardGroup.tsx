import React from 'react';
import { InfoCard } from '../atoms/ui';

interface InfoCardData {
  title: string;
  value: string | number;
  subtitle?: string;
}

interface InfoCardGroupProps {
  cards: InfoCardData[];
}

export function InfoCardGroup({ cards }: InfoCardGroupProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 flex-shrink-0">
      {cards.map((card, index) => (
        <InfoCard key={index} {...card} />
      ))}
    </div>
  );
} 
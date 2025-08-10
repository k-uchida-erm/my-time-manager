import React, { useState } from 'react';
import { ContextMenu } from './ContextMenu';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onEditTab?: (tabId: string) => void;
  onDeleteTab?: (tabId: string) => void;
  className?: string;
}

export function Tabs({ 
  tabs, 
  activeTab, 
  onTabChange, 
  onEditTab, 
  onDeleteTab, 
  className = '' 
}: TabsProps) {
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    tabId: string;
  } | null>(null);

  const handleContextMenu = (event: React.MouseEvent, tabId: string) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      tabId
    });
  };

  const handleEdit = () => {
    if (contextMenu && onEditTab) {
      onEditTab(contextMenu.tabId);
    }
  };

  const handleDelete = () => {
    if (contextMenu && onDeleteTab) {
      onDeleteTab(contextMenu.tabId);
    }
  };

  return (
    <>
      <div className={`flex ${className}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            onContextMenu={(e) => handleContextMenu(e, tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white/80 backdrop-blur-sm border-l border-t border-r border-gray-200 rounded-t-2xl text-gray-900 z-10'
                : 'text-muted-foreground hover:text-foreground bg-gray-100/50 rounded-t-lg border-l border-t border-r border-gray-200/50'
            }`}
          >
            {tab.color && (
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: tab.color }}
              />
            )}
            {tab.icon && tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* コンテキストメニュー */}
      <ContextMenu
        isVisible={contextMenu?.visible || false}
        x={contextMenu?.x || 0}
        y={contextMenu?.y || 0}
        onClose={() => setContextMenu(null)}
        onEdit={onEditTab ? handleEdit : undefined}
        onDelete={onDeleteTab ? handleDelete : undefined}
      />
    </>
  );
} 
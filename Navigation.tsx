import React from 'react';
import { CheckCircle2, Heart, Trophy, Share2 } from 'lucide-react';
import { TabType } from '../types';
import { triggerHaptic } from '../services/storage';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingCount = 0,
}) => {
  const tabs: Array<{ id: TabType; label: string; icon: React.ElementType; badge?: number }> = [
    { id: 'habits', label: 'Привычки', icon: CheckCircle2, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'pet', label: 'Кошечка', icon: Heart },
    { id: 'progress', label: 'Прогресс', icon: Trophy },
    { id: 'share', label: 'Поделиться', icon: Share2 },
  ];

  const handleSelect = (tab: TabType) => {
    if (tab !== activeTab) {
      triggerHaptic('light');
      onTabChange(tab);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#3E2C23]/95 backdrop-blur-lg border-t border-[#533C30] pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 items-center px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`relative flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] py-1 transition-all ${
                isActive ? 'text-[#F4E4A6] scale-105' : 'text-[#B8A393] hover:text-[#E6D5C7]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'stroke-[2.5px]' : 'stroke-2'
                  }`}
                />
                {tab.badge && tab.badge > 0 && !isActive && (
                  <span className="absolute -top-1 -right-2 bg-[#E76F51] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 font-medium tracking-tight whitespace-nowrap transition-colors ${
                  isActive ? 'font-semibold text-[#F4E4A6]' : 'text-[#B8A393]'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-[#F4E4A6] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

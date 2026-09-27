import React from 'react';
import { Home, Layers, Swords, Cpu, Award } from 'lucide-react';
import { hapticImpact } from '../services/telegram';

export type NavTab = 'hub' | 'data_rush' | 'dungeon' | 'forge' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'hub', label: 'Лаб', icon: Home },
    { id: 'data_rush', label: 'Данные', icon: Layers },
    { id: 'dungeon', label: 'Рейд', icon: Swords },
    { id: 'forge', label: 'Сборка', icon: Cpu },
    { id: 'profile', label: 'ВУЗ', icon: Award },
  ] as const;

  const handleSelect = (tab: NavTab) => {
    hapticImpact('light');
    onTabChange(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-cyber-bg/95 backdrop-blur-md border-t border-cyber-border px-3 py-1.5 flex justify-around items-center max-w-md mx-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleSelect(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
              isActive
                ? 'text-cyber-accent font-semibold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition-all ${
                isActive ? 'bg-cyan-500/10 shadow-[0_0_10px_rgba(0,242,254,0.25)]' : ''
              }`}
            >
              <Icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
            </div>
            <span className="text-[11px] font-mono mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

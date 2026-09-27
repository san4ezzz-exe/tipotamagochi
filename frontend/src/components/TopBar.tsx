import React from 'react';
import { Zap, Flame, Cpu, HelpCircle } from 'lucide-react';
import { hapticImpact } from '../services/telegram';

interface TopBarProps {
  computeTokens: number;
  streakDays: number;
  vram: number;
  onOpenTutorial?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  computeTokens,
  streakDays,
  vram,
  onOpenTutorial,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-cyber-bg/90 backdrop-blur-md border-b border-cyber-border px-4 py-2.5 flex items-center justify-between">
      {/* Левая часть: Стрик и Токены */}
      <div className="flex items-center gap-2.5">
        {/* Баланс вычислений */}
        <div className="flex items-center gap-1.5 bg-cyber-card/80 border border-cyber-border px-2.5 py-1 rounded-full text-xs font-mono font-medium">
          <Zap size={14} className="text-cyber-accent fill-cyber-accent animate-pulse" />
          <span className="text-white">{computeTokens}</span>
          <span className="text-gray-400 text-[10px]">FLOP</span>
        </div>

        {/* Стрик посещаемости */}
        <div className="flex items-center gap-1 bg-cyber-card/80 border border-cyber-border px-2.5 py-1 rounded-full text-xs font-mono font-medium text-amber-400">
          <Flame size={14} className="fill-amber-400" />
          <span>{streakDays}д</span>
        </div>
      </div>

      {/* Правая часть: VRAM и Справка */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-cyber-card/80 border border-cyber-border px-2.5 py-1 rounded-full text-[11px] font-mono text-gray-300">
          <Cpu size={13} className="text-cyber-purple" />
          <span>{vram}% VRAM</span>
        </div>

        {onOpenTutorial && (
          <button
            onClick={() => {
              hapticImpact('light');
              onOpenTutorial();
            }}
            title="Обучение и подсказки"
            className="p-1.5 bg-cyber-card/80 hover:bg-cyber-card border border-cyber-border rounded-full text-cyan-400 hover:text-cyan-300 transition-all flex items-center justify-center active:scale-95"
          >
            <HelpCircle size={15} />
          </button>
        )}
      </div>
    </header>
  );
};

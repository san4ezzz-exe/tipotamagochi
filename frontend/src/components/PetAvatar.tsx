import React, { useState } from 'react';
import { Pet } from '../types/game';
import { hapticImpact } from '../services/telegram';

interface PetAvatarProps {
  pet: Pet | null;
}

const QUOTES = [
  'Веса сошлись! Дай ещё данных!',
  'Кто опять тронул мой learning rate?!',
  'Внимание (Attention) — это всё, что нужно!',
  'Загляни в Neural Forge, подбери мне слой!',
  'Галлюцинирую, что мы уже сдали сессию...',
  'Байты хрустят, точность растёт!',
];

export const PetAvatar: React.FC<PetAvatarProps> = ({ pet }) => {
  const [bubbleText, setBubbleText] = useState<string>('Модель на связи! Готов к обучению ⚡');
  const [isTapped, setIsTapped] = useState<boolean>(false);

  const handlePetTap = () => {
    hapticImpact('medium');
    setIsTapped(true);
    setTimeout(() => setIsTapped(false), 300);

    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setBubbleText(randomQuote);
  };

  return (
    <div className="relative flex flex-col items-center justify-center my-3 select-none">
      {/* Облачко мыслей питомца */}
      <div className="relative mb-3 bg-cyber-card border border-cyber-border/80 px-3.5 py-1.5 rounded-2xl text-xs text-cyan-200 max-w-[280px] text-center shadow-lg shadow-cyan-950/20 animate-fade-in transition-all leading-snug">
        <span>{bubbleText}</span>
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyber-card border-r border-b border-cyber-border/80 rotate-45"></div>
      </div>

      {/* Интерактивный неоновый аватар */}
      <div
        onClick={handlePetTap}
        className={`relative cursor-pointer transition-transform duration-200 active:scale-95 ${
          isTapped ? 'scale-110' : ''
        }`}
      >
        {/* Неоновый фон/аура */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-2xl animate-pulse-glow"></div>

        {/* SVG Кибер-Питомца (GPT-Shiba / Cyber-Hound) */}
        <svg
          viewBox="0 0 200 200"
          className="w-44 h-44 drop-shadow-[0_0_20px_rgba(0,242,254,0.35)] animate-float"
        >
          {/* Внешнее кольцо параметров */}
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="#1e293b"
            strokeWidth="3"
            strokeDasharray="6 8"
          />
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="#00f2fe"
            strokeWidth="3"
            strokeDasharray="180 360"
            className="animate-spin-slow origin-center"
          />

          {/* Тело / Голова питомца */}
          <path
            d="M 60 70 L 45 35 L 75 55 Z"
            fill="#1e1b4b"
            stroke="#8b5cf6"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M 140 70 L 155 35 L 125 55 Z"
            fill="#1e1b4b"
            stroke="#8b5cf6"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <polygon
            points="55,65 145,65 160,115 100,165 40,115"
            fill="#0f172a"
            stroke="#00f2fe"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Неоновый кибер-визор (глаза нейросети) */}
          <rect
            x="62"
            y="88"
            width="76"
            height="22"
            rx="6"
            fill="#18181b"
            stroke="#f43f5e"
            strokeWidth="2"
          />
          <line
            x1="70"
            y1="99"
            x2="130"
            y2="99"
            stroke="#00f2fe"
            strokeWidth="4"
            strokeLinecap="round"
            className="animate-pulse"
          />
          <circle cx="85" cy="99" r="3" fill="#ffffff" />
          <circle cx="115" cy="99" r="3" fill="#ffffff" />

          {/* Носик и мордочка */}
          <polygon points="95,122 105,122 100,128" fill="#f43f5e" />
          <path
            d="M 94 132 Q 100 137 106 132"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Нейро-узлы (светящиеся точки) */}
          <circle cx="100" cy="50" r="4" fill="#00f2fe" className="animate-ping origin-center" />
          <line x1="100" y1="50" x2="100" y2="65" stroke="#00f2fe" strokeWidth="2" />
        </svg>

        {/* Уровень питомца (бейдж) */}
        <div className="absolute bottom-1 right-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-mono text-[11px] font-bold px-2 py-0.5 rounded-full border border-white/20 shadow-md">
          Ур. {pet?.level || 1}
        </div>
      </div>

      {/* Имя и Архетип */}
      <div className="text-center mt-2">
        <h2 className="text-base font-bold text-white tracking-wide flex items-center justify-center gap-1.5">
          <span>{pet?.name || 'GPT-Shiba'}</span>
          <span className="text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded">
            v{pet?.epoch || 1}.0
          </span>
        </h2>
        <p className="text-xs text-purple-300/80 font-medium">
          Класс: {pet?.archetype || 'Vision-CNN'}
        </p>
      </div>
    </div>
  );
};

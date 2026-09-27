import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { DatasetCard } from '../types/game';
import { api } from '../services/api';
import { hapticImpact, hapticNotification } from '../services/telegram';
import { Timer, Zap, CheckCircle2, XCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DataRushScreenProps {
  userId: number;
  onFinish: (tokensEarned: number, accuracyBonus: number) => void;
  onBack: () => void;
}

export const DataRushScreen: React.FC<DataRushScreenProps> = ({
  userId,
  onFinish,
  onBack,
}) => {
  const [cards, setCards] = useState<DatasetCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [tokensEarned, setTokensEarned] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(40);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastFeedback, setLastFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Загрузка карточек
  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const data = await api.getDataRushCards(12);
      setCards(data);
      setCurrentIndex(0);
      setCorrectCount(0);
      setTokensEarned(0);
      setTimeLeft(40);
      setIsGameOver(false);
      setLastFeedback(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Таймер раунда
  useEffect(() => {
    if (loading || isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, isGameOver, correctCount, tokensEarned]);

  const finishRound = async () => {
    setIsGameOver(true);
    hapticNotification('success');
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });

    try {
      const res = await api.submitDataRush(userId, correctCount, currentIndex, tokensEarned);
      onFinish(res.tokens_earned, res.accuracy_bonus);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnswer = (choseLeft: boolean) => {
    if (currentIndex >= cards.length || isGameOver) return;

    const currentCard = cards[currentIndex];
    const isCorrect = (choseLeft === currentCard.correct_is_left);

    if (isCorrect) {
      hapticImpact('light');
      setCorrectCount((c) => c + 1);
      setTokensEarned((t) => t + currentCard.reward_tokens);
      setLastFeedback({ isCorrect: true, text: `Верно! +${currentCard.reward_tokens} токенов` });
    } else {
      hapticNotification('error');
      setLastFeedback({ isCorrect: false, text: currentCard.explanation || 'Ошибка разметки данных!' });
    }

    if (currentIndex + 1 >= cards.length) {
      finishRound();
    } else {
      setCurrentIndex((idx) => idx + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center font-mono">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-cyan-300 text-sm">Загрузка датасетов из базы...</p>
      </div>
    );
  }

  // Экран завершения забега
  if (isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto my-auto space-y-4">
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-3xl animate-bounce">
          <CheckCircle2 size={48} className="text-emerald-400" />
        </div>

        <h2 className="text-xl font-bold text-white tracking-wide">Разметка Завершена!</h2>

        <div className="w-full bg-cyber-card border border-cyber-border p-4 rounded-2xl space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Правильных ответов:</span>
            <span className="text-cyan-400 font-bold font-mono">{correctCount} из {currentIndex}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Точность разметки:</span>
            <span className="text-purple-400 font-bold font-mono">
              {currentIndex > 0 ? Math.round((correctCount / currentIndex) * 100) : 0}%
            </span>
          </div>
          <div className="flex justify-between border-t border-cyber-border pt-2 text-sm font-bold">
            <span className="text-gray-300">Заработано токенов:</span>
            <span className="text-amber-400 font-mono flex items-center gap-1">
              <Zap size={14} className="fill-amber-400" /> +{tokensEarned} FLOP
            </span>
          </div>
        </div>

        <div className="flex gap-3 w-full pt-2">
          <button
            onClick={loadCards}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-slate-800 hover:bg-slate-700 text-gray-200 rounded-xl text-xs font-bold transition-all"
          >
            <RotateCcw size={16} /> Еще раз
          </button>
          <button
            onClick={onBack}
            className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95"
          >
            В Лабораторию
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-md mx-auto px-4 py-2">
      {/* Шапка забега */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-gray-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800/80 font-medium"
        >
          <ArrowLeft size={14} /> Назад
        </button>

        <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-500/30">
          <Timer size={14} className="animate-spin" />
          <span>{timeLeft}с</span>
        </div>

        <div className="text-cyan-400 font-bold font-mono bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-500/30">
          +{tokensEarned} FLOP
        </div>
      </div>

      {/* Карточка задания */}
      <div className="flex-1 flex flex-col justify-center relative">
        <SwipeableCard
          card={currentCard}
          onSwipeLeft={() => handleAnswer(true)}
          onSwipeRight={() => handleAnswer(false)}
        />
      </div>

      {/* Подсказка последнего ответа */}
      {lastFeedback && (
        <div
          className={`text-center text-xs py-1.5 px-3 rounded-lg mb-2 animate-fade-in ${
            lastFeedback.isCorrect
              ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
          }`}
        >
          {lastFeedback.text}
        </div>
      )}

      {/* Кнопки прямого ответа (для удобства одной рукой) */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        <button
          onClick={() => handleAnswer(true)}
          className="py-3 px-3 bg-gradient-to-r from-cyan-950 to-slate-900 border border-cyan-500/60 rounded-xl text-cyan-300 font-bold text-xs hover:border-cyan-400 active:scale-95 transition-all shadow-md"
        >
          ⬅️ {currentCard?.left_label}
        </button>
        <button
          onClick={() => handleAnswer(false)}
          className="py-3 px-3 bg-gradient-to-r from-purple-950 to-slate-900 border border-purple-500/60 rounded-xl text-purple-300 font-bold text-xs hover:border-purple-400 active:scale-95 transition-all shadow-md"
        >
          {currentCard?.right_label} ➡️
        </button>
      </div>
    </div>
  );
};

// Внутренний компонент карточки с жестами свайпа на Framer Motion
interface SwipeCardProps {
  card: DatasetCard;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const SwipeableCard: React.FC<SwipeCardProps> = ({ card, onSwipeLeft, onSwipeRight }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-180, 180], [-18, 18]);
  const opacityLeft = useTransform(x, [-120, -20], [1, 0]);
  const opacityRight = useTransform(x, [20, 120], [0, 1]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -70) {
      onSwipeLeft();
    } else if (info.offset.x > 70) {
      onSwipeRight();
    }
  };

  return (
    <motion.div
      key={card.id}
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="w-full bg-cyber-card border-2 border-cyber-border hover:border-cyan-500/40 rounded-3xl p-5 shadow-2xl relative cursor-grab active:cursor-grabbing select-none"
    >
      {/* Метка при свайпе влево */}
      <motion.div
        style={{ opacity: opacityLeft }}
        className="absolute top-4 left-4 z-20 bg-cyan-500 text-black font-bold text-xs px-2.5 py-1 rounded-lg shadow-lg pointer-events-none tracking-wide"
      >
        {card.left_label}
      </motion.div>

      {/* Метка при свайпе вправо */}
      <motion.div
        style={{ opacity: opacityRight }}
        className="absolute top-4 right-4 z-20 bg-purple-500 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-lg pointer-events-none tracking-wide"
      >
        {card.right_label}
      </motion.div>

      {/* Категория */}
      <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 mb-2">
        Категория: {card.category.replace(/_/g, ' ')}
      </div>

      {/* Вопрос */}
      <h3 className="text-sm font-bold text-white mb-4 leading-snug tracking-tight">
        {card.question}
      </h3>

      {/* Контент карточки */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-gray-200 leading-relaxed min-h-[140px] flex items-center justify-center text-center whitespace-pre-line shadow-inner">
        {card.content}
      </div>

      <div className="mt-4 text-center text-[11px] text-gray-400">
        Свайпните влево или вправо, чтобы ответить
      </div>
    </motion.div>
  );
};

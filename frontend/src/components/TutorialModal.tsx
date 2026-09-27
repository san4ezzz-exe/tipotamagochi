import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Layers, 
  Database, 
  ShieldAlert, 
  Trophy, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  X,
  Zap,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { hapticImpact, hapticNotification } from '../services/telegram';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimReward: () => Promise<void>;
  alreadyRewarded?: boolean;
}

interface TutorialStep {
  title: string;
  badge: string;
  icon: React.ReactNode;
  subtitle: string;
  description: string;
  tip: string;
  preview: React.ReactNode;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  onClaimReward,
  alreadyRewarded = false,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [claimed, setClaimed] = useState<boolean>(false);

  if (!isOpen) return null;

  const steps: TutorialStep[] = [
    {
      title: 'Твой Питомец-ИИ',
      badge: 'ШАГ 1 ИЗ 4 • ОСНОВА',
      icon: <Bot className="text-cyan-400" size={24} />,
      subtitle: 'Привет! Я твоя карманная нейросеть 🐾',
      description:
        'Корми меня вычислениями, запускай тренировочные эпохи и повышай мой уровень от примитивного перцептрона до глубокой LLM!',
      tip: 'Следи за Точностью (Accuracy %) и снижай Потери (Loss) для эволюции.',
      preview: (
        <div className="bg-cyber-card/90 border border-cyan-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-cyan-950/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-400/40 flex items-center justify-center text-2xl animate-bounce">
              🐱
            </div>
            <div>
              <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                GPT-Shiba
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">
                  Lvl 1
                </span>
              </div>
              <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                Архитектура: Vision-CNN
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1 justify-end">
              <TrendingUp size={12} /> 74.0%
            </div>
            <div className="text-[10px] text-gray-400 font-mono">Loss: 0.62</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Data Rush: Свайп данных',
      badge: 'ШАГ 2 ИЗ 4 • ФАРМ',
      icon: <Database className="text-emerald-400" size={24} />,
      subtitle: 'Размечай датасеты прямо на лекции ⚡',
      description:
        'Свайпай карточки влево или вправо как в Tinder! Отличай реальные фото от нейросетевых артов, находи баги в коде и спам.',
      tip: 'Каждый верный свайп моментально приносит FLOP-токены и прокачивает питомца.',
      preview: (
        <div className="bg-cyber-card/90 border border-emerald-500/30 rounded-2xl p-3 flex flex-col gap-2 shadow-lg shadow-emerald-950/40">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-gray-300">
            <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/30">
              👈 Влево: Ошибка
            </span>
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30">
              Вправо: Норм 👉
            </span>
          </div>
          <div className="bg-cyber-bg/80 border border-cyber-border rounded-xl p-2.5 text-center text-xs text-gray-200">
            «Нейросеть нарисовала 6 пальцев на руке. Это артефакт генерации?»
          </div>
        </div>
      ),
    },
    {
      title: 'Neural Forge: Архитектура',
      badge: 'ШАГ 3 ИЗ 4 • КУЗНИЦА',
      icon: <Layers className="text-purple-400" size={24} />,
      subtitle: 'Собирай модули и граф слоёв 🧠',
      description:
        'Покупай в Pip Store и вставляй в граф слои: Convolution 2D, Multi-Head Attention, Dropout и RMSNorm.',
      tip: 'Кастомная конфигурация слоёв даёт мощные пассивные множители к точности!',
      preview: (
        <div className="bg-cyber-card/90 border border-purple-500/30 rounded-2xl p-3 flex items-center justify-between gap-1 shadow-lg shadow-purple-950/40 text-[10px] font-mono">
          <div className="flex-1 py-1.5 px-2 bg-cyan-950/50 border border-cyan-500/40 rounded-lg text-center text-cyan-300">
            Input
          </div>
          <ArrowRight size={12} className="text-gray-500" />
          <div className="flex-1 py-1.5 px-2 bg-purple-950/50 border border-purple-500/40 rounded-lg text-center text-purple-300 font-bold">
            Attention
          </div>
          <ArrowRight size={12} className="text-gray-500" />
          <div className="flex-1 py-1.5 px-2 bg-emerald-950/50 border border-emerald-500/40 rounded-lg text-center text-emerald-300">
            Output
          </div>
        </div>
      ),
    },
    {
      title: 'Рейды в Dungeons & ВУЗы',
      badge: 'ШАГ 4 ИЗ 4 • ТУРНИР',
      icon: <Trophy className="text-amber-400" size={24} />,
      subtitle: 'Взламывай Деканат и поднимай свой ВУЗ 🏆',
      description:
        'Отправляйся в серверные подземелья, побеждай мобов и взламывай защитные фаерволы креативными промптами.',
      tip: 'Все заработанные очки идут в общий зачет твоего университета!',
      preview: (
        <div className="bg-cyber-card/90 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between shadow-lg shadow-amber-950/40">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <GraduationCap size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-white font-mono">Битва Университетов</div>
              <div className="text-[10px] text-gray-400">Выбери свой ВУЗ в профиле</div>
            </div>
          </div>
          <div className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/30">
            Топ-1 ВУЗ
          </div>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];

  const handleNext = () => {
    hapticImpact('light');
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    hapticImpact('light');
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    hapticImpact('medium');
    setIsClaiming(true);
    try {
      if (!alreadyRewarded) {
        await onClaimReward();
      }
      setClaimed(true);
      hapticNotification('success');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
      onClose();
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-cyber-bg/95 border border-cyan-500/40 rounded-3xl p-5 flex flex-col gap-4 shadow-2xl shadow-cyan-950/80 relative overflow-hidden">
        {/* Фоновое неоновое свечение */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Шапка модалки */}
        <div className="flex items-center justify-between border-b border-cyber-border/80 pb-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              {current.icon}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 block">
                {current.badge}
              </span>
              <h3 className="text-sm font-bold text-white tracking-wide">
                {current.title}
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              hapticImpact('light');
              onClose();
            }}
            className="text-gray-400 hover:text-white p-1 rounded-full bg-cyber-card/60 hover:bg-cyber-card border border-cyber-border transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Интерактивный интерактивный виджет-превью */}
        <div className="relative z-10">{current.preview}</div>

        {/* Текстовое описание */}
        <div className="flex flex-col gap-1.5 relative z-10">
          <h4 className="text-xs font-bold text-cyan-300 font-mono">
            {current.subtitle}
          </h4>
          <p className="text-xs text-gray-300 leading-relaxed">
            {current.description}
          </p>
          <div className="mt-1 bg-cyber-card/50 border border-cyber-border/70 rounded-xl p-2 text-[11px] text-gray-400 font-mono flex items-start gap-1.5">
            <span className="text-amber-400">💡</span>
            <span>{current.tip}</span>
          </div>
        </div>

        {/* Индикатор шагов (точки) */}
        <div className="flex items-center justify-center gap-1.5 py-1 relative z-10">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                hapticImpact('light');
                setCurrentStep(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-6 bg-cyan-400 shadow-sm shadow-cyan-400'
                  : 'w-2 bg-gray-700 hover:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Кнопки управления */}
        <div className="flex items-center gap-2 pt-1 relative z-10">
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              className="px-3 py-2.5 rounded-xl border border-cyber-border bg-cyber-card/80 hover:bg-cyber-card text-gray-300 text-xs font-mono font-medium flex items-center justify-center transition-all"
            >
              <ArrowLeft size={14} />
            </button>
          )}

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all"
            >
              <span>Далее</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isClaiming || claimed}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {claimed ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Отлично! Запускаем...</span>
                </>
              ) : isClaiming ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Начисляем бонус...</span>
                </>
              ) : alreadyRewarded ? (
                <>
                  <Sparkles size={14} />
                  <span>Погнали играть! 🚀</span>
                </>
              ) : (
                <>
                  <Zap size={14} className="fill-black" />
                  <span>Забрать +150 FLOP и начать! 🚀</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

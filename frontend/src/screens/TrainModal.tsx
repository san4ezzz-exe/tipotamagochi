import React, { useState } from 'react';
import { User, TrainResponse } from '../types/game';
import { api } from '../services/api';
import { hapticImpact, hapticNotification } from '../services/telegram';
import { Sliders, Sparkles, AlertCircle, X, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TrainModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onTrained: (updatedUser: User) => void;
}

export const TrainModal: React.FC<TrainModalProps> = ({
  isOpen,
  onClose,
  user,
  onTrained,
}) => {
  const [learningRate, setLearningRate] = useState<number>(0.04);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [result, setResult] = useState<TrainResponse | null>(null);

  if (!isOpen) return null;

  const pet = user.pet;
  const cost = 100;
  const canAfford = user.compute_tokens >= cost;

  // Определение качества LR
  let lrStatus = { text: 'Оптимальный шаг (сходимость к минимуму)', color: 'text-emerald-400' };
  if (learningRate < 0.02) {
    lrStatus = { text: 'Слишком малый шаг (медленное обучение)', color: 'text-amber-400' };
  } else if (learningRate > 0.07) {
    lrStatus = { text: 'Слишком высокий! Риск перескочить минимум', color: 'text-rose-400' };
  }

  const handleStartTrain = async () => {
    if (!canAfford || isTraining) return;

    try {
      setIsTraining(true);
      hapticImpact('heavy');
      setResult(null);

      // Имитация процесса эпохи обучения (1.2 сек)
      await new Promise((r) => setTimeout(r, 1200));

      const res = await api.trainPet(user.telegram_id, learningRate);
      setResult(res);

      if (res.new_level > (pet?.level || 1)) {
        hapticNotification('success');
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.5 },
        });
      } else {
        hapticImpact('medium');
      }

      if (pet) {
        onTrained({
          ...user,
          compute_tokens: res.remaining_tokens,
          pet: {
            ...pet,
            level: res.new_level,
            epoch: res.new_epoch,
            accuracy: res.new_accuracy,
            loss: res.new_loss,
          },
        });
      }
    } catch (e: any) {
      hapticNotification('error');
      alert(e.message || 'Ошибка обучения');
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-cyber-card border border-cyber-border rounded-3xl w-full max-w-sm p-5 shadow-2xl relative">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 text-purple-400 mb-4 font-bold text-sm">
          <Sliders size={18} />
          <span>ЛАБОРАТОРИЯ ОБУЧЕНИЯ</span>
        </div>

        {/* Текущие параметры */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 mb-4 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Питомец:</span>
            <span className="text-white font-bold">{pet?.name} (Ур. {pet?.level})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Текущий Loss:</span>
            <span className="text-rose-400 font-bold font-mono">{pet?.loss?.toFixed(3)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Текущий Accuracy:</span>
            <span className="text-emerald-400 font-bold font-mono">{pet?.accuracy?.toFixed(1)}%</span>
          </div>
        </div>

        {/* Слайдер Learning Rate */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-gray-300 font-bold">Learning Rate (α):</span>
            <span className="text-cyan-400 font-bold font-mono">{learningRate.toFixed(2)}</span>
          </div>

          <input
            type="range"
            min="0.01"
            max="0.10"
            step="0.01"
            value={learningRate}
            onChange={(e) => {
              setLearningRate(parseFloat(e.target.value));
              hapticImpact('light');
            }}
            disabled={isTraining}
            className="w-full accent-cyan-400 cursor-pointer"
          />

          <p className={`text-[11px] ${lrStatus.color} flex items-center gap-1`}>
            <AlertCircle size={12} /> {lrStatus.text}
          </p>
        </div>

        {/* Результат эпохи */}
        {result && (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3 mb-4 text-xs text-emerald-300 animate-fade-in space-y-1">
            <div className="flex items-center gap-1 font-bold">
              <CheckCircle size={14} /> Эпоха {result.new_epoch} завершена!
            </div>
            <p className="text-[11px] text-gray-300">{result.message}</p>
            <div className="flex justify-between pt-1 border-t border-emerald-500/20 text-[11px]">
              <span>Новый Loss: <strong className="text-white">{result.new_loss}</strong></span>
              <span>Новый Accuracy: <strong className="text-emerald-400">{result.new_accuracy}%</strong></span>
            </div>
          </div>
        )}

        {/* Кнопка запуска */}
        <button
          onClick={handleStartTrain}
          disabled={!canAfford || isTraining}
          className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
            canAfford && !isTraining
              ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:brightness-110'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
          }`}
        >
          {isTraining ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Оптимизация градиентов...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Запустить Эпоху ({cost} FLOP)</span>
            </>
          )}
        </button>

        {!canAfford && (
          <p className="text-center text-[10px] text-rose-400 mt-2">
            Не хватает токенов! Соберите данные в режиме Data Rush.
          </p>
        )}
      </div>
    </div>
  );
};

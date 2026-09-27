import React, { useState } from 'react';
import { User } from '../types/game';
import { PetAvatar } from '../components/PetAvatar';
import { Gift, Play, Flame, TrendingUp, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { hapticNotification, hapticImpact } from '../services/telegram';
import confetti from 'canvas-confetti';

interface HubScreenProps {
  user: User;
  onUpdateUser: (updated: User) => void;
  onOpenDataRush: () => void;
  onOpenTrain: () => void;
}

export const HubScreen: React.FC<HubScreenProps> = ({
  user,
  onUpdateUser,
  onOpenDataRush,
  onOpenTrain,
}) => {
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [grantMessage, setGrantMessage] = useState<string | null>(null);

  const pet = user.pet;

  const handleClaimGrant = async () => {
    if (!user.can_claim_grant || isClaiming) return;

    try {
      setIsClaiming(true);
      hapticImpact('heavy');

      const res = await api.claimGrant(user.telegram_id);
      hapticNotification('success');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      setGrantMessage(res.message);
      onUpdateUser({
        ...user,
        compute_tokens: res.new_balance,
        streak_days: res.streak_days,
        can_claim_grant: false,
      });
    } catch (err: any) {
      hapticNotification('error');
      alert(err.message || 'Ошибка получения гранта');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-20 px-4 pt-2 max-w-md mx-auto">
      {/* Баннер ВУЗа и Факультета */}
      <div className="flex items-center justify-between text-xs text-gray-400 bg-cyber-card/60 border border-cyber-border px-3 py-1.5 rounded-lg">
        <span className="truncate">🎓 {user.university}</span>
        <span className="text-cyan-400 font-semibold font-mono">#{user.faculty}</span>
      </div>

      {/* Аватар Питомца */}
      <PetAvatar pet={pet} />

      {/* Метрики Модели (Статы) */}
      <div className="bg-cyber-card border border-cyber-border p-3.5 rounded-2xl shadow-lg space-y-3">
        <div className="flex justify-between items-center text-xs text-gray-300 font-bold border-b border-cyber-border/60 pb-1.5">
          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <TrendingUp size={14} /> МЕТРИКИ МОДЕЛИ
          </span>
          <span className="text-purple-400 font-mono font-medium">Эпоха: {pet?.epoch || 1}</span>
        </div>

        {/* Точность (Accuracy) */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-300">Точность (Accuracy):</span>
            <span className="text-emerald-400 font-bold font-mono">{pet?.accuracy?.toFixed(1) || 72.0}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(pet?.accuracy || 70, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Ошибка (Loss) */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-300">Ошибка (Loss):</span>
            <span className="text-rose-400 font-bold font-mono">{pet?.loss?.toFixed(3) || 0.65}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-500 to-amber-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((pet?.loss || 0.6) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Баннер Ежедневного GPU-Гранта */}
      <div className="bg-gradient-to-r from-purple-950/40 via-cyan-950/30 to-slate-900 border border-purple-500/40 p-3.5 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold tracking-wide">
              <Gift size={15} />
              <span>ДНЕВНОЙ GPU-ГРАНТ</span>
            </div>
            <p className="text-[12px] text-gray-300">
              Стрик: <span className="font-mono font-bold text-amber-400">{user.streak_days} дн.</span> Награда: <span className="font-mono text-cyan-300">+{150 + Math.min(user.streak_days * 25, 250)} FLOP</span>
            </p>
          </div>

          <button
            onClick={handleClaimGrant}
            disabled={!user.can_claim_grant || isClaiming}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
              user.can_claim_grant
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110 animate-pulse'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
            }`}
          >
            {user.can_claim_grant ? 'Забрать 🎁' : 'Получен ✅'}
          </button>
        </div>

        {grantMessage && (
          <p className="mt-2 text-xs text-emerald-400 animate-fade-in font-medium">
            {grantMessage}
          </p>
        )}
      </div>

      {/* Кнопки Быстрых Действий */}
      <div className="grid grid-cols-2 gap-3 mt-1">
        <button
          onClick={onOpenDataRush}
          className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-br from-cyan-950/50 to-slate-900 border border-cyan-500/50 rounded-2xl hover:border-cyan-400 active:scale-95 transition-all shadow-lg group"
        >
          <div className="p-2 bg-cyan-500/20 rounded-xl mb-1.5 text-cyan-400 group-hover:scale-110 transition-transform">
            <Play size={20} className="fill-cyan-400" />
          </div>
          <span className="text-xs font-bold text-white">Разметка Данных</span>
          <span className="text-[11px] text-cyan-300/80 font-mono">+15 FLOP / свайп</span>
        </button>

        <button
          onClick={onOpenTrain}
          className="flex flex-col items-center justify-center p-3.5 bg-gradient-to-br from-purple-950/50 to-slate-900 border border-purple-500/50 rounded-2xl hover:border-purple-400 active:scale-95 transition-all shadow-lg group"
        >
          <div className="p-2 bg-purple-500/20 rounded-xl mb-1.5 text-purple-400 group-hover:scale-110 transition-transform">
            <Flame size={20} className="fill-purple-400" />
          </div>
          <span className="text-xs font-bold text-white">Обучить Модель</span>
          <span className="text-[11px] text-purple-300/80 font-mono">Снизить Loss (100 FLOP)</span>
        </button>
      </div>
    </div>
  );
};

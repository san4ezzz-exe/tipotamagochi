import React, { useState, useEffect } from 'react';
import { User } from './types/game';
import { api } from './services/api';
import { initTelegramApp } from './services/telegram';
import { TopBar } from './components/TopBar';
import { BottomNav, NavTab } from './components/BottomNav';
import { HubScreen } from './screens/HubScreen';
import { DataRushScreen } from './screens/DataRushScreen';
import { TrainModal } from './screens/TrainModal';
import { ProfileScreen } from './screens/ProfileScreen';
import { ForgeScreen } from './screens/ForgeScreen';
import { DungeonScreen } from './screens/DungeonScreen';
import { TutorialModal } from './components/TutorialModal';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<NavTab>('hub');
  const [isTrainModalOpen, setIsTrainModalOpen] = useState<boolean>(false);
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState<boolean>(false);

  useEffect(() => {
    initTelegramApp();
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.authenticate();
      setUser(data);

      // Автоматический показ обучения при первом входе
      const seenLocal = localStorage.getItem('neuropet_tutorial_seen');
      if (!data.tutorial_completed && !seenLocal) {
        setIsTutorialModalOpen(true);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Не удалось подключиться к серверу');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimTutorialReward = async () => {
    if (!user) return;
    try {
      const res = await api.completeTutorial(user.telegram_id);
      if (res.success) {
        setUser({
          ...user,
          compute_tokens: res.new_balance,
          tutorial_completed: true,
        });
      }
      localStorage.setItem('neuropet_tutorial_seen', 'true');
    } catch (err) {
      console.error('Error claiming tutorial reward:', err);
      localStorage.setItem('neuropet_tutorial_seen', 'true');
    }
  };

  const handleDataRushFinish = (tokensEarned: number, accuracyBonus: number) => {
    if (!user) return;
    setUser({
      ...user,
      compute_tokens: user.compute_tokens + tokensEarned,
      pet: user.pet
        ? {
            ...user.pet,
            accuracy: Math.min(Math.round((user.pet.accuracy + accuracyBonus) * 10) / 10, 99.9),
          }
        : null,
    });
    setCurrentTab('hub');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cyber-bg text-white p-4">
        <div className="relative mb-4">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-cyan-400">
            AI
          </div>
        </div>
        <h1 className="text-base font-bold text-white tracking-widest uppercase">
          NeuroPet AI Lab
        </h1>
        <p className="text-xs text-gray-400 mt-1 animate-pulse">
          Синхронизация нейросетевых весов...
        </p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cyber-bg text-white p-6 text-center">
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl mb-4 text-rose-400">
          ⚠️ Ошибка загрузки
        </div>
        <p className="text-xs text-gray-300 mb-4">{error}</p>
        <button
          onClick={loadUser}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all"
        >
          Повторить попытку
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-bg text-white flex flex-col relative select-none">
      {/* Верхняя панель */}
      <TopBar
        computeTokens={user.compute_tokens}
        streakDays={user.streak_days}
        vram={user.pet?.current_vram || 100}
        onOpenTutorial={() => setIsTutorialModalOpen(true)}
      />

      {/* Основной контент экранов */}
      <main className="flex-1">
        {currentTab === 'hub' && (
          <HubScreen
            user={user}
            onUpdateUser={setUser}
            onOpenDataRush={() => setCurrentTab('data_rush')}
            onOpenTrain={() => setIsTrainModalOpen(true)}
          />
        )}

        {currentTab === 'data_rush' && (
          <DataRushScreen
            userId={user.telegram_id}
            onFinish={handleDataRushFinish}
            onBack={() => setCurrentTab('hub')}
          />
        )}

        {currentTab === 'dungeon' && (
          <DungeonScreen
            user={user}
            onUpdateTokens={(newBal) => setUser({ ...user, compute_tokens: newBal })}
          />
        )}

        {currentTab === 'forge' && (
          <ForgeScreen
            user={user}
            onUpdateTokens={(newBal) => setUser({ ...user, compute_tokens: newBal })}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileScreen user={user} onUpdateUser={setUser} />
        )}
      </main>

      {/* Модалка обучения питомца (тренировка эпох) */}
      <TrainModal
        isOpen={isTrainModalOpen}
        onClose={() => setIsTrainModalOpen(false)}
        user={user}
        onTrained={setUser}
      />

      {/* Интерактивный вводный гид по игре */}
      <TutorialModal
        isOpen={isTutorialModalOpen}
        onClose={() => setIsTutorialModalOpen(false)}
        onClaimReward={handleClaimTutorialReward}
        alreadyRewarded={user.tutorial_completed}
      />

      {/* Нижняя навигация */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
      />
    </div>
  );
};

export default App;

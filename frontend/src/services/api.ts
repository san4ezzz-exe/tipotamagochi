import { User, DatasetCard, GrantClaimResponse, TrainResponse } from '../types/game';
import { getTelegramInitData, getTelegramUser } from './telegram';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = {
  async authenticate(): Promise<User> {
    const initData = getTelegramInitData();
    const mockUser = getTelegramUser();

    const response = await fetch(`${API_BASE_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        init_data: initData,
        mock_id: mockUser.id,
        mock_username: mockUser.username,
        mock_first_name: mockUser.first_name,
      }),
    });

    if (!response.ok) {
      throw new Error(`Auth failed with status ${response.status}`);
    }
    return response.json();
  },

  async claimGrant(tgId: number): Promise<GrantClaimResponse> {
    const response = await fetch(`${API_BASE_URL}/api/grant/claim?tg_id=${tgId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Не удалось забрать грант');
    }
    return response.json();
  },

  async getDataRushCards(limit: number = 10): Promise<DatasetCard[]> {
    const response = await fetch(`${API_BASE_URL}/api/data-rush/cards?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to load dataset cards');
    }
    return response.json();
  },

  async submitDataRush(
    tgId: number,
    correctCount: number,
    totalCount: number,
    tokensEarned: number
  ): Promise<{ success: boolean; tokens_earned: number; new_balance: number; accuracy_bonus: number }> {
    const response = await fetch(`${API_BASE_URL}/api/data-rush/submit?tg_id=${tgId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correct_count: correctCount,
        total_count: totalCount,
        tokens_earned: tokensEarned,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to submit Data Rush results');
    }
    return response.json();
  },

  async trainPet(tgId: number, learningRate: number): Promise<TrainResponse> {
    const response = await fetch(`${API_BASE_URL}/api/train?tg_id=${tgId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ learning_rate: learningRate }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Ошибка при обучении');
    }
    return response.json();
  },

  async getForgeState(tgId: number): Promise<import('../types/game').ForgeState> {
    const response = await fetch(`${API_BASE_URL}/api/forge/state?tg_id=${tgId}`);
    if (!response.ok) {
      throw new Error('Failed to load forge state');
    }
    return response.json();
  },

  async getForgeShop(): Promise<import('../types/game').LayerItem[]> {
    const response = await fetch(`${API_BASE_URL}/api/forge/shop`);
    if (!response.ok) {
      throw new Error('Failed to load forge shop');
    }
    return response.json();
  },

  async buyLayer(tgId: number, layerId: number): Promise<{ success: boolean; message: string; new_balance: number }> {
    const response = await fetch(`${API_BASE_URL}/api/forge/buy?tg_id=${tgId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ layer_id: layerId }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Ошибка покупки модуля');
    }
    return response.json();
  },

  async equipLayer(tgId: number, inventoryId: number, slotName: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/forge/equip?tg_id=${tgId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inventory_id: inventoryId, slot_name: slotName }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Ошибка экипировки модуля');
    }
    return response.json();
  },

  async unequipLayer(tgId: number, inventoryId: number): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/forge/unequip?tg_id=${tgId}&inventory_id=${inventoryId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Ошибка снятия модуля');
    }
    return response.json();
  },

  async startDungeon(tgId: number): Promise<import('../types/game').DungeonState> {
    const response = await fetch(`${API_BASE_URL}/api/dungeon/start?tg_id=${tgId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to start dungeon');
    }
    return response.json();
  },

  async getDungeonState(tgId: number): Promise<import('../types/game').DungeonState> {
    const response = await fetch(`${API_BASE_URL}/api/dungeon/state?tg_id=${tgId}`);
    if (!response.ok) {
      throw new Error('Failed to load dungeon state');
    }
    return response.json();
  },

  async dungeonAttack(tgId: number, actionType: string): Promise<import('../types/game').DungeonState> {
    const response = await fetch(`${API_BASE_URL}/api/dungeon/attack?tg_id=${tgId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action_type: actionType }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Ошибка атаки');
    }
    return response.json();
  },

  async dungeonClaimChest(tgId: number): Promise<import('../types/game').DungeonState> {
    const response = await fetch(`${API_BASE_URL}/api/dungeon/claim-chest?tg_id=${tgId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Ошибка открытия сундука');
    }
    return response.json();
  },

  async dungeonBossPrompt(tgId: number, prompt: string): Promise<import('../types/game').DungeonState> {
    const response = await fetch(`${API_BASE_URL}/api/dungeon/boss-prompt?tg_id=${tgId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Ошибка отправки промпта');
    }
    return response.json();
  },

  async getUniversities(): Promise<import('../types/game').UniversityItem[]> {
    const response = await fetch(`${API_BASE_URL}/api/social/universities`);
    if (!response.ok) {
      throw new Error('Failed to load universities');
    }
    return response.json();
  },

  async setUserUniversity(tgId: number, university: string, faculty: string): Promise<{ success: boolean; university: string; faculty: string }> {
    const response = await fetch(`${API_BASE_URL}/api/social/set-university?tg_id=${tgId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ university, faculty }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Ошибка сохранения ВУЗа');
    }
    return response.json();
  },

  async getUniversityLeaderboard(): Promise<import('../types/game').UniversityLeaderboardItem[]> {
    const response = await fetch(`${API_BASE_URL}/api/social/leaderboard/universities`);
    if (!response.ok) {
      throw new Error('Failed to load university leaderboard');
    }
    return response.json();
  },

  async getStudentLeaderboard(tgId?: number): Promise<import('../types/game').StudentLeaderboardItem[]> {
    const url = tgId
      ? `${API_BASE_URL}/api/social/leaderboard/students?tg_id=${tgId}`
      : `${API_BASE_URL}/api/social/leaderboard/students`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to load student leaderboard');
    }
    return response.json();
  },

  async claimShareReward(tgId: number): Promise<{ success: boolean; reward_tokens: number; new_balance: number; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/social/share-reward?tg_id=${tgId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Ошибка получения бонуса');
    }
    return response.json();
  },

  async completeTutorial(tgId: number): Promise<import('../types/game').TutorialCompleteResponse> {
    const response = await fetch(`${API_BASE_URL}/api/tutorial/complete?tg_id=${tgId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Ошибка завершения обучения');
    }
    return response.json();
  },
};




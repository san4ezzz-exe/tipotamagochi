export interface Pet {
  id: number;
  name: string;
  archetype: string;
  level: number;
  epoch: number;
  accuracy: number;
  loss: number;
  compute_power: number;
  current_vram: number;
}

export interface User {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  university: string;
  faculty: string;
  streak_days: number;
  compute_tokens: number;
  can_claim_grant: boolean;
  pet: Pet | null;
}

export interface DatasetCard {
  id: number;
  category: string;
  question: string;
  content: string;
  left_label: string;
  right_label: string;
  correct_is_left: boolean;
  explanation?: string;
  reward_tokens: number;
}

export interface GrantClaimResponse {
  success: boolean;
  message: string;
  streak_days: number;
  reward_tokens: number;
  new_balance: number;
}

export interface TrainResponse {
  success: boolean;
  message: string;
  new_level: number;
  new_epoch: number;
  new_accuracy: number;
  new_loss: number;
  tokens_spent: number;
  remaining_tokens: number;
}

export interface LayerItem {
  id: number;
  name: string;
  code_name: string;
  slot_type: 'slot_input' | 'slot_hidden' | 'slot_regularizer';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  accuracy_bonus: number;
  loss_reduction: number;
  cost_tokens: number;
}

export interface UserInventoryItem {
  id: number;
  layer: LayerItem;
  is_equipped: boolean;
  equipped_slot: string | null;
}

export interface ForgeState {
  equipped_slots: {
    slot_input: LayerItem | null;
    slot_hidden_1: LayerItem | null;
    slot_hidden_2: LayerItem | null;
    slot_regularizer: LayerItem | null;
  };
  inventory: UserInventoryItem[];
  total_accuracy_bonus: number;
  total_loss_reduction: number;
}

export interface DungeonEnemy {
  id: string;
  name: string;
  type: 'minion' | 'boss';
  max_hp: number;
  current_hp: number;
  attack_power: number;
  description: string;
  icon: string;
  color: string;
}

export interface DungeonFloor {
  floor_num: number;
  type: 'battle' | 'chest' | 'boss';
  title: string;
  enemy?: DungeonEnemy;
  reward_tokens?: number;
  boss_quote?: string;
  prompt_attempts_left?: number;
  is_completed: boolean;
  is_opened?: boolean;
}

export interface DungeonState {
  current_floor_index: number;
  pet_hp: number;
  pet_max_hp: number;
  floors: DungeonFloor[];
  is_run_completed: boolean;
  is_game_over: boolean;
  total_tokens_reward: number;
  logs: string[];
}

export interface UniversityItem {
  id: string;
  name: string;
  faculties: string[];
}

export interface UniversityLeaderboardItem {
  rank: number;
  university: string;
  total_compute_flops: number;
  active_students: number;
  is_leader: boolean;
}

export interface StudentLeaderboardItem {
  rank: number;
  student_name: string;
  university: string;
  pet_name: string;
  pet_level: number;
  accuracy: number;
}



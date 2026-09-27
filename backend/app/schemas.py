from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class PetOut(BaseModel):
    id: int
    name: str
    archetype: str
    level: int
    epoch: int
    accuracy: float
    loss: float
    compute_power: int
    current_vram: int

    class Config:
        from_attributes = True

class UserOut(BaseModel):
    id: int
    telegram_id: int
    username: Optional[str]
    first_name: Optional[str]
    university: str
    faculty: str
    streak_days: int
    compute_tokens: int
    can_claim_grant: bool
    tutorial_completed: bool = False
    pet: Optional[PetOut]

    class Config:
        from_attributes = True

class AuthRequest(BaseModel):
    init_data: str
    mock_id: Optional[int] = None
    mock_username: Optional[str] = None
    mock_first_name: Optional[str] = None

class GrantClaimResponse(BaseModel):
    success: bool
    message: str
    streak_days: int
    reward_tokens: int
    new_balance: int

class DatasetCardOut(BaseModel):
    id: int
    category: str
    question: str
    content: str
    left_label: str
    right_label: str
    correct_is_left: bool
    explanation: Optional[str]
    reward_tokens: int

    class Config:
        from_attributes = True

class DataRushSubmitRequest(BaseModel):
    correct_count: int
    total_count: int
    tokens_earned: int

class DataRushSubmitResponse(BaseModel):
    success: bool
    tokens_earned: int
    new_balance: int
    accuracy_bonus: float

class TrainRequest(BaseModel):
    learning_rate: float # например от 0.01 до 0.1

class TrainResponse(BaseModel):
    success: bool
    message: str
    new_level: int
    new_epoch: int
    new_accuracy: float
    new_loss: float
    tokens_spent: int
    remaining_tokens: int

class LayerItemOut(BaseModel):
    id: int
    name: str
    code_name: str
    slot_type: str
    rarity: str
    description: str
    accuracy_bonus: float
    loss_reduction: float
    cost_tokens: int

    class Config:
        from_attributes = True

class UserInventoryItemOut(BaseModel):
    id: int
    layer: LayerItemOut
    is_equipped: bool
    equipped_slot: Optional[str]

    class Config:
        from_attributes = True

class ForgeStateOut(BaseModel):
    equipped_slots: dict # { "slot_input": LayerItemOut | None, ... }
    inventory: List[UserInventoryItemOut]
    total_accuracy_bonus: float
    total_loss_reduction: float

class BuyLayerRequest(BaseModel):
    layer_id: int

class EquipLayerRequest(BaseModel):
    inventory_id: int
    slot_name: str # slot_input, slot_hidden_1, slot_hidden_2, slot_regularizer

class DungeonAttackRequest(BaseModel):
    action_type: str # forward_pass, conv_burst, dropout_shield

class DungeonPromptRequest(BaseModel):
    prompt: str

class SetUniversityRequest(BaseModel):
    university: str
    faculty: str

class UniversityLeaderboardItem(BaseModel):
    rank: int
    university: str
    total_compute_flops: int
    active_students: int
    is_leader: bool

class StudentLeaderboardItem(BaseModel):
    rank: int
    student_name: str
    university: str
    pet_name: str
    pet_level: int
    accuracy: float

class ShareRewardResponse(BaseModel):
    success: bool
    reward_tokens: int
    new_balance: int
    message: str

class TutorialCompleteResponse(BaseModel):
    success: bool
    reward_tokens: int
    new_balance: int
    message: str

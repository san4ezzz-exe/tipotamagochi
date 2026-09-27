from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(Integer, unique=True, index=True, nullable=False)
    username = Column(String(100), nullable=True)
    first_name = Column(String(100), nullable=True)
    university = Column(String(150), default="МГУ / ВШЭ / Бауманка")
    faculty = Column(String(150), default="Компьютерные Науки")
    streak_days = Column(Integer, default=1)
    last_grant_date = Column(Date, nullable=True)
    compute_tokens = Column(Integer, default=300)
    created_at = Column(DateTime, default=datetime.utcnow)

    pets = relationship("Pet", back_populates="owner", cascade="all, delete-orphan")
    inventory = relationship("UserInventory", back_populates="user", cascade="all, delete-orphan")

class Pet(Base):
    __tablename__ = "pets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), default="GPT-Shiba")
    archetype = Column(String(50), default="Vision-CNN") # Vision-CNN, LLM-Transformer, Linear-Speedster
    level = Column(Integer, default=1)
    epoch = Column(Integer, default=1)
    accuracy = Column(Float, default=72.5) # в процентах, например 72.5%
    loss = Column(Float, default=0.68)     # значение функции потерь
    compute_power = Column(Integer, default=100) # Макс емкость FLOPS
    current_vram = Column(Integer, default=100)   # Текущая энергия

    owner = relationship("User", back_populates="pets")

class LayerItem(Base):
    __tablename__ = "layer_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code_name = Column(String(50), nullable=False) # e.g. conv2d_3x3, self_attention, dropout_02
    slot_type = Column(String(30), nullable=False) # input, hidden, regularizer
    rarity = Column(String(20), default="common")  # common, rare, epic, legendary
    description = Column(String(250), nullable=False)
    accuracy_bonus = Column(Float, default=0.0)
    loss_reduction = Column(Float, default=0.0)
    cost_tokens = Column(Integer, default=150)

class UserInventory(Base):
    __tablename__ = "user_inventory"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    layer_id = Column(Integer, ForeignKey("layer_items.id"), nullable=False)
    is_equipped = Column(Boolean, default=False)
    equipped_slot = Column(String(30), nullable=True) # slot_input, slot_hidden_1, slot_hidden_2, slot_regularizer

    user = relationship("User", back_populates="inventory")
    layer = relationship("LayerItem")

class DatasetCard(Base):
    __tablename__ = "dataset_cards"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), default="real_vs_ai") # real_vs_ai, spam_vs_ham, bug_vs_clean
    question = Column(String(200), nullable=False)
    content = Column(Text, nullable=False) # текст или описание картинки/код
    left_label = Column(String(50), nullable=False) # например "РЕАЛ" или "СПАМ"
    right_label = Column(String(50), nullable=False) # например "AI-АРТ" или "НОРМ"
    correct_is_left = Column(Boolean, nullable=False) # True если левый ответ правильный
    explanation = Column(String(300), nullable=True)
    reward_tokens = Column(Integer, default=15)

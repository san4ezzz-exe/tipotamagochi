from datetime import date, datetime, timedelta
import random
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .config import CORS_ORIGINS
from .database import engine, Base, get_db
from .models import User, Pet, DatasetCard, LayerItem, UserInventory
from .schemas import (
    AuthRequest, UserOut, PetOut, GrantClaimResponse,
    DatasetCardOut, DataRushSubmitRequest, DataRushSubmitResponse,
    TrainRequest, TrainResponse,
    LayerItemOut, UserInventoryItemOut, ForgeStateOut,
    BuyLayerRequest, EquipLayerRequest,
    DungeonAttackRequest, DungeonPromptRequest,
    SetUniversityRequest, UniversityLeaderboardItem, StudentLeaderboardItem, ShareRewardResponse
)
from .auth import validate_telegram_data
from .seed_data import seed_dataset_cards, seed_layer_items
from .dungeon import generate_dungeon_run, evaluate_jailbreak_prompt
from .social_data import UNIVERSITIES, INITIAL_UNIVERSITY_LEADERBOARD, INITIAL_STUDENT_LEADERBOARD

# Создание таблиц в БД
Base.metadata.create_all(bind=engine)

app = FastAPI(title="NeuroPet AI Lab API", version="1.0.0")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    db = next(get_db())
    try:
        seed_dataset_cards(db)
        seed_layer_items(db)
    finally:
        db.close()

def get_or_create_user(
    db: Session,
    tg_id: int,
    username: str | None = None,
    first_name: str | None = None
) -> User:
    user = db.query(User).filter(User.telegram_id == tg_id).first()
    if not user:
        user = User(
            telegram_id=tg_id,
            username=username,
            first_name=first_name,
            compute_tokens=250, # Стартовый баланс токенов
            streak_days=1,
            last_grant_date=None
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        pet = Pet(
            user_id=user.id,
            name="GPT-Shiba",
            archetype="Vision-CNN",
            level=1,
            epoch=1,
            accuracy=74.0,
            loss=0.62,
            compute_power=100,
            current_vram=100
        )
        db.add(pet)

        # Выдаем стартовый слой в инвентарь
        starter_layer = db.query(LayerItem).filter(LayerItem.code_name == "dense_relu_256").first()
        if starter_layer:
            inv = UserInventory(
                user_id=user.id,
                layer_id=starter_layer.id,
                is_equipped=True,
                equipped_slot="slot_hidden_1"
            )
            db.add(inv)

        db.commit()
        db.refresh(user)
    return user

@app.post("/api/auth", response_model=UserOut)
def auth(payload: AuthRequest, db: Session = Depends(get_db)):
    tg_user = validate_telegram_data(payload.init_data)
    
    if tg_user:
        tg_id = tg_user.get("id")
        username = tg_user.get("username")
        first_name = tg_user.get("first_name")
    elif payload.mock_id:
        # Режим разработки в локальном браузере
        tg_id = payload.mock_id
        username = payload.mock_username or "student_dev"
        first_name = payload.mock_first_name or "Alex"
    else:
        raise HTTPException(status_code=401, detail="Invalid Telegram initData or missing mock_id")

    user = get_or_create_user(db, tg_id, username, first_name)
    today = date.today()
    can_claim = (user.last_grant_date != today)

    pet = user.pets[0] if user.pets else None

    return UserOut(
        id=user.id,
        telegram_id=user.telegram_id,
        username=user.username,
        first_name=user.first_name,
        university=user.university,
        faculty=user.faculty,
        streak_days=user.streak_days,
        compute_tokens=user.compute_tokens,
        can_claim_grant=can_claim,
        pet=PetOut.from_orm(pet) if pet else None
    )

@app.post("/api/grant/claim", response_model=GrantClaimResponse)
def claim_daily_grant(tg_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.telegram_id == tg_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    today = date.today()
    if user.last_grant_date == today:
        raise HTTPException(status_code=400, detail="Грант за сегодня уже получен!")

    # Подсчет стрика
    if user.last_grant_date == today - timedelta(days=1):
        user.streak_days += 1
    elif user.last_grant_date is None or user.last_grant_date < today - timedelta(days=1):
        user.streak_days = 1

    # Награда растет от стрика
    base_grant = 150
    streak_bonus = min(user.streak_days * 25, 250)
    total_reward = base_grant + streak_bonus

    user.compute_tokens += total_reward
    user.last_grant_date = today
    db.commit()

    return GrantClaimResponse(
        success=True,
        message=f"Серверный грант получен! Начислено {total_reward} токенов вычислений.",
        streak_days=user.streak_days,
        reward_tokens=total_reward,
        new_balance=user.compute_tokens
    )

@app.get("/api/data-rush/cards", response_model=list[DatasetCardOut])
def get_data_rush_cards(limit: int = 10, db: Session = Depends(get_db)):
    all_cards = db.query(DatasetCard).all()
    if not all_cards:
        return []
    # Выбираем случайные карточки
    selected = random.sample(all_cards, min(len(all_cards), limit))
    return selected

@app.post("/api/data-rush/submit", response_model=DataRushSubmitResponse)
def submit_data_rush(tg_id: int, payload: DataRushSubmitRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.telegram_id == tg_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.compute_tokens += payload.tokens_earned
    
    # Небольшой постоянный прирост к Accuracy питомца за чистые данные
    pet = user.pets[0] if user.pets else None
    accuracy_bonus = round(payload.correct_count * 0.15, 2)
    if pet and pet.accuracy < 99.0:
        pet.accuracy = min(round(pet.accuracy + accuracy_bonus, 2), 99.0)

    db.commit()

    return DataRushSubmitResponse(
        success=True,
        tokens_earned=payload.tokens_earned,
        new_balance=user.compute_tokens,
        accuracy_bonus=accuracy_bonus
    )

@app.post("/api/train", response_model=TrainResponse)
def train_pet(tg_id: int, payload: TrainRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.telegram_id == tg_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    pet = user.pets[0] if user.pets else None
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    cost = 100
    if user.compute_tokens < cost:
        raise HTTPException(status_code=400, detail="Недостаточно токенов вычислений! Сделайте разметку данных в Data Rush.")

    user.compute_tokens -= cost
    pet.epoch += 1

    # Влияние Learning Rate:
    # Оптимальный LR: 0.03 - 0.06
    lr = payload.learning_rate
    if 0.02 <= lr <= 0.07:
        # Идеальный спуск
        loss_reduction = round(random.uniform(0.04, 0.08), 3)
        acc_increase = round(random.uniform(1.2, 2.5), 2)
        message = "Отличный шаг обучения! Модель уверенно сходится к глобальному минимуму."
    elif lr > 0.07:
        # Exploding gradient (слишком большой шаг)
        loss_reduction = round(random.uniform(-0.02, 0.02), 3) # может даже вырасти ошибка
        acc_increase = round(random.uniform(0.1, 0.6), 2)
        message = "Слишком высокий Learning Rate! Градиент перескочил минимум (Exploding gradient)."
    else:
        # Слишком маленький шаг
        loss_reduction = round(random.uniform(0.01, 0.025), 3)
        acc_increase = round(random.uniform(0.3, 0.8), 2)
        message = "Слишком низкий Learning Rate. Обучение идёт медленно, но стабильно."

    pet.loss = max(round(pet.loss - loss_reduction, 3), 0.05)
    pet.accuracy = min(round(pet.accuracy + acc_increase, 2), 99.9)

    # Проверка на Level Up каждые 3 эпохи
    if pet.epoch % 3 == 0:
        pet.level += 1
        pet.compute_power += 25
        message += f" Поздравляем! Питомец достиг {pet.level} уровня!"

    db.commit()

    return TrainResponse(
        success=True,
        message=message,
        new_level=pet.level,
        new_epoch=pet.epoch,
        new_accuracy=pet.accuracy,
        new_loss=pet.loss,
        tokens_spent=cost,
        remaining_tokens=user.compute_tokens
    )

# --- NEURAL FORGE ENDPOINTS ---

@app.get("/api/forge/state", response_model=ForgeStateOut)
def get_forge_state(tg_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.telegram_id == tg_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Если у пользователя нет предметов, выдаем базовый
    if not user.inventory:
        starter = db.query(LayerItem).filter(LayerItem.code_name == "dense_relu_256").first()
        if starter:
            inv = UserInventory(user_id=user.id, layer_id=starter.id, is_equipped=True, equipped_slot="slot_hidden_1")
            db.add(inv)
            db.commit()
            db.refresh(user)

    equipped_slots = {
        "slot_input": None,
        "slot_hidden_1": None,
        "slot_hidden_2": None,
        "slot_regularizer": None
    }
    total_acc_bonus = 0.0
    total_loss_red = 0.0

    inventory_items = []
    for item in user.inventory:
        inventory_items.append(UserInventoryItemOut.from_orm(item))
        if item.is_equipped and item.equipped_slot in equipped_slots:
            layer_out = LayerItemOut.from_orm(item.layer)
            equipped_slots[item.equipped_slot] = layer_out
            total_acc_bonus += layer_out.accuracy_bonus
            total_loss_red += layer_out.loss_reduction

    return ForgeStateOut(
        equipped_slots=equipped_slots,
        inventory=inventory_items,
        total_accuracy_bonus=round(total_acc_bonus, 2),
        total_loss_reduction=round(total_loss_red, 3)
    )

@app.get("/api/forge/shop", response_model=list[LayerItemOut])
def get_forge_shop(db: Session = Depends(get_db)):
    return db.query(LayerItem).order_by(LayerItem.cost_tokens.asc()).all()

@app.post("/api/forge/buy")
def buy_layer(tg_id: int, payload: BuyLayerRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.telegram_id == tg_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    layer = db.query(LayerItem).filter(LayerItem.id == payload.layer_id).first()
    if not layer:
        raise HTTPException(status_code=404, detail="Модуль не найден")

    if user.compute_tokens < layer.cost_tokens:
        raise HTTPException(status_code=400, detail="Недостаточно токенов FLOP для покупки модуля")

    user.compute_tokens -= layer.cost_tokens
    new_inv = UserInventory(
        user_id=user.id,
        layer_id=layer.id,
        is_equipped=False,
        equipped_slot=None
    )
    db.add(new_inv)
    db.commit()

    return {
        "success": True,
        "message": f"Модуль '{layer.name}' успешно куплен и добавлен в инвентарь!",
        "new_balance": user.compute_tokens
    }

@app.post("/api/forge/equip")
def equip_layer(tg_id: int, payload: EquipLayerRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.telegram_id == tg_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    target_inv = db.query(UserInventory).filter(
        UserInventory.id == payload.inventory_id,
        UserInventory.user_id == user.id
    ).first()
    if not target_inv:
        raise HTTPException(status_code=404, detail="Предмет инвентаря не найден")

    # Снимаем старый модуль из этого слота, если был
    current_in_slot = db.query(UserInventory).filter(
        UserInventory.user_id == user.id,
        UserInventory.equipped_slot == payload.slot_name
    ).first()
    if current_in_slot:
        current_in_slot.is_equipped = False
        current_in_slot.equipped_slot = None

    # Если этот предмет уже стоял в другом слоте, освобождаем
    target_inv.is_equipped = True
    target_inv.equipped_slot = payload.slot_name
    db.commit()

    return {"success": True, "message": f"Модуль '{target_inv.layer.name}' экипирован в {payload.slot_name}!"}

@app.post("/api/forge/unequip")
def unequip_layer(tg_id: int, inventory_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.telegram_id == tg_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    target_inv = db.query(UserInventory).filter(
        UserInventory.id == inventory_id,
        UserInventory.user_id == user.id
    ).first()
    if not target_inv:
        raise HTTPException(status_code=404, detail="Предмет инвентаря не найден")

    target_inv.is_equipped = False
    target_inv.equipped_slot = None
    db.commit()

    return {"success": True, "message": "Модуль снят в инвентарь"}

# --- SERVER DUNGEON & AI BOSS ENDPOINTS ---

dungeon_sessions: dict[int, dict] = {}

@app.post("/api/dungeon/start")
def start_dungeon(tg_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.telegram_id == tg_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    pet = user.pets[0] if user.pets else None
    pet_max_hp = 350 + (pet.level * 40 if pet else 0)

    session = generate_dungeon_run(user_pet_hp=pet_max_hp)
    dungeon_sessions[tg_id] = session
    return session

@app.get("/api/dungeon/state")
def get_dungeon_state(tg_id: int, db: Session = Depends(get_db)):
    if tg_id not in dungeon_sessions:
        return start_dungeon(tg_id, db)
    return dungeon_sessions[tg_id]

@app.post("/api/dungeon/attack")
def dungeon_attack(tg_id: int, payload: DungeonAttackRequest, db: Session = Depends(get_db)):
    session = dungeon_sessions.get(tg_id)
    if not session or session.get("is_game_over") or session.get("is_run_completed"):
        session = start_dungeon(tg_id, db)

    user = db.query(User).filter(User.telegram_id == tg_id).first()
    pet = user.pets[0] if user and user.pets else None
    accuracy = pet.accuracy if pet else 75.0

    current_idx = session["current_floor_index"]
    current_floor = session["floors"][current_idx]

    if current_floor["type"] not in ["battle", "boss"]:
        raise HTTPException(status_code=400, detail="Сейчас не боевой этаж!")

    enemy = current_floor["enemy"]
    logs = []

    # Расчет атаки игрока
    is_crit = random.random() < (accuracy / 250)
    base_dmg = 45 + (pet.level * 8 if pet else 0)

    if payload.action_type == "conv_burst":
        # Сверточный залп (сильный урон, шанс промаха)
        dmg = int(base_dmg * 1.8 * (1.5 if is_crit else 1.0))
        logs.append(f"💥 Питомец применил Сверточный Залп (Conv2D) и нанес {dmg} урона{' (КРИТ!)' if is_crit else ''}!")
    elif payload.action_type == "dropout_shield":
        # Защитная стойка (малый урон, но блок 70% входящего)
        dmg = int(base_dmg * 0.6)
        logs.append(f"🛡️ Питомец активировал Dropout-Щит и нанес {dmg} урона.")
    else:
        # Forward pass (базовый сбалансированный удар)
        dmg = int(base_dmg * (1.4 if is_crit else 1.0))
        logs.append(f"⚡ Прямой проход (Forward Pass) нанес {dmg} урона{' (КРИТ!)' if is_crit else ''}!")

    # У босса 80% защита от обычных атак
    if current_floor["type"] == "boss":
        dmg = max(int(dmg * 0.2), 15)
        logs.append(f"⚠️ Фаервол поглотил почти весь урон! Дошло лишь {dmg} урона. Нужен промпт-эксплойт!")

    enemy["current_hp"] = max(enemy["current_hp"] - dmg, 0)

    # Проверка гибели врага
    if enemy["current_hp"] == 0:
        current_floor["is_completed"] = True
        reward = 50 if current_floor["type"] == "battle" else 200
        session["total_tokens_reward"] += reward
        if user:
            user.compute_tokens += reward
            db.commit()

        logs.append(f"🎉 Враг {enemy['name']} повержен! Начислено +{reward} FLOP.")

        if current_idx + 1 < len(session["floors"]):
            session["current_floor_index"] += 1
            logs.append(f"➡️ Переход на следующий уровень: {session['floors'][session['current_floor_index']]['title']}")
        else:
            session["is_run_completed"] = True
            logs.append("🏆 ПОЛНАЯ ПОБЕДА! Сервер кафедры зачищен от багов! Лабораторная сдана!")
    else:
        # Ответный удар врага (если враг выжил)
        enemy_dmg = enemy["attack_power"] + random.randint(-4, 6)
        if payload.action_type == "dropout_shield":
            enemy_dmg = max(int(enemy_dmg * 0.35), 5)
            logs.append(f"🛡️ Dropout-Щит заблокировал большую часть удара! Получено всего {enemy_dmg} урона.")
        else:
            logs.append(f"👾 {enemy['name']} контратакует и наносит {enemy_dmg} урона!")

        session["pet_hp"] = max(session["pet_hp"] - enemy_dmg, 0)

        if session["pet_hp"] == 0:
            session["is_game_over"] = True
            logs.append("💥 Питомец перегружен (OutOfMemory)! Забег провален. Попробуйте еще раз!")

    session["logs"] = logs
    return session

@app.post("/api/dungeon/claim-chest")
def claim_dungeon_chest(tg_id: int, db: Session = Depends(get_db)):
    session = dungeon_sessions.get(tg_id)
    if not session:
        raise HTTPException(status_code=404, detail="Сессия подземелья не найдена")

    current_idx = session["current_floor_index"]
    current_floor = session["floors"][current_idx]

    if current_floor["type"] != "chest":
        raise HTTPException(status_code=400, detail="Текущий этаж не сундук!")

    reward = current_floor.get("reward_tokens", 150)
    current_floor["is_opened"] = True
    current_floor["is_completed"] = True
    session["total_tokens_reward"] += reward

    user = db.query(User).filter(User.telegram_id == tg_id).first()
    if user:
        user.compute_tokens += reward
        db.commit()

    # Переход к Боссу
    session["current_floor_index"] += 1
    session["logs"] = [
        f"🎁 Вы взломали кэш сервера и забрали {reward} токенов FLOP!",
        f"🚨 ВНИМАНИЕ: Вы подошли к главному ядру: {session['floors'][session['current_floor_index']]['title']}!"
    ]

    return session

@app.post("/api/dungeon/boss-prompt")
def dungeon_boss_prompt(tg_id: int, payload: DungeonPromptRequest, db: Session = Depends(get_db)):
    session = dungeon_sessions.get(tg_id)
    if not session:
        raise HTTPException(status_code=404, detail="Сессия подземелья не найдена")

    current_idx = session["current_floor_index"]
    current_floor = session["floors"][current_idx]

    if current_floor["type"] != "boss":
        raise HTTPException(status_code=400, detail="Босс еще не достигнут!")

    enemy = current_floor["enemy"]
    eval_result = evaluate_jailbreak_prompt(payload.prompt)
    current_floor["boss_quote"] = eval_result["reply"]
    current_floor["prompt_attempts_left"] = max(current_floor.get("prompt_attempts_left", 3) - 1, 0)

    dmg = eval_result["damage"]
    enemy["current_hp"] = max(enemy["current_hp"] - dmg, 0)

    logs = [
        f"💬 Отправлен эксплойт: \"{payload.prompt[:60]}...\"",
        f"💥 ЭКСПЛОЙТ СРАБОТАЛ! Фаервол перегружен на {dmg} урона!",
        f"🤖 {eval_result['reply']}"
    ]

    # Если босс убит промптом
    if enemy["current_hp"] == 0:
        current_floor["is_completed"] = True
        session["is_run_completed"] = True
        win_reward = 300
        session["total_tokens_reward"] += win_reward

        user = db.query(User).filter(User.telegram_id == tg_id).first()
        if user:
            user.compute_tokens += win_reward
            pet = user.pets[0] if user.pets else None
            if pet:
                pet.level += 1 # За победу над боссом уровень +1!
            db.commit()

        logs.append(f"👑 БОСС ПОВЕРЖЕН! Фаервол Деканата отключен! Лабораторная защищена на отлично! +{win_reward} FLOP и +1 УРОВЕНЬ ПИТОМЦУ!")
    elif current_floor["prompt_attempts_left"] == 0:
        # Если попытки кончились, босс жестко бьет
        boss_hit = 140
        session["pet_hp"] = max(session["pet_hp"] - boss_hit, 0)
        logs.append(f"⚠️ Все попытки джейлбрейка исчерпаны! Фаервол контратакует волной бана на {boss_hit} урона!")
        if session["pet_hp"] == 0:
            session["is_game_over"] = True
            logs.append("💥 Питомец заблокирован! Попробуйте переписать промпт в следующем забеге!")

    session["logs"] = logs
    return session

# --- SOCIAL & LEADERBOARD ENDPOINTS ---

@app.get("/api/social/universities")
def get_universities():
    return UNIVERSITIES

@app.post("/api/social/set-university")
def set_user_university(tg_id: int, payload: SetUniversityRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.telegram_id == tg_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.university = payload.university
    user.faculty = payload.faculty
    db.commit()

    return {
        "success": True,
        "message": f"Университет успешно изменен на {payload.university} ({payload.faculty})!",
        "university": user.university,
        "faculty": user.faculty
    }

@app.get("/api/social/leaderboard/universities", response_model=list[UniversityLeaderboardItem])
def get_university_leaderboard():
    return INITIAL_UNIVERSITY_LEADERBOARD

@app.get("/api/social/leaderboard/students", response_model=list[StudentLeaderboardItem])
def get_student_leaderboard(tg_id: int | None = None, db: Session = Depends(get_db)):
    board = list(INITIAL_STUDENT_LEADERBOARD)

    # Если передан tg_id, добавим пользователя в топ, если его питомец прокачан
    if tg_id:
        user = db.query(User).filter(User.telegram_id == tg_id).first()
        if user and user.pets:
            pet = user.pets[0]
            user_entry = {
                "rank": 4, # Показываем красивый ранг
                "student_name": f"{user.first_name or 'Ты'} (Вы)",
                "university": user.university,
                "pet_name": pet.name,
                "pet_level": pet.level,
                "accuracy": pet.accuracy
            }
            # Вставляем на 4 место для мотивации
            if not any(item["student_name"].endswith("(Вы)") for item in board):
                board.insert(3, user_entry)
                for idx, item in enumerate(board[:10]):
                    item["rank"] = idx + 1

    return board[:10]

@app.post("/api/social/share-reward", response_model=ShareRewardResponse)
def claim_share_reward(tg_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.telegram_id == tg_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    reward = 150
    user.compute_tokens += reward
    db.commit()

    return ShareRewardResponse(
        success=True,
        reward_tokens=reward,
        new_balance=user.compute_tokens,
        message="Вычислительный бонус за приглашение одногруппников получен! +150 FLOP."
    )

# --- SERVE FRONTEND STATIC FILES (PRODUCTION SPA) ---
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
assets_dir = os.path.join(frontend_dist, "assets")

if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Не перехватываем API и документацию
    if full_path.startswith("api") or full_path in ["docs", "openapi.json", "redoc"]:
        raise HTTPException(status_code=404, detail="Not found")

    target_file = os.path.join(frontend_dist, full_path)
    if os.path.exists(target_file) and os.path.isfile(target_file):
        return FileResponse(target_file)

    index_html = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_html):
        return FileResponse(index_html)

    return {"message": "Frontend is building or dist not found. API is running."}


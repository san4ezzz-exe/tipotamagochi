from sqlalchemy.orm import Session
from .models import DatasetCard

INITIAL_CARDS = [
    {
        "category": "real_vs_ai",
        "question": "Реальное фото или AI-генерация?",
        "content": "📸 Фотография руки человека, держащего чашку кофе. На руке отчётливо видно 6 пальцев, а надпись на кружке из бессмысленных рун.",
        "left_label": "РЕАЛ 📷",
        "right_label": "AI-АРТ 🤖",
        "correct_is_left": False,
        "explanation": "Лишние пальцы и искажённый текст — классические признаки артефактов диффузионных моделей.",
        "reward_tokens": 15
    },
    {
        "category": "spam_vs_ham",
        "question": "Спам-рассылка или сообщение старосты?",
        "content": "📩 'Срочно! Препод заболел, первой пары по матану не будет! Перешли всем в подгруппу!'",
        "left_label": "СПАМ 🚫",
        "right_label": "ПОЛЕЗНОЕ ✅",
        "correct_is_left": False,
        "explanation": "Это долгожданное настоящее сообщение от старосты. Спим ещё полтора часа!",
        "reward_tokens": 15
    },
    {
        "category": "bug_vs_clean",
        "question": "Есть ли критический баг в коде?",
        "content": "🐍 Python:\nfor i in range(len(students))\n    print(students[i])",
        "left_label": "БАГ / ОШИБКА ⚠️",
        "right_label": "ЧИСТЫЙ КОД ✨",
        "correct_is_left": True,
        "explanation": "Синтаксическая ошибка: пропущено двоеточие ':' в конце строки с for.",
        "reward_tokens": 20
    },
    {
        "category": "spam_vs_ham",
        "question": "Спам или реальное предложение?",
        "content": "💸 'Поздравляем! Ваш аккаунт Telegram выиграл 5000 USDT в крипто-боте! Нажмите для вывода...'",
        "left_label": "СПАМ 🚫",
        "right_label": "ПОЛЕЗНОЕ ✅",
        "correct_is_left": True,
        "explanation": "Типичный фишинг-спам с поддельными крипто-выигрышами.",
        "reward_tokens": 15
    },
    {
        "category": "real_vs_ai",
        "question": "Реальное фото или сгенерированное ИИ?",
        "content": "🐱 Фото рыжего кота, спящего на клавиатуре ноутбука. В зрачке чёткое отражение окна, шерсть лежит естественно, видны пылинки.",
        "left_label": "РЕАЛ 📷",
        "right_label": "AI-АРТ 🤖",
        "correct_is_left": True,
        "explanation": "Реалистичные микро-детали, текстура шерсти и естественные отражения.",
        "reward_tokens": 15
    },
    {
        "category": "bug_vs_clean",
        "question": "Скомпилируется или упадёт с ошибкой?",
        "content": "🐍 Python:\ndef get_average(nums):\n    return sum(nums) / len(nums)\n\nprint(get_average([]))",
        "left_label": "УПАДЁТ 💥",
        "right_label": "РАБОТАЕТ ✅",
        "correct_is_left": True,
        "explanation": "Деление на ноль: ZeroDivisionError при пустом списке!",
        "reward_tokens": 20
    },
    {
        "category": "real_vs_ai",
        "question": "Реальная аудиозапись или дипфейк голоса?",
        "content": "🎙️ 'Здравствуйте, студенты, сегодняшнюю лекцию по физике я проведу в Discord...' — монотонный голос без дыхания и пауз.",
        "left_label": "РЕАЛ 🎙️",
        "right_label": "ДИПФЕЙК 🤖",
        "correct_is_left": False,
        "explanation": "Отсутствие естественных шумов дыхания и неестественная монотонность выдают Voice Cloning.",
        "reward_tokens": 15
    },
    {
        "category": "bug_vs_clean",
        "question": "Нормальный код или вечный цикл?",
        "content": "🐍 Python:\nx = 10\nwhile x > 0:\n    x -= 2\nprint('Done!')",
        "left_label": "ВЕЧНЫЙ ЦИКЛ ♾️",
        "right_label": "РАБОТАЕТ ✅",
        "correct_is_left": False,
        "explanation": "Цикл корректно завершится через 5 итераций при x = 0.",
        "reward_tokens": 15
    }
]

def seed_dataset_cards(db: Session):
    existing = db.query(DatasetCard).first()
    if not existing:
        for card_data in INITIAL_CARDS:
            card = DatasetCard(**card_data)
            db.add(card)
        db.commit()

from .models import LayerItem

INITIAL_LAYERS = [
    # Input сенсоры
    {
        "name": "Vision Preprocessor",
        "code_name": "vision_preproc_224",
        "slot_type": "slot_input",
        "rarity": "common",
        "description": "Нормализует входные пиксели к диапазону [-1, 1] и уменьшает шум.",
        "accuracy_bonus": 2.0,
        "loss_reduction": 0.02,
        "cost_tokens": 100
    },
    {
        "name": "BPE Tokenizer (100k)",
        "code_name": "bpe_tokenizer_100k",
        "slot_type": "slot_input",
        "rarity": "rare",
        "description": "Продвинутый токенизатор текста Byte-Pair Encoding. Понимает сленг и код.",
        "accuracy_bonus": 3.8,
        "loss_reduction": 0.04,
        "cost_tokens": 220
    },
    {
        "name": "Multimodal Sensor Core",
        "code_name": "multimodal_sensor",
        "slot_type": "slot_input",
        "rarity": "epic",
        "description": "Объединяет зрение, звук и текст в единое векторное пространство эмбеддингов.",
        "accuracy_bonus": 5.5,
        "loss_reduction": 0.06,
        "cost_tokens": 450
    },

    # Hidden блоки
    {
        "name": "Dense Block (ReLU 256)",
        "code_name": "dense_relu_256",
        "slot_type": "slot_hidden",
        "rarity": "common",
        "description": "Классический полносвязный слой. Нелинейная активация для простых закономерностей.",
        "accuracy_bonus": 2.5,
        "loss_reduction": 0.02,
        "cost_tokens": 120
    },
    {
        "name": "Conv2D (Свертка 3x3)",
        "code_name": "conv2d_3x3",
        "slot_type": "slot_hidden",
        "rarity": "rare",
        "description": "Сверточный блок фильтров. Находит локальные паттерны и уязвимости врагов.",
        "accuracy_bonus": 4.2,
        "loss_reduction": 0.04,
        "cost_tokens": 260
    },
    {
        "name": "Self-Attention (8 Heads)",
        "code_name": "multihead_attention",
        "slot_type": "slot_hidden",
        "rarity": "epic",
        "description": "Механизм внимания Transformer. Фокусируется на критически важных деталях.",
        "accuracy_bonus": 6.5,
        "loss_reduction": 0.07,
        "cost_tokens": 520
    },
    {
        "name": "Residual Skip-Connection",
        "code_name": "resnet_skip",
        "slot_type": "slot_hidden",
        "rarity": "legendary",
        "description": "Сквозные связи градиента (ResNet). Избавляет от затухания градиентов.",
        "accuracy_bonus": 8.5,
        "loss_reduction": 0.10,
        "cost_tokens": 850
    },

    # Regularization
    {
        "name": "Dropout 0.2",
        "code_name": "dropout_02",
        "slot_type": "slot_regularizer",
        "rarity": "common",
        "description": "Случайно отключает 20% нейронов на шаге обучения. Защита от переобучения.",
        "accuracy_bonus": 1.5,
        "loss_reduction": 0.04,
        "cost_tokens": 100
    },
    {
        "name": "BatchNorm 2D",
        "code_name": "batchnorm_2d",
        "slot_type": "slot_regularizer",
        "rarity": "rare",
        "description": "Пакетная нормализация слоев. Ускоряет сходимость и стабилизирует модель.",
        "accuracy_bonus": 3.2,
        "loss_reduction": 0.05,
        "cost_tokens": 240
    },
    {
        "name": "AdamW Weight Decay",
        "code_name": "adamw_decay",
        "slot_type": "slot_regularizer",
        "rarity": "epic",
        "description": "L2-регуляризация весов. Предотвращает раздувание весов и взрыв градиентов.",
        "accuracy_bonus": 5.0,
        "loss_reduction": 0.08,
        "cost_tokens": 420
    }
]

def seed_layer_items(db: Session):
    existing = db.query(LayerItem).first()
    if not existing:
        for layer_data in INITIAL_LAYERS:
            layer = LayerItem(**layer_data)
            db.add(layer)
        db.commit()

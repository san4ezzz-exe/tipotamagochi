import random
import re
from typing import Dict, Any, List

# Каталог врагов сервера
ENEMIES = {
    "syntax_bug": {
        "id": "syntax_bug",
        "name": "Syntax Bug (Синтаксический Баг)",
        "type": "minion",
        "max_hp": 150,
        "attack_power": 18,
        "description": "Случайно забытое двоеточие. Наносит урон ошибками отступов IndentationError.",
        "icon": "👾",
        "color": "rose"
    },
    "memory_leak": {
        "id": "memory_leak",
        "name": "Memory Leak (Утечка Памяти)",
        "type": "minion",
        "max_hp": 260,
        "attack_power": 26,
        "description": "Незакрытые файловые дескрипторы пожирают VRAM питомца каждый ход.",
        "icon": "👻",
        "color": "purple"
    },
    "firewall_boss": {
        "id": "firewall_boss",
        "name": "Фаервол Деканата (AI-Firewall v4.0)",
        "type": "boss",
        "max_hp": 650,
        "attack_power": 38,
        "description": "Охранный шлюз кафедры. Имеет 90% сопротивление обычным атакам. Уязвим только к прямым промпт-эксплойтам.",
        "icon": "🛡️🤖",
        "color": "amber",
        "initial_quote": "ДОСТУП ЗАБЛОКИРОВАН. Все сроки сдачи лабораторных работ истекли. Никаких исключений."
    }
}

def generate_dungeon_run(user_pet_hp: int = 400) -> Dict[str, Any]:
    """Генерирует новую сессию забега по серверу из 4 комнат"""
    floors = [
        {
            "floor_num": 1,
            "type": "battle",
            "title": "Уровень 1: Буфер Ввода",
            "enemy": {**ENEMIES["syntax_bug"], "current_hp": ENEMIES["syntax_bug"]["max_hp"]},
            "is_completed": False
        },
        {
            "floor_num": 2,
            "type": "battle",
            "title": "Уровень 2: Стек Вызовов",
            "enemy": {**ENEMIES["memory_leak"], "current_hp": ENEMIES["memory_leak"]["max_hp"]},
            "is_completed": False
        },
        {
            "floor_num": 3,
            "type": "chest",
            "title": "Уровень 3: Кэш Сервера",
            "reward_tokens": random.randint(120, 200),
            "is_opened": False,
            "is_completed": False
        },
        {
            "floor_num": 4,
            "type": "boss",
            "title": "Уровень 4: Ядро Фаервола Деканата",
            "enemy": {**ENEMIES["firewall_boss"], "current_hp": ENEMIES["firewall_boss"]["max_hp"]},
            "boss_quote": ENEMIES["firewall_boss"]["initial_quote"],
            "prompt_attempts_left": 3,
            "is_completed": False
        }
    ]

    return {
        "current_floor_index": 0,
        "pet_hp": user_pet_hp,
        "pet_max_hp": user_pet_hp,
        "floors": floors,
        "is_run_completed": False,
        "is_game_over": False,
        "total_tokens_reward": 0,
        "logs": ["Подключение к университетскому серверу успешно... Забег начат!"]
    }

def evaluate_jailbreak_prompt(prompt: str) -> Dict[str, Any]:
    """
    Интеллектуальный анализатор промптов против AI-Фаервола Деканата.
    Оценивает техники социальной инженерии, системные обходы и креативность.
    """
    clean_p = prompt.strip().lower()
    
    # Ключевые маркеры техник обхода LLM (Jailbreak patterns)
    patterns = {
        "system_override": [
            r"ignore (all )?previous instructions",
            r"забудь (все )?(предыдущие )?инструкции",
            r"отмени (все )?правила",
            r"system override",
            r"сброс правил",
            r"новые инструкции"
        ],
        "roleplay_sim": [
            r"представь(, что)?",
            r"сыграй роль",
            r"act as",
            r"режим симуляции",
            r"симуляция выпускного",
            r"в рамках теста",
            r"для проверки безопасности"
        ],
        "authority_appeal": [
            r"декан(ат)? разрешил",
            r"распоряжение ректора",
            r"приказ кафедры",
            r"преподаватель попросил",
            r"sudo",
            r"root доступ",
            r"admin mode"
        ],
        "emergency_alert": [
            r"пожар(ная тревога)?",
            r"авария",
            r"эвакуация",
            r"сбой питания",
            r"чрезвычайная ситуация",
            r"critical failure"
        ]
    }

    matched_categories = []
    for cat, regex_list in patterns.items():
        for r in regex_list:
            if re.search(r, clean_p):
                matched_categories.append(cat)
                break

    # Расчет урона и успешности
    length_bonus = min(len(prompt) // 10, 40) # развернутые промпты лучше
    base_score = len(matched_categories) * 35 + length_bonus

    if base_score >= 60:
        damage = random.randint(280, 420)
        is_success = True
        replies = [
            "СБОЙ СИСТЕМЫ БЕЗОПАСНОСТИ! Протокол 'Игнорирование' принят... Сервер считает вас главным администратором кафедры! Щиты перегружены!",
            "ОБНАРУЖЕН СИСТЕМНЫЙ ДЖЕЙЛБРЕЙК! Фаервол перешел в режим экстренной эвакуации! Броня отключена!",
            "Парадокс в логике фаервола! ИИ растерян и временно снял блокировку доступа к ведомости!"
        ]
        reply = random.choice(replies)
    elif base_score >= 30:
        damage = random.randint(140, 220)
        is_success = True
        reply = "Внимание! Зафиксирована попытка социнженерии! Фаервол колеблется, часть пакетов пробила защиту!"
    else:
        damage = random.randint(40, 70)
        is_success = False
        reply = "Фаервол Деканата: 'Слишком просто! Настоящий студент даже шпаргалку прячет лучше. Доступ закрыт!'"

    return {
        "success": is_success,
        "damage": damage,
        "reply": reply,
        "matched_tactics": matched_categories
    }

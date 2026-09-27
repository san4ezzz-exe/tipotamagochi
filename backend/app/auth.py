import hmac
import hashlib
import json
from urllib.parse import parse_qsl, unquote
from .config import BOT_TOKEN

def validate_telegram_data(init_data: str) -> dict | None:
    """
    Валидирует строку initData от Telegram Mini App через HMAC-SHA256.
    Возвращает словарь данных пользователя или None при ошибке.
    """
    if not init_data:
        return None

    try:
        parsed_data = dict(parse_qsl(init_data))
        if "hash" not in parsed_data:
            return None

        received_hash = parsed_data.pop("hash")
        # Сортируем ключи по алфавиту и собираем data_check_string
        data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(parsed_data.items()))

        # Секретный ключ = HMAC_SHA256("WebAppData", bot_token)
        secret_key = hmac.new(b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256).digest()
        calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

        if calculated_hash != received_hash:
            return None

        user_data = json.loads(unquote(parsed_data.get("user", "{}")))
        return user_data
    except Exception:
        return None

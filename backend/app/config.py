import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "mock_bot_token_for_dev")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./neuropet.db")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

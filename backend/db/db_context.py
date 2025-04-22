import asyncio
from beanie import init_beanie
from models.my_config import get_settings
from motor.motor_asyncio import AsyncIOMotorClient

from models.vacation import Vacation
from models.user import User


async def init_database():
    try:
        my_config = get_settings()
        client = AsyncIOMotorClient(my_config.connection_string)
        db = client["vacation_planner"]
        await init_beanie(database=db, document_models=[User, Vacation])

        print("Database initialized successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")

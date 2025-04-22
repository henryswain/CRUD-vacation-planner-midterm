from beanie import Document
from pydantic import BaseModel


class User(Document):
    username: str
    email: str
    password: str  # hash & salted password in the database

    class Settings:
        name = "users"


class UserRequest(BaseModel):
    """
    # model for user sign up
    """

    username: str
    email: str
    password: str  # plain text from user inputdocu
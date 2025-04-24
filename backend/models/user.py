from beanie import Document
from pydantic import BaseModel


class User(Document):
    username: str
    email: str
    password: str  # hash & salted password in the database
    role: str = "BasicUser"

    class Settings:
        name = "users"


class UserRequest(BaseModel):
    """
    # model for user sign up
    """

    username: str
    email: str
    password: str  # plain text from user input


class UserDto(BaseModel):
    id: str
    username: str
    email: str
    role: str
from typing import Annotated
from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext

from auth.jwt_auth import LoginResult, TokenData, create_access_token, decode_jwt_token
from models.user import User, UserDto, UserRequest

pwd_context = CryptContext(schemes=["bcrypt"])


class HashPassword:
    def create_hash(self, password: str):
        return pwd_context.hash(password)

    def verify_hash(self, input_password: str, hashed_password: str):
        return pwd_context.verify(input_password, hashed_password)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
hash_password = HashPassword()


def get_user(token: Annotated[str, Depends(oauth2_scheme)]) -> TokenData:
    print(token)
    return decode_jwt_token(token)


user_router = APIRouter()


@user_router.post("/sign-up")
async def sign_up(user: UserRequest):
    existing_user = await User.find_one(User.username == user.username)

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists.")

    hashed_pwd = hash_password.create_hash(user.password)
    new_user = User(username=user.username, password=hashed_pwd, email=user.email)
    await new_user.create()
    return {"message": "User created successfully."}


@user_router.post("/login")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> LoginResult:
    ## Authenticate user by verifying the user in DB
    username = form_data.username
    existing_user = await User.find_one(User.username == username)
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    authenticated = hash_password.verify_hash(
        form_data.password, existing_user.password
    )
    if authenticated:
        access_token = create_access_token(
            {"username": username, "role": existing_user.role}
        )
        return LoginResult(
            access_token=access_token,
            username=existing_user.username,
            role=existing_user.role,
        )

    raise HTTPException(status_code=401, detail="Invalid username or password")


@user_router.get("")
async def get_all_users(user: Annotated[TokenData, Depends(get_user)]) -> list[UserDto]:
    if not user or not user.username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Please login.",
        )
    if user.role != "AdminUser":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You don't have enough permissions for this action.",
        )
    users = await User.find_all().to_list()
    result = []
    for u in users:
        result.append(
            UserDto(id=str(u.id), username=u.username, email=u.email, role=u.role)
        )
    return result


@user_router.post("/{id}")
async def update_user_role(
    id: PydanticObjectId, user: Annotated[TokenData, Depends(get_user)]
) -> dict:
    if not user or not user.username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Please login.",
        )
    if user.role != "AdminUser":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"You don't have enough permissions for this action.",
        )

    affected_user = await User.get(id)
    if not affected_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"The user with ID={id} is not found.",
        )

    if affected_user.role == "BasicUser":
        affected_user.role = "AdminUser"
    if affected_user.role == "AdminUser":
        affected_user.role = "BasicUser"
    await affected_user.save()
    return {"message": "User role updated."}
import re

from pydantic import BaseModel, Field, validator


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=50)
    role: str = Field(..., pattern="^(admin|manager)$")

    @validator('username')
    def username_alphanumeric(cls, v):
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('Ім''я користувача має містити лише літери, цифри та знак підкреслення')
        return v

    @validator('password')
    def password_strength(cls, v):
        if not re.search(r'[A-Z]', v):
            raise ValueError('Пароль повинен містити хоча б одну велику літеру')
        if not re.search(r'[a-z]', v):
            raise ValueError('Пароль повинен містити хоча б одну малу літеру')
        if not re.search(r'\d', v):
            raise ValueError('Пароль повинен містити хоча б одну цифру')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Пароль повинен містити хоча б один спеціальний символ')
        return v


class UserOut(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        from_attributes = True


class UserRead(BaseModel):
    id: int
    username: str
    role: str
    is_banned: bool

    class Config:
        from_attributes = True


class LoginInput(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=50)


class LoginResult(BaseModel):
    access_token: str
    token_type: str = Field(..., pattern="^bearer$")


class PasswordChangeInput(BaseModel):
    old_password: str = Field(..., min_length=8, max_length=50)
    new_password: str = Field(..., min_length=8, max_length=50)

    @validator('new_password')
    def password_strength(cls, v):
        if not re.search(r'[A-Z]', v):
            raise ValueError('Новий пароль повинен містити хоча б одну велику літеру')
        if not re.search(r'[a-z]', v):
            raise ValueError('Новий пароль повинен містити хоча б одну малу літеру')
        if not re.search(r'\d', v):
            raise ValueError('Новий пароль повинен містити хоча б одну цифру')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Новий пароль повинен містити хоча б один спеціальний символ')
        return v

    @validator('new_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'old_password' in values and v == values['old_password']:
            raise ValueError('Новий пароль має відрізнятися від старого')
        return v


class ChangeRoleInput(BaseModel):
    username: str
    role: str

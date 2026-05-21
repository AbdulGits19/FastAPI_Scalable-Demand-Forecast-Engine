from pydantic import BaseModel, EmailStr
from typing import Optional

# What is required to Create a user (Register)
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

# What we send back to the Frontend (Public info)
class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_active: bool

    class Config:
        from_attributes = True # This tells Pydantic to play nice with SQLAlchemy
from pydantic import BaseModel, EmailStr
from enum import Enum

# 1️⃣ Explicit Phase 3 Role Classifications
class RoleEnum(str, Enum):
    SUPER_ADMIN = "Super Admin"
    ANALYST = "Analyst"
    VIEWER = "Viewer"

# 2️⃣ Base schema for shared attributes across user operations
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: RoleEnum = RoleEnum.VIEWER  # Defaults to Viewer for safety if not provided

# 3️⃣ What is required to Create a user (Register) - Inherits username & email
class UserCreate(UserBase):
    password: str

# 4️⃣ What we send back to the Frontend / Client (Public Info)
class UserOut(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True  # This tells Pydantic to play nice with SQLAlchemy
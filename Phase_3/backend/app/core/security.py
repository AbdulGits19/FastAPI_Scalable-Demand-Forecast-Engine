from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
import os

# Tell passlib to use bcrypt for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pull environment security variables
SECRET_KEY = os.getenv("SECRET_KEY", "SUPER_SECRET_FALLBACK_KEY_DO_NOT_USE_IN_PROD")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    """
    Generates a cryptographically signed JWT token string.
    Phase 3 Upgrade: Explicitly retains all key-value claims passed in 
    the 'data' dictionary parameter (like subject, username, and role).
    """
    to_encode = data.copy()
    
    # Establish standard session expiration window parameters (30 minutes)
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    
    # Generate the signed token payload
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
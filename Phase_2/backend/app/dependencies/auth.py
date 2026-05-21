from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from app.core.security import SECRET_KEY, ALGORITHM
from app.core.database import get_db
from app.crud.user import get_user_by_email
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer



oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        # 1. Decode the token using your Secret Key
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) # type: ignore
        email: str = payload.get("sub") # type: ignore
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expired or invalid")
        
    # 2. Find the user in the DB
    user = get_user_by_email(db, email=email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user
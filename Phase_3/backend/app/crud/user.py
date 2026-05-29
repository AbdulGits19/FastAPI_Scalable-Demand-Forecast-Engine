from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import hash_password

def get_user_by_email(db: Session, email: str):
    # This is like searching the library for a specific email
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    # 1. Take the plain password and turn it into gibberish (Hash)
    hashed_pass = hash_password(user.password)
    
    # 2. Create the User object for SQLAlchemy
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pass
    )
    
    # 3. Push it to the database
    db.add(db_user)
    db.commit() # This "Saves" the changes
    db.refresh(db_user) # This gives us the ID the database generated
    
    return db_user
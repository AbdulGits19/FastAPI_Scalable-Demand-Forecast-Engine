from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.database import get_db
from app.schemas.user import UserCreate, UserOut
from app.crud.user import create_user, get_user_by_email
from app.core.security import verify_password, create_access_token
from app.schemas.auth import LoginRequest, Token
from app.dependencies.auth import get_current_user 

router = APIRouter(prefix="/auth", tags=["auth"])

MASTER_ADMIN_EMAIL = "admin@aol.com"
MASTER_ADMIN_PASS = "Admin@786786"

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if user.email.lower() == MASTER_ADMIN_EMAIL.lower():
        raise HTTPException(
            status_code=400, 
            detail="Registration denied: Administrative email namespace is reserved."
        )

    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    return create_user(db=db, user=user)


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    incoming_username = form_data.username.lower().strip()

    # 1. Master Admin In-Memory Login Handler
    if incoming_username == MASTER_ADMIN_EMAIL.lower() and form_data.password == MASTER_ADMIN_PASS:
        access_token = create_access_token(
            data={
                "sub": MASTER_ADMIN_EMAIL,
                "id": 0,               
                "is_admin": True       
            }
        )
        return {"access_token": access_token, "token_type": "bearer"}

    # 2. Database User Lookup Handler
    user = get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(
        data={
            "sub": user.email,
            "id": user.id,
            "is_admin": getattr(user, "is_admin", False)
        }
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
def get_authenticated_profile_meta(current_user = Depends(get_current_user)):
    """
    Session Hydration Tracker: Fetches the live credentials of the verified
    token operator directly from the active session context.
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": getattr(current_user, "username", "Standard User"),
        "is_admin": getattr(current_user, "is_admin", False)
    }


@router.post("/logout")
def logout_user_session(current_user = Depends(get_current_user)):
    """
    Session Termination Gateway: Responds to a client logout event to prompt
    safe frontend state deletion patterns.
    """
    return {
        "status": "success",
        "message": "Session closed. Frontend client cleared cleanly."
    }


@router.post("/refresh", response_model=Token)
def refresh_access_token(current_user = Depends(get_current_user)):
    """
    Token Renewal Pipeline: Grants a fresh, updated access token to an active 
    session without requiring manual re-login screens.
    """
    new_token = create_access_token(
        data={
            "sub": current_user.email,
            "id": current_user.id,
            "is_admin": getattr(current_user, "is_admin", False)
        }
    )
    return {"access_token": new_token, "token_type": "bearer"}


@router.put("/make-me-admin-instantly")
def quick_admin_shortcut(email: str, secret_code: str, db: Session = Depends(get_db)):
    """
    Protected Admin Shortcut: Upgrades a user row to admin status 
    ONLY if they know the top-secret platform passphrase.
    """
    # 1. Check if the secret code matches perfectly
    if secret_code != "goldenegg99":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid administrative secret code passphrase."
        )

    # 2. Find the user target in MySQL rows
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # 3. Securely promote to admin
    user.is_admin = True
    db.commit()
    
    return {
        "status": "success", 
        "message": f"Passphrase verified! {email} has been elevated to an admin. Re-login to get your admin token."
    }
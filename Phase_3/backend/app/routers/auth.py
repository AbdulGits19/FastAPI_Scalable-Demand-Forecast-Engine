from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.database import get_db
from app.schemas.user import UserCreate, UserOut, RoleEnum
from app.crud.user import create_user, get_user_by_email
from app.core.security import verify_password, create_access_token
from app.schemas.auth import Token
from app.dependencies.auth import get_current_user 

router = APIRouter(prefix="/auth", tags=["auth"])

MASTER_ADMIN_EMAIL = "admin@aol.com"
MASTER_ADMIN_PASS = "Admin@786786"


# --- 1. SECURE PRODUCTION REGISTRATION ENGINE ---
@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """
    Phase 3 Register Gate: Enforces role-based compliance definitions. 
    Forces all open public registrations to default strictly to 'Viewer'.
    """
    if user.email.lower() == MASTER_ADMIN_EMAIL.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Registration denied: Administrative email namespace is reserved."
        )

    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    # 🔒 SECURE INTERCEPT: Force standard public onboarding to default to Viewer status
    # This prevents malicious actors or standard payload parameters from claiming elevation
    user.role = RoleEnum.VIEWER if hasattr(RoleEnum, "VIEWER") else "Viewer"
    
    return create_user(db=db, user=user)


# --- 2. MULTI-TIER LOGIN INTERCEPTOR GATES ---
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    incoming_username = form_data.username.lower().strip()

    # Gate A: In-Memory Master Admin Login Handler (Fallback Root Super Admin)
    if incoming_username == MASTER_ADMIN_EMAIL.lower() and form_data.password == MASTER_ADMIN_PASS:
        access_token = create_access_token(
            data={
                "sub": MASTER_ADMIN_EMAIL,
                "id": 0,               
                "username": "master_admin",
                "role": "Super Admin"
            }
        )
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "user": { "id": 0, "email": MASTER_ADMIN_EMAIL, "username": "master_admin", "role": "Super Admin" }
        }

    # Gate B: Dynamic Database User Lookup Handler
    user = get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    # Extract structural role strings cleanly from row targets
    user_role = getattr(user, "role", "Viewer")
    if hasattr(user_role, "value"):  
        user_role = user_role.value
    else:
        user_role = str(user_role)

    access_token = create_access_token(
        data={
            "sub": user.email,
            "id": user.id,
            "username": getattr(user, "username", "User Profile"),
            "role": user_role
        }
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": { "id": user.id, "email": user.email, "username": getattr(user, "username", "User Profile"), "role": user_role }
    }


# --- 3. SESSION HYDRATION TRACKER ---
@router.get("/me")
def get_authenticated_profile_meta(current_user: User = Depends(get_current_user)):
    user_role = getattr(current_user, "role", "Viewer")
    if hasattr(user_role, "value"):
        user_role = user_role.value
    else:
        user_role = str(user_role)

    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": getattr(current_user, "username", "Standard User"),
        "role": user_role
    }


# --- 4. SESSION TERMINATION GATEWAY ---
@router.post("/logout")
def logout_user_session(current_user = Depends(get_current_user)):
    return { "status": "success", "message": "Session closed. Frontend client cleared cleanly." }


# --- 5. TOKEN RENEWAL PIPELINE ---
@router.post("/refresh")
def refresh_access_token(current_user: User = Depends(get_current_user)):
    user_role = getattr(current_user, "role", "Viewer")
    if hasattr(user_role, "value"):
        user_role = user_role.value
    else:
        user_role = str(user_role)

    new_token = create_access_token(
        data={
            "sub": current_user.email,
            "id": current_user.id,
            "username": getattr(current_user, "username", "Standard User"),
            "role": user_role
        }
    )
    return {
        "access_token": new_token, 
        "token_type": "bearer",
        "user": { "id": current_user.id, "email": current_user.email, "username": getattr(current_user, "username", "Standard User"), "role": user_role }
    }


# --- 6. 🔥 UPGRADED: DYNAMIC ROLE ELEVATION SHORTCUT (NO MORE HARDCODING) ---
@router.put("/elevate-user-role")
def elevate_user_role_shortcut(
    email: str, 
    target_role: str = Query(..., description="Options: 'Super Admin', 'Analyst', 'Viewer'"), 
    secret_code: str = Query(...), 
    db: Session = Depends(get_db)
):
    """
    Dynamic Administrative Sandbox Bypass: Promotes any database user account record 
    to specific target authorization tiers matching your exact business structures.
    """
    if secret_code != "goldenegg99":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid administrative secret code passphrase."
        )

    # Validate incoming role string parameters matching your three-tier logic
    normalized_role = target_role.strip()
    if normalized_role not in ["Super Admin", "Analyst", "Viewer"]:
        raise HTTPException(
            status_code=400, 
            detail="Invalid role configuration requested. Choose from: 'Super Admin', 'Analyst', or 'Viewer'."
        )

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User profile record not found")
        
    # Map roles safely matching backend schemas structures
    if normalized_role == "Super Admin":
        user.role = RoleEnum.SUPER_ADMIN if hasattr(RoleEnum, "SUPER_ADMIN") else "Super Admin"
        user.is_admin = True
    elif normalized_role == "Analyst":
        user.role = RoleEnum.ANALYST if hasattr(RoleEnum, "ANALYST") else "Analyst"
        user.is_admin = False
    else:
        user.role = RoleEnum.VIEWER if hasattr(RoleEnum, "VIEWER") else "Viewer"
        user.is_admin = False

    db.commit()
    
    return {
        "status": "success", 
        "message": f"Authorization matrix synced! '{email}' has been successfully provisioned as an active '{normalized_role}'."
    }
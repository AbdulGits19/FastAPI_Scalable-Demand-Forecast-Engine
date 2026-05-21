from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from app.models.user import User
from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.dataset import SalesData, ForecastHistory

router = APIRouter(prefix="/admin", tags=["admin"])


# --- 1. PRIVILEGE ELEVATION ENGINE ---
@router.put("/users/{user_id}/grant-admin")
def grant_admin_access(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Role Elevation Gate: Explicitly upgrades an existing user account 
    from a standard profile to a system administrator directly in MySQL.
    """
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access Denied: Administrative privileges required."
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail=f"Target user with ID {user_id} does not exist.")

    target_user.is_admin = True
    db.commit()

    return {
        "status": "success",
        "message": f"User '{target_user.email}' has been successfully upgraded to System Administrator."
    }


# --- 2. NEW: PRIVILEGE REVOCATION ENGINE ---
@router.put("/users/{user_id}/revoke-admin")
def revoke_admin_access(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Role Demotion Gate: Explicitly strips administrative rights from a user,
    reverting their account back down to a standard operational profile.
    """
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access Denied: Administrative privileges required."
        )

    # Prevent a master administrator from locking themselves out of the system panel
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Self-demotion is restricted to preserve root availability."
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail=f"Target user with ID {user_id} does not exist.")

    target_user.is_admin = False
    db.commit()

    return {
        "status": "success",
        "message": f"User '{target_user.email}' has been demoted to Standard User."
    }


# --- 3. SYSTEM-WIDE GLOBAL KPIS ---
@router.get("/dashboard-stats")
def get_system_wide_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Provides global system KPIs and total data load weight for the Admin Panel.
    """
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Administrative privileges required."
        )

    total_users = db.query(func.count(User.id)).scalar() or 0
    total_sales_records = db.query(func.count(SalesData.id)).scalar() or 0
    total_forecasts_run = db.query(func.count(ForecastHistory.id)).scalar() or 0

    top_items = (
        db.query(SalesData.product_name, func.sum(SalesData.quantity).label("total_sold"))
        .group_by(SalesData.product_name)
        .order_by(func.sum(SalesData.quantity).desc())
        .limit(5)
        .all()
    )

    return {
        "system_kpis": {
            "total_registered_users": total_users,
            "total_rows_uploaded": total_sales_records,
            "total_ml_models_triggered": total_forecasts_run
        },
        "global_inventory_ranking": [
            {"product_name": item[0], "total_units_moved": int(item[1] or 0)}
            for item in top_items
        ]
    }


# --- 4. SERVER SYSTEM ACTIVITY STREAM ---
@router.get("/system-activity")
def get_global_activity_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # 🔥 FIXED: Typed accurately as User database object
):
    """
    Pulls the latest global model execution sequences to monitor server load allocations.
    """
    
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Administrative permission required."
        )

    recent_runs = (
        db.query(ForecastHistory)
        .order_by(ForecastHistory.id.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "id": run.id,
            "product_name": run.product_name,
            "model_used": run.model_used,
            "executed_at": getattr(run, "forecast_run_date", datetime.now()).strftime("%Y-%m-%d %H:%M:%S")
        }
        for run in recent_runs
    ]


# --- 5. SYSTEM USER ACCOUNT LIST ---
@router.get("/users")
def get_all_system_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    User Management: Returns a structural list of all registered accounts.
    """
    if not getattr(current_user, "is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access Denied: Administrative privileges required."
        )

    users = db.query(User).order_by(User.id.asc()).all()

    return [
        {
            "id": u.id,
            "username": getattr(u, "username", "User"),
            "email": u.email,
            "is_admin": getattr(u, "is_admin", False)
        }
        for u in users
    ]
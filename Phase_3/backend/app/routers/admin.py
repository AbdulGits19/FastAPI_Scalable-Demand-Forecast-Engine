from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from app.models.user import User
from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.dataset import SalesData, ForecastHistory
from app.models.audit import AuditHistory  # Phase 3 Telemetry Data Source
from app.schemas.user import RoleEnum      # Phase 3 RBAC Control Structure

router = APIRouter(prefix="/admin", tags=["admin"])


# --- 1. PRIVILEGE ELEVATION ENGINE ---
@router.put("/users/{user_id}/grant-admin")
def grant_admin_access(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Role Elevation Gate: Upgrades an account to Super Admin status 
    and turns on backward compatibility tracking flags inside MySQL.
    """
    if getattr(current_user, "role", None) != RoleEnum.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access Denied: Super Admin security credentials required."
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail=f"Target user with ID {user_id} does not exist.")

    target_user.role = RoleEnum.SUPER_ADMIN
    target_user.is_admin = True  # Retained for Phase 2 backward compatibility
    db.commit()

    return {
        "status": "success",
        "message": f"User '{target_user.email}' has been successfully upgraded to Super Admin."
    }


# --- 2. PRIVILEGE REVOCATION ENGINE ---
@router.put("/users/{user_id}/revoke-admin")
def revoke_admin_access(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Role Demotion Gate: Strips administrative rights, dropping the profile 
    back down to standard Viewer status parameters.
    """
    if getattr(current_user, "role", None) != RoleEnum.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access Denied: Super Admin security credentials required."
        )

    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Self-demotion is restricted to preserve root availability."
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail=f"Target user with ID {user_id} does not exist.")

    target_user.role = RoleEnum.VIEWER
    target_user.is_admin = False  # Sync legacy field state
    db.commit()

    return {
        "status": "success",
        "message": f"User '{target_user.email}' has been demoted to Viewer status."
    }


# --- 3. SYSTEM-WIDE GLOBAL KPIS ---
@router.get("/dashboard-stats")
def get_system_wide_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Provides global system KPIs and total data load weight for the Admin Panel dashboard.
    """
    if getattr(current_user, "role", None) != RoleEnum.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Super Admin privileges required."
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
    current_user: User = Depends(get_current_user)
):
    """
    Pulls the latest global model execution sequences to monitor server load allocations.
    """
    if getattr(current_user, "role", None) != RoleEnum.SUPER_ADMIN:
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
    User Management: Returns a structural list of all registered accounts with role strings.
    """
    if getattr(current_user, "role", None) != RoleEnum.SUPER_ADMIN:
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
            "is_admin": getattr(u, "is_admin", False),
            "role": getattr(u, "role", RoleEnum.VIEWER).value if hasattr(u, "role") else RoleEnum.VIEWER.value
        }
        for u in users
    ]


# --- 6. 🔥 NEW PHASE 3: INFRASTRUCTURE TELEMETRY ROUTE (`L3-NW3`) ---
@router.get("/telemetry-performance")
def get_system_telemetry_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Administrative Performance Metrics: Aggregates system logging hits 
    and checks latency averages to drive infrastructure health graphs.
    """
    if getattr(current_user, "role", None) != RoleEnum.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Operational logging data restricted to Super Admins."
        )

    total_requests = db.query(AuditHistory).count()
    avg_latency = db.query(func.avg(AuditHistory.execution_time_ms)).scalar() or 0.0
    
    # Calculate top paths grouped by endpoint execution
    endpoint_hits = db.query(
        AuditHistory.endpoint_url,
        AuditHistory.request_method,
        func.count(AuditHistory.id).label("hit_count"),
        func.avg(AuditHistory.execution_time_ms).label("avg_path_latency")
    ).group_by(AuditHistory.endpoint_url, AuditHistory.request_method)\
     .order_by(func.count(AuditHistory.id).desc())\
     .limit(5).all()

    metrics_breakdown = [
        {
            "endpoint": row[0],
            "method": row[1],
            "hits": int(row[2]),
            "avg_latency_ms": round(float(row[3]), 2)
        }
        for row in endpoint_hits
    ]

    return {
        "status": "Success",
        "system_summary": {
            "total_logged_transactions": total_requests,
            "average_system_latency_ms": round(float(avg_latency), 2),
            "telemetry_health_status": "Optimal" if avg_latency < 200 else "High Latency Alert"
        },
        "top_performing_routes": metrics_breakdown
    }
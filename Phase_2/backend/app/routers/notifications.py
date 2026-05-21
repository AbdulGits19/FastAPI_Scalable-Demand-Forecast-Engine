from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.dependencies.auth import get_current_user 
from app.models.dataset import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/")
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Fetches all unread and recent notifications for the logged-in user,
    ordered newest first to feed the dashboard bell dropdown.
    """
    # Standardized to dot notation: current_user.id
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(20)
        .all()
    )
    
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "notification_type": n.notification_type,
            "is_read": n.is_read,
            "created_at": n.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
        for n in notifications
    ]

@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Marks a specific notification as read when clicked on the UI,
    which clears down the frontend badge count.
    """
    # Standardized to dot notation: current_user.id
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notif:
        raise HTTPException(status_code=404, detail="Notification alert not found.")

    # Using setattr to clean up strict SQLAlchemy type checks in Pylance
    setattr(notif, "is_read", True)
    db.commit()
    
    return {"status": "success", "message": "Notification marked as read."}


@router.delete("/clear-all")
def clear_all_user_notifications(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Performance Tweak: Mass-deletes read notifications for the active user
    to optimize storage and keep database row indexing clean.
    """
    # FIXED: Changed current_user["id"] to current_user.id to prevent User object crash
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == True
    ).delete(synchronize_session=False)
    
    db.commit()
    return {"status": "success", "message": "All read alerts purged from history."}


@router.put("/read-all")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    UX Upgrade: Updates all unread notification rows for the active user
    to read state instantly.
    """
    # Standardized to dot notation: current_user.id
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True}, synchronize_session=False)
    
    db.commit()
    return {"status": "success", "message": "All incoming alerts marked as read."}
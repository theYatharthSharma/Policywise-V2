from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[schemas.NotificationOut])
def list_notifications(
    current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return (
        db.query(models.Notification)
        .filter(models.Notification.user_id == current_user.id)
        .order_by(models.Notification.date.desc())
        .all()
    )


@router.patch("/{notification_id}/read", response_model=schemas.NotificationOut)
def mark_read(
    notification_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notif = db.get(models.Notification, notification_id)
    if not notif or notif.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.post("/read-all", response_model=list[schemas.NotificationOut])
def mark_all_read(
    current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)
):
    notifs = db.query(models.Notification).filter(models.Notification.user_id == current_user.id).all()
    for n in notifs:
        n.read = True
    db.commit()
    return notifs

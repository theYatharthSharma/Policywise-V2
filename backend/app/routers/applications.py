from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("", response_model=list[schemas.ApplicationOut])
def list_applications(
    current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return (
        db.query(models.Application)
        .filter(models.Application.user_id == current_user.id)
        .order_by(models.Application.applied_date.desc())
        .all()
    )


@router.post("", response_model=schemas.ApplicationOut, status_code=201)
def create_application(
    payload: schemas.ApplicationCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    policy = db.get(models.Policy, payload.policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    application = models.Application(
        user_id=current_user.id,
        policy_id=policy.id,
        policy_name=policy.name,
        status="Pending",
        applied_date=date.today(),
        timeline=[
            {"label": "Application Submitted", "date": str(date.today()), "done": True},
            {"label": "Documents Verified", "date": "—", "done": False},
        ],
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


@router.get("/{application_id}", response_model=schemas.ApplicationOut)
def get_application(
    application_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    application = db.get(models.Application, application_id)
    if not application or application.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


@router.patch("/{application_id}/status", response_model=schemas.ApplicationOut)
def update_status(
    application_id: str,
    payload: schemas.ApplicationStatusUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Agent/admin-side endpoint to move an application through its lifecycle."""
    application = db.get(models.Application, application_id)
    if not application or application.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Application not found")
    application.status = payload.status
    db.commit()
    db.refresh(application)
    return application

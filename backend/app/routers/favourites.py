from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/favourites", tags=["favourites"])


@router.get("", response_model=list[schemas.PolicyOut])
def list_favourites(
    current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)
):
    favs = db.query(models.Favourite).filter(models.Favourite.user_id == current_user.id).all()
    policy_ids = [f.policy_id for f in favs]
    if not policy_ids:
        return []
    return db.query(models.Policy).filter(models.Policy.id.in_(policy_ids)).all()


@router.post("", status_code=201)
def add_favourite(
    payload: schemas.FavouriteCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    policy = db.get(models.Policy, payload.policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    existing = (
        db.query(models.Favourite)
        .filter(models.Favourite.user_id == current_user.id, models.Favourite.policy_id == policy.id)
        .first()
    )
    if existing:
        return {"status": "already favourited"}
    fav = models.Favourite(user_id=current_user.id, policy_id=policy.id)
    db.add(fav)
    db.commit()
    return {"status": "added"}


@router.delete("/{policy_id}", status_code=204)
def remove_favourite(
    policy_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fav = (
        db.query(models.Favourite)
        .filter(models.Favourite.user_id == current_user.id, models.Favourite.policy_id == policy_id)
        .first()
    )
    if fav:
        db.delete(fav)
        db.commit()
    return None

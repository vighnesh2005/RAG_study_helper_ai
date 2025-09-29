from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import schemas, deps, models 
import bcrypt
from app import middleware as middleware
from fastapi.security import OAuth2PasswordRequestForm
import datetime

router = APIRouter()

#routes for signup and login

@router.post("/signup")
async def signup(data:models.UserCreate, db: Session = Depends(deps.get_db)):
    username = data.username
    email = data.email
    password = data.password
    
    if(db.query(schemas.User).filter(schemas.User.email == email).first()):
        return {"error":"Email already exists"}
    
    new_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    new_user = schemas.User(username=username, email=email, password=new_password,created_at=datetime.datetime.now(),updated_at=datetime.datetime.now())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message":"User created successfully","user":new_user}

@router.post("/login")
async def login(data:OAuth2PasswordRequestForm = Depends(), db: Session = Depends(deps.get_db)):
    email = data.username
    password = data.password
    user = db.query(schemas.User).filter(schemas.User.email == email).first()
    if not user:
        return {"error":"Invalid email or password"}
    if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        return {"error":"Invalid email or password"}
    token = middleware.create_access_token({"user_id": user.user_id, "email": user.email})
    return {"access_token": token,
            "token_type": "bearer",
        }





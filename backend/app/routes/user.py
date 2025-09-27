from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session
from app import schemas, models, deps
from app.schemas import User,Notebook
import app.file_information_extracter as fie
from datetime import datetime

router = APIRouter()
#routes to retrieve notebooks,chats,messages of a user


@router.get("/notebooks")
def get_notebooks(current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    user_id = current_user.user_id
    notebooks = db.query(Notebook).filter(schemas.Notebook.user_id == user_id).all()
    return {"notebooks": notebooks}

@router.get('/chats')
def get_chats(current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db), notebook_id: int = None):
    user_id = current_user.user_id
    chats = db.query(schemas.Chats).filter(schemas.Chats.user_id == user_id,schemas.Chats.notebook_id == notebook_id).all()
    return {"chats": chats}

@router.get('/chat_history')
def get_chat_history(current_user: User = Depends(deps.get_current_user),db: Session=Depends(deps.get_db),chat_id:int=None):
    user_id = current_user.user_id
    messages = db.query(schemas.Messages).filter(schemas.Messages.chat_id == chat_id,schemas.Messages.user_id == user_id).all()
    return {"messages": messages}

@router.post("/create_note_book")
def create_note_books(current_user: User = Depends(deps.get_current_user),db: Session=Depends(deps.get_db),title:str=None):
    user_id = current_user.user_id
    notebook = schemas.Notebook(user_id = user_id, title = title,created_at=datetime.datetime.now(),updated_at=datetime.datetime.now())
    db.add(notebook)
    db.commit()
    db.refresh(notebook)
    return {"notebook": notebook}

@router.post("/create_chat")
def create_chat(current_user: User = Depends(deps.get_current_user),db: Session=Depends(deps.get_db),notebook_id:int=None):
    user_id = current_user.user_id
    chat = schemas.Chats(user_id = user_id, notebook_id = notebook_id,created_at=datetime.datetime.now(),updated_at=datetime.datetime.now())
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return {"chat": chat}   

@router.post("/upload_files")
def upload_file(
    files: list[UploadFile] = File(...),
    notebook_id: int = None,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    user_id = current_user.user_id
    for file in files:
        fie.file_uploader(file, notebook_id, user_id, db)
    
    files_in_db = db.query(schemas.Files).filter(
        schemas.Files.notebook_id == notebook_id,
        schemas.Files.user_id == user_id
    ).all()

    return {
        "files": [
            {"file_id": f.file_id, "file_name": f.file_name, "file_path": f.file_path}
            for f in files_in_db
        ]
    }

from fastapi import APIRouter, Depends, File, UploadFile, Form
from sqlalchemy.orm import Session
from app import schemas, models, deps
from app.schemas import User,Notebook
import app.file_information_extracter as fie
import datetime
import os
import glob
import chromadb

client = chromadb.PersistentClient("./chromadb")

router = APIRouter()
#routes to retrieve notebooks,chats,messages of a user


@router.get("/notebooks")
async def get_notebooks(current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    user_id = current_user.user_id
    notebooks = db.query(Notebook).filter(schemas.Notebook.user_id == user_id).all()
    return {"notebooks": notebooks}

@router.get("/notebook/{notebook_id}")
async def get_notebooks(current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db), notebook_id: int = None):
    user_id = current_user.user_id
    notebook = db.query(Notebook).filter(schemas.Notebook.notebook_id == notebook_id).first()
    return {"notebook": notebook}

@router.get('/chats/{notebook_id}')
async def get_chats(current_user: User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db), notebook_id: int = None):
    user_id = current_user.user_id
    chats = db.query(schemas.Chats).filter(schemas.Chats.user_id == user_id,schemas.Chats.notebook_id == notebook_id).all()
    return {"chats": chats}

@router.get('/chat_history/{chat_id}')
async def get_chat_history(current_user: User = Depends(deps.get_current_user),db: Session=Depends(deps.get_db),chat_id:int=None):
    user_id = current_user.user_id
    messages = db.query(schemas.Messages).filter(schemas.Messages.chat_id == chat_id,schemas.Messages.user_id == user_id).all()
    return {"messages": messages}

@router.post("/create_note_book")
async def create_note_books(current_user: User = Depends(deps.get_current_user),db: Session=Depends(deps.get_db),title:str=Form(...)):
    user_id = current_user.user_id
    notebook = schemas.Notebook(user_id = user_id, title = title,created_at=datetime.datetime.now(),updated_at=datetime.datetime.now())
    db.add(notebook)
    db.commit()
    db.refresh(notebook)
    return {"notebook": notebook}

@router.post("/create_chat")
async def create_chat(current_user: User = Depends(deps.get_current_user),db: Session=Depends(deps.get_db),notebook_id:int=Form(...),chat_name:str=Form(...)):
    user_id = current_user.user_id
    chat = schemas.Chats(user_id = user_id,chat_name = chat_name, notebook_id = notebook_id,created_at=datetime.datetime.now(),updated_at=datetime.datetime.now())
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return {"chat": chat}   

@router.post("/upload_files")
async def upload_file(
    files: list[UploadFile] = File(...),
    notebook_id: int = Form(...),
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

@router.post("/get_all_files")
async def get_all_files(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db),
    notebook_id: int = Form(...)
):
    user_id = current_user.user_id
    files = db.query(schemas.Files).filter(
        schemas.Files.notebook_id == notebook_id,
        schemas.Files.user_id == user_id
    ).all()
    return {
        "files": [
            {"file_id": f.file_id, "file_name": f.file_name, "file_path": f.file_path}
            for f in files
        ]
    }

@router.post('/remove_file')
async def remove_file(current_user: User = Depends(deps.get_current_user), 
                files: list[int] = Form([]), 
                notebook_id:int = Form(...), 
                db: Session = Depends(deps.get_db)):
    user_id = current_user.user_id
    if not files or notebook_id is None:
        return {"message": "Missing file IDs or notebook ID."}

    for file_id in files:
        file = db.query(schemas.Files).filter(schemas.Files.notebook_id == notebook_id
                                              ,schemas.Files.file_id == file_id
                                              ,schemas.Files.user_id == user_id).first()
        if not file:
            continue
    
        file_name = file.file_name
        file_path = file.file_path
        os.remove(file_path)
        target_dir = f"./uploads/user_{user_id}/images"
        pattern = os.path.join(target_dir,f'{file_name}_page*_img.png')
        for i in glob.glob(pattern):
            os.remove(i)
        
        text_collection = client.get_or_create_collection("docs-text")
        image_collection = client.get_or_create_collection("docs-images")

        text_collection.delete(where={ "$and": [
                    {"file_id": {"$eq": str(file_id)}}, 
                    {"user_id": {"$eq": user_id}}, 
                    {"notebook_id": {"$eq": notebook_id}}
                ]})
        image_collection.delete(where={ "$and": [
                    {"file_id": {"$eq": str(file_id)}}, 
                    {"user_id": {"$eq": user_id}}, 
                    {"notebook_id": {"$eq": notebook_id}}
                ]})

        db.delete(file)
        db.commit()

    return {"message": "File removed successfully"}

        

         


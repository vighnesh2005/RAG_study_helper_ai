from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime , Float 
from app.database import base

class User(base):
    __tablename__ = "users"
    user_id = Column(Integer,primary_key=True, index=True,autoincrement='auto')
    email = Column(String, unique=True, index=True)
    password = Column(String(200))
    username = Column(String(100))
    profile = Column(String(250), default="")
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

class Notebook(base):
    __tablename__ = "notebooks"
    notebook_id  = Column(Integer,primary_key=True,index=True,autoincrement='auto')
    user_id = Column(Integer, ForeignKey("users.user_id"))
    title = Column(String(100))
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

class Files(base):
    __tablename__ = "files"
    file_id = Column(Integer, primary_key=True, index=True,autoincrement='auto')
    notebook_id = Column(Integer, ForeignKey("notebooks.notebook_id"))
    file_name = Column(String(100))
    file_path = Column(String(200))
    user_id = Column(Integer, ForeignKey("users.user_id"))
    uploaded_at = Column(DateTime)
    size = Column(Float)
    file_type = Column(String(50))

class Chats(base):
    __tablename__ = "chats"
    chat_id = Column(Integer, primary_key=True, index=True,autoincrement='auto')
    chat_name = Column(String(100))
    notebook_id = Column(Integer, ForeignKey("notebooks.notebook_id"))
    user_id = Column(Integer, ForeignKey("users.user_id"))
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

class Messages(base):
    __tablename__ = 'messages'
    message_id = Column(Integer, primary_key=True, index=True,autoincrement='auto')
    chat_id = Column(Integer, ForeignKey("chats.chat_id"))
    user_id = Column(Integer, ForeignKey("users.user_id"))
    notebook_id = Column(Integer, ForeignKey("notebooks.notebook_id"))
    message = Column(String(1000))
    timestamp = Column(DateTime)
    is_user = Column(Boolean, default=True)


    

from fastapi import APIRouter, Depends , Body, Form
from sqlalchemy.orm import Session
from app import schemas, models, deps
from app.schemas import User,Notebook
import app.file_information_extracter as fie
from datetime import datetime
import os
import chromadb
import base64
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, AIMessage, SystemMessage

load_dotenv()

chat_model = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0, max_output_tokens=1000)

text_model = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")
image_model = SentenceTransformer("clip-ViT-B-32", device='cpu')

client = chromadb.PersistentClient("./chromadb")
text_collection = client.get_or_create_collection("docs-text")
image_collection = client.get_or_create_collection("docs-images")

router = APIRouter()

def get_messages(db,notebook_id,user_id,chat_id):
      messages = (
            db.query(schemas.Messages)
            .filter(
                schemas.Messages.notebook_id == notebook_id,
                schemas.Messages.user_id == user_id,
                schemas.Messages.chat_id == chat_id
            )
            .order_by(schemas.Messages.timestamp.desc())
            .limit(20)
            .all()
      )
      messages = list(reversed(messages))
      return  [
        {
            "message": msg.message,
            "is_user": msg.is_user,
            "timestamp": msg.timestamp
        } 
        for msg in messages
    ]

def get_context(files,notebook_id,user_id,db,conversation):
      query_embedding = text_model.encode([conversation], convert_to_numpy=True).tolist()
      files_str = [str(f) for f in files] 
      texts = text_collection.query(
            query_embeddings=query_embedding,
            n_results = 5,
            where={
            "$and": [
                {"user_id": {"$eq": user_id}},
                {"notebook_id": {"$eq": notebook_id}},
                {"file_id": {"$in": files}}
            ]
        }
      )
      
      top_texts = texts.get("documents")

      new_query_embedding = image_model.encode([conversation], convert_to_numpy=True).tolist()
      images = image_collection.query(
            query_embeddings=new_query_embedding,
            n_results = 2,
            where={ "$and":[
                  {"notebook_id": {"$eq": notebook_id}},
                  {"user_id": {"$eq": user_id}},
                  {"file_id": {"$in": files}}
            ]
            }
      )
      metadatas = images.get("metadatas")
      flat_metadatas = [item for sublist in metadatas for item in sublist]

      image_urls = [meta['file_path'] for meta in flat_metadatas if 'file_path' in meta]
      image_base64 = []
      for path in image_urls:
            with open(path, "rb") as f:
                  image_base64.append(base64.b64encode(f.read()).decode("utf-8"))
      
      return top_texts,image_base64


@router.post("/query")
async def query(
    message: str = Form(...),
    notebook_id: int = Form(...),
    chat_id: int  = Form(...),
    files: list[int] = Form([]), 
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
      user_id = current_user.user_id
      system_prompt = '''You are a helpful and detailed RAG assistant. Use the provided context to answer any of the question the human asks.
                        if the answer to the question is not present in the context say that the question is not answerable from the context 
                        and give a general answer for the user. Also make use of the images in the context to provide more context to the answer.'''
      
      history_messages = get_messages(db,notebook_id,user_id,chat_id)

      chat_history = []
      new_message = ""
      chat_history.append(SystemMessage(content=system_prompt))
      for msg in history_messages:
            if msg['is_user'] == True:
                  chat_history.append(HumanMessage(content=msg['message']))
                  new_message += f"\nuser: {msg['message']}"
            else:
                  chat_history.append(AIMessage(content=msg['message']))
                  new_message += f"\nAI: {msg['message']}"

      new_message += f"\nuser: {message}"
      
      text_context,image_context = get_context(files,notebook_id,user_id,db,new_message)

      content = message + "\n"
      for text in text_context:
            content += str(text) + "\n"
      
      chat_history.append(HumanMessage(content=content))
      chat_history[-1].additional_kwargs = {"images": image_context}

      response = chat_model(chat_history)
      reply_message = response.content

      human_message = schemas.Messages(
            chat_id = chat_id,
            notebook_id = notebook_id,
            user_id = user_id,
            message = message,
            timestamp = datetime.now(),
            is_user = True
      )
      AI_Message = schemas.Messages(
            chat_id = chat_id,
            notebook_id = notebook_id,
            user_id = user_id,
            message = reply_message,
            timestamp = datetime.now(),
            is_user = False
      )
      db.add(human_message)
      db.add(AI_Message)
      db.commit()
      db.refresh(human_message)
      db.refresh(AI_Message)

      return {"message": reply_message,"context": text_context,"image_context": image_context,"chat_history": history_messages}

      

      


      


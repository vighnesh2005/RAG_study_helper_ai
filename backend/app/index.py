from fastapi import FastAPI
import uvicorn
from app.routes import auth, user , query
from app.database import base,engine
from . import schemas
from fastapi.middleware.cors import CORSMiddleware

base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:3000",  # your React app
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # allow specific origins
    allow_credentials=True,
    allow_methods=["*"],            # allow all HTTP methods (POST, GET, etc.)
    allow_headers=["*"],            # allow all headers (Content-Type, Authorization, etc.)
)
app.include_router(prefix="" , router=auth.router)
app.include_router(prefix='/user', router=user.router)
app.include_router(prefix='/api', router=query.router)

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)

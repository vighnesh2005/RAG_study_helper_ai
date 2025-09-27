from fastapi import FastAPI
import uvicorn
from app.routes import auth, user
from app.database import base,engine
from . import schemas

base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(prefix="" , router=auth.router)
app.include_router(prefix='/user', router=user.router)

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)

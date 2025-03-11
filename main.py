from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from todo_routes import todo_router

app = FastAPI(title="My Todo App")
app.include_router(todo_router, tags=["Todos"], prefix="/todos")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"])


@app.get("/")
async def welcome() -> dict:
    return FileResponse("frontend/index.html")


app.mount("/", StaticFiles(directory="frontend"), name="static")
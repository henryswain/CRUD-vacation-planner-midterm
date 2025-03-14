from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from vacation_routes import vacation_router

app = FastAPI(title="My Vacation App")
app.include_router(vacation_router, tags=["Vacations"], prefix="/vacations")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"])


@app.get("/")
async def welcome() -> dict:
    return FileResponse("frontend/index.html")


app.mount("/", StaticFiles(directory="frontend"), name="static")
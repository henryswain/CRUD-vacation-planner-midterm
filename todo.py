from pydantic import BaseModel
from typing import List, Optional

class Stop(BaseModel):
    id: int
    title: str
    desc: str

class Todo(BaseModel):
    id: int
    title: str
    desc: str
    stops: List[Stop] = []

class StopRequest(BaseModel):
    title: str
    desc: str

class StopUpdateRequest(BaseModel):
    id: Optional[int] = None
    title: str
    desc: str

class TodoRequest(BaseModel):
    title: str
    desc: str
    stops: List[StopRequest] = []

class TodoUpdateRequest(BaseModel):
    title: str
    desc: str
    stops: List[StopUpdateRequest] = []
from pydantic import BaseModel
from typing import List, Optional

class Stop(BaseModel):
    id: int
    title: str
    desc: str

class Vacation(BaseModel):
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

class VacationRequest(BaseModel):
    title: str
    desc: str
    stops: List[StopRequest] = []

class VacationUpdateRequest(BaseModel):
    title: str
    desc: str
    stops: List[StopUpdateRequest] = []
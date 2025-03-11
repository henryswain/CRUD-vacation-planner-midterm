from typing import Annotated, List
from fastapi import APIRouter, HTTPException, Path, status

from todo import Todo, TodoRequest, TodoUpdateRequest, Stop, StopRequest, StopUpdateRequest

max_id: int = 0
max_stop_id: int = 0
todo_router = APIRouter()

todo_list = []

@todo_router.get("")
async def get_todos() -> List[Todo]:
    return todo_list

@todo_router.post("", status_code=status.HTTP_201_CREATED)
async def add_todo(todo: TodoRequest) -> Todo:
    global max_id, max_stop_id
    max_id += 1  # auto increment max_id
    
    # Create stops with IDs
    stops = []
    for stop_request in todo.stops:
        max_stop_id += 1
        stops.append(Stop(
            id=max_stop_id,
            title=stop_request.title,
            desc=stop_request.desc
        ))
    
    newTodo = Todo(
        id=max_id,
        title=todo.title,
        desc=todo.desc,
        stops=stops
    )
    todo_list.append(newTodo)
    return newTodo

@todo_router.get("/{id}")
async def get_todo_by_id(id: Annotated[int, Path(ge=0, le=1000)]) -> Todo:
    for todo in todo_list:
        if todo.id == id:
            return todo
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail=f"Item with ID={id} is not found"
    )

@todo_router.put("/{id}")
async def update_todo(id: Annotated[int, Path(ge=0, le=1000)], todo_update: TodoUpdateRequest) -> Todo:
    global max_stop_id
    
    for i, todo in enumerate(todo_list):
        if todo.id == id:
            # Update basic vacation details
            todo.title = todo_update.title
            todo.desc = todo_update.desc
            
            # Create a mapping of existing stop IDs
            existing_stops = {stop.id: stop for stop in todo.stops}
            
            # Process updated stops
            updated_stops = []
            for stop_update in todo_update.stops:
                if stop_update.id is not None and stop_update.id in existing_stops:
                    # Update existing stop
                    existing_stop = existing_stops[stop_update.id]
                    existing_stop.title = stop_update.title
                    existing_stop.desc = stop_update.desc
                    updated_stops.append(existing_stop)
                else:
                    # Create new stop
                    max_stop_id += 1
                    new_stop = Stop(
                        id=max_stop_id,
                        title=stop_update.title,
                        desc=stop_update.desc
                    )
                    updated_stops.append(new_stop)
            
            # Update the stops list
            todo.stops = updated_stops
            
            return todo
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail=f"Vacation with ID={id} is not found"
    )

@todo_router.delete("/{id}")
async def delete_todo_by_id(id: Annotated[int, Path(ge=0, le=1000)]) -> dict:
    for i in range(len(todo_list)):
        todo = todo_list[i]
        if todo.id == id:
            todo_list.pop(i)
            return {"msg": f"The vacation with ID={id} is removed."}
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail=f"Vacation with ID={id} is not found"
    )

@todo_router.post("/{id}/stops", status_code=status.HTTP_201_CREATED)
async def add_stop(id: Annotated[int, Path(ge=0, le=1000)], stop: StopRequest) -> Stop:
    global max_stop_id
    
    for todo in todo_list:
        if todo.id == id:
            max_stop_id += 1
            new_stop = Stop(
                id=max_stop_id,
                title=stop.title,
                desc=stop.desc
            )
            todo.stops.append(new_stop)
            return new_stop
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail=f"Vacation with ID={id} is not found"
    )

@todo_router.put("/{todo_id}/stops/{stop_id}")
async def update_stop(
    todo_id: Annotated[int, Path(ge=0, le=1000)], 
    stop_id: Annotated[int, Path(ge=0, le=1000)],
    stop_update: StopRequest
) -> Stop:
    for todo in todo_list:
        if todo.id == todo_id:
            for i, stop in enumerate(todo.stops):
                if stop.id == stop_id:
                    stop.title = stop_update.title
                    stop.desc = stop_update.desc
                    return stop
            
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Stop with ID={stop_id} not found in vacation ID={todo_id}"
            )
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, 
        detail=f"Vacation with ID={todo_id} is not found"
    )

@todo_router.delete("/{todo_id}/stops/{stop_id}")
async def delete_stop(
    todo_id: Annotated[int, Path(ge=0, le=1000)], 
    stop_id: Annotated[int, Path(ge=0, le=1000)]
) -> dict:
    for todo in todo_list:
        if todo.id == todo_id:
            for i, stop in enumerate(todo.stops):
                if stop.id == stop_id:
                    todo.stops.pop(i)
                    return {"msg": f"Stop with ID={stop_id} removed from vacation ID={todo_id}"}
            
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Stop with ID={stop_id} not found in vacation ID={todo_id}"
            )
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, 
        detail=f"Vacation with ID={todo_id} is not found"
    )
from typing import Annotated, List
from fastapi import APIRouter, HTTPException, Path, status

from vacation import Vacation, VacationRequest, VacationUpdateRequest, Stop, StopRequest, StopUpdateRequest

max_id: int = 0
max_stop_id: int = 0
vacation_router = APIRouter()

vacation_list = []

@vacation_router.get("")
async def get_vacations() -> List[Vacation]:
    return vacation_list

@vacation_router.post("", status_code=status.HTTP_201_CREATED)
async def add_vacation(vacation: VacationRequest) -> Vacation:
    global max_id, max_stop_id
    max_id += 1  # auto increment max_id
    
    # Create stops with IDs
    stops = []
    for stop_request in vacation.stops:
        max_stop_id += 1
        stops.append(Stop(
            id=max_stop_id,
            title=stop_request.title,
            desc=stop_request.desc
        ))
    
    newVacation = Vacation(
        id=max_id,
        title=vacation.title,
        desc=vacation.desc,
        stops=stops
    )
    vacation_list.append(newVacation)
    return newVacation

@vacation_router.get("/{id}")
async def get_vacation_by_id(id: Annotated[int, Path(ge=0, le=1000)]) -> Vacation:
    for vacation in vacation_list:
        if vacation.id == id:
            return vacation
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail=f"Item with ID={id} is not found"
    )

@vacation_router.put("/{id}")
async def update_vacation(id: Annotated[int, Path(ge=0, le=1000)], vacation_update: VacationUpdateRequest) -> Vacation:
    global max_stop_id
    
    for i, vacation in enumerate(vacation_list):
        if vacation.id == id:
            # Update basic vacation details
            vacation.title = vacation_update.title
            vacation.desc = vacation_update.desc
            
            # Create a mapping of existing stop IDs
            existing_stops = {stop.id: stop for stop in vacation.stops}
            
            # Process updated stops
            updated_stops = []
            for stop_update in vacation_update.stops:
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
            vacation.stops = updated_stops
            
            return vacation
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail=f"Vacation with ID={id} is not found"
    )

@vacation_router.delete("/{id}")
async def delete_vacation_by_id(id: Annotated[int, Path(ge=0, le=1000)]) -> dict:
    for i in range(len(vacation_list)):
        vacation = vacation_list[i]
        if vacation.id == id:
            vacation_list.pop(i)
            return {"msg": f"The vacation with ID={id} is removed."}
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail=f"Vacation with ID={id} is not found"
    )

@vacation_router.post("/{id}/stops", status_code=status.HTTP_201_CREATED)
async def add_stop(id: Annotated[int, Path(ge=0, le=1000)], stop: StopRequest) -> Stop:
    global max_stop_id
    
    for vacation in vacation_list:
        if vacation.id == id:
            max_stop_id += 1
            new_stop = Stop(
                id=max_stop_id,
                title=stop.title,
                desc=stop.desc
            )
            vacation.stops.append(new_stop)
            return new_stop
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail=f"Vacation with ID={id} is not found"
    )

@vacation_router.put("/{vacation_id}/stops/{stop_id}")
async def update_stop(
    vacation_id: Annotated[int, Path(ge=0, le=1000)], 
    stop_id: Annotated[int, Path(ge=0, le=1000)],
    stop_update: StopRequest
) -> Stop:
    for vacation in vacation_list:
        if vacation.id == vacation_id:
            for i, stop in enumerate(vacation.stops):
                if stop.id == stop_id:
                    stop.title = stop_update.title
                    stop.desc = stop_update.desc
                    return stop
            
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Stop with ID={stop_id} not found in vacation ID={vacation_id}"
            )
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, 
        detail=f"Vacation with ID={vacation_id} is not found"
    )

@vacation_router.delete("/{vacation_id}/stops/{stop_id}")
async def delete_stop(
    vacation_id: Annotated[int, Path(ge=0, le=1000)], 
    stop_id: Annotated[int, Path(ge=0, le=1000)]
) -> dict:
    for vacation in vacation_list:
        if vacation.id == vacation_id:
            for i, stop in enumerate(vacation.stops):
                if stop.id == stop_id:
                    vacation.stops.pop(i)
                    return {"msg": f"Stop with ID={stop_id} removed from vacation ID={vacation_id}"}
            
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Stop with ID={stop_id} not found in vacation ID={vacation_id}"
            )
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, 
        detail=f"Vacation with ID={vacation_id} is not found"
    )
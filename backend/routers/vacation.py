from typing import Annotated, List
from fastapi import APIRouter, HTTPException, Path, status

from models.vacation import Vacation, VacationRequest, VacationUpdateRequest, Stop, StopRequest, StopUpdateRequest

max_id: int = 0
max_stop_id: int = 0
vacation_router = APIRouter()

vacation_list = []

@vacation_router.get("")
async def get_vacations() -> List[Vacation]:

    try:
        print("Before find_all()")
        vacations = await Vacation.find_all().to_list()
        print("After find_all()")
        print("Vacations: ", vacations)
        return vacations
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")



@vacation_router.post("", status_code=status.HTTP_201_CREATED)
async def add_vacation(vacation: VacationRequest) -> Vacation:
    print("add vacation called")
    print("vacation: ", vacation)
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
    await newVacation.save()
    return newVacation

@vacation_router.get("/{id}")
async def get_vacation_by_id(id: Annotated[int, Path(ge=0, le=1000)]) -> Vacation:
    vacation = await Vacation.get(id)
    if vacation:
        return vacation
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail=f"Item with ID={id} is not found"
    )

@vacation_router.put("/{id}")
async def update_vacation(id: Annotated[int, Path(ge=0, le=1000)], vacation_update: VacationUpdateRequest) -> Vacation:
    global max_stop_id
    
    existing_vacation = await Vacation.get(id)
    if existing_vacation:
        existing_vacation.title = vacation_update.title
        existing_vacation.desc = vacation_update.desc
        
        updated_stops = []
        for stop_update in vacation_update.stops:
            if stop_update.id is None:
                # Create a new stop with an ID
                max_stop_id += 1
                stop_id = max_stop_id
            else:
                stop_id = stop_update.id
                
            updated_stops.append(Stop(
                id=stop_id,
                title=stop_update.title,
                desc=stop_update.desc
            ))
        
        existing_vacation.stops = updated_stops
        await existing_vacation.save()
        return existing_vacation
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, 
        detail=f"Vacation with ID={id} is not found"
    )

@vacation_router.delete("/{id}")
async def delete_vacation_by_id(id: Annotated[int, Path(ge=0, le=1000)]) -> dict:

    vacation = await Vacation.get(id)
    await vacation.delete()
    return {"msg": f"The vacation with ID={id} is removed."}

@vacation_router.post("/{id}/stops", status_code=status.HTTP_201_CREATED)
async def add_stop(id: Annotated[int, Path(ge=0, le=1000)], stop: StopRequest) -> Stop:
    global max_stop_id
    
    vacation = await Vacation.get(id)
    if not vacation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Vacation with ID={id} is not found"
        )
    
    max_stop_id += 1
    new_stop = Stop(
        id=max_stop_id,
        title=stop.title,
        desc=stop.desc
    )
    
    vacation.stops.append(new_stop)
    await vacation.save()
    return new_stop

@vacation_router.put("/{vacation_id}/stops/{stop_id}")
async def update_stop(
    vacation_id: Annotated[int, Path(ge=0, le=1000)], 
    stop_id: Annotated[int, Path(ge=0, le=1000)],
    stop_update: StopRequest
) -> Stop:
    vacation = await Vacation.get(vacation_id)
    if not vacation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Vacation with ID={vacation_id} is not found"
        )
    
    for i, stop in enumerate(vacation.stops):
        if stop.id == stop_id:
            vacation.stops[i] = Stop(
                id=stop_id,
                title=stop_update.title,
                desc=stop_update.desc
            )
            await vacation.save()
            return vacation.stops[i]
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, 
        detail=f"Stop with ID={stop_id} not found in vacation ID={vacation_id}"
    )

@vacation_router.delete("/{vacation_id}/stops/{stop_id}")
async def delete_stop(
    vacation_id: Annotated[int, Path(ge=0, le=1000)], 
    stop_id: Annotated[int, Path(ge=0, le=1000)]
) -> dict:
    vacation = await Vacation.get(vacation_id)
    if not vacation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Vacation with ID={vacation_id} is not found"
        )
    
    original_length = len(vacation.stops)
    vacation.stops = [stop for stop in vacation.stops if stop.id != stop_id]
    
    if len(vacation.stops) == original_length:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Stop with ID={stop_id} not found in vacation ID={vacation_id}"
        )
    
    await vacation.save()
    return {"msg": f"Stop with ID={stop_id} removed from vacation ID={vacation_id}"}

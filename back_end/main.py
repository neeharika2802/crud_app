from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from datetime import date as Date
from typing import Annotated
from contextlib import asynccontextmanager
from cors import setup_cors
import os

from fastapi import Depends, HTTPException
from sqlmodel import Field, Session, SQLModel, create_engine, select

class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    date: Date = Field(index=True)
    is_completed: bool = False

class CreateTask(SQLModel):
    title: str
    date: Date
    is_completed: bool = False

class UpdateTask(SQLModel):
    title: str | None = None
    date: Date | None = None
    is_completed: bool | None = None

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
SessionDep = Annotated[Session, Depends(get_session)]

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)
setup_cors(app)

# Serve frontend static files
frontend_path = os.path.join(os.path.dirname(__file__), "..", "front_end")
app.mount("/", StaticFiles(directory=frontend_path), name="static")

@app.get("/")
def read_index():
    return FileResponse(os.path.join(frontend_path, "index.html"))

# EndPoints

@app.get("/tasks")
def read_tasks(session: SessionDep) -> list[Task]:
    tasks = session.exec(select(Task)).all()
    return tasks

@app.get("/tasks/{id}")
async def read_task(id: int, session: SessionDep) -> Task:
    task = session.get(Task, id)
    if not task:
        raise HTTPException(status_code=404)
    return task

@app.post("/tasks", status_code=201)
async def create_task(task: CreateTask, session: SessionDep) -> Task:
    db_task = Task.model_validate(task)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@app.patch("/tasks/{id}")
async def update_task(id: int, task: UpdateTask, session: SessionDep) -> Task:
    data = session.get(Task, id)
    if not data:
        raise HTTPException(status_code=404)
    update_data = task.model_dump(exclude_unset=True, exclude_none=True)
    for key, value in update_data.items():
        setattr(data, key, value)
    session.add(data)
    session.commit()
    session.refresh(data)
    return data

@app.delete("/tasks/{id}", status_code=204)
async def delete_task(id: int, session: SessionDep):
    data = session.get(Task, id)
    if not data:
        raise HTTPException(status_code=404)
    session.delete(data)
    session.commit()
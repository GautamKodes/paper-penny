from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from rag import ask

app = FastAPI()


class Question(BaseModel):
    question: str
    user_id: int


@app.post("/ask")
def ask_question(body: Question):
    try:
        answer = ask(body.question, body.user_id)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

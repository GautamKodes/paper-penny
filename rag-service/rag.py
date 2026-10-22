import ollama
import os
from database import run_query, get_schema

MODEL = os.getenv("OLLAMA_MODEL", "llama3")


def question_to_sql(question: str, user_id: int) -> str:
    prompt = f"""
You are a SQL expert. Given this database schema:
{get_schema()}

Write a single SQL SELECT query to answer this question for user_id = {user_id}:
"{question}"

Rules:
- Always filter by user_id = {user_id}
- Return ONLY the SQL query, nothing else, no markdown, no backticks
"""
    response = ollama.chat(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}]
    )
    return response["message"]["content"].strip()


def results_to_answer(question: str, results: list) -> str:
    prompt = f"""
The user asked: "{question}"

The database returned these results:
{results}

Give a short, clear, friendly answer in plain English.
"""
    response = ollama.chat(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}]
    )
    return response["message"]["content"].strip()


def ask(question: str, user_id: int) -> str:
    sql = question_to_sql(question, user_id)
    results = run_query(sql)
    return results_to_answer(question, results)

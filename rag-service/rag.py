import ollama
import os
import re
from database import run_query, get_schema

MODEL = os.getenv("OLLAMA_MODEL", "llama3")


def clean_sql(sql: str) -> str:
    sql = re.sub(r"```(?:sql)?", "", sql, flags=re.IGNORECASE)
    return sql.replace("`", "").strip()


def question_to_sql(question: str, user_id: int) -> str:
    today = datetime.today().strftime("%Y-%m-%d")
    prompt = f"""
You are a SQL expert. Given this database schema:
{get_schema()}

Today's date is {today}.

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
    sql = clean_sql(question_to_sql(question, user_id))
    results = run_query(sql)
    if not results:
        return "No spending data found for that query."
    return results_to_answer(question, results)

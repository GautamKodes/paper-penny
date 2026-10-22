import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

engine = create_engine(
    f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)

def run_query(sql: str):
    with engine.connect() as conn:
        result = conn.execute(text(sql))
        rows = result.fetchall()
        columns = result.keys()
        return [dict(zip(columns, row)) for row in rows]

def get_schema() -> str:
    return """
    Table: spend_model
    Columns:
      - spend_id (BIGINT, primary key)
      - user_id  (BIGINT)
      - amount   (FLOAT)
      - category (VARCHAR)
      - remark   (VARCHAR)
      - date     (DATE)
      - time     (TIME)
    """

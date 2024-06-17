import os
from dotenv import load_dotenv

load_dotenv(".env")

PG_USER: str = os.getenv("PG_USER")
PG_PASSWORD: str = os.getenv("PG_PASSWORD")
PG_SERVER: str = os.getenv("PG_SERVER")
PG_DB: str = os.getenv("PG_DB")
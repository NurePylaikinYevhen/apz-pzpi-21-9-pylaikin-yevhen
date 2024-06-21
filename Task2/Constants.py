import os

PG_USER: str = os.getenv("PG_USER", "pylay")
PG_PASSWORD: str = os.getenv("PG_PASSWORD", "12345")
PG_SERVER: str = os.getenv("PG_SERVER", "db")
PG_DB: str = os.getenv("PG_DB", "coursedb")
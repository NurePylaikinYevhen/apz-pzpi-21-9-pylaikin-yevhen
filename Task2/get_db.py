from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils import database_exists, create_database

import Constants

DATABASE_URL = f"postgresql://{Constants.PG_USER}:{Constants.PG_PASSWORD}@" \
               f"{Constants.PG_SERVER}/{Constants.PG_DB}"

engine = create_engine(DATABASE_URL)

if not database_exists(engine.url):
    create_database(engine.url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def initialize_db():
    Base.metadata.create_all(bind=engine)


def close_connection():
    engine.dispose()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


__all__ = ["get_db"]

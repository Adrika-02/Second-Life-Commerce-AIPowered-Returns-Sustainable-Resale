from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from utils.config import settings

db_url = settings.database_url
is_sqlite = db_url.startswith("sqlite")

if not is_sqlite and db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

engine = create_engine(
    db_url,
    connect_args={"check_same_thread": False} if is_sqlite else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

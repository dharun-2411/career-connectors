import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "Career Connectors AI Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    EMBEDDING_DIM: int = 384
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:8080",
        "http://localhost:5173",
        "http://localhost:3000",
        "*"
    ]

settings = Settings()

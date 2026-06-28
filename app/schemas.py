from pydantic import BaseModel

class SearchRequest(BaseModel):
    movie: str
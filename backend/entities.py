from typing import Any, Optional
from pydantic import BaseModel

class ApiResponse(BaseModel):

    status_code: int
    status: bool
    message: str
    data: Any

    def __init__(self, status_code: int, status: bool = False, message: str = '', data: Any=None):
        super().__init__(
            status_code=status_code,
            status=status,
            message=message,
            data=data,
        )

class TMDBMovieCard(BaseModel):
    tmdb_id: int
    title: str
    poster_url: str
    release_date: str
    vote_average: float

class TMDBMovieDetails(BaseModel):
    tmdb_id: int
    title: str
    overview: str
    poster_url: str
    release_date: str
    backdrop_url: Optional[str]
    genres: list[dict]

class TFIDFRecItem(BaseModel):
    title: str
    score: float
    tmdb: Optional[TMDBMovieCard] = None

class SearchBundleResponse(BaseModel):
    query: str
    movie_details: TMDBMovieDetails
    tfidf_recommendations: list[TFIDFRecItem]
    genre_recommendations: list[TMDBMovieCard]
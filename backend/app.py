import pickle
from contextlib import asynccontextmanager
from fastapi import FastAPI, Path, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from helpers import attach_tmdb_card_by_title, tfidf_recommendations_for_title
from entities import ApiResponse, TMDBMovieCard, TMDBMovieDetails
from utility import tmdb_get, tmdb_cards_from_results, tmdb_movie_details, make_img_url
from global_var import *
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

# On Startup event to load pickled data
@asynccontextmanager
async def lifespan(app: FastAPI):
    global df, indices_obj, tfidf_matrix, tfidf_obj, TITLE_TO_IDX
    try:
        with open(DF_PATH, 'rb') as f:
            df = pickle.load(f)
        with open(INDICESPATH, 'rb') as f:
            indices_obj = pickle.load(f)
        with open(TFIDF_MATRIX_PATH, 'rb') as f:
            tfidf_matrix = pickle.load(f)
        with open(TFIDF_PATH, 'rb') as f:
            tfidf_obj = pickle.load(f)

        if indices_obj is not None:
            TITLE_TO_IDX = {str(k).strip().lower(): int(v) for k, v in indices_obj.items()}
    except Exception as e:
        print(f"Error loading pickles: {e}")
    yield

app = FastAPI(title="Movie Recommendation System", version='1.0', lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=ApiResponse)
def health_check() -> ApiResponse:
    """
    Health check endpoint to verify if the API is running.

    Returns:
        ApiResponse: A response indicating the health status of the API.
    """
    return ApiResponse(status_code=200, status=True, message="API is healthy", data=None)

@app.get("/")
def index() -> ApiResponse:
    return ApiResponse(status_code=200, status=True, message="Welcome to the Movie Recommendation System API", data=None)

# HOME ROUTE
@app.get("/home", response_model=ApiResponse)
async def home(
    category: str = Query("popular"),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Get a list of movies based on the specified category.

    Args:
        category (str): The category of movies to retrieve. Default is "popular".
        limit (int): The maximum number of movies to return. Default is 20.

    Returns:
        ApiResponse: A response containing the list of movie cards and metadata.
    """
    try:
        if category == "trending":
            data = await tmdb_get('/trending/movie/week', params={"language": "en-US"})
            movie_cards = await tmdb_cards_from_results(data.get('results', []), limit=limit)
            return ApiResponse(
                status_code=200,
                status=True,
                message="Trending movies retrieved successfully.",
                data=movie_cards
            )
        
        if category not in {"popular", "top_rated", "upcoming", "now_playing"}:
            raise HTTPException(status_code=400, detail=f"Invalid category '{category}'. Valid categories are: popular, top_rated, upcoming, now_playing, trending.")

        data = await tmdb_get(f'/movie/{category}', params={"language": "en-US"})
        movie_cards = await tmdb_cards_from_results(data.get('results', []), limit=limit)
        return ApiResponse(
            status_code=200,
            status=True,
            message=f"Movies for category '{category}' retrieved successfully.",
            data=movie_cards
        )
    
    except Exception as e:
        raise RuntimeError(f"Failed to fetch movies for category '{category}':") from e


@app.get("/search", response_model=ApiResponse)
async def search_movies(
    query: str = Query(..., min_length=1, description="The search query for movie titles."),
    page: int = Query(1, ge=1, le=1000, description="The page number for paginated results.")
) -> ApiResponse:
    """
    Search for movies based on a query string.

    Args:
        query (str): The search query for movie titles.
        page (int): The page number for paginated results. Default is 1.

    Returns:
        ApiResponse: A response containing the search results and metadata.
    """
    try:
        data = await tmdb_get('/search/movie', params={"query": query, "page": page, "language": "en-US"})
        results = data.get('results', [])
        total_results = data.get('total_results', 0)
        total_pages = data.get('total_pages', 0)

        movie_cards = await tmdb_cards_from_results(results)

        return ApiResponse(
            status_code=200,
            status=True,
            message=f"Found {total_results} results across {total_pages} pages.",
            data={
                "query": query,
                "page": page,
                "total_results": total_results,
                "total_pages": total_pages,
                "results": movie_cards
            }
        )
    
    except Exception as e:
        raise RuntimeError(f"Failed to search movies with query '{query}': {e}") from e


@app.get("/movie/{movie_id}", response_model=ApiResponse)
async def get_movie(
    movie_id: int = Path(..., description="The ID of the movie to retrieve.")
) -> ApiResponse:
    """
    Retrieve details for a specific movie by its ID.

    Args:
        movie_id (int): The ID of the movie to retrieve.

    Returns:
        ApiResponse: A response containing the movie details and metadata.
    """
    try:
        data = await tmdb_get(f'/movie/{movie_id}', params={"language": "en-US"})
        if not data:
            raise HTTPException(status_code=404, detail=f"Movie with ID {movie_id} not found.")

        return ApiResponse(
            status_code=200,
            status=True,
            message="Movie details retrieved successfully.",
            data=data
        )

    except Exception as e:
        raise RuntimeError(f"Failed to fetch movie with ID {movie_id}: {e}") from e

# GENRE ROUTE
@app.get("/recommend/genre", response_model=ApiResponse)
async def recommend_by_genre(
    tmdb_id: int = Query(..., description="The TMDB ID of the genre to recommend movies for."),
    limit: int = Query(10, ge=1, le=100, description="The maximum number of recommended movies to return.")
) -> ApiResponse:
    """
    Recommend movies based on a specified genre.

    Args:
        tmdb_id (int): The TMDB ID of the genre to recommend movies for.
        limit (int): The maximum number of recommended movies to return. Default is 10.

    Returns:
        ApiResponse: A response containing the recommended movie cards and metadata.
    """
    details = await tmdb_movie_details(tmdb_id)
    if not details.genres:
        return ApiResponse(
            status_code=404,
            status=False,
            message=f"No genres found for movie with TMDB ID {tmdb_id}.",
            data=None
        )
    genre_id = details.genres[0]['id']
    discover = await tmdb_get('/discover/movie', params={"with_genres": genre_id, "language": "en-US"})
    movie_cards = await tmdb_cards_from_results(discover.get('results', []), limit=limit)
    return ApiResponse(
        status_code=200,
        status=True,
        message=f"Recommended movies for genre ID {genre_id} retrieved successfully.",
        data=movie_cards
    )

# TFIDF RECOMMENDATION ROUTE
@app.get("/recommend/tfidf", response_model=ApiResponse)
async def recommend_by_tfidf(
    title: str = Query(..., description="The title of the movie to base recommendations on."),
    limit: int = Query(10, ge=1, le=100, description="The maximum number of recommended movies to return.")
) -> ApiResponse:
    """
    Recommend movies based on TF-IDF similarity to a specified movie title.

    Args:
        title (str): The title of the movie to base recommendations on.
        limit (int): The maximum number of recommended movies to return. Default is 10.

    Returns:
        ApiResponse: A response containing the recommended movie cards and metadata.
    """
    recs = tfidf_recommendations_for_title(title, top_n=limit)
    if not recs:
        return ApiResponse(
            status_code=404,
            status=False,
            message=f"No recommendations found for movie title '{title}'.",
            data=None
        )
    recommended_titles = [rec[0] for rec in recs]
    recommended_cards = []
    for rec_title in recommended_titles:
        card = await attach_tmdb_card_by_title(rec_title)
        if card:
            recommended_cards.append(card)
    return ApiResponse(
        status_code=200,
        status=True,
        message=f"Recommended movies based on TF-IDF for title '{title}' retrieved successfully.",
        data=recommended_cards
    )

# BUNDLE: DETAILS + TFIDF RECOMMENDATIONS + GENRE RECOMMENDATIONS
@app.get("/movie/search", response_model=ApiResponse)
async def search_movie_bundle(
    title: str = Query(..., description="The title of the movie to search for."),
    limit: int = Query(10, ge=1, le=100, description="The maximum number of recommended movies to return.")
) -> ApiResponse:
    """
    Search for a movie by title and provide its details along with TF-IDF and genre-based recommendations.

    Args:
        title (str): The title of the movie to search for.
        limit (int): The maximum number of recommended movies to return. Default is 10.

    Returns:
        ApiResponse: A response containing the movie details and recommendations.
    """
    card = await attach_tmdb_card_by_title(title)
    if not card:
        return ApiResponse(
            status_code=404,
            status=False,
            message=f"Movie with title '{title}' not found.",
            data=None
        )
    
    tfidf_recs = tfidf_recommendations_for_title(title, top_n=limit)
    tfidf_titles = [rec[0] for rec in tfidf_recs]
    tfidf_cards = []
    for rec_title in tfidf_titles:
        rec_card = await attach_tmdb_card_by_title(rec_title)
        if rec_card:
            tfidf_cards.append(rec_card)

    genre_recs = []
    if card.tmdb_id:
        details = await tmdb_movie_details(card.tmdb_id)
        if details.genres:
            genre_id = details.genres[0]['id']
            discover = await tmdb_get('/discover/movie', params={"with_genres": genre_id, "language": "en-US"})
            genre_results = discover.get('results', [])
            for result in genre_results[:limit]:
                rec_card = TMDBMovieCard(
                    tmdb_id=result['id'],
                    title=result['title'],
                    overview=result.get('overview'),
                    release_date=result.get('release_date'),
                    poster_path=result.get('poster_path')
                )
                genre_recs.append(rec_card)

    return ApiResponse(
        status_code=200,
        status=True,
        message=f"Movie details and recommendations for '{title}' retrieved successfully.",
        data={
            "movie_details": card,
            "tfidf_recommendations": tfidf_cards,
            "genre_recommendations": genre_recs
        }
    )

@app.get("/movie-details/{movie_id}", response_model=ApiResponse)
async def tmdb_movie_details(movie_id: int = Path(...)) -> ApiResponse:
    data = await tmdb_get(f'/movie/{movie_id}', params={"language": "en-US"})

    print("data",data)
    return ApiResponse(
        status_code=200,
        status=True,
        message=f"Movie details for ID {movie_id} retrieved successfully.",
        data=TMDBMovieDetails(
            tmdb_id=int(data['id']),
            title=data['title'] or data['name'] or "",
            overview=data.get('overview', ''),
            poster_url=make_img_url(data.get('poster_path')),
            release_date=data.get('release_date', ''),
            backdrop_url=make_img_url(data.get('backdrop_path')),
            genres=data.get('genres', []) or [],
        )
    )
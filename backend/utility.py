import os
import httpx
from typing import Any, List, Dict, Optional
from dotenv import load_dotenv
from entities import TMDBMovieCard, TMDBMovieDetails

load_dotenv()

def _norm_title(title: str) -> str:
    return str(title).strip().lower()

def make_img_url(path: Optional[str]) -> Optional[str]:
    if path is None:
        return None
    return f'{os.getenv("TMDB_IMG_500")}{path}'

async def tmdb_get(path: str, params: Dict[str, Any]) -> Dict[str, Any]:
    url = f'{os.getenv("TMDB_BASE_URL")}{path}'
    q = dict(params)
    q['api_key'] = os.getenv("TMDB_API_KEY")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=q)
            response.raise_for_status()
            return response.json()
    except httpx.RequestError as exc:
        raise RuntimeError(f"An error occurred while requesting {exc.request.url!r}.") from exc

async def tmdb_cards_from_results(results: List[dict], limit: int = 20) -> List[TMDBMovieCard]:
    out: List[TMDBMovieCard] = []
    for result in results[:limit]:
        card = TMDBMovieCard(
            tmdb_id=int(result['id']),
            title=result['title'] or result['name'] or "",
            poster_url=make_img_url(result.get('poster_path')),
            release_date=result.get('release_date', ''),
            vote_average=result.get('vote_average', 0.0),
        )
        out.append(card)
    return out

async def tmdb_movie_details(movie_id: int) -> TMDBMovieDetails:
    data = await tmdb_get(f'/movie/{movie_id}', params={"language": "en-US"})
    return TMDBMovieDetails(
        tmdb_id=int(data['id']),
        title=data['title'] or data['name'] or "",
        overview=data.get('overview', ''),
        poster_url=make_img_url(data.get('poster_path')),
        release_date=data.get('release_date', ''),
        backdrop_url=make_img_url(data.get('backdrop_path')),
        genres=data.get('genres', []) or [],
    )

async def tmdb_search_movies(query: str, page: int = 20) -> Dict[str, Any]:
    data = await tmdb_get('/search/movie', params={"query": query, "page": page, "language": "en-US"})
    return data

async def tmdb_search_first(query: str) -> Optional[dict]:
    data = await tmdb_search_movies(query, page=1)
    results = data.get('results', [])
    return results[0] if results else None


from typing import Any, Dict, List, Optional, Tuple
from entities import TMDBMovieCard
from global_var import *
from utility import _norm_title, make_img_url, tmdb_search_first
from fastapi import HTTPException
import numpy as np

def build_title_to_idx_map(indices: Any) -> Dict[str, int]:
    """
    Build a mapping from movie titles to their corresponding indices.

    Args:
        indices (Any): The indices object containing movie titles and their indices.

    Returns:
        Dict[str, int]: A dictionary mapping movie titles to their indices.
    """
    title_to_idx: Dict[str, int] = {}
    if isinstance(indices, dict):
        for title, idx in indices.items():
            title_to_idx[_norm_title(title)] = int(idx)
        return title_to_idx

    try:
        for k, v in indices.items():
            title_to_idx[_norm_title(k)] = int(v)
        return title_to_idx
    except Exception as e:
        raise RuntimeError(f"Failed to build title to index map: {e}") from e

def get_local_idx_by_title(title: str) -> int:
    global TITLE_TO_IDX
    if TITLE_TO_IDX is None:
        raise HTTPException(status_code=500, detail="Title to index mapping is not initialized.")
    key = _norm_title(title)
    if key in TITLE_TO_IDX:
        return int(TITLE_TO_IDX[key])
    raise HTTPException(status_code=404, detail=f"Movie title '{title}' not found in the local index mapping.")

def tfidf_recommendations_for_title(title: str, top_n: int = 10) -> List[Tuple[str, float]]:
    """
    Get TF-IDF recommendations for a given movie title.

    Args:
        title (str): The movie title to get recommendations for.
        top_n (int): The number of top recommendations to return.

    Returns:
        List[Tuple[str, float]]: A list of recommended movies with their titles and scores.
    """
    global df, tfidf_matrix
    if df is None or tfidf_matrix is None:
        raise HTTPException(status_code=500, detail="DataFrame or TF-IDF matrix is not initialized.")
    
    idx = get_local_idx_by_title(title)
    qv = tfidf_matrix[idx]
    scores = tfidf_matrix.dot(qv.T).toarray().ravel()

    order = np.argsort(-scores)

    out = List[Tuple[str, float]] = []
    for i in order:
        if int(i) == int(idx):
            continue
        try:
            title_i = str(df.iloc[i]['title'])
        except Exception as e:
            raise RuntimeError(f"Failed to retrieve title for index {i}: {e}") from e
        out.append((title_i, float(scores[i])))
        if len(out) >= top_n:
            break
    return out

async def attach_tmdb_card_by_title(title: str) -> Optional[TMDBMovieCard]:
    try:
        m = await tmdb_search_first(title)
        if m is None:
            return None
        return TMDBMovieCard(
            tmdb_id=int(m['id']),
            title=m['title'] or m['name'] or "",
            poster_url=make_img_url(m.get('poster_path')),
            release_date=m.get('release_date', ''),
            vote_average=m.get('vote_average', 0.0),
        )
    except Exception as e:
        raise None
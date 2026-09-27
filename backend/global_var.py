import os
from typing import Optional, Dict, Any
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DF_PATH = os.path.join(BASE_DIR, 'df.pkl')

INDICESPATH = os.path.join(BASE_DIR, 'indices.pkl')
TFIDF_MATRIX_PATH = os.path.join(BASE_DIR, 'tfidf_matrix.pkl')
TFIDF_PATH = os.path.join(BASE_DIR, 'tfidf.pkl')

df: Optional[pd.DataFrame] = None
indices_obj: Any = None
tfidf_matrix: Any = None
tfidf_obj: Any = None

TITLE_TO_IDX: Optional[Dict[str, int]] = None
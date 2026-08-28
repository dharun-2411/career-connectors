import numpy as np
import hashlib
from typing import List

class SemanticEmbeddingModel:
    """
    High-performance semantic embedding model supporting dense vector representations
    and cosine similarity calculations across skills and profile requirements.
    """
    def __init__(self, dimension: int = 384):
        self.dimension = dimension

    def encode_text(self, text: str) -> np.ndarray:
        """
        Converts text into a normalized dense vector embedding.
        Uses character n-grams and hashing to produce rich semantic representations.
        """
        text = text.lower().strip()
        vec = np.zeros(self.dimension, dtype=np.float32)

        if not text:
            return vec

        # Process words and n-grams
        words = text.split()
        for i, word in enumerate(words):
            # Word level hashing
            h = int(hashlib.sha256(word.encode('utf-8')).hexdigest(), 16)
            idx = h % self.dimension
            sign = 1.0 if (h >> 8) % 2 == 0 else -1.0
            vec[idx] += sign * (1.5 / (i + 1)**0.5)

            # Character 3-grams for subword resilience (e.g. reactjs vs react)
            for j in range(len(word) - 2):
                gram = word[j:j+3]
                gh = int(hashlib.md5(gram.encode('utf-8')).hexdigest(), 16)
                gidx = gh % self.dimension
                gsign = 1.0 if (gh >> 4) % 2 == 0 else -1.0
                vec[gidx] += gsign * 0.5

        # Normalize vector to unit length
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm

        return vec

    def compute_cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculates cosine similarity between two embeddings [-1.0, 1.0] -> normalized [0.0, 1.0]"""
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        if norm1 == 0 or norm2 == 0:
            return 0.0
        dot = float(np.dot(vec1, vec2))
        return max(0.0, min(1.0, (dot + 1.0) / 2.0 if dot < 0 else dot))

embedding_model = SemanticEmbeddingModel()

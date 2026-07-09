---
type: concept
title: "RAG with Cosine Similarity"
created: 2026-07-08
updated: 2026-07-08
tags: [rag, embeddings, retrieval]
complexity: intermediate
aliases: ["Cosine RAG", "Semantic Search"]
related: ["[[OpenRouter]]", "[[Text Embedding 3 Small]]"]
sources: ["[[config-py-2026-07-08]]"]
---

# RAG with Cosine Similarity

Retrieval-Augmented Generation implementation used by MLPG to provide contextual memory during learning path generation. Stored in `src/database.py`.

## How It Works
1. **Embed**: Module explanations are pre-embedded via OpenRouter's embedding API (`openai/text-embedding-3-small`)
2. **Store**: Embeddings saved as JSON arrays in the `modules.embedding` column
3. **Query**: When generating a new path, the user's topic is embedded and compared against stored modules
4. **Score**: Cosine similarity computed between query embedding and each candidate module
5. **Filter**: Results above threshold 0.3 are kept, top 3 returned

## Configuration (`src/config.py`)
- `RAG_TOP_K = 3`: Return at most 3 similar modules
- `RAG_SIMILARITY_THRESHOLD = 0.3`: Minimum cosine score for relevance
- `EMBED_TIMEOUT = 30`: Timeout for embedding API calls

## Implementation
The `find_similar_modules()` function fetches the 200 most recent modules with embeddings, computes cosine similarity against the query embedding, sorts by score, and returns the top-K above threshold. Cached embeddings are stored as JSON (`tuple` → `json.dumps` → `TEXT` column).

# MLPG V2 — Micro Learning Path Generator

**Python (Flask) + Node.js (React/Vite)** micro-learning tutor with AI-generated learning paths, gamification, and multi-user support.

## Architecture

```
Frontend (React + Vite, :3000)     Backend (Flask, :5000)
┌──────────────────────────┐       ┌──────────────────────────┐
│  Login / Register        │──────→│  POST /api/register      │
│  Path Generator          │──────→│  POST /api/generate      │
│  Module View + Evaluate  │──────→│  POST /api/evaluate      │
│  Hints & Clarifications  │──────→│  POST /api/hint          │
│  Final Summary           │──────→│  POST /api/final-summary │
│  Session History         │──────→│  GET  /api/history       │
│  Dashboard + Leaderboard │──────→│  GET  /api/user/stats    │
│  i18n (IT/EN)            │       │  GET  /api/translations  │
└──────────────────────────┘       └──────────────────────────┘
```

## Quick Start

```bash
# Terminal 1 — Backend
pip install -r requirements.txt
python app.py                          # Flask on :5000

# Terminal 2 — Frontend (requires Node.js)
cd frontend
npm install
npm run dev                            # Vite on :3000
```

Open **http://localhost:3000**

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | No | Create user account |
| POST | `/api/login` | No | Login, returns JWT |
| POST | `/api/generate` | Yes | Generate learning path |
| POST | `/api/evaluate` | Yes | Evaluate exercise answer |
| POST | `/api/hint` | No | Get hint for wrong answer |
| POST | `/api/clarify` | No | Ask targeted clarification |
| POST | `/api/final-summary` | No | Generate final summary |
| POST | `/api/archive-module` | No | Archive module |
| POST | `/api/complete-module` | No | Mark module completed |
| GET | `/api/history` | Yes | List user sessions |
| POST | `/api/session-detail` | No | Get session modules |
| GET | `/api/translations?lang=it\|en` | No | i18n dictionary |
| GET | `/api/user/stats` | Yes | User gamification stats |
| GET | `/api/leaderboard` | Yes | Top 10 users |
| PUT | `/api/user/profile` | Yes | Update avatar/theme/badges |

## Key Features

- **AI Learning Paths**: 3 progressive modules per topic via OpenRouter LLM
- **3-Layer Evaluation**: Heuristic filter → sanity check → LLM feedback
- **RAG Memory**: Cosine similarity semantic search for contextual path generation
- **Gamification**: 10 XP levels, 20 badges, daily streaks, leaderboard
- **i18n**: 260+ translation keys, IT/EN with live language switch
- **Multi-User**: JWT auth, per-user history, stats, and profiles
- **Dual DB**: PostgreSQL or SQLite (automatic fallback)

## Environment

Create `.env` in project root:

```
OPENROUTER_API_KEY=sk-or-...
DATABASE_URL=postgresql://...   # Optional, SQLite fallback otherwise
SECRET_KEY=your-secret-key
```

## Differences from V1

| Feature | V1 (Streamlit) | V2 (React + Flask) |
|---------|---------------|---------------------|
| Frontend | Streamlit Python | React + Vite JS |
| Routing | Streamlit pages | React Router |
| Auth | Session state | JWT tokens |
| Database | Same (src/database.py) | Same |
| LLM Pipeline | Same (src/generator.py) | Same |
| Gamification | Same (src/gamification.py) | Same |
| i18n | Same (src/i18n.py) | Same + client-side |

## Build for Production

```bash
cd frontend
npm run build                          # outputs to frontend/dist/

# Serve via Flask static files or Nginx
```

## Tests

```bash
python -m pytest tests/ -v
```

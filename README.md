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

## Production Deployment

### Option A: Single Server (Raspberry Pi, VPS, Linux)

```bash
# 1. Clone the repo
git clone <repo-url> mlpg-v2 && cd mlpg-v2

# 2. Create .env
cat > .env << EOF
OPENROUTER_API_KEY=sk-or-...
DATABASE_URL=postgresql://user:pass@localhost/mlpg  # optional, SQLite fallback
SECRET_KEY=$(openssl rand -hex 32)
FLASK_DEBUG=0
EOF

# 3. Python backend
pip install -r requirements.txt

# 4. Install Node.js (if needed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 5. Build frontend
cd frontend
npm install
npm run build        # outputs to frontend/dist/
cd ..

# 6. Run with Gunicorn (serves both API + static files)
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
# Site at http://<server-ip>:5000
```

### Option B: Nginx + Gunicorn (recommended for production)

```bash
# Install Nginx
sudo apt-get install -y nginx

# Create Nginx config (/etc/nginx/sites-available/mlpg)
sudo tee /etc/nginx/sites-available/mlpg << 'NGINX'
server {
    listen 80;
    server_name your-domain.com;

    # Frontend static files
    location /logos { alias /path/to/mlpg-v2/logos; }
    location / {
        root /path/to/mlpg-v2/frontend/dist;
        try_files $uri /index.html;
    }

    # Proxy API to Flask
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINX

sudo ln -s /etc/nginx/sites-available/mlpg /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# Run Flask with Gunicorn
gunicorn -w 4 -b 127.0.0.1:5000 app:app --daemon

# Auto-restart with systemd
sudo tee /etc/systemd/system/mlpg.service << 'SYSTEMD'
[Unit]
Description=MLPG Flask Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/mlpg-v2
ExecStart=/usr/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
SYSTEMD

sudo systemctl daemon-reload
sudo systemctl enable mlpg
sudo systemctl start mlpg
```

### Option C: Docker

```dockerfile
# Dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY src/ src/
COPY app.py app.py
COPY frontend/dist/ frontend/dist/
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

### Option D: ngrok (quick share)

```bash
# Run backend
python app.py &
# Run frontend dev server
cd frontend && npm run dev &
# Expose frontend
ngrok http 3000
```

## Gaps vs V1 (Streamlit)

The following V1 features are **intentionally deferred** for V2.1+:

| Feature | Reason |
|---------|--------|
| LLM content translation on lang switch | Requires OpenRouter calls; costly per-session |
| Accuracy donut chart | CSS/SVG rendering; planned for v2.1 |
| Weekly heatmap | GitHub-style visualization; planned for v2.1 |
| Topic distribution bars | Chart.js integration; planned for v2.1 |
| Motivational narrative | NLP-based messages; low priority |
| Robot mascot in-module reactions | Multiple SVG swaps during evaluation flow |
| Backfill user stats on startup | DB migration; run manually if needed |


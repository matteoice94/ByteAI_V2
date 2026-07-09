# Session Handoff — 9 Luglio 2026

Questo file e' per la sessione V2. Leggilo prima di fare qualsiasi cosa.

## Obiettivo primario della prossima sessione

Caricare nel vault (`/wiki`) tutte le conoscenze sui file modificati oggi.
I file piu' importanti da ingestire sono:
- `src/generator.py` — recovery flow 3-tier, `cosa_manca`, sanity check rimosso, SQL heuristic
- `src/models.py` — campo `cosa_manca` in FeedbackValutazione
- `app.py` — nuovi endpoint auth, JWT fix, XP reward, clear_module_attempts, rate limit 200
- `src/database.py` — `clear_module_attempts`, leaderboard estesa
- `frontend/src/components/Dashboard.jsx` — Bento Grid, live badge toggle, theme colors
- `frontend/src/components/ModuleView.jsx` — recovery 3-tier UI, `submittedSolution`
- `frontend/src/components/History.jsx` — resume flow, reopen+resume
- `frontend/src/components/FinalSummary.jsx` — diario `approfondire`, fix `.map` crash
- `frontend/src/i18n.js` — 20+ nuove chiavi

## Stato attuale del progetto V2

### Backend (Flask :5000)
- 13 endpoint API + JWT auth con secret fisso `mlpg-v2-dev-secret-key-2026`
- `_level_from_xp()` ricalcola automaticamente il livello
- Rate limit: 200 req/min (dev)
- DB: PostgreSQL (DATABASE_URL in .env) con SQLite fallback
- `backfill_stats.py` per ricalcolare XP/livelli da dati reali

### Frontend (React+Vite :3000)
- 7 componenti funzionanti
- ErrorBoundary su Dashboard e FinalSummary
- `featuredB` state React per toggle badge live
- Tema colore applicato a: bordo card, barra XP, badge grid, profilo pubblico
- SVG robot in `frontend/public/`

### Recovery Flow (novita' di oggi)
| Tentativo | Esito | Azione |
|-----------|-------|--------|
| 1°/2° | Corretta | Completato ✅ |
| 1° | Parziale | Mostra `cosa_manca` + hint, riprova |
| 2° | Parziale | "📝 Da Approfondire" → va nel riepilogo |
| 1° | Sbagliata | Hint, riprova |
| 2° | Sbagliata | "⚠️ Archiviato" |

### Bug fix principali di oggi
- JWT secret non persistente → secret fisso
- XP/livello desync → `_level_from_xp()` automatico
- Counter tentativi non resettato → `clear_module_attempts` + frontend reset
- Dashboard crash (`.map is not a function`) → double-parse JSON + Array.isArray
- FinalSummary crash (`.map is not a function`) → diario_di_bordo e' stringa, non array
- Sanity check bloccava risposte SQL → rimosso, LLM gestisce
- Heuristic filter bocciava SQL → aggiunti indicatori SQL a `_code_indicators`
- Rate limiter bloccava dev → alzato a 200
- Temi colore invisibili → applicati via inline style

### File non toccare (da V1)
- `streamlit_app.py` — non esiste in V2
- `templates/index.html` — non esiste in V2
- `Prompts/system_mlpg.md` — identico a V1, non modificare senza copiare

### Utenti di test
- `matteo2` / `matteo123` — ha 20 badge, Lv2, 55 XP
- `testuser` / `test1234`
- `demo` / `demo1234`

### Come avviare
```bash
# T1: Flask
cd "MLPG V_2"
C:\Users\Martelli.Matteo\Desktop\Ai_Micro_Learning\MLPG_Project\.venv\Scripts\python.exe app.py

# T2: Vite
cd "MLPG V_2\frontend"
C:\Users\Martelli.Matteo\Downloads\node-v24.18.0-win-x64\node-v24.18.0-win-x64\npm.cmd run dev
```

### Comandi utili
```bash
python -m pytest tests/ -v                    # 43 test
python backfill_stats.py                       # ricalcola stats da DB reale
taskkill /F /IM python.exe                     # kill Flask
```

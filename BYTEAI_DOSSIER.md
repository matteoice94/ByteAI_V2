# ByteAI V2 — Dossier Completo

## 1. Identità del Progetto

| Campo | Valore |
|-------|--------|
| Nome | **ByteAI** |
| Slogan | Micro Learning Path Generator |
| Mascotte | **Pyxel** — robot 8-bit pixel art, 3 espressioni, transizione glitch |
| Repo | `https://github.com/matteoice94/ByteAI_V2` |
| Stack | Flask (Python) + React/Vite (JS) + SQLite/PostgreSQL |
| LLM | OpenRouter (gpt-4o-mini, text-embedding-3-small, gemini-flash-1.5) |
| Stato | v1.0 ready (~92%) |

---

## 2. Problema che Risolve

**Micro-learning personalizzato via AI tutor.** L'utente inserisce un argomento e un livello (base/intermedio/avanzato). ByteAI genera un percorso di 3 moduli sequenziali, ciascuno con spiegazione + esercizio pratico. L'utente risponde agli esercizi e riceve valutazioni, hint, e chiarimenti dall'AI — il tutto in un'interfaccia moderna con un bot pixel-art che reagisce al contesto.

**Differenziazione:** Non è un chatbot generico. È un tutor strutturato con:
- Percorsi a moduli mutualmente esclusivi (nessuna ripetizione)
- Sistema di recovery flow (1° errore → hint, 2° → archivia)
- Valutazione 3-tier (filtro euristico → sanity → LLM)
- Gamification (10 livelli XP, 20 badge, streak)
- Internazionalizzazione IT/EN

---

## 3. Architettura Tecnica

### Backend (Flask + Python)
```
app.py (506 linee)        — 15+ endpoint REST, auth JWT + httpOnly cookie, rate limiter
src/generator.py (937)    — Chiamate OpenRouter, parsing JSON, pipeline valutazione
src/database.py (967)      — Dual-backend PG/SQLite via wrapper _DB, 30+ funzioni
src/models.py (50)         — Pydantic con extra=forbid, 6 modelli
src/gamification.py (238)  — 10 livelli XP, 20 badge, streak, phoenix mechanic
src/i18n.py (737)          — 260+ chiavi flat IT/EN per 3 interfacce
src/config.py (42)         — Configurazione centralizzata (timeout, token, retry)
Prompts/                   — system_mlpg.md + system_mlpg_en.md
```

### Frontend (React 18 + Vite)
```
frontend/src/
├── App.jsx                  — Routing, ErrorBoundary, cursor glow
├── App.css                  — 1000+ linee CSS, tema scuro ByteAI
├── api.js                   — Client HTTP con AbortController, timeout 30s
├── i18n.js                  — Dizionario frontend IT/EN
├── context/
│   ├── AuthContext.jsx       — Login/register/logout, httpOnly cookie
│   └── NotificationContext.jsx — Sistema notifiche (XP snackbar + achievement popup)
└── components/
    ├── Login.jsx             — Auth con selezione lingua
    ├── PathGenerator.jsx     — Form generazione percorso (split-screen)
    ├── ModuleView.jsx        — Studio moduli con split-screen + bot + esercizi strutturati
    ├── FinalSummary.jsx      — Riepilogo finale con diario di bordo
    ├── History.jsx           — Storico sessioni con moduli riesumibili
    ├── Dashboard.jsx         — Profilo, stats Bento Grid, badge, classifica
    ├── NavBar.jsx            — Navigazione + lingua
    └── BotMascot.jsx         — Mascotte Pyxel con 3 espressioni + glitch
```

---

## 4. User Flow

1. **Login/Register** → autenticazione JWT + httpOnly cookie
2. **Generazione Percorso** → inserisci topic + livello → AI genera 3 moduli
3. **Studio Moduli** → split-screen: teoria/esercizi a sinistra, Pyxel + feedback a destra
4. **Valutazione** → invio risposta → AI valuta (corretta/parziale/sbagliata) con hint/fumetti
5. **Recovery** → 1° errore: hint; 2° errore: archivia modulo
6. **Riepilogo Finale** → punti forza, aree miglioramento, diario di bordo
7. **Dashboard** → XP, livelli, badge, streak, classifica

---

## 5. Caratteristiche Chiave

### Split-Screen Layout (65/35)
Colonna sinistra scrollabile (contenuti), colonna destra sticky (Pyxel + speech bubbles). Responsive: si impila su mobile.

### Pyxel Bot Mascot
- 3 espressioni: neutral (idle), thinking (elaborazione), happy (risposta corretta)
- Transizione glitch: 12 pixel-art squares dall'SVG originale, animazione CSS 2.5s
- Context-based: reagisce allo stato dell'utente
- Aura viola/blu pulsante

### Esercizi Strutturati
- Problem Data Box (dati isolati con header)
- Operations Roadmap (checklist interattiva auto-popolata)
- Formula Help (accordion con estratto teoria)

### Gamification
- 10 livelli XP (0, 50, 120, 220, 350, 520, 740, 1020, 1370, 1800)
- 20 badge in 5 categorie: moduli, precisione, streak, livelli, traguardi
- Streak giornaliero + Phoenix mechanic (ritorno dopo 7+ giorni)
- Notifiche: XP snackbar (top-center a cascata) + achievement popup (glitch + bounce)

### Recupero Errori (Recovery Flow)
- Parziale (qualcosa di giusto) → hint + riprova → "Da Approfondire"
- Sbagliata (fondamentalmente errato) → hint → archiviazione
- Campo `cosa_manca` per feedback mirato

---

## 6. Evoluzione del Progetto

| Data | Milestone |
|------|-----------|
| Mag 15 | Setup iniziale, prompt system_mlpg.md, parsing JSON |
| Mag 19 | Flask + Streamlit, interfacce web |
| Mag 25 | Retry API (429), prompt token-efficienti |
| Mag 28 | Riepilogo finale unificato, separazione TutorResponse/RiepilogoFinale |
| Giu 24 | Recovery flow con hint e archiviazione, RAG memory, storico persistente |
| Giu 25 | Migrazione completa Gemini → OpenRouter |
| Giu 26 | Login multi-utente, UI cards, barra avanzamento, storico refactoring |
| Lug 1 | Internazionalizzazione IT/EN, pipeline valutazione unificata |
| Lug 6 | Bilanciamento esito, sanity check rimosso, logo 8-bit |
| Lug 9 | V2: Flask+React, recovery 3-tier, dashboard Bento Grid |
| Lug 10 | UI overhaul: split-screen, Pyxel bot, notifiche, form/IDE styling, prompt fix |

---

## 7. Bug Critici Risolti (da INCIDENTS.md)

| Data | Bug | Soluzione |
|------|-----|-----------|
| Giu 24 | OpenRouter HTTP 404 | Endpoint corretto: /api/v1/chat/completions |
| Giu 25 | NameError in streamlit_app.py | Ripristinato da git |
| Lug 1 | psycopg2 compatibility | Wrapper _DB per interfaccia unificata |
| Lug 1 | SHA-256 con salt hardcodato | Migrato a bcrypt con auto-migrazione |
| Lug 1 | Flask debug=True in produzione | Sostituito con FLASK_DEBUG env var |
| Lug 6 | ImportError valuta_con_pipeline | Cache .pyc stantia, kill processi |
| Lug 9 | JWT secret non persistente | Sostituito con env var SECRET_KEY |
| Lug 9 | Featured badges double-encoded | Double-parse con fallback Array.isArray |
| Lug 10 | Filtro euristico: keyword overlap | Bypass per risposte >8 parole e >60 caratteri |
| Lug 10 | Unique char ratio bloccava testi lunghi | Sostituito con conteggio assoluto (< 8 lettere = spam) |
| Lug 10 | Prompt: {livello_utente} irrisolto | Aggiunto .replace() in generator.py |
| Lug 10 | api_final_summary senza badge | Sostituito calcolo manuale con award_user_xp |

---

## 8. Stack Tecnologico

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React 18, Vite 5, CSS Grid/Flexbox, DOMPurify |
| Backend | Flask 3.x, Python 3.12 |
| Database | PostgreSQL (produzione) / SQLite (dev), psycopg2 |
| AI/ML | OpenRouter API (gpt-4o-mini, text-embedding-3-small, gemini-flash-1.5) |
| Auth | JWT HMAC-SHA256 + httpOnly cookie |
| Validazione | Pydantic v2 con extra=forbid |
| Internazionalizzazione | Dizionario flat 260+ chiavi IT/EN |
| Gamification | XP curve, badge SVG, streak tracking |

---

## 9. Numeri del Progetto

| Metrica | Valore |
|---------|--------|
| Commit totali | ~15 |
| File modificati | 35+ |
| Righe di codice | ~5000 (backend + frontend) |
| Componenti React | 10 |
| Endpoint API | 15+ |
| Badge | 20 in 5 categorie |
| Livelli XP | 10 |
| Lingue supportate | IT, EN |
| Bug documentati | 40+ |
| Concept pages vault | 18 |

---

## 10. Prossimi Passi (v1.1+)

- Badge sbloccati attivati in ModuleView (attualmente solo XP)
- Token in httpOnly cookie (già implementato, test in corso)
- Mobile responsive completo
- `.env.example` per onboarding sviluppatori
- Test automatizzati (attualmente solo test_generator.py)
- Dashboard: storico badge guadagnati per sessione
- Multi-tenant / organizzazioni

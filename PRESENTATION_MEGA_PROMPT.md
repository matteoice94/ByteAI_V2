# MEGA PROMPT — Genera Presentazione Interattiva ByteAI

Sei un frontend developer esperto. Devi creare una pagina HTML interattiva che funga da presentazione per il progetto **ByteAI** (Micro Learning Path Generator). La presentazione deve essere completamente autocontenuta in un unico file HTML (CSS e JS inline), funzionare offline, e non richiedere dipendenze esterne.

---

## REQUISITI TECNICI

1. **File unico**: tutto in un solo file `.html`. CSS in `<style>`, JS in `<script>`. Zero dipendenze esterne.
2. **Responsive**: funziona da 320px a 1920px+. Mobile-first.
3. **Performance**: animazioni fluide, niente lag. Usa CSS transitions/animations, evita JS pesante.
4. **Accessibilità**: colori con contrasto sufficiente, testo leggibile.
5. **Autocontenuto**: tutte le icone/emoji inline, nessun asset esterno.

---

## FORMATO: DASHBOARD INTERATTIVA

Il layout è una dashboard a pannelli cliccabili. Non slide, non scroll infinito. L'utente vede una griglia di card/sezioni e clicca per espandere i dettagli.

**Struttura**:
```
┌─────────────────────────────────────────────────┐
│  HEADER: logo ByteAI + tagline                  │
├──────────┬──────────┬──────────┬───────────────┤
│ CARD 1   │ CARD 2   │ CARD 3   │ CARD 4        │
│ Problema │ Come     │ Archi-   │ Evoluzione    │
│          │ funziona │ tettura  │               │
├──────────┼──────────┼──────────┼───────────────┤
│ CARD 5   │ CARD 6   │ CARD 7   │ CARD 8        │
│ Features │ Tech     │ Numeri   │ Demo          │
│ chiave   │ Stack    │          │               │
└──────────┴──────────┴──────────┴───────────────┘
│  FOOTER: GitHub link + tech stack              │
└─────────────────────────────────────────────────┘
```

Quando l'utente clicca una card, questa si espande a tutto schermo (o in un overlay modale) mostrando i contenuti dettagliati di quella sezione. Un pulsante "X" o "Indietro" chiude l'espansione.

---

## STILE VISIVO: BYTEAI DARK + GLITCH

### Colori
```
--bg:        #0A1628   (sfondo principale)
--surface:   #0F1F3A   (card)
--surface2:  #162A4A   (card hover)
--primary:   #3B82F6   (blu accenti)
--purple:    #534AB7   (viola brand)
--teal:      #1D9E75   (verde successo)
--gold:      #FFD700   (oro evidenze)
--text:      #E2E8F0   (testo principale)
--muted:     #94A3B8   (testo secondario)
--border:    #1E3A5F   (bordi)
```

### Effetti Visivi
1. **Sfondo animato**: gradiente che respira lentamente tra navy/indaco/viola
2. **Scanlines CRT**: righe orizzontali semi-trasparenti su tutto lo sfondo (opacità 8%)
3. **Glow cursore**: alone viola/blu che segue il mouse (600px radial gradient, opacità 8%)
4. **Shimmer bordi**: gradient conico animato che ruota attorno ai bordi delle card (opacità 15%)
5. **Glitch testo**: ogni ~8 secondi il titolo "ByteAI" nell'header fa un micro-glitch (traslazione + text-shadow colorato)
6. **Hover card**: le card si sollevano di 3px con box-shadow

### Tipografia
- Font system: 'Inter', system-ui, -apple-system, sans-serif
- Titoli: 1.5-2rem, bold
- Testo: 0.9-1rem, line-height 1.6
- Label: 0.75rem, uppercase, letter-spacing 0.05em, colore muted

---

## CONTENUTI DELLE 8 CARD

### CARD 1: IL PROBLEMA
**Titolo**: "Perché ByteAI?"
**Icona**: 🎯
**Contenuto**:
- L'apprendimento tradizionale è lineare e noioso
- I chatbot AI generici non hanno struttura didattica
- Serve un tutor che: generi percorsi personalizzati, valuti le risposte, guidi l'utente passo passo
- ByteAI risolve questo con micro-learning AI-driven

### CARD 2: COME FUNZIONA
**Titolo**: "User Flow"
**Icona**: 🔄
**Contenuto** (mostra un diagramma di flusso testuale o ASCII):
```
1. LOGIN → 2. SCEGLI TOPIC + LIVELLO → 3. AI GENERA 3 MODULI
    ↓
4. STUDIA MODULO (spiegazione + esercizio)
    ↓
5. INVIA RISPOSTA → AI VALUTA
    ├── Corretta ✓ → prossimo modulo
    ├── Parziale ~ → hint + riprova
    └── Sbagliata ✗ → archivia dopo 2 errori
    ↓
6. RIEPILOGO FINALE (punti forza, aree miglioramento, diario)
    ↓
7. DASHBOARD (XP, livelli, badge, streak)
```

### CARD 3: ARCHITETTURA
**Titolo**: "Tech Architecture"
**Icona**: 🏗️
**Contenuto** (diagramma a blocchi):
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   REACT 18   │────▶│   FLASK 3    │────▶│  OPENROUTER  │
│  (Vite 5)    │◀────│  (Python)    │◀────│  (LLM API)   │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────┴───────┐
                     │  PostgreSQL  │
                     │  / SQLite    │
                     └──────────────┘
```
- Frontend: React 18 + Vite 5, 10 componenti, CSS puro (no framework)
- Backend: Flask 3, 15+ endpoint REST, JWT + httpOnly cookie
- AI: OpenRouter gateway (GPT-4o-mini, embedding, Gemini Flash)
- DB: PostgreSQL (produzione) / SQLite (dev) — dual backend trasparente

### CARD 4: EVOLUZIONE
**Titolo**: "Dalla V1 alla V2"
**Icona**: 📈
**Contenuto** (timeline visuale):
- **Maggio 2026**: Primo prototipo — CLI Python + Gemini API
- **Giugno 2026**: Streamlit UI, recovery flow, RAG memory, multi-utente
- **Luglio 2026**: V2 — Flask+React, Pyxel bot, split-screen, gamification, internazionalizzazione
- **Bug chiave risolti**: SHA-256→bcrypt, JWT secret, filtro euristico falsi positivi, keyword overlap cross-language

### CARD 5: FEATURES CHIAVE
**Titolo**: "Cosa lo rende unico"
**Icona**: ⚡
**Contenuto** (griglia 2x2 di mini-card):
- **Pyxel Bot** 🤖 — Mascotte 8-bit con 3 espressioni context-based e transizione glitch
- **Recovery Flow** 🔄 — 1° errore: hint. 2° errore: archivia. Distinzione parziale/sbagliata
- **Esercizi Strutturati** 📊 — Problem Data + Operations Roadmap + Formula Help
- **Notifiche Progressione** ⬆ — XP snackbar a cascata + achievement popup con glitch

### CARD 6: TECH STACK
**Titolo**: "Tecnologie"
**Icona**: 🛠️
**Contenuto** (lista con badge/pill colorati):
- Frontend: React 18 · Vite 5 · CSS Grid/Flexbox · DOMPurify
- Backend: Flask 3 · Python 3.12 · Pydantic v2 · bcrypt
- Database: PostgreSQL · SQLite · psycopg2
- AI/ML: OpenRouter · GPT-4o-mini · text-embedding-3-small · Gemini Flash 1.5
- Auth: JWT HMAC-SHA256 · httpOnly cookies
- i18n: 260+ chiavi IT/EN · Dizionario flat
- Gamification: 10 livelli XP · 20 badge SVG · Streak tracking

### CARD 7: NUMERI
**Titolo**: "ByteAI in Numeri"
**Icona**: 📊
**Contenuto** (griglia di stat card in stile Bento):
- **10** Componenti React
- **15+** Endpoint API
- **~5000** Righe di codice
- **20** Badge sbloccabili
- **10** Livelli XP
- **40+** Bug risolti
- **2** Lingue (IT/EN)
- **18** Concept documentati

### CARD 8: DEMO
**Titolo**: "Guarda la Demo"
**Icona**: ▶️
**Contenuto**: 
- Testo: "La demo live del sito verrà mostrata a seguire. ByteAI è accessibile via browser su localhost:3000."
- Placeholder per screenshot o GIF animata del sito
- Pulsante "Vai alla Demo" (può linkare a localhost o essere placeholder)

---

## ANIMAZIONI RICHIESTE

1. **Card hover**: `transform: translateY(-3px)` + box-shadow
2. **Card expand**: animazione scale + fade con `cubic-bezier(0.18, 1.2, 0.5, 1)` (bounce)
3. **Glitch titolo**: ogni 8s, traslazione + text-shadow colorato (steps(1))
4. **Shimmer bordi**: `conic-gradient` che ruota 360° in 6s (usa `@property --shimmer-angle`)
5. **Sfondo**: `background` animation 8s alternate tra `#060d1f`, `#0a1030`, `#0d0f28`
6. **Scanlines**: pseudo-elemento con `repeating-linear-gradient`, opacità 8%
7. **Cursor glow**: `radial-gradient` 600px che segue `mousemove`
8. **Card espansa**: i contenuti appaiono con stagger (ogni elemento con 100ms di delay)

---

## COMPORTAMENTO INTERATTIVO

1. All'avvio: tutte le 8 card sono visibili nella griglia
2. Click su una card → la card si espande a modale/overlay full-screen
3. Dentro la modale: contenuti dettagliati, formattati con markdown-like (grassetti, liste, tabelle)
4. Pulsante "✕" o click fuori → chiude la modale, torna alla griglia
5. La modale ha il glitch overhead (bande colorate che lampeggiano per 0.4s all'apertura)
6. Navigazione da tastiera: ESC chiude la modale

---

## SEZIONI AGGIUNTIVE NELLA MODALE

Quando una card è espansa, mostra ANCHE:
- In fondo alla modale, una mini-timeline orizzontale con le altre card (navigazione rapida)
- Una barra in basso con: "ByteAI v1.0 · GitHub · Made with ❤️"

---

## OUTPUT

Genera un file HTML completo e funzionante. Il codice deve essere:
- Ben commentato (sezioni chiare)
- Nessun placeholder: tutti i testi devono essere quelli reali del dossier
- Pronto per essere aperto in un browser
- Testato mentalmente: tutte le animazioni devono funzionare, tutti i click devono rispondere

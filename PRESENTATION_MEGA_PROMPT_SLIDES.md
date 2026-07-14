# MEGA PROMPT #2 — Presentazione a Slide Navigabili ByteAI

Sei un frontend developer esperto. Devi creare una pagina HTML che funga da presentazione a slide orizzontali per il progetto **ByteAI** (Micro Learning Path Generator). La presentazione deve essere completamente autocontenuta in un unico file HTML, funzionare offline, e non richiedere dipendenze esterne.

---

## REQUISITI TECNICI

1. **File unico**: tutto in un solo file `.html`. CSS in `<style>`, JS in `<script>`. Zero dipendenze esterne.
2. **Responsive**: funziona da 320px a 1920px+. Mobile-first.
3. **Performance**: animazioni fluide. Usa CSS transitions/animations.
4. **Autocontenuto**: tutte le icone/emoji inline, nessun asset esterno.

---

## FORMATO: SLIDE ORIZZONTALI NAVIGABILI

La presentazione è composta da **10 slide**. L'utente naviga orizzontalmente con:
- **Frecce laterali** (◀ ▶) ai lati dello schermo, sempre visibili
- **Indicatori paginazione** in basso (pallini ○●)
- **Scroll orizzontale** nativo (opzionale, con snap)
- **Freccia tastiera**: ← → per navigare

### Header Fisso
```
┌─────────────────────────────────────────────────┐
│  🔷 ByteAI — Micro Learning Path Generator       │
│  Slide 3/10  ●○○○○○○○○○                   ◀ ▶ │
└─────────────────────────────────────────────────┘
```

### Transizione Slide
Quando si cambia slide, la slide corrente fa fade-out + slight slide a sinistra, la nuova slide fa fade-in + entra da destra. Dura 400ms. Aggiungere un micro-glitch overlay (bande colorate che lampeggiano per 0.3s) durante la transizione — stile Pyxel.

### Layout Slide
Ogni slide ha:
- **Icona grande** in alto (4rem)
- **Titolo** (2rem, bold)
- **Sottotitolo** opzionale
- **Contenuto** (testo, liste, tabelle, diagrammi ASCII)
- **Badge contatore** in basso a destra (slide N/10)
- Le slide sono centrate verticalmente e orizzontalmente

---

## STILE VISIVO: BYTEAI DARK + GLITCH

### Colori
```
--bg:        #0A1628
--surface:   #0F1F3A
--purple:    #534AB7
--blue:      #3B82F6
--teal:      #1D9E75
--gold:      #FFD700
--text:      #E2E8F0
--muted:     #94A3B8
```

### Effetti Globali (sempre attivi)
1. **Sfondo respirante**: `@keyframes bgBreathe` — 8s alternate tra `#060d1f`, `#0a1030`, `#0d0f28`
2. **Scanlines CRT**: pseudo-elemento `::after` su body con `repeating-linear-gradient` orizzontale (opacità 6%)
3. **Glow cursore**: `radial-gradient` 600px che segue `mousemove` (opacità 6%)
4. **Micro-glitch titolo header**: ogni 8s il testo "ByteAI" trasla + text-shadow colorato per 0.6s (`steps(1)`)
5. **Vignette**: `radial-gradient` fisso con centro trasparente e bordi scuriti

### Tipografia
- Font system: 'Inter', system-ui, -apple-system, sans-serif
- Titoli slide: 2rem, font-weight 800
- Sottotitoli: 1.1rem, color muted
- Testo corpo: 0.95rem, line-height 1.7
- Badge e label: 0.7rem, uppercase, letter-spacing 0.08em

---

## LE 10 SLIDE

### SLIDE 1 — COPERTINA
**Icona**: 🤖
**Titolo**: "ByteAI"
**Sottotitolo**: "Micro Learning Path Generator"
**Contenuto**: 
- "Il tuo tutor AI personale per un apprendimento strutturato e senza stress"
- Data: Luglio 2026
- Badge: v1.0
- In basso: "Usa le frecce ← → o clicca ◀ ▶ per navigare"

### SLIDE 2 — IL PROBLEMA
**Icona**: 🎯
**Titolo**: "Perché ByteAI?"
**Contenuto**:
- ❌ L'apprendimento tradizionale è lineare, passivo, noioso
- ❌ I chatbot AI generici non hanno struttura didattica
- ❌ Non c'è feedback personalizzato, né gamification
- ✅ ByteAI: tutor AI che genera percorsi, valuta risposte, guida passo passo

### SLIDE 3 — USER FLOW
**Icona**: 🔄
**Titolo**: "Come Funziona"
**Contenuto** (diagramma a step numerati):
```
① LOGIN     → ② SCEGLI TOPIC + LIVELLO
③ AI GENERA 3 MODULI (spiegazione + esercizio)
④ STUDIA → RISPONDI → AI VALUTA
   ├─ Corretta ✓ → prossimo modulo
   ├─ Parziale ~ → hint + riprova
   └─ Sbagliata ✗ → archivia dopo 2 errori
⑤ RIEPILOGO FINALE
⑥ DASHBOARD (XP, livelli, badge, streak)
```

### SLIDE 4 — ARCHITETTURA
**Icona**: 🏗️
**Titolo**: "Architettura Tecnica"
**Sottotitolo**: "Flask + React + OpenRouter"
**Contenuto** (diagramma a blocchi con emoji):
```
┌──────────┐  REST   ┌──────────┐  HTTP   ┌───────────┐
│ ⚛️ React │◄──────▶│ 🐍 Flask │◄──────▶│ 🤖 OpenRouter│
│  (Vite)  │  JSON   │ (Python) │  JSON   │ (LLM API)  │
└──────────┘         └────┬─────┘         └───────────┘
                          │
                   ┌──────┴──────┐
                   │  🗄️ PostgreSQL│
                   │  / SQLite   │
                   └─────────────┘
```
- 10 componenti React, CSS puro
- 15+ endpoint REST, JWT + cookie httpOnly
- Dual backend PG/SQLite trasparente
- Pydantic v2 con extra=forbid come contratto LLM

### SLIDE 5 — PYXEL BOT
**Icona**: 🤖
**Titolo**: "Pyxel — La Mascotte"
**Sottotitolo**: "Un robot 8-bit che reagisce al contesto"
**Contenuto** (layout a 3 colonne):
| 😐 Neutrale | 🤔 Thinking | 😊 Happy |
|-------------|-------------|----------|
| Idle, errore | Generazione, valutazione | Risposta corretta |
| "Pronto ad aiutare" | "Sto elaborando..." | "Ottimo lavoro!" |

- Transizione glitch: 12 pixel squares animati per 2.5s tra un'espressione e l'altra
- Aura viola/blu pulsante
- Speech bubbles con feedback, hint, errori

### SLIDE 6 — RECOVERY FLOW
**Icona**: 🔄
**Titolo**: "Recovery Flow"
**Sottotitolo**: "Il tutor che non ti abbandona mai"
**Contenuto**:
```
Risposta Utente
     │
     ▼
[Filtro Euristico] ── Fail ──▶ "Riprova, troppo breve"
     │ Pass
     ▼
[Valutazione LLM]
     │
     ├── Corretta ✓ ──▶ Modulo completato! (+30 XP)
     │
     ├── Parziale ~ ──▶ 1ª volta: Hint + riprova
     │                  ──▶ 2ª volta: "Da Approfondire"
     │
     └── Sbagliata ✗ ──▶ 1ª volta: Hint + riprova
                        ──▶ 2ª volta: Archiviato
```
- Campo `cosa_manca`: l'AI spiega esattamente cosa mancava
- Nessuno stress: il modulo archiviato è sempre recuperabile

### SLIDE 7 — GAMIFICATION
**Icona**: 🏆
**Titolo**: "Gamification"
**Contenuto**:
- **10 Livelli XP**: da 0 a 1800+ XP con soglie progressive
- **20 Badge** in 5 categorie: moduli, precisione, streak, livelli, traguardi
- **Streak giornaliero**: giorni consecutivi di studio
- **Phoenix Badge**: premio per chi torna dopo 7+ giorni di assenza
- **Notifiche**: snackbar XP a cascata + popup achievement con glitch

### SLIDE 8 — FEATURES TECNICHE
**Icona**: ⚡
**Titolo**: "Cosa lo rende unico"
**Contenuto** (griglia 2x3):
| 🔤 i18n IT/EN | 📝 Esercizi Strutturati | 🎨 Split-Screen 65/35 |
|---------------|------------------------|----------------------|
| 260+ chiavi, prompt tradotti | Problem Data + Roadmap + Help | Contenuti a sx, Pyxel a dx |
| 💻 IDE Code Blocks | 🛡️ XSS Protection | 📦 RAG Memory |
| Blocchi SQL con scrollbar custom | DOMPurify su output LLM | Memoria semantica tra sessioni |

### SLIDE 9 — EVOLUZIONE + BUG
**Icona**: 📈
**Titolo**: "Dalla V1 alla V2"
**Sottotitolo**: "Maggio → Luglio 2026"
**Contenuto** (timeline):
```
Maggio  ──▶ CLI Python + Gemini
Giugno  ──▶ Streamlit, recovery flow, multi-utente
Luglio  ──▶ Flask+React, Pyxel bot, split-screen, gamification
```

**Bug critici risolti**:
- SHA-256 con salt hardcodato → bcrypt
- JWT secret non persistente → env var
- Filtro euristico bloccava risposte cross-language → bypass
- Unique char ratio falliva per testi >86 caratteri → conteggio assoluto
- `{livello_utente}` irrisolto nei prompt → `.replace()` in generator.py

### SLIDE 10 — NUMERI + DEMO
**Icona**: 📊
**Titolo**: "ByteAI in Numeri"
**Contenuto** (griglia stat card Bento):
```
┌──────────┬──────────┬──────────┬──────────┐
│    10    │   15+    │  ~5000   │    20    │
│ Component│ Endpoint │ Righe    │  Badge   │
├──────────┼──────────┼──────────┼──────────┤
│    10    │   40+    │    2     │    18    │
│ Livelli  │ Bug Ris. │  Lingue  │ Concepts │
└──────────┴──────────┴──────────┴──────────┘
```
- **Demo**: "La demo live del sito verrà mostrata a seguire"
- **GitHub**: https://github.com/matteoice94/ByteAI_V2
- Pulsante "Fine presentazione — Grazie!"

---

## ANIMAZIONI

1. **Cambio slide**: fade + slide orizzontale (400ms) + glitch overlay (300ms bande colorate)
2. **Hover frecce**: scale(1.1) + glow viola
3. **Pallini paginazione**: attivo = viola pieno, inattivo = bordo sottile
4. **Glitch titolo header**: ogni 8s, traslazione + text-shadow (steps(1))
5. **Sfondo**: animazione bgBreathe 8s
6. **Cursor glow**: segue mouse
7. **Scanlines**: sempre presenti
8. **Contenuti slide**: appaiono con stagger (100ms delay per ogni elemento)

---

## COMPORTAMENTO

1. All'avvio: Slide 1 (copertina)
2. Click freccia ▶ → slide successiva (con animazione)
3. Click freccia ◀ → slide precedente
4. Click pallino ● → va direttamente a quella slide
5. Tasti ← → → navigazione
6. Su mobile: swipe left/right per navigare
7. Loop disabilitato: non si può andare oltre la 10 o prima della 1
8. Alla slide 1, la freccia ◀ è disabilitata (opacità 0.3). Alla slide 10, ▶ è disabilitata.

---

## OUTPUT

Genera un file HTML completo e funzionante. Tutti i testi devono essere quelli reali del dossier ByteAI. Pronto per essere aperto in browser. Nessun placeholder.

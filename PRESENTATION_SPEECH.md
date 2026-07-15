# ByteAI — Speech di Presentazione

## SLIDE 1 — COPERTINA (45 secondi)
"Buongiorno a tutti. Oggi vi presento ByteAI, un tutor basato su intelligenza artificiale per il micro-learning. È un progetto che ho sviluppato negli ultimi tre mesi, passando da un semplice script Python a un'applicazione web completa con frontend React, backend Flask e una mascotte pixel-art interattiva. L'idea nasce da un problema semplice: i chatbot AI generici non hanno struttura didattica. ByteAI invece genera percorsi di apprendimento personalizzati, valuta le risposte, guida l'utente passo dopo passo, e lo motiva con un sistema di gamification."

---

## SLIDE 2 — IL PROBLEMA (30 secondi)
"Partiamo dal problema. L'apprendimento online tradizionale è spesso lineare, passivo e noioso. I chatbot AI come ChatGPT rispondono a domande ma non hanno una struttura didattica: non sanno dosare la difficoltà, non danno feedback strutturato, non motivano. ByteAI riempie questo vuoto: è un tutor che genera percorsi su misura, valuta con criterio, e guida l'utente senza mai abbandonarlo."

---

## SLIDE 3 — USER FLOW (45 secondi)
"Vediamo il flusso d'uso. L'utente fa login, sceglie un argomento — per esempio 'algebra lineare' — e un livello tra base, intermedio e avanzato. L'intelligenza artificiale genera tre moduli sequenziali, ciascuno con una spiegazione chiara e un esercizio pratico. L'utente studia, risponde, e l'AI valuta. Se la risposta è corretta, si passa al modulo successivo. Se è parzialmente corretta, l'AI dà un hint mirato e fa riprovare. Dopo due errori gravi, il modulo viene archiviato per essere ripreso più tardi — senza frustrazione. Alla fine del percorso, un riepilogo con punti di forza, aree da migliorare e un diario di bordo. Il tutto tracciato in una dashboard con XP, livelli, badge e streak."

---

## SLIDE 4 — ARCHITETTURA (40 secondi)
"Dal punto di vista tecnico, ByteAI è un'applicazione full-stack. Il frontend è in React 18 con Vite 5, dieci componenti, CSS puro, nessun framework UI — tutto custom, inclusi gli effetti visivi come le scanlines CRT e il cursore glow. Il backend è Flask 3 in Python, con quindici endpoint REST. L'autenticazione usa JWT con token in cookie httpOnly per sicurezza anti-XSS. Per l'intelligenza artificiale uso OpenRouter come gateway unico, che mi dà accesso a GPT-4o-mini per la generazione, un modello di embedding per la memoria semantica, e Gemini Flash per le traduzioni. Il database è PostgreSQL in produzione con fallback automatico a SQLite in sviluppo, grazie a un wrapper che ho scritto per unificare l'interfaccia. La validazione dei dati è gestita con Pydantic e `extra=forbid`, che blocca qualsiasi campo non previsto restituito dall'LLM — una specie di contratto tra l'AI e l'applicazione."

---

## SLIDE 5 — PYXEL BOT (35 secondi)
"Una delle caratteristiche che rendono ByteAI diverso è la mascotte. Si chiama Pyxel — un robot in pixel-art 8-bit con tre espressioni: neutrale quando è in attesa, thinking quando sta elaborando una risposta, e happy quando l'utente risponde correttamente. La transizione tra un'espressione e l'altra non è un semplice cambio di immagine: c'è un effetto glitch di 2.5 secondi con dodici pixel quadrati colorati che lampeggiano sul volto, estratti direttamente dall'SVG animato originale. Pyxel non è decorativo: è un indicatore di stato che comunica immediatamente cosa sta succedendo. E i feedback — hint, valutazioni, errori — appaiono come fumetti che sembrano uscire direttamente dal bot."

---

## SLIDE 6 — RECOVERY FLOW (30 secondi)
"Il recovery flow è il cuore pedagogico di ByteAI. Quando l'utente risponde, la risposta passa prima da un filtro euristico scritto in Python — che è gratis, non consuma token — che blocca input troppo brevi o spam. Poi arriva alla valutazione dell'LLM. Qui la distinzione chiave è tra 'parziale' e 'sbagliata'. Parziale significa che l'utente ha capito qualcosa ma non tutto: l'AI dà un hint e fa riprovare. Dopo due parziali, il modulo va in 'Da Approfondire' — viene archiviato con una nota su cosa mancava. Sbagliata significa che la risposta è fuori strada: dopo due errori il modulo viene archiviato ma resta sempre recuperabile. Il campo `cosa_manca`, aggiunto nella V2, dice esattamente cosa l'utente deve rivedere. È un approccio che evita la frustrazione e trasforma l'errore in un'opportunità di apprendimento."

---

## SLIDE 7 — GAMIFICATION (25 secondi)
"Per mantenere alta la motivazione, ByteAI ha un sistema di gamification completo. Dieci livelli con soglie progressive di XP, venti badge in cinque categorie — dai traguardi di moduli alla precisione, dallo streak ai livelli raggiunti. C'è il Phoenix Badge per chi torna dopo una settimana di assenza. E ci sono notifiche animate: quando guadagni XP appare una snackbar che scende dall'alto con una barra di progresso che si riempie in tempo reale. Quando sali di livello o sblocchi un badge, un popup centrale con effetto bounce e glitch. Non sono notifiche invadenti: sono piccole ricompense visive che danno soddisfazione."

---

## SLIDE 8 — FEATURES & STACK (30 secondi)
"ByteAI ha diverse caratteristiche che lo rendono unico. Supporta italiano e inglese con 260 chiavi di traduzione, prompt separati per lingua, e traduzione on-the-fly dei moduli. Gli esercizi non sono un blocco di testo piatto: sono strutturati in tre pannelli — dati del problema, roadmap delle operazioni con checklist interattiva, e help rapido con estratto della teoria. Il layout è split-screen: 65% contenuti a sinistra, 35% Pyxel e feedback a destra, con la colonna destra sempre visibile grazie allo sticky positioning. I blocchi di codice SQL sono renderizzati come un vero IDE, con header stile macOS e scrollbar custom. E la protezione XSS è garantita da DOMPurify su tutto l'output dell'LLM."

---

## SLIDE 9 — EVOLUZIONE (30 secondi)
"In tre mesi il progetto è passato da un prototipo a un'applicazione matura. A maggio era uno script CLI che chiamava Gemini. A giugno ho aggiunto Streamlit, il recovery flow, la memoria semantica con RAG, e il multi-utente. A luglio è nata la V2: migrazione completa a React, Flask, split-screen, Pyxel, gamification. Lungo il percorso ho risolto bug critici: il passaggio da SHA-256 a bcrypt per le password, il JWT secret che cambiava a ogni riavvio, il filtro euristico che bloccava risposte legittime in lingua diversa dall'esercizio, e un bug matematico nel controllo dei caratteri unici che faceva fallire qualsiasi testo più lungo di 86 caratteri. Più di 40 bug documentati e risolti."

---

## SLIDE 10 — NUMERI + DEMO (20 secondi)
"Qualche numero per dare la misura del progetto: 10 componenti React, più di 15 endpoint API, circa 5.000 righe di codice, 20 badge, 10 livelli, 40 bug risolti, 2 lingue supportate, 18 concept architetturali documentati in un knowledge vault. Il codice è open source su GitHub. E ora — vi faccio vedere il sito in funzione."

---

**Tempo totale stimato: ~5 minuti e 30 secondi**

# SE2 Office Queue Management (Team09)

Struttura iniziale del progetto con:

- Frontend: React + Vite + CSS classico
- Backend: Node.js + Express
- Database: SQLite

Obiettivo di questo commit iniziale: impostare solo lo scheletro del progetto e le dipendenze necessarie, senza implementare la logica applicativa.

## Stack Tecnologico

- Node.js (consigliato: versione LTS recente)
- React (frontend)
- Vite (tooling frontend)
- Express (API backend)
- SQLite (database locale)

## Struttura Cartelle

```text
SE2-OfficeQueueManagement-Team09/
|-- frontend/
|   |-- index.html
|   |-- package.json
|   |-- vite.config.js
|   `-- src/
|       |-- App.jsx
|       |-- main.jsx
|       |-- components/
|       |   `-- .gitkeep
|       `-- styles/
|           |-- app.css
|           `-- reset.css
|-- backend/
|   |-- .env.example
|   |-- package.json
|   |-- data/
|   |   `-- .gitkeep
|   `-- src/
|       |-- app.js
|       |-- server.js
|       |-- controllers/
|       |   `-- .gitkeep
|       |-- database/
|       |   `-- connection.js
|       |-- middlewares/
|       |   `-- .gitkeep
|       |-- routes/
|       |   `-- .gitkeep
|       `-- services/
|           `-- .gitkeep
|-- .gitignore
`-- README.md
```

## Setup Iniziale

Eseguire dalla root del progetto.

### 1) Installazione dipendenze frontend

```bash
cd frontend
npm install
```

### 2) Installazione dipendenze backend

```bash
cd ../backend
npm install
```

## Avvio in locale

Aprire due terminali separati.

### Terminale 1 - Backend

```bash
cd backend
npm run dev
```

Backend in ascolto su `http://localhost:4000`.

### Terminale 2 - Frontend

```bash
cd frontend
npm run dev
```

Frontend disponibile su `http://localhost:5173`.

## Note su configurazione

- Copiare `backend/.env.example` in `backend/.env` per configurazioni locali.
- Il file SQLite verra` creato in `backend/data/` quando si inizializzera` la parte database.
- La cartella contiene solo base setup e placeholder: nessuna feature applicativa e` ancora implementata.

## Script Disponibili

### Frontend

- `npm run dev` avvia Vite in sviluppo
- `npm run build` crea la build produzione
- `npm run preview` anteprima build

### Backend

- `npm run dev` avvia Express con nodemon
- `npm start` avvia Express con node

# MindFirst

MindFirst ist eine KI-gestützte Chat-App zur mentalen Unterstützung. Die Anwendung kombiniert ein empathisches Chat-Erlebnis mit einem Frühwarnsystem für psychische Belastungen. Bei Anzeichen von Überlastung reagiert die App frühzeitig und kann Nutzer:innen an Beratungsstellen weiterleiten.

## Team

* Autor: Taro Anklam, HAW Hamburg  
* Studienprojekt im Rahmen des Moduls KI 

## Projektstruktur

- **Backend** – FastAPI Backend für die Chat-Logik und Schnittstellen
- **Frontend** – Next.js Web-App für die Nutzeroberfläche
- **Business Plan** – Projektarbeit

## Installation

Die Installation erfolgt getrennt für Backend und Frontend. In den jeweiligen Ordnern finden sich detaillierte Anleitungen.

Für das Backend wird zusätzlich **Ollama** und das Model **llama3.1:8b** benötigt. Bitte stelle sicher, dass Ollama auf deinem System installiert ist und das Model runtergeladen wurde, bevor du den Server startest.

## Schnellstart

### Backend starten
```bash
cd backend
python -m venv .venv && source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
# Modell vorbereiten: ollama pull llama3.1:8b
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend starten
```bash
cd frontend
npm install
# .env.local anlegen:
# MONGODB_URI="mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
# MONGODB_DB="Cluster0"
# JWT_SECRET="<starkes_secret>"
# MF_API_BASE=http://127.0.0.1:8000
npm run dev
# App: http://localhost:3000
```
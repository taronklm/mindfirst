# MindFirst Backend

Das Backend stellt die API für die MindFirst Chat-App bereit. Es basiert auf **FastAPI** und übernimmt die Verarbeitung der Konversationen sowie die Anbindung an KI-Modelle.

## Installation

1. Modell vorbereiten
   ```bash
   ollama pull llama3.1:8b
   ```
2. Python-Umgebung erstellen (z. B. venv)
   ```bash
   python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
   ```
3. Abhängigkeiten installieren:
   ```bash
   pip install -r requirements.txt
   ```
4. Server starten:
   ```bash
   uvicorn main:app --reload
   ```

## Funktionen

- API-Endpunkte für Chat-Interaktionen
- Verarbeitung von Nutzer-Eingaben
- Vorbereitung von Schnittstellen für KI-gestützte Analysen

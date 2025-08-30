# MindFirst Frontend

Das Frontend ist eine **Next.js**-basierte Web-App für die MindFirst Chat-Anwendung. Es bildet die Benutzeroberfläche ab und kommuniziert mit dem Backend.

## Installation

1. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
2. Umgebungsvariablen anlegen  
   Lege eine Datei `.env.local` im Projekt Hauptverzeichnis an. Trage dort die für dich relevanten Werte ein. Beispiele:

   ```bash
   MF_API_BASE=http://127.0.0.1:8000
   MONGODB_URI="mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
   MONGODB_DB="Cluster0"
   JWT_SECRET="<zufaelliger_geheimer_schluessel>"
   ```
3. Entwicklungsserver starten:
   ```bash
   npm run dev
   ```
4. Die App ist erreichbar unter:
   ```
   http://localhost:3000
   ```

## Funktionen

- Chat-Interface für die Nutzer:innen
- Darstellung von Empfehlungen und Warnhinweisen
- Anbindung an das Backend über REST-API

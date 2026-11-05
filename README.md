# StruPPI Viewer

Ein interaktiver Web-Viewer für StruPPI (Struktur für ProgrammPresseInformation) XML-Dateien nach dem Standard von [struppi.tv](https://www.struppi.tv/).

## Features

- 📂 **Flexible Datei-Eingabe**: Laden Sie StruPPI XML Dateien von einer URL oder von Ihrem lokalen Computer
- 🎬 **EPG-Ansicht**: Übersichtliche Darstellung aller Sendungen mit Sortierung nach Ausstrahlung
- 📺 **Sender-Informationen**: Detaillierte Senderinfos mit Logo, Kontaktdaten und Links
- 📊 **Serien-Management**: Gruppierung und Verwaltung von Serien mit Episoden-Übersicht
- 🖼️ **Bilder mit Fallback**: Automatische Anzeige von Bildern mit eleganten Fallbacks
- 🔗 **Query-Parameter-Unterstützung**: Direkte XML-Ladung via URL-Parameter (`?url=...`)
- 📱 **Responsive Design**: Optimiert für Desktop und Tablet
- ⚡ **Single-Page-Application**: Schnelle Navigation ohne Neuladen

## Installation & Entwicklung

### Voraussetzungen
- Node.js 18+
- npm oder yarn

### Setup

```bash
# Repository klonen
git clone https://github.com/yourusername/btv-struppi-viewer.git
cd btv-struppi-viewer

# Dependencies installieren
npm install

# Dev-Server starten
npm run dev

# Production Build
npm run build

# Build Preview
npm run preview
```

## Verwendung

### Im Browser

1. Öffne die Anwendung
2. Wähle eine XML-Quelle oder lade sie per URL
3. Der Viewer lädt den Sender und zeigt die Ansichten für Programm, Sendungen und Serien

### Query-Parameter für direkte Nutzung / iframe

Die App kann direkt mit Parametern gestartet werden. Das ist nützlich für eingebettete Nutzung oder ein externes Portal:

```text
?url=https://example.com/struppi.xml
?sender=BodenseeTV
?hideHeader=1
?iframe=1
?hideRefresh=1
?hideSource=1
```

Beispiele:

```text
https://yourdomain.com/btv-struppi-viewer/?url=https://example.com/struppi.xml
https://yourdomain.com/btv-struppi-viewer/programm?url=/sample.xml&sender=BodenseeTV&hideHeader=1&iframe=1
```

Wichtige Hinweise:
- `url` lädt das XML automatisch
- `sender` setzt den gewünschten Sender fest
- `hideHeader=1` entfernt die Navigationsleiste für iframe-/Embed-Use
- `iframe=1` und `embed=1` aktivieren das Embedded-Verhalten
- `hideRefresh=1` und `hideSource=1` können UI-Elemente ausblenden

## Aktueller Stand / Navigation

Nach dem Laden eines StruPPI XML steht Ihnen folgende Navigation zur Verfügung:

- **Sender**: Detaillierte Informationen zum Sender (Logo, Kontakt, Links)
- **Programm**: Listen-/Kalenderansicht mit Zeitfilter, Ablauf-Auswahl und "Aktuell"-Sprung
- **Sendungen**: Gruppierte Folge-Ansicht mit Liste/Kalender und Zeitfenstern
- **Serien**: Serienübersicht mit Staffel-/Episoden-Detailansicht

Die Detailansichten sind als eigene Routen realisiert und nicht als Modals. Dadurch funktionieren sie besser in eingebetteten Umgebungen und bei Verlinkungen.

## Struktur des Projekts

```
src/
├── pages/
│   ├── LoaderPage.tsx          # XML-Lade-Seite
│   ├── BroadcasterPage.tsx     # Sender-Informationen
│   ├── BroadcastsPage.tsx      # Sendungen-Liste & Details
│   └── SeriesPage.tsx          # Serien-Liste & Details
├── context/
│   └── StruPPIContext.tsx      # Global State Management
├── layouts/
│   └── MainLayout.tsx          # Haupt-Layout mit Navigation
├── components/
│   ├── Navbar.tsx              # Header/Navigation
│   └── ImageWithFallback.tsx   # Bild-Komponente mit Fallback
├── parsers/
│   └── struppiParser.ts        # StruPPI XML Parser
├── types/
│   └── struppi.ts              # TypeScript-Typen für StruPPI
└── App.tsx                      # React Router Setup
```

## Deployment auf GitHub Pages

Die Anwendung ist vorkonfiguriert für GitHub Pages Deployment:

```bash
# Build produzieren
npm run build

# Mit GitHub Actions automatisch deployen oder manuell:
# Push den dist/ Ordner zu gh-pages branch
```

### Via GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Technologie-Stack

- **React 19**: UI Framework
- **React Router**: Client-side Routing
- **TypeScript**: Type-safe Development
- **Tailwind CSS**: Styling
- **Vite**: Build Tool & Dev Server
- **shadcn/ui + Base UI**: UI Components

## XML Schema

Die Anwendung unterstützt das vollständige StruPPI XML Schema wie definiert in [StruPPI_1.0.13.xsd](./StruPPI_1.0.13.xsd).

### Unterstützte Elemente

- Sender mit Logos, URLs und Kontaktdaten
- Ablauf-Strukturen mit mehreren Sendungen
- Sendungen mit:
    - Terminformationen (Start/Ende Zeit)
    - Titel und Untertitel
    - Klassifizierung und Genres
    - Mitwirkende (Schauspieler, Regisseure, etc.)
    - Texte und Beschreibungen
    - Medien (Bilder, Videos)
- Serien mit Episoden-Struktur
- Altersfreigaben und Auszeichnungen

## Error Handling

- **Netzwerkfehler**: Werden mit aussagekräftigen Fehlermeldungen angezeigt
- **XML-Parsing-Fehler**: Detaillierte Fehlerbehandlung
- **Fehlende Bilder**: Automatischer Fallback zu Platzhalter-Icons
- **Fehlende Sender**: Rückleitung zur Lade-Seite

## Status gegenüber TODO / Anforderungen

Diese Anwendung entspricht dem aktuellen Projektziel weitgehend:

- [x] Sender-Auswahl, Sender-Logo, Favicon, Titel anpassen
- [x] Ablauf-Auswahl bei mehreren Abläufen
- [x] XML-Caching via Session-/LocalStorage
- [x] Quelle anzeigen und neu laden via Refresh
- [x] Query-Parameter für Sender, URL, Embed, Header/Refresh/Source
- [x] Einbettung als iframe / embedded view
- [x] Programm-Ansicht mit Liste + Kalender
- [x] Sendungen-Ansicht mit Liste + Kalender
- [x] Serien-Ansicht mit Detailseite
- [x] Detailseiten als eigenständige Seiten statt Modals
- [x] Responsive UX für Desktop und Mobile

Einziges verbleibendes Detail aus dem ursprünglichen TODO, das nicht strikt als separate Route umgesetzt wurde, ist die separate "Staffel-Ansicht" als eigene Page. Die Staffel-Funktionalität existiert derzeit als gefilterte Detailansicht innerhalb der Serie-Route und erfüllt die eigentliche Nutzung.

## Lizenz

MIT

## Kontakt & Support

Für Fragen oder Issues bitte ein GitHub Issue erstellen.

---

**Hinweis**: Diese Anwendung funktioniert komplett im Browser ohne Backend-Server. Alle XML-Daten werden lokal verarbeitet.


# LernHub

Eine kostenlose, statische Lernplattform für eine Klasse in der Erzieherausbildung. Materialien lesen und herunterladen, Quizze mit vier Aufgabentypen bearbeiten und digitale Karteikarten wiederholen – ohne Anmeldung, Backend oder Lern-API.

**Status:** Version 1.0 für das Zielrepository `jonas101201/-jonas101201.github.io.-`. Die Materialsammlung enthält die Originalunterlagen der Klasse; dazu gibt es redaktionell erstellte Quizze und Lernkarten mit Quellenverweisen. BK1 und BK2 haben jeweils acht konfigurierbare Lernfelder; diese sind noch keine verbindliche Lehrplanstruktur.

## Funktionsumfang

- Responsives Dark-Glass-Design mit Desktop-Sidebar und mobiler Navigation.
- Sieben Fächer: BK1, BK2, Deutsch, Mathematik, Englisch, Religion und Sozialkunde.
- Fach- und Lernfeldseiten mit Materialien, Quizzen und Karteikarten.
- Materialsuche, Fach-/Lernfeld-/Dateitypfilter, Titel-/Datumssortierung und Neu-Markierung für 14 Tage.
- PDF-Vorschau, Browser-Vollbild, separate Anzeige und Downloads. Weitere Dateitypen werden heruntergeladen bzw. separat geöffnet.
- Globale Suche über Materialien, Quizze und Karteikarten, einschließlich Kartenbegriffen und Definitionen.
- Single Choice, Multiple Choice, Richtig/Falsch und Zuordnungen. Zufällige Fragenfolge und, wo sinnvoll, Antwortreihenfolge.
- Lernmodus mit Feedback, Prüfungsmodus ohne Zwischenfeedback, Auswertung und Wiederholung falscher Fragen.
- Karteikarten umdrehen, navigieren, mischen, bewerten und schwierige Karten wiederholen.
- Echte lokale Statistiken und Verlauf. Ohne Ergebnisse erscheint ein Leerzustand.
- Fehlerbehandlung für ungültige Inhalte, fehlende Routen und gesperrten oder beschädigten lokalen Speicher.

## Technologie und Voraussetzungen

React 19, TypeScript mit Strict Mode und `noUncheckedIndexedAccess`, Vite, Tailwind CSS 4, React Router, Lucide Icons. Zod validiert JSON-Inhalte und gespeicherte Daten zur Laufzeit; Vitest prüft die Geschäftslogik; ESLint prüft TypeScript und React Hooks. Keine externen Schriften oder Trackingdienste.

Benötigt: **Node.js 22 oder neuer**, npm und optional Git. Die konkrete Installation ist in `package-lock.json` festgehalten. Für den Betrieb genügt statisches Hosting.

## Installation und Entwicklung

Im Ordner mit `package.json`:

```sh
npm ci
npm run dev
```

Vite zeigt die lokale URL an (standardmäßig `http://127.0.0.1:5173/`). Die Plattform muss über HTTP(S) ausgeliefert werden. `index.html` direkt per `file://` zu öffnen funktioniert nicht.

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Lokale Entwicklung mit Hot Reload |
| `npm run typecheck` | Strenge TypeScript-Prüfung |
| `npm run lint` | ESLint |
| `npm test` | Automatisierte Tests einmal ausführen |
| `npm run test:watch` | Tests während der Entwicklung |
| `npm run check` | TypeScript, Lint und Tests |
| `npm run validate:files` | Vorhandensein, Größe und Dateityp aller Materialdateien prüfen |
| `npm run build` | TypeScript prüfen und Produktionsbuild in `dist/` erzeugen |
| `npm run preview` | Produktionsbuild lokal über HTTP testen |

## Build und Repository-Basispfad

Der Standard `base: './'` erzeugt einen portablen statischen Build. Für eine feste Hosting-URL kann der Basispfad explizit gesetzt werden:

```sh
# Linux / macOS
VITE_BASE_PATH=/-jonas101201.github.io.-/ npm run build
# PowerShell
$env:VITE_BASE_PATH='/-jonas101201.github.io.-/'; npm run build
```

Für die lokale Produktionsvorschau denselben Pfad setzen: `VITE_BASE_PATH=/-jonas101201.github.io.-/ npm run preview`. Vite zeigt dann die Vorschau-URL einschließlich Unterpfad an.

Root-Pages bzw. eigene Domain: `/`. Projekt-Pages: `/<Repositoryname>/`. Groß-/Kleinschreibung beachten. `materialUrl()` verwendet denselben Vite-Basispfad für alle Dateien.

**Routingentscheidung:** `HashRouter` erzeugt URLs wie `https://name.github.io/LernHub/#/faecher/bk1`. Der Teil hinter `#` wird nicht an GitHub geschickt; direkte Links und Reloads funktionieren ohne serverseitige Rewrite-Regeln oder `404.html`-Hack. Ein Link ohne Hash auf `/LernHub/faecher/bk1` ist nicht vorgesehen.

## Projektstruktur

```text
.github/workflows/deploy.yml    CI und GitHub-Pages-Deployment
public/
  icons/                       Lokales Logo
  materials/<fach>/            PDFs und weitere Unterrichtsdateien
scripts/check-materials.mjs     Dateiprüfung für lokale Builds und CI
src/
  app/                         Einstieg, Router und Fehlergrenze
  components/                  Wiederverwendbare UI-Bausteine
  layouts/                     Sidebar, Header, Suche und Seitenrahmen
  pages/                       Dashboard, Fächer, Suche, Informationen
  features/
    materials/                 Katalogansicht, Filter und Viewer
    quizzes/                   Unabhängige Quiz-Engine und Ansichten
    flashcards/                Lernsets und Kartenansicht
  data/catalog.json            Zentraler redaktioneller Inhaltskatalog
  data/catalog.ts              Validierter Zugriff und Namensauflösung
  hooks/                       Gemeinsamer lokaler Fortschrittszustand
  types/                       Datenmodelle und Zod-Schemas
  utils/                       Inhaltsvalidierung, Pfade und Speicherung
  styles/index.css             Tailwind-Einbindung und Designsystem
 tests/                        Quiz-, Validierungs- und Speichertests
```

## Architekturentscheidungen

1. **Inhalte sind Daten:** Fachstruktur, Lernfelder, Themen, Materialien, Quizze und Lernsets liegen in einer JSON-Datei. Änderungen brauchen keine React-Anpassung. IDs bleiben stabil; Anzeigenamen dürfen sich ändern.
2. **Klare Beziehungen:** Jedes Material, Quiz und Lernset hat `subjectId`, optional `learningFieldId` und `topicId`. Lernfelder müssen zum Fach passen, Themen ebenfalls zum Fach und gegebenenfalls Lernfeld. Die gemeinsamen Fachfilter zeigen Inhalte aus allen Lernfeldern; eine Lernfeldseite zeigt nur genau zugeordnete Inhalte.
3. **Validierung an der Grenze:** Zod prüft Formen und Werte. `validateCatalog()` prüft zusätzlich eindeutige IDs, Beziehungen, Antwortschlüssel und Dateipfade. Ein fehlerhafter Katalog wird nicht stillschweigend teilweise geladen: Die Anwendung zeigt einen verständlichen Fehlerzustand. Details stehen in der Entwicklerkonsole. Tests und CI sollen dies vor Veröffentlichung verhindern.
4. **Quiz-Logik ohne React:** `engine.ts` ist rein datengetrieben und separat testbar. Jede Frage zählt einen Punkt. Mehrfachauswahl und Zuordnungen müssen vollständig korrekt sein; Teilpunkte gibt es in v1 nicht. Antwort- und Fragen-IDs bleiben beim Mischen erhalten. Beim Wiederholen von Fehlern wird ein eigenständiger Versuch mit der kleineren Fragenzahl gespeichert.
5. **Einfacher lokaler Zustand:** Der ProgressProvider hält die Ansicht aktuell. Ein versioniertes localStorage-Dokument speichert höchstens 200 Quizversuche und pro Karte Status, Wiederholungszahl und Zeitstempel. Keine Speicherung während einer unvollständigen Quizrunde. Ein Seiten-Reload beginnt das Quiz neu; abgeschlossene Versuche bleiben erhalten.
6. **Erweiterbare Kartenbewertung:** Schlüssel sind `<setId>:<cardId>`. Die jeweils letzte Einschätzung bestimmt „gewusst“ oder „schwierig“. Zeitstempel und Wiederholungszahl bieten eine Grundlage für spätere Spaced-Repetition-Felder; es wird noch kein automatischer Wiederholungsplan behauptet.
7. **PDF-Anzeige ohne zusätzliche Bibliothek:** Ein iframe verwendet den PDF-Viewer des Browsers. Mobile Browser und Vollbild-APIs unterscheiden sich; separate Anzeige und Download bleiben erreichbar. Für eine spätere einheitliche Darstellung kann PDF.js ergänzt werden.

## GitHub Pages veröffentlichen

Zielrepository: `https://github.com/jonas101201/-jonas101201.github.io.-`. Das bisherige eigenständige Spielformen-Lernspiel und seine Archivkopie wurden auf Wunsch entfernt. Die neue Quiz-Engine mit ihrem Spielformen-Beispielquiz bleibt Bestandteil von LernHub. Der frühere Stand ist weiterhin über die Git-Historie erreichbar. Der Projekt-Basispfad lautet `/-jonas101201.github.io.-/`; die erwartete Projekt-Pages-URL ist `https://jonas101201.github.io/-jonas101201.github.io.-/`. Dieses Repository ist wegen der zusätzlichen Zeichen im Namen eine Projekt-Pages-Site, keine Root-Site `jonas101201.github.io`. Der Workflow liest den endgültigen Pfad automatisch aus. Die Website wird über den GitHub-Actions-Workflow auf GitHub Pages veröffentlicht.

1. Ein kostenloses öffentliches GitHub-Repository anlegen oder ein ausdrücklich freigegebenes Repository wählen. Den **Inhalt dieses Projektordners** auf die Repository-Wurzel übertragen, einschließlich `.github/`, `package.json` und `package-lock.json`. Bestehende produktive Inhalte vorher prüfen und sichern.
2. Den lokalen Branch `feat/lernhub-v1` pushen und per Pull Request in `main` integrieren. Für neue Repositories muss ein `main`-Branch existieren. Falls der Hauptbranch anders heißt, in `deploy.yml` die Branch-Namen und die `refs/heads/main`-Bedingungen anpassen.
3. Im Repository **Settings → Pages → Build and deployment → Source: GitHub Actions** wählen. GitHub Actions muss für das Repository erlaubt sein.
4. Der Workflow prüft bei Pull Requests nach `main` die Typen, Linting, Tests, Dateien und Build; er veröffentlicht Pull Requests nicht.
5. Bei Push auf `main` oder manuellem Workflow-Start auf `main` liest `actions/configure-pages` den tatsächlichen Basispfad aus und baut damit. Anschließend werden `dist/` als Pages-Artefakt hochgeladen und im Environment `github-pages` veröffentlicht. Ein geschütztes Environment kann eine manuelle Freigabe erfordern.
6. Die von GitHub ausgegebene Pages-URL öffnen. Fach-Deep-Link inklusive `#/` kopieren, direkt öffnen und neu laden. Material öffnen/herunterladen und ein Quiz ausprobieren.

Der Workflow verwendet minimale Job-Berechtigungen: Lesen für den Build, `pages: write` und `id-token: write` ausschließlich für das Deployment. Kein eigener API-Schlüssel und keine kostenpflichtigen Dienste nötig. Ein Build allein veröffentlicht nichts.

## Materialien hinzufügen: Uploadprozess für die Administration

Besucher haben absichtlich keine Uploadfunktion. Administration erfolgt über Git bzw. die GitHub-Dateiansicht:

1. Eine Datei mit passenden Nutzungsrechten und ohne personenbezogene oder vertrauliche Angaben vorbereiten. Scans möglichst durchsuchbar und PDFs barrierearm gestalten.
2. Datei z. B. als `public/materials/bk1/beobachtung-notizen.pdf` ablegen. Erlaubte Pfade beginnen mit `materials/`; Ordner und Namen verwenden nur ASCII-Buchstaben, Zahlen, `_` und `-`. Keine Leerzeichen, Umlaute, `..`, URL-Parameter oder externen URLs.
3. Einen Datensatz in `materials` in `src/data/catalog.json` ergänzen:

```json
{
  "id": "beobachtung-notizen",
  "subjectId": "bk1",
  "learningFieldId": "bk1-lf2",
  "title": "Beobachtung im Alltag",
  "description": "Merkmale einer sachlichen Beobachtung mit Praxisbeispielen.",
  "kind": "Lernzettel",
  "fileType": "PDF",
  "path": "materials/bk1/beobachtung-notizen.pdf",
  "tags": ["Beobachtung", "Praxis"],
  "publishedAt": "2026-11-03",
  "example": false
}
```

4. `topicId` optional ergänzen, wenn ein passendes Thema in `topics` vorhanden ist. `learningFieldId` ist ebenfalls optional. `path` enthält **kein** `public/` und keinen Repository-Basispfad.
5. `npm run check && npm run validate:files && npm run build` ausführen. Datei in der lokalen Vorschau öffnen und herunterladen. Änderungen in einem Branch committen, prüfen und nach Freigabe in `main` integrieren.

`kind`: `Lernzettel`, `Arbeitsblatt`, `Zusammenfassung`, `Präsentation`, `Unterrichtsdatei`. `fileType`: `PDF`, `TXT`, `PPTX`, `DOCX`, `ZIP`. Nur PDFs erhalten eine integrierte Vorschau; die tatsächliche Dateiendung muss passen. Veröffentlichungsdaten sind ISO-Daten `JJJJ-MM-TT`; sie steuern die Neu-Markierung und Sortierung. Statische Dateien sind nach Veröffentlichung direkt erreichbar.

## Fächer, Lernfelder und Themen anpassen

`subjects` definiert Titel, Untertitel, Farbe und Symbol. Verfügbare Farbtokens: `violet`, `blue`, `rose`, `amber`, `teal`, `orange`, `cyan`. `learningFields` bestimmt die Anzahl und Benennung; z. B. kann `bk1-lf1.title` geändert werden, ohne referenzierende Inhalte anzupassen. Zusätzliche Lernfelder einfach als weitere Einträge mit eigener ID und Nummer ergänzen. Beim Entfernen zuerst die zugehörigen Inhaltsbeziehungen anpassen. BK1 und BK2 verwenden unabhängige IDs. LB und KVQ sind nicht enthalten.

Ein Thema in `topics` hat `id`, `subjectId`, optional `learningFieldId` und `title`. Alle IDs nutzen Kleinbuchstaben, Zahlen und Bindestriche. Keine IDs nach Veröffentlichung wiederverwenden oder routinemäßig ändern: Sie sind auch Schlüssel für Fortschritte.

## Neue Quizze erstellen

In `quizzes` einen Eintrag mit eigener `id`, `subjectId`, optional Lernfeld und Thema, `title`, `description`, `example`, `sources` (HTTPS-URLs) und `questions` ergänzen. Verwende das vollständige Spielformen-Quiz als Vorlage. Die Reihenfolge im JSON ist redaktionell; die Engine mischt beim Start.

Single Choice:

```json
{
  "id": "bauwerk-erkennen",
  "type": "single",
  "prompt": "Welche Tätigkeit ist ein Konstruktionsspiel?",
  "options": [
    { "id": "bauen", "text": "Eine Brücke aus Klötzen bauen" },
    { "id": "rolle", "text": "Eine erfundene Rolle spielen" }
  ],
  "correctOptionIds": ["bauen"],
  "explanation": "Im Mittelpunkt steht das Herstellen eines Bauwerks."
}
```

- `single`: genau eine korrekte ID.
- `multiple`: alle korrekten IDs in `correctOptionIds`; alle müssen ausgewählt sein, keine falsche darf enthalten sein.
- `boolean`: genau zwei Optionen (Richtig und Falsch) und eine korrekte ID; deren Reihenfolge wird nicht gemischt.
- `matching`: statt `options`/`correctOptionIds` ein `pairs`-Array. Jede Paar-ID bildet die korrekte Verbindung; die rechte Auswahl wird gemischt:

```json
{
  "id": "spielformen-zuordnen",
  "type": "matching",
  "prompt": "Ordne die Beispiele zu.",
  "pairs": [
    { "id": "bau", "left": "Eine Brücke bauen", "right": "Konstruktionsspiel" },
    { "id": "rolle", "left": "Eine Tierarztpraxis spielen", "right": "Rollenspiel" }
  ],
  "explanation": "Die vorherrschende Tätigkeit entscheidet über die Zuordnung."
}
```

Fragen-IDs sind innerhalb eines Quiz eindeutig, Options- und Paar-IDs innerhalb einer Frage. Rechte Zuordnungstexte müssen eindeutig sein. Fachliche Aussagen vor der Veröffentlichung prüfen und verständliche Erklärungen ergänzen. Änderungen mit `npm run check` prüfen und in beiden Modi ausprobieren.

## Karteikarten hinzufügen

In `flashcardSets` einen Datensatz ergänzen:

```json
{
  "id": "beobachtung-begriffe",
  "subjectId": "bk2",
  "learningFieldId": "bk2-lf1",
  "title": "Beobachtung und Deutung",
  "description": "Grundbegriffe für eine differenzierte Wahrnehmung.",
  "example": false,
  "cards": [
    {
      "id": "beobachtung",
      "front": "Was ist eine Beobachtung?",
      "back": "Eine möglichst konkrete Beschreibung wahrnehmbarer Handlungen oder Ereignisse."
    }
  ]
}
```

`front` ist Begriff oder Frage, `back` eine verständliche Definition oder Erklärung. Karten-IDs innerhalb des Sets eindeutig halten. Für schwierige Karten ist die zuletzt gewählte Bewertung maßgeblich; „Gewusst“ entfernt sie aus zukünftigen schwierigen Runden. Eine bereits gestartete Runde behält ihre Karten bis zum Ende. Neue Inhalte mit `example: false` werden ohne Beispielkennzeichnung dargestellt.

## Datenschutz und Sicherheit

Fortschrittsschlüssel: `lernhub:progress:v1`. Keine Cookies, Konten, Tracker, externen Lern-APIs oder personenbezogenen Daten. Hosting verarbeitet technisch notwendige Verbindungsdaten; die Informationsseite verlinkt die GitHub-Datenschutzhinweise. Fortschritte gelten für das Browserprofil und den Origin, nicht für einzelne Repository-Unterpfade. Mehrere LernHub-Installationen unter demselben Origin sollten bei Bedarf einen unterschiedlichen `STORAGE_KEY` erhalten.

localStorage ist keine verschlüsselte Ablage und keine Datensicherung. Das Löschen von Browserdaten löscht Fortschritte. Bei ungültigen Daten wird nicht automatisch überschrieben; LernHub zeigt einen Hinweis. Nach einem Speicherfehler bleibt neuer Fortschritt in der Sitzung, bis unter „Über LernHub“ ausdrücklich zurückgesetzt wird. Geöffnete Tabs reagieren auf Änderungen in anderen Tabs. Simultane Schreibvorgänge in mehreren Tabs verwenden „letzter Schreibvorgang gewinnt“; parallele Lernrunden werden in v1 nicht zusammengeführt.

Materialpfade werden durch eine enge Whitelist beschränkt; externe Materialpfade sind ausgeschlossen. Zod validiert Quellen-URLs, externe Links verwenden `noopener noreferrer`. Inhalte werden als Text gerendert, ohne `dangerouslySetInnerHTML`. Keine vertraulichen Dateien im öffentlichen Repository hinterlegen. Vor Veröffentlichung die Angaben für den tatsächlichen Betreiber ergänzen und erforderliche organisatorische Angaben abstimmen.

## Barrierefreiheit und bekannte Grenzen

Semantische Navigation und Formulare, sichtbarer Tastaturfokus, Sprunglink, Bildschirmleser-Hinweise, mobile Menünavigation mit Fokusbegrenzung und Escape sowie `prefers-reduced-motion` sind berücksichtigt. Reale Screenreader und iOS-/Android-PDF-Viewer wurden nicht vollständig geprüft. Es wird keine zertifizierte WCAG-Konformität behauptet. Die bereitgestellten Original-PDFs wurden unverändert übernommen und nicht auf PDF/UA-Konformität geprüft.

Quizstände werden erst bei Abschluss gespeichert. Ein Reload oder Verlassen verwirft die laufende Runde. Kein vollständiger Offline-Modus, kein serverseitiger Upload, kein automatischer Wiederholungsalgorithmus und keine Synchronisierung in v1. Details und geplante Erweiterungen stehen in `ROADMAP.md`.

## Qualitätsnachweise

Tests decken die exakte Antwortauswertung aller Aufgabentypen, das Mischen ohne Datenmutation, fehlerhafte Beziehungen und Antwortschlüssel, unsichere Pfade, Basispfade, Neu-Markierungen, Speicher-Roundtrips, beschädigte Daten und Speicherfehler ab. `scripts/check-materials.mjs` prüft die tatsächlichen Dateien. Den aktuellen manuellen Prüfstand dokumentiert `VALIDATION.md`.

## Klassenübersicht ERZ.1.2

Die Oberfläche ist auf die Klasse **ERZ.1.2** ausgerichtet. BK1 und BK2 bieten auf der Startseite direkten Zugriff auf alle Lernfelder. Die übrigen Fächer folgen darunter. Materialien, Quizze, Karteikarten und Prüfungstraining sind über Schnellzugriffe erreichbar. `/klasse` zeigt die Klasseninformationen und anstehende Termine; `/pruefungstraining` öffnet die Quiz-Auswahl im Prüfungsmodus.

**Klassenname, Bildungsgang, optionaler Schulname und Termine** werden in `src/data/classroom.json` gepflegt. Ein leerer Schulname wird nicht angezeigt. Das leere `events`-Array erzeugt einen sachlichen Leerzustand, keine erfundenen Termine. Beispiel eines hinzuzufügenden Termins (Datum und Angaben vorher durch tatsächliche Klassendaten ersetzen):

```json
{
  "id": "bk1-abgabe-beobachtung",
  "title": "BK1 · Beobachtungsprotokoll",
  "date": "2026-12-15",
  "kind": "Abgabe",
  "subjectId": "bk1",
  "description": "Abgabe der im Unterricht besprochenen Aufgabe."
}
```

Erlaubte Terminarten: `Klassenarbeit`, `Abgabe`, `Präsentation`, `Termin`. Fach und Beschreibung sind optional. Vergangene Termine werden ausgeblendet; maßgeblich ist das aktuelle Datum in `Europe/Berlin`. Termine werden nach Datum sortiert. Schema und Tests prüfen gültige Daten, eindeutige IDs und Fachbeziehungen.

Die Fortschrittsgrafik zeigt ausschließlich den Anteil tatsächlich als gewusst markierter Karten am vorhandenen Kartenbestand. Sie ist keine Bewertung des gesamten Unterrichtswissens. Quizversuche und schwierige Karten werden separat gezählt. Besucher können keine gemeinsamen Termine oder Beiträge schreiben; die statische Plattform benötigt weiterhin kein Backend.

## Unterrichtsmaterialien BK2 · LF1 und LF4

Die Klasse hat 41 Original-PDFs bereitgestellt: 10 Dateien für LF1 und 31 für LF4 (insgesamt 285 Seiten). Sie liegen unter `public/materials/bk2/lf1/` und `public/materials/bk2/lf4/`. Die PDFs wurden unverändert übernommen; der Katalog enthält den ursprünglichen Dateinamen, Seitenzahl, Dateigröße und SHA-256-Prüfsumme. `npm run validate:files` prüft zusätzlich Größe und Prüfsumme. Downloads verwenden den ursprünglichen Dateinamen.

Unterrichtsnummern stehen vor dem Titel. Bei gleichem Veröffentlichungsdatum und bei Titelsortierung wird numerisch sortiert (5.2 vor 5.10). Präsentationen bleiben als PDF direkt anzeigbar. Das Katalogdatum bezeichnet die Aufnahme in LernHub, nicht einen behaupteten ursprünglichen Veröffentlichungstermin.

Das vorhandene Spielformen-Beispielquiz und die Karteikarten gehören nun zu **BK2 · LF4**. Ihre IDs und die lokalen Fortschrittsschlüssel bleiben erhalten. Die zwei vorläufigen Beispiel-PDFs zu Spielformen und Beobachtung wurden durch die tatsächlichen Unterrichtsmaterialien ersetzt. Andere Beispielinhalte bleiben ausdrücklich gekennzeichnet.


## BK2 · LF2 und LF3 sowie Lerninhalte für LF1–LF4

Zusätzlich sind 19 Original-PDFs für LF2 (Beobachtung) und eine 53-seitige Unterrichtspräsentation für LF3 (Kommunikation) eingebunden. Insgesamt enthält BK2 jetzt 61 Original-PDFs mit 480 Seiten. Dateien liegen unverändert unter `public/materials/bk2/lf2/` und `public/materials/bk2/lf3/`; beide Dateien mit der Nummer 4.15 bleiben als eigenständige Materialien erhalten.

Für jedes belegte BK2-Lernfeld LF1 bis LF4 gibt es ein Gesamtquiz mit 20 Fragen und ein Lernset mit 24 Karten: **80 neue Fragen und 96 neue Karten**. Die Themen folgen den eingereichten Unterlagen. Jedes Quiz enthält Einfachauswahl, Mehrfachauswahl, Richtig/Falsch und Zuordnung; jede Frage hat eine Erklärung. Die neuen Inhalte sind Unterrichtsübungen und kein offizieller Prüfungsfragenkatalog. Vorhandene Beispielsets und deren Fortschritts-IDs bleiben erhalten.

Quizze, Lernsets sowie einzelne Fragen und Karten können über `materialIds` auf Unterrichtsmaterialien verweisen. Diese IDs müssen existieren und zum selben Fach und Lernfeld gehören; die Katalogvalidierung prüft dies. Nach dem Prüfen einer Antwort beziehungsweise Umdrehen einer Karte führt „In der Unterlage nachlesen“ zur betreffenden PDF-Detailseite. Unter dem Quiz oder Set werden sämtliche verwendeten Unterlagen verlinkt. Bei neuen Inhalten die betreffende Frage beziehungsweise Karte und die Quellenliste des Quiz oder Sets pflegen.


## BK1 · LF1 und Entfernung der Beispielmaterialien

Fünf bereitgestellte Original-PDFs (64 Seiten) zu Berufsrolle, Handlungskompetenz, Professionalisierung, Arbeitsfeldern, pädagogischem Handeln und Reflexion liegen unter `public/materials/bk1/lf1/`. Sie sind per Suche, Vorschau und Download mit Originaldateinamen erreichbar. Die Datei „Pädagogisches Handeln“ trägt intern LF2, ist nach ausdrücklicher Zuordnung der Klasse hier unter BK1 LF1 gesammelt; die PDF selbst wurde nicht verändert.

Ein Gesamtquiz mit 20 Fragen und ein Lernset mit 24 Karten ergänzen LF1. Jede Frage und Karte verweist auf die zugrunde liegende Unterrichtsdatei. Die fünf verbliebenen Beispielmaterialien aus Deutsch, Mathematik, Englisch, Religion und Sozialkunde wurden aus Katalog und Dateibestand entfernt. Diese Fächer zeigen bis zum Eingang ihrer Unterlagen einen ehrlichen Leerzustand. Bestehende BK2-Unterlagen und Lerninhalte bleiben erhalten. Die Sammlung enthält jetzt 66 Original-PDFs mit 544 Seiten.


## BK1 · LF2 Entwicklungspsychologie und gemischte Dateitypen

Die acht übergebenen ZIPs enthalten 26 Originaldateien: 15 DOCX, acht PNG-Schaubilder und drei PDFs. Sie sind unter BK1 LF2 nach acht Themenbereichen geordnet. Gleichnamige Arbeitsblätter aus verschiedenen ZIPs haben getrennte IDs und Pfade. Alle Originaldateien bleiben bytegleich und werden mit dem ursprünglichen Dateinamen heruntergeladen.

Für die 15 Word-Dateien gibt es zusätzlich PDF-Vorschauen. Ein optionales `preview`-Objekt am Material enthält den Pfad sowie Seitenzahl, Dateigröße und SHA-256. Der Download zeigt weiterhin auf `path` (Original); der Viewer und die separate Vorschau auf `preview.path`. Vorschauen können bei der Paginierung und Schriftwiedergabe von Word abweichen; bei zwei Kopien wurden überbreite Tabellen beziehungsweise Absatz-Einzüge für die Darstellung korrigiert. Die Original-DOCX-Dateien wurden nicht verändert.

PNG ist als Materialtyp unterstützt: direktes Bild, Vollbild und Öffnen in Originalgröße. Filter, Pfadvalidierung und Integritätsprüfung berücksichtigen PNG und PDF-Vorschauen. Insgesamt enthält der Katalog 92 Originalmaterialien sowie 15 zusätzliche Vorschau-PDFs.

Das neue LF2-Gesamtquiz enthält 20 Fragen mit vier Aufgabentypen; das Lernset 24 Karten. Individuelle Quellenverweise führen zu den Unterrichtsdateien. Die Lerninhalte behandeln Entwicklungsbereiche, Entwicklungsprozesse und -merkmale, individuelle Verläufe, die drei Entwicklungsfaktoren, sensible Phasen, Gegenstand/Ziele der Entwicklungspsychologie sowie evidenzinformierte Praxis. Die Unterlagen sind Unterrichtsmaterial; die Übungen dienen der fachlichen Wiederholung.

## Vorbereitete Trennung von Code und Unterrichtsmaterialien

Diese lokale Arbeitsfassung ist für ein öffentliches Code-Repository und eine separate private Materialablage vorbereitet. Sie wurde noch nicht veröffentlicht. Das Umstellen allein durch einen normalen Commit entfernt keine alten Dateien aus der öffentlichen Git-Historie.

`public/materials/` ist künftig nicht versioniert. Die private Ablage enthält den Ordner `materials/` mit denselben Unterpfaden wie im Katalog. Vor dem lokalen Start oder Produktionsbuild:

```sh
MATERIALS_SOURCE_DIR=/absoluter/pfad/zur/privaten/ablage npm run hydrate:materials
npm run validate:files
npm run build
```

Die Bereitstellung prüft alle katalogisierten Originale und PDF-Vorschauen gegen Größe und SHA-256, bevor sie Dateien ins öffentliche Build-Verzeichnis kopiert. Andere Dateien aus der privaten Ablage werden nicht übernommen.

Der vorbereitete Workflow verwendet das private Repository `jonas101201/lernhub-unterrichtsmaterialien` (überschreibbar über die Repository-Variable `MATERIALS_REPOSITORY`) und `MATERIALS_REF` für Branch oder Commit. Ein ausschließlich lesender SSH-Deploy-Key muss im privaten Repository hinterlegt sein; dessen privater Schlüssel gehört als Actions-Secret `MATERIALS_DEPLOY_KEY` ins Code-Repository. Schlüssel werden weder im Browsercode noch in Git gespeichert. Ohne eingerichteten Zugriff bricht der Produktionsworkflow ab, bevor etwas veröffentlicht wird. Pull-Request-Prüfungen kommen ohne private Materialien oder Schlüssel aus und veröffentlichen keine Website.

Die Website veröffentlicht die Materialdateien weiterhin absichtlich als lesbare Downloads. Diese Trennung verbirgt die Git-Ablage, schützt jedoch nicht die Dateien auf der öffentlichen Website vor einem direkten Abruf.

## Lernzettel für BK1 und BK2

`src/data/study-sheets.json` enthält sechs redaktionelle Lernzettel für die belegten Lernfelder BK1 LF1–2 und BK2 LF1–4. Jeder Lernzettel hat gegliederte Abschnitte mit Unterrichtsquellen, Begriffen oder Vergleichstabellen, Merksätzen, einem ausdrücklich als eigenes Übungsbeispiel bezeichneten Fall und Kontrollfragen mit aufklappbaren Antworten. Der Stand beschreibt das Erstellungsdatum, nicht einen garantierten Prüfungsumfang.

Die neue Navigation `/lernzettel` bietet Fachfilter und Volltextsuche; Detailseiten liegen unter `/lernzettel/:id`. Der Lernbereich ist zusätzlich in den Fach-/Lernfeld-Tabs, im Schnellzugriff und in der globalen Suche verfügbar. „Drucken / als PDF speichern“ verwendet den Browserdruckdialog mit einer hellen Druckansicht einschließlich Kontrollantworten und Quellenliste. Ob ein PDF-Ziel angeboten wird, bestimmt der Browser.

Lernfelder ohne Unterrichtsunterlagen bleiben als solche gekennzeichnet. Beim Ergänzen eines belegten Lernfelds wird ein zugehöriger Lernzettel mit passenden Originalquellen angelegt; `validateStudySheets` prüft eindeutige IDs, Feldzuordnung, Tabellen und Quellen aus demselben Fach und Lernfeld. Originaldateien bleiben ausschließlich in der privaten Materialablage; die Zusammenfassungen werden mit dem Anwendungscode veröffentlicht.

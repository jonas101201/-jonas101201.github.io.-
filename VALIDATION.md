# Prüfstand für Version 1.0

Geprüft am 03.11.2026. Node.js 22; Paketversionen siehe Lockfile.

## Automatisierte Prüfungen

- `npm run typecheck`: erfolgreich, TypeScript Strict Mode.
- `npm run lint`: erfolgreich.
- `npm test`: 48 Tests in drei Dateien erfolgreich.
- `npm run validate:files`: alle sieben Materialdateien vorhanden, nicht leer, passende Dateiendungen; sechs gültige PDF-Header.
- `npm run build`: erfolgreich mit portablem Basispfad und mit `VITE_BASE_PATH=/-jonas101201.github.io.-/`.
- `npm audit --omit=dev`: keine bekannten Sicherheitslücken der Laufzeitabhängigkeiten zum Prüfzeitpunkt.
- Vite meldet zwei entfernte PURE-Kommentarannotationen aus Zod. Das sind Buildhinweise ohne fehlgeschlagenen Build oder Funktionsausfall.

## Browserprüfung (Chromium in der lokalen Vorschau)

- Dashboard mit allen sieben Fächern und ehrlichem Leerzustand vor der ersten Nutzung.
- Desktopansicht bei 1440 CSS-Pixeln, Tablet bei 768, Smartphone bei 390 und 320: kein horizontaler Dokumentüberlauf auf dem Dashboard.
- Mobile Materialansicht bei 390 Pixeln ebenfalls ohne horizontalen Überlauf.
- Mobile Navigation öffnen, Fach-/Materiallinks verwenden, Navigation wieder schließen.
- Materialfilter BK1 und Lernfeld 1; leeres Lernfeld 8 ergibt verständlichen Leerzustand.
- Globale Suche „Spielformen“ liefert Material, Quiz und Lernset (drei Treffer).
- PDF-Detailseite mit korrekter iframe-Datei; PDF-Download über den Downloadlink erfolgreich.
- Vollständiger Prüfungsdurchlauf aller acht Fragen inklusive Mehrfachauswahl und Zuordnung: 8/8, 100 Prozent. Kein Zwischenfeedback im Prüfungsmodus.
- Vollständiger Lernmodus-Durchlauf mit absichtlich falschen Antworten: sofortige Rückmeldung, 2/8, 25 Prozent, sechs Fehler mit eigener und korrekter Antwort.
- Fehlerwiederholung zeigt genau sechs Fragen.
- Karteikarte per Leertaste umgedreht, „Noch üben“ und „Gewusst“ bewertet; schwieriger Filter zeigt genau die markierte Karte.
- Kartenbewertungen bleiben nach Reload erhalten, abgeschlossene Quizversuche erscheinen in den lokalen Statistiken.
- Direkter Produktionsaufruf `/-jonas101201.github.io.-/#/faecher/bk1/lernfelder/bk1-lf1` und Reload erfolgreich.
- PDF-URL im Produktionsbuild enthält den tatsächlichen Repository-Basispfad.
- Keine Anwendungsfehler oder Warnungen in der Browserkonsole während der geprüften Abläufe.
- Alle sechs Beispiel-PDFs gerendert und visuell auf lesbare Schrift, korrekte Umbrüche und fehlende Überlagerungen geprüft; Schriftarten eingebettet.

Die Browserprüfung erzeugt echte Testversuche im lokalen Profil der Vorschau; diese sind keine vorinstallierten Nutzerstatistiken und werden nicht mit dem Repository ausgeliefert.

## Noch außerhalb dieser Prüfung

- Die ursprüngliche Version wurde inzwischen auf GitHub Pages veröffentlicht; Pages ist auf GitHub Actions eingerichtet.
- Native Vollbilddarstellung und PDF-Viewer unterscheiden sich je nach Browser; separate Anzeige und Download dienen als Fallback.
- Keine umfassende Prüfung mit realen iOS-/Android-Geräten, Screenreadern oder zertifizierte WCAG-/PDF-UA-Abnahme.
- Keine Last-, Langzeit- oder Mehrgeräte-Synchronisierungstests; v1 ist eine statische lokale Lernanwendung.

## Update: Klassenoberfläche ERZ.1.2

- Startseite anhand der Designreferenz überarbeitet: BK-Kacheln mit 16 direkten Lernfeldlinks, Fachkacheln, Schnellzugriffe, lokale Fortschrittsanzeige und Terminbereich.
- Klassenname und Inhalte aus `classroom.json`; keine erfundenen Termine oder Leistungswerte. Sechs zusätzliche Tests für Konfiguration, Datumsvalidierung, Sortierung und Berliner Tagesgrenzen, insgesamt 54 Tests.
- Browsergeprüft bei 1440, 768, 390 und 320 CSS-Pixeln: keine horizontalen Überläufe auf der Übersicht. Material-, Quiz-, Karten-, Klassen- und Prüfungstrainingsseite ebenfalls bei 320 Pixeln ohne horizontalen Überlauf.
- Direkter BK2-Lernfeld-8-Link, leere Inhalte und Umschaltung der Lernbereiche geprüft.
- Prüfungstraining startet den tatsächlichen Prüfungsmodus. Klassenseite zeigt ERZ.1.2 und den ehrlichen Termin-Leerzustand.
- Mobile Navigation mit Escape geprüft; Fokus kehrt nach dem Schließen auf den Menübutton zurück. Desktop blendet mobile Bedienelemente aus.
- Keine Warnungen oder Fehler in der Browserkonsole während dieser Abläufe. Bestehende Lernfortschritte bleiben erhalten.

## Import BK2 · LF1 und LF4 (03.11.2026)

- 10 Original-PDFs aus LF1-20261103.zip und 31 aus LF4-20261102.zip, insgesamt 285 Seiten und rund 68,3 MiB.
- Dateien ohne Veränderung übernommen, SHA-256 gegen die entpackten Ausgangsdateien verglichen. Seitendaten gelesen, bildbasierte Scans zur Zuordnung gerendert.
- Originaldateiname, Dateigröße, Seitenzahl, Themen und Suchbegriffe im Katalog ergänzt.
- Datei- und Prüfsummenprüfung erfasst alle übernommenen PDFs; zusätzliche Tests sichern Anzahl, Fach-/Lernfeldzuordnung, numerische Sortierung und sichere Originaldateinamen.
- Bestehende Spielformen-Quiz- und Karten-IDs erhalten; fachliche Zuordnung nach BK2 LF4 korrigiert.
- TypeScript, Linting und alle 62 Tests erfolgreich; Produktionsbuild mit Repository-Basispfad erfolgreich.
- Browserprüfung: LF1 zeigt 10 Materialien, LF4 zeigt 31 in korrekter Reihenfolge 5.0 bis 5.30. Suche nach Spielformen funktioniert; vorhandenes Beispielquiz erscheint unter BK2 LF4.
- PDF-Detailseite verwendet den korrekten Repository-Unterpfad. Testdownload erhält den Originaldateinamen. Mobile LF4-Materialansicht bei 390 CSS-Pixeln ohne horizontalen Überlauf, keine Konsolenfehler.


## BK2 · LF2/LF3 und Lerninhalte LF1–LF4 (03.11.2026)

- 20 zusätzliche Original-PDFs (LF2: 19, LF3: 1), 195 zusätzliche Seiten; SHA-256 beim Import mit dem ZIP-Inhalt verglichen. Beide Materialien mit Nummer 4.15 erhalten eigenständige IDs.
- Unterrichtstexte extrahiert; bildbasierte Seiten zur Einordnung visuell geprüft. Inhalte der PDFs werden als Unterrichtsmaterial behandelt, nicht als Arbeitsanweisungen an die Anwendung.
- Vier neue Gesamtquizze mit je 20 Fragen aller vier Aufgabentypen und vier neue Lernsets mit je 24 Karten. Redaktionell anhand der Unterlagen erstellt, mit Erklärungen und individuellen Verweisen auf vorhandene Materialien.
- Neue Tests prüfen Lernfeldzuordnung, Vollständigkeit, Quellenintegrität und Auswertung aller 80 Lösungen. Unbekannte Quellen und Quellen aus einem anderen Lernfeld werden abgewiesen.
- TypeScript, ESLint und alle 69 Tests erfolgreich. Alle 66 Materialdateien auf Existenz, PDF-Signatur, Dateigröße und hinterlegte SHA-256-Prüfsumme geprüft. Produktionsbuild mit GitHub-Pages-Basispfad erfolgreich.
- Browser: LF2-Gesamtquiz aus Lernfeldseite geöffnet; Vierfach-Zuordnung korrekt beantwortet, Erklärung und Quellen-PDF geprüft. LF3-Karte umgedreht, Quelle geprüft, als schwierig markiert und über schwierige Karten wiederholt.
- Mobile Karteikartenansicht bei 390 CSS-Pixeln ohne horizontalen Dokumentüberlauf. Keine Konsolenwarnungen oder -fehler in der korrekt konfigurierten Produktionsvorschau.

## BK1 · LF1 und Entfernung der Beispielmaterialien (03.11.2026)

- Fünf Original-PDFs aus beiden übergebenen ZIPs, insgesamt 64 Seiten, unverändert übernommen und mit SHA-256, Originaldateinamen, Größe und Seitenzahl erfasst. Bildbasierte Mindmap und Präsentationsfolien gerendert und gelesen.
- Zuordnung aller fünf Dateien nach Nutzerangabe zu BK1 LF1; die interne LF2-Überschrift der Datei „Pädagogisches Handeln“ wird in den Metadaten erläutert.
- Neues Gesamtquiz mit 20 Fragen aller vier Aufgabentypen und ein Lernset mit 24 Karten. Jede Aufgabe verweist auf ihre Unterrichtsquelle. Schwerpunkt: Auftrag, Rollen, Kompetenzen, Haltungsdimensionen, pädagogisches Handeln, Arbeitsfelder und Reflexion.
- Alle fünf verbliebenen Beispielmaterialien aus dem Katalog und dem öffentlichen Dateibestand entfernt. Informations- und Klassenseite auf echte Unterrichtsmaterialien umgestellt.
- TypeScript, ESLint und alle 72 Tests erfolgreich; 66 Original-PDFs (544 Seiten) durch die Datei-/Integritätsprüfung erfasst; Produktionsbuild erfolgreich.
- Browser: LF1 zeigt fünf Materialien. Lernmodus gestartet, Antwort korrekt ausgewertet, Erklärung und Quellenverweis geprüft. Karte umgedreht und Rückseite geprüft; keine Konsolenwarnungen oder -fehler.


## BK1 · LF2 Entwicklungspsychologie (03.11.2026)

- Alle 26 Originaldateien aus acht ZIPs übernommen: 15 DOCX, acht PNG und drei PDF. Originalbytes mit SHA-256 gegen die ZIP-Inhalte geprüft; gleichnamige Dateien bleiben getrennt.
- Word-Texte und PDF-Inhalte extrahiert, alle acht Schaubilder visuell gelesen; 15 Word-Dateien mit dem gebündelten LibreOffice gerendert und als zusätzliche PDF-Vorschauen eingebunden. 43 Vorschauseiten kontrolliert. Zwei Vorschaukopien wegen überbreiter Tabellen beziehungsweise Absatz-Einzüge angepasst und erneut gerendert. Originale bleiben unverändert.
- PNG-Anzeige und Dateifilter sowie getrennte Vorschau-/Downloadpfade für DOCX ergänzt. Katalog- und Dateiprüfung validieren sichere Vorschaupfade, Signaturen, Größen und Prüfsummen.
- Neues Gesamtquiz mit 20 Fragen und 24 Lernkarten, jeweils mit Unterrichtsquellen. Automatisiert alle 20 Lösungen ausgewertet und Quellen-/Lernfeldbeziehungen geprüft.
- TypeScript, ESLint und 79 Tests erfolgreich. 92 Originalmaterialien und 15 PDF-Vorschauen erfolgreich geprüft. Produktionsbuild mit Repository-Unterpfad erfolgreich.
- Browser: 26 Materialien, DOCX-Filter mit 15 Ergebnissen. Word-Vorschau nutzt PDF, Originaldownload DOCX mit korrektem ursprünglichem Namen. PNG-Schaubild vollständig geladen. Neues Quizfeedback mit korrekter Quelle, Kartenrückseite und mobile Darstellung bei 390 CSS-Pixeln ohne horizontalen Überlauf geprüft. Keine Konsolenfehler oder -warnungen.

## Lokal vorbereitete private Materialablage

- Öffentliches Code-Snapshot ohne versionierte Materialdateien; bestehende Dateien bleiben für die lokale Vorschau auf dem Datenträger erhalten.
- Materialpaket mit 92 Originalen und 15 Vorschauen vollständig gegen Katalog-Prüfsummen geprüft. Kein Website-Code und keine Git-Historie enthalten.
- Neue Bereitstellung prüft alle erwarteten Dateien vor dem Kopieren. Tests prüfen ausschließlich katalogisierte Übernahme, fehlende Dateien, veränderte Bytes und unsichere Pfade.
- TypeScript, ESLint und 83 Tests erfolgreich. Der erste eingeschränkte Testlauf konnte den Test-Unterprozess wegen EPERM nicht starten; der anschließende vollständige lokale Testlauf mit erlaubten Unterprozessen war erfolgreich.
- Keine GitHub-Sichtbarkeit oder Live-Veröffentlichung geändert. Repository-Neuaufteilung und einmaliger privater Lesezugriff sind noch nicht eingerichtet.

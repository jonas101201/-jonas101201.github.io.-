# Lernzettel nach dem Aufbau von BK1 LF3

Die sechs anderen vorhandenen Sammlungen wurden mit ihren 56 Unterthemen redaktionell an BK1 LF3 angeglichen. BK1 LF3 bleibt als Datenobjekt unverändert. Für Lernfelder ohne Unterrichtsgrundlage werden keine Inhalte erfunden.

## Aufbau und Vollständigkeit

Jedes Unterthema enthält nun eine tabellarische Übersicht, ausführliche Erläuterungen, den bestehenden Praxisfall mit Einordnung und Handlung sowie einen themenspezifischen Merksatz. Die Zahl der Tabellen in den sechs Sammlungen steigt von zehn auf 56. Die bestehende Darstellung verwendet auf schmalen Bildschirmen beschriftete Karten statt zusammengedrückter Tabellenspalten. Druckansicht und Quellenzugriff bleiben erhalten.

| Sammlung | Unterthemen | Redaktionelle Schwerpunkte |
| --- | ---: | --- |
| BK1 LF1 | 6 | Auftrag und Rollen, Arbeitsfelder, sechs einzeln erklärte Kompetenzbereiche, Haltung, Verantwortung sowie Reflexionsschritte und neun Reflexionsziele |
| BK1 LF2 | 8 | Neun einzeln erklärte Entwicklungsbereiche, Prozessbegriffe, Merkmale, individuelle Unterschiede, Einflussfaktoren, sechs Beispiele sensibler Phasen und wissenschaftliche Erkenntnisse |
| BK2 LF1 | 8 | Selbstbilder, Selbstkonzept und vier Säulen, Johari-Fenster, Feedback, professionelle Haltung, Geschichte und berufliche Wege |
| BK2 LF2 | 15 | Sechs Beobachtungsfunktionen, Verhalten/Erleben, Beschreiben/Deuten/Bewerten, Hypothesen, Formen, Stichproben, Planung, Gütekriterien, fünf Fehler, Leu, acht Verfahren, fünf Lerndispositionen und Auswertung |
| BK2 LF3 | 7 | Zeichensystem, Verständigung, Zuhören, Vorbereitung, sieben einzeln erklärte Gesprächsarten, Beschwerden und Teamgespräche |
| BK2 LF4 | 12 | Sechs Spielmerkmale, Spielformen, sieben einzeln erklärte Schemata, Begleitung, Material, Wettbewerb, Schutz, Räume, sechs Schutzfaktoren, Inklusion und Planung |

## Inhaltsgrundlage

Die Überarbeitung verwendet die vorhandenen Lerntexte und die lokalen Extraktionen der bereits verknüpften Unterrichtsmaterialien. Es wurden keine zusätzlichen Internetquellen konsultiert. Ausführliche bestehende Absätze wurden in Übersichten eingeordnet; ihre fachlichen Aussagen bleiben erhalten. Der vorherige Quellenabgleich ist in `lernzettel-quellenabgleich-2026-11-16.md` dokumentiert.

Für die gezielt vervollständigten Aufzählungen sind insbesondere diese vorhandenen Materialien maßgeblich:

- `bk1-lf1-mindmap-professionalisierung`: sechs Kompetenzbereiche und berufliche Rollen.
- `bk1-lf1-reflexion-haltung-loeser`: Sehen, Urteilen, Handeln sowie neun Reflexionsziele.
- `bk1-lf2-18-sensible-phasen-informationstext`: sechs Beispiele mit zeitlicher Orientierung. Die individuelle Entwicklungszeit bleibt ausdrücklich berücksichtigt; aus den Zeitfenstern werden keine Ausschlussfristen für späteres Lernen gemacht.
- `bk2-lf4-5-0-merkmale-des-spiels`: sechs Merkmale. Die Einschränkung, dass der Als-ob-Charakter nicht für jedes Spiel gilt, steht ausdrücklich in der Übersicht.
- `bk2-lf4-5-8-spielschemata`: Verbergen, Fallenlassen, Transportieren, Verbinden, Ordnen, Untersuchen sowie Balance und Gleichgewicht.
- Die vorhandenen Abschnitte zu Selbstkonzept, Gesprächsarten und Lerngeschichten: ihre zuvor teilweise in einem Absatz zusammengefassten Begriffe werden zusätzlich einzeln erläutert.

Material-IDs, Lernfeldzuordnung, Themen-IDs und Reihenfolge bleiben erhalten. Sämtliche bestehenden Praxisfälle einschließlich ihrer Kennzeichnung bleiben unverändert. Eigene didaktische Anwendungsbeispiele bleiben als solche gekennzeichnet. Rohtexte und Unterrichtsdateien werden nicht in das öffentliche Repository übernommen.

Die ukrainische Übersetzung wurde für alle neuen Lerntexte, Tabellen und Merksätze ergänzt. Automatische Prüfungen sichern Übersetzungsabdeckung, gültige Quellenverknüpfungen und die zuvor zusammengefassten Merkmalslisten. Sie ersetzen keine pädagogische Fachfreigabe.

## Prüfung

- TypeScript und ESLint bestanden; 270 Vitest-Tests in 34 Dateien und acht Worker-Tests bestanden.
- Produktionsbuild mit dem GitHub-Pages-Basispfad und bestehendem Materials-API-Origin erfolgreich. Bestehende Bundlegrößen- und Zod-Kommentarwarnungen bleiben erhalten.
- Alle 67 Themen einschließlich der Referenz bei 390 × 844 Pixeln in Chromium geöffnet: Tabelleninhalt vollständig gerendert, keine seitliche Überbreite und keine JavaScript-Seitenfehler.
- Desktopvergleich, ukrainische Sprachumschaltung und PDF-Ausgabe geprüft.
- Sieben ausgewählte Themen zusätzlich mit WebKit in mobiler Größe geprüft; Vorschauen im hellen und dunklen Modus aufgenommen. Dies ist eine Browseremulation, keine Prüfung auf physischer iPhone-Hardware.
- Die dabei gefundene Überbreite langer deutscher Überschriften ist durch Wortumbruch und automatische Silbentrennung behoben. Die mobil ausgeblendete Tabellenkopfzeile wird zusätzlich in ihrem Layout begrenzt; die semantische Tabelle bleibt bestehen.
- Vergleich mit dem Ausgangsstand: BK1 LF3 als Datenobjekt, alle Themen-IDs, Materialverknüpfungen und Praxisfälle unverändert.

## Veröffentlichung

Die Veröffentlichung wurde am 19.11.2026 mit „Live“ ausdrücklich freigegeben. Sie erfolgt über den bestehenden GitHub-Pages-Workflow nach erfolgreicher Prüfung des Pull Requests.

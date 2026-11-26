# LernHub Progress und Blurting

## Architektur und Audit

Die App verwendet React, Vite und HashRouter. Inhaltsdaten stammen aus dem validierten Katalog und den Lernzetteln. Quizantworten werden bisher innerhalb der Sitzung ausgewertet. „Nur Fehler wiederholen“ erzeugt eine Teilmenge. Karteikarten können per Pfeiltaste übersprungen werden. Beide Wege bleiben nutzbar, eignen sich aber ohne zusätzliche Prüfung nicht als Nachweis einer vollständigen Runde. Der bestehende Lernverlauf speichert Ergebnisse und Bewertungen optional in Local Storage. Dieser Bereich wird nicht als automatische Einwilligung für die neuen Funktionen verwendet.

Die Startseite besitzt zwei nebeneinanderstehende Lernfeldkarten. Die fünf mobilen Ziele bleiben erhalten. Blurting erhält einen Zugang über Lernen, der neue Fortschrittsbereich über die vorhandene Oberfläche und Mehr. Der Zugangsschutz für Originalmaterial bleibt beim bestehenden Worker.

## Vorgehen

1. Versioniertes Archiv, getrennte Einwilligungen und atomare Aktualisierung.
2. Quellengebundenes Blurting mit getrennt dargestellter Selbsteinschätzung.
3. Qualifizierte Abschlussereignisse für vorhandene Lernmodule, regelbasierte Missionen und Wiederholung.
4. Optionale Anpassungen, Begleiter, Belohnungen und lokales Backup.
5. Integrationstests, responsive Browserprüfung und unabhängiger Review.

Die Quellen für Wissensabruf und Missionsziele stammen aus dem bestehenden Lernkatalog. Fachlicher Lernerfolg, Selbstbewertung und Teilnahme werden unterschiedlich behandelt. Das neue System speichert keine Nutzernamen, E-Mail-Adressen oder Serverkennungen.

## Fortschrittsprotokoll

- Übernommener Arbeitsstand: Quellenkatalog und mehrphasige Blurting-Oberfläche, Level- und Missionsregeln, Begleiter- und Cosmetic-Konfiguration sowie IndexedDB-Zugriff und Store waren bereits angelegt. Die Engine und mehrere Oberflächen fehlten, weshalb dieser Stand noch nicht gebaut werden konnte.
- Speicherabschnitt integriert: Der Einstellungsbereich zeigt die freiwillige Aktivierung, getrennte Textspeicherung, lokale Sicherung, Importvorschau, explizites Überschreiben und bestätigten Widerruf. Lernabschlüsse übernehmen die zum Zeitpunkt der Aktion gültige Einwilligungsgeneration. Die Browserprüfung steht bis zur vollständigen Integration aus.
- Navigationsabschnitt integriert: Fortschritt und seine Unterseiten sind über Mehr und die Seitenleiste erreichbar, freier Wissensabruf über Lernen. Die Startseitenkarte bleibt kompakt. Quizze und Karten geben Ereignisse nur bei vollständiger Bearbeitung ab, mit tatsächlicher Sitzungsdauer und separaten Kennungen für Prüfungsmodus und Lernmodus.
- Engine und Studio integriert: 50 Level, Learning Events mit eindeutigen IDs, Credits, sechs Sammlungspfade, fünf Herausforderungen, vier Missionsklassen mit Katalogreferenzen, sechs Begleiter mit je vier Stufen sowie Store, Inventar und Studio mit 50 Cosmetics. Einzelne Abschnitte sind in den Engine- und Studio-Notizen dokumentiert.
- Erster unabhängiger Review: Bestehende Missionen bleiben nach Änderungen am Katalog lesbar. Links werden gegen die aktuell verfügbaren Inhalte aufgelöst. Abschluss und Textarchivierung verhindern, dass ein ausstehender Autosave einen erledigten Entwurf wiederherstellt.
- Zweiter Review und Speicherabsicherung: Der Import und jede Änderung der Texteinwilligung wechseln die Schreibgeneration. Aktive und archivierte Antworten verwenden dieselbe Zugriffskontrolle. Abschlusskennungen verhindern, dass ein anderer Tab abgeschlossene Entwürfe erneut speichert. Die Schreiboberfläche zeigt an, ob der aktuelle Entwurf in diesem Tab bleibt.

## Implementierte Funktionen

| Bereich | Ergebnis |
| --- | --- |
| Freier Wissensabruf | 19 redaktionell aus LernHub-Lernzetteln abgeleitete Aufgaben. Schreiben mit optionalem Timer, anschließender Erwartungshorizont, lokale Begriffshinweise, vierstufige Selbsteinschätzung, Links zur gezielten Wiederholung und Vergleich mit früheren Versuchen. |
| Fortschritt | 50 Level, XP, HUB Credits, Transaktionsverlauf, Lernfeldübersicht mit getrennten Quiz- und Selbsteinschätzungsdaten, sechs Kollektionen und fünf freiwillige Herausforderungen. |
| Adaptives Lernen | Vier Missionsklassen mit echten Kataloglinks, Lernfeldziel, regelbasierten Begründungen, Pause und Fortsetzung. Wiederholungen werden anhand der Ergebnisse terminiert. |
| Personalisierung | 50 Cosmetics mit Bedingungen und Vorschauen, Wunschliste, Inventar, bestätigtem Eintausch, Studio mit unabhängigen Slots und zwölf benannten Presets sowie sechs Begleiter mit vier sichtbaren Entwicklungsstufen. |
| Datenschutz | Lokales Opt-in für Progress, separates Opt-in für Abruftexte, JSON-Export mit optionalen Texten, Vorschau und Bestätigung beim Import, Widerruf und Löschen. |

## Dateien und Datenmodell

- `src/features/progression/` enthält Konfigurationen, Bewertungslogik, Empfehlung und Missionen, das Credit-Protokoll, IndexedDB und die neuen Fortschritts-, Speicher-, Studio-, Store- und Begleiteransichten.
- `src/features/blurting/` enthält das versionierte Aufgaben- und Entwurfsmodell, Begriffserkennung, Erwartungshorizonte und die Oberfläche.
- `src/app/App.tsx`, `src/layouts/AppLayout.tsx`, `src/components/MobileDock.tsx`, `src/pages/` und `src/features/search/index.ts` verbinden die neuen Ziele mit dem bestehenden App-Rahmen. Quiz- und Karteikartenintegration befindet sich in den jeweiligen Modulen. `src/i18n/uk.json` ergänzt die ukrainischen Übersetzungen der Oberfläche.
- `tests/` und `scripts/check-progression-browser.mjs` decken Engine, Blurting, Backup, Studio und die durchgängigen Browserabläufe ab.
- IndexedDB `lernhub-learning-progress`, Version 1, enthält `progress` mit dem versionierten Zustand, der Textfreigabe und Abschlusskennungen sowie `drafts` mit Einträgen je Thema. Das versionierte Exportformat `lernhub-progress` enthält den Fortschrittszustand und auf Wunsch Textentwürfe beziehungsweise letzte Antworten. Der kleine Einwilligungsmarker im Local Storage sperrt die Daten beim Widerruf sofort, bevor IndexedDB bereinigt wird. Frühere LernHub-Einstellungen und Lernverlaufsdaten werden getrennt behandelt.

## Entscheidungen und Grenzen

- Prüfungstraining wird von der bestehenden Prüfungsvariante der Quizze erfasst. Lerninhalte ohne abschließbare Praxissimulation erhalten keinen neuen, fiktiven Abschluss. Qualifikationsgrenzen und genaue Wiederholungsvergütung stehen in den [Engine-Notizen](PROGRESS-ENGINE-NOTES.md).
- Die Bewertung des freien Abrufs bleibt manuell. Begriffstreffer werden erst im Vergleich gezeigt. Die unverbindlichen Wiederholungsempfehlungen sind von der Belohnung getrennt.
- Vorhandenes Standarddesign, fünf Dock-Ziele und die BK1/BK2-Anordnung bilden weiter die Ausgangsansicht. Store, Studio und Progress-Datenbank werden bei Bedarf geladen. Übersetzungen dynamischer fachlicher Inhalte hängen vom vorhandenen Lernkatalog ab.
- Daten und Sicherungen sind lokal veränderbar. Es gibt keine automatische Synchronisation zwischen Geräten. Eine rechtliche Prüfung der Datenschutzhinweise und Messungen auf älteren physischen Mobilgeräten sind ausstehend.

## Qualitätssicherung

- `npm run check` lief erfolgreich durch. TypeScript und ESLint waren grün, 340 Vitest-Tests in 45 Dateien und acht Worker-Tests bestanden.
- `VITE_BASE_PATH=/-jonas101201.github.io.-/ npm run build` erstellte einen Produktions-Build. Vite meldet weiterhin zwei große Hauptbundles. Der separate Progress-Store umfasst rund 19 kB gzip, die Blurting-Oberfläche rund 5 kB gzip. Eine Messung auf schwächeren physischen Geräten fand nicht statt.
- Chromium und WebKit mit iPhone-Emulation prüften freien Abruf ohne Einwilligung, Aktivierung, Gutschrift, vollständige Lernmission, Textzugriff und Schutz vor veralteten Schreibzugriffen, Export, bestätigten Import und Widerruf über zwei Tabs. Hell/Dunkel blieben beim Neuladen erhalten. Die neuen Seiten waren in beiden Prüfabläufen bei 320, 375, 390, 430, 768, 1024, 1440 und 1920 Pixeln ohne horizontalen Überlauf.
- Der unabhängige Review wurde in zwei Durchgängen durchgeführt. Die daraus abgeleiteten Korrekturen sind oben dokumentiert. Der Browser-Test prüft die zuletzt geschlossenen Speicher-Randfälle.

Die Implementierung und die Prüfdateien liegen lokal auf dem Arbeitsbranch `codex/learning-progress`. Die Produktionsseite wurde nicht veröffentlicht.

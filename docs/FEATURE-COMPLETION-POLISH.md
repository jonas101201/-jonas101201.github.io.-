# LernHub Feature Completion & Polish

Der Audit bezieht sich auf den veröffentlichten Ausgangsstand `00aa71f` und die vorhandenen Lern-, Progress- und Einstellungsrouten. Priorität haben korrekt abgeschlossene Lernabläufe, direkte Rückwege und verlässliche Rückmeldungen. Danach folgen Verbesserungen an vorhandenen Vorschauen und Bewegungen.

## Audit und Prioritäten

| Bereich | Beobachtung | Maßnahme |
| --- | --- | --- |
| Start und Weiterlernen | BK1 und BK2 bleiben direkt erreichbar. Die Einträge für Weiterlernen beruhen auf dem vorhandenen lokalen Verlauf. Der Begleiter konkurriert im Kopfbereich mit Titel und Datum und kann auf schmalen Geräten ganz verschwinden. | Begleiter in den normalen Lesefluss nach dem Wiedereinstieg setzen. Direkten Wiedereinstieg mit der bestehenden Verlaufserfassung prüfen. |
| Lernen und Fachseiten | Fach, Lernfeld und Format sind über bestehende Routen und Parameter verbunden. | Direkte Links, mobile Navigation und 16 Schnellzugriffe bei der Regression prüfen. |
| Lernzettel | Übersicht, Themen, Quellen, Druck und mathematischer Formelsatz haben getrennte Darstellungen. | Lesbarkeit, Direktaufrufe und Druckpfad prüfen. |
| Materialbibliothek und PDF | Filter und Ansicht stehen in der URL. Die geschützte Vorschau und der Originaldownload öffnen getrennt über den Worker. Ein erfolgreiches Öffnen erfordert eine berechtigte Sitzung. | In lokalen Filtern sowohl Originaltexte als auch übersetzte Titel und Beschreibungen durchsuchen. Öffentlichen Pfad und Unverfügbarkeit prüfen. Vorschau-Verhalten hinter Cloudflare Access unverändert weiterverwenden. |
| Suche | Suchseite und Palette teilen den Index. Der freie Wissensabruf ist dort als Format verlinkt, seine Aufgaben fehlen aber als Einzeltreffer. | Öffentliche Aufgaben-Metadaten im gemeinsamen Index ergänzen. Persönliche Antworten bleiben außerhalb der Suche. |
| Quiz und Prüfungstraining | Quizmodus, Prüfungsauswertung und Wiederholung teilen dieselbe Sitzung. Externe Einstiege in den Prüfungsmodus haben einen Rückweg. Direkte Prüfungslinks zeigen als Rückweg die Quizübersicht. | Den fachlich passenden Rückweg für direkte Prüfungslinks setzen und die Auswertung prüfen. |
| Karteikarten | Blättern kann Karten überspringen. Die letzte Kartenbewertung zeigt trotzdem „Lernrunde abgeschlossen“, auch wenn Bewertungen fehlen. | Offene Karten vor dem Abschluss vorlegen. Vollständige Runden belohnen wie bisher. Ergebnisfokus und leere Wiederholung verbessern. |
| Freier Wissensabruf | Abruf, Selbsteinschätzung, optionale Entwürfe und Wiederholungslinks sind vorhanden. Das Pet reagiert am Ende unabhängig von der Selbsteinschätzung. | Abschlussreaktion an die vorhandene Selbsteinschätzung anbinden. Fachfilter mit der vorhandenen URL-Filterlogik erhalten. Phasen, Freiwilligkeit und Textspeicherung separat prüfen. |
| Termine und Klasse | Bestätigte Lernzettel öffnen direkt. Bei einem Termin ohne Lernzettel erscheint ein erklärender Zwischenstand. Direkte Klicks aus Terminen verlieren den Kontext für den internen Rücklink. | Bestehenden kontextsensitiven Link nutzen. Einträge und Zuordnungen beibehalten. |
| LernHub Progress | Lokaler Fortschritt, Einwilligung, Import, Export, Löschung und Meilensteine sind vorhanden. Der Einstellungsbereich und die Lernrouten funktionieren unabhängig davon. | Bestehende Speicherung und Regeln mit der Testsuite absichern. |
| Pets | Idle-Sprite spielt einmal ab. Kombinationen mit Gesicht oder Accessoires greifen nur bei Interaktion auf Bewegung zurück. Empfehlungen stehen als Absatz über den Karten, obwohl die Empfehlung zum aktiven Pet gehört. | Charaktereigene Ruhebewegungen auch mit Accessoires. Empfehlung als Sprechblase beim aktiven Pet zeigen. Sparsam laden und reduzierte Bewegung beachten. |
| Lernmissionen | Vorhandene Empfehlungen, Fortsetzen und standardisierte Gutschriften sind verbunden. Links aus einem laufenden Missionsschritt übernehmen den Missionskontext für den internen Rücklink bisher nicht zuverlässig. | Vorhandene Kontextnavigation wiederverwenden und den Rückweg zum Missionsbereich prüfen. |
| Belohnungen und Inventar | Lernabschluss und Credit-Anzeige sind angebunden. Die Sammlung führt bei freigeschalteten Einzelstücken allgemein ins Studio. | Freigeschaltetes Stück gezielt in seiner Studio-Vorschau öffnen. Erworbene Set-Bestandteile einzeln in der Sammlung anzeigen. Besitz und Kaufregeln bleiben bei der Engine. |
| Shop | Kategorie, Suche und Seltenheit liegen teilweise nur im Komponentenzustand. Zurück, Neuladen und Rückkehr aus dem Studio können die Auswahl verlieren. | Filter mit vorhandenen Routenparametern speichern und Rücksprung in den gleichen Ausschnitt ermöglichen. |
| Studio und Personalisierung | Reale Startseitenvorschau, Begleitervorschau und Presets sind vorhanden. Der Studio-Link zum Shop kennt den Ursprung der Anprobe nicht. | Vorhandenen Rückweg aus dem Shop verwenden. Vorschau und Anwendung weiterhin trennen. |
| Themes, Sprache und Einstellungen | Dunkel, Hell, Systemdarstellung, Sprache und Begleitersichtbarkeit sind bereits speicherbar. | Browser- und Übersetzungsregression prüfen. Bewegungspräferenz an neuen Animationsstellen beachten. |
| Datenschutz und Informationen | Informationsseite, Datenschutzhinweise und allgemeine Speicherverwaltung bieten getrennte Ziele. | Routen und freiwilliges Speichern prüfen. |
| Navigation und Plattform | Hash-Routing, fünf Dock-Ziele, Fokusmodus, Sidebar und geschützte Materialien sind etabliert. | Routen, Fokus, Filter und Breakpoints prüfen. |

Änderungen an Katalogumfang, Lernökonomie, Speicherung, Zugriffsschutz, Navigation oder der geplanten KI-Integration erfordern einen eigenen Auftrag. Der geschützte PDF-Dialog mit realer Anmeldung sowie ein physischer Gerätetest bleiben eigenständige Prüfgrenzen.

## Umgesetzte Entscheidungen

- Der Begleiter steht im Weiterlernen-Bereich. Titel und Datum behalten ihren Platz, und der Begleiter bleibt auf kleinen Displays sichtbar. Sprechblase und Missionsübersicht verwenden dieselben Empfehlungen. Eine aktive Mission hat in der Sprechblase Vorrang.
- Kartenfortschritt zählt Bewertungen. Werden Karten beim Blättern übersprungen, legt die Runde sie vor dem Abschluss erneut vor. Die bestehenden Regeln für XP, Credits, Sets und Ausrüstungsbesitz gelten weiter.
- Shopfilter liegen wie Materialfilter in der URL. Studio übernimmt den bestehenden Rücksprung, auch nachdem eine Anprobe verworfen wurde. Enchanted Garden verwendet dieselbe skalierte Startseitenvorschau wie die Einzelstücke.
- Der vorhandene Suchindex erhält die öffentlichen Metadaten der Wissensabruf-Aufgaben. Materialfilter berücksichtigen ebenfalls übersetzte Titel und Beschreibungen. Zusammengesetzte Missionstitel und Bedienelemente der Set-Ansicht sind auf Deutsch und Ukrainisch verfügbar.
- Die Änderungen betreffen vorhandene Abläufe. Routen, Klassen- und Lerninhalte, Zugriffsschutz, Speicherformat, Einwilligungen und Bereitstellung bleiben im bisherigen Rahmen.

## Prüfumfang

- Automatisierte Regressionen für übersprungene Karten, Ergebnisfokus, Prüfungsrücklink und Suchtreffer für Wissensabruf.
- Browser-Audit über 22 vorhandene Routen inklusive Start, Fächer, Materialbibliothek, Lernzettel, Quiz, Karteikarten, Wissensabruf, Prüfungen, Termine, Progress, Begleiter, Shop, Studio, Speicher und Einstellungen.
- Durchgängiger Lernablauf in Chromium mit Quiz im Lern- und Prüfungsmodus, Wissensabruf mit Selbsteinschätzung, Rücksprung zum Fachfilter, Rücksprung zum Prüfungsdatum und ukrainischer Materialsuche.
- Offene Prüfungen sind die Anmeldung mit einer berechtigten Cloudflare-Access-Sitzung, die Darstellung der geschützten PDF-Inhalte im Gerätebrowser und Tests auf physischen Mobilgeräten. Die PDF-Route und der Anmeldehinweis wurden lokal geprüft. Ein umfassendes WCAG-Audit mit Screenreader und Messung aller Designkombinationen liegt außerhalb dieser Browserprüfung.
- Chromium und WebKit haben die Layoutprüfung bei 320, 375, 390, 430, 768, 1024, 1440 und 1920 px ohne horizontalen Seitenüberlauf bestanden. Die Browserabläufe decken zudem freiwillige Aktivierung und Löschung im Testprofil, Ruhebewegung beim Wechsel der Systempräferenz, Einstieg in eine Mission, Rückweg aus Lerninhalten, Shopfilter, Studio-Rücksprung und Set-Anprobe bei 320 px ab.
- Der Browserlauf prüft, dass die Ruheanimation bei reduzierter Bewegung pausiert. Beim Wechsel zur normalen Bewegung wird der passende Sprite geladen. Sichtbarkeit, bestehende Bewegungseinstellung und das Verlassen des Tabs steuern weiterhin die Animation.
- Die vorhandenen Vite-Hinweise auf große Startdateien bleiben relevant. Im Größenvergleich bewegen sich die beiden größten JavaScript-Dateien zusammen rund 3,7 kB gzip über dem Ausgangsbuild. Eine FPS-Messung auf einem realen Mobilgerät steht aus.
- TypeScript und ESLint bestanden. Alle 357 Vitest-Tests und 8 Worker-Tests bestanden. Der statische Produktionsbuild für den GitHub-Pages-Unterpfad wurde erstellt. Der Stand liegt lokal für die Freigabe vor.

## Letzte Anpassung auf der Startseite

Bei aktivem Begleiter übernimmt die Pet-Karte den Platz von Weiterlernen und bietet den bisherigen Lernlink sowie den Zugang zu Lernmissionen. Die animierte Wolkenform schwebt nach dem Einblenden weiter, während Text und Links fest stehen. Bei reduzierter Bewegung bleibt sie still. Der Wiedereinstieg und die Darstellung wurden bei 320, 390 und 1440 px geprüft.

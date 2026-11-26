# Progress Engine – Implementierungsstand

## Abgeschlossen

- Typisierte Lernabschlüsse werden im reinen Reducer `applyAction` mit dem vorhandenen Katalog geprüft. Jeder Vorgang und jede Gutschrift hat eine feste Kennung. Der Reducer erhält seine Eingabe unverändert. IndexedDB übernimmt die atomare Speicherung des Folgezustands.
- XP, 50 Level, HUB Credits, Käufe, Erfolge, Sammlungen, Herausforderungen, Wunschliste, gerätebezogene Ausstattung und zwölf lokale Presets laufen über denselben Zustandsübergang.
- Die Missionen prüfen tatsächliche Ziele und erkennen genau einen aktiven Plan. Pausieren, Fortsetzen und Abbrechen sind verfügbar. Die letzte qualifizierte Aktivität schließt den Plan automatisch ab.
- Die Analytics trennen vollständige Quiz-/Prüfungsergebnisse und Blurting-Selbsteinschätzungen. Wissenslücken werden anhand eines früher offen bewerteten und später vollständig erinnerten Konzepts erkannt. Das ist eine Selbsteinschätzung.
- Begleiter sammeln Erfahrungsmarken bei neuen, verbesserten, entsprechend zeitversetzt wiederholten oder missionsrelevanten Lernaktivitäten. Vier Stufen wirken ausschließlich visuell. Die Auswahl verändert die Reihenfolge der Missionsvorschläge.

## Entscheidungen und Prüfungen

- Vollständige Runden benötigen zwei Sekunden pro Aufgabe als Mindestdauer. Blurting benötigt zwölf Wörter, mindestens 15 Sekunden und eine Selbsteinschätzung zu jedem vorgesehenen Kernaspekt. Das ist ein lokaler Plausibilitätsfilter für Belohnungen. Schwache vollständige Quizversuche können XP und Credits erhalten.
- Das Wiederholungsintervall steigt bis 30 Tage, sofern die Überprüfung stabil ausfällt. Karteikartenrunden können ihre Selbsteinschätzung zum Wiederholungsintervall beitragen. Die Vergütung je Inhalt endet nach zwölf fälligen Wiederholungen. Nach den ersten fünf können weitere Prämien frühestens im Abstand von 30 Tagen erreicht werden. Die reguläre Wiederholung bleibt möglich. Der erzeugbare Katalogsaldo deckt die Gesamtkosten aller Cosmetics.
- Eine Verbesserung bei einer bereits vergüteten Wiederholung wird für die Statistik registriert und erhält keine zusätzliche Auszahlung. Mission, Herausforderung und Kollektion sind einmalig zahlbare Ziele mit getrennten IDs.
- Der elfteilige Engine-Testblock prüft Levelgrenzen, Wiederholungskosten, Kurs- und Aufgabenbezug, Deduplizierung, Gutschriften, Katalogsaldo, Bearbeitungszeiten, Lernlücken, Mission, Herausforderung, Begleiter und Archivkonsistenz. Ausgeführt mit `npx vitest run tests/progression-engine.test.ts --maxWorkers=1`.

## Schnittstellen für die Integration

- `engine.ts`: `State`, `Action`, `stateSchema`, `emptyState`, `applyAction`, `cosmeticAvailable` und Re-Exports für Level, Statistik und Belohnungsdaten.
- `missions.ts`: Katalogbezogene Vorschläge, Routen und Validierung der Missionsschritte.
- `analytics.ts`: Objektive und selbst eingeschätzte Resultate, Wiederholung und Challenge-Fortschritt.
- `achievementRegistry.ts`, `rules.ts`, `companions.ts`: Konfigurationen und Bewertungskriterien.

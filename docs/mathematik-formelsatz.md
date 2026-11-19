# Mathe-Lernzettel: Formeln und Rechenwege

Die sieben vorhandenen Mathe-Themen erhalten gesetzte Formeln und zwölf klar abgegrenzte Beispielrechnungen. Die Zahlen, Unterrichtsgrundlagen und Themenadressen bleiben erhalten. Es werden keine externen Fachinhalte ergänzt. Die sieben BK-Sammlungen und der Materialkatalog bleiben unverändert.

## Lesestruktur

- Allgemeine Formeln mit Bezeichnung der berechneten Größe, vor dem Einsetzen konkreter Werte.
- Pro Beispiel: Titel, gesuchte Größe, gegebene Werte, allgemeine Formel, nummerierte und benannte Rechenschritte, Ergebnis und gegebenenfalls Probe.
- Getrennte Rechnungen für beide Mittelwerte, beide Hilfspunkte sowie die Steigungen und Achsenabschnitte der zwei Geraden.
- Fachliche Erklärungen und Quellenzugriff bleiben erhalten. Die früheren Rechentabellen werden durch die Rechenblöcke ersetzt; die Begriffstabelle und die Stärkeskala bleiben Tabellen.
- Brüche haben Bruchstriche, Wurzeln überdecken den Radikanden, Mittelwerte stehen mit Überstrich, Variablen mit passenden Indizes und Hochzahlen. Fließtext und Themenübersicht verwenden denselben Formelsatz.

Die Hilfspunkte werden im Ergebniskasten wie im Unterricht auf zwei Nachkommastellen dargestellt. Die Schritte zeigen zusätzlich genauere Näherungen; die Geradenrechnung verwendet weiterhin die ungerundeten Brüche. Steigungen, Achsenabschnitte und Korrelationsbeispiele bleiben rechnerisch unverändert.

## Umsetzung

KaTeX 0.19.1 rendert lokale, redaktionell festgelegte Ausdrücke mit HTML und zugänglichem MathML. Bibliothek, CSS und Schriftdateien werden mit der Website ausgeliefert; ein externer Formeldienst wird nicht verwendet. Die Mathe-Module werden erst beim Öffnen entsprechender Inhalte geladen. BK-Seiten laden den Formelsatz nicht vorsorglich mit.

Die neuen Felder `formulas` und `calculations` werden durch das vorhandene Lernzettelschema validiert. Beschriftungen, Rechenziele und Erläuterungen sind übersetzt; die mathematische Notation bleibt bei der Sprachumschaltung identisch. Der Suchindex berücksichtigt die neuen benannten Größen und Rechenschritte. Vorhandene Unterthemen-IDs und Quellenbeziehungen bleiben erhalten.

## Prüfung

- TypeScript, ESLint, 287 Vitest-Tests in 36 Dateien und acht Worker-Tests bestanden.
- Alle gespeicherten Formeln sowie deutsch- und ukrainischsprachigen Inline-Ausdrücke mit strenger KaTeX-Validierung geprüft. Tests sichern insbesondere echte Brüche/Wurzeln, die allgemeine x-Formel vor dem Einsetzen, das negative Vorzeichen des Korrelationskoeffizienten und die nachgerechneten Koeffizienten.
- Alle sieben Themen und zwölf Rechnungen in Chromium bei 320, 390 und 1440 Pixeln ohne Seiten- oder Formelüberbreite geprüft. Alle sieben Themen zusätzlich in mobilem WebKit geprüft. Keine sichtbaren TeX-Steuerzeichen und keine JavaScript-Seitenfehler.
- Heller und dunkler Modus, Themenübersicht, Sprachumschaltung und PDF-Druckansicht geprüft. Der Formelsatz lädt beim Aufruf einer BK-Seite nicht mit.
- Eine 24-seitige PDF-Gesamtvorschau wurde erstellt. Die kompakteren Druckabstände verändern die Bildschirmdarstellung nicht.

Die Veröffentlichung wurde am 19.11.2026 mit „Live“ ausdrücklich freigegeben. Der Release betrifft nur die Website; Originalmaterialien und die Dateifreigabeliste des Workers ändern sich durch diese Darstellungsüberarbeitung nicht.

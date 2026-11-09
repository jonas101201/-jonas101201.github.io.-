# Lernzettel nach Ober- und Unterthemen

Stand: 9. November 2026. Die Struktur wurde anhand der vom Nutzer bereitgestellten sieben Seiten umfassenden Vorlage „Lernzettel_Paedagogische_Beobachtung_FINAL.pdf“ überarbeitet. Die vorherige Datei enthielt technisch keine Seiten; Grundlage ist ausschließlich die erneut hochgeladene lesbare Fassung. Die PDF wurde vollständig als Text gelesen und ihre erste Seite zusätzlich gerendert. Sie dient als Vorlage für Gliederung und Erklärungstiefe, nicht als Anweisung, sämtliche fachlichen Verkürzungen wörtlich zu übernehmen.

## Ergebnis und Orientierung

Sechs vorhandene Oberthemen ordnen 56 einzeln aufrufbare Unterthemen-Lernzettel:

| Oberthema | Lernzettel |
| --- | ---: |
| BK1 LF1 · Professionelles Handeln & eigene Haltung | 6 |
| BK1 LF2 · Grundlagen der Entwicklungspsychologie | 8 |
| BK2 LF1 · Selbstreflexion & Berufsrolle | 8 |
| BK2 LF2 · Beobachtung & Dokumentation | 15 |
| BK2 LF3 · Kommunikation & Gesprächsführung | 7 |
| BK2 LF4 · Spielpädagogik & Raumgestaltung | 12 |

Jeder Unterthemen-Lernzettel besitzt einen eigenen Begriffseinstieg, einen hervorgehobenen Kerngedanken, die bisherigen fachlichen Erklärungen und gegebenenfalls Begriffslisten bzw. Vergleichstabellen, ein eigenes Anwendungsbeispiel mit Einordnung und begründeter Handlung sowie eine Zusammenfassung. Die ausführlichen sechs bisherigen Gesamtfälle wurden den inhaltlich passenden Unterthemen zugeordnet. Die bisher erarbeiteten Themen und Quellen bleiben erhalten; die Inhalte werden nicht bloß in kürzere ungeklärte Stichpunkte zerlegt.

Die 42 Kontrollfragen wurden aus den Lernzetteldaten entfernt. Das Schema weist das alte Check-up-Format zurück. Der Lernzettel-Renderer enthält weder Fragenbereich noch Aufklapplösungen oder Drucklösungen. Eigenständige Quizze und Karteikarten in den anderen Lernbereichen bleiben erhalten.

In der Bibliothek stehen die einzelnen Lernzettel unter der Überschrift ihres Oberthemas. Die Oberthemenseite zeigt alle zugehörigen Unterthemen mit Einstieg und Lesezeit in fester Reihenfolge. Einzelansichten haben einen Rückweg zur Übersicht und Vor-/Zurücknavigation zwischen Unterthemen. Eine zusätzliche Gesamtansicht enthält alle Unterthemen des Oberthemas und kann gemeinsam gedruckt werden.

## Ergänzungen anhand der Vorlage

Bei „Pädagogische Beobachtung“ kamen sechs zuvor fehlende Unterthemen hinzu: Definition/Bedeutung mit den vier Beobachtungsschritten; Verhalten und Erleben; Hypothese, Operationalisierung und Indikatoren; freie und narrative Beobachtung; Zeit- und Ereignisstichproben; drei Beobachtungsperspektiven nach Hans Rudolf Leu. Diese Themen sind auch in der bestehenden Unterrichtspräsentation `bk2-lf2-pp-4-beobachtung` enthalten und werden auf diese katalogisierte Quelle zurückgeführt. Die hochgeladene PDF wird nicht ungefragt als neue öffentliche Originaldatei veröffentlicht.

Fachliche Einordnung bleibt bestehen: Systematische Beobachtung verringert Verzerrungen, ist aber nicht automatisch vollkommen objektiv. Freie und narrative Beobachtung sind kombinierbare Perspektiven. Indikatoren bilden nur ausgewählte Aspekte eines Begriffs ab. Ein Screening oder eine einzelne Beobachtung beweist keine Diagnose. Altersbereiche bestimmter Verfahrensversionen werden nicht ungeprüft aus einer Kurzfassung übernommen; die Auswahl richtet sich nach dem jeweiligen Manual und der konkreten Frage.

## Links, Suche und Persistenz

- Vorhandene Oberthemen-URLs `/lernzettel/:id` bleiben bestehen; sie öffnen jetzt die Themenübersicht.
- Neue Lernzettel sind unter `/lernzettel/:id/:topicId` erreichbar. Die bisherigen Abschnitts-IDs bleiben erhalten.
- `?ansicht=gesamt` öffnet die zusammenhängende Ansicht. Überschriften behalten `sheet-<topicId>` als DOM-ID.
- Die Command-Palette und Suche indexieren die neuen Unterthemen mit ihren eigenen stabilen IDs, Oberthemenbezug und deutschen sowie ukrainischen Texten. Brotkrümel enthalten den tatsächlichen Oberthemen-Link.
- „Weiterlernen“ und Suchvorschläge verwenden dieselben neuen Routen. Das bestehende v1-Verlaufsformat wird um genau eine optionale Pfadkomponente ausschließlich bei Lernzetteln erweitert; bisherige Einträge bleiben lesbar. Einwilligung, getrennte Speicherschlüssel und das Verhalten bei beschädigten/neuen Daten bleiben erhalten. Externe Pfade, Querystrings und beliebige tiefe Pfade bleiben unzulässig.

## Darstellung und Grenzen

Liquid-Glass-Flächen, Tokens, Fokusregeln und vorhandene Animationstechniken bleiben erhalten. Die Druckansicht ist hell auf A4 angelegt; in der Gesamtansicht beginnt jedes weitere Unterthema auf einer neuen Seite, Tabellenköpfe werden beim Druck wiederholt und Tabellenzeilen sowie Merkkästen möglichst zusammengehalten. Längere Inhalte dürfen über Seiten fließen, statt abgeschnitten oder auf eine Seite zusammengedrückt zu werden. Seitenzahlen und browserabhängige Druckkopfzeilen werden vom Druckdialog gesteuert, nicht als feste Seiteneinteilung versprochen.

Alle neuen Inhalts- und Oberflächenstrings wurden ukrainisch ergänzt. IDs, Quellen und Routen sind sprachunabhängig. Eine muttersprachliche Fachfreigabe oder schulische Prüfungsfreigabe liegt nicht vor.

In dieser Sitzung war kein Browser verbunden (Computer-Use-Inventur: keine Apps, keine Browser). Daher ist die neue Bildschirm- und Druckdarstellung nicht visuell abgenommen. Automatisierte DOM-Tests prüfen jede Einzelansicht, die Hierarchie, die Gesamtansicht, den Druckaufruf, Themenwechsel, Filter, die ukrainische Darstellung und Fehlerfälle. Sie ersetzen keine Sichtprüfung des endgültigen Browser-PDFs.

Materialien-API, Authentifizierung, Originalmaterialien und der Branch `feature/secure-materials-api` werden nicht verändert. Die Arbeit wird als eigener Feature-Branch mit Draft-PR bereitgestellt; kein automatischer Merge und kein Deployment.

## Prüfstand

`npm run check` bestanden: Typecheck, ESLint, 218 Vitest-Tests in 21 Dateien sowie acht Worker-Sicherheitstests. Alle 56 Einzelansichten werden gerendert und auf vollständigen Aufbau ohne Kontrollfragen geprüft. Der Produktionsbuild mit dem GitHub-Pages-Basispfad und dem bestehenden Materials-API-Origin ist erfolgreich. Nicht blockierende Buildhinweise betreffen Zod-Kommentaranmerkungen und Bundles über 500 kB (App ca. 626 kB, Einstieg einschließlich Daten/Übersetzungen ca. 841 kB unkomprimiert). `git diff --check` ist sauber.

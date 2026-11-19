# Wertetabelle und gewichtete Mittelwerte

Die Mathe-Sammlung wird auf zehn klar benannte Unterthemen gegliedert. Die bisherigen sieben Themenadressen bleiben erhalten; neu sind `wertetabelle`, `gewichtete-mittelwerte-x` und `gewichtete-mittelwerte-y`. Die ergänzte Delta-Notation wird aus den aktiven Lerntexten und Formeln entfernt.

## Quellen und Rechnungen

Die vollständige Ausgangstabelle im hochgeladenen `Protokoll 1.pdf` vom 05.01.2026 wurde nochmals in hoher Auflösung gelesen. Sie enthält 21 Wertepaare. Die x-Werte summieren sich zu 60, die y-Werte zu 85; dies stimmt mit den handschriftlich notierten Summen überein. Die drei ergänzten Spalten werden aus diesen Paaren berechnet, nicht als bereits im Scan ausgefüllte Spalten ausgegeben.

| Spalte | Berechnung pro Zeile | Summe |
| --- | --- | ---: |
| x | übernommener Ausgangswert | 60 |
| y | zugehöriger Ausgangswert | 85 |
| x² | x mit sich selbst multiplizieren | 202 |
| y² | y mit sich selbst multiplizieren | 419 |
| xy | x und y derselben Zeile multiplizieren | 229 |

Ein vollständig durchgerechnetes Beispiel zur ersten Zeile zeigt aus x = 4 und y = 3 die Werte x² = 16, y² = 9 und xy = 12. Die sichtbare Anleitung erklärt Übertragen der Paare, Berechnen der Zusatzspalten, Addieren jeder Spalte und Verwenden der Summen. Die Summenzeile zählt nicht als zusätzliche Beobachtung.

Die fünf Wertepaare des anderen Rechenbeispiels vom 13.01.2026 sind in den gelieferten Unterlagen nicht einzeln ablesbar. Deshalb wird keine vermeintliche Originaltabelle mit fünf erfundenen Paaren erzeugt. Die Gewichtungsabschnitte nutzen ausdrücklich die dort gegebenen Summen. Datensätze und Termine sind sichtbar gekennzeichnet.

| Gewichtung | Berechnete Größe | Formel | Eingesetzte Summen | Näherung |
| --- | --- | --- | --- | ---: |
| nach x | gewichteter x-Mittelwert x_x | Summe x² / Summe x | 51925 / 505 | 102,82 |
| nach x | gewichteter y-Mittelwert y_x | Summe xy / Summe x | 14175 / 505 | 28,07 |
| nach y | gewichteter x-Mittelwert x_y | Summe xy / Summe y | 14175 / 145 | 97,76 |
| nach y | gewichteter y-Mittelwert y_y | Summe y² / Summe y | 4475 / 145 | 30,86 |

Die Unterschiede zum arithmetischen Mittelwert und die Rolle der Gewichte werden ausdrücklich erklärt. Die vier Werte sind direkt unter den gesuchten Namen auffindbar und werden nicht mehr nur als Koordinaten von Hilfspunkten bezeichnet. Die zugehörigen Punkte und die bestehenden Geradenrechnungen bleiben erhalten. Für die Weiterrechnung werden die ungerundeten Brüche verwendet.

## Übersicht und Darstellung

- Kompakte Themenübersicht mit zehn direkten Links statt langer Einleitungstexte auf jeder Karte.
- Allgemeine Formeln bleiben direkt an den Rechnungen sichtbar. Die zusätzliche, wiederholte Formelsammlung ist eine aufklappbare Nachschlagehilfe.
- Ergänzende lange Erklärungen sind einzeln aufklappbar; in der Gesamtansicht für das PDF sind sie geöffnet. Der Tabellenaufbau ist als Kerninhalt immer sichtbar.
- Die neue Zahlentabelle behält auf kleinen Bildschirmen ihre fünf nebeneinanderliegenden Spalten. Sie zerfällt nicht in 21 lange Karten. Kopfzeile und hervorgehobene Summenzeile bleiben erkennbar.
- Doppelte Merksätze und unnötige Abstände werden reduziert; Quellen und fachliche Erläuterungen bleiben zugänglich.
- Neue Lerntexte, Bezeichnungen und Tabellenbeschriftungen sind ins Ukrainische übersetzt. Bisherige BK-Lernzettel, Materialdateien und Materialkatalog bleiben unverändert.

## Prüfung

TypeScript, ESLint, 294 Vitest-Tests und acht Worker-Tests bestanden. Zusätzliche Tests sichern alle 21 Zeilen, jedes Quadrat und Produkt, die fünf Spaltensummen, alle vier Gewichtungsformeln, die Suchbarkeit und das Entfernen der Delta-Notation in beiden Sprachen. Der Produktionsbuild verwendet weiterhin den GitHub-Pages-Unterpfad und den bestehenden Materials-API-Origin.

Alle zehn Themen und 15 Beispielrechnungen wurden bei 320, 390 und 1440 Pixeln in Chromium ohne Seiten- oder Formelüberbreite geprüft. Die Zahlentabelle behält dabei ihre sichtbare Kopfzeile, fünf Tabellenspalten und Summenzeile. Vier Schwerpunktseiten wurden zusätzlich in mobilem WebKit geprüft; die ukrainische Sprachumschaltung und die PDF-Gesamtansicht funktionieren. Es traten keine JavaScript-Seitenfehler auf. Die ursprünglichen sieben BK-Sammlungen und alle alten Mathe-Themenadressen bleiben erhalten.

Diese Überarbeitung wird nach Freigabe zusammen mit BK2 LF4 veröffentlicht. Der Release betrifft nur die Website; die privaten Originaldateien und die Dateifreigabeliste des Workers ändern sich nicht.

# Mathematik: Regression und Korrelation

## Unterrichtsgrundlage

Der neue Lernzettel `mathematik-regression` beruht auf drei hochgeladenen Original-PDFs und zwei zusätzlich mitgesendeten Bildern. Es wurden keine externen Lehrtexte oder Internetquellen ergänzt. Enthalten sind sieben Unterthemen: Streudiagramm, Mittelwerte/Schwerpunkt, Geraden aufstellen, Geraden zeichnen, y berechnen, nach x auflösen und Korrelationskoeffizient.

| Grundlage | Datum im Protokoll | Inhalt | Ablage |
| --- | --- | --- | --- |
| Protokoll 1.pdf | 05.01.2026 | Wertepaare, Streudiagramm, Mittelwerte, grafisch geschätzte Gerade | Unverändertes Original-PDF, zwei Seiten |
| Zusätzliches Bild | 13.01.2026 | Summen, Hilfspunkte und zwei Geraden aufstellen | Eigene, ausdrücklich gekennzeichnete Textabschrift mit separater Rechenprüfung |
| Protokoll 3.1.pdf | 19.01.2026 | Zwei Regressionsgeraden zeichnen | Unverändertes Original-PDF, eine Seite |
| Protokoll 3.2.pdf | 20.01.2026 | Einsetzen und Umstellen | Unverändertes Original-PDF, eine Seite |
| Zusätzliches Bild | 09.02.2026 | Richtung und Stärke, Steigungsverhältnis und Korrelationskoeffizient | Eigene, ausdrücklich gekennzeichnete Textabschrift mit separater Rechenprüfung |

Die PDFs werden bytegleich übernommen, einschließlich der zweiten, weitgehend leeren Seite von Protokoll 1. Die Textabschriften sind keine vermeintlichen Originaldateien. Die handschriftlichen Namen werden nicht in öffentliche Metadaten oder Lerntexte übernommen. Im privaten Manifest werden drei weitere Originale und zwei abgeleitete Dateien separat gezählt.

## Nachrechnungen und redaktionelle Entscheidungen

- 05.01.: Die angegebenen Summen liefern 60/21 ≈ 2,857 und 85/21 ≈ 4,048. Die grafisch geschätzte Gerade y ≈ −2x + 9,5 wird ausdrücklich als Annäherung behandelt, nicht als exakt aus diesen Summen berechnete Regression.
- 13.01.: n = 5, Σx = 505, Σy = 145, Σx² = 51925, Σy² = 4475, Σxy = 14175 ergeben P = (101 | 29). Die ungerundeten Hilfspunkte liefern mₓ ≈ −0,510869565, bₓ ≈ 80,597826087 sowie mᵧ ≈ −0,574468085, bᵧ ≈ 87,021276596. Mit früh auf −0,51 und −0,57 gerundeten Steigungen ergeben sich dagegen b = 80,51 und 86,57. Beide Rechenwege werden unterschieden und nicht vermischt. Das fehlerhafte Vorzeichen/Produkt beim Bestimmen des zweiten Achsenabschnitts wird nicht übernommen.
- 19.01.: Die Gleichungen mit Achsenabschnitten 9,21 und 9,72 bleiben von den Beispielen des nächsten Tages getrennt. Bei x = 5,5 erhält man 4,865 beziehungsweise 4,88. Die Schwerpunktangabe wird deshalb nicht als exakter gemeinsamer Punkt beider bereits gerundeter Gleichungen ausgegeben.
- 20.01.: Das Ergebnis 1,3 ist nur mit der negativen Steigung −0,79 vereinbar, die auch im Zeichenbeispiel vorkommt. Die saubere Rechnung lautet −0,79·10 + 9,23 = 1,33 ≈ 1,3. Das im handschriftlichen Einsetzschritt fehlende Minus wird berichtigt. Aus 6 = −0,84x + 9,5 folgt x = 25/6 ≈ 4,17; der offene Rechenschritt wird vollständig gelöst und geprüft.
- 09.02.: Der Koeffizient r liegt zwischen −1 und +1, sein Betrag zwischen 0 und 1. Die Stärkeskala wird auf den Betrag angewendet. Das lesbare Beispiel −√((−0,38)/(−0,42)) ≈ −0,95 wird nachgerechnet. Die zweite handschriftliche Rechnung ist für eine sichere Abschrift nicht eindeutig genug und wird nicht als Musterlösung übernommen. Die Quotientenformel wird nur für die beiden zusammengehörigen Geraden in der hier verwendeten Darstellung y = m·x + b erklärt; ein x-auf-y-Koeffizient darf nicht unverändert eingesetzt werden.
- Die überlappenden Intervallgrenzen der handschriftlichen Stärkeskala werden ausdrücklich mit einer einheitlichen Konvention versehen: Der obere Grenzwert gehört noch zur vorherigen Stufe. Diese Zuordnung wird als verwendete Unterrichtsskala, nicht als universelle Norm dargestellt.

Alle durchgerechneten Beispiele verwenden Zahlen der jeweiligen Unterrichtsgrundlage. Zusätzliche Zahlen entstehen ausschließlich durch die erläuterten Rechnungen und Gegenproben. Bestehende BK-Lernzettel bleiben als Datenobjekte unverändert. Neue Lerntexte und Metadaten sind vollständig ins Ukrainische übersetzt; Original-PDFs und Abschriften bleiben deutsch.

## Technische Integration

Mathematik erhält kein künstliches BK-Lernfeld. Lernzettel können jetzt direkt einem gültigen Fach zugeordnet sein. BK1/BK2 verlangen weiterhin ein gültiges Lernfeld. Quellenprüfung und Eindeutigkeit erfolgen pro Fach/Lernfeld-Kombination; fremde und unbekannte Quellen werden weiterhin abgewiesen. Die Fachansicht, Lernzettelübersicht, Suche, Brotkrumen, Einzelthemen und Druckansicht unterstützen diese Zuordnung.

Die fünf Materialdateien liegen unter `materials/mathematik/` ausschließlich in der privaten Materialablage. Der öffentliche Katalog enthält nur Metadaten, Bytegrößen und SHA-256. Temporäre Kopien zur Dateiprüfung werden vor dem finalen Build aus `public/` entfernt.

## Prüfung

- TypeScript, ESLint, 283 Vitest-Tests in 35 Dateien sowie acht Worker-Tests bestanden.
- Der Produktionsbuild mit GitHub-Pages-Unterpfad und bestehendem Materials-API-Origin ist erfolgreich. Die bestehenden Bundlegrößen- und Zod-Kommentarwarnungen bleiben erhalten.
- Drei Original-PDFs bytegleich mit den Uploads verglichen; alle fünf privaten Dateien anhand von Größe und SHA-256 mit dem Katalog abgeglichen. Keine der fünf Dateien liegt im öffentlichen Build.
- Alle sieben Mathe-Themen bei 390 × 844 Pixeln in Chromium und WebKit ohne seitliche Überbreite geprüft. Mathe-Materialansicht mit fünf Karten, Navigation zum Lernzettel, ukrainische Sprachumschaltung und Desktopansicht geprüft; keine JavaScript-Seitenfehler.
- Eine lesbare 14-seitige PDF-Gesamtansicht erstellt. Ein dabei gefundener bestehender Druckfehler ist behoben: Die mobile Navigationsüberlagerung und die Brotkrumen werden beim Drucken ausgeblendet. Die Bildschirmdarstellung bleibt davon unberührt.
- Alle sieben bisherigen BK-Lernzettel als Datenobjekte unverändert. Neue Tests prüfen fachliche Zuordnung ohne künstliches Lernfeld, Quellenbindung, Navigation, Suche und die anhand der Summen nachgerechneten Steigungen und Achsenabschnitte.
- Der produktive Download der neuen privaten Dateien wird erst mit der gemeinsamen Veröffentlichung von Materialrepository und aktualisiertem Worker verfügbar. Ein realer Access-Login wird durch diese lokale Browserprüfung nicht ersetzt.

## Veröffentlichung

Die gemeinsame Veröffentlichung von Lernzettel, Materialien und Materials-Worker wurde am 19.11.2026 mit „Live“ ausdrücklich freigegeben.

Bei einer späteren Freigabe müssen die drei Teile gemeinsam bereitgestellt werden: zuerst die fünf Dateien und das Manifest im privaten Materialrepository, dann der Materials-Worker mit dem aktualisierten Katalog als Dateifreigabeliste und schließlich die Website. Der Worker importiert den Katalog beim Build; eine reine Pages-Veröffentlichung würde die neuen Dateien noch nicht freigeben. Bestehende Access-Regeln und Geheimnisse bleiben erhalten. Die privaten Dateibytes dürfen nicht im öffentlichen Pages-Artefakt liegen.

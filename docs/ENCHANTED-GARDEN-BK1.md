# Enchanted Garden · BK1-Materialreferenz

Der neue Lack ist auf die vorhandene BK1-Karte der Startseite beschränkt. Ein Datenattribut identifiziert die Karte. Die Komponente, ihr Inhalt, das Raster, die Höhe und die Bedienelemente bleiben bestehen. Andere separat ausrüstbare Cosmetics behalten ihre Signatur. Die vorläufige globale Umfärbung durch Living Garden wurde entfernt.

Die Dämmerungsvariante verwendet Waldgrün, Salbei und cremefarbene Schrift. Die Morgenvariante hat eine warme Tonbasis, salbeifarbene Lernfeld-Kacheln und dunkle Schrift. Die Oberfläche trägt eine matte Körnung und innere Tonkanten. Die transparente Efeuranke liegt am Kartenrand, wirft einen kurzen Schatten und nimmt keinen Zeigerkontakt an. Fokus und Presszustand bleiben sichtbar. Im erzwungenen Kontrastmodus erhält die Karte die reguläre Darstellung.

## Asset-Spezifikation

`public/worlds/garden-bk1-ivy.webp` ist ein transparentes Clay-Relief. Die Lichtquelle liegt links oben, die Perspektive ist frontnah mit leichter Tiefe. Der Efeu bündelt Blätter, Knospen, Moos und kleine Pilze in einer schmalen Ecke. Für eine spätere Freigabe des restlichen Skins wären getrennte Asset-Ebenen für Wurzeln, Ranken, Moos, einzelne Blätter und Knospen erforderlich. Damit lassen sich komponentenspezifische Ränder und individuell animierte Elemente erstellen. Expansion und Freischaltsequenz bleiben bis zur Freigabe der BK1-Referenz offen.

## Prüfung

`scripts/check-garden-clay-browser.mjs` testet den vorhandenen Set-Kauf, das Ausrüsten nur des Materialslots und das Zurücksetzen. Der Vergleich erfasst BK1 und BK2, beide Überschriften, alle 16 Lernfelder, Weiterlernen, Header und Dock sowie Position, Maße, Schriftgrößen, Padding und Margins. Die Vergleichsbilder liegen unter `/workspace/output/garden-bk1/`.

Der unabhängige visuelle Review bestätigte Lesbarkeit, die leere Dekorationszone oben rechts und das Erscheinungsbild der unveränderten BK2-Karte. Als Folgemaßnahme wurden die zwei andersfarbigen Lernfeld-Kacheln entfernt, damit Farbe keine Auswahl suggeriert. Es gab keine Veröffentlichung.

Chromium und WebKit bestanden jeweils den Geometrie- und Rücksetztest bei 320, 390 und 1.440 px in beiden Farbmodi. WebKit lief auf dem Prüfhost, nicht auf einem physischen iPhone. Der neue Efeu-Download ist rund 26 kB groß.

## Erweiterung nach Freigabe der BK1-Referenz

Das freigegebene Living-Clay-Material nutzt die vorhandenen Clay-Tokens jetzt auf der gesamten Oberfläche. Karten, Eingaben, Navigation und textintensive Inhalte erhalten passende Farben und Kontaktschatten. Großes Relief bleibt auf BK1 und BK2 begrenzt. BK2 verwendet eine zweite Komposition unten rechts. Individuell ausgerüstete Akzente behalten Vorrang, und die neue Palette wird im erzwungenen Kontrastmodus nicht angewendet.

Die bestehende Shop-Enthüllung zeigt warme Lichtimpulse, den Waldboden, das Wurzel- und Moosrelief, die von oben freigelegte Efeuranke und abschließend Glühwürmchen. Sie lässt sich jederzeit schließen. Bei reduzierter Bewegung bleibt die Komposition statisch. Die Sequenz animiert die vorhandenen Reliefbilder in getrennten Ebenen. Blätter und Blüten innerhalb eines einzelnen Reliefbilds bewegen sich dabei gemeinsam.

Die aktualisierten Ansichten liegen unter `/workspace/output/garden-full/`. Der Browservergleich prüft nun, dass auch BK2 das Material erhält und anschließend beim Zurücksetzen wieder die Standardoberfläche zeigt. Es gab keine Veröffentlichung.

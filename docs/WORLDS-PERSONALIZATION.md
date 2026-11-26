# LernHub — Worlds & Personalization Update

## Referenzstand

| Phase | Stand |
| --- | --- |
| 1 · Audit | Shop, Studio, Progression, Missionen, AppLayout, Dock, lokale Speicherung und Clay-CSS bleiben die Grundlage. Die offizielle Preisannahme wurde mit dem vorhandenen Katalog verglichen. |
| 2 · Navigation | Start, Lernen, Suche, Termine und Shop im mobilen Dock. Das Zahnrad öffnet ein natives Dialogmenü als Sheet auf kleinen Bildschirmen. Persönliche und organisatorische Links wurden übernommen. Bestehende Routen bleiben gültig. Die Desktop-Seitenleiste gruppiert Shop und Personalisierung separat. |
| 3 · Architektur | Erweiterte Cosmetic Registry, sechs einzeln ausrüstbare Slots, atomarer Kauf über die bestehende Engine, temporärer Anprobezustand im Shop. |
| 4 · Referenzen | Enchanted Garden mit generiertem Clay-Hero, transparentem botanischem Relief, Gerätevarianten und sechs Katalogbestandteilen. Pflanziska mit transparentem Portrait nach dem Foto, eigener BK1-LF3-Mission und lokalen Entwicklungsstufen. Beide benötigen weitere Arbeit und visuelle Abnahme. |
| 5 · Shop | Entdecken, Premium-Sets, Einzelstücke und Begleiter. Sammlung, Wunschliste, Detailansicht, Kaufbestätigung, Anprobe, Ausrüstung und überspringbare Enthüllung. Die Detailansicht besitzt einen kompatiblen Hash-Deep-Link. |
| 6 · Studio | Oberflächen-, Begleiter- und Preset-Bereiche. Vorschau mit zwei parallelen BK-Karten, 16 Lernfeldern, Weiterlernen, Header und fünfteiligem Dock. Bestehende Presets lassen sich umbenennen, anwenden und löschen. |
| 7 · Premium-Kollektion | Sweet Atelier, Ocean Sanctuary, Little Universe, Sakura Sanctuary, Royal Heritage, Dreamscape und Crystal Sanctuary bleiben bis zur bestandenen Referenzprüfung aus dem Shop. |
| 8 · Einzelstücke und Begleiter | Bestehende Einzelstücke sind weiterhin erhältlich. Store-Karten erhalten je nach Kategorie eigene visuelle Muster. Die bestehenden Hintergrundvarianten nutzen eigenständige CSS-Kompositionen. Die umfassende Accessoire- und Begleiterüberarbeitung steht aus. |
| 9 · Bewegung | Botanischer Reveal mit drei gestaffelten Ebenen, Glühwürmchen und sanfter Pflanziska-Bewegung. Die Enthüllung lässt sich schließen und erscheint bei System-Reduced-Motion statisch. Die drei globalen Animationsstufen und weitere individuelle Choreografien stehen aus. |
| 10 · Qualität | Unabhängiger technischer und visueller Review durchgeführt. Der visuelle Review hat die Serienproduktion zurückgestellt. Der Shop-Kopf wurde daraufhin gekürzt. Die Vorschau erhielt ein botanisches Relief, eine passende Krone, einen fünfteiligen Dock und eine kompaktere Darstellung. |

## Dateien und Speichervertrag

Navigation steckt in `src/components/{MobileDock,LernHubMenu}.tsx`, `src/layouts/AppLayout.tsx`, `src/styles/clay-design.css` und `src/utils/navigation.ts`. Der Shop, die Darstellung und der Datenvertrag werden unter `src/features/progression/` erweitert. Die vier WebP-Dateien in `public/worlds/` werden lokal ausgeliefert. Die üblichen Lernseiten laden die neuen Bilddateien nur bei ausgerüsteten einschlägigen Cosmetics.

Formatversion 1 bleibt bestehen. Die vollständige Set-Besitzliste und der Ausgabeneintrag werden im selben IndexedDB-Schreibvorgang aktualisiert. Der Import prüft den zusammenhängenden Besitz und die Buchung. Historische Käufe werden bei einer späteren Preisänderung anhand ihrer damaligen Buchung ausgewertet. Alte freigeschaltete Gegenstände und Presets bleiben gespeichert. Ein Rückwechsel auf den alten App-Code wurde für neu ausgerüstete Welt-Slots und Pflanziska nicht als datenkompatibel bestätigt.

Enchanted Garden verwendet einen Preis von 3.600 Credits. Lernprämien und die Regeln für Wiederholungen bleiben unverändert. [Berechnung und Kataloggrenzen](WORLDS-ECONOMY.md)

## Grenzen der Referenzen

Kein Weltbestandteil wird als finale 3D-Produktion bezeichnet. Die Raster-Assets sind generierte Clay-Artworks. Für Enchanted Garden fehlen insbesondere unabhängig animierbare Vordergrund-Assets, eine vollständige Reliefintegration in alle geeigneten UI-Oberflächen und ein eigenständiger botanischer Übergang auf Lernabschlussflächen. Pflanziskas bewegliche Teil-Layer für Blätter, Papieranhänger und Augen sowie vollständig eigenständige Entwicklungsformen und zusätzliche Übertöpfe stehen noch aus. Die Produktionsseite wurde nicht geändert.

## Prüfung

Der vollständige lokale Check lief mit 346 Vitest- und acht Worker-Tests durch. Der GitHub-Pages-Build bestätigte die Asset-Pfade unter dem bestehenden Basispfad und behielt die bisherigen Warnungen zu großen Hauptbundles. Die neuen WebP-Dateien belegen zusammen rund 272 kB. Es wurde keine Bildrate auf physischen Smartphones gemessen.

Chromium prüfte Navigation, Anprobe, Ausstattungsisolation und horizontale Überläufe bei 320, 375, 390, 430, 768, 1024, 1440 und 1920 px. WebKit prüfte die neue Navigation bei 320 und 390 px in iPhone-Emulation. Shop und Anprobe wurden visuell in Dark und Light angesehen. Die Referenz wurde auch nach der zweiten Prüfung nicht für Serienproduktion freigegeben. Als direkte Folgemaßnahme ersetzt ein vektorbasierter Trieb mit sechs nacheinander wachsenden Blättern den gepunkteten Fortschrittsbalken in der Anprobe und der Fortschrittsansicht.

Screenshots liegen in `/workspace/output/worlds/`. Die Produktionsseite wurde nicht geändert.

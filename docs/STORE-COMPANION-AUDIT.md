# Store und Begleiter · Bestandsaufnahme

Der lokale Arbeitsstand enthält 52 Einzelstücke und sechs gemeinsam kaufbare Bestandteile von Enchanted Garden. Die anderen sieben vorgeschlagenen Sets sind im Katalog nicht implementiert. Die zuletzt gestalteten Artikelmotive wurden im Browser auf visuelle Unterschiede geprüft. Shop, Studio und Begleiterübersicht verwenden die vorhandene gemeinsame 2D-Darstellung. Die Renderer bekommen ausgerüstete IDs aus dem lokalen Fortschrittszustand. Der Set-Kauf schreibt Besitz und Abbuchung in dieselbe IndexedDB-Transaktion. Für das Audit wurden keine Käufe auf der Produktionsseite ausgeführt.

Die sechs älteren Begleiter bestehen aus individuell geformten SVG-Silhouetten mit denselben Gesichts- und Zubehörankern. Pflanziska ist ein eigenes Rasterbild. Entwicklungsstufen verwenden derzeit überwiegend zusätzliche Ringe, Kristalle, Kronen und visuelle Ebenen. Belohnung und Berechtigung kommen aus bestehenden Lernereignissen. Die Freischaltungen und Preise übernehmen wir unverändert.

## Einzelbestand vor der Begleiter-Integration

| Name und ID | Kategorie | Seltenheit | Preis oder Bedingung | Grafik | Einsatzort | Umsetzung und Grenzen |
| --- | --- | --- | --- | --- | --- | --- |
| Living Garden · `garden-clay` | Glasmaterial | Legendär | world: enchanted-garden | CSS-Textur und Clay-Tokens | App-Karten, Vorschau | Funktional, Materialtest in App und Vorschau. |
| Enchanted Forest · `garden-forest` | Hintergrund | Legendär | world: enchanted-garden | Wald-WebP | App-Hintergrund, Vorschau | Funktional, zwei Welten nutzen verwandte Weltraummotive. |
| Botanische Blütenkrone · `garden-flower-crown` | Krone | Legendär | world: enchanted-garden | 2D-Vektor bzw. CSS | Begleiterfigur und Studio | Teilweise. Raster-Pflanziska unterstützt allein den Garden-Blütenschmuck. |
| Wachsender Trieb · `garden-growth` | Fortschrittsbalken | Legendär | world: enchanted-garden | Native Progress-Elemente oder GardenStem | Fortschritt, Studio | Funktional. GardenStem nur in entsprechend vorgesehenen Ansichten. |
| Glühwürmchen · `garden-fireflies` | Umgebungseffekt | Legendär | world: enchanted-garden | CSS-Lichtpunkte | Garden-Hintergrund, Studio | Funktional. Keine Canvas- oder 3D-Partikel. |
| Erste Blüte · `garden-bloom` | Abschlussanimation | Legendär | world: enchanted-garden | CSS-Keyframes | Lernabschluss, Studio | Funktional, keine separaten animierten Modelle. |
| Aurora · `aurora` | Hintergrund | Gewöhnlich | 160 Credits | CSS-Komposition oder Wald-WebP | App-Hintergrund, Vorschau | Funktional, zwei Welten nutzen verwandte Weltraummotive. |
| Nebula · `nebula` | Hintergrund | Selten | 550 Credits | CSS-Komposition oder Wald-WebP | App-Hintergrund, Vorschau | Funktional, zwei Welten nutzen verwandte Weltraummotive. |
| Deep Space · `deep-space` | Hintergrund | Selten | ab Level 10 | CSS-Komposition oder Wald-WebP | App-Hintergrund, Vorschau | Funktional, zwei Welten nutzen verwandte Weltraummotive. |
| Solar Flare · `solar-flare` | Hintergrund | Episch | 1200 Credits | CSS-Komposition oder Wald-WebP | App-Hintergrund, Vorschau | Funktional, zwei Welten nutzen verwandte Weltraummotive. |
| Oceanic · `oceanic` | Hintergrund | Gewöhnlich | 230 Credits | CSS-Komposition oder Wald-WebP | App-Hintergrund, Vorschau | Funktional, zwei Welten nutzen verwandte Weltraummotive. |
| Glacier · `glacier` | Hintergrund | Episch | ab Level 20 | CSS-Komposition oder Wald-WebP | App-Hintergrund, Vorschau | Funktional, zwei Welten nutzen verwandte Weltraummotive. |
| Event Horizon · `event-horizon` | Hintergrund | Legendär | 3200 Credits | CSS-Komposition oder Wald-WebP | App-Hintergrund, Vorschau | Funktional, zwei Welten nutzen verwandte Weltraummotive. |
| Crystal · `crystal-glass` | Glasmaterial | Gewöhnlich | 200 Credits | CSS-Textur und Clay-Tokens | App-Karten, Vorschau | Funktional, Materialtest in App und Vorschau. |
| Frosted Glass · `frosted-glass` | Glasmaterial | Selten | ab Level 5 | CSS-Textur und Clay-Tokens | App-Karten, Vorschau | Funktional, Materialtest in App und Vorschau. |
| Obsidian · `obsidian-glass` | Glasmaterial | Episch | 1100 Credits | CSS-Textur und Clay-Tokens | App-Karten, Vorschau | Funktional, Materialtest in App und Vorschau. |
| Champagne · `champagne-glass` | Glasmaterial | Selten | 680 Credits | CSS-Textur und Clay-Tokens | App-Karten, Vorschau | Funktional, Materialtest in App und Vorschau. |
| Emerald · `emerald-glass` | Glasmaterial | Episch | 1450 Credits | CSS-Textur und Clay-Tokens | App-Karten, Vorschau | Funktional, Materialtest in App und Vorschau. |
| Prismatic · `prismatic-glass` | Glasmaterial | Mythisch | collection: memory | CSS-Textur und Clay-Tokens | App-Karten, Vorschau | Funktional, Materialtest in App und Vorschau. |
| Iris · `accent-iris` | Akzentfarbe | Gewöhnlich | 120 Credits | CSS-Farben und Schattentokens | Dock, Fokus, Auswahl | Funktional, Formmotive im Shop sind Illustrationen. |
| Mint · `accent-mint` | Akzentfarbe | Selten | 430 Credits | CSS-Farben und Schattentokens | Dock, Fokus, Auswahl | Funktional, Formmotive im Shop sind Illustrationen. |
| Amber · `accent-amber` | Akzentfarbe | Episch | ab Level 15 | CSS-Farben und Schattentokens | Dock, Fokus, Auswahl | Funktional, Formmotive im Shop sind Illustrationen. |
| Airline · `icons-line` | Icon-Paket | Gewöhnlich | 100 Credits | Lucide und CSS | Sidebar, Dock, Header, Breadcrumbs | Funktional, Unterschiede bewusst auf Kontur und Licht begrenzt. |
| Signal · `icons-bold` | Icon-Paket | Selten | 440 Credits | Lucide und CSS | Sidebar, Dock, Header, Breadcrumbs | Funktional, Unterschiede bewusst auf Kontur und Licht begrenzt. |
| Precision · `icons-cut` | Icon-Paket | Selten | ab Level 30 | Lucide und CSS | Sidebar, Dock, Header, Breadcrumbs | Funktional, Unterschiede bewusst auf Kontur und Licht begrenzt. |
| Radiant · `icons-radiant` | Icon-Paket | Legendär | 3400 Credits | Lucide und CSS | Sidebar, Dock, Header, Breadcrumbs | Funktional, Unterschiede bewusst auf Kontur und Licht begrenzt. |
| Chrome · `logo-chrome` | LernHub-Logo | Gewöhnlich | 240 Credits | Buchzeichen-PNG mit Filter, Herbarium als WebP | Header, Sidebar, Studio | Funktional. Chrome, Obsidian, Holographic und Gold teilen das Buchzeichen. |
| Obsidian · `logo-obsidian` | LernHub-Logo | Selten | 610 Credits | Buchzeichen-PNG mit Filter, Herbarium als WebP | Header, Sidebar, Studio | Funktional. Chrome, Obsidian, Holographic und Gold teilen das Buchzeichen. |
| Holographic · `logo-holographic` | LernHub-Logo | Episch | 1600 Credits | Buchzeichen-PNG mit Filter, Herbarium als WebP | Header, Sidebar, Studio | Funktional. Chrome, Obsidian, Holographic und Gold teilen das Buchzeichen. |
| Herbarium · `logo-herbarium` | LernHub-Logo | Gewöhnlich | 240 Credits | Eigenes Buchzeichen-WebP | Header, Sidebar, Studio | Funktional. Chrome, Obsidian, Holographic und Gold teilen das Buchzeichen. |
| Gold · `logo-gold` | LernHub-Logo | Legendär | ab Level 50 | Buchzeichen-PNG mit Filter, Herbarium als WebP | Header, Sidebar, Studio | Funktional. Chrome, Obsidian, Holographic und Gold teilen das Buchzeichen. |
| Nova · `celebrate-nova` | Abschlussanimation | Gewöhnlich | 250 Credits | CSS-Keyframes | Lernabschluss, Studio | Funktional, keine separaten animierten Modelle. |
| Liquid Ripple · `celebrate-ripple` | Abschlussanimation | Selten | 650 Credits | CSS-Keyframes | Lernabschluss, Studio | Funktional, keine separaten animierten Modelle. |
| Aurora Wave · `celebrate-aurora` | Abschlussanimation | Episch | 1350 Credits | CSS-Keyframes | Lernabschluss, Studio | Funktional, keine separaten animierten Modelle. |
| Golden Ascension · `celebrate-golden` | Abschlussanimation | Legendär | 3600 Credits | CSS-Keyframes | Lernabschluss, Studio | Funktional, keine separaten animierten Modelle. |
| Singularity · `celebrate-singularity` | Abschlussanimation | Mythisch | collection: exams | CSS-Keyframes | Lernabschluss, Studio | Funktional, keine separaten animierten Modelle. |
| Plasma · `bar-plasma` | Fortschrittsbalken | Gewöhnlich | 190 Credits | Native Progress-Elemente oder GardenStem | Fortschritt, Studio | Funktional. GardenStem nur in entsprechend vorgesehenen Ansichten. |
| Crystal Bar · `bar-crystal` | Fortschrittsbalken | Selten | 490 Credits | Native Progress-Elemente oder GardenStem | Fortschritt, Studio | Funktional. GardenStem nur in entsprechend vorgesehenen Ansichten. |
| Aurora Bar · `bar-aurora` | Fortschrittsbalken | Episch | 1250 Credits | Native Progress-Elemente oder GardenStem | Fortschritt, Studio | Funktional. GardenStem nur in entsprechend vorgesehenen Ansichten. |
| Liquid Gold · `bar-gold` | Fortschrittsbalken | Legendär | ab Level 40 | Native Progress-Elemente oder GardenStem | Fortschritt, Studio | Funktional. GardenStem nur in entsprechend vorgesehenen Ansichten. |
| Drift · `nav-drift` | Navigationsanimation | Gewöhnlich | 230 Credits | CSS-Keyframes | Seitenwechsel, Studio | Funktional. Bewegungseinstellung kann Effekte deaktivieren. |
| Soft Focus · `nav-fade` | Navigationsanimation | Selten | 580 Credits | CSS-Keyframes | Seitenwechsel, Studio | Funktional. Bewegungseinstellung kann Effekte deaktivieren. |
| Lift · `nav-lift` | Navigationsanimation | Episch | achievement: expert-mission | CSS-Keyframes | Seitenwechsel, Studio | Funktional. Bewegungseinstellung kann Effekte deaktivieren. |
| Orbit · `orbit` | Lernbegleiter | Gewöhnlich | companion: orbit | 2D-Vektor oder Pflanziska-WebP | Begleiter, Shop, Studio | Vor dem Umbau ohne echte Startseitenintegration und ohne 3D. |
| Ember · `ember` | Lernbegleiter | Selten | 500 Credits | 2D-Vektor oder Pflanziska-WebP | Begleiter, Shop, Studio | Vor dem Umbau ohne echte Startseitenintegration und ohne 3D. |
| Spectre · `spectre` | Lernbegleiter | Episch | companion: spectre | 2D-Vektor oder Pflanziska-WebP | Begleiter, Shop, Studio | Vor dem Umbau ohne echte Startseitenintegration und ohne 3D. |
| Bloom · `bloom` | Lernbegleiter | Episch | companion: bloom | 2D-Vektor oder Pflanziska-WebP | Begleiter, Shop, Studio | Vor dem Umbau ohne echte Startseitenintegration und ohne 3D. |
| Glitch · `glitch` | Lernbegleiter | Legendär | companion: glitch | 2D-Vektor oder Pflanziska-WebP | Begleiter, Shop, Studio | Vor dem Umbau ohne echte Startseitenintegration und ohne 3D. |
| Cosmo · `cosmo` | Lernbegleiter | Mythisch | companion: cosmo | 2D-Vektor oder Pflanziska-WebP | Begleiter, Shop, Studio | Vor dem Umbau ohne echte Startseitenintegration und ohne 3D. |
| Pflanziska · `pflanziska` | Lernbegleiter | Legendär | companion: pflanziska | Eigenes Pflanzen-WebP | Begleiter, Shop, Studio | Vor dem Umbau ohne echte Startseitenintegration und ohne 3D. |
| Mercury Skin · `body-mercury` | Körpermaterial | Selten | 520 Credits | 2D-Vektor bzw. CSS | Begleiterfigur und Studio | Teilweise. Raster-Pflanziska unterstützt allein den Garden-Blütenschmuck. |
| Twin Lens · `eyes-dual` | Augen | Gewöhnlich | 170 Credits | 2D-Vektor bzw. CSS | Begleiterfigur und Studio | Teilweise. Raster-Pflanziska unterstützt allein den Garden-Blütenschmuck. |
| Calm Signal · `expression-smile` | Gesichtsausdruck | Gewöhnlich | 130 Credits | 2D-Vektor bzw. CSS | Begleiterfigur und Studio | Teilweise. Raster-Pflanziska unterstützt allein den Garden-Blütenschmuck. |
| Crystal Satellites · `crystals-satellite` | Kristalle | Episch | 1150 Credits | 2D-Vektor bzw. CSS | Begleiterfigur und Studio | Teilweise. Raster-Pflanziska unterstützt allein den Garden-Blütenschmuck. |
| Holo Ring · `rings-holo` | Ringe | Selten | 630 Credits | 2D-Vektor bzw. CSS | Begleiterfigur und Studio | Teilweise. Raster-Pflanziska unterstützt allein den Garden-Blütenschmuck. |
| Stellar Crown · `crown-stellar` | Krone | Mythisch | achievement: companion-celestial | 2D-Vektor bzw. CSS | Begleiterfigur und Studio | Teilweise. Raster-Pflanziska unterstützt allein den Garden-Blütenschmuck. |
| Stardust Trail · `particles-stardust` | Partikel | Episch | achievement: first-review | 2D-Vektor bzw. CSS | Begleiterfigur und Studio | Teilweise. Raster-Pflanziska unterstützt allein den Garden-Blütenschmuck. |
| Indigo Core · `companion-indigo` | Begleiter-Farbe | Episch | 1250 Credits | 2D-Vektor bzw. CSS | Begleiterfigur und Studio | Teilweise. Raster-Pflanziska unterstützt allein den Garden-Blütenschmuck. |

## Gemeinsamer Einsatz und Rendering

Der Begleiter auf der Startseite übernimmt aktive Figur, Entwicklungsstufe und Ausrüstung aus dem bestehenden lokalen Zustand. Er erscheint nur bei aktivem Progress und ausreichendem Platz zwischen Überschrift und Datum. Die Abmessungen der bestehenden Elemente werden nicht angepasst. Auf Quiz-, Karteikarten- und Blurting-Abschlussseiten teilt er denselben Renderer mit Shop und Studio. Die Anzeige kann in den Einstellungen ausgeblendet werden. Darstellung und Animation ändern keine Freischaltung oder Belohnung.

Orbit besitzt nun eine eigene vorgerenderte Illustration mit separat gezeichnetem Gesicht. Das Bild ist ein 2D-Fallback und kein GLB-Modell. Der Renderer kann acht Gesichtszustände für seine vektorbasierten Gesichter darstellen. Antippen und Lernabschluss wählen davon die passenden Zustände automatisch aus. Pflanziskas Gesicht bleibt Teil ihres vorgerenderten Bilds. Die gegenwärtige Bewegung nutzt charakterabhängige CSS-Gesten und die bestehende Sichtbarkeits- und Bewegungssteuerung.

## Asset-Anforderung für die finalen Modelle

| Charakter | Modell und Material | Eigene Bewegungen | Unterschiedliche Entwicklungs-Geometrie |
| --- | --- | --- | --- |
| Orbit | Perlmuttgehäuse mit tiefer Visierfassung und seitlichen Gelenken | Schwebeneugier, Antennenbewegung, stolze Ausrichtung | Antennenmodul, seitliche Keramikleisten, zusätzliche Sensorfassung |
| Ember | Getrennte matte Glut- und Flammenkörper | Flammenzucken, Ruf, kurzer Wärmeschub | Zusätzliche Flammenschichten und Glutmantel |
| Spectre | Organischer Körper mit getrennten Schweifen | Sanftes Gleiten, Verformung beim Antippen | Zweiter Schweif und eigenständiges transparentes Obermaterial |
| Bloom | Keramik-Kern und einzeln bewegliche Blätter | Entfaltende Blätter und aufblühender Abschluss | Neue Seitentriebe und größere Blütenform |
| Glitch | Segmentiertes Gehäuse, Scharniere, maskiertes Display | Mechanischer Blickwechsel, Anzeigenimpuls | Gehäusemodule und bewegliche Seitenteile |
| Cosmo | Separat modellierte kleine Himmelskörper | Umlauf auf Ankerpfaden und Ausrichtung des Kerns | Zusätzliche Umlaufbahnen und Körper |
| Pflanziska | Stamm, kleinere Triebe, spitze Blätter, geflochtener Übertopf und Papierschmuck nach Foto | Einzelbewegungen für Blätter, Triebe und Papieranhänger | Zusätzliche Triebe, Topfdetails und klar unterschiedliche Silhouetten |

Ziel ist glTF 2.0 als GLB mit komprimierten Texturen. Für Gesichtspartien werden `eyeBlinkL/R`, `eyeWide`, `eyeSquint`, `browUpL/R`, `mouthSmile`, `mouthOpen` und `mouthPurse` benötigt. Der Ursprung liegt mittig am Boden. Benannte Anker für Gesicht, Krone, Ring, Körper und Partikel sollen pro Entwicklungsstufe mitgeliefert werden. Gesonderte Clips für Idle, Begrüßung und Abschluss müssen sich ohne Sprung überblenden lassen. Als erstes Modell sollte Orbit geprüft werden. Der Shop braucht je Item eine vorgerenderte Ansicht. Es gibt derzeit keine produktionsreifen 3D-Modelle oder eine GLB-Laufzeit im Repository. Die gemeinsame Renderer-Schnittstelle trennt Figur, Ausrüstung, Entwicklungsstufe, Ausdruck und Bewegung für einen späteren Austausch.

## Verifikation

Chromium und WebKit prüften das Erscheinen nach freiwilliger Aktivierung, die weiterhin identischen Karten- und Lernfeldmaße, den Bewegungsmodus und das Ausblenden in den Einstellungen. Der Browserablauf bestätigte das gemeinsame Orbit-Asset im Shop, Studio und auf dem Dashboard. Ein vollständig durchlaufener Wissensabruf zeigte den Begleiter erst auf der Abschlussseite. Die zusätzlichen Testbilder liegen in `/workspace/output/companion-audit/`.

Die Orbit-Illustration ist ein 17-kB-WebP und wird erst im benötigten Kontext geladen. Eine Messung auf physischem iOS-Gerät und Messungen eines künftigen WebGL-Renderers wurden nicht durchgeführt. Keine Veröffentlichung und keine Schema-Migration.

## Umstieg auf animierte 2D-Grafiken

Auf Wunsch wird die gemeinsame Begleiterdarstellung als 2D-Rastergrafik ausgeliefert. Die App lädt keine GLB-Dateien und bringt keine WebGL-Bibliothek mit. Blender erzeugt offline die getrennten Charaktere, Posen und Zubehörteile. Anschließend baut das Pack-Skript transparente WebP-Bildstreifen und Vorschaubilder. Shop, Studio, Startseite und Lernabschluss beziehen ihre Ansichten aus derselben Produktion.

Jeder Begleiter besitzt zwölf verschiedene Bilder pro Bewegung und Entwicklungsstufe für Ruhe, Begrüßung und Lernabschluss. Die Bildfolgen enthalten unterschiedliche Bewegungen und ein Blinzeln. Pflanziskas Blätter und Papieranhänger werden getrennt bewegt. Die vier Entwicklungsstufen besitzen zusätzlich modellierte Formteile, die in den Stufenbildern sichtbar sind. Acht Gesichtsausdrücke lassen sich in der Begleiteransicht unabhängig vom Besitzstand unverbindlich ansehen. Separat ausgerüstete Ringe, Kronen, Kristalle und Partikel verwenden transparente Anschlussbilder pro Begleiter. Ausgerüstete Linsen und Gesichtsausdrücke erscheinen auch in den jeweiligen Entwicklungsstufen. Kombinationen mit Zubehör bewegen sich als Einheit, damit der Kontaktpunkt an der Figur bleibt.

Die ruhenden Marktplatzkarten laden nur das passende Vorschaubild. Bewegungen werden bei Sichtbarkeit und aktiver Registerkarte angefordert. Bewegungsreduktion und der bestehende Animationsschalter verwenden das statische Bild. Shop und Anwesenheit des Begleiters ändern weder Lernverlauf noch Besitzstände.

### Offline-Produktion

1. `blender -b --factory-startup -t 2 --python scripts/model-orbit.py`
2. `blender -b --factory-startup -t 2 --python scripts/model-companions.py`
3. `blender -b --factory-startup -t 2 --python scripts/render-companion-sprites.py`
4. `COMPANION_EXTRA_EXPRESSIONS=1 blender -b --factory-startup -t 2 --python scripts/render-companion-sprites.py`
5. `COMPANION_STAGE_MOTIONS=1 blender -b --factory-startup -t 2 --python scripts/render-companion-sprites.py`
6. `python scripts/pack-companion-sprites.py`

Die GLB-Ausgaben dienen ausschließlich als lokale Blender-Zwischenstufe und liegen unter `/tmp`. Dafür ist kein Modell-Loader im Browser erforderlich.


## Individuelle Bewegungsregie

Alle Figuren besitzen getrennte Abläufe und Tempi. Orbit dreht seine Antenne und hebt beim Jubel die seitlichen Schalen. Ember fächert seine Flammen auf und setzt beim Jubel Funken frei. Spectre gleitet seitlich und bewegt seine Schweifspitzen. Bloom öffnet die Blütenblätter um den Blütenkern. Glitch schwenkt Kopf und Display, die Augen scannen separat. Bei Cosmo ziehen Mond und Komet eigene Bahnen. Pflanziskas Topf bleibt am Boden, während Blätter und Papieranhänger um ihre jeweiligen Ansatzpunkte schwingen.

In der Begleiteransicht lässt sich eine der drei Bewegungsarten wählen und an jeder Figur ausprobieren. Der Test zeigt vorübergehend die gewählte Entwicklungsstufe ohne Zubehör. Danach kehrt die Anzeige zur gewählten Ausrüstung zurück. Ausgerüstete, separate Zubehörteile bewegen sich als Gruppe mit der Figur, damit Ringe und Kronen an ihrem Platz bleiben.

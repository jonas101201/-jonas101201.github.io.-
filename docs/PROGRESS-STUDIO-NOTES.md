# Übergabe – Reward Store, Studio und Lernbegleiter

- Reward Store mit Katalogsuche, Kategorie, Seltenheit, Inventar, Wunschliste, freier Vorschau, Bedingungen und bestätigtem Credit-Eintausch. Der Eintausch wird als atomarer Auftrag an die Engine delegiert.
- Studio mit unabhängigen Slots für Oberflächen und Begleiter. Gesperrte Elemente können lokal angesehen werden. Erst Anwenden schreibt die Konfiguration, und nur für freigeschaltete Gegenstände. Standarddesign und mehrere benannte Presets sind verfügbar.
- Sechs Begleiter mit eigenen SVG-Silhouetten, vier sichtbar abgestuften Entwicklungsformen und acht kosmetischen Slots. Ausgewählte Begleiter beeinflussen die Priorität regelbasierter Missionen.
- CSS-Variablen ändern gezielt nur ausgerüstete Slots. Es werden keine Lernlayouts oder Assets aus externen Quellen geladen. Vorschau und aktive Effekte achten auf reduzierte Bewegung und den Animationsschalter. Die Begleiterbewegung startet nur bei sichtbarem SVG und aktivem Browser-Tab.
- Tests unter `tests/progression-cosmetics.test.ts` und `tests/progression-studio-ui.test.tsx`. Sieben Prüfungen zu Slots, Kontrast der Glas- und Akzentpaletten, gesperrten Vorschauen, bestätigtem Kauf, kombinierter Ausstattung und Aufräumen globaler Styles.

Chromium-Prüfung bei 320, 390, 768, 1440 und 1920 Pixeln durchgeführt. Vorschau im Store, gesperrtes Anwenden im Studio, Vorschau aller sechs Begleiter auf höchster Stufe und deaktivierte Animationen bei reduzierter Bewegung funktionierten an diesen Breiten ohne horizontalen Überlauf oder Seitenfehler.

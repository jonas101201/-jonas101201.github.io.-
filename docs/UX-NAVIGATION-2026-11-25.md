# LernHub – UX und Navigation

Der Branch `codex/ux-navigation` enthält die überarbeitete Navigation. Die Änderung ist lokal prüfbar und wurde nicht veröffentlicht.

## Audit und Umsetzung

Das Audit umfasste Router und Seitenhierarchie, App-Shell, Dashboard, Fachseiten, Lernformate, Termine, die beiden Sucheinstiege, Speicher und Lernverlauf, CSS-Kaskade, Animationen, Breakpoints und die vorhandenen Tests. Hauptprobleme waren doppelte mobile Navigationen, ein auf Lernzetteln pauschal ausgeblendetes Dock, automatisch gestarteter Fokusmodus, beim Wechsel verlorene Filter sowie eine Suche ohne direkt sichtbaren Fachkontext.

Der Umsetzungsplan sah zuerst die fünf Hauptbereiche und den vereinheitlichten Header vor. Danach folgten Startseite, Lernbereich, Fachkontext, Verlauf, Suche und Einstellungen. Den Abschluss bildeten responsive Prüfung, Vergleich mit dem veröffentlichten Stand und unabhängiger Review.

| Aufgabe | Vorher | Jetzt |
| --- | --- | --- |
| Lernformat finden | Fachübersicht, Seitenleiste oder „Mehr“ | „Lernen“ mit direkter Wahl nach Fach oder Format |
| Mobil navigieren | Hamburger und Dock mit überlappenden Zielen | Dock mit Start, Lernen, Suche, Termine und Mehr |
| Lernfeld oder Format wechseln | Rücksprung beziehungsweise Verlust des aktiven Formats | Kompakte Lernfeldauswahl und gespeicherter Formatkontext in der URL |
| Gefilterte Liste wiederfinden | Feste Sammellinks und Scroll-Reset | Kontextbezogener Rückweg und Scrollposition pro Verlaufseintrag |
| Suchen | Gemeinsame Logik, aber wenig sichtbare Metadaten | Suchseite mit Gruppen, Format, Fach und Lernfeld. Desktop-Palette mit denselben Treffern und Metadaten |
| Termine und Fortschritt sehen | Auf der Startseite hinter einem aufklappbaren Abschnitt | Direkt unter den vorhandenen Fächer-Einstiegen |
| Einstellungen finden | Sprache, Thema und Pause an mehreren Stellen | Zahnrad mit Systemdarstellung, Hell/Dunkel, Hintergrund und Sprache. Theme-Schalter bleibt direkt verfügbar |
| Konzentriert lernen | Navigation bei Quiz und Karten automatisch ausgeblendet | Bewusst aktivierbarer Fokusmodus für Quiz, Prüfungssitzung, Karten und Lernzettel |

## Architektur und Design

- HashRouter und bestehende Inhaltsrouten bleiben Grundlage. `/lernen`, `/einstellungen` und `/speicher` ergänzen sie. Mehr bleibt das vorhandene Drop-up. Die Desktop-Leiste gliedert ihre direkten Ziele in Übersicht, Lernen, Organisation und System.
- Listenfilter, Sortierung, Ansicht und Suchbegriff stehen in den URL-Parametern. Text- und Filteränderungen ersetzen den aktuellen Verlaufseintrag. Der direkte Einstieg und Browser-Zurück/Vorwärts bleiben nutzbar.
- Der kontextuelle Rücklink nutzt den ursprünglichen Verlaufseintrag, bei direktem Einstieg steht ein regulärer Übersichtslink zur Verfügung. Der Hauptinhalt erhält bei Seitenwechseln Tastaturfokus. Scrollpositionen sind als begrenzter Cache nur im geöffneten Tab verfügbar.
- `PageHeading`, `SubjectCard`, `ClassEvents`, `ContentLink`, `LearningSessionHeader`, das Dock und die vorhandenen Lernlisten werden wiederverwendet. Neue UI nutzt die vorhandenen Tokens, Oberflächen und Icons.
- Systemdarstellung folgt dem Gerät auch bei einem Wechsel während der Sitzung. Theme, Sprache und Hintergrund sind normale Browsereinstellungen. Die freiwillige Speicherung von Lerndaten bleibt ein separater Vorgang.
- Der Suchindex wird zwischen den drei Verbrauchern geteilt und pro Übersetzungsfunktion und Sprache wiederverwendet. Suchanfragen werden nicht als neuer Verlauf in Local Storage gespeichert. Lazy Loading der Matheformeln bleibt erhalten.
- Die veröffentlichte Oberfläche ist die visuelle Referenz. Sie enthält weiterhin die bestehenden Glasstile, verwendet an Dock, Drop-up und Palette aber bereits die deckenden Clay-Überschreibungen. Vorhandene Unschärfe-, Farb-, Licht- und Schattenwerte wurden deshalb als Ist-Stand beibehalten.
- Lerninhalte, Cloudflare Access, Material-Worker, Paketabhängigkeiten und Deployment-Konfiguration sind unverändert.

## Unabhängiger Review

Der erste Review identifizierte drei Befunde: Verlust des Listenursprungs bei internen Lernzettelwechseln, zusätzliche Abdunklung normaler Lernzettel und fehlender Inhaltsfokus bei Seitenwechsel über das Dock oder die Sidebar. Alle drei wurden korrigiert. Der Nachreview bestätigte die Korrekturen und führte neun Tests in `ux-context`, `ux-navigation` und `ux-learning` aus. Die zusätzliche Empfehlung, den Pfeil im kontextuellen Rücklink zu erhalten, wurde umgesetzt.

## Testergebnisse

- `npm run check` bestand mit TypeScript, ESLint, 316 Vitest-Tests in 40 Dateien und acht Worker-Tests.
- Der Produktionsbuild mit GitHub-Pages-Unterpfad und Material-API lief erfolgreich. Das komprimierte App-Modul liegt bei rund 241 kB und das Einstiegspaket bei rund 440 kB. Die jeweils vorhandenen Warnungen zu Zod-Annotationen und großen Chunks bleiben sichtbar.
- WebKit mit iPhone-13-Emulation bestand für Startseite, Dock, „Mehr“, Einstellungen, Hellmodus nach Neuladen und Termine.
- `git diff --check` bestand.

## Browser- und Designprüfung

Chromium prüfte den Build in Hell und Dunkel bei 320, 375, 390, 430, 768, 820, 821, 1024, 1440 und 1920 px. Geprüft wurden die 16 Startseitenlinks, nebeneinanderstehende BK-Karten, Dock und Sidebar, Fach- und Formatwechsel, Browser-Verlauf, Materialfilter und Rückkehr-Scrollposition, Lernzettel-Rückwege, Suche, Theme-Wechsel, Einstellungs-Persistenz, Fokusmodus und Desktop-Shortcut. Zusätzlich wurden simulierte Safe-Areas, 44-px-Ziele für die primäre Navigation und vergrößerte Schrift geprüft.

Vorher-Nachher-Screenshots im Hell- und Dunkelmodus bei 390 und 1440 px liegen in `/workspace/lernhub-qa/ux-redesign`. Die verglichenen berechneten Werte für Hintergrundfarbe, Textfarbe, Schriftfamilie, Schatten, Radius und Backdrop-Filter stimmten für beide BK-Elemente, den Hintergrund und die jeweilige Hauptnavigation überein.

## Grenzen der Prüfung

- Die Prüfung deckt ausgewählte WCAG-2.2-AA-relevante Bedienpfade ab. Eine vollständige Konformitätsprüfung, echte Geräte und Tests mit VoiceOver oder TalkBack gehören nicht zum verifizierten Umfang.
- Scrollpositionen und laufende Quizantworten werden nicht sitzungsübergreifend gespeichert. Das Umschalten des Fokusmodus belässt die laufende Lernaktivität im selben Bildschirm. Auf der Startseite erscheinen nur vorhandene Bewertungen und abgeschlossene Quizergebnisse.
- Ein Suchanfragenverlauf wird nicht neu eingeführt. Die Desktop-Palette nutzt weiterhin vorhandene zuletzt geöffnete Inhalte.
- Es wurden keine Labormessungen auf leistungsschwacher Mobilhardware durchgeführt. Der Produktionsbuild meldet weiterhin seine vorhandene Warnung zu großen Inhalts-Bundles.

## Geänderte Dateien
- `docs/UX-NAVIGATION-2026-11-25.md`
- `index.html`
- `src/app/App.tsx`
- `src/components/ContextLinks.tsx`
- `src/components/LearningSessionHeader.tsx`
- `src/components/MobileDock.tsx`
- `src/components/ui.tsx`
- `src/features/flashcards/FlashcardPages.tsx`
- `src/features/materials/MaterialCard.tsx`
- `src/features/materials/MaterialPage.tsx`
- `src/features/materials/MaterialsPage.tsx`
- `src/features/quizzes/QuizPages.tsx`
- `src/features/search/CommandPalette.tsx`
- `src/features/search/index.ts`
- `src/features/study-sheets/StudySheetPages.tsx`
- `src/hooks/useContentOrigin.ts`
- `src/hooks/useListFilters.ts`
- `src/hooks/useRouteScroll.ts`
- `src/i18n/uk.json`
- `src/layouts/AppLayout.tsx`
- `src/pages/AboutPage.tsx`
- `src/pages/ClassroomPage.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/ExamPage.tsx`
- `src/pages/LearnPage.tsx`
- `src/pages/PrivacyPage.tsx`
- `src/pages/SearchPage.tsx`
- `src/pages/SettingsPage.tsx`
- `src/pages/Subjects.tsx`
- `src/styles/clay-design.css`
- `src/styles/desktop-design.css`
- `src/styles/home-design.css`
- `src/theme/ThemeToggle.tsx`
- `src/theme/preferences.ts`
- `src/theme/theme.ts`
- `src/utils/navigation.ts`
- `tests/home-design.test.tsx`
- `tests/ux-context.test.tsx`
- `tests/ux-learning.test.tsx`
- `tests/ux-shell.test.tsx`

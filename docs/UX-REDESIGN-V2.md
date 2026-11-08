# LernHub UX redesign v2

## Umfang und Design

Branch `feature/ux-redesign-v2` basiert auf main `b527f799c96b93152e640299a5ee2d9579cb16d6`.
Grundlage sind der ausdrückliche Auftrag und die anschließend bereitgestellte Sieben-Punkte-Vorlage. Die nachträglich bestätigten Ergänzungen zu Lernmodus, Navigation, Vorschlägen und Ladezuständen sind im selben Draft-PR enthalten.

- Globale Command-Palette über Strg+K / ⌘K und den Suchbutton. Native modale Dialogsemantik, Fokus auf die Combobox, Fokus-Rückgabe, Tab-Begrenzung, Pfeiltasten mit Umlauf, Enter, Escape, erneutes Shortcut zum Schließen. Ctrl/⌘+Home und End springen an die Ergebnisgrenzen; normale Home/End behalten die Texteingabefunktion. IME-Komposition löst keine Auswahl aus.
- Ein gemeinsamer, pro Sprache memoierter Index für Palette und Suchseite umfasst Materialien, Lernzettel, Quizfragen, Karteninhalte, Fächer, Lernfelder und Navigationsziele. Wortübergreifende UND-Suche, Groß-/Kleinschreibung und Akzente werden normalisiert; Titelübereinstimmungen haben Vorrang. Kein Download geschützter Dateien, kein Suchtracking.
- Weiterlernen vor den Fachkacheln zeigt bis zu vier zuletzt geöffnete, noch vorhandene Inhalte. Ehrlicher Leerzustand und Speicherstatus; bestehende Fortschrittsanzeige bleibt erhalten.
- Karten und kompakte Listen verwenden denselben MaterialCard-Inhalt, dieselben URLs, Metadaten, Downloadkontrollen, Filter und Sortierung. Der Wechsel ändert nur das Layout, auch in eingebetteten Lernfeldbibliotheken. Kein zusätzlicher persistierter Ansichts- oder Filterverlauf.
- `tokens.css` konsolidiert Farben, Abstände, Radien, Fokus und die unveränderten Referenz-Glasoptiken. `ViewToggle` und `ContentLink` ergänzen die vorhandenen Komponenten. SVG-Brechung, Transparenz, Pointerlicht, Federbewegungen, View Transitions und ASCII-Wellen bleiben erhalten. Listen und Weiterlernen nutzen die bestehende begrenzte WAAPI-Einblendung; der Dialog nutzt bestehende Bewegungs-Tokens. Reduced Motion unterbindet neue sowie bestehende Animationen. Keine neue Animationsbibliothek, kein alternativer Stil.
- Neue Oberfläche und Hinweise sind auch im ukrainischen Wörterbuch enthalten.

## Persistenz und Migration

- Standard: ausschließlich React-Zustand im aktuellen Tab bis zum Neuladen. Keine Speicherung von Suche, Antworten, Dateien, Titeln oder Login-Identität im Aktivitätsverlauf.
- Eigener Schlüssel `lernhub:activity:v1`: `{version:1, entries:[{to,visitedAt}]}`. Die Route enthält nur Inhaltstyp und stabile Inhalts-ID. Strikte Zod-Validierung, höchstens 20 eindeutige Einträge, letzte Öffnung zuerst. Nicht mehr vorhandene Inhalte werden im Dashboard ausgeblendet.
- Vorhandener `lernhub:progress:v1` wird weder migriert noch ersetzt. Quiz- und Karten-IDs bleiben unverändert.
- Alter Consent `lernhub:progress-consent:v1` bleibt mit `version:1` lesbar. Erst explizites Aktivieren erweitert ihn um `activity:{version:1,grantedAt}`. Alte Einwilligungen aktivieren den neuen dauerhaften Verlauf nicht automatisch; die Speicherseite bietet eine ausdrückliche Erweiterung an. Alte Clients akzeptieren den unveränderten Consent-Umschlag weiterhin.
- Beschädigte oder zukünftige Aktivitätsformate erzeugen einen sichtbaren Hinweis. Navigation funktioniert im Arbeitsspeicher weiter, überschreibt diese Daten aber nicht. Erst explizites Zurücksetzen gibt den Schlüssel wieder frei. Künftige Migrationen müssen vor dem v1-Parser implementiert werden; kein stilles Zurückstufen.
- Aktivierung übernimmt den Verlauf der Sitzung; ohne Sitzungsaktivität wird vorhandener Verlauf geladen. Widerruf versucht die Entfernung aller drei Schlüssel auch bei einzelnen Löschfehlern. Zurücksetzen entfernt auch den Aktivitätsverlauf. Speicherfehler werden sichtbar gemeldet, Lernfunktionen bleiben nutzbar. Storage-Ereignisse übernehmen Änderungen/Widerruf anderer Tabs.

## Kompatibilität mit secure-materials-api

`feature/secure-materials-api` bei `30db7f5d491abca9e782bbfa85fe21a13f4c2902` ist bereits Vorfahr des aktuellen main (`git merge-base --is-ancestor` erfolgreich).
Worker, Authentifizierung, Dateikatalog, `materialUrl`, Schutz vor unsicheren Pfaden und Deploy-Workflow werden nicht verändert. Die bestehende Downloaddarstellung wird in beiden Materialansichten weiterverwendet. Suche und Verlauf verlinken nur interne Inhaltsseiten. Die acht Worker-Sicherheitstests bleiben Teil von `npm test`.

Der vorhandene Workflow validiert PRs; Pages-Konfiguration, Artefakt-Upload und Deployment sind auf main außerhalb von Pull Requests beschränkt. Dieser Branch und Draft-PR veröffentlichen keine Website. Kein Merge oder Deployment beauftragt oder ausgeführt.

## Grenzen

- Weiterlernen öffnet den zuletzt besuchten Inhalt. Es stellt keine laufenden Quizantworten, PDF-Scrollpositionen oder unbewerteten Kartenpositionen wieder her; bereits gespeicherte Kartenbewertungen und abgeschlossene Quizversuche bleiben erhalten.
- Speicherung gilt nur für Browser und Ursprung; kein Geräteabgleich. Gleichzeitige Schreibvorgänge mehrerer Tabs folgen wie localStorage dem letzten Schreibvorgang; kein transaktionaler Mehrgeräte-Verlauf.
- Geschützte Originaldateien sind absichtlich nicht im Checkout. Ein echter Cloudflare-Login/Dateidownload und eine Prüfung der privaten Materialbytes sind ohne Materialpaket bzw. freigegebene Benutzersitzung nicht Teil dieser Prüfung. UI-URLs und Worker-Sicherheit werden separat geprüft.
- Keine Zusage einer zertifizierten WCAG-Abnahme oder vollständigen Prüfung auf realen iOS-/Android-Geräten bzw. Screenreadern.
- Vite meldet große Chunks (Katalog/Übersetzungen) und zwei entfernte Zod-PURE-Kommentare. Der Build ist erfolgreich; der bestehende Inhaltsbestand wurde nicht für einen größeren Lazy-Loading-Umbau aufgeteilt.

## Validierung am 08.11.2026

- Node 22.16.0; reproduzierbare Installation aus package-lock.json, ergänzte React-DOM-Testwerkzeuge ausschließlich als devDependencies.
- `npm run typecheck`, `npm run lint`, `npm test`: erfolgreich; 137 Vitest-Tests in 19 Dateien plus acht Worker-Sicherheitstests. Neue Tests prüfen Suchindex/Matching, globale Ctrl-/Meta-Shortcuts, Dialogfokus, Auswahl und Navigation, leere Treffer, Filter-/Sortiererhalt, Verlauf/Reload/Einwilligung/Widerruf/Reset, zukünftige Formate, Quota-Fehler, Cross-Tab-Widerruf sowie Reduced Motion und das Abbrechen laufender Glas-Einblendungen.
- `npm run build`: erfolgreich mit Standard-Basispfad sowie mit `VITE_BASE_PATH=/-jonas101201.github.io.-/` und bestehendem HTTPS-Material-API-Ursprung. Für `vite preview` muss derselbe VITE_BASE_PATH gesetzt sein.
- Browser-Smoke-Test im lokalen Entwicklungsstand und fertigen Produktionsbuild: Palette mit Strg+K, fokussierte Combobox, Spielformen-Treffer aller vier Inhaltstypen, Pfeilauswahl/Escape/Enter, echte Quiznavigation, Liquid-Glass-Darstellung und gefilterte Liste (BK1/LF2/DOCX: 15 Ergebnisse). Kein Dokumentüberlauf in der geprüften Desktopansicht. Mobile Layouts wurden visuell betrachtet; die Browser-Viewport-Steuerung lieferte wechselnde tatsächliche Größen, daher keine belastbare Zusage pixelgenauer 320-/390-Pixel-Prüfungen. Ein finaler manueller Gerätetest bleibt sinnvoll.
- `git diff --check`: erfolgreich. Keine private Materialdatei und kein Build-Artefakt wird versioniert. Kein main-Push, Merge oder Deployment.


## Ergänzungen aus der Sieben-Punkte-Vorlage

- Gemeinsamer `LearningSessionHeader` für Quizze und Karteikarten: dieselbe Titel-/Kontext-/Fortschrittsstruktur, native Progress-Elemente, expliziter Rückweg und auf 960px begrenzter Inhaltsbereich. Quizengine, Auswertung, Prüfungsmodus, Kartenbewertung und bestehende Glas-/Flip-Animationstechniken bleiben erhalten. Ergebnisse behalten eine einzige Seitenüberschrift.
- Gültige Quiz- und Kartensitzungen starten im Fokusmodus. Er blendet die Navigation und zusätzliche Kopfzeilenkontrollen aus und pausiert die ASCII-Wellen. Ein jederzeit erreichbarer Schalter stellt die Navigation wieder her. Das Umschalten verändert weder Antworten noch Kartenposition; auf einer neuen Sitzung gilt wieder der Fokusstandard. Ungültige IDs und Übersichtsseiten aktivieren ihn nicht.
- Die Desktop-Seitenleiste lässt sich auf eine Iconleiste einklappen. Aktiver Bereich, zugängliche Linknamen, Titelhinweise und der Umschalter bleiben erhalten. Der Zustand wird ausschließlich im Arbeitsspeicher gehalten; die mobile Navigation verwendet weiterhin ihre bestehende Menü-/Escape-/Fokuslogik.
- Breadcrumbs nutzen die wirklichen Katalogbeziehungen: Übersicht → Fächer → Fach → Lernfeld → Inhalt. Die letzte Ebene ist als aktuelle Seite markiert, Eltern sind Links. Falsche Fach-/Lernfeldkombinationen erzeugen keine irreführende Hierarchie.
- Die leere Command-Palette bietet bis zu sechs eindeutige, noch vorhandene zuletzt besuchte Inhaltsseiten vor den Navigationszielen an. Sie nutzt ausschließlich den bestehenden, einwilligungsabhängigen Verlauf; es entsteht kein zusätzlicher gespeicherter Navigations- oder Suchverlauf. Seiten ohne vorhandenen Inhalt werden verworfen. Mit Suchtext bleibt die vollständige Suche aktiv.
- Ein zugänglich beschrifteter Liquid-Glass-Skeleton begleitet den echten asynchronen Start der App. Dekorative Platzhalter sind für Screenreader verborgen, die dezente Opazitätsanimation läuft ausschließlich ohne Reduced Motion. Bereits synchron vorhandene Kataloglisten erhalten keine künstliche Ladezeit. Bei fehlgeschlagenem Start übernimmt weiterhin der bestehende verständliche Fehlerbildschirm mit Neuladen-Schaltfläche.
- Sichtbare, höflich angekündigte Bestätigungen nach Kartenbewertung, Mischen und Ansichtswechsel ergänzen die vorhandenen Quiz-Rückmeldungen. Sie verschieben keinen Tastaturfokus. Sämtliche neuen Texte sind auch auf Ukrainisch vorhanden.

Zusätzliche Prüfungen: neue Tests für Breadcrumb-Beziehungen, gültige Fokusrouten, begrenzte/entdoppelte Vorschläge, das Einklappen samt zugänglichen Namen, Kartenstand beim Fokuswechsel, pausierten Hintergrund, sichtbare Bestätigungen sowie Skeleton-Semantik. Typecheck/Lint/137 Anwendungstests und acht Worker-Tests erfolgreich; Produktionsbuild mit Pages-Unterpfad erfolgreich. Lokaler Browser-Smoke-Test bestätigt die Beibehaltung einer geprüften Quizantwort beim Fokuswechsel, die aktive Iconnavigation und den aktuellen Quiz-Vorschlag in der leeren Palette. Keine Browserfehler im fertigen Build. Die zuvor dokumentierten Einschränkungen zu realen Geräten und privatem Materialzugriff gelten weiter.

# Smart Recall

## Status

Die Implementierung umfasst den datensparsamen Auswertungsendpunkt, das globale Tagesbudget, die versionierte Zuordnung aller 19 Aufgaben und die Lernansicht mit KI-Feedback oder Selbstkontrolle. Frontend und Worker sind standardmäßig deaktiviert. Erst fachliche Abnahme, Freigabe der Quellen und Prüfung der echten Access-Anmeldung erlauben den Betrieb. Der öffentliche Pages-Workflow baut diesen Stand mit deaktiviertem Smart Recall. Der Recall-Worker wird separat bereitgestellt.

## Quellen und Bewertung

Der Index wird aus den validierten öffentlichen JSON-Lernzetteln und den bestehenden redaktionellen Abruf-Aufgaben gebaut. Zu jeder Aufgabe wird der bereits zugeordnete Abschnitt über den echten Routenpfad aufgelöst. Fach, Lernfeld und jeder redaktionelle Erklärungstext werden gegen denselben Abschnitt geprüft. Der SHA-256-Fingerabdruck umfasst Prompt, Kriterien, Quellentexte und Referenzen. Fehlende oder zu große Quellen werden im Index als unverfügbar geführt. Der größte aktuelle Aufgabeneintrag umfasst 6.131 UTF-8-Bytes.

| Pilotaufgabe | Bereitgestellter Lernzettelabschnitt |
| --- | --- |
| `bk2-lf4-spiel` | `/lernzettel/bk2-lf4/spiel` |
| `bk1-lf3-feinfuehligkeit` | `/lernzettel/bk1-lf3/feinfuehligkeit` |
| `mathematik-regression-korrelation` | `/lernzettel/mathematik-regression/korrelation` |

Alle weiteren Zuordnungen stehen in [recall-index.json](../worker/src/recall-index.json). Strukturierte Definitionen, Tabellen, Beispiele, Rechenschritte und öffentliche Quellen-IDs werden übernommen. Private PDFs, PPTX-Dateien, Dateiadressen und gescannte Unterlagen bleiben außerhalb der Verarbeitung. Im Repository liegt für die 19 Aufgaben jeweils ein geeigneter redaktioneller JSON-Abschnitt vor. Ein späterer PDF-gestützter Auftrag benötigt freigegebene Dateien und eine Prüfung der Textextraktion. Der Worker-Index ist Bestandteil des Worker-Bundles. GitHub Pages veröffentlicht ausschließlich `dist`.

Gemma erhält genau den festgelegten Abschnitt, die Kriterien und den Lerntext als Daten. Der Server akzeptiert pro Kriterium genau einen Status und prüft ein wörtliches Quellenzitat sowie jedes Antwortzitat. Text erscheint als React-Text. Modelltexte können weder URLs setzen noch Werkzeuge aufrufen. Die technische Prüfung kann die fachliche Eignung eines echten Zitats allein nicht garantieren. Die fachlichen Vergleichstests sind dafür der separate Abnahmeschritt.

Die Engine addiert die redaktionellen Gewichte für korrekte Kriterien und die halben Gewichte für teilweise korrekte Kriterien. Unvollständige, falsche oder fehlende Aussagen erhalten null. Für unsichere Kriterien zeigt sie einen Bereich bis zur maximal plausiblen Punktzahl. Die KI-Vorschläge können geprüft und in die bisherige Selbsteinschätzung übernommen werden. Bereits gesetzte manuelle Bewertungen haben Vorrang. Der bestehende Versuchsschlüssel, die optionale Speicherung und die bisherigen Gutschriftregeln gelten für den manuell bestätigten Abschluss. Ein Modellaufruf selbst löst keine Gutschrift aus. Das vollständige KI-Ergebnis bleibt für den laufenden Versuch im Tab. Der Abschluss und seine bestätigten Einschätzungen werden wie bisher entsprechend der Einwilligung gespeichert.

## Modell und Kosten

Stand der dokumentierten Preise am 26. November 2026. Workers AI führt `@cf/google/gemma-4-26b-a4b-it` mit 256.000 Kontexttokens und synchronem strukturiertem JSON. Smart Recall verwendet `env.AI.run`, `response_format: json_schema`, variable Extraktion nach Aufgaben-ID, deaktiviertes Thinking und `store: false`. Es gibt keinen Modellwechsel, keine Tools und keine automatischen Wiederholungen. [Gemma-4-Dokumentation](https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/)

Workers Free enthält aktuell 10.000 Neurons je Account und UTC-Tag. Für Gemma 4 gelten 9.091 Neurons je Million Eingabetokens und 27.273 je Million Ausgabetokens. Bei beispielhaften 1.400 bis 3.500 Eingabetokens und 450 bis 900 Ausgabetokens ergeben sich ungefähr 25 bis 56 Neurons je Anfrage. Diese Werte sind Schätzungen ohne Messung echter Antworten. Der Worker begrenzt die Nutzereingabe auf 3.000 Zeichen, die HTTP-Anfrage auf 16.000 Bytes, den serialisierten Modellaufruf auf 15.000 Bytes und die Ausgabe auf 1.500 Tokens. Er reserviert konservativ 200 Neurons je zugelassener Auswertung. Mit 8.000 reservierbaren Neurons sind damit **höchstens 40 Auswertungen pro UTC-Tag** möglich. Der Default pro berechtigter Person ist drei. [Workers-AI-Preise und UTC-Reset](https://developers.cloudflare.com/workers-ai/platform/pricing/)

Ein einzelnes SQLite Durable Object reserviert atomar vor dem Modellaufruf. Es begrenzt die Parallelität auf zwei weltweit und eine je berechtigter Person. Derselbe Versuch kann im Tagesfenster nur einmal reserviert werden. Auch Anbieterfehler und abgebrochene Ansichten behalten die Reservierung. Eine abgelaufene Anfrage kann beim Anbieter noch laufen, daher wird die Zeitüberschreitung im Browser oder Worker nicht als freier Platz gewertet. Die Ersatzfrist für verwaiste Reservierungen beträgt fünf Minuten. Der Free-Tarif unterstützt SQLite Durable Objects. [Durable-Objects-Kontingente](https://developers.cloudflare.com/durable-objects/platform/pricing/)

Die Reserve von 2.000 Neurons ist für anderen Verbrauch im selben Konto vorgesehen und muss bei höherem Fremdverbrauch steigen. Der Worker kann fremde AI-Bindings nicht abrechnen. Für die Kostenobergrenze ist ein bestätigtes Workers-Free-Konto erforderlich. Die accountweite Free-Grenze stoppt weitere Aufrufe, wenn andere Projekte das gemeinsame Kontingent bereits verbraucht haben.

## Datenschutz und Zugriffsschutz

Der bestehende Material-Worker prüft wie bisher Audience und E-Mail-Allowlist über plattformverifizierten Access-Kontext oder die signierte JWT-Assertion. Der Auswertungsendpunkt erlaubt nur die konfigurierte Browser-Origin. Der Worker hält im Durable Object pseudonymisierte HMAC-Werte für Person und Versuch, UTC-Tag und Lease-Ende. Die Tagesdaten werden durch Alarm bzw. beim nächsten Aufruf bereinigt. Es gibt keine serverseitige Ablage von Antworten oder Bewertungen. Identität, Fortschritt und Inventar gehen nicht an das Modell. Der Client zeigt vor dem Absenden einen separaten Hinweis, weist auf personenbezogene Inhalte im freien Text hin und sendet erst nach einem zusätzlichen Klick. Cloudflare beschreibt Standard-Inferenz ohne Speicherung und ohne Training an Kundeninhalten. Rechtsgrundlage, Vereinbarungen, Cloudflare-DPA und Rechte an Unterrichtsauszügen sind vor Freigabe durch den Betreiber zu prüfen. [Workers-AI-Datennutzung](https://developers.cloudflare.com/workers-ai/platform/data-usage/)

## Einrichtung und Abnahme

1. Vom Repository-Stamm `npm ci`, `npm run check` und `npm run build` ausführen. `npm run build:recall-index` baut den Index neu. `node scripts/build-recall-index.mjs --check` prüft den eingecheckten Stand. Wrangler ruft die Generierung beim Worker-Build ebenfalls auf. Der lokale Paketierungscheck lautet `npm exec --yes --package=wrangler@4.168.0 -- wrangler deploy --config worker/wrangler.toml --dry-run --outdir /tmp/lernhub-recall-worker`.
2. Einen separaten geschützten Staging-Host für die Abnahme wählen. `[ai]` bindet `AI` und die SQLite-Migration `recall-v1` erstellt `RecallBudget` für `RECALL_BUDGET`. Für Staging sind eine eigene Worker-Konfiguration und isolierte Tests vorzusehen. Die vorhandenen Material-Bindings samt Secrets bleiben wirksam.
3. Einen zufälligen Secretwert mit mindestens 32 Zeichen als `RECALL_RATE_SECRET` hinterlegen. `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD` und `ALLOWED_EMAILS` müssen zur Access-App passen. Beide API-Pfade müssen von derselben autorisierten Access-App gedeckt sein. `RECALL_ORIGIN` muss exakt der Frontend-Origin entsprechen, ohne Pfad. Beim Access-CORS entweder ausschließlich Preflight an den Worker durchlassen oder Access mit Origin, `POST`, `Content-Type` und Credentials antworten lassen. Geschützte POSTs müssen weiter Access und Worker-Autorisierung durchlaufen. [Cloudflare Access und CORS](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/cors/)
4. Auf GitHub Pages ist die Origin für alle Projekte auf demselben Host gleich. Für einen produktiven iOS-Betrieb mit blockierten Drittanbieter-Cookies eine eigene Frontend-Domain und eine gleichseitige API-Subdomain unter derselben registrierbaren Domain verwenden. Die tatsächliche Access-Sitzung inklusive Cookies und CORS am freigegebenen Host mit iOS Safari und einem Desktopbrowser prüfen. `GET /api/recall/session` ist der Login-Einstieg. Safari kann eine über den getrennten Standardhost erworbene Session im Cross-Site-Fetch blockieren.
5. Erst im Staging `RECALL_ENABLED=true` setzen. `RECALL_ALL_TASKS=false` beschränkt den Start auf die drei Pilotaufgaben. `RECALL_DAILY_NEURONS`, `RECALL_RESERVED_NEURONS` und `RECALL_PER_USER` an den tatsächlich beobachteten Verbrauch anpassen. Das Pilot-Frontend wird separat mit `VITE_SMART_RECALL=true` gebaut. Nach der Abnahme wird das fest deaktivierte Flag im öffentlichen Pages-Workflow gesondert freigegeben. `VITE_SMART_RECALL_API_ORIGIN` bzw. `SMART_RECALL_API_ORIGIN` kann eine vom Material-API-Host abweichende HTTPS-Origin setzen. Erst nach Abnahme aller weiteren Aufgaben `RECALL_ALL_TASKS` und `VITE_SMART_RECALL_ALL_TASKS` beziehungsweise `SMART_RECALL_ALL_TASKS` aktivieren.
6. Manuell bereitgestellte, autorisierte Workers-Free-Zugangsdaten vorausgesetzt: `node scripts/check-recall-quality.mjs --list` zeigt die Fälle. `node scripts/check-recall-quality.mjs --confirm-workers-free --case spiel-sozial-korrekt --case spiel-unsinn-mit-fachwort` prüft echte Modellantworten. Das Skript verarbeitet höchstens fünf explizit gewählte Fälle je Ausführung und gibt weder Prompts noch Tokens aus. Die direkte Modellprüfung läuft außerhalb des Worker-Budgets und zählt zum selben Cloudflare-Kontingent. Erst nach fachlicher Abnahme und separater Freigabe Worker und Pages veröffentlichen.

## Fachlicher Prüfstand

Der redaktionelle Referenzsatz umfasst 17 Fälle. Für die Regression zur kindlichen Spielentwicklung lautet die erwartete Bewertung: Gemeinsames Aushandeln und Konfliktlösen belegt soziale Entwicklung. Die Verneinung der sozialen Entwicklung ist fachlich falsch. Eine themenfremde Aussage mit dem Ausdruck „motorische Entwicklung“ erhält keine Punkte. Der Prüfsatz enthält zusätzlich Widersprüche, reine Fachwortlisten, Aufzählungsaufgaben, Wiederholungen, Schreibfehler, Zusatzinformationen und Anweisungsversuche. Abnahmebedingung ist null positive Gutschriften für markierte falsche oder themenfremde Kriterien, korrekte Belege und erfolgreich validierte Ausgaben für alle Pilotfälle. Bei Abweichungen bleiben die Flags aus.

Die Cloudflare-Verbindung konnte den bestehenden Worker und seine Binding-Namen lesen. Der Billing-Endpunkt wies das Lesen des Tarifs mit HTTP 403 wegen fehlendem `billing:read` ab. Da der Freitarif und die verbleibende accountweite Reserve nicht bestätigt werden konnten, wurden keine echten Modellaufrufe ausgeführt. Die fachliche Fehlerquote, die echte Access-Sitzung in iOS Safari und die Rechtefreigabe stehen aus.

## Geänderte Projektbereiche

- Bewertungsdienst und Access-Integration in `worker/src/index.js`, `recall.js`, `recall-budget.js` und `worker/wrangler.toml`.
- Quellengenerator, Registry und fachlicher CLI-Prüflauf in `scripts/build-recall-index.mjs`, `scripts/check-recall-quality.mjs`, `worker/src/recall-index.json` und `worker/fixtures/`. Die Build-Anbindung steht in `package.json` und `.github/workflows/deploy.yml`.
- Abrufansicht, HTTP-Client, Ergebnisdarstellung, Begleiter und Datenschutzhinweis in `src/features/blurting/`, `src/features/progression/CompanionPlacement.tsx`, `src/pages/PrivacyPage.tsx` und `src/i18n/uk.json`.
- Automatisierte Regressionen in `tests/smart-recall-ui.test.tsx`, `worker/src/recall-index-tests.js` und `worker/src/recall-tests.js`. Die vorhandenen Worker-Zugriffstests laufen im selben Testschritt.

## Ausgeführte technische Prüfungen

- `npm run check` bestanden mit TypeScript, ESLint, 361 Vitest- und 16 Worker-Tests. Dazu gehören Herkunft der Quellen, ungültige Modellantworten, serverseitige Punkte, Access, Kostenreservierung, Parallelität und UTC-Tageswechsel.
- Pages-Build mit aktivierter Pilot-UI und fiktiver HTTPS-Test-Origin bestanden, Index-Abgleich und `git diff --check` bestanden.
- Wrangler 4.168.0 Dry Run bestanden und bestätigt die AI- und SQLite-Bindings sowie `RECALL_ENABLED=false`. Paketgröße rund 211 KiB gzip. Der Dry Run verbindet keine Ressourcen mit einem deployten Worker.
- Chromium Desktop bei 1440 px und WebKit mit mobilem Viewport bei 390 px mit gemockter API ausgeführt. Geprüft wurden separater Sendehinweis, deaktivierter automatischer Versand, markierter Text, Quellen, Begleiter, manuelle Übernahme, Abschluss, Fehler und Abbruch. Die 17 fachlichen Referenzfälle sind erwartete Bewertungen und noch keine gemessenen Modellbewertungen.

## Echte Gemma-Prüfung am 27. November 2026

Der Betreiber bestätigte den aktiven Workers-Free-Tarif im Dashboard. Die Cloudflare-Anbindung konnte Gemma 4 tatsächlich aufrufen. Im ersten Durchlauf bestanden 6 von 17 Referenzfällen. 5 gültige Ergebnisse wichen fachlich ab, 3 weitere Antworten scheiterten an der Zitatvalidierung und 3 wurden am Ausgabelimit abgeschnitten. Die 17 Fachtests verbrauchten zusammen rund 560 Neurons. Im wichtigsten Negativfall bewertete Gemma einen themenfremden Satz mit dem Begriff „motorische Entwicklung“ intern als korrekt. Der Worker verwarf die Ausgabe wegen eines ungültigen Quellenzitats. Diese Validierung verhindert keine semantisch falschen Bewertungen mit formal gültigem Zitat, daher bleibt der Pilot gesperrt.

Der Systemprompt wurde lokal danach präzisiert. Fachbegriffe zählen bei Aufzählungen nur mit Bezug zur erfragten Ursache. Kriterien werden getrennt beurteilt und Quellenbelege sollen kurze, zusammenhängende Originalzitate sein. Die Referenzbewertungen und die serverseitige Zitatprüfung bleiben unverändert.

Mit dem präzisierten Prompt bestanden zwei der drei Pflichtfälle. Der themenfremde Satz erhielt weiterhin einen Punkt für „Motorik“, diesmal mit formal gültigem Quellenzitat. Der experimentelle Prompt wurde deshalb verworfen. Die drei Nachtests verbrauchten rund 81 Neurons. Die Deployment-Flags bleiben aus. Qwen 3.8 27B ist eine mögliche Workers-AI-Alternative für einen getrennten, gedeckelten Modellvergleich. Modellqualität und Verbrauch sind dafür erneut zu messen. [Workers-AI-Modellpreise](https://developers.cloudflare.com/workers-ai/platform/pricing/)

### Freigabeprüfung mit Qwen 3.8 27B

Am 27. November wurde `@cf/qwen/qwen3.8-27b` mit den drei Pflichtfällen auf demselben Workers-Free-Konto getestet. Mit dem bestehenden Prompt und mit einer klareren Anweisung zur unabhängigen Bewertung je Kriterium bestanden jeweils zwei von drei Fällen. Qwen wertete weder die falsche Verneinung noch die themenfremde Motorik-Aussage positiv. Die fachlich korrekte Erklärung zur sozialen Entwicklung wurde in beiden Läufen lediglich als teilweise korrekt eingestuft. Alle sechs Modellantworten bestanden die formale Quellenvalidierung. Die sechs Aufrufe verbrauchten zusammen rund 1.569 Neurons im Freikontingent. Der weitere fachliche Prüfsatz und der produktive Access-Test werden erst nach Bestehen dieser Pflichtfälle fortgesetzt. Weder der Modellwechsel noch der experimentelle Prompt wurden übernommen.

### Qwen-Prompt mit getrennten Bewertungsregeln

`worker/src/recall-qwen.js` enthält einen reproduzierbaren Prüfkandidaten mit Beispielen für fachlich gleichwertige Antworten, falsche Ursachen und Aufzählungsfragen. Der Qualitätsrunner unterstützt `--qwen`. Das Produktionsmodell bleibt Gemma. Bei `missing` liefert der Server bewusst kein Antwortzitat aus. Zu allen anderen Statuswerten werden Antwortzitate weiterhin wörtlich geprüft. Quellenzitate bleiben bei jedem Status verpflichtend.

Mit der vorletzten Prompt-Fassung bestanden 8 von 9 geprüften Spiel-Fällen. Die zulässige Kurzantwort „Motorik.“ wurde bei der reinen Aufzählungsfrage zu streng bewertet. In der letzten Fassung bestanden alle drei gezielt erneut geprüften Fälle. „Motorik.“ erhielt volle Punkte für das einzelne Kriterium, die fachfremde Motorik-Aussage blieb ohne Punkte, und die unverbundene Stichwortliste blieb ohne Punkte. Der letzte Dreierlauf kostete rund 714 Neurons. Der vollständige Abnahmesatz inklusive Wiederholungen und produktiver Access-Test bleibt offen. Weitere Modellläufe wurden gestoppt, um nach den Tests und Prompt-Iterationen einen Puffer im geteilten Free-Tageskontingent zu lassen. Die Freigabeschalter bleiben aus.

### Fortsetzung der Freigabeprüfung

Zwei weitere echte Qwen-Tests mit der endgültigen Prompt-Fassung bestanden. Die umgangssprachliche Erklärung zur Feinfühligkeit wurde korrekt anerkannt. Die falsche Interpretation von Vorzeichen und Stärke der Korrelation erhielt keine Punkte für beide betroffenen Kriterien. Beide Ergebnisse bestanden die Quellenvalidierung und kosteten zusammen rund 541 Neurons. Damit sind fünf unterschiedliche Fälle mit exakt dieser Prompt-Fassung belegt. Der vollständige Referenzsatz einschließlich Wiederholung und der produktive Access-Test stehen aus. Die bisher protokollierten Modellläufe haben den geplanten Tagesrahmen von rund 8.000 Neurons nahezu ausgeschöpft. Die Freigabeschalter bleiben aus.

### Freigabe des begrenzten Qwen-Piloten

Der Betreiber hat die Pilotaktivierung ohne weitere Modelltests ausdrücklich freigegeben. Der geschützte Worker und der Pages-Build verwenden Qwen 3.8 27B für die drei Pilotaufgaben. Die restliche fachliche Abnahme sowie ein Test mit echter Access-Sitzung auf einem iPhone bleiben offen. Der Check ist optional und beeinflusst Lernbelohnungen nur über die manuell bestätigte Selbsteinschätzung.

CORS gilt für den LernHub-Ursprung. Die bestehende Access-Policy und Audience blieben erhalten. Vor dem Upload war die letzte Worker-Version `94d2a62c-0708-4984-884f-15c03b720dc1`. Wegen des höheren Qwen-Verbrauchs reserviert der Worker 1.200 Neurons je Anfrage. Bei 8.000 Neurons pro UTC-Tag sind so höchstens sechs Pilotbewertungen möglich. Wegen der bereits ausgeführten Modelltests kann der Pilot erstmals am 28. November 2026 um 00:00 UTC bewerten. Das entspricht 01:00 Uhr deutscher Zeit.

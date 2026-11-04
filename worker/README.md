# Geschützte LernHub-Material-API

LernHub bleibt auf GitHub Pages. Direkte Links öffnen den separaten Worker in einem neuen Tab, damit Cloudflare Access die Anmeldung ohne Drittanbieter-Cookies oder CORS-Freigaben durchführen kann. Vorschau und Download verwenden dieselbe Anmeldung; `?download=1` setzt `Content-Disposition: attachment`.

## Konfiguration

- Worker: `lernhub-materials-api.spathjonas.workers.dev`
- Access-Anwendung: `f6b12b00-75a2-4487-88e2-97712d3cd0b7`
- Gesamter Worker-Traffic einschließlich Vorschauen wird durch Access geschützt.
- Login-Methode: ausschließlich One-time PIN. Allow-Policy mit einzelnen E-Mail-Adressen, niemals Everyone oder Bypass.
- Gewünschte Anwendungs-Sitzungsdauer: sieben Tage. Policy- und globale Sitzungsgrenzen ebenfalls prüfen.
- `ACCESS_TEAM_DOMAIN` und `ACCESS_AUD` stehen in `wrangler.toml`; sie sind keine Zugangsschlüssel.
- Worker-Secret `ALLOWED_EMAILS`: kommaseparierte, ausdrücklich freigegebene Adressen. Zusätzliche Prüfung der signierten Identität im Worker; fehlt die Liste, wird jeder Zugriff verweigert. Bei Änderungen sowohl Access-Policy als auch dieses Secret aktualisieren.
- Worker-Secret `GITHUB_TOKEN`: Fine-grained PAT für **ausschließlich** `jonas101201/lernhub-unterrichtsmaterialien`, Berechtigung **Contents: Read-only**. Token direkt in Cloudflare eintragen, niemals in Chat, Git, Vite-Variablen oder öffentliche Artefakte.
- `keep_vars = true` erhält Dashboard-Variablen beim Deploy; Secrets bleiben außerhalb der Konfigurationsdatei.
- Preview-URLs sind in Wrangler deaktiviert; der Access-Schutz gilt zusätzlich für alle Worker-URLs.

Bei Worker-spezifischem Access prüft der Worker den von Cloudflare verifizierten `ctx.access`-Kontext auf exakte Audience und die E-Mail-Allowlist. Unpassende oder fehlerhafte native Kontexte werden ohne Header-Fallback abgewiesen. Bei Hostname-Access und älteren Laufzeiten prüft der Worker zusätzlich die RS256-Signatur, Issuer, Audience, Token-Typ, Ablaufzeit, Ausgabezeit, optionales `nbf` und die E-Mail-Allowlist. Fehler bei Token-Parsing, Schlüsselladen oder Signaturprüfung verweigern Zugriff. Signaturschlüssel werden fünf Minuten im Worker zwischengespeichert.

Nur im öffentlichen Katalog eingetragene Originale und Vorschauen können geladen werden. MIME-Typ und Dateinamen werden vom Katalog und der Dateiendung bestimmt. Antworten einschließlich Fehlern sind `private, no-store`; GitHub-Fehler und Weiterleitungen werden nicht durchgereicht. HEAD liefert keinen Body. Range-Anfragen werden aktuell als vollständige Datei beantwortet.

## Entwicklung und Tests

Im Repository-Root: `npm run check` und `npm run build`. `npm test` führt die bestehenden Vitest-Tests und zusätzliche Node-Sicherheitstests mit selbst erzeugten RSA-Schlüsseln aus. Tests verwenden ausschließlich simulierte Identitäten und GitHub-Antworten.

Manuell mit der realen Access-Anwendung prüfen:

1. Anonyme Anfrage an eine echte Materialdatei muss zur Access-Anmeldung führen, niemals Dateiinhalt liefern.
2. Nicht freigegebene Adresse muss abgewiesen werden.
3. Freigegebene Adresse muss per E-Mail-Code PDF/PNG-Vorschauen und Originaldownloads öffnen können.
4. Manipulierte und abgelaufene JWTs sowie direkte Worker-URLs ohne Access müssen verweigert werden.
5. Dateiinhalt, Token und private Dateien dürfen nicht im Pages-Artefakt landen.

## Freigabe der Website

**Kein Merge und keine Änderung an der Live-Website ohne ausdrückliche Freigabe.**

Der Entwicklungsbranch ist mit dem separaten Material-Worker verbunden; ein Push dorthin kann diesen Worker automatisch deployen. GitHub Pages deployt nur von `main`. Erst nach bestandenem Ende-zu-Ende-Test und Freigabe die Repository-Variable `MATERIALS_API_ORIGIN` auf `https://lernhub-materials-api.spathjonas.workers.dev` setzen und den Draft-PR mergen. Bei fehlender/ungültiger API-Konfiguration zeigt das Frontend einen Hinweis und erzeugt keine öffentlichen Ersatzlinks.

Bereits auf der bestehenden Live-Website veröffentlichte Materialien werden durch die separate API nicht rückwirkend privat. Alte Veröffentlichungen, Caches, Repository-Historie sowie Schutzbedarf von Katalog, Lernzetteln und Metadaten müssen vor einer öffentlichen Migration gesondert geprüft werden.

Referenz zum nativen Access-Kontext: https://developers.cloudflare.com/workers/configuration/cloudflare-access/#read-authenticated-user-identity-with-ctxaccess

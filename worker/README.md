# LernHub: private Material-API (Entwicklungsstand)

**Nicht produktiv ausrollen, bevor die Checkliste erfüllt ist.**

## Architektur

- LernHub bleibt auf GitHub Pages.
- Cloudflare Access übernimmt die Anmeldung mit E-Mail-Einmalcode und **Allow-Policy für einzeln freigegebene E-Mail-Adressen**.
- Ein Cloudflare Worker überprüft zusätzlich die signierte Access-JWT (RS256, Issuer, Audience, Ablaufzeit).
- Erst danach lädt er die angeforderte Datei aus dem privaten GitHub-Repository.
- Ein **read-only, auf das Material-Repository beschränkter Fine-grained GitHub PAT** wird als Worker-Secret `GITHUB_TOKEN` gespeichert. **Nie in Vite oder GitHub Pages einbauen.**
- `ACCESS_TEAM_DOMAIN` und `ACCESS_AUD` sind Worker-Secrets/Variablen. Beispiel für Team-Domain: `https://deinteam.cloudflareaccess.com`.
- Keine öffentlichen PDFs mehr in GitHub Pages veröffentlichen.

## Einrichtung (manuelle Kontofreigaben erforderlich)

1. Cloudflare-Konto und Zero Trust Access einrichten.
2. Access-Anwendung für die Worker-Domain konfigurieren: One-time PIN und Allow-Policy ausschließlich für die E-Mail-Adressen der Klasse. Keine `Everyone`-Policy.
3. Worker deployen und `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, `GITHUB_TOKEN` als Secrets konfigurieren.
4. Echte Worker-Domain, GitHub-Pages-Origin und Einbindung testen. Bei browserübergreifendem Login ggf. Weiterleitung auf die Worker-Domain verwenden statt Fetch/CORS.
5. **Erst nach bestandenem Test** den GitHub-Actions-Workflow so ändern, dass private Dateien NICHT mehr in `public/materials/` kopiert werden. Frontend-Dateilinks auf geschützte Worker-URLs umstellen.
6. Nach Umstellung anonyme direkte Datei-URLs auf der Pages-Domain testen. Alte Veröffentlichungen, Caches und Archive gesondert prüfen.

## Sicherheitstests vor Freigabe

- Ohne Login: 401/Access-Login, niemals Dateiinhalt.
- Nicht freigegebene E-Mail: Zugriff verweigert.
- Freigegebene E-Mail: PDF-Vorschau und Download funktionieren.
- Manipulierte/abgelaufene JWT: 401.
- Traversal-Pfade und unbekannte Dateien: 404.
- Kein GitHub-Token in öffentlichen Bundles, Netzwerkantworten oder Git-Historie.
- Auch die öffentliche Katalogdatei `src/data/catalog.json` und Lernzettel können Metadaten/Inhalte enthalten: separat auf Schutzbedarf prüfen.

**Wichtig:** Dieses Scaffold ist keine fertige Migration. Die Live-Site bleibt bis zu deiner ausdrücklichen Freigabe unverändert.

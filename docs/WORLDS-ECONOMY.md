# Worlds & Personalization – Kaufmodell und Credit-Ökonomie

## Bestehende Wirtschaft

Der Lernkatalog besitzt 47 separat vergütete Lernaktivitäten. Zehn Quizze können im Quiz- und im Prüfungsmodus bearbeitet werden. Hinzu kommen acht Karteikartensätze und 19 Aufgaben für freien Wissensabruf. Die ersten qualifizierten Abschlüsse ergeben 1.635 HUB Credits. Bei höchstens zwölf vergüteten Wiederholungen je Aktivität zu je 50 Credits ergibt sich eine theoretische Obergrenze von 28.200 zusätzlichen Credits für Wiederholungen. Leistungen, Missionen, Herausforderungen und Sammlungen können weitere einmalige Credits gewähren. Auch unter großzügigen Annahmen für einmalige Boni liegt die rechnerische Obergrenze für den aktuellen Katalog bei etwa 46.090 Credits. Das erreichbare Guthaben hängt unter anderem von Lernleistung, Abständen und ausgewählten Aktivitäten ab.

Die bestehenden 33 einzeln kaufbaren Cosmetics haben zusammen einen Katalogwert von 28.650 Credits. Die acht vorgeschlagenen Welten würden zusätzlich 57.000 Credits kosten. Der kombinierte Betrag von 85.650 Credits liegt deutlich oberhalb des aktuellen Katalogbudgets. Enchanted Garden startet als einzelne Referenzwelt daher bei 3.600 statt 6.500 Credits. Bei fünf vergüteten Wiederholungen pro Woche entspricht das rund 15 statt 26 Wochen. Bei durchschnittlich 30 bis 40 Credits pro Aktivität sind es ungefähr 18 bis 24 statt 33 bis 44 Wochen. Das sind Rechenbeispiele ohne Einmalbelohnungen.

Vor Freigabe der weiteren sieben Welten braucht die Kollektion ein gemeinsames Budget. Bestehende Belohnungsgrenzen bleiben aktiv.

## Kauf und Speicherung

- Der Kauf läuft in der vorhandenen Progression Engine und speichert den Credit-Abzug sowie alle sechs Besitz-IDs in derselben IndexedDB-Transaktion. Die Ledger-ID `purchase:world:enchanted-garden` sperrt Mehrfachkäufe.
- Der bestehende versionierte Datenbestand enthält Guthaben, Besitz, Wunschliste und Ausstattung bereits in den passenden Feldern. Die ergänzenden Set-IDs verwenden diese Felder. Für bereits vorhandene V1-Daten braucht es daher keine Datenumschreibung.
- Beim V1-Import werden Set-Bestandteile nur als vollständige Kombination mit dem dazugehörigen Kaufbeleg akzeptiert. Alte Einzelstücke behalten ihre IDs. Ein späterer Preiswechsel muss historische Belege weiterhin zulassen.
- Anproben werden außerhalb des Besitz- und Kaufzustands gerendert. Die Engine lässt dauerhafte Ausstattung und Presets nur für vorhandene Besitz-IDs zu.

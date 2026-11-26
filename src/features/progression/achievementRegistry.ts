export const achievementDefinitions = [
  { id: 'first-blurting', title: 'Erster Wissensabruf', description: 'Eine qualifizierte Blurting-Sitzung abschließen.' },
  { id: 'ten-recalls', title: 'Wissen abrufen', description: 'Zehn verschiedene Themen in Blurting abschließen.' },
  { id: 'first-review', title: 'Mit Abstand wiederholt', description: 'Eine empfohlene zeitversetzte Wiederholung durchführen.' },
  { id: 'all-methods', title: 'Methodenvielfalt', description: 'Karteikarten, Quiz, Prüfungstraining und Blurting ausprobieren.' },
  { id: 'improved-quiz', title: 'Eigene Bestleistung', description: 'Ein vollständiges Quiz oder Prüfungstraining messbar verbessern.' },
  { id: 'first-mission', title: 'Erste Lernmission', description: 'Alle Schritte einer Lernmission abschließen.' },
  { id: 'expert-mission', title: 'Expert Mission abgeschlossen', description: 'Eine Expert Mission vollständig absolvieren.' },
  { id: 'first-exam', title: 'Erstes Prüfungstraining', description: 'Ein vollständiges Prüfungstraining abschließen.' },
  { id: 'five-exams', title: 'Prüfungsroutine', description: 'Fünf verschiedene Prüfungstrainings abschließen.' },
  { id: 'bk1-methods', title: 'BK1 vertieft', description: 'Drei Lernmethoden in BK1 verwenden.' },
  { id: 'bk1-review', title: 'BK1 wiederholt', description: 'Eine zeitversetzte Wiederholung in BK1 durchführen.' },
  { id: 'bk2-methods', title: 'BK2 vertieft', description: 'Drei Lernmethoden in BK2 verwenden.' },
  { id: 'bk2-review', title: 'BK2 wiederholt', description: 'Eine zeitversetzte Wiederholung in BK2 durchführen.' },
  { id: 'first-evolution', title: 'Erste Entwicklung', description: 'Einen Lernbegleiter zur zweiten Stufe entwickeln.' },
  { id: 'companion-celestial', title: 'Celestial erreicht', description: 'Einen Lernbegleiter zur höchsten Stufe entwickeln.' },
] as const;

export const collectionDefinitions = [
  { id: 'memory', title: 'Gedächtnis-Kollektion', achievementIds: ['first-blurting', 'ten-recalls', 'first-review'] },
  { id: 'methods', title: 'Lernmethoden-Kollektion', achievementIds: ['all-methods', 'first-mission', 'improved-quiz'] },
  { id: 'exams', title: 'Prüfungsvorbereitungs-Kollektion', achievementIds: ['first-exam', 'five-exams', 'expert-mission'] },
  { id: 'bk1', title: 'BK1-Kollektion', achievementIds: ['bk1-methods', 'bk1-review'] },
  { id: 'bk2', title: 'BK2-Kollektion', achievementIds: ['bk2-methods', 'bk2-review'] },
  { id: 'companions', title: 'Begleiter-Kollektion', achievementIds: ['first-evolution', 'companion-celestial'] },
] as const;

export const challengeDefinitions = [
  { id: 'methods-three', title: 'Drei Lernmethoden', description: 'Schließe drei verschiedene Lernmethoden ab.', difficulty: 'Einsteiger', target: 3, reward: { xp: 200, credits: 100 } },
  { id: 'recall-five', title: 'Fünf Themen abrufen', description: 'Bearbeite fünf verschiedene Themen im freien Wissensabruf.', difficulty: 'Fortgeschritten', target: 5, reward: { xp: 260, credits: 150 } },
  { id: 'improve-three', title: 'Dreimal verbessert', description: 'Verbessere drei vollständige Quiz- oder Prüfungsergebnisse.', difficulty: 'Experte', target: 3, reward: { xp: 350, credits: 240 } },
  { id: 'week-review', title: 'Nach einer Woche erinnern', description: 'Bearbeite ein Thema in einer fälligen Runde mindestens sieben Tage nach der letzten Wiederholung.', difficulty: 'Experte', target: 1, reward: { xp: 400, credits: 320 } },
  { id: 'master-mission', title: 'Große Lernmission', description: 'Schließe eine Master Mission ab.', difficulty: 'Meister', target: 1, reward: { xp: 500, credits: 500 } },
] as const;


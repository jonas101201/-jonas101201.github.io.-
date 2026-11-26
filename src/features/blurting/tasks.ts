import { catalog } from '../../data/catalog';
import { studyTopics } from '../study-sheets/data';

type ConceptSeed = readonly [id: string, title: string, pointIndex: number, ...keywords: string[]];

export interface BlurtingConcept {
  id: string;
  title: string;
  explanation: string;
  keywords: readonly string[];
  weight: number;
}
export interface BlurtingReference {
  to: string;
  title: string;
  kind: 'Lernzettel' | 'Unterrichtsmaterialien' | 'Karteikarten' | 'Quizze' | 'Prüfungstraining';
}
export interface BlurtingTask {
  version: 1;
  id: string;
  subjectId: string;
  learningFieldId?: string;
  title: string;
  prompt: string;
  estimatedMinutes: number;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  sourcePath: string;
  materialIds: readonly string[];
  concepts: readonly BlurtingConcept[];
  related: readonly BlurtingReference[];
}

const prompt = 'Rufe das Thema aus dem Gedächtnis ab. Erkläre die wichtigsten Zusammenhänge in eigenen Worten und ergänze, wenn möglich, ein Beispiel.';

function task(topicId: string, difficulty: BlurtingTask['difficulty'], estimatedMinutes: number, seeds: readonly ConceptSeed[]): BlurtingTask {
  const topic = studyTopics.find(topic => topic.id === topicId);
  if (!topic) throw new Error('Unbekannte Grundlage für freien Wissensabruf: ' + topicId);
  const scope = (item: { subjectId: string; learningFieldId?: string; example: boolean }) =>
    item.subjectId === topic.subjectId && item.learningFieldId === topic.learningFieldId && !item.example;
  const quiz = catalog.quizzes.find(scope);
  const cards = catalog.flashcardSets.find(scope);
  const related: BlurtingReference[] = [{ to: topic.to, title: topic.title, kind: 'Lernzettel' }];
  if (topic.topic.materialIds.length) {
    related.push(...catalog.materials.filter(material => topic.topic.materialIds.includes(material.id)).slice(0, 2)
      .map(material => ({ to: '/materialien/' + material.id, title: material.title, kind: 'Unterrichtsmaterialien' as const })));
  }
  if (cards) related.push({ to: '/karteikarten/' + cards.id, title: cards.title, kind: 'Karteikarten' });
  if (quiz) {
    related.push({ to: '/quizze/' + quiz.id + '?modus=lernen', title: quiz.title, kind: 'Quizze' });
    related.push({ to: '/quizze/' + quiz.id + '?modus=pruefung', title: quiz.title, kind: 'Prüfungstraining' });
  }
  return {
    version: 1,
    id: topicId.replace('/', '-'),
    subjectId: topic.subjectId,
    learningFieldId: topic.learningFieldId,
    title: topic.title,
    prompt,
    difficulty,
    estimatedMinutes,
    sourcePath: topic.to,
    materialIds: topic.topic.materialIds,
    concepts: seeds.map(([id, title, pointIndex, ...keywords]) => {
      const explanation = topic.topic.points?.[pointIndex];
      if (!explanation) throw new Error('Fehlender belegter Kernaspekt: ' + topicId + '/' + id);
      return { id, title, explanation, keywords, weight: 1 };
    }),
    related,
  };
}

/* Jede Rubrik verweist auf genau einen bestehenden redaktionellen Lernzettelabsatz.
   Schlagwörter helfen beim Vergleich. Sie dienen weder als Lösung noch als Bewertung. */
export const tasks: readonly BlurtingTask[] = [
  task('bk1-lf1/kompetenzen', 'intermediate', 5, [
    ['bereiche', 'Kompetenzbereiche', 0, 'Fachkompetenz', 'Methodenkompetenz', 'Sozialkompetenz'],
    ['transfer', 'Transfer', 1, 'Transfer', 'anwenden', 'Handlungssituation'],
    ['praxis', 'Konflikt als Anwendungsbeispiel', 2, 'Konflikt', 'Entwicklungsstand', 'Bedürfnisse'],
  ]),
  task('bk1-lf2/faktoren', 'intermediate', 5, [
    ['wechselwirkung', 'Wechselwirkung', 0, 'Wechselwirkung', 'Anlage und Umwelt', 'Milieutheorie', 'Milieutheorien'],
    ['umwelt', 'Einflüsse der Umwelt auf Gene', 1, 'Epigenetik', 'Umwelt', 'Genaktivität'],
  ]),
  task('bk1-lf2/entwicklungsbereiche', 'basic', 4, [
    ['zusammenspiel', 'Zusammenspiel von Entwicklungsbereichen', 0, 'Feinmotorik', 'Absprache', 'Absprachen'],
    ['unterscheidung', 'Entwicklungsbereiche unterscheiden', 1, 'Körperkraft', 'Feinmotorik', 'Wahrnehmung'],
    ['beobachtung', 'Konkrete Beobachtung', 2, 'Koordination', 'beobachten', 'Beobachtung'],
  ]),
  task('bk1-lf3/bindung', 'basic', 5, [
    ['beziehung', 'Kontakt, Kommunikation und Zusammenarbeit', 0, 'Kommunikation', 'Kontakt', 'Zusammenarbeit'],
    ['naehe', 'Nähe und Sicherheit', 1, 'Nähe', 'Naehe', 'Sicherheit', 'Unsicherheit'],
    ['bezug', 'Mehrere Bezugspersonen', 2, 'Bezugsperson', 'Bezugspersonen'],
    ['merkmale', 'Merkmale einer Bindungsbeziehung', 4, 'Stabilität', 'Stabilitaet', 'Verbundenheit'],
  ]),
  task('bk1-lf3/bindungsphasen', 'intermediate', 5, [
    ['vorbindung', 'Vorbindungsphase', 0, 'Vorbindungsphase', 'Vorbindung'],
    ['beginn', 'Beginnende Bindungsphase', 1, 'beginnende Bindungsphase', 'vertraute Personen'],
    ['eindeutig', 'Eindeutige Bindung', 2, 'eindeutige Bindung', 'Fremdeln', 'Trennungsangst', 'Trennungsängste'],
    ['reziprok', 'Reziproke Beziehung', 3, 'reziproke Beziehung', 'Wünsche', 'sprachlich'],
  ]),
  task('bk1-lf3/feinfuehligkeit', 'basic', 4, [
    ['wahrnehmung', 'Wahrnehmung', 0, 'Wahrnehmung', 'Signale bemerken', 'Blickkontakt'],
    ['interpretation', 'Richtige Interpretation', 1, 'Interpretation', 'Bedürfnislage', 'deuten'],
    ['antwort', 'Angemessene Antwort', 2, 'angemessene Antwort', 'Bedürfnis', 'Entwicklungsstand'],
    ['promptheit', 'Promptheit', 3, 'Promptheit', 'zeitnah', 'zeitnah reagieren'],
  ]),
  task('bk1-lf3/sicherheit-exploration', 'intermediate', 5, [
    ['sensitivitaet', 'Sensitivität', 0, 'Sensitivität', 'Sensitivitaet', 'Gefühle wahrnehmen'],
    ['strukturierung', 'Strukturierung', 1, 'Strukturierung', 'Orientierung', 'Hilfestellung'],
    ['intrusivitaet', 'Nicht-Intrusivität', 2, 'Nicht-Intrusivität', 'Nichtintrusivität', 'Autonomie'],
    ['feindseligkeit', 'Nicht-Feindseligkeit', 3, 'Nicht-Feindseligkeit', 'wertschätzend', 'Abwertung'],
  ]),
  task('bk1-lf3/resilienz', 'advanced', 6, [
    ['bewaltigung', 'Fähigkeiten und soziale Unterstützung', 0, 'soziale Unterstützung', 'Bewältigung', 'Bezugspersonen'],
    ['faktoren', 'Risiko- und Schutzfaktoren', 1, 'Risikofaktoren', 'Schutzfaktoren', 'Wahrscheinlichkeit', 'Wahrscheinlichkeiten'],
    ['kompensation', 'Kompensatorische Beziehungserfahrungen', 2, 'kompensatorische Beziehungserfahrungen', 'verlässliche Erfahrungen'],
    ['grenzen', 'Grenzen der Kompensation', 5, 'Bindungserfahrungen', 'Beziehungserfahrungen', 'Kompensation'],
  ]),
  task('bk2-lf1/bilder', 'basic', 4, [
    ['wechselwirkung', 'Wechselwirkung durch Rückmeldungen', 0, 'Rückmeldung', 'Rueckmeldung', 'Rückmeldungen', 'Auftreten'],
    ['gespraech', 'Fragebogen als Gesprächsanlass', 1, 'Gesprächsanlass', 'Fragebogen', 'Bewertungen'],
  ]),
  task('bk2-lf1/feedbackpraxis', 'advanced', 6, [
    ['johari', 'Der blinde Fleck', 0, 'blinder Fleck', 'Johari'],
    ['situativ', 'Geltungsbereich begrenzen', 1, 'Geltungsbereich', 'Wirkung', 'Beobachtung'],
    ['abschluss', 'Eine Rückmeldung abschließen', 3, 'Erprobung', 'zusammenfassen', 'überprüfbar'],
  ]),
  task('bk2-lf2/trennen', 'intermediate', 5, [
    ['etiketten', 'Beschreibung statt Etikett', 1, 'Wortlaut', 'Etikett', 'Reihenfolge'],
    ['beschreibung', 'Sachliche Beschreibung', 2, 'Beobachtung', 'Kontext', 'Reihenfolge'],
    ['hypothese', 'Deutung als Hypothese', 3, 'Hypothese', 'Hypothesen', 'Deutung'],
    ['protokoll', 'Getrennt dokumentieren', 4, 'Beobachtungsprotokoll', 'getrennt'],
  ]),
  task('bk2-lf2/fehler', 'advanced', 6, [
    ['verstaerkung', 'Verstärkung von Beobachtungsfehlern', 0, 'Typisierung', 'Erwartung', 'Erwartungen'],
    ['unterscheiden', 'Fehlerarten unterscheiden', 1, 'logischer Fehler', 'Typisierung'],
    ['gegenmassnahmen', 'Gezielte Gegenmaßnahmen', 2, 'Gegenmaßnahmen', 'Gegenmassnahmen', 'weitere Situationen'],
  ]),
  task('bk2-lf3/zuhoeren', 'basic', 4, [
    ['paraphrase', 'Paraphrase und Spiegeln', 0, 'paraphrasieren', 'Paraphrase', 'Gefühle spiegeln'],
    ['fragen', 'Fragen passend einsetzen', 1, 'offene Frage', 'offene Fragen', 'Fakten klären'],
    ['grenzen', 'Zuhören und Grenze verbinden', 2, 'Grenze', 'Beleidigung', 'Beleidigungen'],
  ]),
  task('bk2-lf3/vorbereiten', 'intermediate', 5, [
    ['anlass', 'Anlass und Ziel trennen', 0, 'Anlass', 'Beobachtungen abgleichen'],
    ['beobachten', 'Beobachtungen vorbereiten', 1, 'konkrete Situationen', 'Stärken', 'Rahmenbedingungen'],
    ['rahmen', 'Gesprächsrahmen gestalten', 2, 'geschützter Ort', 'geschützten Ort', 'ausreichend Zeit'],
  ]),
  task('bk2-lf4/spiel', 'basic', 4, [
    ['freiheit', 'Entscheidungsfreiheit im Freispiel', 0, 'Freispiel', 'Material', 'Partner'],
    ['entwicklung', 'Entwicklung durch Spiel', 1, 'Motorik', 'Problemlösen', 'Aushandlung'],
    ['merkmale', 'Sechs Spielmerkmale', 2, 'Zweckfreiheit', 'Anspannung', 'Entspannung', 'Als-ob'],
  ]),
  task('bk2-lf4/freispiel', 'intermediate', 5, [
    ['bedeutung', 'Bedeutung des Freispiels', 0, 'Selbstwirksamkeit', 'Selbstständigkeit', 'Kompromisse'],
    ['zeit', 'Zeit und Dauer', 1, 'ununterbrochene Phasen', 'Spielzeit', 'ausreichend Zeit'],
    ['raum', 'Raum und Material', 2, 'Spielbereiche', 'Rückzug', 'Material'],
    ['begleitung', 'Begleitung und Grenzen', 3, 'erreichbare Fachkraft', 'Einstieg', 'Grenzen'],
  ]),
  task('bk2-lf4/wettbewerb', 'intermediate', 5, [
    ['unterschied', 'Wettkampf, Kooperation und Zufall', 0, 'Wettkampf', 'Kooperation', 'Zufall'],
    ['verlieren', 'Umgang mit Verlieren', 1, 'Selbstwert', 'Verlieren', 'Enttäuschung'],
    ['gestaltung', 'Wettbewerb gestalten', 2, 'Beteiligungschancen', 'verständliche Regeln', 'Anforderungen'],
  ]),
  task('bk2-lf4/raeume', 'advanced', 6, [
    ['zugang', 'Übersicht und Zugang zu Materialien', 0, 'Materialplätze', 'erreichbar', 'Übersicht'],
    ['beduerfnisse', 'Unterschiedliche Bedürfnisse', 1, 'Rückzug', 'Bewegung', 'Hindernisse'],
    ['mitbestimmung', 'Partizipation bei der Raumplanung', 7, 'Partizipation', 'Lieblingsorte', 'mitbestimmen'],
  ]),
  task('mathematik-regression/korrelation', 'advanced', 6, [
    ['richtung', 'Richtung des Zusammenhangs', 0, 'gleichsinnig', 'gegensinnig', 'positiv', 'negativ'],
    ['rechnung', 'Reihenfolge der Berechnung', 2, 'Quotient', 'Wurzel', 'Vorzeichen'],
    ['staerke', 'Stärke und Betrag', 3, 'Betrag', 'Stärke', 'Staerke'],
  ]),
];

export const blurtingPath = (task: Pick<BlurtingTask, 'id'>) => '/blurting/' + task.id;
export const blurtingTaskById = new Map(tasks.map(task => [task.id, task]));

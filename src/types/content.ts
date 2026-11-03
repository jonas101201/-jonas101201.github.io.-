import { z } from 'zod';
const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const text = z.string().trim().min(1);
const scope = { subjectId: id, learningFieldId: id.optional(), topicId: id.optional() };
export const SubjectSchema = z.object({ id, title: text, subtitle: text, color: z.enum(['violet','blue','rose','amber','teal','orange','cyan']), symbol: text });
export const LearningFieldSchema = z.object({ id, subjectId: id, title: text, number: z.number().int().positive(), description: text });
export const TopicSchema = z.object({ id, ...scope, title: text });
export const MaterialSchema = z.object({ id, ...scope, title: text, description: text, kind: z.enum(['Lernzettel','Arbeitsblatt','Zusammenfassung','Präsentation','Unterrichtsdatei']), fileType: z.enum(['PDF','TXT','PPTX','DOCX','ZIP','PNG']), path: text, tags: z.array(text), publishedAt: z.iso.date(), example: z.boolean(), originalFilename: z.string().regex(/^[^/\\<>:"|?*]+$/).refine(name => !Array.from(name).some(char => char.charCodeAt(0) < 32)).optional(), pageCount: z.number().int().positive().optional(), sizeBytes: z.number().int().positive().optional(), sha256: z.string().regex(/^[a-f0-9]{64}$/).optional(), preview: z.object({ path: text, pageCount: z.number().int().positive(), sizeBytes: z.number().int().positive(), sha256: z.string().regex(/^[a-f0-9]{64}$/) }).optional() });
const option = z.object({ id, text });
const materialReferences = { materialIds: z.array(id).min(1).optional() };
const questionBase = { id, prompt: text, explanation: text, ...materialReferences };
const choiceFields = { options: z.array(option).min(2), correctOptionIds: z.array(id).min(1) };
export const QuestionSchema = z.discriminatedUnion('type', [
  z.object({ ...questionBase, type: z.literal('single'), ...choiceFields }),
  z.object({ ...questionBase, type: z.literal('multiple'), ...choiceFields }),
  z.object({ ...questionBase, type: z.literal('boolean'), ...choiceFields }),
  z.object({ ...questionBase, type: z.literal('matching'), pairs: z.array(z.object({ id, left: text, right: text })).min(2) }),
]);
export const QuizSchema = z.object({ id, ...scope, title: text, description: text, example: z.boolean(), sources: z.array(z.string().url()), questions: z.array(QuestionSchema).min(1), ...materialReferences });
export const FlashcardSchema = z.object({ id, front: text, back: text, ...materialReferences });
export const FlashcardSetSchema = z.object({ id, ...scope, title: text, description: text, example: z.boolean(), cards: z.array(FlashcardSchema).min(1), ...materialReferences });
export const CatalogSchema = z.object({ subjects: z.array(SubjectSchema), learningFields: z.array(LearningFieldSchema), topics: z.array(TopicSchema), materials: z.array(MaterialSchema), quizzes: z.array(QuizSchema), flashcardSets: z.array(FlashcardSetSchema) });
export type Subject = z.infer<typeof SubjectSchema>;
export type LearningField = z.infer<typeof LearningFieldSchema>;
export type Topic = z.infer<typeof TopicSchema>;
export type Material = z.infer<typeof MaterialSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type Flashcard = z.infer<typeof FlashcardSchema>;
export type FlashcardSet = z.infer<typeof FlashcardSetSchema>;
export type Catalog = z.infer<typeof CatalogSchema>;

import { useI18n } from '../i18n/context';
import { HashRouter, Route, Routes, Link } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { ProgressProvider } from '../hooks/ProgressProvider';
import { ClassroomPage } from '../pages/ClassroomPage';
import { ExamPage } from '../pages/ExamPage';
import { Dashboard } from '../pages/Dashboard';
import { SubjectPage, SubjectsPage } from '../pages/Subjects';
import { MaterialsPage } from '../features/materials/MaterialsPage';
import { MaterialPage } from '../features/materials/MaterialPage';
import { QuizList, QuizPage } from '../features/quizzes/QuizPages';
import { FlashcardList, FlashcardPage } from '../features/flashcards/FlashcardPages';
import { SearchPage } from '../pages/SearchPage';
import { AboutPage } from '../pages/AboutPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { StudySheetList, StudySheetPage } from '../features/study-sheets/StudySheetPages';
import { EmptyState } from '../components/ui';
export function App() {
  const { tr } = useI18n();
  return <HashRouter><ProgressProvider><Routes><Route element={<AppLayout/>}>
    <Route index element={<Dashboard/>}/><Route path="faecher" element={<SubjectsPage/>}/>
    <Route path="faecher/:subjectId" element={<SubjectPage/>}/><Route path="faecher/:subjectId/lernfelder/:fieldId" element={<SubjectPage/>}/>
    <Route path="materialien" element={<MaterialsPage/>}/><Route path="materialien/:id" element={<MaterialPage/>}/>
    <Route path="lernzettel" element={<StudySheetList/>}/><Route path="lernzettel/:id" element={<StudySheetPage/>}/><Route path="lernzettel/:id/:topicId" element={<StudySheetPage/>}/>
    <Route path="quizze" element={<QuizList/>}/><Route path="quizze/:id" element={<QuizPage/>}/>
    <Route path="karteikarten" element={<FlashcardList/>}/><Route path="karteikarten/:id" element={<FlashcardPage/>}/>
    <Route path="klasse" element={<ClassroomPage/>}/><Route path="pruefungstraining" element={<ExamPage/>}/>
    <Route path="datenschutz" element={<PrivacyPage/>}/>
    <Route path="suche" element={<SearchPage/>}/><Route path="ueber" element={<AboutPage/>}/>
    <Route path="*" element={<EmptyState title="Seite nicht gefunden"><Link className="text-link" to="/">{tr('Zur Übersicht')}</Link></EmptyState>}/>
  </Route></Routes></ProgressProvider></HashRouter>;
}

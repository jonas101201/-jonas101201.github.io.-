import { lazy, Suspense, type ReactNode } from 'react';
import { SettingsPage } from '../pages/SettingsPage';
import { LearnPage } from '../pages/LearnPage';
import { useI18n } from '../i18n/context';
import { HashRouter, Route, Routes, Link } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { ProgressProvider } from '../hooks/ProgressProvider';
import { DatesPage, DateDetailPage } from '../pages/DatesPage';
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
const BlurtingList = lazy(() => import('../features/blurting/BlurtingPages').then(module => ({ default: module.BlurtingList })));
const BlurtingPage = lazy(() => import('../features/blurting/BlurtingPages').then(module => ({ default: module.BlurtingPage })));
const ProgressLayout = lazy(() => import('../features/progression/ProgressLayout').then(module => ({ default: module.ProgressLayout })));
const ProgressStoragePanel = lazy(() => import('../features/progression/ProgressStoragePanel').then(module => ({ default: module.ProgressStoragePanel })));
const ProgressOverview = lazy(() => import('../features/progression/ProgressOverview').then(module => ({ default: module.ProgressOverview })));
const RewardStore = lazy(() => import('../features/progression/RewardStore').then(module => ({ default: module.RewardStore })));
const Studio = lazy(() => import('../features/progression/Studio').then(module => ({ default: module.Studio })));
const Companion = lazy(() => import('../features/progression/Companion').then(module => ({ default: module.Companion })));
function Deferred({ children }: { children: ReactNode }) {
  const { tr } = useI18n();
  return <Suspense fallback={<p role="status">{tr('LernHub wird geladen')}</p>}>{children}</Suspense>;
}

export function App() {
  const { tr } = useI18n();
  return <HashRouter><ProgressProvider><Routes><Route element={<AppLayout/>}>
    <Route index element={<Dashboard/>}/><Route path="lernen" element={<LearnPage/>}/><Route path="einstellungen" element={<SettingsPage/>}/><Route path="speicher" element={<AboutPage section="storage"/>}/><Route path="faecher" element={<SubjectsPage/>}/>
    <Route path="faecher/:subjectId" element={<SubjectPage/>}/><Route path="faecher/:subjectId/lernfelder/:fieldId" element={<SubjectPage/>}/>
    <Route path="materialien" element={<MaterialsPage/>}/><Route path="materialien/:id" element={<MaterialPage/>}/>
    <Route path="lernzettel" element={<StudySheetList/>}/><Route path="lernzettel/:id" element={<StudySheetPage/>}/><Route path="lernzettel/:id/:topicId" element={<StudySheetPage/>}/>
    <Route path="quizze" element={<QuizList/>}/><Route path="quizze/:id" element={<QuizPage/>}/>
    <Route path="karteikarten" element={<FlashcardList/>}/><Route path="karteikarten/:id" element={<FlashcardPage/>}/>
    <Route path="termine" element={<DatesPage/>}/><Route path="termine/:id" element={<DateDetailPage/>}/><Route path="klasse" element={<ClassroomPage/>}/><Route path="pruefungstraining" element={<ExamPage/>}/>
    <Route path="datenschutz" element={<PrivacyPage/>}/>
    <Route path="suche" element={<SearchPage/>}/><Route path="ueber" element={<AboutPage section="info"/>}/>
    <Route path="blurting" element={<Deferred><BlurtingList/></Deferred>}/><Route path="blurting/:id" element={<Deferred><BlurtingPage/></Deferred>}/>
    <Route path="fortschritt" element={<Deferred><ProgressLayout/></Deferred>}>
      <Route index element={<Deferred><ProgressOverview/></Deferred>}/><Route path="store" element={<Deferred><RewardStore/></Deferred>}/><Route path="studio" element={<Deferred><Studio/></Deferred>}/><Route path="speicher" element={<Deferred><ProgressStoragePanel/></Deferred>}/><Route path="begleiter" element={<Deferred><Companion/></Deferred>}/>
    </Route>
    <Route path="*" element={<EmptyState title="Seite nicht gefunden"><Link className="text-link" to="/">{tr('Zur Übersicht')}</Link></EmptyState>}/>
  </Route></Routes></ProgressProvider></HashRouter>;
}

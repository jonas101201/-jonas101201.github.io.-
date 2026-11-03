import { BookOpen, Calculator, Cross, Globe2, Layers, Users } from 'lucide-react';
export function SubjectIcon({ subjectId, size = 28 }: { subjectId: string; size?: number }) {
  const Icon = ({ bk1: Layers, bk2: Layers, deutsch: BookOpen, mathematik: Calculator, englisch: Globe2, religion: Cross, sozialkunde: Users })[subjectId] ?? BookOpen;
  return <Icon size={size} strokeWidth={1.7}/>;
}

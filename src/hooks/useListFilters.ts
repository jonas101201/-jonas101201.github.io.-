import { useLocation, useSearchParams } from 'react-router-dom';
import { catalog } from '../data/catalog';

export function useListFilters(subjectId?: string, fieldId?: string) {
  const [params, update] = useSearchParams();
  const { state } = useLocation();
  const requestedSubject = params.get('fach');
  const subject = subjectId ?? catalog.subjects.find(item => item.id === requestedSubject)?.id ?? '';
  const fields = catalog.learningFields.filter(item => item.subjectId === subject);
  const requestedField = params.get('lernfeld');
  const field = fieldId ?? fields.find(item => item.id === requestedField)?.id ?? '';

  function setFilters(values: Record<string, string>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (next.toString() !== params.toString()) update(next, { replace: true, state });
  }
  return {
    params, subject, field, fields, setFilters,
    setSubject: (value: string) => setFilters({ fach: value, lernfeld: '' }),
    setField: (value: string) => setFilters({ lernfeld: value }),
  };
}

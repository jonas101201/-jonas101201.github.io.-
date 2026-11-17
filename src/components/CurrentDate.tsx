import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/context';

export function CurrentDate() {
  const { locale } = useI18n();
  const [today, setToday] = useState(() => new Date());
  useEffect(() => {
    let timer: number;
    function schedule() {
      window.clearTimeout(timer);
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = window.setTimeout(refresh, midnight.getTime() - now.getTime() + 50);
    }
    function refresh() {
      setToday(new Date());
      schedule();
    }
    function onVisible() { if (!document.hidden) refresh(); }
    schedule();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return <time dateTime={localDate}>{new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(today)}</time>;
}

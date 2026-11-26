import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/context';
import { MAX_BACKUP_BYTES, parseProgressBackup, type ProgressBackup } from './storage';
import { useProgression } from './store';
import { useProgressionConsent } from './useProgressionConsent';

export function ProgressStoragePanel() {
  const progress = useProgression();
  const activeConsent = useProgressionConsent();
  const { tr, locale } = useI18n();
  const [includeTexts, setIncludeTexts] = useState(false);
  const [backup, setBackup] = useState<ProgressBackup | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const actionPending = useRef(false);
  const selection = useRef(0);

  async function run(action: () => Promise<string>) {
    if (actionPending.current) return;
    actionPending.current = true;
    setBusy(true);
    setStatus('');
    try { setStatus(await action()); }
    catch { setStatus('Die Aktion konnte nicht abgeschlossen werden.'); }
    finally { setBusy(false); actionPending.current = false; }
  }

  async function preview(file?: File) {
    const id = ++selection.current;
    setBackup(null);
    setStatus('');
    if (!file) return;
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error('size');
      const parsed = parseProgressBackup(await file.text());
      if (id === selection.current) setBackup(parsed);
    } catch {
      if (id === selection.current) setStatus('Die Datei ist zu groß, ungültig oder hat eine nicht unterstützte Version.');
    }
  }

  async function download() {
    const data = await progress.makeBackup(progress.allowTexts && includeTexts);
    if (!data) return 'Die Sicherung konnte nicht erstellt werden.';
    const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lernhub-progress.json';
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    return 'Sicherung erstellt.';
  }

  return <section className="glass prose progress-section" aria-labelledby="progress-storage-heading">
    <h2 id="progress-storage-heading">{tr('Lokaler Progress-Speicher')}</h2>
    <p>{tr('Speichere Lernabschlüsse, Belohnungen und dein Design freiwillig in diesem Browser. Alle Lernformate bleiben ohne Aktivierung verfügbar.')}</p>
    <p>{tr('Browserdaten bleiben bis zur Löschung lokal auf diesem Gerät. Für einen Wechsel auf ein anderes Gerät kannst du eine Sicherung exportieren. Lokale Daten sind veränderbar.')}</p>
    <Link className="text-link" to="/datenschutz">{tr('Datenschutz')}</Link>
    {!progress.ready && <p role="status">{tr('Lokaler Speicher wird geprüft …')}</p>}
    {progress.error && <p role="alert">{tr(progress.error)}</p>}
    {progress.ready && !progress.enabled && !activeConsent && (progress.deletionPending
      ? <button className="button secondary" disabled={busy} onClick={() => void run(async () => await progress.revoke() ? 'Progress-Daten gelöscht.' : 'Löschen fehlgeschlagen.')}>{tr('Löschen erneut versuchen')}</button>
      : <button className="button primary" disabled={busy} onClick={() => void run(async () => await progress.enable() ? 'Progress aktiviert.' : 'Speicherung konnte nicht aktiviert werden.')}>{tr('Progress freiwillig aktivieren')}</button>)}
    {progress.enabled && <>
      <p>{tr('Progress ist aktiviert.')}</p>
      <label className="settings-check"><input type="checkbox" checked={progress.allowTexts} disabled={busy} onChange={event => {
        const checked = event.currentTarget.checked;
        void run(async () => {
          if (!await progress.setAllowTexts(checked)) return 'Speicherwahl konnte nicht gespeichert werden.';
          if (!checked) setIncludeTexts(false);
          return checked ? 'Textspeicherung aktiviert.' : 'Gespeicherte Abruftexte gelöscht.';
        });
      }}/>{tr('Abruftexte und Entwürfe separat speichern')}</label>
      <p>{tr('Beim Ausschalten der Textspeicherung werden gespeicherte Texte und Entwürfe gelöscht. Selbsteinschätzungen bleiben im Lernverlauf.')}</p>
      <details><summary>{tr('Sicherung und Import')}</summary>
        {progress.allowTexts && <label className="settings-check"><input type="checkbox" checked={includeTexts} onChange={event => setIncludeTexts(event.target.checked)}/>{tr('Abruftexte in die Sicherung aufnehmen')}</label>}
        <div className="progress-actions">
          <button className="button secondary" disabled={busy} onClick={() => void run(download)}>{tr('JSON-Sicherung herunterladen')}</button>
          <button className="button secondary" disabled={busy} onClick={() => void run(async () => {
            const result = await progress.requestPersistence();
            return result === 'granted' ? 'Der Browser schützt diese Daten besser vor automatischer Bereinigung.'
              : 'Der Browser hat keinen zusätzlichen Speicherschutz bestätigt.';
          })}>{tr('Speicherschutz beim Browser anfragen')}</button>
        </div>
        <label className="settings-check">{tr('Sicherung zur Vorschau wählen')}<input type="file" accept=".json,application/json" disabled={busy} onChange={event => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          void preview(file);
        }}/></label>
        {backup && <div className="notice">
          <p>{tr('Sicherung vom {0} · {1} XP · {2} HUB Credits · {3} Lernabschlüsse · {4} Texte', [
            new Date(backup.exportedAt).toLocaleDateString(locale), backup.state.xp, backup.state.credits, backup.state.events.length, backup.drafts?.length ?? 0,
          ])}</p>
          <p>{tr('Beim Import wird der aktuelle Progress einschließlich gespeicherter Entwürfe ersetzt. Bereits heruntergeladene Sicherungen bleiben erhalten.')}</p>
          {Boolean(backup.drafts?.length) && !progress.allowTexts && <p>{tr('Aktiviere zuerst die separate Textspeicherung, um diese Sicherung mit Texten zu importieren.')}</p>}
          <div className="progress-actions">
            <button className="button primary" disabled={busy || Boolean(backup.drafts?.length && !progress.allowTexts)} onClick={() => void run(async () => {
              if (!await progress.restoreBackup(backup)) return 'Import fehlgeschlagen. Die Sicherung wurde nicht übernommen.';
              setBackup(null);
              return 'Progress aus der Sicherung wiederhergestellt.';
            })}>{tr('Progress überschreiben und importieren')}</button>
            <button className="button secondary" disabled={busy} onClick={() => setBackup(null)}>{tr('Abbrechen')}</button>
          </div>
        </div>}
      </details>
    </>}
    {(progress.enabled || activeConsent) && (confirmDelete ? <div className="notice">
        <p>{tr('Progress ausschalten und lokal gespeicherte Progress-Daten und Texte löschen?')}</p>
        <div className="progress-actions">
          <button className="button secondary" disabled={busy} onClick={() => void run(async () => {
            const deleted = await progress.revoke();
            setConfirmDelete(false);
            setBackup(null);
            setIncludeTexts(false);
            return deleted ? 'Progress-Daten gelöscht.' : 'Löschen fehlgeschlagen.';
          })}>{tr('Jetzt löschen und deaktivieren')}</button>
          <button className="button secondary" disabled={busy} onClick={() => setConfirmDelete(false)}>{tr('Abbrechen')}</button>
        </div>
      </div> : <button className="button secondary" disabled={busy} onClick={() => setConfirmDelete(true)}>{tr('Progress deaktivieren und löschen')}</button>)}
    <p role="status">{tr(status)}</p>
  </section>;
}

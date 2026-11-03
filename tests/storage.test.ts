import { describe,it,expect } from 'vitest';
import { emptyProgress } from '../src/types/progress';
import { readProgress,writeProgress,STORAGE_KEY,type StoragePort } from '../src/utils/storage';
function memory():StoragePort {const data=new Map<string,string>();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>{data.set(key,value);}};}
describe('Lokaler Lernfortschritt',()=>{
  it('startet ohne erfundene Nutzerstatistiken',()=>{expect(readProgress(memory())).toEqual({progress:emptyProgress(),warning:null});});
  it('persistiert Ergebnisse und Kartenbewertungen',()=>{const storage=memory();const p=emptyProgress();p.quizResults.push({id:'attempt-1',quizId:'spielformen-quiz',date:'2026-11-03T10:00:00.000Z',mode:'exam',score:1,total:2,wrongQuestionIds:['symbol']});p.cards['spielformen-karten:symbolspiel']={status:'known',reviews:1,updatedAt:'2026-11-03T10:00:00.000Z'};expect(writeProgress(storage,p)).toBe(true);expect(readProgress(storage)).toEqual({progress:p,warning:null});});
  it.each(['{kaputt','null','{}',JSON.stringify({...emptyProgress(),version:2})])('behandelt beschädigte oder inkompatible Daten: %s',value=>{const s=memory();s.setItem(STORAGE_KEY,value);const r=readProgress(s);expect(r.warning).toBeTruthy();expect(r.progress).toEqual(emptyProgress());expect(s.getItem(STORAGE_KEY)).toBe(value);});
  it('behandelt gesperrten Speicher und Quotenfehler',()=>{const s:StoragePort={getItem:()=>{throw new Error('blocked');},setItem:()=>{throw new Error('quota');}};expect(readProgress(s).warning).toBeTruthy();expect(writeProgress(s,emptyProgress())).toBe(false);});
  it('schreibt keine ungültigen Ergebnisse',()=>{const p=emptyProgress();p.quizResults.push({id:'a',quizId:'quiz',date:'2026-11-03T10:00:00.000Z',mode:'learn',score:4,total:2,wrongQuestionIds:[]});expect(writeProgress(memory(),p)).toBe(false);});
  it('lässt sich auf leere Fortschritte zurücksetzen',()=>{const s=memory();s.setItem(STORAGE_KEY,'kaputt');expect(writeProgress(s,emptyProgress())).toBe(true);expect(readProgress(s).warning).toBe(null);});
});

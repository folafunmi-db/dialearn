'use client';
import {useEffect,useState} from 'react';
import {defaults,validPrefs,storageKey,type Preferences} from '@/lib/preferences';
import type {Stage} from '@/lib/stages';
import type {Lang} from '@/lib/content';
import {ui} from '@/lib/i18n';
import {SiteHeader} from './site-header';
import {LearningSettings} from './learning-settings';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from './ui/dialog';
import {DirectionProvider} from './ui/direction';
export function StandaloneHeader({active,lang,onLanguage,onStageChange,onPreferencesChange}:{active:'community'|'explore'|'explainers';lang:Lang;onLanguage?:(lang:Lang)=>void;onStageChange?:(stage:Stage)=>void;onPreferencesChange?:(prefs:Preferences)=>void}){
 const [prefs,setPrefs]=useState({...defaults,lang}),[open,setOpen]=useState(false);
 useEffect(()=>{document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';try{const next={...validPrefs(JSON.parse(localStorage.getItem(storageKey)||'{}').preferences),lang};setPrefs(next);onStageChange?.(next.stage);onPreferencesChange?.(next);document.documentElement.classList.toggle('large-text',next.large);document.documentElement.classList.toggle('still-mode',next.motion||next.lowData);}catch{}},[lang]);
 function preference<K extends keyof Preferences>(key:K,value:Preferences[K]){const next={...prefs,[key]:value};setPrefs(next);onPreferencesChange?.(next);if(key==='stage')onStageChange?.(value as Stage);if(key==='lang'){if(onLanguage)onLanguage(value as Lang);else window.location.assign(`/read/${value}/`);}try{const stored=JSON.parse(localStorage.getItem(storageKey)||'{}');localStorage.setItem(storageKey,JSON.stringify({...stored,preferences:next}));}catch{}document.documentElement.dataset.theme=next.theme;document.documentElement.classList.toggle('dark',next.theme==='dark');document.documentElement.classList.toggle('large-text',next.large);document.documentElement.classList.toggle('still-mode',next.motion||next.lowData);}
 return <DirectionProvider direction={prefs.lang==='ar'?'rtl':'ltr'}><SiteHeader active={active} lang={prefs.lang} theme={prefs.theme} stage={prefs.stage} onStage={stage=>preference('stage',stage)} onLanguage={value=>preference('lang',value)} onTheme={()=>preference('theme',prefs.theme==='dark'?'light':'dark')} onSettings={()=>setOpen(true)}/><Dialog open={open} onOpenChange={setOpen}><DialogContent className="dialog"><DialogTitle className="sr-only">{ui[prefs.lang].settings}</DialogTitle><DialogDescription className="sr-only">{ui[prefs.lang].settingsIntro}</DialogDescription><LearningSettings prefs={prefs} preference={preference} onDone={()=>setOpen(false)}/></DialogContent></Dialog></DirectionProvider>;
}

'use client';
import {useEffect,useState} from 'react';
import {StandaloneHeader} from '../standalone-header';
import {explainers} from '@/lib/explainers';
import {explainerStories} from '@/lib/explainer-stories';
import {validPrefs,storageKey} from '@/lib/preferences';
import type {Lang} from '@/lib/content';
import {ExplainerThumbnail} from './thumbnail';
import {Icon} from '../icons';
export function ExplainersGallery(){
 const [lang,setLang]=useState<Lang>('en');
 useEffect(()=>{try{setLang(validPrefs(JSON.parse(localStorage.getItem(storageKey)||'{}').preferences).lang);}catch{}},[]);
 return <><StandaloneHeader active="explainers" lang={lang} onLanguage={setLang}/>
  <main lang="en" dir="ltr" className="explainers-gallery ex-story-gallery site-content">
   <section className="explainers-intro"><div><p className="eyebrow">SMALL QUESTIONS. BRILLIANT CONNECTIONS.</p><h1>You’ve seen it happen.<br/><span>Now see why.</span></h1><p>A turning wheel. A swinging pendulum. A photo that won’t focus. Follow the story, change something, and make the idea your own.</p></div><div className="ex-gallery-method"><span>01 <strong>Notice</strong></span><span>02 <strong>Follow</strong></span><span>03 <strong>Try</strong></span><span>04 <strong>Connect</strong></span><p>Four small steps.<br/>One satisfying “oh, that’s how.”</p></div></section>
   {lang!=='en'?<p className="source-notice">Lessons are currently in English. Navigation and learning settings remain available in your selected language.</p>:null}
   <a className="ex-featured-story" href="/explainers/car-differential/"><div className="ex-featured-copy"><p className="eyebrow">START WITH A SURPRISE / CAR DIFFERENTIAL</p><h2>A corner is a<br/><em>clever problem.</em></h2><p>Two wheels travel different distances. One engine drives them both. So what gives?</p><span className="ex-featured-cta">Find the connection <Icon name="arrow" size={20}/></span></div><div className="ex-featured-art"><svg className="ex-road-lines" viewBox="0 0 520 350" aria-hidden="true"><path d="M-40 310C130 310 80 55 340 55H560M-40 350C175 350 135 110 340 110H560"/><path d="M-40 330C155 330 110 83 340 83H560" strokeDasharray="9 12"/></svg><ExplainerThumbnail id="car-differential"/><div className="ex-featured-equation"><span>LEFT WHEEL</span><strong>+ </strong><span>RIGHT WHEEL</span><strong>=</strong><span>2 × CARRIER</span></div></div></a>
   <div className="ex-gallery-section-title"><div><p className="eyebrow">PICK A LITTLE MYSTERY</p><h2>Start with something familiar.</h2></div><span>{explainers.length} stories to explore</span></div>
   <section className="explainer-cards" aria-label="Physics explainers">{explainers.map((d,i)=>{const story=explainerStories[d.id];return <a className={`explainer-card ex-story-card ex-story-card-${i%3}`} href={`/explainers/${d.id}/`} key={d.id}><div className="explainer-card-art"><span className="explainer-number">{String(i+1).padStart(2,'0')} / {d.topic}</span><ExplainerThumbnail id={d.id}/><span className="ex-card-action"><Icon name="outward" size={18}/></span></div><div className="explainer-card-copy"><p className="eyebrow">{d.title}</p><h2>{story.hook}</h2><p>{story.context}</p></div></a>;})}</section>
   <p className="explainer-gallery-note"><Icon name="book" size={17}/> Real relationships. Sourced science. Each story includes its equations and model limits. No sign-in or equipment needed.</p>
  </main></>;
}

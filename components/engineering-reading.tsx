import {explainTerms,plainLanguage} from '@/lib/learning-copy';
import type {Stage} from '@/lib/stages';
import {engineeringGuides} from '@/lib/engineering-guides';
import {sources} from '@/lib/content';
import {deviceSources,type DeviceId} from '@/lib/devices';
export function EngineeringReading({id,stage='engineering'}:{id:DeviceId|'phone';stage?:Stage}){const guide=engineeringGuides[id];return <article id={`${id}-engineering`} lang="en" dir="ltr"><p className="eyebrow">{stage==='foundations'?'How the whole object works':stage==='systems'?'Inside the system':'Advanced notebook'}</p>{(['principle','design','manufacture','diagnosis'] as const).map((key,i)=><section key={key}><h3>{['Operating principles','Design & trade-offs','How it is manufactured','Faults & model limits'][i]}</h3><p>{stage==='foundations'?plainLanguage(guide[key]):explainTerms(guide[key])}</p></section>)}{stage==='engineering'?<p>{guide.equation}</p>:null}<h3>Engineering references</h3>{[...sources,...deviceSources].filter(s=>guide.refs.includes(s.id)).map(s=><a key={s.id} href={s.url}>{s.name} · {s.title} ↗</a>)}</article>}

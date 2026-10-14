import {engineeringGuides} from '@/lib/engineering-guides';
import {sources} from '@/lib/content';
import {deviceSources,type DeviceId} from '@/lib/devices';
export function EngineeringReading({id}:{id:DeviceId|'phone'}){const guide=engineeringGuides[id];return <article id={`${id}-engineering`} lang="en" dir="ltr"><p className="eyebrow">Advanced notebook</p>{(['principle','design','manufacture','diagnosis'] as const).map((key,i)=><section key={key}><h3>{['Operating principles','Design & trade-offs','How it is manufactured','Faults & model limits'][i]}</h3><p>{guide[key]}</p></section>)}<p>{guide.equation}</p><h3>Engineering references</h3>{[...sources,...deviceSources].filter(s=>guide.refs.includes(s.id)).map(s=><a key={s.id} href={s.url}>{s.name} · {s.title} ↗</a>)}</article>}

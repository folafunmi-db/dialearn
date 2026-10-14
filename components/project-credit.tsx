import type {Lang} from '@/lib/content';
import {projectPublisher} from '@/lib/project-publishers';
export function ProjectCredit({id,lang,linked=false}:{id:string;lang:Lang;linked?:boolean}){
 const publisher=projectPublisher(id),text=({en:'By',fr:'Par',pt:'Por',ar:'إعداد'})[lang]+' '+publisher.name[lang];
 return linked?<a className="project-credit" href={`/community/?educator=${publisher.id}#project-updates`}>{text}</a>:<span className="project-credit">{text}</span>;
}

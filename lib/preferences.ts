import {languages} from './content';
import type {Lang} from './content';
import {stages,type Stage} from './stages';
import type {PartId} from './content';
export type Preferences={stage:Stage;lang:Lang;lowData:boolean;textOnly:boolean;large:boolean;motion:boolean;theme:'light'|'dark';region:'global'|'nigeria'|'senegal'|'morocco'|'angola'};
export const defaults:Preferences={stage:'foundations',lang:'en',lowData:false,textOnly:false,large:false,motion:false,theme:'light',region:'global'};
export const storageKey='dialearn.v1';
export function validPrefs(value:unknown):Preferences{const v=value as Partial<Preferences>|null;return {stage:v?.stage&&stages.includes(v.stage)?v.stage:'foundations',lang:v?.lang&&Object.keys(languages).includes(v.lang)?v.lang:'en',lowData:v?.lowData===true,textOnly:v?.textOnly===true,large:v?.large===true,motion:v?.motion===true,theme:v?.theme==='dark'?'dark':'light',region:v?.region&&['global','nigeria','senegal','morocco','angola'].includes(v.region)?v.region:'global'};}

'use client';
import type {ReactNode} from 'react';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
export function ChoiceSelect({value,onChange,options,label,id,triggerLabel,placeholder,name,caption,leading}:{value:string|null;onChange:(value:string)=>void;options:{value:string;label:string}[];label:string;id?:string;triggerLabel?:string;placeholder?:string;name?:string;caption?:string;leading?:ReactNode}){
 const selected=triggerLabel?<span>{triggerLabel}</span>:value===null?<span>{placeholder||label}</span>:<SelectValue/>;
 return <Select name={name} value={value} onValueChange={value=>{if(value!==null)onChange(value);}} items={options}><SelectTrigger id={id} aria-label={label} className="ui-select-trigger">{caption?<span className="select-caption-value"><small>{caption}</small>{selected}</span>:leading?<span className="select-inline-value">{leading}{selected}</span>:selected}</SelectTrigger><SelectContent align="start" alignItemWithTrigger={false} className="ui-select-content">{options.map(o=><SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>;
}

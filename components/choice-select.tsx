'use client';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@/components/ui/select';
export function ChoiceSelect({value,onChange,options,label,id,triggerLabel,placeholder}:{value:string|null;onChange:(value:string)=>void;options:{value:string;label:string}[];label:string;id?:string;triggerLabel?:string;placeholder?:string}){
 return <Select value={value} onValueChange={value=>{if(value!==null)onChange(value);}} items={options}><SelectTrigger id={id} aria-label={label} className="ui-select-trigger">{triggerLabel?<span>{triggerLabel}</span>:value===null?<span>{placeholder||label}</span>:<SelectValue/>}</SelectTrigger><SelectContent align="start" alignItemWithTrigger={false} className="ui-select-content">{options.map(o=><SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>;
}

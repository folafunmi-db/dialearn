import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {explainers} from '@/lib/explainers';
import {ExplainerExhibit} from '@/components/explainers/exhibit';
export function generateStaticParams(){return explainers.map(d=>({slug:d.id}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params,d=explainers.find(d=>d.id===slug);return {title:d?`${d.title} · Dialearn Explainers`:'Explainer · Dialearn',description:d?.question};}
export default async function ExplainerPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params,d=explainers.find(d=>d.id===slug);if(!d)notFound();return <ExplainerExhibit id={d.id}/>;}

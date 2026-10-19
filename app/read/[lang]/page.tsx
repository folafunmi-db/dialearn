import {languages,type Lang} from '@/lib/content';
import {LearningReader} from '@/components/learning-reader';
import {notFound} from 'next/navigation';
export function generateStaticParams(){return Object.keys(languages).map(lang=>({lang}));}
export default async function Reader({params}:{params:Promise<{lang:string}>}){const {lang}=await params;if(!Object.keys(languages).includes(lang))notFound();return <LearningReader lang={lang as Lang}/>;}

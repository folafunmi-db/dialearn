import {Home} from '@/components/home';
import {PhoneArt} from '@/components/phone-art';
import {devices,type DeviceId} from '@/lib/devices';
import {notFound} from 'next/navigation';
export function generateStaticParams(){return ['phone',...devices.map(d=>d.id)].map(device=>({device}));}
export async function generateMetadata({params}:{params:Promise<{device:string}>}){const {device}=await params;const name=device==='phone'?'Smartphone':devices.find(d=>d.id===device)?.name.en;return {title:`${name||'Explore'} · Dialearn`};}
export default async function ObjectPage({params}:{params:Promise<{device:string}>}){const {device}=await params;if(device!=='phone'&&!devices.some(d=>d.id===device))notFound();return <Home dedicatedDevice={device as DeviceId|'phone'} phoneArt={device==='phone'?<PhoneArt/>:null}/>;}

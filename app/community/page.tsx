import type {Metadata} from 'next';
import {devices} from '@/lib/devices';
import {Community} from '@/components/community';
export const metadata:Metadata={title:'Learning community · Dialearn',description:'Follow educators, explore schematic lessons, and ask questions with other learners.',robots:{index:false,follow:true}};
export default function CommunityPage(){return <Community objects={devices.map(d=>({id:d.id,name:d.name.en}))}/>;}

import type {Metadata} from 'next';
import {Community} from '@/components/community';
export const metadata:Metadata={title:'Learning community · Dialearn',description:'Subscribe to new projects and propose sourced learning ideas. No account needed.',robots:{index:false,follow:true}};
export default function CommunityPage(){return <Community/>;}

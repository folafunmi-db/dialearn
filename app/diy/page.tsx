import type {Metadata} from 'next';
import {Home} from '@/components/home';
export const metadata:Metadata={title:'DIY lab · Dialearn',description:'Build with Arduino and Raspberry Pi: guided projects and credited maker ideas for young learners, from beginner to advanced.'};
export default function DIYPage(){return <Home phoneArt={null} dedicatedDIY/>}

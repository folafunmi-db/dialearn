import type {Metadata} from 'next';
import {ExplainersGallery} from '@/components/explainers/gallery';
export const metadata:Metadata={title:'Physics Explainers · Dialearn',description:'Explore forces, motion, waves and structures through interactive experiments for young learners, from beginner to advanced.'};
export default function ExplainersPage(){return <ExplainersGallery/>;}

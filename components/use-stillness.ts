'use client';
import {useEffect,useState} from 'react';
export function useStillness(preference:boolean){const [reduced,setReduced]=useState(false);useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);return preference||reduced;}

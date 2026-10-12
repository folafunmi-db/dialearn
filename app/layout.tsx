import type {Metadata} from 'next';
import './globals.css';

export const metadata:Metadata={title:'Dialearn — Everyday things. Extraordinary ideas.',description:'An interactive engineering workshop for curious minds aged 12–18. Explore smartphone anatomy, experiment with energy, and discover the ideas behind everyday technology.',robots:{index:true,follow:true}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><head><meta name="referrer" content="no-referrer"/></head><body>{children}</body></html>}

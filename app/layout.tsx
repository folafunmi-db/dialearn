import type {Metadata} from 'next';
import './globals.css';

export const metadata:Metadata={title:'Dialearn — Everyday things. Extraordinary ideas.',description:'An interactive engineering workshop for curious minds aged 12–18. Explore device anatomy, try Arduino and Raspberry Pi projects, and discover the ideas behind everyday technology.',robots:{index:true,follow:true}};
const themeBootstrap="(function(){try{var mode;try{var data=JSON.parse(localStorage.getItem('dialearn.v1')||'null');mode=data&&data.preferences&&data.preferences.theme;}catch(e){}if(mode!=='dark'&&mode!=='light')mode=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=mode;document.documentElement.classList.toggle('dark',mode==='dark');}catch(e){}})();";
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><head><meta name="referrer" content="no-referrer"/><script dangerouslySetInnerHTML={{__html:themeBootstrap}}/></head><body>{children}</body></html>}

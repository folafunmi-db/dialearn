import type {CSSProperties} from 'react';
export function Icon({name,size=20,style}:{name:string;size?:number;style?:CSSProperties}) {
const paths:Record<string,React.ReactNode>={
 moon:<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>,
 arrow:<><path d="M5 12h14m-6-6 6 6-6 6"/></>,
 down:<path d="m7 10 5 5 5-5"/>,
 globe:<><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></>,
 book:<><path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Z"/><path d="M12 5v15"/></>,
 tune:<><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/></>,
 check:<path d="m5 12 4 4 10-10"/>,
 shield:<><path d="m12 3 8 3v6c0 5-8 9-8 9S4 17 4 12V6l8-3Z"/><path d="m8 12 3 3 5-6"/></>,
 download:<><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></>,
 search:<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
 bolt:<path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z"/>,
 chip:<><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/></>,
 heart:<path d="M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-5 5 8 15 8 15S25 10 20 5Z"/>,
 close:<path d="m6 6 12 12M6 18 18 6"/>,
 speaker:<><path d="M4 9h4l5-4v14l-5-4H4V9Z"/><path d="M17 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/></>,
 bookmark:<path d="M6 3h12v18l-6-4-6 4V3Z"/>,
 outward:<><path d="M8 4h12v12M20 4 4 20"/></>,
 sun:<><circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></>,
 layers:<><path d="m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5"/></>,
 clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
};return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">{paths[name]||paths.layers}</svg>;
}
export function Mark(){return <svg viewBox="0 0 36 36" width="34" height="34" aria-hidden="true"><rect x="3" y="25" width="25" height="7" rx="2.5" fill="currentColor"/><rect x="6" y="18" width="25" height="7" rx="2.5" fill="currentColor" opacity=".72"/><path d="M9 7q5-2 11 2 6-4 12-2v11q-6-2-12 2-6-4-11-2Z" fill="currentColor"/><path d="M20 10v7M13 11q2 0 4 1m7 0q2-1 4-1M8 28.5h15M11 21.5h15" stroke="var(--paper)" strokeWidth="1.5" strokeLinecap="round"/><path d="M4 8V4m-2 2h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>}
export function BatteryDrawing(){return <svg viewBox="0 0 480 260" role="img" aria-label="An illustrated rechargeable battery with electrode layers"><ellipse cx="239" cy="209" rx="115" ry="17" fill="#bac1a9" opacity=".22"/><g transform="translate(108 48) rotate(-12 130 75)"><path d="m0 32 24-20h213l24 20v122l-24 20H24L0 154Z" fill="#496745" stroke="#273b28" strokeWidth="2"/><path d="m0 32 24 20h213l24-20H0Z" fill="#a9ba96"/><path d="M24 52h213v122H24Z" fill="#729161"/><rect x="42" y="69" width="177" height="89" rx="5" fill="#dce5c9"/><path d="M88 24V7h31v17m41 0V7h31v17" fill="#babfa9" stroke="#6f795c" strokeWidth="2"/><path d="m122 84-17 31h19l-5 25 29-35h-21l8-21Z" fill="#5e793f"/><path d="M165 89h36m-36 8h27" stroke="#849777" strokeWidth="3" strokeLinecap="round"/><text x="167" y="135" fill="#48613f" fontSize="14" fontFamily="monospace">Li-ion</text></g></svg>}
export function CameraDrawing(){return <svg viewBox="0 0 480 260" role="img" aria-label="An illustrated phone camera module"><ellipse cx="243" cy="216" rx="95" ry="14" fill="#ad9a86" opacity=".2"/><g transform="translate(133 38)"><path d="m0 34 56-26 142 38v126l-53 32L0 164Z" fill="#b6aa9b" stroke="#61594e" strokeWidth="2"/><path d="m0 34 145 42 53-30-142-38Z" fill="#eee9e0" stroke="#877c6d" strokeWidth="1.5"/><path d="M145 76v128l53-32V46Z" fill="#8f8376"/><ellipse cx="72" cy="110" rx="59" ry="66" transform="rotate(-19 72 110)" fill="#4b4b42" stroke="#e4ded3" strokeWidth="8"/><ellipse cx="72" cy="110" rx="42" ry="47" transform="rotate(-19 72 110)" fill="#747b66" stroke="#242c28" strokeWidth="4"/><ellipse cx="72" cy="110" rx="23" ry="27" transform="rotate(-19 72 110)" fill="#25362f"/><ellipse cx="62" cy="97" rx="10" ry="12" fill="#d2e0c6" opacity=".4"/><path d="m178 173 22 7 13-8v26l-13 9-22-8Z" fill="#c39957"/></g></svg>}

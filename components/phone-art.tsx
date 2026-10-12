import {phoneGroups} from '@/lib/art';
export function PhoneArt(){return <svg className="iso-svg" viewBox="0 0 560 560" role="group" aria-label="Smartphone anatomy"><g>{phoneGroups.map(g=><g key={g.id} data-assembly={g.id} data-open={g.lift} role="button" tabIndex={0} aria-label={g.id} className={`assembly ${g.id}`} dangerouslySetInnerHTML={{__html:g.svg}} />)}</g></svg>}

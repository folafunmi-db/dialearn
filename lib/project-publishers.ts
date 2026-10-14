import type {Lang} from './content';
import {discoveryTypes} from './discovery-types';
// Catalogue publisher credits are distinct from inventors and original source authors.
// Add reviewed educators here and assign only their subsequent projects below.
export const projectPublishers=[{id:'dialearn-team',name:{en:'Dialearn team',fr:'Équipe Dialearn',pt:'Equipa Dialearn',ar:'فريق Dialearn'}}] as const;
export const projectPublisherIds:Record<string,string>={};
export function projectPublisher(projectId:string){return projectPublishers.find(p=>p.id===projectPublisherIds[projectId])||projectPublishers[0];}
export const subscriptionCategories=[...discoveryTypes.map(c=>({id:c.id,names:c.names})),{id:'diy',names:{en:'DIY projects',fr:'Projets DIY',pt:'Projetos DIY',ar:'مشاريع عملية'} as Record<Lang,string>}];

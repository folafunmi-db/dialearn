import type {Lang} from './content';
// Each discovery belongs to one browsing group; DIY builds have their own section.
export const discoveryTypes=[
 {id:'everyday',names:{en:'Everyday tech',fr:'Tech du quotidien',pt:'Tecnologia do dia a dia',ar:'تقنيات يومية'},objects:['phone','wrist-watch','smart-watch','wireless-earbuds','dslr-camera','electric-toothbrush']},
 {id:'home',names:{en:'Home appliances',fr:'Électroménager',pt:'Eletrodomésticos',ar:'أجهزة منزلية'},objects:['refrigerator','inverter-ac','microwave','robot-vacuum','washing-machine','induction-cooktop','coffee-barista']},
 {id:'computing',names:{en:'Computing & gaming',fr:'Informatique et jeux',pt:'Computação e jogos',ar:'الحوسبة والألعاب'},objects:['microprocessor','controller','console','home-console','optical-mouse','laser-printer']},
 {id:'transport',names:{en:'Vehicles & flight',fr:'Véhicules et vol',pt:'Veículos e voo',ar:'المركبات والطيران'},objects:['car','bicycle','drone','car-engine','turbofan','spacecraft-aocs','nuclear-submarine','drone-swarm','autonomous-driving','high-speed-rail']},
 {id:'energy',names:{en:'Power & energy',fr:'Énergie',pt:'Energia',ar:'الطاقة'},objects:['solar','smart-grid','gas-turbine-plant']},
 {id:'infrastructure',names:{en:'Infrastructure',fr:'Infrastructures',pt:'Infraestrutura',ar:'البنية التحتية'},objects:['suspension-bridge','wastewater','skyscraper-hvac','desalination']},
 {id:'industry',names:{en:'Industry & manufacturing',fr:'Industrie et fabrication',pt:'Indústria e fabricação',ar:'الصناعة والتصنيع'},objects:['fluid-catalytic-cracking','bioreactor','factory-line','euv-lithography']},
 {id:'medical',names:{en:'Medical devices',fr:'Dispositifs médicaux',pt:'Dispositivos médicos',ar:'أجهزة طبية'},objects:['mri','hemodialysis','insulin-pump']},
] as const satisfies readonly {id:string;names:Record<Lang,string>;objects:readonly string[]}[];
export type DiscoveryType=typeof discoveryTypes[number]['id'];
export function discoveryType(id:string){return discoveryTypes.find(type=>(type.objects as readonly string[]).includes(id))?.id;}

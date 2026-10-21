import {readFileSync} from 'node:fs';
export const materials=JSON.parse(readFileSync(new URL('../lib/machine-materials.json',import.meta.url)));
const overrides={
 phone:{frame:'aluminium',chip:'pcb',battery:'battery',display:'screen',camera:'plastic',pixels:'screen',touch:'glass',memory:'chip',transistors:'chip',separator:'ceramic'},
 'wrist-watch':{case:'steel',barrel:'brass',train:'brass',hands:'screen',escapement:'brass',balance:'brass',jewels:'ruby',bridges:'steel',crown:'steel'},
 'golden-gate-bearings':{deck:'bridge-paint',cover:'bridge-paint',rubber:'rubber',core:'lead'},
 'suspension-bridge':{towers:'bridge-paint',deck:'steel',cables:'steel'},
 'smart-watch':{case:'graphite',display:'screen',controls:'graphite',processor:'chip',optical:'screen',charging:'copper'},
 'galaxy-watch6-classic':{case:'steel',bezel:'steel',display:'screen',controls:'steel',processor:'chip',optical:'screen',charging:'copper'},
 solar:{panel:'solar-cell',cell:'battery',led:'ceramic',housing:'plastic',charger:'pcb'},
 car:{body:'car-paint',pack:'battery',chassis:'steel'},
 bicycle:{frame:'bike-paint',steering:'steel',wheels:'rubber',drivetrain:'steel'},
 drone:{frame:'carbon',rotors:'plastic',motors:'aluminium',battery:'battery'},
 'spacecraft-aocs':{bus:'thermal-foil',arrays:'solar-cell',propellant:'titanium',torquers:'copper'},
 'microprocessor':{package:'pcb',cores:'silicon',gpu:'silicon',cache:'silicon',registers:'silicon',interconnect:'copper',cooling:'aluminium'},
 'mri':{frame:'white-polymer',table:'white-polymer',magnet:'steel',gradients:'copper',rf:'copper'},
 'washing-machine':{frame:'enamel',drum:'steel',tub:'plastic',door:'glass',dispenser:'white-polymer'},
 refrigerator:{cabinet:'enamel',door:'enamel',compressor:'plastic',condenser:'steel',evaporator:'aluminium'},
 'inverter-ac':{frames:'enamel','indoor-coil':'copper','outdoor-coil':'copper','indoor-fan':'plastic','outdoor-fan':'plastic'},
 microwave:{cavity:'enamel',door:'screen',turntable:'glass',waveguide:'steel'},
 'induction-cooktop':{glass:'screen',coil:'copper',pan:'steel',ferrite:'chip'},
 'home-console':{chassis:'plastic',processor:'chip',memory:'chip',cooling:'aluminium'},
 'robot-vacuum':{chassis:'plastic',bin:'smoke',brush:'rubber',wheels:'rubber'},
 'laser-printer':{frame:'enamel',toner:'plastic',drum:'drum-green',feed:'rubber',transfer:'rubber'},
 'coffee-barista':{frame:'steel',hopper:'smoke',reservoir:'smoke',brewer:'plastic'},
 'dslr-camera':{body:'plastic',lens:'plastic',mirror:'aluminium',sensor:'silicon',shutter:'chip',viewfinder:'glass',controls:'plastic'},
 'optical-mouse':{base:'plastic',shell:'plastic',wheel:'rubber',illumination:'red-plastic',lens:'glass'},
 headphones:{headband:'plastic',cups:'plastic',yokes:'aluminium',cushions:'rubber',drivers:'ceramic',coils:'copper',magnets:'steel'},
 'electric-toothbrush':{handle:'white-polymer',head:'white-polymer',shaft:'steel',seals:'rubber',button:'plastic',charging:'copper'},
 'wireless-earbuds':{shell:'white-polymer',case:'white-polymer',driver:'steel',acoustics:'acoustic-mesh'},
 'factory-line':{robot:'safety-orange',safety:'safety-yellow',conveyor:'rubber',frame:'steel'},
 'nuclear-submarine':{hull:'graphite',reactor:'steel',propulsor:'brass'},
 'high-speed-rail':{carbody:'enamel',track:'steel',bogies:'graphite',pantograph:'steel'},
 'smart-grid':{generation:'solar-cell',transformer:'utility-paint',demand:'concrete',site:'concrete'},
 'hemodialysis':{cabinet:'white-polymer',dialyzer:'ceramic',interfaces:'screen'},
 'insulin-pump':{case:'plastic',reservoir:'glass',display:'screen'},
 'autonomous-driving':{vehicle:'car-paint',cameras:'screen',lidar:'plastic'},
};
export function materialFor(project,part='',component='',explicit){
 if(explicit&&materials[explicit])return explicit;
 if(explicit?.startsWith('diy-'))return explicit;
 const key=component||part;
 if(overrides[project]?.[key])return overrides[project][key];
 const text=key.toLowerCase();
 if(/groundwater|^water$|upstream|permeate|brine/.test(text))return 'water';
 if(/bedrock|^ground$|formation|backfill/.test(text))return 'earth';
 if(/armour|underlayer|^toe$|^crest$|^core$/.test(text)&&project==='lagos-revetment')return 'concrete';
 if(/foundation|raft|piles|pier|concrete|slurry|gallery|deck|seat|structure|walkway|bores|passages|^site$/.test(text))return 'concrete';
 if(/cage|steel|plate|anchor|retainer|bolt|fastener|rail|track|shaft|crank|piston|rod|valve|gimbal|bearing|head|block|pump|vessel|jacket|riser|reactor|condenser|exchanger|fractionator|regenerator|tank|grinder|stirrer/.test(text))return 'steel';
 if(/wire|harness|seal|rubber|belt|tyre|tire|wheel|waterstop|liner|waterproof|cushion/.test(text))return 'rubber';
 if(/copper|coil|winding|busbar|torquer|charging/.test(text))return 'copper';
 if(/turbine|combust|nozzle|preburner|throat|chamber|exhaust|hpt|lpt/.test(text))return 'titanium';
 if(/display|screen|interface/.test(text))return 'screen';
 if(/battery|storage|pack|^cell$/.test(text))return 'battery';
 if(/memory|processor|compute|chip|^imu$/.test(text))return 'chip';
 if(/board|control|radio|sensor|sensing|computer|receiver|meter|inverter|plc|automation|monitor|signal|instrument|gyro|tracker|clock|power/.test(text))return 'pcb';
 if(/gear|barrel|balance|escapement/.test(text))return 'brass';
 if(/glass|lens|window/.test(text))return 'glass';
 if(/housing|shell|cover|case|button|fan|filter|brush|clamp|bin|dock/.test(text))return 'plastic';
 return 'aluminium';
}
const mix=(hex,target,t)=>'#'+[0,2,4].map(i=>Math.round(parseInt(hex.slice(i+1,i+3),16)*(1-t)+target*t).toString(16).padStart(2,'0')).join('');
const dark=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).reduce((a,b)=>a+b,0)/3<85;
export const materialCss=Object.entries(materials).map(([key,{color}])=>`[data-material="${key}"],.iso [data-material="${key}"]{--anatomy-paper:${color};--anatomy-face:${mix(color,255,.08)};--anatomy-top:${mix(color,255,.12)};${[.48,.34,.2,.07].map((v,i)=>`--anatomy-shade-${i}:${mix(color,0,v)};`).join('')}--anatomy-hi:${dark(color)?mix(color,255,.28):mix(color,0,.65)};--anatomy-mid:${mix(color,255,.62)};--anatomy-lo:${mix(color,255,.4)};--anatomy-faint:${mix(color,255,.3)}}`).join('\n');

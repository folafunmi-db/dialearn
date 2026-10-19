import beginnerProjects from './beginner-project-copy.json';
import type {Lang} from './content';
import type {Stage} from './stages';

/** Reviewed teaching copy, chosen locally; no profiling, generation or network call. */
const beginner:Record<string,Record<string,string>>=beginnerProjects;
const phone:Record<string,string>={
 display:'The screen makes pictures using tiny points of light. A separate layer notices where your finger touches the glass.',
 chip:'This small chip follows the instructions that make apps work. The board connects it to the other parts of the phone.',
 camera:'The lens gathers light and directs it onto a sensor. The phone uses the sensor’s signals to make a picture.',
 battery:'The battery stores energy that can power the phone. Charging puts energy back so you can use it again.',
 frame:'The frame supports and protects the parts. Screws, glue and small supports keep everything in place.',
 touch:'This layer notices where your finger touches the screen. It does not make the picture.',
 memory:'This part holds information the phone needs while an app is running.',
 sensor:'This part behind the lens changes light into electrical signals used to make a picture.',
 pixels:'Tiny points of light work together to make the picture on your screen.',
 transistors:'A chip uses huge numbers of tiny electrical switches to carry out instructions.',
 separator:'A thin layer keeps the battery’s two active sides apart while allowing tiny charged particles to pass.',
 pmic:'This chip supplies the different phone parts with the electricity they need.',
 rf:'These circuits help send and receive wireless messages.',
 flash:'This store keeps your apps, photos and files even when the phone is switched off.',
 connector:'A thin flexible strip and small connector carry electrical messages between phone parts.',
 speaker:'A tiny moving surface pushes air back and forth to make sound.',
 haptic:'A small moving weight makes the vibrations you feel when the phone buzzes.',
 lens:'Shaped clear pieces direct light onto the camera’s sensor to make a focused picture.'
};
// Definitions preserve the source's mechanism while making new vocabulary learnable.
const vocabulary:[string,string][]=[
 ['clearances','small gaps that allow parts to move without rubbing or colliding'],['bore','a precisely shaped hole in which another part can move'],['piston','a close-fitting part that slides inside a cylinder'],['crankshaft','a shaft with offset connections that can turn sliding motion into rotation'],['lubrication','using oil or another material to reduce wear and rubbing'],['regenerative','recovering some energy instead of losing all of it as heat'],['rectifier','a circuit that changes alternating electrical flow into one-direction flow'],['electromagnet','a magnet made by an electric current in a coil'],['encoder','a sensor that turns position or movement into electrical information'],['dielectric','an insulating material that can support an electric field'],['photolithography','using a light-made pattern to guide tiny material-processing steps'],['polymer','a material made of long chains of linked molecules'],['resist','a patternable protective coating used while making tiny structures'],['solenoid','a wire coil that creates a magnetic field when current flows'],['differential','a gear mechanism that lets two driven outputs turn at different speeds'],['watt-hours','a unit of stored or transferred energy; one watt delivered for one hour'],['stall current','the current a motor may draw when powered but prevented from turning'],['coil','wire wound into loops'],['reduction','a gear arrangement that makes an output turn more slowly than its input'],
 ['angular momentum','a measure of spinning motion that depends on how mass is arranged and how fast it spins'],
 ['moment of inertia','how strongly an object resists a change in its spinning motion'],
 ['rotational inertia','how strongly an object resists a change in its spinning motion'],
 ['restoring torque','a turning force that acts back towards a resting position'],
 ['torque','the turning effect of a force'],['actuator','a part that turns a control signal into movement'],
 ['actuators','parts that turn control signals into movement'],['transducer','a part that changes one kind of energy or signal into another'],
 ['diaphragm','a thin surface that can move back and forth'],['impeller','a rotating part that pushes a liquid or gas'],
 ['extracorporeal','outside the body'],['permeate','the liquid that passes through a separating layer'],['brine','water with a high concentration of salt'],
 ['membrane','a thin separating layer that lets some substances pass more easily than others'],
 ['electrolyte','a substance through which electrically charged particles can move'],['electrodes','conducting parts where electrical and chemical changes meet'],
 ['ions','tiny particles with an electric charge'],['photodiodes','small electronic parts that respond to light'],
 ['CMOS','a method of making chip circuits, including many camera sensors'],['OLED','a display whose tiny light-making areas emit their own light'],
 ['capacitive','based on changes in how electric charge is stored nearby'],['capacitance','the ability to store electric charge for a given voltage'],
 ['transistors','tiny electronic switches or signal-controlling parts'],['semiconductor','a material whose electrical behaviour can be controlled to make circuits'],
 ['wafer','a thin slice of material on which many chips can be made'],['substrate','the supporting layer beneath other parts'],
 ['die','the small piece of material containing a chip’s circuits'],['latency','the wait before a response or data arrives'],
 ['cache','a small fast store for information likely to be needed soon'],['registers','very small data stores inside a processor'],
 ['PWM','pulse-width modulation: controlling the fraction of time a signal is on'],['duty cycle','the fraction of each repeating cycle for which a signal is on'],
 ['GPIO','a connection a small computer can use to read or send electrical signals'],['I²C','a shared connection that lets chips exchange digital messages'],
 ['debounce','ignoring the brief extra changes a mechanical switch can make during a press'],
 ['voltage','electrical potential difference: the electrical push between two points'],['current','the rate at which electric charge flows'],
 ['resonance','a strong response when repeated pushes match a system’s natural rhythm'],['oscillator','a system that repeats a back-and-forth change'],
 ['escapement','a watch mechanism that releases stored spring energy in small timed steps'],['pinions','small toothed wheels'],
 ['bearing','a support that lets another part move with little friction'],['friction','a force that opposes sliding or attempted sliding between surfaces'],
 ['gimbal','a pivoting support that allows rotation about a chosen direction'],['precession','the slow turning of a spinning object’s axis'],
 ['harmonic','a vibration pattern whose frequency is a whole-number multiple of the lowest one'],['tension','a pulling force along a stretched part'],
 ['displacement','a change in position from a reference point'],['deflection','a change in shape or position under a load'],
 ['elastic','able to return towards its original shape after the force is removed'],['damping','the removal of energy from motion, which helps shaking die down'],
 ['aperture','the opening that lets light into an optical system'],['f-number','focal length divided by the diameter of the light opening; a larger number means a smaller opening'],
 ['focal length','a lens property that helps determine how it focuses light'],['illuminance','how much light arrives on each unit of surface area'],
 ['defocus','blur caused by the light coming to a focus away from the sensor surface'],['paraxial','using rays close to the optical axis at small angles'],
 ['feedback','using a measurement of what happened to adjust what happens next'],['PD','proportional–derivative control: reacting to both an error and how quickly it is changing'],
 ['roll','side-to-side tilt about an object’s front-to-back axis'],['pitch','nose-up or nose-down turning'],['yaw','turning to point left or right'],
 ['thrust','a pushing force produced by accelerating air, water or exhaust'],['oxidizer','a substance that allows fuel to react; this engine uses oxygen'],
 ['combustion','burning that releases energy from a fuel'],['turbine','a wheel with blades turned by a moving gas or liquid'],
 ['compressor','a machine that raises the pressure of a gas'],['condenser','a heat exchanger where a vapour gives out heat and becomes liquid'],
 ['evaporator','a heat exchanger where a fluid takes in heat as it turns into vapour'],['refrigerant','the fluid that carries heat around a cooling system'],
 ['inverter','electronics that turn direct-current power into a controlled alternating-current supply'],
 ['electromagnetic','involving linked electrical and magnetic effects'],['nuclear fission','splitting heavy atomic nuclei, which can release energy'],
 ['gradient','a change in a quantity from one position to another'],['cryogenic','at extremely low temperatures'],
 ['reinforcement','material added to help a structure carry forces'],['raft','a wide foundation slab that shares loads over the ground or piles'],
 ['piles','long foundation supports that reach into the ground'],['seepage','water slowly passing through soil, rock or a structure'],
 ['elastomer','a rubber-like material that can change shape and recover'],['metrology','the science and practice of precise measurement'],
 ['catalyst','a material that speeds up a chemical reaction without being used up by that reaction'],['biomass','living material, such as the microorganisms used in water treatment'],
 ['diffraction','the spreading of waves around edges or through openings'],['aberrations','image errors caused by a real optical system'],
 ['quasi-static','changing slowly enough to treat the forces as nearly balanced at each step'],['kinematic','describing how parts move without calculating the forces causing that movement']
];
const escape=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const patterns=vocabulary.map(([term,meaning])=>({term,meaning,pattern:new RegExp(`\\b${escape(term)}\\b`,'i')}));
const contextVocabulary:Record<string,[string,string][]>= {
 'car-differential':[['carrier','the rotating holder that carries the small inner gears'],['spider','a small gear carried around by the rotating holder'],['mean','the sum of the values divided by how many values there are'],['axle','a shaft along the line through the wheel centres']],
 'drone-balance':[['PD','control that reacts both to tilt error and to how fast the tilt changes'],['gain','how strongly a controller responds to a measured error'],['angular rate','how fast an angle changes'],['roll','side-to-side tilt about the front-to-back axis']],
 'camera-focus':[['iris','the overlapping blades that adjust the lens opening'],['f-number','focal length divided by opening diameter; a bigger number means a smaller opening'],['defocus','blur when light comes together away from the sensor plane'],['illuminance','the amount of light arriving per unit of surface area']],
 'gyroscope':[['precession','the slow turning of the spinning wheel’s axis'],['overhang','the distance the wheel extends from its support']],
 'vibrating-string':[['node','a place that stays still in a standing-wave pattern'],['harmonic','a vibration pattern at a whole-number multiple of the lowest frequency']],
 'pulley-rig':[['sheaves','grooved wheels that guide the rope'],['tackle','the arrangement of rope and pulley wheels'],['reeve','thread the rope through the pulley arrangement']],
 'beam-bending':[['Euler–Bernoulli','a beam model that relates bending to stiffness and loading for small changes in shape'],['deflection','movement away from the unloaded shape']],
 'wrist-watch':[['movement','the complete working mechanism inside a watch'],['crystal','the clear protective cover over the watch face'],['dial','the watch face on which you read the hands'],['crown','the small knob used to wind or set a watch'],['train','a connected sequence of toothed wheels'],['hairspring','a fine spring that returns the balance wheel towards its resting position'],['pallet','a small part that locks and releases the escape wheel']],
 'euv-lithography':[['EUV','extreme ultraviolet: very short-wavelength light used to form tiny patterns'],['reticle','the patterned plate whose image is transferred to the wafer']],
 'spacecraft-aocs':[['attitude','the direction a spacecraft is pointing'],['bus','the spacecraft structure and shared services supporting its equipment']],
 'fluid-catalytic-cracking':[['cracking','breaking large molecules into smaller ones'],['regenerator','the area where built-up material is removed from the catalyst so it can be reused']]
};
export function explainTerms(text:string,context=''){
 const scoped=(contextVocabulary[context]||[]).map(([term,meaning])=>({term,meaning,pattern:new RegExp(`\\b${escape(term)}\\b`,'i')}));
 const found=[...scoped,...patterns].filter(v=>v.pattern.test(text)).slice(0,4);
 if(!found.length)return text;
 return text+'\n\nWords to know: '+found.map(v=>`${v.term}: ${v.meaning}.`).join(' ');
}
export function plainLanguage(text:string){
 // Used for already-authored supporting notes, never for equations, pin labels or ratings.
 let result=text;
 const replacements:[string,string][]=[['electrode layers','electrically active layers'],['electrode','electrically active layer'],['separator','thin separating layer'],['photolithography','using a light pattern to help shape tiny parts'],['lithography','pattern-based shaping of tiny parts'],['polymers','plastic-like materials made of long molecular chains'],['polymer','a plastic-like material made of long molecular chains'],['deposited','laid down in thin layers'],['deposition','laying down thin layers'],['etched','shaped by removing selected material'],['electrochemical','involving chemistry and electricity'],['microfabrication','making very small structures'],['bearing surfaces','smooth supporting surfaces'],['machined','shaped with tools'],['bonded','joined'],['moulded','shaped in a mould'],['inductors','wire coils that store energy in a magnetic field'],['capacitors','parts that store electric charge'],['transceiver','radio sender and receiver'],['sintered','joined from powder using heat'],['laminated','built from joined thin layers'],['diaphragm suspension','flexible support for the thin moving surface'],['extracorporeal','outside-the-body'],['diaphragm','thin moving surface'],['diaphragms','thin moving surfaces'],['actuators','moving control parts'],['actuator','moving control part'],['impeller','bladed rotating part'],['transducers','parts that turn one kind of energy into another'],['photodiodes','light-sensitive parts'],['photodetectors','light-sensitive parts'],['conductors','parts that carry electricity'],['permeate','water that passes through the separating layer'],['brine','saltier water'],['membrane','thin separating layer'],['latency','waiting time'],['torque','turning force'],['propulsor','water-pushing part'],['gantry','supporting frame'],['retains','holds'],['retain','hold'],['locates','positions'],['interfaces','connections'],['interface','connection'],['discrete','separate'],['actuation','movement'],['thermal','heat-related'],['dissipates','spreads out'],['dissipate','spread out'],['oscillator','back-and-forth mechanism'],['synchronous','working to the same timing signal'],['electrodes','electrically active layers'],['electrolyte','material that lets tiny charged particles move'],['ions','tiny charged particles'],['transistors','tiny electronic switches'],['semiconductor wafers','thin slices used to make electronic chips'],['semiconductor','chip-making material'],['encapsulated','sealed in a protective package'],['encapsulation','a protective covering'],['fabricated','made'],['fabrication','making'],['nonvolatile','able to keep information with power off'],['persistent','long-term'],['attenuation','weakening'],['electrostatic','caused by electric charge'],['elastomer','rubber-like material']];
 for(const [term,meaning] of replacements)result=result.replace(new RegExp(`\\b${escape(term)}\\b`,'gi'),meaning);
 return result;
}
export type LearningSource={simple:string;deep:string;engineering?:string;made?:string;story?:string};
export function lessonCopy(source:LearningSource,stage:Stage,options:{id?:string;part?:string;lang?:Lang;expanded?:boolean;localizedTechnical?:boolean}={}){
 const {id='',part='',lang='en',expanded=false,localizedTechnical=false}=options;
 const terms=(text:string)=>localizedTechnical&&lang!=='en'?text:explainTerms(text,id);
 const authored=id==='phone'?phone[part]:beginner[id]?.[part];
 // Keep reviewed translations in their language. New technical fallbacks are labelled in the UI.
 const simple=lang==='en'?authored||plainLanguage(source.simple):source.simple;
 const technical=source.engineering||source.deep;
 const advanced=technical+(source.made&&!technical.includes(source.made)?'\n\nHow it is built: '+source.made:'');
 const anchored=(text:string)=>text.startsWith(simple)?text:simple+'\n\n'+text;
 const works=stage==='foundations'?(expanded&&source.made?simple+'\n\n'+plainLanguage(source.made):simple):stage==='systems'?terms(anchored(expanded?advanced:source.deep)):terms(anchored(advanced));
 const support=(text:string)=>stage==='foundations'?plainLanguage(text):terms(text);
 const summary=stage==='foundations'?simple:(stage==='engineering'?technical:source.deep).split(/(?<=[.!?])\s+/).slice(0,stage==='engineering'?3:2).join(' ');
 return {works,summary,made:support(source.made||''),story:support(source.story||'')};
}

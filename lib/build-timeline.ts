// Assembly choreography, not a circuit or software execution simulation.
// Names refer to the existing recorded parent assemblies, preserving their mounts.
export type BuildCue={installs:string[];focus:string[];caption:string};
export type BuildPlan={base:string;steps:BuildCue[];moves?:Record<string,[number,number,number]>};
export const buildPlans:Record<string,BuildPlan>={
 'breadboard-led':{base:'breadboard',steps:[
  {installs:['controller'],focus:['breadboard','controller'],caption:'Start with the breadboard and controller. The groups of holes hold the connections; keep USB power disconnected.'},
  {installs:['resistor','led','wiring'],focus:['resistor','led','wiring'],caption:'Seat the resistor and LED, then add the leads. The resistor belongs in the same path as the light, with a return to ground.'},
  {installs:[],focus:['controller','led'],caption:'The complete circuit is ready for the starter sketch. Uploading happens on your real board; this model highlights the controller and indicator.'},
  {installs:[],focus:['controller','led'],caption:'Trace how the controller changes the light. Change the on/off times in the real sketch, predict the pattern, then test it.'}
 ]},
 'reaction-timer':{base:'breadboard',steps:[
  {installs:['controller','resistor','led','wiring'],focus:['controller','led','resistor','wiring'],caption:'Build the light circuit first: controller, resistor, LED and leads. The button leads wait for the next step.'},
  {installs:['button'],focus:['button','wiring'],caption:'Seat the pushbutton across the centre gap. Its two distinct contacts connect the input to ground when pressed.'},
  {installs:[],focus:['controller','led','button'],caption:'The assembled game is ready for code. Use the starter and Serial Monitor on your real board; a light marks when to press.'},
  {installs:[],focus:['button','controller'],caption:'Follow a press from the button to the controller. The real program waits for a stable press before calculating its result.'}
 ]},
 'arduino-rover':{base:'chassis',steps:[
  {installs:['power','board'],focus:['power','board'],caption:'Keep the controller and motor supplies separate. The battery pack and controller settle onto their chassis mounts.'},
  {installs:['motors','driver'],focus:['motors','driver'],caption:'Fit the geared motors and driver. The driver carries the signal leads; keep them away from the wheels.'},
  {installs:[],focus:['board','driver','motors'],caption:'With wheels raised, upload the starter on your real board. Follow a command from the controller through the driver to the motors.'},
  {installs:[],focus:['motors','chassis'],caption:'Compare the two driven wheels. Different directions and speeds let the rover turn; try short commands in a clear area.'}
 ]},
 'pi-station':{base:'case',moves:{storage:[-30,0,0]},steps:[
  {installs:['computer','storage','power'],focus:['computer','storage','power'],caption:'Mount the computer and fit its storage. Prepare Raspberry Pi OS and the sensor libraries on your real Pi.'},
  {installs:['sensor'],focus:['sensor','computer'],caption:'Seat the sensor module and its four leads. Check 3.3 V, ground and the two data connections with power off.'},
  {installs:[],focus:['sensor','computer','storage'],caption:'A reading travels from sensor to computer, then into local storage. Run the Python starter on your Pi to save real observations.'},
  {installs:[],focus:['sensor','case'],caption:'Keep air moving around the sensor and away from the computer’s heat. Compare two indoor locations using the real logger.'}
 ]},
 'plant-waterer':{base:'breadboard',steps:[
  {installs:['controller','sensor'],focus:['sensor','controller'],caption:'Start with the sensor and controller. Compare dry and wet reference readings before connecting a pump.'},
  {installs:['driver','pump'],focus:['driver','pump'],caption:'Place the relay module and pump in the teaching layout. The real pump needs its own rated supply and the original guide’s wiring.'},
  {installs:[],focus:['breadboard','sensor','pump'],caption:'Check the mounting area: electronics stay dry, while only the specified part of the probe enters the soil. Tubing and supply leads are not modelled.'},
  {installs:[],focus:['sensor','controller','driver','pump'],caption:'Follow the feedback loop from soil reading to pump request. This UNO model is illustrative; the credited build uses a Nano and needs supervised tests.'}
 ]}
};
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export function buildPlacement(id:string,time:number):Record<string,number>{
 const plan=buildPlans[id];if(!plan)return {};
 const pose:Record<string,number>={[plan.base]:0};
 plan.steps.forEach((step,index)=>step.installs.forEach((part,order)=>{
  const slot=.84/Math.max(1,step.installs.length),start=index+.08+order*slot;
  const fraction=clamp((time-start)/slot,0,1),ease=fraction*fraction*(3-2*fraction);
  pose[part]=1-ease;
 }));return pose;
}
export function advanceBuild(time:number,target:number,dt:number,rewind=false,reposition=false){
 const distance=Math.min(Math.abs(target-time),Math.max(0,Math.min(.05,dt))/(reposition ? .35 : rewind ? 1.2 : 3.6));
 return time+Math.sign(target-time)*distance;
}
export const guidedBuildEvent='dialearn:guided-build';
export function requestGuidedBuild(id:string,step=0){window.dispatchEvent(new CustomEvent(guidedBuildEvent,{detail:{id,step}}));}

export function buildFocus(id:string,time:number,step:number){
 const cue=buildPlans[id]?.steps[step];if(!cue)return '';
 const sequence=cue.installs.length?cue.installs:cue.focus,fraction=clamp((time-step-.08)/.84,0,1);
 return sequence[Math.min(sequence.length-1,Math.floor(fraction*sequence.length))]||'';
}

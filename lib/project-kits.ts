import type {MakerProject} from './projects';
export type KitItem={name:string;quantity:string;note:string};
export type ProjectKit={parts:KitItem[];tools:string[];setup:string;note?:string};
// Quantities describe the lesson build, not the number of teaching-model meshes.
export const projectKits:Record<MakerProject['id'],ProjectKit>={
 'arduino-rover':{parts:[
  {name:'Arduino UNO R3',quantity:'1',note:'The USB-tethered controller used by this lesson.'},
  {name:'USB-A to USB-B data cable',quantity:'1',note:'Connects the UNO to your computer for code, commands and power.'},
  {name:'TB6612FNG motor-driver breakout',quantity:'1',note:'With fitted headers; check motor stall current against its ratings.'},
  {name:'6 V geared DC motors',quantity:'2',note:'Use a matched pair compatible with the driver and battery supply.'},
  {name:'Matching wheels',quantity:'2',note:'Hubs must fit the motor shafts.'},
  {name:'Chassis',quantity:'1',note:'With motor brackets and mounting holes.'},
  {name:'Caster wheel',quantity:'1',note:'Supports the other end of the chassis.'},
  {name:'Standoffs, screws and motor fasteners',quantity:'1 set',note:'Sized for the selected chassis and boards.'},
  {name:'Rechargeable AA NiMH cells',quantity:'4',note:'A charged, matched set: about 4.8 V nominal in series.'},
  {name:'Switched four-AA battery holder',quantity:'1',note:'Supplies motor power separately from the UNO USB supply.'},
  {name:'Insulated jumper leads',quantity:'1 set',note:'Enough for every row of the connection map; use ends that fit your headers.'}
 ],tools:['Computer with Arduino IDE and a USB port','Screwdriver that fits your fasteners','Stable stand to lift the driven wheels for testing'],setup:'Install Arduino IDE and select Arduino UNO. Keep the USB cable connected for Serial Monitor control.'},
 'pi-station':{parts:[
  {name:'Raspberry Pi Zero 2 W',quantity:'1',note:'Use a board with a fitted 40-pin header; the standard bare board has no header fitted.'},
  {name:'microSD card',quantity:'1',note:'Compatible with Raspberry Pi OS, with space for local CSV readings.'},
  {name:'Regulated micro-USB power supply',quantity:'1',note:'A Raspberry Pi-compatible supply, connected to PWR IN.'},
  {name:'Adafruit BME280 breakout',quantity:'1',note:'Temperature, humidity and pressure sensor, with fitted headers.'},
  {name:'Female-to-female jumper leads',quantity:'4',note:'One each for 3.3 V, GND, SDA and SCL.'},
  {name:'Ventilated stand or enclosure',quantity:'1',note:'Keep the sensor away from the computer’s heat.'},
  {name:'Compatible standoffs and fasteners',quantity:'1 set',note:'Support the boards without touching exposed contacts.'}
 ],tools:['Computer with a microSD reader for initial setup','Access to the Pi through SSH, or a suitable display and input devices'],setup:'Prepare Raspberry Pi OS, enable I²C, then follow the linked Adafruit guide to install Blinka and the BME280 Python library in a virtual environment. Internet is needed for setup; logging can then run locally.'},
 'breadboard-led':{parts:[
  {name:'Arduino UNO R3',quantity:'1',note:'Runs the downloaded LED sketch.'},
  {name:'USB-A to USB-B data cable',quantity:'1',note:'Uploads the sketch and powers the UNO.'},
  {name:'Solderless breadboard',quantity:'1',note:'Check the connected rows and any split supply rails.'},
  {name:'Through-hole LED',quantity:'1',note:'Identify the positive and negative leads using its datasheet.'},
  {name:'220 Ω resistor',quantity:'1',note:'A ¼ W axial resistor; keep it in series with the LED.'},
  {name:'Male-to-male jumper leads',quantity:'3',note:'For the output, series connection and ground return.'}
 ],tools:['Computer with Arduino IDE and a USB port'],setup:'Select Arduino UNO in Arduino IDE and use the LED starter supplied in Resources.'},
 'reaction-timer':{parts:[
  {name:'Arduino UNO R3',quantity:'1',note:'Runs the game and reports results in Serial Monitor.'},
  {name:'USB-A to USB-B data cable',quantity:'1',note:'Uploads code, supplies power and carries the results.'},
  {name:'Solderless breadboard',quantity:'1',note:'Holds the light circuit and pushbutton.'},
  {name:'Through-hole LED',quantity:'1',note:'The signal to press the button.'},
  {name:'220 Ω resistor',quantity:'1',note:'A ¼ W axial resistor in series with the LED.'},
  {name:'Momentary tactile pushbutton',quantity:'1',note:'A four-leg type with two electrically distinct contact pairs.'},
  {name:'Male-to-male jumper leads',quantity:'5',note:'Three for the light circuit and two for the button.'}
 ],tools:['Computer with Arduino IDE and a USB port','Optional continuity meter to identify the button’s connected pairs'],setup:'Use the reaction-game starter and Serial Monitor at 9600 baud. Its internal pull-up means this version needs no extra pull-up resistor.'},
 'plant-waterer':{parts:[
  {name:'Arduino Nano and matching USB data cable',quantity:'1 each',note:'Used in GadhaGod’s original guide; our exploratory model shows an UNO.'},
  {name:'Capacitive soil-moisture sensor',quantity:'1',note:'Check its power requirements and which area may enter the soil.'},
  {name:'Compatible relay module',quantity:'1',note:'Documented input polarity, load ratings and protection are required.'},
  {name:'5 V DC water pump',quantity:'1',note:'Select a low-voltage pump compatible with the supply and relay contacts.'},
  {name:'Separate regulated pump supply',quantity:'1',note:'Rated for the selected pump, including its starting current.'},
  {name:'Tubing and retaining clips',quantity:'1 set',note:'Fits the pump outlet; length depends on your layout.'},
  {name:'Water container and plant pot',quantity:'1 each',note:'Keep both away from the electronics.'},
  {name:'Compatible leads and insulated connectors',quantity:'1 set',note:'Match the original schematic and selected module terminals.'},
  {name:'Dry mounting base and fasteners',quantity:'1 set',note:'Supports the controller and relay away from possible leaks.'},
  {name:'Motor suppression components',quantity:'As specified',note:'Have a teacher check whether the chosen pump/module needs an external flyback diode and its rating.'}
 ],tools:['Computer with Arduino IDE','Teacher or adult support for the load circuit','Screwdriver; header fitting or soldering tools only if required by the selected hardware'],setup:'Use the credited original guide for its exact wiring and code. Check the complete kit with your educator before buying parts.',note:'This is a planning lesson. The original uses different hardware from the exploratory UNO model; no ready-to-wire UNO pump circuit is supplied.'}
};

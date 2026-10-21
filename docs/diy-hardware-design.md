# DIY hardware fidelity pass

The reference at https://learn-arduino-red.vercel.app/#button establishes a quality baseline: recognisable board silhouette, individual pins/sockets, chip legs, port openings, polarised components and wires attached to terminals. Dialearn uses original geometry and realistic component finishes within its existing site theme; no reference assets or code are copied.

## Coverage

| Assembly | Visible construction | Shared representation |
| --- | --- | --- |
| Arduino UNO R3 | Board outline, mounting pads, ATmega328P DIP and socket, 28 leads, USB-B shell/tongue, barrel jack, 16U2 interface package, power and analogue headers, split digital headers, ICSP, resonator, reset switch, indicators and small passives | Reusable builder in the rover and three breadboard projects, same shapes in SVG and Three.js |
| Pi Zero 2 W | 65:30 board proportions, four mounting pads, RP3A0 package, RF shield, microSD socket/card, mini HDMI, two micro-USB ports, CSI connector, fitted 2×20 header, small power components | Pi station SVG/3D, with SD card separately removable |
| Breadboard | Two banks of five holes, centre channel, separate power rails, row/column markings, dark socket cores and moulded edge features | All three circuit projects |
| Discrete parts | Domed LED with leads/flange, resistor with axial leads/bands, four-legged tactile switch with metal lid, jumpers with real ends | LED and reaction projects |
| Motor/power modules | Motor housings and gearboxes, shaft ends, tyre tread, battery holder/cells/contacts, driver pins/terminals, relay driver and pump fittings | Rover and watering project |
| BME280 breakout | Sensor can and vent, plated pads, fitted header, labelled connections and passives, four leads to Pi header | Pi station |

The assembled parts occupy their actual project positions. Exploding separates the same assemblies along their existing removal axes; the small physical details remain visible at every learning level. Higher levels add selection of named subcomponents, rather than making the board physically incomplete at Beginner.

## References and limits

- UNO R3 official overview: https://docs.arduino.cc/hardware/uno-rev3/
- Official pinout: https://docs.arduino.cc/resources/pinouts/A000066-full-pinout.pdf
- Official UNO R3 datasheet: https://docs.arduino.cc/resources/datasheets/A000066-datasheet.pdf
- Pi Zero 2 W overview and photographs: https://www.raspberrypi.com/products/raspberry-pi-zero-2-w/
- Pi product brief: https://datasheets.raspberrypi.com/rpizero2/raspberry-pi-zero-2-w-product-brief.pdf
- The existing Arduino, Adafruit BME280 and driver build references remain the authority for electrical connections.

Mechanical dimensions and connector spacing are representative teaching layouts, not fabrication/CAD files. Tiny surface traces and legends indicate construction rather than reproducing a manufacturer's full PCB routing. Mounting apertures use dark centres and annular pads; breadboard holes use shallow dark surface geometry. Arduino header sockets have recessed wells and inset contacts. The Pi uses a fitted header for the lesson (the standard board ships with unpopulated header pads). RAM is within the RP3A0 package rather than an invented separate RAM chip. Breadboard jumper routing is illustrative; build tables, board labels and exact hardware documentation remain authoritative. No physical circuit testing is claimed.

## Component finishes and build preparation

`lib/diy-materials.json` is shared by the SVG ramps and Three.js materials: blue/teal UNO boards, green Pi boards, blue BME280/relay housings, black ICs, silver metal shells, tan resistors with red–red–brown–gold bands, yellow gearmotor plastic, and red/black/yellow insulated leads. These are representative finishes, not universal wiring colour standards or a guarantee of the colour of every board revision. Site controls and selection retain green accents. `scripts/recolour-diy.mjs` refreshes finishes without altering the audited geometry or painter order.

Each DIY page has a visible Components & steps entry at every difficulty. Its Base UI dialog keeps component quantities, tools/setup, checkable steps, wiring and credited code/resources in separate tabs, with only the tab panel scrolling. `lib/project-kits.ts` is the component-list source of truth. Checklists stay in memory for the open guide; no account or personal data is required. The plant-waterer list explicitly distinguishes the original Nano build from the exploratory UNO model.

## Guided build in the 3D viewport

`lib/build-timeline.ts` maps each of the five lesson guides to four visual cues. A cue specifies which recorded assemblies seat onto their mounts and which parts explain the step. Upcoming assemblies remain faded in their separated positions. Finished assemblies stay in place. The Pi microSD card slides into its socket horizontally; other assemblies retain their recorded mounting offsets. Software preparation and observation steps trace a deterministic focus path without claiming to run firmware, a circuit simulation or a real pump.

The existing renderer owns the playback clock. Assembly placement is a pure smoothstep function of the timeline, shared by play, pause, replay, reverse seeking and the reduced-motion poses. Each step plays once; Next advances under the learner’s control. Replay gently reverses to the start of the step before playing it again. Time is clamped across hidden-tab gaps, and frame rendering stops when paused/settled or offscreen. React updates the selected step and playback controls; timeline and focus readouts use refs rather than per-frame component renders.

A build can start from any written step or from the 3D viewer’s Build along button. A project-scoped event transfers the selected step between the existing guide and viewer without nesting two dialogs. Desktop gives the instructions a narrow side column; mobile places a bounded, independently scrolling step panel below the model with fixed playback/navigation controls. Part inspection, orbiting and zoom remain available. Full instructions, wiring and the credited starter stay accessible in the same panel.

Checks cover all recorded assembly IDs, complete final poses, monotonic installation, deterministic seeking, focus targets and equivalent playback across 30/60/120 Hz clocks. This verifies the teaching choreography; it does not constitute a physical build test.

# Original anatomy and engineering release — 13 October 2026

Dialearn retains its own twelve subjects: phone, controller, handheld console, electric car, solar lamp, bicycle, drone, Arduino rover, Raspberry Pi weather station, LED breadboard, reaction timer and plant waterer. The Anatomy collection was inspected as a craftsmanship and interaction reference. No collection figure or anatomy-figures package is imported or shipped. Geometry uses the existing vendored Anatomy kit.

## Changes

- Fifty-five additional engineering topics across the eleven non-phone models; seven additional selectable phone components.
- Original motor cutaways with stationary windings, shaft bearings and moving rotor magnets. Drone propellers rotate in opposing pairs. Three.js rotates geometry about its world-space joint, independently of the viewing camera and exploded mounting position.
- Twelve engineering notebooks: operating principles, manufacturing, design trade-offs, fault diagnosis, equations and primary/reference links. All ages can read them; Engineering initially expands the detailed sections.
- Twelve bounded teaching experiments with explicit assumptions. These are simplified calculations, not validated hardware or flight simulators.
- New guide text is English. Interface and component names support English, French, Portuguese and Arabic. Translation drafts are labelled in the existing learning flow.
- Notebook content has 30 px desktop and 20 px mobile gutters; divider borders span the containing section. The explore age-status strip was removed. Changing the general age clears the page’s old URL override; modal age choices remain local. Selection menus retain green fills and checkmarks without an inset stripe. Switch thumbs use one position rule with no competing Tailwind translation.

## Verification performed

- Next.js production build and TypeScript checks passed.
- `node scripts/check-engineering.cjs` checks all twelve guide paths, unique component IDs, reference IDs, represented component geometry, motion axes and teaching-model boundaries. It tests ADC endpoints, quadratic copper loss, zero shaft output, full-duty voltage, sampling counts and zero delivered volume.
- `node scripts/generate-devices.mjs --audit` reported zero failures for all eleven recorded device builds, with five opening positions and three depth-order states. Drone was audited again after replacing its opaque cap with an open ring.
- Browser review covered desktop light/dark and 390 × 844 mobile dark layouts, notebook gutters and edge-to-edge dividers, trace selection, keyboard-operated numeric controls, selection highlights, zoom, camera rotation and tilt, drone/EV mechanism start controls, and paused/manual exploration under the Reduce motion preference.
- Switch bounds verified on/off: 40 × 23 track and 17 × 17 thumb; both thumb rectangles remain inside the track. Space toggles it, retaining visible keyboard focus. Selected dark-menu option computed box shadow is `none`.
- Detailed selected-part text and full-lesson links verified in the 3D floating window. Static text-reader pages include the notebooks and references for offline use.

## Verification limits

The phone's existing non-recorded SVG generator has not received the recorder-based physical audit. The custom Three.js renderer has not been run through Anatomy’s standalone turn-check/orbit, dynamic-collision or measured frame-rate harness: that harness targets a different runtime and drives its own browser, whereas this session uses the required CUA browser controls. The rest/apart geometry audit does not certify every moving phase or every 3D camera angle. Manual reviewed angles are not a formal all-angle result. No performance target or exact manufacturer bill of materials is claimed.

## Reference starting points

- https://skills.wheresryan.sh/anatomy/collection
- https://www.ti.com/document-viewer/lit/html/SLVA980
- https://ardupilot.org/dev/docs/code-overview-copter-motors-library.html
- https://afdc.energy.gov/vehicles/how-do-all-electric-cars-work
- https://docs.arduino.cc/hardware/uno-rev3/
- https://www.microchip.com/en-us/product/atmega328p
- https://www.raspberrypi.com/documentation/computers/raspberry-pi.html

Individual notebooks and part lessons link their applicable sources. Sources describe representative implementations; illustrated layouts, parameters and pole counts are teaching choices.

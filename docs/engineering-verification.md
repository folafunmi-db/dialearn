# Original anatomy and engineering release — 13 October 2026

Dialearn retains its own twelve subjects: phone, controller, handheld console, electric car, solar lamp, bicycle, drone, Arduino rover, Raspberry Pi weather station, LED breadboard, reaction timer and plant waterer. The Anatomy collection was inspected as a craftsmanship and interaction reference. No collection figure or anatomy-figures package is imported or shipped. Geometry uses the existing vendored Anatomy kit.

## Changes

- Fifty-five additional engineering topics across the eleven non-phone models; seven additional selectable phone components.
- Original motor cutaways with stationary windings, shaft bearings and moving rotor magnets. Drone propellers rotate in opposing pairs. Three.js rotates geometry about its world-space joint, independently of the viewing camera and exploded mounting position.
- Twelve engineering notebooks: operating principles, manufacturing, design trade-offs, fault diagnosis, equations and primary/reference links. All difficulty levels can read them; Advanced initially expands the detailed sections.
- Twelve bounded teaching experiments with explicit assumptions. These are simplified calculations, not validated hardware or flight simulators.
- New guide text is English. Interface and component names support English, French, Portuguese and Arabic. Translation drafts are labelled in the existing learning flow.
- Notebook content has 30 px desktop and 20 px mobile gutters; divider borders span the containing section. The explore level-status strip was removed. Changing the general difficulty level clears the page’s old URL override; modal difficulty choices remain local. Selection menus retain green fills and checkmarks without an inset stripe. Switch thumbs use one position rule with no competing Tailwind translation.

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

## Expanded catalogue and community release

The catalogue now contains 48 subjects. The 36 additions include 21 mechanical, infrastructure and industrial systems and 15 distinct household devices. Duplicate user suggestions are represented once. Each addition has ten selectable assemblies, stage-dependent access, a sourced engineering notebook, a bounded calculation and an object-specific prediction question. These are representative educational models, not complete manufacturer drawings. New titles are translated; new technical prose and part labels explicitly fall back to English pending review.

All 48 guide paths, references, component IDs, motion axes and experiment boundaries are checked by `npm run check`. Slider-crank checks compare rod endpoints against piston pins across 73 phases. The community migration is executed in embedded Postgres to exercise publishing permissions, private drafts/progress, notifications, reviewed discussions, upload access and account deletion. Hosted authentication, email and storage still require Supabase configuration and real-account acceptance tests; see `community-setup.md`.

The renderer merges geometry only within the same part, stage, material, mounting movement and mechanism joint. Browser diagnostics for the car engine showed 128 recorded solids rendered as 21 meshes and 52 draw calls; this is a draw-count observation, not a frame-rate guarantee. Browser checks covered 3D selection, zoom and multi-axis dragging, all 36 new SVG subjects, and the searchable 48-object card picker at desktop and 390-pixel mobile widths. The picker supports keyboard navigation and matches the explanation controls at 48 pixels high. Mobile hover text measures its natural height and repositions on resize.

The build runs the recorder geometry audit for all 47 non-phone subjects. The earlier verification limits for dynamic collision, formal full-orbit ordering, measured performance and the phone generator still apply. Offline downloads disclose their sizes before saving and provide a text-only option; unused open-state SVG exports are excluded from the full download. Community data is never included in either pack.

Release audit evidence: the full recorded run passed 46 subjects and found two unsupported camera display solids. Moving the camera's display brace to the flat supported side-wall face resolved both failures; its targeted rerun passed with zero problems. Thus all 47 current recorded subjects have passing audit evidence. The production build retains the full audit so future failures stop publication.

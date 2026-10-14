# Anatomy rendering

Both the SVG breakdown and Three.js modal use the same recorded solids. Assembly
transforms are offsets from their assembled locations, with scale fixed at one.
The SVG camera follows assembly changes; the Three.js camera fits the interpolated
bounds. Outer panels can have separate inspection offsets. Models and Three.js
load on demand; idle/offscreen rendering stops and GPU resources are disposed.

## Exterior fidelity

The consumer enclosure pass closes missing faces on the camera, mechanical watch,
refrigerator, console, printer, coffee machine, microwave, air conditioner, robotic
vacuum, washing machine, smart watch, mouse and toothbrush. Housing panels remain
inspectable; removing an enclosure is a view state rather than a missing piece.

The wireless earbud model uses **AirPods 4 with Active Noise Cancellation** as its
exterior baseline. Apple publishes 30.2 × 18.3 × 18.1 mm per earbud and a
46.2 × 50.1 × 21.2 mm case:
https://support.apple.com/en-by/121204

The original geometry follows the rounded open-ear housings, short stems, acoustic
apertures, compact case and lid seam. Public imagery was used for comparison, not
embedded or copied as model geometry. The internal battery, radio, driver,
microphone, sensing, antenna and charging layouts are **representative teaching
arrangements**, not Apple CAD or service instructions. The shell does not have a
silicone tip. Earbuds and case preserve their relative exterior dimensions;
component dimensions and locations inside are estimates.

| System | Geometry and interface | Inspection |
| --- | --- | --- |
| Audio | Radio/processing board, coil, magnet/diaphragm, front acoustic grille | Separate or x-ray |
| Noise control | External/inward microphone examples and processing path | Part selection and teaching cycle |
| Power | Earbud cells, stem charging contacts, case cell, charge board and coil | Separate or x-ray |
| Packaging | Hollow shell halves, stems, front/back case skins, rounded perimeter, cradle, lid seam | Animated assembly |
| Control | Representative wear/force sensor modules | Part selection |

## Materials and provenance

`components/anatomy-3d-materials.ts` adapts the material presets and procedural
studio environment approach from the MIT-licensed Anatomy 3D/Airsup skill.
`vendor/anatomy-3d/LICENSE` retains its licence. This integration uses the existing
Next.js renderer; it does not claim to implement the entire Lab runtime. White
polymer and dark acoustic mesh distinguish the earbuds; green remains the
selection and circuit-board accent. No remote HDR texture is required.

`curved-shell.mjs` draws closed half-lathe surfaces from the same profile recorded
for their clearance checks. Three.js renders the partial lathe and real seam caps.
The audit cut describes the same half-space, rather than an approximate substitute
shape. Drawing subdivisions are not additional named functional parts.

## Validation boundaries

Source generation checks geometry support, penetration and SVG depth ordering at
the default camera in assembled, apart and sampled intermediate states. The
breakdown checker verifies matching component IDs, equal scale and finite offsets.
Its optional clearance mode checks five poses; `--dense` checks twenty. Neither
sampling scheme proves all continuous trajectories or every orbit angle.

The working animation is a slowed teaching motion or a representative energy /
information trace. It is not a validated product simulator. The catalogue still
includes simplified and representative mechanisms; passing spatial checks alone
does not establish complete manufacturer fidelity. Exact source notices remain
attached to models with unavailable or uncertain construction details.

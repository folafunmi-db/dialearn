# Mechanism Lab: Dialearn Explainers

Original tabletop experiments; no reference-site assets or code are copied. The
existing Next.js, shadcn/Base UI, DM Sans, paper/charcoal and green theme remain.
The gallery loads no Three.js. Each exhibit loads its renderer on demand, uses
one computed snapshot for geometry/readouts/prose, and has keyboard-accessible
part selection and physical controls. Input changes reset to a paused setup;
replay reruns the same deterministic model. Orbit, force visibility and selection
never change the solver. Pause freezes physical time. Hidden tabs suspend time.

| Exhibit / visible question | Model, scenarios, decisive interaction |
| --- | --- |
| Projectile: where does the ball land? | Vacuum ballistic motion, g=9.81 m/s², centre launch height 0.8 m, 0.1 m contact radius, point-mass flight. Baseline/low/high angle. Change only angle at equal speed; run to ground contact, report flight time and range. Barrel, ball, launcher support, ground and landing marker are inspectable. |
| Incline: when does the block move? | 3 m ramp, 5 kg block; static friction threshold tan(theta)>mu_s; mu_k=0.8 mu_s is an explicit teaching assumption. Analytic constant-acceleration slide to ramp end. Compare rough/near-threshold/smooth. Tilt a selected ramp or change its selected contact surface. |
| Pendulum: what changes a swing? | Nonlinear theta''=-(g/L)sin(theta), mass 0.5 kg, no drag; RK4 at 1/240 s with interpolated samples. Small/large angle and long rod. Compare length vs amplitude. No escapement: a clock's regulating pendulum, not a complete clock movement. Period from complete elliptic integral quadrature, not small-angle approximation at large amplitudes. |
| Gyroscope: why does the axle sweep sideways? | Approximate steady fast-spin precession, Omega=mgd/(I omega), uniform disk m=2 kg, R=0.45 m, I=mR²/2. Maintained spin; constrained horizontal tilt. Slow/fast spin and longer arm. No nutation or fall dynamics. Rotor spin alone is displayed at 1/20 speed, explicitly labelled; precession time is unchanged. |
| String: which patterns fit between two clamps? | Ideal fixed-end standing wave y=A sin(n pi x/L) cos(2 pi f t), L=2 m, mu=0.005 kg/m, A=0.06 m. Fundamental/third harmonic/high tension. Physical playback slowed 1/30 for all animation and time readouts. Change harmonic and locate nodes; no driven transient or damping model. |
| Pulley: what is traded for reduced effort? | Ideal massless frictionless 1/2/4-strand tackle. F=mg/n, rise=pull/n. Coherent rope routing with fixed and moving sheaves; equal input/output work. Compare strand counts at equal load and rope travel. Pulling motion is quasi-static, not dynamic acceleration. |
| Beam: why does span matter so much? | Simply supported beam, central point load ramped quasi-statically over 2 s. E=200 GPa; rectangular b=0.06 m,h=0.08 m, I=bh³/12. delta_mid=PL³/(48EI); reactions=P/2; bending moment=P L/4; stress=Mh/(2I). Unloaded/longer span/heavier load. Deflection is exaggerated 8x in geometry, numerical results are actual. Small-deflection linear elastic teaching model, not a structural capacity check. |

## Sources and fidelity

- Projectile: https://openstax.org/books/physics/pages/5-3-projectile-motion
- Incline: https://openstax.org/books/physics/pages/5-4-inclined-planes
- Pendulum: https://openstax.org/books/university-physics-volume-1/pages/15-4-pendulums
- Gyroscope: https://openstax.org/books/university-physics-volume-1/pages/11-4-precession-of-a-gyroscope
- String: https://openstax.org/books/university-physics-volume-1/pages/16-6-standing-waves-and-resonance
- Pulley: https://openstax.org/books/college-physics/pages/9-5-simple-machines
- Beam: David Roylance, MIT, https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Mechanics_of_Materials_(Roylance)/04%3A_Bending/4.03%3A_Beam_Displacements

Geometry has representative apparatus dimensions; functional lengths use model
metres. Apparatus finishes, bolts and gauge markings are illustrative. Sources
explain principles, not approval of this software. Lesson text is initially English;
site navigation retains four languages. Text-only mode includes controls, equations,
readouts and named parts. Model tests cover limits, invariant relationships,
repeatability, fixed-end boundary conditions, and RK4 energy drift. Browser checks
cover seven entry scenes, scenario changes, pause/reset, picking, keyboard and phone
layout. Report only checks actually completed.

Verified locally: all seven apparatus scenes render; raycast selection opens a
part explanation; projectile launch reaches its calculated landing point; pause
holds physical time during camera zoom; keyboard input resets the experiment;
four-strand pulley configuration updates effort; mobile width 390px has no
horizontal overflow; text-only mode removes the canvas while retaining controls
and explanations. Gallery light/dark contrast was inspected. No browser console
errors were recorded in the final session. Type checks, 204 numerical scenario
and limit samples, and the static production build pass. Low-end device frame
rates and full lesson translation have not been validated.

## Additional exhibits and manipulation

Car differential: an open, equal-side-gear differential obeys ωL + ωR = 2ωC.
Carrier and left-output speeds are imposed; the right output is derived. Compare
straight driving, one stopped output and a stationary carrier. The decisive trial
holds the carrier still and turns the left output: the right turns oppositely.
Geometry uses illustrative bevel teeth; no contact, traction or torque solver.
Reference: https://www.mathworks.com/help/sdl/ref/differential.html

Drone balance and control: a restrained roll-axis rig exposes a PD controller,
rotor thrust allocation and an external disturbance. I = 0.08 kg m², arm = 0.6 m,
m = 1.2 kg. Integrate Iφ″ = τmotor + τdisturbance − 0.02φ′ at 1/240 s.
Controller torque is clamp(−Kpφ − Kdφ′, ±1 N m), with Kd = 0.18 when enabled,
zero otherwise. Four positive rotor thrusts sum to mg and create τmotor. Compare
recovery, controller disabled and constant disturbance. This is a gimbal test,
not six-DOF flight or a tuned controller for a real aircraft. Propeller spin is
slowed 40×; thrust uses T = 2e−7ω² (illustrative coefficient).
Reference: https://www.mathworks.com/help/uav/ref/guidancemodel.html

Camera focus and aperture: a 50 mm thin lens forms an image at v = fu/(u−f).
Sensor position follows focus distance; aperture D = f/N controls defocus circle
c = D|vSensor−v|/v and relative illuminance (1.8/N)². Playback moves the subject
±0.18 m sinusoidally over eight seconds. Compare matched focus, wide aperture,
and stopping down. The decisive trial stops down an out-of-focus scene: blur
shrinks while the image darkens. Ray geometry and preview blur are explanatory,
not a ray-traced compound lens. Excludes diffraction, aberrations and autoexposure.
Reference: https://openstax.org/books/university-physics-volume-3/pages/2-4-thin-lenses

Selected adjustable components accept horizontal parameter dragging; orbit is
suspended only for that captured gesture and restored on release/cancellation.
This changes the same bounded input as its labelled slider and resets the run.
Every timeline is a keyboard-accessible shadcn slider: seeking pauses playback,
samples the same deterministic model, and Play resumes from that physical time.

Additional optics reference: Brian Wandell, Foundations of Image Systems Engineering, https://wandell.github.io/FISE-git/chapters/optics-03-thinlens.html (thin-lens equation, f-number, image intensity and defocus circle). The sensor preview uses raw inverted image orientation.

Verified extension: all three new scenes render in the browser. Differential
wheel dragging changed the left input to 84 rpm and derived −24 rpm on the right
with the carrier at 30 rpm; pointer capture released correctly. Pointer timeline
scrubbing reached 13.32 s, keyboard Home/End/Arrow seeking worked, and seeking
paused the run. Drone baseline returns toward level; disabled feedback retains
20° at six seconds. Camera focus mismatch yielded 0.731 mm defocus at f/1.8;
stopping down to f/16 yielded 0.082 mm and 1.27% relative illuminance. At a 390px
viewport there is no horizontal overflow; mobile pointer scrubbing worked and
playback advances with the controls in view. No console errors were recorded.
Numerical checks cover 304 preset/limit samples, reverse seeking, differential
closure, drone thrust/torque balance, and thin-lens focus/aperture scaling.

## Guided story presentation

Replace the initial controls-first presentation with four explicit chapters:
Notice (everyday puzzle), Follow (select the causal parts and inspect a paused
working moment), Try (a contrasting preset plus a prediction and accessible
controls), Connect (compare baseline and current complete-run measurements and
transfer the relationship to everyday experience). Chapter changes are explicit
user actions; no autoplay. A three-part causal strip selects the actual components.
Camera close-up is optional and preserves inspection control. Predictions are
self-reflection prompts, not scored claims when users can change the setup.
Source equations and all numerical experiments remain unchanged.

Guided-story verification: desktop differential chapters correctly apply the
reference and carrier-held setups, highlight the corresponding causal parts,
retain a chosen prediction, and compare 30/30/30 rpm against 30/0/−30 rpm.
Component close-up frames the working gears; reset camera remains available.
The pendulum Try chapter applies the 2.2 m setup and reports a 3 s period. At
390px width the page has no horizontal overflow, and a compact selection bar
keeps the mechanism visible. Gallery and exhibit were visually inspected in the
existing dark theme. No browser console errors were recorded. Story checks
validate all component IDs, contrast presets and related-explainer links; the
304 numerical scenarios and existing project checks pass.

## Apparatus-quality correction

The guided-copy pass did not resolve the user's primary concern: apparatus
geometry, physical finishes, scene scale and visible consequences remained at
prototype quality. Rebuild the optics apparatus around a recognizable sectioned
camera, knurled barrel, supported optical rail, real iris opening, biconvex thin
lens, lit image sensor and original test chart. Cutaway/assembled/exploded views
are presentation states sharing the same thin-lens model. Optical axial spacing
remains exaggerated; the housing is illustrative, not a compound prescription.
A procedural chart is used instead of external imagery. Show the computed image
on the sensor, and ray cones from the same aperture/focus values. Shared upgrades
include contact shadows, metal/paint/rubber microtexture, grounded fixtures,
measuring rails, material-preserving selection and projected component labels.
The experiment becomes the dominant viewport; story text stays accessible in a
compact instrument panel. No reference assets, code or branding are reused.

The optics apparatus now has original textured chart artwork, a biconvex lens,
knurled annular collar, nine authored iris blades, camera shell sections, a sliding
sensor carriage and an enlarged raw-image monitor. The monitor and sensor share
one bitmap driven by defocus and relative illuminance. Assembly transitions last
650 ms and use assembly-axis offsets; reduced-motion settings apply instantly.
Optical housing geometry is illustrative, with exaggerated spacings; it is not a
compound lens prescription. The differential adds an illustrative 40:10 input
pinion driven at −4ωCarrier, tyre tread, and open spoke rims. Shadowed fixtures,
material microtexture, engraved scale marks and projected functional labels apply
to all exhibits. Static child meshes are consolidated without merging parts that
move independently. Physical control changes preserve the geometry when topology
is unchanged, rather than rebuilding the entire apparatus for each slider step.

Quality-pass browser checks: all ten scenes were visually inspected. The mobile
camera fits the optical core with Whole rig available, and the 390px page has no
horizontal overflow. At focus 0.4 m, subject 2 m and f/1.8, the readout gives
3.175 mm defocus and 100% illuminance; f/16 gives 0.357 mm and 1.27%; matching
focus restores zero defocus. Assembly view switching preserves the numeric state.
The in-scene Play control advances the model on mobile. Sampled CPU render/label
submission was 3.30 ms for the desktop differential and 18.70 ms for the mobile
optics scene before final static-mesh consolidation. These are individual samples,
not sustained frame-rate or low-end-device claims. No console errors appeared in
the inspected scenes. PCFShadowMap replaces the deprecated PCFSoftShadowMap.

Final optics observation after consolidation: 151 draw calls and a 10.70 ms CPU
render/label submission sample on the available desktop browser, with no recorded
console errors or warnings. This does not establish sustained FPS or performance
on low-end phones. The launcher now opens on its working component and pairs it
with an SI-labelled full-flight plot sampled from the same run; Whole rig reveals
the complete trajectory geometry. Final differential input gear and drone viewing
angle were also inspected after consolidation. Numeric checks and production
static export complete successfully.

### Mobile workbench
The apparatus and a compact control dock stay together while the chapter text scrolls. A shadcn control selector exposes one physical input at a time, alongside a setup selector and a persistent play/reset/timeline row. The same input actions and physical clock drive desktop, mobile and direct manipulation. Sliders have 44px touch tracks and 22px thumbs. In short landscape windows the workbench returns to normal flow to avoid trapping the page beneath a sticky panel.

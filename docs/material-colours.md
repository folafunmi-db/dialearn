# Physical colours across the catalogue

`lib/machine-materials.json` is the shared representative material palette for
catalogue cards, SVG diagrams and Three.js. `lib/diy-materials.json` retains the
more specific board/component finishes for the five guided DIY lessons.

`scripts/catalogue-materials.mjs` assigns stable material keys to named assemblies
and components. Explicit authored assignments take precedence. Its SVG ramps keep
facing-dependent shading and drawing order; the Three.js viewer reads the same
base colour, metalness and roughness. The explainer rigs reuse the metal, brass,
rubber and ceramic entries while retaining their painted laboratory frames and
clearly identified teaching overlays. No CSS hue filter is used on the artwork.

Run `npm run colour` for a material-only refresh of existing audited assets.
The normal build runs this after geometry generation. This refresh retains the
recorded solids, relative offsets, fitted frames and interactions. Standalone
exports embed their own material rules so cards and low-data views agree with
the interactive diagrams. Green remains the interface/selection accent, not a
replacement for physical finishes. Selection restores the original material.

These are representative engineering finishes, not measured manufacturer colour
standards or alloy certifications. Product-specific builders should explicitly
assign materials from references rather than rely on assembly-name defaults.
White polymer is slightly shaded to remain visible against a light background.

## Watch references and limits

- [Apple Watch Series 8 specifications](https://support.apple.com/en-is/111848):
  45 mm rectangular case reference, Digital Crown and side button. This build
  uses a representative dark aluminium finish and dark sport band.
- [Samsung Galaxy Watch6 Classic specifications](https://www.samsung.com/uk/business/watches/galaxy-watch/galaxy-watch6-classic-43mm-silver-bt-sm-r950nzsaeua/):
  43 mm circular stainless steel case reference, physical rotating bezel and two
  side buttons. This build uses a representative silver case and dark band.

The watches have no presentation platforms. Case backs, straps, enclosures,
displays, controls and retained internal teaching assemblies are modelled.
Internal positions and removal paths are illustrative rather than repair data.
The optical sensors do not simulate health measurements. The two watch builders
pass the fine geometry audit in assembled, intermediate and separated states.

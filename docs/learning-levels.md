# Explanation levels

The general difficulty preference and temporary object/3D preferences select teaching copy, not just geometry. `lessonCopy` is the common resolver for anatomy pages, tooltips, 3D selection windows, speech and the text-only reader. `explainerLearning` covers all ten experiments without changing their physical model or state.

- Beginner: authored everyday descriptions, focusing on the part’s purpose and the visible cause and effect. `beginner-project-copy.json` covers all 588 advanced-catalogue parts by device and component ID. The phone has individually authored beginner copy; existing reviewed simple descriptions cover the original projects.
- Intermediate: the mechanism explanation, with a short vocabulary note for unfamiliar words.
- Advanced: complete technical explanation, manufacturing context where supplied, and vocabulary support. Explainers also expose equations and explain their model limits. Technical content is retained rather than replaced by an adult-facing abstract.

Supporting manufacturing/history notes use plain-language substitutions at Beginner. Build instructions retain wiring labels, values, ratings, power-off instructions and other safety conditions at every level. These instructions are not replaced with shortened summaries. Sources and contributor credits are retained.

English technical fallbacks stay explicitly marked where reviewed translations are unavailable. Existing reviewed phone translations stay in their original language. No remote text generation, personal information or assessment is required to change levels. The text-only reader shows the chosen level rather than printing every explanation at once.

`npm run check` checks coverage and distinct explanations for all 761 project parts, complete Advanced content, every explainer component, and representative vocabulary definitions. UI verification also checks changes on a selected part, the local-only 3D selector and the reader.

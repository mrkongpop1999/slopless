# slopless

Agent skills for directing code-made video and animation without the generic "AI slop" look.

## Skills

### `skills/slopless-2d`
Art-direct, build and critique code-drawn 2D graphics and animation (SVG, Canvas, JS, Remotion, HyperFrames).

- **Art direction first** — `/teach-2d` writes `.art-direction.md` (mood, one key light, shadow model, 5–6 colour palette, fonts, motion personality).
- **Styles** — `/style` picks a look; flat cel is built in, and lemo-opuscar style packs (e.g. Paper-cut Lightbox) plug in.
- **Hard bans + what to do instead** across light, shadow, colour, typography (incl. Thai), staging, motion, character, texture.
- **Tokens in code** — shadow direction and colour are derived from the light, never hand-set.
- **`/lint`** for banned defaults in code, **`/critique`** renders real frames and scores them /40, loops until ≥ 30.
- Targeted commands: `/relight` `/reshadow` `/palette` `/typeset` `/stage` `/timing` `/texture` `/silhouette` `/bolder` `/quieter` `/distinct` `/polish`.

Install (Claude Code): copy `skills/slopless-2d` into `~/.claude/skills/` (or your project's `.claude/skills/`).

## Examples

| Folder | What it is |
|---|---|
| `examples/flat-cel` | Same late-night desk scene twice: `A_baseline.html` (no skill) vs `B_slopless.html` (with skill). Canvas 2D; `render.py` renders frames with Playwright. |
| `examples/paper-cut-still-here` | The desk scene as a Paper-cut Lightbox shot. |
| `examples/paper-cut-natasilp` | Opening shot for a Thai performing-arts (นาฏศิลป์ไทย) presentation, Paper-cut Lightbox. |

The paper-cut examples contain only the shot code and art direction. They run on the engine from
[lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) (`styles/paper-lantern/demo/src/{lib,paper,stage,post}.js`), which is not redistributed here — clone that repo, put an example folder under its `films/`, copy those engine files into the example's `src/`, and render with `core/render/still.mjs`.

Fonts are not included: Fraunces, Bai Jamjuree and Trirong (OFL) are available from `@fontsource/*` on npm; place the `.woff2` files where each `index.html` / `.html` expects them.

## Status

Tested with two styles (flat cel, paper-cut). Known weak spots: character acting and pose range; real-world cultural detail needs a reference supplied by a human.

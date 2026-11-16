---
name: "slopless-2d"
description: "Art-direct, build and critique code-drawn 2D graphics and animation (SVG, Canvas, JS, Remotion, HyperFrames) so light, shadow, text, color, staging and motion stop looking like generic AI."
---

# slopless-2d

AI slop in 2D is competent averaging: every choice is the safest default, so every frame looks like every other AI frame. Soft grey drop shadows, glow on everything, purple-blue gradients, subject dead-center, ease-in-out on every move, centered white text with a shadow.

This skill fixes it the same way good frontend design skills do:
1. **Confirmed context before drawing** (art direction file)
2. **Domain references** with hard bans and what to do instead
3. **Tokens in code**, so fixes propagate
4. **Commands** that target one failure mode at a time
5. **Render-and-look critique loop** — judge pixels, not code

Scope: anything drawn with code — SVG, Canvas 2D, CSS/JS animation, GSAP, Remotion, HyperFrames, p5, stick figures, explainer scenes, motion graphics, thumbnails. Not for diffusion-model images (for those, only prompts and post-checks are controllable; text must still be overlaid by code).

---

## 0. How to use

When the user asks for 2D graphics/animation in code, or names a command below, run:

1. Load or create `.art-direction.md` in the project root (see `/teach-2d`). Never draw without it.
2. Build with tokens (section 3).
3. Run `/critique` on rendered frames before showing the user.
4. When the user names a command (`/relight`, `/stage`, …) do only that command's job, then re-render and show before/after frames.

The commands are phrases the user can type in chat; treat "relight this" the same as `/relight`.

---

## 1. Commands

| Command | Job |
|---|---|
| `/teach-2d` | One-time setup. Interview the user, write `.art-direction.md`. |
| `/style` | Pick the look (section 2b). When the user is unsure, render ONE key frame as stills in 2-3 styles and let them choose before animating anything. |
| `/critique` | Render key frames, score /40 on the rubric, list worst 3 issues. Changes nothing. |
| `/lint` | Static scan of the code for banned defaults (section 5). Changes nothing. |
| `/relight` | Enforce one key light: fix highlights, rim light, gradients to match its direction. |
| `/reshadow` | Replace default drop shadows with the chosen shadow model; add contact shadows; derive offsets from light. |
| `/palette` | Collapse to the token palette; assign accent to focal point only; fix saturation hierarchy. |
| `/typeset` | Fix on-screen text system and in-world signs (perspective, lighting, wear, Thai rendering). |
| `/stage` | Fix composition: shot size variety, layering, focal point, negative space, off-center framing. |
| `/timing` | Fix motion: per-element easing, stagger, anticipation, follow-through, holds. |
| `/texture` | Add intentional grain/line wobble/paper/dither so it stops looking default-vector. |
| `/materialize` | Add the material-depth layer (section 4.9) to a flat scene: per-material surfaces, form shading, occlusion, wear, lens depth. Use when the user says it looks too simple, flat or cartoon-like. |
| `/silhouette` | Fix character poses and design: readable black silhouette, line of action, asymmetry. |
| `/bolder` | Push a safe, bland frame: more contrast, bigger value shapes, stronger accent, braver crop. |
| `/quieter` | Calm an overloaded frame: remove elements, lower saturation, fewer motions at once. |
| `/distinct` | Compare against the previous episode/piece; change palette, time of day, setting or camera language until <50% similar. |
| `/polish` | Final pass: alignment, stroke consistency, safe areas (9:16 and 16:9), last-frame hold, loop seams. |

---

## 2. `/teach-2d` — the art direction file

Ask the user (2–4 questions at a time, offer two contrasting options when they're unsure). Save as `.art-direction.md`. Reload it every session. One file per project; add an `## Episode N` section for per-episode overrides.

```markdown
# Art direction
## Audience & platform
who watches, where (YouTube 16:9, Shorts/TikTok 9:16), watch length
## Mood (3 words)
e.g. cold, lonely, hopeful
## References (and what to take from each)
e.g. "X: the flat muted palette, NOT the character style"
## Key light
direction (clock position), warm/cool, hard/soft, optional bounce color
## Shadow model
flat cel | hatching | long cast | ambient-only | none — shadow hue shift rule
## Palette (5–6 hex, named)
dark / light / mid1 / mid2 / (mid3) / accent (<10% of frame)
## Line & texture
stroke weights, cap/join, outline color, wobble amount, grain amount
## Typography
display font, body font, Thai font, sizes, where text may appear, entry animation
## Motion personality
snappy | floaty | heavy | handmade-jitter; default easing; default hold
## Never in this project
project-specific bans
## Episode N (overrides)
what makes this one visually different from the last
```

If the user hasn't decided something, propose two directions that differ meaningfully (e.g. "warm late-afternoon, long shadows" vs "cold overcast, no cast shadows"). Never silently pick the middle.

---

## 2b. Styles: pick a look before building

A style pack owns the LOOK (materials, value ladder, engine, native moves). This skill owns DIRECTION (mood, staging, bans) and the CRITIQUE loop. Record the chosen style in `.art-direction.md`. If a style rule conflicts with a ban in section 4, the style wins and the exception is written down (section 7).

| Style | Source | Good for | Notes |
|---|---|---|---|
| Flat cel | built-in (sections 3-4) | character scenes, fast iteration | Tested. 2D canvas, renders in seconds. Banded light, cel shadow shapes, grain. |
| Material depth | built-in (section 4.9), layered on flat cel | scenes that should feel tactile and lit: rooms, objects, close shots | Tested. Still 2D canvas and fast. Reaches "painted with real surfaces", not photoreal. Ask at `/teach-2d` whether the user wants flat or material depth; do not assume flat. |
| Paper-cut lightbox | lemo-opuscar `styles/paper-lantern` | silhouettes, night/dusk, titles, ceremonial or quiet moods | Tested. 3D layered paper, slow without a GPU. Glow only shows where paper exists, so draw flames/bulbs as paper too. |
| 80s cel anime, crayon picture book, risograph, others | lemo-opuscar `styles/README.md` lists them | see each STYLE.md | Not yet tested with this skill: treat the first frame as an experiment. |

Using a lemo-opuscar style (https://github.com/lemomo-ai/lemo-opuscar):
1. Clone the repo, read that style's `STYLE.md` fully, copy its engine `src/` into a new `films/<name>/` folder.
2. Borrow the style's native moves, never the demo's subject or scenes.
3. Render stills with `core/render/still.mjs` (low `ssaa` first); run `/critique` on stills as usual.
4. Each film needs its own subject-specific palette and motifs; if two films in the same style look alike, run `/distinct`.

Choosing: match style to mood and to what must be readable. Faces and acting -> flat cel or anime. Atmosphere, silhouettes, titles -> paper-cut. Never choose a style because it is the default.

---

## 3. Build rules: tokens in code

All scene code reads from one tokens object generated from the art direction file. No hardcoded hex, angles, shadow offsets or easings in scene code.

```js
// tokens.js
export const T = {
  light: { angleDeg: 300, color: '#FFE9C7', hard: true },   // 300° ≈ 10 o'clock, light from top-left
  shadow: { model: 'cel', length: 18, hueShift: -18, darken: 0.32 },
  palette: { ink:'#1E1B2E', paper:'#F2E8D5', mid1:'#7A8B99', mid2:'#C9A66B', accent:'#E2553B' },
  stroke: { main: 3, detail: 1.5, color: '#1E1B2E', cap: 'round' },
  grain: 0.06,
  ease: { enter: [0.16,1,0.3,1], exit: [0.7,0,0.84,0], settle: [0.34,1.3,0.64,1] },
  holdMs: 450,
  seed: 42,
};
```

Required helpers (write them once, use everywhere):

```js
// shadow offset always derived from the light — never set per object
export const shadowOffset = (len = T.shadow.length) => {
  const a = (T.light.angleDeg + 180) * Math.PI / 180;      // away from light
  return { dx: Math.cos(a) * len, dy: -Math.sin(a) * len };
};
// shadow color = surface color, darker and hue-shifted cooler; never grey/black
// rotate hue TOWARD a cool target (about 220), capped by hueShift, going through green/teal and never through red.
// A fixed hue offset turns warm wood blood-red.
export const shadeOf = (hex, k = 1) => { const h = hueOf(hex); const d = 220 - h;
  return shiftHsl(hex, { h: Math.sign(d) * Math.min(Math.abs(d), Math.abs(T.shadow.hueShift) * k), l: -T.shadow.darken * k, s: -0.03 }); };
// highlight = surface color pushed toward the light color
export const lightOf = (hex, amt = 0.25) => mix(hex, T.light.color, amt);
// seeded randomness for natural variation that renders identically every time
export const rng = mulberry32(T.seed);
export const jitter = (v, pct = 0.12) => v * (1 + (rng() * 2 - 1) * pct);
// stagger: never start everything on the same frame
export const stagger = (i, stepMs = 70) => i * stepMs;
```

---

## 4. Domain references (bans → instead)

### 4.1 Light
- ❌ Highlights from different directions on objects in one frame
- ❌ Rim light / outer glow on everything (`filter: blur` halos, `shadowBlur` glow)
- ❌ Radial spotlight gradient behind the subject as default background
- ❌ Teal-orange by default
- ✅ One key light per scene. Every highlight sits on the light-facing side; every shadow on the far side. Light may change between scenes for story reasons (mood shift, time passing) — note it in the episode section.
- ✅ Use value (light/dark) to lead the eye: brightest value + accent near the focal point.
- ✅ A light pool takes the shape of its fixture: a shaded desk lamp throws a cone downward, a window throws a slanted rectangle. Concentric circles around a lamp read as a target, not light.
- ✅ A light cue (lamp on, screen glows) needs a visibly dark BEFORE state. Render the frame before the cue and the frame after; if they look alike, the cue has no effect.
- ✅ Only one thing may be the brightest. Dim every secondary lit window, sign or lamp until the focal light clearly wins.

### 4.2 Shadow
- ❌ `drop-shadow(0 4px 8px rgba(0,0,0,.3))` or any blurred black shadow under every element
- ❌ Pure black/grey shadows
- ❌ Characters/objects floating with no ground contact
- ✅ Shadow model from the art direction, applied everywhere. Shadows = `shadeOf(surface)`.
- ✅ Contact shadow (small, darkest, tight) where anything touches the ground, then the cast shadow (longer, lighter) via `shadowOffset()`.
- ✅ Cast shadows fall on other surfaces (wall, floor) and bend with them.

### 4.3 Color
- ❌ Purple→blue gradients, neon-on-dark "tech", rainbow sets
- ❌ Silky multi-stop gradients on every shape
- ❌ Every element equally saturated
- ❌ Pure #000 / #FFF as the main dark and light
- ✅ Palette tokens only. Flat fills, or 2–3 hard value bands, or dithered/grainy gradients.
- ✅ Saturation hierarchy: background desaturated, midground moderate, focal point + accent most saturated.
- ✅ Atmospheric perspective: distant layers shift toward the sky color, lose contrast and saturation.

### 4.4 Typography & in-world text
- ❌ Centered bold white text with a drop shadow in every scene
- ❌ Monospace or Inter/Roboto/Arial as the "safe" choice
- ❌ Signs, posters, screens that look pasted on: flat, unlit, perfectly crisp, wrong perspective
- ❌ Thai text with broken/stacked tone marks (test ป่า, ผู้, กิ่ง, น้ำ before shipping)
- ❌ Drawing Thai one character at a time (for flicker, stagger or kerning): vowels and tone marks detach. Draw whole syllables or the whole string.
- ❌ Text placed over a lit point, or a title that leaves before it can be read (opening titles hold at least 2.5s after fully revealed)
- ✅ One on-screen text system: fixed position(s), size scale, one entry animation, inside platform safe areas.
- ✅ In-world text: transform to the surface plane, take `lightOf`/`shadeOf` like the surface, add wear (slight opacity noise, chipped edges), and blur slightly if it's far.
- ✅ Text appears on beat with narration or sound, holds long enough to read (≈ 0.3s per word, min 1s).

### 4.5 Composition & staging
- ❌ Subject dead-center and symmetric in every shot
- ❌ Same camera distance every scene
- ❌ Flat empty background + gradient
- ✅ Vary shot size across a sequence: wide (establish) → medium → close (emotion).
- ✅ Three depth layers: foreground (partially cropped, darker), midground (subject), background (atmospheric).
- ✅ Rule-of-thirds or deliberate off-center; negative space in the direction the subject looks or moves.
- ✅ Squint test: in a 64px-wide blurred thumbnail, the focal point is still obvious.
- ✅ Tangent check: no line, frame bar or edge may touch or pass through the character's head or hands. Move the line or the character.
- ✅ No big blank slab: a building or wall that covers the background must be pierced, tiered or cut back so the depth layers stay visible.
- ✅ Design for 9:16 crop from the start if clips get cut for Shorts/TikTok: keep the focal action inside the center vertical third.

### 4.6 Motion & timing
- ❌ One easing (ease-in-out) for everything
- ❌ Pop-in with scale 0 → 1.1 → 1 on every element; bounce/elastic everywhere
- ❌ Everything enters on the same frame
- ❌ Constant motion with no holds; or perfectly linear camera drifts forever
- ✅ Easing by intent: enters decelerate (`ease.enter`), exits accelerate (`ease.exit`), overshoot (`ease.settle`) only for small, light things.
- ✅ Stagger related elements 50–120ms.
- ✅ Characters: anticipation before big moves, follow-through/overlap on hair/clothes/limbs, hold key poses ≥ `holdMs`.
- ✅ Vary rhythm: fast-fast-slow beats. Cut on action. Silence/stillness before an emotional beat.
- ✅ Animate transform/opacity, not layout properties.
- ✅ Pose delta: two key poses must differ enough to read at final size. Rule of thumb: hands travel at least 1/4 of the character's height, or the silhouette outline changes clearly. If the motion strip looks like a still, widen the poses.
- ✅ Overlap: limbs, head, hair and cloth follow the main mass 2-5 frames later, never all on the same frame.
- ✅ Every shot contains one state change (asleep -> awake, dark -> lit, still -> dancing).

### 4.7 Character & silhouette
- ❌ Generic big-eyed smooth faces, symmetrical stiff stances, arms glued to sides
- ❌ Every character the same body shape
- ✅ Fill the character solid black: pose and emotion must still read.
- ✅ Line of action (C or S curve) through the body; weight on one leg; head tilt.
- ✅ One distinctive design trait per character (shape language: round = soft, square = stable, triangle = tense).
- ✅ Thickness at final size: limbs at least about 1.5% of frame height wide in a medium shot. Thin limbs read as an insect. Joints (neck, shoulder) must overlap so parts never visibly separate mid-move; check the in-between frames.
- ✅ Real-world subjects (traditional dance poses, costume, architecture, historical detail): work from a reference the user supplies or approves, and say plainly when a pose or motif is generic and unverified.

### 4.8 Texture & backgrounds
- ❌ Perfect repetition (identical windows, trees, clouds, stars)
- ❌ Sterile perfect vectors everywhere
- ✅ Seeded `jitter()` on size, spacing, rotation, color (within palette).
- ✅ Jitter organic things (leaves, rain, clouds). Built things (windows, columns, tiles) stay on a grid and vary only in size, state or wear; random placement reads as a glitch.
- ✅ Global grain overlay (`T.grain`), optional line wobble for a handmade feel, paper texture if the art direction says so.
- ✅ Backgrounds carry the light and mood too — sky gradient banded, light direction on buildings, shadows on the ground.

### 4.9 Material depth (when flat reads as too simple or cartoon-like)

Flat fills plus one grain overlay make every surface the same substance. Material depth gives each surface its own substance and lets light fall off across it. In this mode smooth gradients ARE allowed, but only as light falloff or form shading, never as decoration.

Build order (each step is a separate pass, so it can be dialled down alone):
1. **Per-material surface**, generated once from seeded noise and applied only to that material's shape (mask the texture to the shape, blend with soft-light; neutral grey = no change):
   - wood: rings warped by noise plus long streaks, foreshortened on receding planes; seams between planks
   - plaster/wall: large soft mottling, fine tooth, a few hairline cracks, a damp stain where water would run
   - fabric: a tiny repeating stitch or weave tile
   - ceramic/metal/glass: no noise; a smooth cylinder gradient (lit side, core shadow, reflected light on the far edge) and one hard specular streak facing the light
2. **Form shading** on anything rounded: a smooth gradient from the key light across the object, on top of the cel shapes.
3. **Bounce light**: the lit surface under an object throws its colour up onto the object's underside.
4. **Occlusion**: darken where surfaces meet and light cannot reach: wall-to-desk line, under a sill or lip, inside frame corners, under objects (soft wide shadow plus a tight dark contact shadow).
5. **Penumbra**: cast shadows and light-pool edges get a small blur that grows with distance from the object. Contact shadows stay sharp.
6. **Edges and wear**: a thin highlight where an edge faces the light, chipped or worn nicks on handled edges, inset bevels on drawers and frames (dark on the side away from light, light on the side facing it).
7. **Small real objects**: thickness on paper, a pen, a handle, a rim. One story-specific prop per scene (see section 9).
8. **Glass and air**: droplets that catch the key light on their light-facing side, a faint reflection of the lamp, a light shaft with a few drifting dust motes. Bloom only at the actual light source.
9. **Lens**: far layers more blurred than the subject, near foreground blurred and darkest, a smooth falloff map (multiply) from the key light into cool dark, light vignette. Text is drawn after all of this so it stays clean.

Limits that keep it from turning to mush:
- ❌ Noise as static: if any texture is visible as salt-and-pepper at 50% zoom, halve its contrast. Texture should be felt before it is seen.
- ❌ The same texture on every surface, or texture on skin.
- ❌ Detail that buries the focal point or makes in-world text unreadable; re-check the squint test and every sign after adding materials.
- ❌ Darkening the whole frame: after the falloff map, the lit area must be as bright as in the flat version.
- ✅ Detail density follows attention: most detail near the focal point, least in the corners.
- ✅ Palette tokens still rule: every texture, highlight and shadow is derived from palette colours with `lightOf`/`shadeOf`.
- ✅ Characters need the same treatment as the set (form shading, cloth texture, bounce); a flat character in a textured room looks pasted in.

Code pattern: build textures once at load (`fbm` noise into offscreen canvases), keep a helper that paints a texture only where a layer has pixels, and keep every strength (texture alpha, occlusion alpha, falloff) as a token so `/quieter` can lower them.

---

## 5. `/lint` — static checks

Search the code and report each hit with file:line and the fix:

- `drop-shadow(`, `box-shadow`, `shadowBlur`, `shadowColor` with black/grey rgba → replace with shadow model
- Hardcoded hex/rgb outside `tokens` → move to palette tokens
- `linear-gradient`/`createLinearGradient` with >3 stops or purple/blue hues → band or remove
- `ease-in-out` / `easeInOut` used for >50% of tweens → assign per intent
- Many elements with identical `delay`/start frame → add `stagger()`
- `scale(0)` / `from {scale:0}` pop-ins → use opacity + small translate
- `text-align:center` + white fill + shadow on most text → apply text system
- `Math.random()` → seeded `rng()` (renders must be reproducible)
- Fonts: Inter, Roboto, Arial, system-ui, monospace as display → art-direction fonts
- Animated `width`/`height`/`top`/`left` → transforms
- Material depth scenes: one global grain as the only texture, textures not masked to their material, per-frame `Math.random()` noise (flickers), text drawn before the falloff map

Lint finds code smells; it can't judge the picture. Always follow with `/critique`.

---

## 6. `/critique` — render, look, score

### Render frames
Pick whichever matches the stack:
- **Remotion:** `npx remotion still <comp> out/f_###.png --frame=<n>`
- **HTML/JS/CSS/GSAP:** Playwright — load the page, pause the timeline (or set `?t=` / seek the timeline), `page.screenshot()` at each timestamp
- **Canvas:** draw the frame at time t, `canvas.toDataURL()` → save PNG
- **HyperFrames:** render preview / stills at the chosen timestamps

Frames to render: first frame, each scene's key pose, the busiest frame, the last frame, plus a 6-frame strip across one movement to judge motion. If the project ships 9:16 clips, also render a 9:16 crop of key frames.

Render budget: iterate on low-resolution stills only. Render the full video once, after the stills score 30 or more. With slow (software or 3D) rendering, say how long the full render will take before starting it, and prefer the user's GPU machine when available.

Motion check: crop the motion strip tight on the moving subject and compare first and last frame. If they are hard to tell apart, score Motion 1 at most.

### Look at every frame image, then score (0–4 each, total /40)

| # | Criterion | 0 | 4 |
|---|---|---|---|
| 1 | Light consistency | mixed directions, glow everywhere | one key light, every highlight agrees |
| 2 | Shadows | blurry grey drop shadows, floating objects | chosen model, colored, grounded, consistent angle |
| 3 | Palette | off-palette, equal saturation | tokens only, accent on focal point |
| 4 | Focal point | eye wanders | obvious in squint test |
| 5 | Composition | centered/same distance every shot | varied shots, depth layers, intentional space |
| 6 | Text | default centered white + shadow, pasted signs | one system; in-world text lit and worn; Thai renders correctly |
| 7 | Texture & line | sterile default vectors; or noise that reads as static | intentional, consistent with direction; in material depth each surface reads as its own material and edges, contacts and falloff are present |
| 8 | Motion | same easing, simultaneous, no holds | per-intent easing, stagger, holds, anticipation |
| 9 | Character | stiff, unreadable silhouette | clear line of action, readable in black |
| 10 | Distinctness | looks like the last piece / generic AI | clearly its own, matches the 3-word mood |

Output format:
```
Score: 27/40
1 Light 2 — rim glow on desk and lamp contradicts top-left key
...
Worst 3: #2 shadows, #8 motion, #5 composition
Suggested commands: /reshadow, /timing, /stage
```

Score honestly. A 4 means a professional would not change it. If unsure between two scores, pick the lower.

### Loop
Below 30/40 → run the suggested commands, re-render the same frames, re-score. Max 3 rounds, then show the user frames + scores + what's still weak and ask. Show before/after frames side by side whenever possible.

---

## 7. Rules for breaking rules

A ban can be broken on purpose (e.g. dead-center symmetric shot for a confrontation, glow for a dream sequence). When you break one, write it in the episode section of `.art-direction.md` with the reason. Breaking by intent is direction; breaking by default is slop.

## 8. Honesty

- Don't claim a frame is fixed without re-rendering and looking.
- Polish doesn't rescue a weak story or hook. If a scene has no clear story beat, say so before spending rounds on lighting.
- Score a baseline or comparison version by the same rubric and do not build it to look bad.

## 9. Above 30/40: the finishing pass

Bans remove slop; they do not create quality. Once a shot passes 30, spend remaining effort in this order, one item per round:
1. Acting: the character's key poses and timing (biggest gain, usually the weakest score).
2. One specific, observed detail that belongs only to this subject (a worn sign letter, a garland, a mug) instead of more generic decoration.
3. Shot variety across the sequence: wide, medium, close, and one camera move with a reason.
4. Sound: lamp click, rain, footsteps, music hit on the state change. Picture-only tests undersell the shot.
5. A reference frame from the user to match or beat; ask for one when the direction is vague.
6. If the user wants more realism than material depth gives, say so plainly: code-drawn 2D tops out at a painted look. The next step is a hybrid (image-model backgrounds or textures, with code keeping characters, light, text and motion), which costs credits and makes scene-to-scene consistency harder.
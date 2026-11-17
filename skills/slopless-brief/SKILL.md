---
name: slopless-brief
description: Use before building any video, animation or graphic. Collects references or grills the user for purpose, fills gaps with named defaults (including mood-matched colour grades), and gets a go on one style frame before real work starts.
---

# slopless-brief

Most wasted renders come from building before the target is known. This skill runs BEFORE any build skill (slopless-2d, video skills, design work). Its output is a short `.brief.md` that the user has confirmed, plus one approved style frame. No brief, no build.

Skip it only when the user is iterating on work that already has a brief, or asks for a tiny change.

## 1. Reference first

Open with one message that asks for references and nothing else heavy:

> Before I build: do you have 1-3 references (image, screenshot, link, or a film/channel name)? For each, tell me what to take from it: colour, level of detail, drawing style, lighting, pacing or mood. "None" is a fine answer.

Rules:
- A reference is for palette, mood, detail level, lighting and pacing. Never copy a specific frame, character or logo from it.
- If a link cannot be opened, say so and ask for a screenshot. Never pretend to have seen it.
- When a reference image is available, derive its grade with `apply_grade.py --from-ref` and show it applied to a frame, instead of guessing the colours by eye.
- Two references that disagree: ask which wins for which property.

## 2. Grill (when there is no reference, or gaps remain)

Ask in rounds of 3-4 questions at most, each with options and a marked default so the user can answer in a few words. Stop as soon as the required fields of the brief are filled. Never ask something the user or memory already answered.

Round 1, purpose (always):
1. What is this for and where will it be watched? (YouTube 16:9 / Shorts-TikTok 9:16 / class presentation / client)
2. Who watches, and what should they feel or remember after? One sentence.
3. How long, and is there voiceover or on-screen text? Which language?

Round 2, look (when no reference covers it):
4. Mood in three words. Offer 3 contrasting sets that fit the purpose.
5. Detail level: flat / clean depth (default) / rich texture.
6. Subject, place, time of day, weather.
7. Anything you hate or have rejected before? (the anti-reference is as useful as the reference)

Round 3, limits (only for work over about 15 minutes or anything that spends credits):
8. Deadline and how many revision rounds you want.
9. May I spend paid credits (image/video/voice models), and how much?
10. What makes this a success: a number, a person's approval, or your own taste?

Push back while grilling: if the purpose is vague ("just make it cool"), say what cannot be decided without it and offer two concrete readings to pick from. If the user is polishing something with no audience test planned, say so once.

"Just do it" is allowed: fill every gap with the defaults below, list the assumptions in at most 6 lines marked (assumed), and continue to the style frame.

## 3. Defaults (used when the user gives nothing; always named, never silent)

| Field | Default |
|---|---|
| Format | 16:9, 1920x1080, 30 fps; keep focal action inside the centre third for 9:16 crops |
| Length | 6-8 s for a test shot; per-scene 4-7 s in a film |
| Detail level | clean depth |
| Light | one key light, low and from the side or behind |
| Palette | 5-6 colours derived from the grade |
| Text | none on the test shot; elegant serif for titles, never neon |
| Motion | one state change per shot, slow camera push |
| Grade | chosen from mood with the table below |

### Colour grade presets

Pick by the mood words in the brief. If two fit, show both. Parameters live in `grades.json` next to this file; `apply_grade.py` applies them to stills (`--strip` renders several on one frame).

| Preset | Mood it serves | Look |
|---|---|---|
| `clean-neutral` | clear, informative, honest | true colours, slight contrast. Explainers, product, UI |
| `golden-warm` | hopeful, nostalgic, calm | amber wash, warm highlights, brown shadows |
| `cool-dawn` | quiet, lonely, focused | pale blue wash, lowered saturation, soft blacks |
| `pastel-storybook` | gentle, playful, childlike | lifted blacks, low contrast, pink-cream highlights |
| `moody-green` | tense, uneasy, mysterious | green wash, desaturated, darker |
| `dusk-rose` | bittersweet, romantic, ending | rose-peach highlights, plum shadows |
| `heritage-gold` | ceremonial, historical, dignified | deep gold wash, dark brown shadows |
| `cold-dread` | fear, dread, isolation | cyan-black, heavy desaturation, dark, hard contrast |
| `ink-mono` | serious, memory, documentary | near monochrome on warm paper |

How a grade is used in a code-drawn scene: derive the palette tokens from it (shadows colour = darkest token, highlights colour = light token, wash = the dominant mid), then apply the same grade as the final pass so every shot of the film shares it. One grade per film; a second grade only for a deliberate story shift (flashback, dream), written in the brief.

Honest limit: a preset is a starting point. On a scene that is mostly highlights or mostly shadows it will look weaker or stronger than the sample, so always judge it on the user's own frame.

## 4. Write and confirm the brief

Save `.brief.md` in the project root, then echo it back in 8 lines or fewer and ask for a go.

```markdown
# Brief
Purpose / platform:
Audience and the feeling to leave:
Length, voice, text language:
Subject, place, time:
Mood (3 words):
References (what to take from each) / anti-references:
Detail level:        Grade:
Limits: deadline, revision rounds, credits allowed
Success test:
Assumed (not confirmed by the user):
```

Anything in "Assumed" is shown to the user, not buried.

## 5. Cheapest proof first

1. One style frame: a single still of the key moment. If the grade is undecided, render a grade strip of 2-3 presets on that still.
2. The user picks or corrects. Corrections go into the brief.
3. Only then animate, and only one shot. The full piece starts after that shot is approved.

State the cost before each step that takes more than a few minutes or spends credits, and wait for a yes.

## 6. Hand-off

- slopless-2d: `/teach-2d` reads `.brief.md`, copies its answers into `.art-direction.md`, and asks only what the brief does not cover.
- Other build skills: pass the brief as the first context.
- When the user rejects a result, update the brief first (what was misunderstood), then rebuild. A rejected render with an unchanged brief will be rejected again.

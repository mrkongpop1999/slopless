// "Still Here" — one Paper-cut Lightbox shot (lemo-opuscar paper-lantern engine) directed with slopless-2d tokens.
// A sleeping rainy street; one window's lamp clicks on; a silhouette asleep at the desk lifts its head; a paper caption writes itself.
import * as THREE from 'three';
import { sheet, skyPanel, text } from './paper.js';
import { stage, aim } from './stage.js';
import { mulberry, lerp, clamp, seg, ss, TAU } from './lib.js';

export const DUR = 5.5;

// ===== TOKENS (from .art-direction.md) =====
const C = { sky0: '#0a1412', sky1: '#1c2e2a', far: '#5d7770', mid: '#34504a', curtain: '#2b3d39', facade: '#1a2826', front: '#070c0b',
  room: '#c98f52', sil: '#140e0b', light: '#ffbf6a', cream: '#e6d6b8', ink: '#16120f' };
const EASE = { enter: [0.16, 1, 0.3, 1], exit: [0.7, 0, 0.84, 0] };
const SERIF = '"Fraunces"', THAI = '"Bai Jamjuree"';
const W0 = { x: .062, y: .004, w: .066, h: .05 };          // the one lit window — right third of frame
const HIP = { x: W0.x + .02, y: W0.y - .013 };
const POSE = { body: [.75, .06], head: [1.05, .05] };      // radians: slumped → upright (CCW tips toward the desk)

function bezier([x1, y1, x2, y2]) { const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = t => ((ax * t + bx) * t + cx) * t, sy = t => ((ay * t + by) * t + cy) * t, dx = t => (3 * ax * t + 2 * bx) * t + cx;
  return u => { if (u <= 0) return 0; if (u >= 1) return 1; let t = u; for (let i = 0; i < 8; i++) { const e = sx(t) - u; if (Math.abs(e) < 1e-6) break; t -= e / dx(t); } return sy(t); }; }
const E = { enter: bezier(EASE.enter), exit: bezier(EASE.exit) };

const PAPER = '#9a9a9a', BASE = new THREE.Color(PAPER).r;
const tint = (m, hex) => m.material.color.set(hex).multiplyScalar(1 / BASE);
const cut = (x, fn) => { x.save(); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.strokeStyle = '#000'; fn(); x.restore(); };

export function shot() {
  const S = stage({ light: [W0.x - .01, W0.y, -.1], lightR: .09, lightCol: '#ffcf8a', floor: .16, key: 1.9, amb: .32, ambCol: '#9fbab2' });
  const { U } = S, R = mulberry(41);

  // L0 sky — cool green-slate, banded low cloud, no stars (it's raining)
  S.add(skyPanel({ w: 1.0, h: .55, z: -.142, stops: [[0, C.sky1], [.55, C.sky0], [1, C.sky0]], gain: .9,
    extra: x => { for (let i = 0; i < 5; i++) { x.fillStyle = `rgba(150,180,170,${.035 + i * .006})`; x.fillRect(-.5, .02 + i * .03, 1, .012); } } }));

  // L1 far skyline (light, translucent) with a few tiny lit points
  const farPts = [];
  const far = S.add(sheet({ U, w: .9, h: .3, y: -.035, z: -.122, trans: .85, glow: 1.2, glowCol: C.light, ppm: 3200,
    draw: x => { x.fillStyle = PAPER; let u = -.45; while (u < .45) { const w = .02 + R() * .035, h = .05 + R() * .07; x.fillRect(u, -.15, w, h + .15); if (R() < .3) x.fillRect(u + w * .4, -.15 + h + .15, .0015, .012); farPts.push([u + R() * w, -.15 + .15 + R() * h * .8]); u += w + .002; } x.fillRect(-.45, -.15, .9, .09); },
    glowDraw: g => { g.fillStyle = '#000'; g.fillRect(-.45, -.15, .9, .3); g.fillStyle = '#fff'; farPts.forEach(([a, b], i) => { if (i % 3 === 0) g.fillRect(a, b - .15 + .09, .0016, .0016); }); } }));
  tint(far, C.far);

  // L2 mid: the buildings across the street (left), a few dim windows
  const midWins = [];
  const mid = S.add(sheet({ U, w: .5, h: .3, x: -.05, y: 0, z: -.088, trans: .45, glow: .9, glowCol: C.light, ppm: 4200,
    draw: x => { x.fillStyle = PAPER;
      [[-.25, .05, .006], [-.2, .045, .026], [-.155, .05, .012], [-.105, .034, .036], [-.071, .07, .016], [.0, .09, .03]].forEach(([u, w, top]) => { x.fillRect(u, -.15, w - .003, top + .15); });
      cut(x, () => { for (let r = 0; r < 4; r++) for (let q = 0; q < 14; q++) { const wx = -.196 + q * .0198, wy = -.004 - r * .0155; if (R() < .62) { x.fillRect(wx, wy, .007, .009); midWins.push([wx, wy, R() < .22]); } } }); },
    glowDraw: g => { g.fillStyle = '#000'; g.fillRect(-.25, -.15, .5, .3); g.fillStyle = '#fff'; midWins.forEach(([a, b, on]) => on && g.fillRect(a, b, .007, .009)); } }));
  tint(mid, C.mid);

  // laundry sign on the mid building: cream board, dark Thai letters; its lamp sits ABOVE (never over the text)
  const sign = S.add(sheet({ U, w: .06, h: .03, x: -.092, y: .0, z: -.083, trans: .3, shadow: true, ppm: 16000, finish: { rim: .2, under: .25 },
    draw: c => { c.fillStyle = '#2a3532'; c.fillRect(-.024, .006, .0012, .008); c.fillRect(.0228, .006, .0012, .008);   // brackets
      c.fillStyle = '#d8c8a0'; c.fillRect(-.027, -.008, .054, .015); text(c, 'ซักผ้า 24 ชม.', 0, -.0006, .0072, THAI, { fill: C.ink, weight: 700 });
      c.fillStyle = '#2a3532'; c.fillRect(-.001, .009, .002, .006); c.beginPath(); c.moveTo(-.006, .0115); c.lineTo(.006, .0115); c.lineTo(.004, .0085); c.lineTo(-.004, .0085); c.closePath(); c.fill(); },
    glowDraw: g => { g.fillStyle = '#000'; g.fillRect(-.03, -.015, .06, .03); g.fillStyle = '#fff'; g.fillRect(-.0035, .0082, .007, .0012); },
    glow: 2.2, glowCol: '#ffd7a0' }));
  sign.material.color.set('#ffffff');

  // rain: thin paper slivers on two sheets in the street gap, sliding down on a loop
  const rainDraw = seed => x => { const r = mulberry(seed); x.fillStyle = PAPER; for (let i = 0; i < 220; i++) { const u = (r() - .5) * .5, v = (r() - .5) * .3, l = .006 + r() * .01; x.save(); x.translate(u, v); x.rotate(.12); x.fillRect(-.00018, 0, .00036, l); x.restore(); } };
  const rain = [7, 8].map(sd => { const m = S.add(sheet({ U, w: .5, h: .3, x: -.12, z: -.066, trans: .5, shadow: false, recv: false, finish: { rim: 0, under: 0, grain: false }, ppm: 5200, draw: rainDraw(sd) })); tint(m, '#7f9690'); return m; });

  // curtained windows behind the facade (lighter than the facade: the ladder), one hole left for the lit room
  const curt = S.add(sheet({ U, w: .4, h: .2, x: .15, y: 0, z: -.05, trans: .3, glow: .28, glowCol: C.light, ppm: 3600,
    draw: x => { x.fillStyle = PAPER; x.fillRect(-.2, -.1, .4, .2); cut(x, () => x.fillRect(W0.x - .15 - W0.w / 2 - .002, W0.y - W0.h / 2 - .002, W0.w + .004, W0.h + .004)); },
    glowDraw: g => { g.fillStyle = '#000'; g.fillRect(-.2, -.1, .4, .2); g.fillStyle = '#fff'; g.fillRect(.154 - .15 - .012, .045 - .009, .024, .011); } }));
  tint(curt, C.curtain);

  // the lit room: warm wall with the lamp's pool in its glow map
  const room = S.add(sheet({ U, w: .09, h: .07, x: W0.x, y: W0.y, z: -.058, trans: .9, glow: 1.7, glowCol: C.light, ppm: 5200, finish: { rim: 0, under: 0 },
    draw: x => { x.fillStyle = PAPER; x.fillRect(-.045, -.035, .09, .07); },
    glowDraw: g => { g.fillStyle = '#000'; g.fillRect(-.045, -.035, .09, .07);
      const gr = g.createRadialGradient(-.014, -.006, 0, -.014, -.006, .042); gr.addColorStop(0, '#fff'); gr.addColorStop(.35, '#bbb'); gr.addColorStop(1, '#222');
      g.fillStyle = gr; g.fillRect(-.045, -.035, .09, .07); } }));
  tint(room, C.room); const roomCol = room.material.color.clone();

  // silhouettes in the room: desk + lamp + mug (static), body and head (jointed)
  const desk = S.add(sheet({ U, w: .09, h: .06, x: W0.x, y: W0.y, z: -.052, trans: .03, ppm: 12000, glow: 3, glowCol: C.light,
    draw: x => { x.fillStyle = PAPER; x.fillRect(-.045, -.03, .09, .02);                                   // desk top & body
      x.lineCap = 'round'; x.lineWidth = .0011; x.beginPath(); x.moveTo(-.018, -.01); x.lineTo(-.024, .006); x.lineTo(-.016, .011); x.strokeStyle = PAPER; x.stroke();
      x.beginPath(); x.ellipse(-.018, -.0095, .0045, .0012, 0, 0, TAU); x.fill();                           // lamp base
      x.beginPath(); x.moveTo(-.019, .013); x.lineTo(-.013, .0135); x.lineTo(-.0085, .0065); x.lineTo(-.0155, .0055); x.closePath(); x.fill(); // shade
      x.fillRect(.031, -.01, .0045, .0055);                                                                   // mug
      x.lineWidth = .0034; x.beginPath(); x.moveTo(.016, -.0085); x.lineTo(-.002, -.0085); x.stroke();      // forearm on the desk
      x.beginPath(); x.ellipse(-.0035, -.008, .0028, .002, 0, 0, TAU); x.fill(); },                           // hand
    glowDraw: g => { g.fillStyle = '#000'; g.fillRect(-.045, -.03, .09, .06); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(-.012, .0058, .0034, .0009, -.15, 0, TAU); g.fill(); } }));
  tint(desk, C.sil);
  const body = S.add(sheet({ U, w: .05, h: .05, x: HIP.x, y: HIP.y, z: -.051, trans: .03, ppm: 12000,
    draw: x => { x.fillStyle = PAPER; x.beginPath(); x.moveTo(-.007, -.004); x.quadraticCurveTo(-.009, .012, -.006, .019); x.lineTo(-.002, .0215);
      x.quadraticCurveTo(.007, .02, .0075, .006); x.lineTo(.007, -.004); x.closePath(); x.fill();
      x.lineCap = 'round'; x.lineWidth = .0034; x.strokeStyle = PAPER; x.beginPath(); x.moveTo(-.004, .017); x.lineTo(-.004, .006); x.stroke(); } }));
  tint(body, C.sil);
  const NECK = [-.0035, .0215];
  const head = S.add(sheet({ U, w: .03, h: .03, x: 0, y: 0, z: -.0505, trans: .03, ppm: 14000,
    draw: x => { x.fillStyle = PAPER; x.fillRect(-.0016, -.001, .0032, .004);                                // neck
      x.beginPath(); x.ellipse(-.0005, .0078, .0056, .0062, 0, 0, TAU); x.fill();
      x.beginPath(); x.moveTo(-.0058, .0085); x.lineTo(-.0078, .0064); x.lineTo(-.0055, .0058); x.fill();      // nose, facing the lamp
      x.beginPath(); x.moveTo(-.003, .0132); x.quadraticCurveTo(.001, .0172, .0044, .0128); x.lineTo(.002, .012); x.fill(); } })); // hair tuft
  tint(head, C.sil);

  // L3 facade: our building, the lit window cut through it, a mullion and sill
  const facade = S.add(sheet({ U, w: .5, h: .45, x: .2, y: -.15, z: -.04, trans: .15, ppm: 3600,
    draw: x => { x.fillStyle = PAPER; const ox = -.2, oy = .15;   // world → sheet coords
      x.fillRect(-.25, -.225, .5, .445); x.fillRect(-.25, .222, .5, .003);                                          // wall up to y≈.07 + parapet line
      cut(x, () => { for (let r = 0; r < 3; r++) for (let q = 0; q < 6; q++) { const cx = .016 + q * .046 + ox, cy = .045 - r * .041 + oy; x.fillRect(cx - W0.w / 2 * .6, cy - W0.h / 2 * .62, W0.w * .6, W0.h * .62); }
        x.fillRect(W0.x + ox - W0.w / 2, W0.y + oy - W0.h / 2, W0.w, W0.h); });
      x.fillRect(W0.x + ox - W0.w / 2 - .003, W0.y + oy - W0.h / 2 - .003, W0.w + .006, .003); } }));             // sill
  tint(facade, C.facade);

  // L4 front: parapet band at the bottom + a cropped branch top-left (darkest, near-opaque)
  const front = S.add(sheet({ U, w: .9, h: .5, z: -.006, trans: .05, ppm: 2600,
    draw: x => { x.fillStyle = PAPER; x.fillRect(-.45, -.25, .9, .19);
      x.lineCap = 'round'; x.strokeStyle = PAPER; const r = mulberry(5);
      x.lineWidth = .006; x.beginPath(); x.moveTo(-.26, .16); x.quadraticCurveTo(-.17, .1, -.105, .085); x.stroke();
      x.lineWidth = .0028; x.beginPath(); x.moveTo(-.17, .105); x.quadraticCurveTo(-.14, .07, -.12, .062); x.stroke();
      for (let i = 0; i < 26; i++) { const t = r(), px = lerp(-.24, -.105, t) + (r() - .5) * .02, py = lerp(.145, .08, t) + (r() - .6) * .03;
        x.save(); x.translate(px, py); x.rotate(-1.2 + r() * 1.6); x.beginPath(); x.ellipse(0, 0, .0075 + r() * .004, .0025, 0, 0, TAU); x.fill(); x.restore(); } } }));
  tint(front, C.front);

  // paper caption on the parapet: grows from its left edge (clip reveal, glyphs never squashed)
  const CAP = { x: -.062, y: -.07, w: .1, h: .016 };
  const cap = S.add(sheet({ U, w: CAP.w, h: CAP.h, x: CAP.x, y: CAP.y, z: .001, trans: .12, shadow: true, ppm: 16000, finish: { rim: .25, under: .3 },
    draw: c => { c.fillStyle = '#ffffff'; text(c, 'Day 41. Still here.', -CAP.w / 2 + .002, 0, .0098, SERIF, { fill: '#ffffff', weight: 'italic 400', align: 'left' }); } }));
  tint(cap, C.cream);

  // ===== animation =====
  const pose = t => {                     // 0 slumped … 1 upright, with a small anticipation dip
    if (t < 1.7) return .006 * Math.sin(t * 3.2);
    if (t < 2.0) return -.08 * E.exit(seg(t, 1.7, 2.0));
    return lerp(-.08, 1, E.enter(seg(t, 2.0, 2.65)));
  };
  return {
    S,
    update(t) {
      // lamp cue: window first (with a flicker), then the stack's backlight
      const on = t < .45 ? 0 : (t < .52 ? .55 : t < .58 ? .15 : t < .66 ? .8 : 1);
      [room, desk].forEach(m => { m.material.userData.u.uGlowLit.value = on; });
      room.material.userData.u.uTrans.value = lerp(.08, .9, on); room.material.color.copy(roomCol).multiplyScalar(lerp(.3, 1, on));
      U.uLit.value = lerp(.28, 1, ss(seg(t, .6, 1.15)));
      const p = pose(t), br = lerp(POSE.body[0], POSE.body[1], p), hr = lerp(POSE.head[0], POSE.head[1], p);
      body.rotation.z = br;
      const c = Math.cos(br), s = Math.sin(br);
      head.position.set(HIP.x + NECK[0] * c - NECK[1] * s, HIP.y + NECK[0] * s + NECK[1] * c, -.0505);
      head.rotation.z = br + hr;
      rain.forEach((m, i) => { m.position.y = .15 - ((t * .09 + i * .15) % .3); });
      const g = E.enter(seg(t, 3.0, 3.75)), x0 = CAP.x - CAP.w / 2;
      cap.material.userData.u.uClip.value.set(x0 - 1, CAP.y, 1 + g * (CAP.w + .002), 0);
      aim(S.cam, [lerp(-.012, .01, ss(seg(t, 0, DUR))), lerp(.002, .004, ss(seg(t, 0, DUR))), lerp(.445, .375, ss(seg(t, 0, DUR))), lerp(-.01, .012, ss(seg(t, 0, DUR))), .003, -.08], t);
    },
    post() { return { focus: S.cam.position.z + .05, aper: 7, maxCoc: 11, bloom: { strength: .38, radius: .55, threshold: 1.1 } }; },
    grade(t) { return { expo: 1.02, vig: .42, sat: .94, contrast: .12, lift: [0, .006, .004], gain: [1.04, 1, .94], fade: ss(seg(t, 0, .35)) }; },
  };
}
export const texts = () => [];

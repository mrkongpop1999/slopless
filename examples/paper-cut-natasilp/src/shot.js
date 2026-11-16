// Opening shot: ประวัติศาสตร์นาฏศิลป์ไทย สมัยรัตนโกสินทร์ — Paper-cut Lightbox engine, slopless-2d tokens.
import * as THREE from 'three';
import { sheet, skyPanel, text } from './paper.js';
import { stage, aim } from './stage.js';
import { mulberry, lerp, clamp, seg, ss, TAU } from './lib.js';

export const DUR = 6.5;

// ===== TOKENS (from .art-direction.md) =====
const C = { sky: [[0, '#3a2418'], [.45, '#9a5a32'], [.62, '#d08e55'], [1, '#e3a466']], far: '#b07a50', hall: '#5a3624', screen: '#e2a35e',
  dancer: '#170d08', stage: '#2a170e', front: '#0c0705', cream: '#efe0c0', light: '#ffc070' };
const EASE = { enter: [0.16, 1, 0.3, 1], ram: [0.45, 0, 0.2, 1] };
const THAI = '"Trirong"';
const DX = .055, FL = -.031;                       // dancer x (right third), stage floor
const HIP0 = [DX, FL + .0215];

function bezier([x1, y1, x2, y2]) { const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = t => ((ax * t + bx) * t + cx) * t, sy = t => ((ay * t + by) * t + cy) * t, dx = t => (3 * ax * t + 2 * bx) * t + cx;
  return u => { if (u <= 0) return 0; if (u >= 1) return 1; let t = u; for (let i = 0; i < 8; i++) { const e = sx(t) - u; if (Math.abs(e) < 1e-6) break; t -= e / dx(t); } return sy(t); }; }
const E = { enter: bezier(EASE.enter), ram: bezier(EASE.ram) };

const PAPER = '#9a9a9a', BASE = new THREE.Color(PAPER).r;
const tint = (m, hex) => m.material.color.set(hex).multiplyScalar(1 / BASE);
const cut = (x, fn) => { x.save(); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.strokeStyle = '#000'; fn(); x.restore(); };
const poly = (x, pts) => { x.beginPath(); x.moveTo(...pts[0]); for (const p of pts.slice(1)) x.lineTo(...p); x.closePath(); x.fill(); };

// ram poses (radians, CCW from +x). upper/fore are absolute angles; head is tilt.
const POSE_A = { rU: 1.05, rF: 2.05, lU: Math.PI + .5, lF: Math.PI - .25, head: .14, bob: -.0012 };
const POSE_B = { rU: .45, rF: 1.35, lU: Math.PI + .95, lF: Math.PI + .15, head: -.1, bob: .0004 };

export function shot() {
  const S = stage({ light: [DX, .004, -.1], lightR: .1, lightCol: '#ffc98a', floor: .2, key: 1.8, amb: .34, ambCol: '#d9a982' });
  const { U } = S, R = mulberry(9);

  // L0 dusk sky + a low sun behind the far temples
  S.add(skyPanel({ w: 1.0, h: .55, z: -.142, stops: C.sky, gain: .95,
    extra: x => { x.fillStyle = 'rgba(255,226,170,.55)'; x.beginPath(); x.arc(-.12, -.02, .045, 0, TAU); x.fill();
      for (let i = 0; i < 4; i++) { x.fillStyle = `rgba(120,60,35,${.10 + i * .03})`; x.fillRect(-.5, .05 + i * .028 + R() * .006, 1, .006 + R() * .004); } } }));

  // L1 far: a prang, chedis, a tree line (generic silhouettes)
  const far = S.add(sheet({ U, w: .9, h: .3, y: -.05, z: -.122, trans: .85, ppm: 3600,
    draw: x => { x.fillStyle = PAPER; const by = -.01;
      const prang = (cx, h, w) => { for (let i = 0; i < 7; i++) { const t0 = i / 7, t1 = (i + 1) / 7, w0 = w * (1 - Math.pow(t0, 1.6) * .8), w1 = w * (1 - Math.pow(t1, 1.6) * .8);
          poly(x, [[cx - w0 / 2, by + h * t0], [cx + w0 / 2, by + h * t0], [cx + w1 / 2, by + h * t1 + .0006], [cx - w1 / 2, by + h * t1 + .0006]]); }
        x.fillRect(cx - .0006, by + h - .002, .0012, .016); x.fillRect(cx - w * .7, by - .02, w * 1.4, .02 + .008); };
      const chedi = (cx, h, w) => { x.beginPath(); x.ellipse(cx, by + h * .28, w / 2, h * .26, 0, 0, Math.PI); x.fill(); x.fillRect(cx - w / 2, by, w, h * .28);
        poly(x, [[cx - w * .16, by + h * .5], [cx + w * .16, by + h * .5], [cx, by + h]]); x.fillRect(cx - w * .65, by - .02, w * 1.3, .022); };
      prang(-.115, .105, .036); prang(-.168, .06, .022); prang(-.062, .06, .022); chedi(.2, .085, .03); chedi(.26, .055, .02);
      for (let u = -.45; u < .45; u += .012) { x.beginPath(); x.arc(u, by + .004 + R() * .006, .007 + R() * .006, 0, TAU); x.fill(); }
      x.fillRect(-.45, -.15, .9, .14); } }));
  tint(far, C.far);

  // glowing stage screen (the "jor") — the key light of the shot
  const scr = S.add(sheet({ U, w: .118, h: .066, x: DX - .005, y: FL + .033, z: -.064, trans: .92, glow: 1.6, glowCol: C.light, ppm: 5200, finish: { rim: 0, under: 0 },
    draw: x => { x.fillStyle = PAPER; x.fillRect(-.059, -.033, .118, .066); },
    glowDraw: g => { g.fillStyle = '#000'; g.fillRect(-.059, -.033, .118, .066);
      const gr = g.createRadialGradient(.005, -.008, 0, .005, -.008, .065); gr.addColorStop(0, '#fff'); gr.addColorStop(.4, '#aaa'); gr.addColorStop(1, '#1a1a1a');
      g.fillStyle = gr; g.fillRect(-.059, -.033, .118, .066); } }));
  tint(scr, C.screen); const scrCol = scr.material.color.clone();

  // L2 the hall: columns + a gable roof (ช่อฟ้า, ใบระกา, หางหงส์), pediment pierced with small cut motifs
  const HX = DX - .005;
  const hall = S.add(sheet({ U, w: .4, h: .25, x: HX, y: .02, z: -.058, trans: .45, ppm: 6000,
    draw: x => { x.fillStyle = PAPER; const fy = FL - .02;
      x.fillRect(-.068, fy, .01, .1); x.fillRect(.058, fy, .01, .1);                                  // columns
      const ey = .026, apex = .088, L = -.078, Rr = .078;                                              // roof, local to hall sheet (y .02 offset)
      poly(x, [[L - .012, ey - .004], [Rr + .012, ey - .004], [Rr - .004, ey + .006], [L + .004, ey + .006]]);          // lower eave
      poly(x, [[L, ey + .004], [Rr, ey + .004], [Rr - .012, ey + .016], [L + .012, ey + .016]]);                          // lower roof skirt
      poly(x, [[L + .006, ey + .014], [Rr - .006, ey + .014], [0, ey + apex - .022]]);                                   // gable
      poly(x, [[L + .022, ey + .034], [Rr - .022, ey + .034], [0, ey + apex]]);                                          // upper tier (ซ้อนชั้น)
      // ใบระกา: teeth along both upper slopes
      for (let i = 1; i < 9; i++) { const t = i / 9; [[L + .022, -1], [Rr - .022, 1]].forEach(([sx, sg]) => {
          const px = lerp(sx, 0, t), py = lerp(ey + .034, ey + apex, t); poly(x, [[px, py], [px + sg * .0012, py + .0012], [px + sg * .0045, py + .0042]]); }); }
      // ช่อฟ้า at the apex: a slender upward hook
      x.lineCap = 'round'; x.strokeStyle = PAPER; x.lineWidth = .0016;
      x.lineWidth = .0022; x.beginPath(); x.moveTo(0, ey + apex - .002); x.quadraticCurveTo(-.001, ey + apex + .014, .006, ey + apex + .019); x.quadraticCurveTo(.009, ey + apex + .02, .008, ey + apex + .016); x.stroke(); x.lineWidth = .0016;
      // หางหงส์ curls at both lower ends
      [[L - .012, -1], [Rr + .012, 1]].forEach(([px, sg]) => { x.beginPath(); x.moveTo(px, ey - .004); x.quadraticCurveTo(px + sg * .006, ey - .002, px + sg * .005, ey + .007); x.stroke(); });
      // pierced pediment motifs (backlight shows through)
      cut(x, () => { for (let i = -3; i <= 3; i++) { const px = i * .011, py = ey + .02 - Math.abs(i) * .003; x.beginPath(); x.moveTo(px, py + .004); x.lineTo(px + .0025, py); x.lineTo(px, py - .004); x.lineTo(px - .0025, py); x.closePath(); x.fill(); }
        x.beginPath(); x.ellipse(0, ey + apex - .034, .004, .006, 0, 0, TAU); x.fill(); });
      x.fillRect(-.07, ey - .012, .14, .006); } }));                                                    // lintel above the screen
  tint(hall, C.hall);

  // dancer: body (hips/legs/torso), head+ชฎา, two-segment arms
  const SH_R = [.0048, .0185], SH_L = [-.0048, .0185], NECK = [0, .0212], UP = .0085, FO = .0075;
  const body = S.add(sheet({ U, w: .04, h: .06, x: HIP0[0], y: HIP0[1], z: -.054, trans: .02, ppm: 14000,
    draw: x => { x.fillStyle = PAPER; x.strokeStyle = PAPER; x.lineCap = 'round'; x.lineJoin = 'round';
      x.lineWidth = .0052; x.beginPath(); x.moveTo(-.003, 0); x.lineTo(-.0095, -.0095); x.lineTo(-.0072, -.0205); x.stroke();      // left leg, knee out
      x.beginPath(); x.moveTo(-.0072, -.0205); x.lineTo(-.0122, -.0218); x.lineWidth = .0032; x.stroke();                          // foot turned out
      x.lineWidth = .0052; x.beginPath(); x.moveTo(.003, 0); x.lineTo(.0092, -.0088); x.lineTo(.0128, -.0155); x.stroke();          // right leg lifted behind
      x.lineWidth = .0032; x.beginPath(); x.moveTo(.0128, -.0155); x.lineTo(.0145, -.0128); x.stroke();                             // flexed foot
      poly(x, [[-.0058, .002], [.0058, .002], [.0092, -.0062], [.003, -.0078], [-.003, -.0078], [-.0092, -.0062]]);                                              // hip wrap
      poly(x, [[-.0022, -.002], [.0022, -.002], [.0014, -.0145], [-.0014, -.0145]]);                                                // front panel
      poly(x, [[-.0052, 0], [.0052, 0], [.0044, .007], [.0058, .0188], [-.0058, .0188], [-.0044, .007]]);                       // torso
      [[1], [-1]].forEach(([s]) => { x.beginPath(); x.moveTo(s * .0034, .0175); x.quadraticCurveTo(s * .0062, .0178, s * .0078, .0232); x.lineTo(s * .0058, .0192); x.closePath(); x.fill(); }); // อินทรธนู
      x.fillRect(-.0011, .018, .0022, .0035); } }));
  tint(body, C.dancer);
  const head = S.add(sheet({ U, w: .03, h: .04, z: -.0538, trans: .02, ppm: 16000,
    draw: x => { x.fillStyle = PAPER; x.beginPath(); x.ellipse(0, .0034, .0034, .0039, 0, 0, TAU); x.fill();
      for (let i = 0; i < 6; i++) { const t0 = i / 6, t1 = (i + 1) / 6, w0 = .0078 * (1 - t0 * .85), w1 = .0078 * (1 - t1 * .85), y0 = .0052 + t0 * .013, y1 = .0052 + t1 * .013;
        poly(x, [[-w0 / 2, y0], [w0 / 2, y0], [w1 / 2 * .86, y1 + .0004], [-w1 / 2 * .86, y1 + .0004]]); }                       // tiered ชฎา
      x.fillRect(-.0003, .018, .0006, .0035);
      [[1], [-1]].forEach(([s]) => { x.beginPath(); x.moveTo(s * .0024, .0045); x.quadraticCurveTo(s * .0062, .0055, s * .0066, .0095); x.lineTo(s * .003, .006); x.closePath(); x.fill(); }); } })); // กรรเจียก
  tint(head, C.dancer);
  const seg2 = (len, w, hand) => S.add(sheet({ U, w: .03, h: .03, z: -.0536, trans: .02, ppm: 16000,
    draw: x => { x.strokeStyle = PAPER; x.fillStyle = PAPER; x.lineCap = 'round'; x.lineWidth = w; x.beginPath(); x.moveTo(0, 0); x.lineTo(len, 0); x.stroke();
      if (hand) { x.beginPath(); x.ellipse(len + .0014, 0, .0021, .0015, 0, 0, TAU); x.fill(); x.lineWidth = .0009;              // flexed fingers bent back
        for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(len + .002, -.0006 + i * .0004); x.quadraticCurveTo(len + .0042, .0002 + i * .0005, len + .0046, .0022 + i * .0007); x.stroke(); } } } }));
  const arm = { rU: seg2(UP, .003), rF: seg2(FO, .0025, true), lU: seg2(UP, .003), lF: seg2(FO, .0025, true) };
  Object.values(arm).forEach(m => tint(m, C.dancer));

  // stage platform with a pierced band, and seven oil lamps
  const stg = S.add(sheet({ U, w: .15, h: .03, x: DX - .005, y: FL - .009, z: -.05, trans: .1, ppm: 9000,
    draw: x => { x.fillStyle = PAPER; x.fillRect(-.064, -.009, .128, .018); cut(x, () => { for (let i = 0; i < 15; i++) { const px = -.056 + i * .008; x.beginPath(); x.moveTo(px, .002); x.lineTo(px + .002, -.001); x.lineTo(px, -.004); x.lineTo(px - .002, -.001); x.closePath(); x.fill(); } }); } }));
  tint(stg, C.stage);
  const lamps = [];
  for (let i = 0; i < 7; i++) { const lx = DX - .052 + i * .0158;
    const m = S.add(sheet({ U, w: .012, h: .012, x: lx, y: FL + .0028, z: -.0495, trans: .05, glow: 3.4, glowCol: '#ffcf80', ppm: 22000, finish: { rim: .2, under: .2 },
      draw: x => { x.fillStyle = PAPER; poly(x, [[-.003, -.0006], [.003, -.0006], [.0018, -.0026], [-.0018, -.0026]]); x.fillRect(-.0008, -.0034, .0016, .0009);
        x.beginPath(); x.moveTo(0, .0042); x.quadraticCurveTo(.0017, .0006, 0, -.0006); x.quadraticCurveTo(-.0017, .0006, 0, .0042); x.fill(); },   // flame must exist as paper for its glow to show
      glowDraw: g => { g.fillStyle = '#000'; g.fillRect(-.006, -.006, .012, .012); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(0, .0042); g.quadraticCurveTo(.0017, .0006, 0, -.0006); g.quadraticCurveTo(-.0017, .0006, 0, .0042); g.fill(); } }));
    tint(m, C.stage); lamps.push(m); }

  // L4 front: dark band + hanging jasmine garlands (พวงมาลัย) cropped at the top edges
  const front = S.add(sheet({ U, w: .9, h: .5, z: -.006, trans: .05, ppm: 2800,
    draw: x => { x.fillStyle = PAPER; x.fillRect(-.45, -.25, .9, .2); x.fillRect(-.45, -.0505, .9, .0012);
      const garland = (gx, top, len) => { for (let k = 0; k < 3; k++) { const sx = gx + k * .011; x.fillRect(sx - .0004, top - len, .0008, len);
          for (let j = 0; j < len / .0042; j++) { x.beginPath(); x.arc(sx, top - j * .0042, .0016, 0, TAU); x.fill(); }
          poly(x, [[sx - .0018, top - len], [sx + .0018, top - len], [sx, top - len - .009]]); } };
      garland(-.19, .14, .05); garland(-.145, .14, .07); garland(.17, .14, .055); } }));
  tint(front, C.front);

  // title in cream paper, grows from the left
  const T1 = { x: -.058, y: -.0612, w: .15, h: .026, s: .0104 }, T2 = { x: -.058, y: -.0765, w: .15, h: .016, s: .0072 };
  const mkTitle = (o, str, wt) => { const m = S.add(sheet({ U, w: o.w, h: o.h, x: o.x, y: o.y, z: .001, trans: .12, ppm: 14000, finish: { rim: .25, under: .3 },
    draw: c => text(c, str, -o.w / 2 + .002, -o.s * .1, o.s, THAI, { fill: '#ffffff', weight: wt, align: 'left' }) })); tint(m, C.cream); return m; };
  const t1 = mkTitle(T1, 'ประวัติศาสตร์นาฏศิลป์ไทย', 600), t2 = mkTitle(T2, 'สมัยรัตนโกสินทร์', 400);

  // ===== animation =====
  const ramPhase = t => {           // A hold → move → B hold → move …, each part eased, never a sine loop
    if (t < 1.6) return 0; const u = (t - 1.6) % 3.6;
    if (u < .7) return 0; if (u < 1.8) return E.ram((u - .7) / 1.1); if (u < 2.5) return 1; return 1 - E.ram((u - 2.5) / 1.1);
  };
  const P = (k, p) => lerp(POSE_A[k], POSE_B[k], p);
  return {
    S,
    update(t) {
      lamps.forEach((m, i) => { const on = clamp((t - .35 - i * .12) / .12); m.material.userData.u.uGlowLit.value = on * (.88 + .12 * Math.sin(t * 23 + i * 2.1)); });
      const sOn = ss(seg(t, 1.0, 1.6)); scr.material.userData.u.uGlowLit.value = sOn; scr.material.color.copy(scrCol).multiplyScalar(lerp(.35, 1, sOn));
      scr.material.userData.u.uTrans.value = lerp(.25, .92, sOn); U.uLit.value = lerp(.35, 1, ss(seg(t, .9, 1.7)));
      const pu = ramPhase(t), pf = ramPhase(t - .12), ph = ramPhase(t - .2);            // overlap: forearm and head follow
      const hip = [HIP0[0], HIP0[1] + P('bob', pu)];
      body.position.set(hip[0], hip[1], -.054);
      head.position.set(hip[0] + NECK[0], hip[1] + NECK[1], -.0538); head.rotation.z = P('head', ph);
      const chain = (sh, U0, F0, kU, kF) => { const a = P(kU, pu), b = P(kF, pf);
        U0.position.set(hip[0] + sh[0], hip[1] + sh[1], U0.position.z); U0.rotation.z = a;
        F0.position.set(hip[0] + sh[0] + Math.cos(a) * UP, hip[1] + sh[1] + Math.sin(a) * UP, F0.position.z); F0.rotation.z = b; };
      chain(SH_R, arm.rU, arm.rF, 'rU', 'rF'); chain(SH_L, arm.lU, arm.lF, 'lU', 'lF');
      [[t1, T1, 2.7], [t2, T2, 3.15]].forEach(([m, o, t0]) => { const g = E.enter(seg(t, t0, t0 + .8)), x0 = o.x - o.w / 2;
        m.material.userData.u.uClip.value.set(x0 - 1, o.y, 1 + g * (o.w + .002), 0); });
      const k = ss(seg(t, 0, DUR));
      aim(S.cam, [lerp(-.01, .008, k), lerp(.006, .002, k), lerp(.45, .385, k), lerp(-.004, .01, k), .0, -.08], t);
    },
    post() { return { focus: S.cam.position.z + .054, aper: 7, maxCoc: 11, bloom: { strength: .42, radius: .55, threshold: 1.05 } }; },
    grade(t) { return { expo: 1.02, vig: .4, sat: .96, contrast: .1, lift: [.008, .004, 0], gain: [1.03, 1, .95], fade: ss(seg(t, 0, .35)) }; },
  };
}
export const texts = () => [];

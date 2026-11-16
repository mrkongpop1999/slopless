// "Still Here": one shot. Page contract: READY, DUR, render(t), TEXTS(t).
import * as THREE from 'three';
import { Pipe } from './post.js';
import { shot, DUR, texts } from './shot.js';

const Q = new URLSearchParams(location.search), SSAA = +(Q.get('ssaa') || 2);
await Promise.all([document.fonts.load('600 40px "Trirong"', 'ประวัติศาสตร์นาฏศิลป์ไทย'), document.fonts.load('400 40px "Trirong"', 'สมัยรัตนโกสินทร์')]);
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
renderer.setPixelRatio(SSAA); renderer.setSize(1920, 1080, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const pipe = new Pipe(renderer, 1920, 1080, SSAA);
const s = shot();
window.DUR = DUR;
window.render = t => { s.update(t); pipe.shot(s.S.scene, s.S.cam, s.post(), pipe.rtA); pipe.final({ ...s.grade(t), mixB: 0 }); };
window.TEXTS = texts;
window.READY = true;

import * as THREE from 'three';
import { cssColor } from './theme.js';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function initCharacter(canvas, { reducedMotion = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 0.8, 0.1, 60);
  camera.position.set(0, 1.85, 11.5);
  camera.lookAt(0, 1.75, 0);

  const C = {
    skin: cssColor('--skin', '#7d4e34'),
    shirt: cssColor('--cream', '#f6efdf'),
    pants: cssColor('--navy-700', '#13285a'),
    cap: cssColor('--navy-950', '#050d20'),
    coral: cssColor('--coral', '#ff6b57'),
    outline: cssColor('--navy-950', '#050d20'),
    eye: cssColor('--paper', '#fffaf0'),
  };

  const root = new THREE.Group();
  scene.add(root);

  const disc = new THREE.Mesh(new THREE.CircleGeometry(2.1, 56), new THREE.MeshBasicMaterial({ color: C.coral }));
  disc.position.set(0, 1.75, -1.6);
  scene.add(disc);

  const body = new THREE.Group();
  root.add(body);

  function part(geometry, color, { outline = 0.06, parent = body } = {}) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color })));
    if (outline) {
      const o = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: C.outline, side: THREE.BackSide }));
      o.scale.setScalar(1 + outline);
      g.add(o);
    }
    parent.add(g);
    return g;
  }

  [-0.3, 0.3].forEach((x) => {
    const leg = part(new THREE.CylinderGeometry(0.25, 0.23, 1.05, 20), C.pants);
    leg.position.set(x, 0.66, 0);
    const shoe = part(new THREE.SphereGeometry(0.31, 20, 14), C.shirt);
    shoe.scale.set(1, 0.55, 1.4);
    shoe.position.set(x, 0.15, 0.13);
  });

  const torso = part(new THREE.CylinderGeometry(0.64, 0.54, 1.3, 28), C.shirt);
  torso.position.y = 1.7;

  [1.98, 1.7, 1.42].forEach((y) => {
    const b = part(new THREE.SphereGeometry(0.045, 10, 8), C.pants, { outline: 0 });
    b.position.set(0, y, 0.6);
  });

  const collar = part(new THREE.TorusGeometry(0.22, 0.07, 10, 28), C.shirt);
  collar.position.set(0, 2.36, 0.02);
  collar.rotation.x = Math.PI / 2;

  const neck = part(new THREE.CylinderGeometry(0.17, 0.19, 0.32, 16), C.skin);
  neck.position.y = 2.4;

  const head = new THREE.Group();
  head.position.y = 3.02;
  body.add(head);

  const skull = part(new THREE.SphereGeometry(0.64, 32, 24), C.skin, { parent: head });
  skull.scale.set(1, 1.07, 1);

  const cap = part(new THREE.SphereGeometry(0.69, 32, 18, 0, Math.PI * 2, 0, 1.2), C.cap, { parent: head, outline: 0.04 });
  cap.rotation.x = -0.14;

  const logo = part(new THREE.BoxGeometry(0.24, 0.2, 0.03), C.shirt, { parent: head, outline: 0 });
  logo.position.set(0, 0.5, 0.5);
  logo.rotation.x = -0.9;

  [-1, 1].forEach((s) => {
    const ear = part(new THREE.SphereGeometry(0.13, 14, 12), C.skin, { parent: head });
    ear.position.set(0.63 * s, -0.04, 0);
  });

  const eyes = [];
  [-1, 1].forEach((s) => {
    const white = part(new THREE.SphereGeometry(0.12, 18, 14), C.eye, { parent: head, outline: 0.1 });
    white.position.set(0.23 * s, 0.03, 0.55);
    white.scale.z = 0.6;
    const pupil = part(new THREE.SphereGeometry(0.065, 14, 12), C.cap, { parent: head, outline: 0 });
    pupil.position.set(0.23 * s, 0.03, 0.62);
    pupil.scale.z = 0.5;
    const brow = part(new THREE.BoxGeometry(0.22, 0.045, 0.04), C.cap, { parent: head, outline: 0 });
    brow.position.set(0.23 * s, 0.21, 0.58);
    brow.rotation.z = -0.14 * s;
    eyes.push(white, pupil);
  });

  const nose = part(new THREE.SphereGeometry(0.075, 12, 10), C.skin, { parent: head, outline: 0.12 });
  nose.position.set(0, -0.1, 0.63);

  const mouth = part(new THREE.TorusGeometry(0.16, 0.032, 8, 22, Math.PI), C.cap, { parent: head, outline: 0 });
  mouth.position.set(0, -0.2, 0.58);
  mouth.rotation.z = Math.PI;

  const armL = new THREE.Group();
  const armR = new THREE.Group();
  armL.position.set(-0.8, 2.2, 0);
  armR.position.set(0.8, 2.2, 0);
  body.add(armL, armR);

  [armL, armR].forEach((pivot) => {
    const sleeve = part(new THREE.CylinderGeometry(0.19, 0.17, 0.9, 18), C.shirt, { parent: pivot });
    sleeve.position.y = -0.45;
    const cuff = part(new THREE.TorusGeometry(0.17, 0.05, 8, 20), C.coral, { parent: pivot, outline: 0.1 });
    cuff.position.y = -0.88;
    cuff.rotation.x = Math.PI / 2;
    const hand = part(new THREE.SphereGeometry(0.21, 18, 14), C.skin, { parent: pivot });
    hand.position.y = -1.04;
  });

  const state = {
    appear: 0,
    appearTarget: 0,
    waveUntil: 0,
    talkUntil: 0,
    jumpStart: -10,
    point: null,
    lookX: 0,
    lookY: 0,
    armL: -0.12,
    armR: 0.12,
    headX: 0,
    headY: 0,
    blinkAt: 2.5,
  };

  function resize() {
    const w = canvas.clientWidth || 150;
    const h = canvas.clientHeight || 186;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  resize();

  let last = performance.now();
  let t = 0;

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;

    state.appear += (state.appearTarget - state.appear) * (1 - Math.exp(-dt * 5));
    if (state.appear < 0.003 && state.appearTarget === 0) return;

    const k = (rate) => 1 - Math.exp(-dt * rate);
    const motion = reducedMotion ? 0 : 1;

    root.position.y = -4.6 * (1 - state.appear);

    const jt = (now - state.jumpStart) / 600;
    let jump = 0;
    let squash = 1;
    if (jt >= 0 && jt <= 1) {
      jump = Math.sin(jt * Math.PI) * 0.7;
      squash = 1 + Math.sin(jt * Math.PI) * 0.05;
    }
    body.position.y = jump + Math.sin(t * 2.2) * 0.04 * motion;
    body.scale.set(1 / squash, squash, 1);
    body.rotation.y = Math.sin(t * 0.8) * 0.06 * motion;

    state.headY += (state.lookX * 0.45 - state.headY) * k(6);
    state.headX += (-state.lookY * 0.25 - state.headX) * k(6);
    head.rotation.y = state.headY;
    head.rotation.x = state.headX;

    if (t > state.blinkAt) {
      const p = (t - state.blinkAt) / 0.14;
      const s = p < 1 ? 1 - Math.sin(p * Math.PI) * 0.9 : 1;
      eyes.forEach((e) => { e.scale.y = s; });
      if (p >= 1) state.blinkAt = t + 2.4 + Math.random() * 2.6;
    }

    const talking = now < state.talkUntil;
    mouth.scale.y = talking ? 0.4 + Math.abs(Math.sin(t * 13)) * 1.4 : 1;
    mouth.scale.x = talking ? 0.8 : 1;

    const waving = now < state.waveUntil;
    const ps = state.point === null ? 0 : Math.sign(state.point);
    const waveSign = ps > 0 ? -1 : 1;
    const wiggle = Math.sin(t * 9) * 0.28 * motion;
    [[-1, armL, 'armL'], [1, armR, 'armR']].forEach(([sign, arm, key]) => {
      let target = 0.12 * sign;
      let rate = 6;
      if (ps === sign) {
        target = state.point;
        rate = 7;
      } else if (waving && sign === waveSign) {
        target = sign * (2.45 + wiggle);
        rate = 10;
      }
      state[key] += (target - state[key]) * k(rate);
      arm.rotation.z = state[key];
    });

    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  return {
    show() { state.appearTarget = 1; },
    hide() { state.appearTarget = 0; },
    wave(ms = 2800) { state.waveUntil = performance.now() + ms; },
    talk(ms = 2000) { state.talkUntil = performance.now() + ms; },
    jump() { state.jumpStart = performance.now(); },
    point(angle) {
      if (angle === null) { state.point = null; return; }
      const sign = angle < 0 ? -1 : 1;
      state.point = sign * clamp(Math.abs(angle), 0.25, Math.PI - 0.05);
    },
    look(x, y) { state.lookX = clamp(x, -1, 1); state.lookY = clamp(y, -1, 1); },
  };
}

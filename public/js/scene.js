import * as THREE from 'three';

/**
 * Monde 3D du portfolio.
 * Le visiteur "vole" à travers 5 niveaux (un par section) et franchit des portes corail
 * entre chaque niveau. Palette : marine (fond), crème (objets), corail (accents ~10 %).
 */

// Les couleurs viennent des variables CSS (public/css/style.css, bloc :root) : une seule source de vérité.
const css = getComputedStyle(document.documentElement);
const fromCss = (name, fallback) => {
  try { return new THREE.Color(css.getPropertyValue(name).trim() || fallback); } catch (e) { return new THREE.Color(fallback); }
};
const C = {
  navy: fromCss('--navy-900', '#07122a'),
  blue: fromCss('--navy-600', '#1b3a7a'),
  blueLight: fromCss('--blue-light', '#3b64b8'),
  sky: fromCss('--sky', '#8fa6d9'),
  cream: fromCss('--cream', '#f6efdf'),
  coral: fromCss('--coral', '#ff6b57'),
};
const GAP = 30; // distance (en unités 3D) entre deux niveaux
const LEVELS = 5;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rand = (a, b) => a + Math.random() * (b - a);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

export function initScene(canvas, { reducedMotion = false, isMobile = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, powerPreference: 'high-performance' });
  let pixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(C.navy, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(C.navy, isMobile ? 0.034 : 0.026);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 300);

  /* ---------- Lumières ---------- */
  scene.add(new THREE.AmbientLight(C.sky, 0.9));
  const key = new THREE.DirectionalLight(C.cream, 1.6);
  key.position.set(4, 6, 8);
  scene.add(key);
  const rim = new THREE.PointLight(C.coral, 55, 50, 2);
  scene.add(rim);

  /* ---------- Matériaux ---------- */
  const matCream = new THREE.MeshStandardMaterial({ color: C.cream, roughness: 0.38, metalness: 0.12, flatShading: true });
  const matBlue = new THREE.MeshStandardMaterial({ color: C.blue, roughness: 0.45, metalness: 0.35, flatShading: true });
  const matCoral = new THREE.MeshStandardMaterial({ color: C.coral, roughness: 0.4, metalness: 0.1, flatShading: true, emissive: C.coral, emissiveIntensity: 0.35 });
  const wireCream = new THREE.MeshBasicMaterial({ color: C.cream, wireframe: true, transparent: true, opacity: 0.3 });
  const wireCoral = new THREE.MeshBasicMaterial({ color: C.coral, wireframe: true, transparent: true, opacity: 0.55 });

  /* ---------- Un "décor" par niveau ---------- */
  const props = [];

  // Niveau 1 — noyau cristallin
  {
    const g = new THREE.Group();
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(2.1, 1), matBlue);
    const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(2.55, 1), wireCream);
    const orbitG = new THREE.Group();
    const sat = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0), matCoral);
    sat.position.set(3.5, 0, 0);
    orbitG.add(sat);
    g.add(core, wire, orbitG);
    props.push({ group: g, update: (t, dt, s) => { core.rotation.y += dt * 0.25 * s; core.rotation.x += dt * 0.1 * s; wire.rotation.y -= dt * 0.12 * s; orbitG.rotation.y += dt * 0.7 * s; orbitG.rotation.z = 0.5; } });
  }

  // Niveau 2 — nœud torique
  {
    const g = new THREE.Group();
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.5, 0.42, 160, 18), matCream);
    const wire = new THREE.Mesh(new THREE.TorusKnotGeometry(1.5, 0.52, 90, 10), wireCream);
    g.add(knot, wire);
    props.push({ group: g, update: (t, dt, s) => { g.rotation.y += dt * 0.3 * s; g.rotation.x += dt * 0.18 * s; } });
  }

  // Niveau 3 — grille de cubes (arbre de compétences)
  {
    const g = new THREE.Group();
    const geo = new THREE.BoxGeometry(0.62, 0.62, 0.62);
    const cubes = [];
    const N = 4;
    for (let x = 0; x < N; x++) {
      for (let y = 0; y < N; y++) {
        const isCoral = x === 2 && y === 1;
        const m = new THREE.Mesh(geo, isCoral ? matCoral : (x + y) % 2 ? matCream : matBlue);
        m.position.set((x - (N - 1) / 2) * 0.95, (y - (N - 1) / 2) * 0.95, 0);
        g.add(m);
        cubes.push({ m, x, y });
      }
    }
    g.rotation.set(0.35, -0.5, 0);
    props.push({ group: g, update: (t, dt, s) => { g.rotation.y = -0.5 + Math.sin(t * 0.3 * s) * 0.4; cubes.forEach(({ m, x, y }) => { const k = 0.62 + 0.38 * Math.sin(t * 1.5 * s + (x + y) * 0.8); m.scale.setScalar(k); m.rotation.z += dt * 0.4 * s; }); } });
  }

  // Niveau 4 — écrans en orbite (projets)
  {
    const g = new THREE.Group();
    const screens = new THREE.Group();
    const geo = new THREE.BoxGeometry(2.1, 1.3, 0.08);
    const edgeGeo = new THREE.EdgesGeometry(geo);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const s = new THREE.Group();
      s.add(new THREE.Mesh(geo, matBlue));
      s.add(new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: i === 0 ? C.coral : C.cream })));
      s.position.set(Math.cos(a) * 2.8, Math.sin(a * 2) * 0.35, Math.sin(a) * 2.8);
      s.rotation.y = -a + Math.PI / 2;
      screens.add(s);
    }
    g.add(screens);
    g.rotation.x = 0.28;
    props.push({ group: g, update: (t, dt, s) => { screens.rotation.y += dt * 0.35 * s; } });
  }

  // Niveau 5 — balise
  {
    const g = new THREE.Group();
    const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 0), matCoral);
    const wire = new THREE.Mesh(new THREE.OctahedronGeometry(2.2, 0), wireCream);
    const wire2 = new THREE.Mesh(new THREE.OctahedronGeometry(3, 1), wireCoral);
    g.add(beacon, wire, wire2);
    props.push({ group: g, update: (t, dt, s) => { beacon.rotation.y += dt * 0.6 * s; wire.rotation.y -= dt * 0.25 * s; wire2.rotation.y += dt * 0.1 * s; const k = 1 + Math.sin(t * 2 * s) * 0.05; beacon.scale.setScalar(k); } });
  }

  props.forEach((p) => scene.add(p.group));

  /* ---------- Portes de passage (entre les niveaux) ---------- */
  const gates = [];
  for (let i = 0; i < LEVELS - 1; i++) {
    const g = new THREE.Group();
    const outer = new THREE.Mesh(new THREE.TorusGeometry(5.6, 0.07, 10, 90), new THREE.MeshBasicMaterial({ color: C.coral, transparent: true, opacity: 0.4 }));
    const inner = new THREE.Mesh(new THREE.TorusGeometry(4.7, 0.03, 8, 90), new THREE.MeshBasicMaterial({ color: C.cream, transparent: true, opacity: 0.3 }));
    g.add(outer, inner);
    g.position.z = 6 - (i + 0.5) * GAP;
    scene.add(g);
    gates.push({ g, outer, inner, at: i + 0.5 });
  }

  /* ---------- Éclats flottants ---------- */
  const SHARDS = isMobile ? 150 : 340;
  const shardGeo = new THREE.OctahedronGeometry(0.2, 0);
  const shardMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.2, flatShading: true });
  const shards = new THREE.InstancedMesh(shardGeo, shardMat, SHARDS);
  shards.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const shardData = [];
  const col = new THREE.Color();
  for (let i = 0; i < SHARDS; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = rand(6.5, 24);
    const r1 = Math.random();
    col.set(r1 < 0.1 ? C.coral : r1 < 0.55 ? C.cream : C.blueLight);
    shards.setColorAt(i, col);
    shardData.push({
      x: Math.cos(a) * r, y: Math.sin(a) * r * 0.65, z: rand(14, -(GAP * (LEVELS - 1) + 40)),
      s: rand(0.5, 2.1), rx: rand(-1, 1), ry: rand(-1, 1), ph: Math.random() * 6.28,
    });
  }
  shards.instanceColor.needsUpdate = true;
  scene.add(shards);
  const dummy = new THREE.Object3D();

  /* ---------- Étoiles ---------- */
  const STARS = isMobile ? 700 : 1500;
  const starPos = new Float32Array(STARS * 3);
  for (let i = 0; i < STARS; i++) {
    starPos[i * 3] = rand(-45, 45);
    starPos[i * 3 + 1] = rand(-30, 30);
    starPos[i * 3 + 2] = rand(25, -(GAP * (LEVELS - 1) + 70));
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: C.cream, size: isMobile ? 0.09 : 0.065, transparent: true, opacity: 0.85, sizeAttenuation: true, depthWrite: false }));
  scene.add(stars);

  /* ---------- Disposition (selon écran portrait / paysage) ---------- */
  function layout() {
    const portrait = camera.aspect < 0.9;
    props.forEach((p, i) => {
      const z = -i * GAP - 4;
      if (portrait) {
        p.group.position.set(0, 3.1, z);
        p.group.scale.setScalar(0.5);
      } else {
        const side = [1, -1, 1, -1, 0][i];
        p.group.position.set(side * 5.1, i === 4 ? 0.4 : 0.3, z);
        p.group.scale.setScalar(i === 4 ? 1.05 : 1);
      }
    });
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    layout();
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  /* ---------- Entrées ---------- */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!reducedMotion) {
    window.addEventListener('pointermove', (e) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = -(e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  let sec = 0; // position lissée (0 → 4)
  let secTarget = 0;
  let introStart = null;
  const INTRO_DIST = 18;
  const INTRO_MS = 2600;
  const spin = reducedMotion ? 0.15 : 1;

  /* ---------- Boucle de rendu ---------- */
  let last = performance.now();
  let t = 0;
  let frames = 0;
  let acc = 0;
  let adapted = false;

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;

    // Qualité adaptative : si la machine peine, on allège automatiquement
    if (!adapted && ++frames > 20) {
      acc += dt;
      if (frames === 100) {
        adapted = true;
        if (acc / 80 > 0.026) {
          if (pixelRatio > 1) { pixelRatio = 1; renderer.setPixelRatio(1); renderer.setSize(window.innerWidth, window.innerHeight, false); }
          shards.count = Math.ceil(SHARDS * 0.5);
        }
      }
    }

    sec += (secTarget - sec) * (1 - Math.exp(-dt * 4));
    mouse.x += (mouse.tx - mouse.x) * (1 - Math.exp(-dt * 3));
    mouse.y += (mouse.ty - mouse.y) * (1 - Math.exp(-dt * 3));

    // Intro : le monde se révèle quand on appuie sur "jouer"
    let intro = INTRO_DIST;
    if (introStart !== null) intro = INTRO_DIST * (1 - easeOut(clamp((now - introStart) / INTRO_MS, 0, 1)));

    const camZ = 6 - sec * GAP + intro;
    const px = Math.sin(sec * 1.15) * 1.1 + mouse.x * 0.7;
    const py = Math.cos(sec * 0.9) * 0.5 + mouse.y * 0.45;
    camera.position.set(px, py, camZ);
    camera.lookAt(px * 0.4, py * 0.4, camZ - 12);
    const lag = secTarget - sec;
    camera.rotateZ(-lag * 0.035 - mouse.x * 0.012);

    // Sensation de vitesse : le champ de vision s'élargit pendant le défilement
    const fovT = 60 + (reducedMotion ? 0 : Math.min(Math.abs(lag) * 12, 14));
    camera.fov += (fovT - camera.fov) * (1 - Math.exp(-dt * 6));
    camera.updateProjectionMatrix();

    rim.position.set(px + 3, py + 2, camZ - 5);

    props.forEach((p) => p.update(t, dt, spin));

    gates.forEach((gt, i) => {
      const near = 1 - clamp(Math.abs(sec - gt.at) / 0.9, 0, 1);
      gt.outer.material.opacity = 0.28 + near * 0.72;
      gt.inner.material.opacity = 0.18 + near * 0.5;
      const k = 1 + Math.sin(t * 2 + i) * 0.015 + near * 0.05;
      gt.g.scale.setScalar(k);
      gt.g.rotation.z += dt * 0.15 * spin * (i % 2 ? -1 : 1);
    });

    for (let i = 0; i < shards.count; i++) {
      const d = shardData[i];
      dummy.position.set(d.x, d.y + Math.sin(t * 0.6 + d.ph) * 0.35 * spin, d.z);
      dummy.rotation.set(t * d.rx * 0.6 * spin + d.ph, t * d.ry * 0.6 * spin, 0);
      dummy.scale.setScalar(d.s);
      dummy.updateMatrix();
      shards.setMatrixAt(i, dummy.matrix);
    }
    shards.instanceMatrix.needsUpdate = true;

    stars.rotation.z = t * 0.004 * spin;

    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  return {
    start() { introStart = performance.now(); },
    setSection(v) { secTarget = clamp(v, 0, LEVELS - 1); },
  };
}

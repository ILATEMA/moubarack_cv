import { GUIDE_STEPS } from './data.js';

const $ = (s) => document.querySelector(s);
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { return; } },
};

export function initGuide({ tr, character, reducedMotion }) {
  const root = $('#guide');
  const avatar = $('#guideAvatar');
  const bubble = $('#bubble');
  const tag = $('#bubbleTag');
  const text = $('#bubbleText');
  const ring = $('#ring');
  const offBtn = $('#bubbleOff');
  const replayBtn = $('#guideBtn');

  let muted = store.get('guideMuted') === '1';
  let current = 0;
  let typeTimer = 0;
  let hideTimer = 0;
  let settleTimer = 0;
  let ringTarget = null;
  let ringLoop = 0;
  let visible = false;

  const pad = (n) => String(n).padStart(2, '0');

  function pickTarget(selector) {
    const list = [...document.querySelectorAll(selector)];
    const bottomLimit = window.innerWidth <= 860 ? 96 : 20;
    return list.find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > 70 && r.top < window.innerHeight - bottomLimit && r.right > 0 && r.left < window.innerWidth;
    }) || null;
  }

  function trackRing() {
    cancelAnimationFrame(ringLoop);
    if (!ringTarget) return;
    const r = ringTarget.getBoundingClientRect();
    const pad2 = 6;
    ring.style.left = `${r.left - pad2}px`;
    ring.style.top = `${r.top - pad2}px`;
    ring.style.width = `${r.width + pad2 * 2}px`;
    ring.style.height = `${r.height + pad2 * 2}px`;
    const cr = avatar.getBoundingClientRect();
    const tx = r.left + r.width / 2;
    const ty = r.top + r.height / 2;
    const ox = cr.left + cr.width * (tx < cr.left + cr.width / 2 ? 0.34 : 0.66);
    const oy = cr.top + cr.height * 0.4;
    character.point(Math.atan2(tx - ox, ty - oy));
    ringLoop = requestAnimationFrame(trackRing);
  }

  function clearRing() {
    ringTarget = null;
    cancelAnimationFrame(ringLoop);
    ring.classList.remove('on');
    character.point(null);
  }

  function hide() {
    clearTimeout(hideTimer);
    clearInterval(typeTimer);
    bubble.classList.remove('show');
    visible = false;
    clearRing();
  }

  function say(idx, { welcome = false } = {}) {
    const step = GUIDE_STEPS[idx];
    if (!step) return;
    current = idx;
    clearTimeout(hideTimer);
    clearInterval(typeTimer);

    const message = tr(step.key);
    tag.textContent = `${tr('guide.level')} ${pad(idx + 1)}`;
    bubble.classList.add('show');
    visible = true;

    if (reducedMotion) {
      text.textContent = message;
    } else {
      text.textContent = '';
      let i = 0;
      typeTimer = setInterval(() => {
        i += 2;
        text.textContent = message.slice(0, i);
        if (i >= message.length) clearInterval(typeTimer);
      }, 22);
    }

    character.talk(Math.min(message.length * 22 / 2 + 300, 4200));
    if (welcome) character.wave(3200);
    else character.jump();

    ringTarget = pickTarget(step.target);
    if (ringTarget) {
      ring.classList.add('on');
      trackRing();
    } else {
      clearRing();
    }

    hideTimer = setTimeout(hide, welcome ? 14000 : 10000);
  }

  function welcome() {
    if (muted) return;
    say(0, { welcome: true });
  }

  function onSection(idx) {
    current = idx;
    clearTimeout(settleTimer);
    if (muted) return;
    settleTimer = setTimeout(() => say(idx), 650);
  }

  function replay() {
    muted = false;
    store.set('guideMuted', '0');
    say(current);
  }

  function refresh() {
    if (visible) say(current);
  }

  offBtn.addEventListener('click', () => {
    muted = true;
    store.set('guideMuted', '1');
    hide();
  });
  replayBtn.addEventListener('click', replay);

  window.addEventListener('pointermove', (e) => {
    const r = avatar.getBoundingClientRect();
    character.look((e.clientX - (r.left + r.width / 2)) / 420, (e.clientY - (r.top + r.height * 0.3)) / 420);
  }, { passive: true });

  window.addEventListener('resize', () => { if (ringTarget) trackRing(); }, { passive: true });

  return {
    open() {
      root.hidden = false;
      character.show();
    },
    welcome,
    onSection,
    refresh,
    hide,
  };
}

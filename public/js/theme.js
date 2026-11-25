import * as THREE from 'three';

const css = getComputedStyle(document.documentElement);

export function cssColor(name, fallback) {
  try {
    return new THREE.Color(css.getPropertyValue(name).trim() || fallback);
  } catch (e) {
    return new THREE.Color(fallback);
  }
}

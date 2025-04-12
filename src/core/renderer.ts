import * as THREE from 'three';

export function createRenderer(container: HTMLElement | null): THREE.WebGLRenderer {
  if (!container) {
    throw new Error('Container element not found');
  }
  
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true
  });
  
  // Enable WebXR
  renderer.xr.enabled = true;
  
  // Set size
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  // Add canvas to container
  container.appendChild(renderer.domElement);
  
  return renderer;
}

import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

export function setupVRButton(renderer: THREE.WebGLRenderer): HTMLElement {
  console.log('Setting up VR button');
  
  // Configure XR session
  renderer.xr.enabled = true;
  
  // Create VR button with custom session initialization
  const button = VRButton.createButton(renderer, {
    requiredFeatures: ['local-floor', 'hit-test'],
    optionalFeatures: ['hand-tracking']
  });
  
  document.body.appendChild(button);
  
  console.log('VR button added to document');
  
  return button;
}

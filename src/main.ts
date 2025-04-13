import './style.css';
import * as THREE from 'three';
import { createRenderer } from './core/renderer';
import { createScene } from './core/scene';
import { createCamera } from './core/camera';
import { setupVRButton } from './xr/vr-button';
import { PinchInteractionManager } from './components/pinch-interaction/pinch-interaction-manager';
import { PinchableObject } from './components/pinch-interaction/pinchable-object';

// Get the container element
const container = document.getElementById('scene-container');
if (!container) {
  throw new Error('Container element not found');
}

// Create the renderer, scene, and camera
const renderer = createRenderer(container);
const scene = createScene();
const camera = createCamera();

// Position the camera properly
camera.position.set(0, 1.6, 0);

// Add the VR button to enter VR mode
setupVRButton(renderer);

// Create the pinch interaction manager
const pinchManager = new PinchInteractionManager(scene, camera, renderer);


// Create pinchable objects
function createPinchableBox(width: number, height: number, depth: number, position: THREE.Vector3): PinchableObject {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({ 
    color: 0x4287f5,
    roughness: 0.5,
    metalness: 0.2
  });
  
  const box = new PinchableObject(geometry, material);
  box.position.copy(position);
  
  pinchManager.addPinchableObject(box);
  
  return box;
}

// Create several boxes at different positions
createPinchableBox(0.2, 0.2, 0.2, new THREE.Vector3(-0.5, 1.2, -1));
createPinchableBox(0.2, 0.2, 0.2, new THREE.Vector3(0, 1.2, -1));
createPinchableBox(0.2, 0.2, 0.2, new THREE.Vector3(0.5, 1.2, -1));

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Clock for delta time calculation
const clock = new THREE.Clock();

// Animation loop
function animate() {
  const delta = clock.getDelta();
  
  // Update pinch interactions
  const rightHand = renderer.xr.getHand(1); // Assuming right hand is index 1
  pinchManager.update(rightHand, delta);
  
  // Render the scene
  renderer.render(scene, camera);
}

// Set up the animation loop
renderer.setAnimationLoop(animate);

// Handle window resize
window.addEventListener('resize', () => {
  // Update camera aspect ratio
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  
  // Update renderer size
  renderer.setSize(container.clientWidth, container.clientHeight);
});

// Log to confirm script is running
console.log('WebXR Pinch Interaction application initialized');

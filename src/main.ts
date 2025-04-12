import './style.css';
import * as THREE from 'three';
import { createRenderer } from './core/renderer';
import { createScene } from './core/scene';
import { createCamera } from './core/camera';
import { setupVRButton } from './xr/vr-button';
import { BallShooter } from './components/ball-shooter/ball-shooter';

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

// Create the ball shooter
const ballShooter = new BallShooter(scene, renderer);

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
  
  // Update ball shooter physics
  ballShooter.update(delta);
  
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
console.log('WebXR Ball Shooter application initialized');

import * as THREE from 'three';

export function setupControllers(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
  // Create controller models
  const controller1 = renderer.xr.getController(0);
  const controller2 = renderer.xr.getController(1);
  
  // Add event listeners for controller interactions
  controller1.addEventListener('selectstart', onSelectStart);
  controller1.addEventListener('selectend', onSelectEnd);
  controller2.addEventListener('selectstart', onSelectStart);
  controller2.addEventListener('selectend', onSelectEnd);
  
  // Add controllers to the scene
  scene.add(controller1);
  scene.add(controller2);
  
  // Create simple visual representations for controllers
  const controllerGeometry = new THREE.CylinderGeometry(0.01, 0.02, 0.08, 32);
  const controllerMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff
  });
  
  const controllerMesh1 = new THREE.Mesh(controllerGeometry, controllerMaterial);
  controllerMesh1.rotation.x = -Math.PI / 2;
  controller1.add(controllerMesh1);
  
  const controllerMesh2 = new THREE.Mesh(controllerGeometry, controllerMaterial);
  controllerMesh2.rotation.x = -Math.PI / 2;
  controller2.add(controllerMesh2);
  
  return { controller1, controller2 };
}

// Controller interaction handlers
function onSelectStart(event: any) {
  const controller = event.target;
  controller.userData.isSelecting = true;
  
  // Handle selection start
  console.log('Selection started');
}

function onSelectEnd(event: any) {
  const controller = event.target;
  controller.userData.isSelecting = false;
  
  // Handle selection end
  console.log('Selection ended');
}

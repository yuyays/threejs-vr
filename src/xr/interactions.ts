import * as THREE from 'three';

export function setupInteractions(
  controller1: THREE.XRTargetRaySpace,
  controller2: THREE.XRTargetRaySpace,
  scene: THREE.Scene
) {
  // Create a raycaster for interaction with objects
  const raycaster = new THREE.Raycaster();
  const tempMatrix = new THREE.Matrix4();
  
  // Interactive objects in the scene
  const interactiveObjects: THREE.Object3D[] = [];
  
  // Find all interactive objects in the scene
  function refreshInteractiveObjects() {
    interactiveObjects.length = 0;
    scene.traverse((object) => {
      if (object.userData.interactive) {
        interactiveObjects.push(object);
      }
    });
    console.log(`Found ${interactiveObjects.length} interactive objects`);
  }
  
  // Initial scan for interactive objects
  refreshInteractiveObjects();
  
  // Function to check for intersections
  function checkIntersections(controller: THREE.XRTargetRaySpace) {
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    
    return raycaster.intersectObjects(interactiveObjects);
  }
  
  // Update function to be called in animation loop
  function update() {
    // Check controller 1
    if (controller1.userData.isSelecting) {
      const intersections = checkIntersections(controller1);
      
      if (intersections.length > 0) {
        const object = intersections[0].object;
        // Handle interaction with object
        if (object.userData.onSelect) {
          object.userData.onSelect();
        }
      }
    }
    
    // Check controller 2
    if (controller2.userData.isSelecting) {
      const intersections = checkIntersections(controller2);
      
      if (intersections.length > 0) {
        const object = intersections[0].object;
        // Handle interaction with object
        if (object.userData.onSelect) {
          object.userData.onSelect();
        }
      }
    }
  }
  
  return { update, refreshInteractiveObjects };
}

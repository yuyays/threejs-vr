import * as THREE from 'three';

export function createFloatingPanel(
  width: number = 1,
  height: number = 0.5,
  content: string = 'Hello VR'
): THREE.Group {
  const group = new THREE.Group();
  
  // Create panel background
  const panelGeometry = new THREE.PlaneGeometry(width, height);
  const panelMaterial = new THREE.MeshBasicMaterial({
    color: 0x222222,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  });
  const panel = new THREE.Mesh(panelGeometry, panelMaterial);
  group.add(panel);
  
  // Create text
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (context) {
    canvas.width = 512;
    canvas.height = 256;
    
    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = '40px Arial';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(content, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    const textGeometry = new THREE.PlaneGeometry(width * 0.9, height * 0.9);
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.z = 0.01; // Slightly in front of the panel
    group.add(textMesh);
  }
  
  // Make the panel interactive
  panel.userData.interactive = true;
  panel.userData.onSelect = () => {
    console.log('Panel selected:', content);
    // Add your interaction logic here
  };
  
  return group;
}

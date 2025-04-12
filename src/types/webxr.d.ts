import * as THREE from 'three';

declare module 'three' {
  interface XRFrame {
    getHand(handedness: XRHandedness): XRHand | null;
  }

  interface XRHand extends THREE.Object3D {
    joints: {
      [jointName: string]: XRJoint;
    };
  }

  interface XRJoint extends THREE.Object3D {
    radius: number;
  }

  interface XRHandedness {
    left: 'left';
    right: 'right';
  }

  interface XRTargetRaySpace {
    hand?: XRHand;
  }
}

import * as THREE from 'three';
import { XRHandSpace } from 'three';

export class PinchDetector {
  private static PINCH_THRESHOLD = 0.02; // 2cm threshold

  static detectPinch(hand: XRHandSpace): boolean {
    const indexTip = hand.joints["index-finger-tip"];
    const thumbTip = hand.joints["thumb-tip"];

    if (!indexTip || !thumbTip) return false;

    const distance = indexTip.position.distanceTo(thumbTip.position);
    return distance < this.PINCH_THRESHOLD;
  }

  static getPinchMidpoint(hand: XRHandSpace): THREE.Vector3 | null {
    const indexTip = hand.joints["index-finger-tip"];
    const thumbTip = hand.joints["thumb-tip"];

    if (!indexTip || !thumbTip) return null;

    return new THREE.Vector3().addVectors(indexTip.position, thumbTip.position).multiplyScalar(0.5);
  }
}

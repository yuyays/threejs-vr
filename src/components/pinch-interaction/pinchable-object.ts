import * as THREE from 'three';

export class PinchableObject extends THREE.Mesh {
  private initialScale: THREE.Vector3;
  private isReturning: boolean = false;
  private returnProgress: number = 0;
  private returnDuration: number = 1.0; // seconds

  constructor(geometry: THREE.BufferGeometry, material: THREE.Material) {
    super(geometry, material);
    this.initialScale = this.scale.clone();
  }

  extend(direction: THREE.Vector3, factor: number): void {
    this.scale.x = this.initialScale.x * (direction.x !== 0 ? factor : 1.0);
    this.scale.y = this.initialScale.y * (direction.y !== 0 ? factor : 1.0);
    this.scale.z = this.initialScale.z * (direction.z !== 0 ? factor : 1.0);
  }

  startElasticReturn(): void {
    this.isReturning = true;
    this.returnProgress = 0;
  }

  updateElasticReturn(deltaTime: number): boolean {
    if (!this.isReturning) return false;

    this.returnProgress += deltaTime / this.returnDuration;

    if (this.returnProgress >= 1.0) {
      this.scale.copy(this.initialScale);
      this.isReturning = false;
      return true;
    }

    const t = this.returnProgress;
    const elasticValue = Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;

    this.scale.lerpVectors(this.scale, this.initialScale, elasticValue);

    return false;
  }

  updateAppearance(isPinched: boolean): void {
    if (isPinched) {
      (this.material as THREE.MeshStandardMaterial).emissive.set(0x553311);
      (this.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5;
    } else {
      (this.material as THREE.MeshStandardMaterial).emissive.set(0x000000);
      (this.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
    }
  }
}

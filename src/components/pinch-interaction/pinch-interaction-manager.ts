// src/components/pinch-interaction/pinch-interaction-manager.ts

import * as THREE from 'three';
import { XRHandSpace } from 'three';
import { PinchDetector } from './pinch-detector';
import { PinchableObject } from './pinchable-object';

export class PinchInteractionManager {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  // private renderer: THREE.WebGLRenderer;
  private pinchableObjects: PinchableObject[] = [];
  private isPinching: boolean = false;
  private pinchStartPosition: THREE.Vector3 = new THREE.Vector3();
  private pinchCurrentPosition: THREE.Vector3 = new THREE.Vector3();
  private selectedObject: PinchableObject | null = null;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;

  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.camera = camera;
    //this.renderer = renderer;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Set up mouse event listeners
    window.addEventListener('mousedown', this.onMouseDown.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  addPinchableObject(object: PinchableObject): void {
    this.pinchableObjects.push(object);
    this.scene.add(object);
  }

  update(rightHand: XRHandSpace | null, deltaTime: number): void {
    if (rightHand) {
      //this.updateVR(rightHand, deltaTime);
    }
    this.updateReturningObjects(deltaTime);
  }

  private updateVR(rightHand: XRHandSpace, ): void {
    const rightPinching = PinchDetector.detectPinch(rightHand);
    const pinchPosition = PinchDetector.getPinchMidpoint(rightHand);

    if (!pinchPosition) return;

    this.pinchCurrentPosition.copy(pinchPosition);

    if (rightPinching && !this.isPinching) {
      this.handlePinchStart(this.pinchCurrentPosition);
    } else if (rightPinching && this.isPinching && this.selectedObject) {
      this.handleOngoingPinch();
    } else if (!rightPinching && this.isPinching) {
      this.handlePinchEnd();
    }
  }

  private onMouseDown(event: MouseEvent): void {
    if (event.shiftKey && event.button === 0) {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.pinchableObjects);

      if (intersects.length > 0) {
        this.isPinching = true;
        this.selectedObject = intersects[0].object as PinchableObject;
        this.selectedObject.updateAppearance(true);
        this.pinchStartPosition.copy(intersects[0].point);
        this.pinchCurrentPosition.copy(this.pinchStartPosition);
      }
    }
  }

  private onMouseMove(event: MouseEvent): void {
    if (this.isPinching && this.selectedObject) {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects([this.selectedObject]);

      if (intersects.length > 0) {
        this.pinchCurrentPosition.copy(intersects[0].point);
        this.handleOngoingPinch();
      }
    }
  }

  private onMouseUp(): void {
    if (this.isPinching) {
      this.handlePinchEnd();
    }
  }

  private handlePinchStart(position: THREE.Vector3): void {
    this.isPinching = true;
    this.pinchStartPosition.copy(position);

    this.raycaster.set(this.pinchStartPosition, new THREE.Vector3(0, 0, -1));
    const intersects = this.raycaster.intersectObjects(this.pinchableObjects);

    if (intersects.length > 0) {
      this.selectedObject = intersects[0].object as PinchableObject;
      this.selectedObject.updateAppearance(true);
    }
  }

  private handleOngoingPinch(): void {
    if (!this.selectedObject) return;

    const pinchDistance = this.pinchCurrentPosition.distanceTo(this.pinchStartPosition);
    const extensionFactor = 1.0 + pinchDistance * 2.0;
    const direction = new THREE.Vector3().subVectors(this.pinchCurrentPosition, this.pinchStartPosition).normalize();

    this.selectedObject.extend(direction, extensionFactor);
  }

  private handlePinchEnd(): void {
    this.isPinching = false;
    if (this.selectedObject) {
      this.selectedObject.updateAppearance(false);
      this.selectedObject.startElasticReturn();
      this.selectedObject = null;
    }
  }

  private updateReturningObjects(deltaTime: number): void {
    this.pinchableObjects.forEach(object => {
      object.updateElasticReturn(deltaTime);
    });
  }
  
}


import * as THREE from 'three';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

export class BallShooter {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private controller1: THREE.XRTargetRaySpace;
  private controller2: THREE.XRTargetRaySpace;
  private controllerGrip1: THREE.XRGripSpace;
  private controllerGrip2: THREE.XRGripSpace;
  
  private balls: THREE.Mesh[] = [];
  private ballCount = 0;
  private maxBalls = 20;
  private tempMatrix = new THREE.Matrix4();
  
  // Physics parameters
  private gravity = 9.8;
  private colliders: THREE.Mesh[] = [];
  
  constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.renderer = renderer;
    
    // Initialize controllers
    this.controller1 = this.renderer.xr.getController(0);
    this.controller1.addEventListener('selectstart', () => this.onSelectStart(this.controller1));
    this.scene.add(this.controller1);
    
    this.controller2 = this.renderer.xr.getController(1);
    this.controller2.addEventListener('selectstart', () => this.onSelectStart(this.controller2));
    this.scene.add(this.controller2);
    
    // Controller grips for visual representation
    const controllerModelFactory = new XRControllerModelFactory();
    
    this.controllerGrip1 = this.renderer.xr.getControllerGrip(0);
    this.controllerGrip1.add(controllerModelFactory.createControllerModel(this.controllerGrip1));
    this.scene.add(this.controllerGrip1);
    
    this.controllerGrip2 = this.renderer.xr.getControllerGrip(1);
    this.controllerGrip2.add(controllerModelFactory.createControllerModel(this.controllerGrip2));
    this.scene.add(this.controllerGrip2);
    
    // Add controller line helpers
    this.addControllerRays();
    
    // Create room environment
    this.createRoom();
  }
  
  private addControllerRays(): void {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3));
    
    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2,
      blending: THREE.AdditiveBlending
    });
    
    const line = new THREE.Line(geometry, material);
    line.scale.z = 5;
    
    this.controller1.add(line.clone());
    this.controller2.add(line.clone());
  }
  
  private createRoom(): void {
    // Create a simple room with walls
    const room = new THREE.Mesh(
      new THREE.BoxGeometry(6, 6, 6, 10, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0x404040, wireframe: true })
    );
    room.geometry.translate(0, 3, 0);
    this.scene.add(room);
    
    // Add floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 6, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);
    
    // Add some objects to hit
    this.addColliders();
  }
  
  private addColliders(): void {
    // Create some boxes to shoot at
    for (let i = 0; i < 5; i++) {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.3, 0.3),
        new THREE.MeshStandardMaterial({ color: 0xffffff * Math.random() })
      );
      box.position.x = (Math.random() - 0.5) * 4;
      box.position.y = 1.5 + Math.random() * 2;
      box.position.z = -2 - Math.random() * 2;
      
      // Add physics properties
      box.userData.velocity = new THREE.Vector3();
      box.userData.isCollider = true;
      
      this.scene.add(box);
      this.colliders.push(box);
    }
  }
  
  private onSelectStart(controller: THREE.XRTargetRaySpace): void {
    // Create a ball and shoot it
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 16, 8),
      new THREE.MeshStandardMaterial({ color: 0xff0000 })
    );
    
    // Position the ball at the controller
    ball.position.set(0, 0, -0.1);
    controller.add(ball);
    controller.userData.ball = ball;
    
    // Add physics properties
    ball.userData.velocity = new THREE.Vector3();
    ball.userData.isShot = true;
    
    // Remove oldest ball if we exceed the maximum
    if (this.ballCount >= this.maxBalls) {
      const oldestBall = this.balls.shift();
      if (oldestBall) {
        this.scene.remove(oldestBall);
      }
    } else {
      this.ballCount++;
    }
    
    this.balls.push(ball);
    
    // Add event for releasing the ball
    controller.addEventListener('selectend', () => this.onSelectEnd(controller), );
  }
  
  private onSelectEnd(controller: THREE.XRTargetRaySpace): void {
    if (controller.userData.ball) {
      const ball = controller.userData.ball as THREE.Mesh;
      
      // Remove the ball from the controller
      controller.remove(ball);
      
      // Get the controller's world position and orientation
      this.tempMatrix.identity().extractRotation(controller.matrixWorld);
      const velocity = new THREE.Vector3(0, 0, -5);
      velocity.applyMatrix4(this.tempMatrix);
      
      // Set the ball's position in world space
      ball.position.copy(controller.position);
      ball.quaternion.copy(controller.quaternion);
      
      // Set the velocity for physics simulation
      ball.userData.velocity = velocity;
      
      // Add the ball to the scene
      this.scene.add(ball);
    }
    
    controller.userData.ball = undefined;
  }
  
  public update(delta: number): void {
    // Update ball physics
    for (let i = 0; i < this.balls.length; i++) {
      const ball = this.balls[i];
      
      if (ball.userData.isShot) {
        // Apply gravity
        ball.userData.velocity.y -= this.gravity * delta;
        
        // Update position based on velocity
        ball.position.x += ball.userData.velocity.x * delta;
        ball.position.y += ball.userData.velocity.y * delta;
        ball.position.z += ball.userData.velocity.z * delta;
        
        // Check for collisions with colliders
        for (let j = 0; j < this.colliders.length; j++) {
          const collider = this.colliders[j];
          
          if (this.checkCollision(ball, collider)) {
            // Apply a simple physics response
            this.handleCollision(ball, collider);
          }
        }
        
        // Check if ball is out of bounds
        if (ball.position.y < -10) {
          this.scene.remove(ball);
          this.balls.splice(i, 1);
          i--;
          this.ballCount--;
        }
      }
    }
    
    // Update collider physics
    for (let i = 0; i < this.colliders.length; i++) {
      const collider = this.colliders[i];
      
      if (collider.userData.velocity) {
        // Apply gravity
        collider.userData.velocity.y -= this.gravity * delta * 0.5;
        
        // Update position based on velocity
        collider.position.x += collider.userData.velocity.x * delta;
        collider.position.y += collider.userData.velocity.y * delta;
        collider.position.z += collider.userData.velocity.z * delta;
        
        // Simple floor collision
        if (collider.position.y < 0.15) {
          collider.position.y = 0.15;
          collider.userData.velocity.y = -collider.userData.velocity.y * 0.5;
          collider.userData.velocity.x *= 0.9;
          collider.userData.velocity.z *= 0.9;
        }
      }
    }
  }
  
  private checkCollision(ball: THREE.Mesh, collider: THREE.Mesh): boolean {
    // Simple distance-based collision detection
    const distance = ball.position.distanceTo(collider.position);
    const radiusSum = 0.05 + 0.15; // Ball radius + half box width
    
    return distance < radiusSum;
  }
  
  private handleCollision(ball: THREE.Mesh, collider: THREE.Mesh): void {
    // Calculate collision response
    const direction = new THREE.Vector3().subVectors(ball.position, collider.position).normalize();
    
    // Apply force to the collider
    collider.userData.velocity = collider.userData.velocity || new THREE.Vector3();
    collider.userData.velocity.add(direction.multiplyScalar(2));
    
    // Bounce the ball
    const reflection = ball.userData.velocity.reflect(direction);
    ball.userData.velocity.copy(reflection).multiplyScalar(0.7); // Reduce velocity for energy loss
  }
}

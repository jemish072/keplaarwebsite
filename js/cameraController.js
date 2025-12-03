class CameraController {
    constructor(renderer) {  // Add renderer as parameter
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.controls = new THREE.OrbitControls(this.camera, renderer.domElement);
        this.controls.enableDamping = true;
        
        this.cameraPositions = {
            intro: { position: new THREE.Vector3(4, 6, 7), target: new THREE.Vector3(0, 0, 0) },
            screen1: { position: new THREE.Vector3(0, 2, -1), target: new THREE.Vector3(0, 2, -7) },
            banner1: { position: new THREE.Vector3(2, 4, 0), target: new THREE.Vector3(9, 4, -6) },
            screen2: { position: new THREE.Vector3(2, 2, 1.7), target: new THREE.Vector3(8, 3, 1.7) },
            screen3: { position: new THREE.Vector3(0, 2, 5), target: new THREE.Vector3(0, 2, 7) },
            screen4: { position: new THREE.Vector3(-2, 2, 1.7), target: new THREE.Vector3(-8, 3, 1.7) },
            outro: { position: new THREE.Vector3(4, 6, 7), target: new THREE.Vector3(0, 0, 0) }
        };
        
        this.currentCameraPosition = 'intro';
        this.cameraPath = ['intro', 'screen1', 'screen2', 'screen3', 'screen4', 'outro'];
    }

    setInitialPosition() {
        this.camera.position.copy(this.cameraPositions.intro.position);
        this.controls.target.copy(this.cameraPositions.intro.target);
        this.controls.update();
    }

    animateCameraToPosition(targetPosition, targetLookAt, duration = 2) {
        return new Promise(resolve => {
            const startPos = this.camera.position.clone();
            const startTarget = this.controls.target.clone();
            const startTime = performance.now();

            const update = () => {
                const elapsed = performance.now() - startTime;
                const t = Math.min(elapsed / (duration * 1000), 1);
                const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

                this.camera.position.lerpVectors(startPos, targetPosition, eased);
                this.controls.target.lerpVectors(startTarget, targetLookAt, eased);
                this.controls.update();

                if (t < 1) requestAnimationFrame(update);
                else resolve();
            };
            update();
        });
    }

    goToNextScreen() {
        if (!window.app?.sceneManager?.isModelLoaded) {
            console.log('Model not loaded yet, please wait...');
            return;
        }

        const currentIndex = this.cameraPath.indexOf(this.currentCameraPosition);
        if (currentIndex < this.cameraPath.length - 1) {
            const nextPositionKey = this.cameraPath[currentIndex + 1];
            
            // Hide navigation during travel
            if (window.app.uiManager) {
                window.app.uiManager.hideNavigation();
            }
            
            // 👇 SPECIAL CASE: Screen4 → Outro (show social media UI)
            if (this.currentCameraPosition === 'screen4' && nextPositionKey === 'outro') {
                const targetPos = this.cameraPositions.outro;
                this.animateCameraToPosition(targetPos.position, targetPos.target, 2).then(() => {
                    this.currentCameraPosition = 'outro';
                    
                    // 👇 SHOW SOCIAL MEDIA UI - HIDE NAVIGATION
                    if (window.app.uiManager) {
                        window.app.uiManager.showSocialMediaUI();
                        // Navigation stays hidden at outro
                    }
                });
            } else {
                // Normal animation for other transitions
                const targetPos = this.cameraPositions[nextPositionKey];
                this.animateCameraToPosition(targetPos.position, targetPos.target, 2).then(() => {
                    this.currentCameraPosition = nextPositionKey;
                    this.showNavigationAtDestination();
                });
            }
        } else {
            // 👇 We're already at outro - do nothing
            console.log('Already at outro - end of experience');
        }
    }

    // In cameraController.js - goToPreviousScreen
    goToPreviousScreen() {
        // Check if model is loaded before allowing navigation
        if (!window.app?.sceneManager?.isModelLoaded) {
            console.log('Model not loaded yet, please wait...');
            return;
        }

        const currentIndex = this.cameraPath.indexOf(this.currentCameraPosition);
        
        // 👇 SPECIAL CASE: If at outro, go back to screen4
        if (this.currentCameraPosition === 'outro') {
            const targetPos = this.cameraPositions.screen4;
            this.animateCameraToPosition(targetPos.position, targetPos.target, 2).then(() => {
                this.currentCameraPosition = 'screen4';
                this.showNavigationAtDestination();
            });
        } else if (currentIndex > 0) {
            // Normal previous navigation
            const prevPosition = this.cameraPath[currentIndex - 1];
            const targetPos = this.cameraPositions[prevPosition];
            
            this.animateCameraToPosition(targetPos.position, targetPos.target, 2).then(() => {
                this.currentCameraPosition = prevPosition;
                this.showNavigationAtDestination();
            });
        }
    }

    showNavigationAtDestination() {
    // Show navigation again at destination
        if (window.app.uiManager) {
            window.app.uiManager.showNavigation();
            window.app.uiManager.updateNavigationButtons();
        }
    }

    getCurrentCameraPosition() {
        return this.currentCameraPosition;
    }

    showNavigation() {
        document.getElementById('navigation-ui').style.display = 'block';
    }
    
}
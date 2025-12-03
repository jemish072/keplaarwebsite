// Main entry point - initializes everything
window.addEventListener('load', function () {
    // Initialize renderer first
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.physicallyCorrectLights = true;
    document.body.appendChild(renderer.domElement);

    // Initialize scene manager
    const sceneManager = new SceneManager();
    const scene = sceneManager.scene;
    
    // Initialize camera controller with renderer
    const cameraController = new CameraController(renderer);
    const camera = cameraController.camera;
    const controls = cameraController.controls;

    // Set initial camera position
    cameraController.setInitialPosition();

    // Initialize interaction manager with renderer
    const interactionManager = new InteractionManager(scene, camera, renderer);

    // Load environment and setup everything
    sceneManager.loadEnvironment(renderer).then(() => {
        console.log('🎯 1. Environment loaded');
        
        setTimeout(() => {
            console.log('🎯 2. Starting interaction setup');
            interactionManager.setupInteractions();
            
            // Store app globally
            window.app = {
                camera: camera,
                controls: controls,
                cameraController: cameraController,
                sceneManager: sceneManager,
                interactionManager: interactionManager,
                uiManager: uiManager,
                renderer: renderer
            };
            
            console.log('🎯 3. App stored globally');
            
            // Verify screens are tagged
            setTimeout(() => {
                console.log('🎯 4. Verifying screen tagging...');
                let taggedCount = 0;
                window.app.sceneManager.model.traverse(child => {
                    if (child.isMesh && child.userData.isScreen) {
                        taggedCount++;
                    }
                });
                console.log(`🎯 5. Screens tagged: ${taggedCount}`);
            }, 2000);
            
        }, 1000);
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // Resize handling
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (sceneManager.pmremGenerator) {
            sceneManager.pmremGenerator.dispose();
        }
    });
});
class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.isModelLoaded = false;
        this.model = null;
        this.pmremGenerator = null;
        
        this.setupLighting();
        this.setupSkybox();
    }

    setupLighting() {
        // Ambient light
        this.scene.add(new THREE.AmbientLight(0xffffff, 1.0));

        // Directional light
        const dirLight = new THREE.DirectionalLight(0xffffff, 3);
        dirLight.position.set(5, 15, 5);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(0xffffff, 2.0);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);

        // Rim light
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
        rimLight.position.set(0, 5, -10);
        this.scene.add(rimLight);
    }

    setupSkybox() {
        const skyGeo = new THREE.SphereGeometry(1000, 60, 40);
        const skyMat = new THREE.MeshBasicMaterial({
            color: 0xe8f1ff,
            side: THREE.BackSide
        });
        this.sky = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(this.sky);
    }

    setupPMREMGenerator(renderer) {
        this.pmremGenerator = new THREE.PMREMGenerator(renderer);
        this.pmremGenerator.compileEquirectangularShader();
        
        const envRT = this.pmremGenerator.fromScene(this.sky).texture;
        this.scene.environment = envRT;
    }

    async loadEnvironment(renderer) {  // Add renderer parameter
        return new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();
            loader.load('assets/models/environment.glb', (gltf) => {
                this.model = gltf.scene;
                this.scene.add(this.model);
                
                // Setup environment reflections with renderer
                this.setupPMREMGenerator(renderer);
                
                // Apply material enhancements
                this.enhanceMaterials(renderer);
                
                // Apply screen images
                this.applyScreenImages();
                
                this.isModelLoaded = true;
                resolve();
                
            }, undefined, (error) => {
                console.error("GLB Load Error:", error);
                reject(error);
            });
        });
    }

    enhanceMaterials(renderer) {  // Add renderer parameter
        this.model.traverse(child => {
            if (child.isMesh && child.material) {

                if (child.name && child.name.startsWith('Screen')) {
                    console.log(`🔄 Skipping enhancement for screen: ${child.name}`);
                    return; // Don't enhance screens at all
            }
                // Skip screen meshes (handled separately)
                const screenNames = ["Screen001", "Screen002", "Screen003", "Screen004"];
                if (screenNames.includes(child.name)) return;

                // Texture improvements
                if (child.material.map && renderer) {
                    child.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
                    child.material.map.minFilter = THREE.LinearMipmapLinearFilter;
                    child.material.map.magFilter = THREE.LinearFilter;
                }

                // Global brightening
                child.material.envMapIntensity = 3.0;

                if (child.material.roughness !== undefined)
                    child.material.roughness = Math.max(0.05, child.material.roughness * 0.5);

                if (child.material.metalness !== undefined)
                    child.material.metalness = Math.min(0.9, child.material.metalness * 1.5);

                // Pillars enhancement
                const pillarNames = ['Pillar.001', 'Pillar.002', 'Pillar.003', 'Pillar.004'];
                const nameLower = child.name.toLowerCase();

                if (pillarNames.some(n => nameLower.includes(n))) {
                    child.material.envMapIntensity = 4.0;
                    if (child.material.color) {
                        const hsl = {};
                        child.material.color.getHSL(hsl);
                        hsl.l = Math.min(0.8, hsl.l * 1.8);
                        child.material.color.setHSL(hsl.h, hsl.s, hsl.l);
                    }
                    child.material.roughness = 0.1;
                    child.material.metalness = 0.6;
                    child.material.emissive = child.material.color.clone();
                    child.material.emissiveIntensity = 0.1;
                }

                // Blue emissive lights
                const lightNames = ['Light.001', 'Light.002', 'Light.003', 'Light.004'];
                if (lightNames.some(n => child.name.includes(n)) || child.material.name === "Material.003") {
                    child.material.emissive = new THREE.Color(0x0066ff);
                    child.material.emissiveIntensity = 8.0;
                    child.material.envMapIntensity = 6.0;
                    if (child.material.color) {
                        const hsl = {};
                        child.material.color.getHSL(hsl);
                        hsl.h = 0.6;
                        hsl.s = 0.9;
                        hsl.l = 0.8;
                        child.material.color.setHSL(hsl.h, hsl.s, hsl.l);
                    }
                    child.material.roughness = 0.05;
                    child.material.metalness = 0.2;
                }

                // Glass material for other glass objects (not our screens)
                if (child.material.name === "Glass.007" && !screenNames.includes(child.name)) {
                    child.material = new THREE.MeshPhysicalMaterial({
                        color: 0x050810,
                        metalness: 0.7,
                        roughness: 0.03,
                        emissiveIntensity: 0.3,
                        clearcoat: 1.0,
                        clearcoatRoughness: 0.01,
                        envMapIntensity: 5.0,
                        transparent: true,
                        transmission: 1
                    });
                }
            }
        });
    }

    applyScreenImages() {
        const textureLoader = new THREE.TextureLoader();
        const screenImages = [
            { screenName: "Screen001", imagePath: "assets/textures/screen2.jpeg" },
            { screenName: "Screen002", imagePath: "assets/textures/screen3.jpeg" },
            { screenName: "Screen003", imagePath: "assets/textures/screen4.jpeg" },
            { screenName: "Screen004", imagePath: "assets/textures/screen1.jpeg" }
        ];

        let loadedCount = 0;

        screenImages.forEach(screenConfig => {
            textureLoader.load(screenConfig.imagePath, (texture) => {
                // Fix texture orientation
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;
                texture.flipY = false;
                
                // Find the screen mesh
                let screenMesh = null;
                this.model.traverse(child => {
                    if (child.isMesh && child.name === screenConfig.screenName) {
                        screenMesh = child;
                    }
                });
                
                if (screenMesh) {
                    // Apply screen material
                    screenMesh.material = new THREE.MeshPhysicalMaterial({
                        map: texture,
                        emissive: 0x050810,
                        emissiveMap: texture,
                        emissiveIntensity: 2.0,
                        color: 0xffffff,
                        metalness: 0.0,
                        roughness: 0.1,
                        transparent: true,
                        opacity: 0.95,
                        transmission: 0,
                        clearcoat: 0.3,
                        clearcoatRoughness: 0.1,
                        envMapIntensity: 0.2,
                        side: THREE.FrontSide
                    });
                    
                    // Dispose old material to prevent memory leaks
                    if (screenMesh.material && screenMesh.material.dispose) {
                        screenMesh.material.dispose();
                    }
                    
                    screenMesh.material = newMaterial;
                    
                    // Tag as screen
                    screenMesh.userData.originalScale = screenMesh.scale.clone();
                    screenMesh.userData.isScreen = true;
                    
                    loadedCount++;
                    console.log(`✅ Screen ${loadedCount}/4: ${screenConfig.screenName} - DOUBLE-SIDED`);
                    
                    // When all screens are loaded, log completion
                    if (loadedCount === screenImages.length) {
                        console.log('🎉 All screens loaded and ready for interaction!');
                    }
                }
            }, undefined, (error) => {
                console.error(`❌ Failed to load: ${screenConfig.screenName}`, error);
            });
        });
    }

    dispose() {
        if (this.pmremGenerator) {
            this.pmremGenerator.dispose();
        }
    }
}
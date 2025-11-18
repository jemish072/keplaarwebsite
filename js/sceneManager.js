// sceneManager.js
class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.pmremGenerator = null;
    this.renderer = null;
    this.camera = null;
    this.controls = null;
  }

  initScene(container) {
    // === Renderer ===
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.5;
    this.renderer.physicallyCorrectLights = true;
    container.appendChild(this.renderer.domElement);

    // === Camera ===
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 2, 5);
    this.scene.add(this.camera);

    // === Lights ===
    const ambient = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(5, 15, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 2.0);
    fillLight.position.set(-5, 5, -5);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
    rimLight.position.set(0, 5, -10);
    this.scene.add(rimLight);

    // === Skybox ===
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();

    const skyGeo = new THREE.SphereGeometry(1000, 60, 40);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0xe8f1ff,
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);

    // === Orbit Controls ===
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // === Environment Reflection ===
    const envRT = this.pmremGenerator.fromScene(sky).texture;
    this.scene.environment = envRT;

    this.loadEnvironmentModel();

    // === Resize ===
    window.addEventListener('resize', () => this.onWindowResize());
  }

  loadEnvironmentModel() {
    const loader = new THREE.GLTFLoader();
    loader.load('assets/models/environment.glb', (gltf) => {
      const model = gltf.scene;
      this.scene.add(model);

      model.traverse((child) => {
        if (child.isMesh && child.material) {
          if (child.material.map) {
            child.material.map.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
            child.material.map.minFilter = THREE.LinearMipmapLinearFilter;
            child.material.map.magFilter = THREE.LinearFilter;
            child.material.map.generateMipmaps = true;
          }

          child.material.envMapIntensity = 3.0;

          if (child.material.roughness !== undefined)
            child.material.roughness = Math.max(0.05, child.material.roughness * 0.5);

          if (child.material.metalness !== undefined)
            child.material.metalness = Math.min(0.9, child.material.metalness * 1.5);

          const pillarNames = ['pillar.001', 'pillar.002', 'pillar.003', 'pillar.004'];
          const name = child.name.toLowerCase();

          if (pillarNames.some(p => name.includes(p))) {
            console.log("Brightening pillar:", child.name);
            child.material.envMapIntensity = 4.0;
            if (child.material.color) {
              const hsl = { h: 0, s: 0, l: 0 };
              child.material.color.getHSL(hsl);
              hsl.l = Math.min(0.8, hsl.l * 1.8);
              child.material.color.setHSL(hsl.h, hsl.s, hsl.l);
            }
            child.material.roughness = 0.1;
            child.material.metalness = 0.6;
            child.material.emissive = child.material.color.clone();
            child.material.emissiveIntensity = 0.1;
          }

          if (child.material.name === "Glass.007") {
            console.log("Updating material for:", child.name);
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

          child.material.needsUpdate = true;
        }
      });

      console.log("Environment loaded successfully.");
    }, undefined, (error) => {
      console.error('Error loading GLB:', error);
    });
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  update() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

window.SceneManager = SceneManager;

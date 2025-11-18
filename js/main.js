window.addEventListener('load', function () {

  // === Scene, Camera, Renderer ===
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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

  // === Lighting ===
  const ambient = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 3);
  dirLight.position.set(5, 15, 5);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  scene.add(dirLight);

  // Add fill light for more brightness
  const fillLight = new THREE.DirectionalLight(0xffffff, 2.0);
  fillLight.position.set(-5, 5, -5);
  scene.add(fillLight);

  // Add rim light for better edge definition
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
  rimLight.position.set(0, 5, -10);
  scene.add(rimLight);

  // === Skybox (acts as natural reflection environment) ===
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const skyGeo = new THREE.SphereGeometry(1000, 60, 40);
  const skyMat = new THREE.MeshBasicMaterial({ 
      color: 0xe8f1ff,
      side: THREE.BackSide 
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);

  // === Controls ===
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // === Load GLB ===
  const loader = new THREE.GLTFLoader();
  loader.load('assets/models/environment1.glb', function (gltf) {
    const model = gltf.scene;
    scene.add(model);
    camera.position.set(0, 2, 5);
    controls.update();

    // Create reflection environment
    const envRT = pmremGenerator.fromScene(sky).texture;
    scene.environment = envRT;

    // Apply material enhancements
    model.traverse((child) => {
        if (child.isMesh && child.material) {
            
            // Apply high-quality texture filtering to all materials
            if (child.material.map) {
                child.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
                child.material.map.minFilter = THREE.LinearMipmapLinearFilter;
                child.material.map.magFilter = THREE.LinearFilter;
                child.material.map.generateMipmaps = true;
            }
            
            // BRIGHTEN ALL MATERIALS - Preserve original colors but make them brighter
            child.material.envMapIntensity = 3.0;
            
            // Reduce roughness for more shininess while preserving original material properties
            if (child.material.roughness !== undefined) {
                child.material.roughness = Math.max(0.05, child.material.roughness * 0.5);
            }
            
            // Increase metalness slightly for better reflections
            if (child.material.metalness !== undefined) {
                child.material.metalness = Math.min(0.9, child.material.metalness * 1.5);
            }
            
            // SPECIFIC FIX FOR PILLARS - Make them much brighter while preserving colors
            const pillarNames = ['pillar.001', 'pillar.002', 'pillar.003', 'pillar.004'];
            const childName = child.name.toLowerCase();
            
            if (pillarNames.some(pillarName => childName.includes(pillarName)) || 
                (child.parent && pillarNames.some(pillarName => child.parent.name.toLowerCase().includes(pillarName))) ||
                (child.material.name && child.material.name.toLowerCase().includes('column'))) {
                
                console.log("Brightening pillar:", child.name);
                
                // Make pillars extra bright and reflective
                child.material.envMapIntensity = 4.0;
                
                // Boost the material's inherent brightness
                if (child.material.color) {
                    const currentColor = child.material.color;
                    const hsl = { h: 0, s: 0, l: 0 };
                    currentColor.getHSL(hsl);
                    hsl.l = Math.min(0.8, hsl.l * 1.8);
                    child.material.color.setHSL(hsl.h, hsl.s, hsl.l);
                }
                
                // Make pillars very shiny
                child.material.roughness = 0.1;
                child.material.metalness = 0.6;
                
                // Add subtle emission to prevent dark areas
                child.material.emissive = child.material.color.clone();
                child.material.emissiveIntensity = 0.1;
            }
            
            // MAKE LIGHTS EMIT BLUISH LIGHT - Add this section
            // MAKE LIGHTS EMIT BLUISH LIGHT - Add this section
            const lightNames = ['Light.001', 'Light.002', 'Light.003', 'Light.004'];
            if (lightNames.some(lightName => child.name.includes(lightName)) || 
                child.material.name === "Material.003") {
                
                console.log("Making light emissive and adding actual light source:", child.name);
                
                // Make the lights emit strong blue light (visual appearance)
                // MAKE LIGHTS EMIT BLUISH LIGHT - Add this section
                const lightNames = ['Light.001', 'Light.002', 'Light.003', 'Light.004'];
                if (lightNames.some(lightName => child.name.includes(lightName)) || 
                    child.material.name === "Material.003") {
                    
                    console.log("Making light emissive and adding actual light source:", child.name);
                    
                    // Make the lights emit strong blue light (visual appearance)
                    child.material.emissive = new THREE.Color(0x0066ff);
                    child.material.emissiveIntensity = 8.0; // Even stronger emission
                    child.material.envMapIntensity = 6.0;
                    
                    if (child.material.color) {
                        const currentColor = child.material.color;
                        const hsl = { h: 0, s: 0, l: 0 };
                        currentColor.getHSL(hsl);
                        hsl.h = 0.6;
                        hsl.s = 0.9;
                        hsl.l = 0.8;
                        child.material.color.setHSL(hsl.h, hsl.s, hsl.l);
                    }
                    
                    child.material.roughness = 0.05;
                    child.material.metalness = 0.2;
                    
              
                }
                }
            
            child.material.needsUpdate = true;

            // Apply special material to glass panels
            if (child.material.name === "Glass.007") {
                console.log("Updating material for:", child.name, child.material.name);

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

    // Debug: Check materials
    console.log("=== Materials ===");
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        console.log(`${child.name}: ${child.material.name}, envMapIntensity: ${child.material.envMapIntensity}`);
      }
    });

    // === Animation Loop ===
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();
  }, undefined, function (error) {
    console.error('An error happened loading the GLB:', error);
  });

  // === Resize Handler ===
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Clean up PMREMGenerator on unmount
  window.addEventListener('beforeunload', function() {
    pmremGenerator.dispose();
  });

});
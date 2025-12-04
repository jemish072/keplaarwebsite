class InteractionManager {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredObject = null;
        this.hoveredSection = null;
        
        this.setupEventListeners();
    
        this.screenSections = {
            "Screen004": [ // This is physically Screen4, but logically Screen1 (UPCOMING EVENTS)
                { 
                    name: "event1", 
                    bounds: { x: 0.4, y: -0.6, width: 0.4, height: 1 },
                    hoverText: "Event 1 - Coming Soon",
                    isEvent: true
                },
                { 
                    name: "event2", 
                    bounds: { x: -0.2, y: -0.6, width: 0.4, height: 1 },
                    hoverText: "Event 2 - Coming Soon", 
                    isEvent: true
                },
                { 
                    name: "event3", 
                    bounds: { x: -0.7, y: -0.6, width: 0.4, height: 1 },
                    hoverText: "Event 3 - Coming Soon",
                    isEvent: true
                }
            ],
            "Screen001": [ // This is physically Screen1, logically Screen2
                // Add sections for Screen1 content here
            ],
            "Screen002": [ // This is physically Screen2, logically Screen3
                // Add sections for Screen2 content here
            ],
            "Screen003": [ // This is physically Screen3, logically Screen4
                // Add sections for Screen3 content here
            ]
        };
        
        this.setupEventListeners();
        this.setupTooltip();
    }

    setupEventListeners() {
        // Mouse move for hover effects
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            this.onMouseMove(event);
        });

        // Click for interactions
        this.renderer.domElement.addEventListener('click', (event) => {
            this.onClick(event);
        });

        // 👇 MODIFIED: Check if UI is open before processing scroll
        window.addEventListener('wheel', (event) => {
            // Check if any UI overlay is open
            const socialUI = document.getElementById('social-media-ui');
            const formUI = document.getElementById('contact-form-ui');
            
            const isSocialOpen = socialUI && socialUI.style.display !== 'none';
            const isFormOpen = formUI && formUI.style.display !== 'none';
            
            if (isSocialOpen || isFormOpen) {
            // UI is open - don't process scroll for camera
            console.log('Scroll blocked - UI overlay open');
            return;
            }
            
            // Only process scroll if no UI is open
            this.onScroll(event);
        }, { passive: false });
        }

    setupTooltip() {
        // Create tooltip element
        this.tooltip = document.createElement('div');
        this.tooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            pointer-events: none;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s;
            max-width: 200px;
            text-align: center;
            font-family: Arial, sans-serif;
        `;
        document.body.appendChild(this.tooltip);
    }

    showTooltip(text, x, y) {
        this.tooltip.textContent = text;
        this.tooltip.style.left = (x + 10) + 'px';
        this.tooltip.style.top = (y - 10) + 'px';
        this.tooltip.style.opacity = '1';
    }

    hideTooltip() {
        this.tooltip.style.opacity = '0';
    }

    setupInteractions() {
        console.log('🔄 SETUP INTERACTIONS - START');
        
        // Wait a bit then setup screens
        setTimeout(() => {
            this.setupScreenInteractions();
        }, 1000);
    }

    setupScreenInteractions() {
        console.log('🔍 SCREEN INTERACTIONS - START SEARCH');
        
        if (!window.app?.sceneManager?.model) {
            console.log('❌ No model available');
            return;
        }

        let screensFound = 0;
        
        // Search for screens
        window.app.sceneManager.model.traverse(child => {
            if (child.isMesh && child.name && child.name.startsWith('Screen')) {
                this.tagScreen(child);
                screensFound++;
            }
        });
        
        console.log(`📊 Screens tagged: ${screensFound}`);
        
        // If still no screens, try manual search
        if (screensFound === 0) {
            console.log('🔄 Trying manual screen detection...');
            this.manualScreenDetection();
        }
    }

    // 👇 NEW METHOD: Find screens by pattern if exact names don't work
    findScreensByPattern() {
        let screensFound = 0;
        
        window.app.sceneManager.model.traverse(child => {
            if (child.isMesh) {
                // Look for screens by name pattern or material
                if (child.name.includes('Screen') || 
                    child.name.includes('screen') ||
                    (child.material && child.material.name && child.material.name.includes('Screen'))) {
                    
                    child.userData.originalScale = child.scale.clone();
                    child.userData.isScreen = true;
                    screensFound++;
                    
                    console.log(`✅ Found screen by pattern: ${child.name} (Material: ${child.material?.name})`);
                }
            }
        });
        
        console.log(`Total screens found by pattern: ${screensFound}`);
    }

    tagScreen(mesh) {
        mesh.userData.originalScale = mesh.scale.clone();
        mesh.userData.isScreen = true;
        console.log(`✅ TAG SCREEN: ${mesh.name}`);
    }

    manualScreenDetection() {
        console.log('🔍 MANUAL SCREEN DETECTION');
        let found = 0;
        
        window.app.sceneManager.model.traverse(child => {
            if (child.isMesh) {
                // Look for any mesh that might be a screen
                if (child.name && (
                    child.name.includes('Screen') || 
                    child.name.includes('screen') ||
                    (child.material && child.material.map) // Has texture
                )) {
                    this.tagScreen(child);
                    found++;
                }
            }
        });
        
        console.log(`📊 Manual detection found: ${found} screens`);
    }

    onMouseMove(event) {
        // Calculate mouse position in normalized device coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
        
        this.checkIntersections(event.clientX, event.clientY);
    }

    checkIntersections(mouseX, mouseY) {
        if (!window.app?.sceneManager?.model) {
            console.log('No model loaded yet');
            return;
        }
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const screenMeshes = [];
        window.app.sceneManager.model.traverse(child => {
            if (child.isMesh && child.userData.isScreen) {
                screenMeshes.push(child);
            }
        });
        
        console.log(`Found ${screenMeshes.length} screen meshes to check`);
        
        const intersects = this.raycaster.intersectObjects(screenMeshes);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            const point = intersects[0].point;
            
            // Convert 3D intersection point to screen UV coordinates
            const uv = this.worldToUV(point, object);
            
            // Check if we're hovering over a specific section
            const section = this.getSectionAtUV(object.name, uv);
            
            if (section) {
                // Hovering over an interactive section
                this.renderer.domElement.style.cursor = 'pointer';
                this.showTooltip(section.hoverText, mouseX, mouseY);
                
                // Visual feedback for the section
                this.highlightSection(object, section);
            } else {
                // Hovering over screen but not a section
                this.renderer.domElement.style.cursor = 'default';
                this.hideTooltip();
                this.removeHighlight();
            }
            
            // Handle general screen hover
            if (this.hoveredObject !== object) {
                if (this.hoveredObject) {
                    this.onHoverExit(this.hoveredObject);
                }
                this.hoveredObject = object;
                this.onHoverEnter(object);
            }
        } else {
            // Not hovering over any screen
            if (this.hoveredObject) {
                this.onHoverExit(this.hoveredObject);
                this.hoveredObject = null;
            }
            this.hideTooltip();
            this.removeHighlight();
            this.renderer.domElement.style.cursor = 'default';
        }
    }

    worldToUV(worldPoint, object) {
        // Convert world coordinates to object's local coordinates
        const localPoint = object.worldToLocal(worldPoint.clone());
        
        // Assuming the screen is a plane facing the correct direction
        // Adjust these values based on your screen orientation and size
        const uv = {
            u: (localPoint.x + 0.5), // Normalize to [0,1]
            v: (localPoint.y + 0.5)   // Normalize to [0,1]
        };
        
        return uv;
    }

    getSectionAtUV(screenName, uv) {
        const sections = this.screenSections[screenName];
        if (!sections) return null;
        
        for (const section of sections) {
            // 👇 SIMPLE RECTANGLE CHECK - assumes all sections are rectangles
            if (section.bounds) {
                const bounds = section.bounds;
                const sectionU = (bounds.x + 0.5);
                const sectionV = (bounds.y + 0.5);
                const sectionWidth = bounds.width;
                const sectionHeight = bounds.height;
                
                if (uv.u >= sectionU && 
                    uv.u <= sectionU + sectionWidth &&
                    uv.v >= sectionV && 
                    uv.v <= sectionV + sectionHeight) {
                    return section;
                }
            }
        }
        return null;
    }

    highlightSection(object, section) {
        // Remove previous highlight
        this.removeHighlight();
        
        // You could add more sophisticated highlight effects here
        // For now, we'll just show the tooltip and change cursor
        
        this.hoveredSection = { object, section };
    }

    removeHighlight() {
        if (this.hoveredSection) {
            this.hoveredSection = null;
        }
    }

    onClick(event) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const screenMeshes = [];
        if (window.app?.sceneManager?.model) {
            window.app.sceneManager.model.traverse(child => {
                if (child.isMesh && child.userData.isScreen) {
                    screenMeshes.push(child);
                }
            });
        }
        
        const intersects = this.raycaster.intersectObjects(screenMeshes);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            const point = intersects[0].point;
            const uv = this.worldToUV(point, object);
            const section = this.getSectionAtUV(object.name, uv);
            
            if (section) {
                console.log(`Clicked on section: ${section.name} of ${object.name}`);
                this.handleSectionClick(section);
            } else {
                console.log(`Clicked on screen: ${object.name} (no section)`);
            }
        }
    }

    handleSectionClick(section) {
        // Handle different section types
        if (section.isEvent) {
            this.handleEventClick(section);
        }
        // Add more section types as needed
    }

    handleEventClick(section) {
        // For now, just show an alert. Later we can show modals or other UI
        alert(`Event Clicked: ${section.hoverText}\n\nThis would open event details in the future.`);
        
        // Future implementation could be:
        // window.app.uiManager.showEventModal(section.name);
    }

    onHoverEnter(object) {
        // Scale up effect
        if (window.gsap) {
            gsap.to(object.scale, {
                duration: 0.3,
                x: object.userData.originalScale.x * 1.1,
                y: object.userData.originalScale.y * 1.1,
                z: object.userData.originalScale.z * 1.1,
                ease: "power2.out"
            });
        } else {
            // Fallback if GSAP not available
            object.scale.multiplyScalar(1.1);
        }

        // Add glow effect
        if (object.material.emissive) {
            object.material.emissiveIntensity = 0.5;
        }

        // Change cursor to pointer
        this.renderer.domElement.style.cursor = 'pointer';
    }

    onHoverExit(object) {
        // Scale back to original
        if (window.gsap) {
            gsap.to(object.scale, {
                duration: 0.3,
                x: object.userData.originalScale.x,
                y: object.userData.originalScale.y,
                z: object.userData.originalScale.z,
                ease: "power2.out"
            });
        } else {
            // Fallback if GSAP not available
            object.scale.copy(object.userData.originalScale);
        }

        // Remove glow effect
        if (object.material.emissive) {
            object.material.emissiveIntensity = 0.2;
        }

        // Reset cursor
        this.renderer.domElement.style.cursor = 'default';
    }

    onClick(event) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const screenMeshes = [];
        if (window.app?.sceneManager?.model) {
            window.app.sceneManager.model.traverse(child => {
                if (child.isMesh && child.userData.isScreen) {
                    screenMeshes.push(child);
                }
            });
        }
        
        const intersects = this.raycaster.intersectObjects(screenMeshes);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            
            // You can add click functionality here
            // For example: show detailed info, play video, etc.
        }
    }

    onScroll(event) {
        // Only allow scroll navigation when not in intro
        const currentPos = window.app?.cameraController?.getCurrentCameraPosition();
        if (currentPos && currentPos !== 'intro') {
            // 👇 This will now work since we set passive: false
            event.preventDefault();
            
            const direction = event.deltaY > 0 ? 'next' : 'previous';
            
            if (direction === 'next') {
                window.app.cameraController.goToNextScreen();
            } else {
                window.app.cameraController.goToPreviousScreen();
            }
        }
    }

}
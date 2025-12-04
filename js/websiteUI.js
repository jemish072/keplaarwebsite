// websiteUI.js - Updated with camera position sync
console.log('🔧 websiteUI.js loaded');

class WebsiteUI {
  constructor() {
    console.log('🔧 WebsiteUI: Initializing');
    
    // Get elements
    this.header = document.getElementById('website-header');
    this.logoLink = document.getElementById('logo-link');
    this.navLinks = document.querySelectorAll('.nav-menu a');
    
    if (!this.header) {
      console.error('❌ WebsiteUI: Header element not found!');
      return;
    }
    
    console.log('✅ WebsiteUI: Header found');
    console.log(`✅ WebsiteUI: Found ${this.navLinks.length} nav links`);
    
    // Ensure header is hidden initially
    this.hideHeader();
    
    // Setup event listeners
    this.init();
  }
  
  init() {
    console.log('🔧 WebsiteUI: Setting up event listeners');
    
    // Logo click - refresh page
    if (this.logoLink) {
      this.logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('🔄 Logo clicked - reloading');
        window.location.reload();
      });
    }
    
    // Navigation links - simple click handling
    this.setupNavigation();
    
    // Listen for Enter Environment button click
    this.setupEnterButtonListener();
    
    // 👇 NEW: Listen for camera position changes
    this.setupCameraPositionListener();
  }
  
  setupNavigation() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const screenId = link.dataset.screen;
        console.log(`📍 Nav clicked: ${screenId}`);
        
        // Update active state FIRST (before navigation)
        this.updateActiveNavLink(screenId);
        
        // Navigate to screen
        this.navigateToScreen(screenId);
      });
    });
  }
  
  setupCameraPositionListener() {
    console.log('🎯 WebsiteUI: Setting up camera position listener');
    
    // Method 1: Check camera position periodically
    this.cameraCheckInterval = setInterval(() => {
      this.updateHeaderFromCameraPosition();
    }, 500); // Check every 500ms
    
    // Method 2: Listen for camera animation completion
    this.setupCameraAnimationListener();
  }
  
  updateHeaderFromCameraPosition() {
    if (!window.app?.cameraController) {
      return;
    }
    
    const currentPos = window.app.cameraController.currentCameraPosition;
    // console.log(`🔄 Camera position: ${currentPos}`);
    
    // Map camera position to screen ID
    const cameraToScreenMap = {
      'screen1': 'events',
      'screen2': 'about',
      'screen3': 'team', 
      'screen4': 'giveaways',
      'outro': 'join',
      'intro': null // No highlight during intro
    };
    
    const screenId = cameraToScreenMap[currentPos];
    
    if (screenId) {
      this.updateActiveNavLink(screenId);
    } else if (currentPos === 'intro') {
      // Clear highlights during intro
      this.navLinks.forEach(link => link.classList.remove('active'));
    }
  }
  
  setupCameraAnimationListener() {
    // Override the animateCameraToPosition method to notify us when camera moves
    if (window.app?.cameraController) {
      const originalAnimate = window.app.cameraController.animateCameraToPosition;
      
      window.app.cameraController.animateCameraToPosition = function(...args) {
        const promise = originalAnimate.apply(this, args);
        
        // When animation completes, update header
        promise.then(() => {
          if (window.websiteUI) {
            setTimeout(() => {
              window.websiteUI.updateHeaderFromCameraPosition();
            }, 100);
          }
        });
        
        return promise;
      };
      
      console.log('✅ WebsiteUI: Camera animation listener attached');
    }
  }
  
  // Update the goToCameraPosition method to also trigger header update
  goToCameraPosition(cameraPos) {
    console.log(`🎬 Moving camera to: ${cameraPos}`);
    
    if (!window.app?.cameraController) {
      console.error('Camera controller not available yet');
      setTimeout(() => this.goToCameraPosition(cameraPos), 500);
      return;
    }
    
    const targetPos = window.app.cameraController.cameraPositions[cameraPos];
    if (!targetPos) {
      console.error(`Camera position not found: ${cameraPos}`);
      return;
    }
    
    window.app.cameraController.animateCameraToPosition(
      targetPos.position,
      targetPos.target,
      2
    ).then(() => {
      // Update camera state
      window.app.cameraController.currentCameraPosition = cameraPos;
      
      // Update navigation UI buttons
      if (window.app.uiManager) {
        window.app.uiManager.updateNavigationButtons();
      }
      
      // 👇 Update header highlighting
      this.updateHeaderFromCameraPosition();
      
      console.log(`✅ Arrived at ${cameraPos}`);
    });
  }
  
  // Keep all other methods the same...
  navigateToScreen(screenId) {
    console.log(`🎯 Navigating to: ${screenId}`);
    
    // Screen mapping
    const screenMap = {
      'events': 'screen1',     // Upcoming Events -> screen1
      'about': 'screen2',      // About Us -> screen2
      'team': 'screen3',       // Our Team -> screen3
      'giveaways': 'screen4',  // Giveaways -> screen4
      'join': 'outro'          // Join Us -> outro (social media)
    };
    
    const cameraPos = screenMap[screenId];
    if (!cameraPos) {
      console.error(`Unknown screen: ${screenId}`);
      return;
    }
    
    // Check if we're still in intro
    const uiContainer = document.getElementById('ui-container');
    const isIntro = uiContainer && uiContainer.style.display !== 'none';
    
    if (isIntro && screenId !== 'join') {
      // If still in intro and not joining, enter environment first
      console.log('⏳ Still in intro, entering environment first...');
      this.enterEnvironmentFirst(cameraPos);
    } else if (screenId === 'join') {
      // Special handling for join/outro
      this.goToJoinScreen();
    } else {
      // Already in environment, navigate directly
      this.goToCameraPosition(cameraPos);
    }
  }
  
  enterEnvironmentFirst(targetCameraPos) {
    console.log('🚪 Entering environment first...');
    
    // Click the Enter Environment button
    const enterButton = document.getElementById('enter-button');
    if (enterButton) {
      enterButton.click();
      
      // Navigate after environment is entered
      setTimeout(() => {
        this.goToCameraPosition(targetCameraPos);
      }, 3000); // Wait for entry animation
    }
  }
  
  goToJoinScreen() {
    console.log('📱 Going to Join Us (social media/contact form)');
    
    // Check if we're in intro
    const uiContainer = document.getElementById('ui-container');
    const isIntro = uiContainer && uiContainer.style.display !== 'none';
    
    if (isIntro) {
      // If in intro, enter environment first
      console.log('🚪 Entering environment first...');
      const enterButton = document.getElementById('enter-button');
      if (enterButton) {
        enterButton.click();
        
        // Then go to join after entry
        setTimeout(() => {
          this.goToOutro();
        }, 4000);
      }
    } else {
      // Already in environment
      this.goToOutro();
    }
  }
  
  goToOutro() {
    console.log('🎯 Going to outro (social media)');
    
    if (!window.app?.cameraController) {
      console.error('Camera controller not available');
      return;
    }
    
    // If not at screen4, go there first
    if (window.app.cameraController.currentCameraPosition !== 'screen4') {
      console.log('🔄 Going to screen4 first...');
      this.goToCameraPosition('screen4');
      
      // Then go to outro
      setTimeout(() => {
        this.showOutroUI();
      }, 2500);
    } else {
      this.showOutroUI();
    }
  }
  
  showOutroUI() {
    console.log('🖥️ Showing social media UI');
    
    // Go to outro camera position
    const outroPos = window.app.cameraController.cameraPositions.outro;
    window.app.cameraController.animateCameraToPosition(
      outroPos.position,
      outroPos.target,
      2
    ).then(() => {
      window.app.cameraController.currentCameraPosition = 'outro';
      
      // Show social media UI
      if (window.app.uiManager) {
        window.app.uiManager.showSocialMediaUI();
        window.app.uiManager.hideNavigation();
      }
      
      // 👇 Update header to highlight "Join Us"
      this.updateActiveNavLink('join');
    });
  }
  
  updateActiveNavLink(screenId) {
    // Simply update which link is active
    this.navLinks.forEach(link => {
      if (link.dataset.screen === screenId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  hideHeader() {
    console.log('👻 WebsiteUI: Hiding header');
    this.header.style.display = 'none';
  }
  
  showHeader() {
    console.log('👁️ WebsiteUI: Showing header');
    this.header.style.display = 'flex';
    
    // Fade in animation
    setTimeout(() => {
      this.header.style.opacity = '1';
      this.header.style.transform = 'translateY(0)';
    }, 10);
    
    // 👇 Set initial active state based on current camera position
    setTimeout(() => {
      this.updateHeaderFromCameraPosition();
    }, 100);
  }
  
  setupEnterButtonListener() {
    const enterButton = document.getElementById('enter-button');
    
    if (enterButton) {
      console.log('🎬 WebsiteUI: Listening for Enter Environment button');
      
      enterButton.addEventListener('click', () => {
        console.log('🎬 WebsiteUI: Enter Environment clicked');
        
        // Show header after the intro animation completes
        setTimeout(() => {
          this.showHeader();
          console.log('✅ WebsiteUI: Header shown');
        }, 2500);
      });
    }
  }
  
  // Clean up interval when page unloads
  cleanup() {
    if (this.cameraCheckInterval) {
      clearInterval(this.cameraCheckInterval);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM ready - creating WebsiteUI');
  window.websiteUI = new WebsiteUI();
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (window.websiteUI) {
    window.websiteUI.cleanup();
  }
});
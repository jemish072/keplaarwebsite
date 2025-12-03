class UIManager {
    constructor() {
        this.uiContainer = document.getElementById('ui-container');
        this.navigationUI = document.getElementById('navigation-ui');
        this.enterButton = document.getElementById('enter-button');
        this.previousButton = document.getElementById('previous-button');
        this.nextButton = document.getElementById('next-button');
        
        this.init();
    }
    
    init() {
        this.enterButton?.addEventListener('click', () => this.enterEnvironment());
        this.previousButton?.addEventListener('click', () => this.goToPreviousScreen());
        this.nextButton?.addEventListener('click', () => this.goToNextScreen());
    }

    notifyEnvironmentEntry() {
        console.log('🎯 UIManager: Notifying environment entry');
        
        // Show header if websiteUI exists
        if (window.websiteUI) {
            window.websiteUI.showHeader();
        }
        
        // Set initial active nav state
        setTimeout(() => {
            const headerLinks = document.querySelectorAll('.nav-menu a');
            headerLinks.forEach(link => {
            if (link.dataset.screen === 'events') {
                link.classList.add('active');
            }
            });
        }, 100);
        }
    
    async enterEnvironment() {
        this.enterButton.disabled = true;
        
        if (window.app?.cameraController) {
            await window.app.cameraController.animateCameraToPosition(
                window.app.cameraController.cameraPositions.screen1.position, 
                window.app.cameraController.cameraPositions.screen1.target, 
                2.5
            );
            
            // Update camera position state
            window.app.cameraController.currentCameraPosition = 'screen1';
        }
        
        this.hideIntroPanel();
        this.showNavigation();
        this.updateNavigationButtons();
        this.notifyEnvironmentEntry();
    }
    
    hideIntroPanel() {
        // Fade out the entire UI container
        this.uiContainer.style.transition = 'opacity 0.8s ease';
        this.uiContainer.style.opacity = '0';
        
        setTimeout(() => {
            this.uiContainer.style.display = 'none';
        }, 800);
    }
    
    showIntroPanel() {
        this.uiContainer.style.display = 'block';
        this.uiContainer.style.opacity = '0';
        this.uiContainer.style.transition = 'opacity 0.8s ease';
        
        // Trigger reflow
        setTimeout(() => {
            this.uiContainer.style.opacity = '1';
        }, 50);
        
        // Re-enable enter button
        this.enterButton.disabled = false;
    }

    showNavigation() {
        if (this.navigationUI) {
            this.navigationUI.style.display = 'flex';
            this.navigationUI.style.opacity = '0';
            this.navigationUI.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                this.navigationUI.style.opacity = '1';
            }, 100);
        }
    }

    hideNavigation() {
        if (this.navigationUI) {
            this.navigationUI.style.opacity = '0';
            setTimeout(() => {
                this.navigationUI.style.display = 'none';
            }, 500);
        }
    }
    
    goToNextScreen() {
        if (window.app?.cameraController) {
            window.app.cameraController.goToNextScreen();
            setTimeout(() => this.updateNavigationButtons(), 100);
        }
    }
    
    goToPreviousScreen() {
        if (window.app?.cameraController) {
            window.app.cameraController.goToPreviousScreen();
            setTimeout(() => this.updateNavigationButtons(), 100);
        }
    }

    // In uiManager.js - updateNavigationButtons
    updateNavigationButtons() {
        if (!window.app?.cameraController) return;
        
        const currentPos = window.app.cameraController.getCurrentCameraPosition();
        const currentIndex = window.app.cameraController.cameraPath.indexOf(currentPos);
        const totalScreens = window.app.cameraController.cameraPath.length;
        
        // 👇 HIDE navigation at outro
        if (currentPos === 'outro') {
            this.hideNavigation();
            return;
        }
        
        // Update Previous button
        if (this.previousButton) {
            this.previousButton.disabled = currentIndex === 0;
        }
        
        // Update Next button  
        if (this.nextButton) {
            this.nextButton.disabled = currentIndex === totalScreens - 1;
        }
    }

    showSocialMediaUI() {
        console.log('🎯 showSocialMediaUI called');
        
        const socialUI = document.getElementById('social-media-ui');
        console.log('Social UI element found:', !!socialUI);
        
        if (socialUI) {
            socialUI.style.display = 'flex';
            socialUI.style.opacity = '0';
            
            setTimeout(() => {
                socialUI.style.opacity = '1';
                console.log('✅ Social Media UI should be visible now');
            }, 100);
            
            this.setupSocialMediaHandlers();
        } else {
            console.log('❌ Social UI element not found in DOM');
        }
    }

    setupSocialMediaHandlers() {
        // Social media item clicks
        document.querySelectorAll('.social-item').forEach(item => {
            item.addEventListener('click', () => {
                const platform = item.dataset.platform;
                this.openSocialMedia(platform);
            });
        });
        
        // Next button to form
        const nextButton = document.getElementById('next-to-form');
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                this.showContactFormUI();
            });
        }
        
        // Close button
        const closeButton = document.querySelector('#social-media-ui .close-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hideAllUI();
            });
        }
    }

    showContactFormUI() {
        console.log('Showing contact form UI');
        
        // Hide social media UI
        const socialUI = document.getElementById('social-media-ui');
        if (socialUI) {
            socialUI.style.display = 'none';
        }
        
        // Show contact form UI
        const formUI = document.getElementById('contact-form-ui');
        if (formUI) {
            formUI.style.display = 'flex';
            formUI.style.opacity = '0';
            
            setTimeout(() => {
                formUI.style.opacity = '1';
            }, 100);
            
            // Setup form handler
            this.setupContactFormHandler();
        }
    }

    openSocialMedia(platform) {
        const urls = {
            instagram: 'https://instagram.com/keplaaresports',
            twitter: 'https://twitter.com/keplaaresports', 
            youtube: 'https://youtube.com/keplaaresports',
            discord: 'https://discord.gg/keplaar'
        };
        
        if (urls[platform]) {
            window.open(urls[platform], '_blank');
        }
    }

    setupContactFormHandler() {
        const form = document.getElementById('player-application-form');
        const formUI = document.getElementById('contact-form-ui');
        const closeButton = document.querySelector('#contact-form-ui .close-button');
        const fileInput = document.getElementById('player-portfolio');
        const fileInfo = document.getElementById('file-info');
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePlayerApplication(e);
            });
            
            // 👇 PREVENT SCROLL PROPAGATION
            form.addEventListener('wheel', (e) => {
                e.stopPropagation();
            }, { passive: false });
            
            form.addEventListener('touchmove', (e) => {
                e.stopPropagation();
            }, { passive: false });
        }
        
        if (formUI) {
            // 👇 PREVENT SCROLL ON ENTIRE FORM UI
            formUI.addEventListener('wheel', (e) => {
                e.stopPropagation();
            }, { passive: false });
            
            formUI.addEventListener('touchmove', (e) => {
                e.stopPropagation();
            }, { passive: false });
        }
        
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hideAllUI();
            });
        }
        
        // File upload feedback
        if (fileInput && fileInfo) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Check file size (5MB max)
                    if (file.size > 5 * 1024 * 1024) {
                        alert('File too large! Maximum size is 5MB.');
                        e.target.value = '';
                        fileInfo.textContent = 'No file chosen';
                    } else {
                        fileInfo.textContent = `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
                    }
                } else {
                    fileInfo.textContent = 'No file chosen';
                }
            });
        }
    }

    async handlePlayerApplication(e) {
        const form = e.target;
        const submitButton = form.querySelector('.submit-button');
        const submitText = submitButton.querySelector('.submit-text');
        const submitLoading = submitButton.querySelector('.submit-loading');
        
        // Show loading state
        submitText.style.display = 'none';
        submitLoading.style.display = 'inline';
        submitButton.disabled = true;
        
        try {
            // Get form data
            const formData = new FormData(form);
            
            // Validate required fields
            const requiredFields = ['name', 'game', 'rank', 'game_id', 'email', 'phone'];
            for (const field of requiredFields) {
                if (!formData.get(field)) {
                    throw new Error(`Please fill in ${field.replace('_', ' ')}`);
                }
            }
            
            // Validate email format
            const email = formData.get('email');
            if (!this.isValidEmail(email)) {
                throw new Error('Please enter a valid email address');
            }
            
            // Validate phone format (basic)
            const phone = formData.get('phone');
            if (!this.isValidPhone(phone)) {
                throw new Error('Please enter a valid phone number');
            }
            
            // Validate file if uploaded
            const portfolio = formData.get('portfolio');
            if (portfolio && portfolio.size > 0) {
                if (!portfolio.name.toLowerCase().endsWith('.pdf')) {
                    throw new Error('Portfolio must be a PDF file');
                }
            }
            
            // Prepare data for submission
            const applicationData = {
                name: formData.get('name'),
                game: formData.get('game'),
                rank: formData.get('rank'),
                game_id: formData.get('game_id'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                portfolio_file: portfolio ? portfolio.name : null,
                submitted_at: new Date().toISOString()
            };
            
            console.log('Player application data:', applicationData);
            
            // Here you would typically send to your server
            // Example: await fetch('/api/apply', { method: 'POST', body: formData });
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success message
            alert('🎉 Application Submitted Successfully!\n\nWe will review your application and contact you within 3-5 business days. Good luck!');
            
            // Reset form and close UI
            form.reset();
            document.getElementById('file-info').textContent = 'No file chosen';
            this.hideAllUI();
            
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
        } finally {
            // Reset button state
            submitText.style.display = 'inline';
            submitLoading.style.display = 'none';
            submitButton.disabled = false;
        }
    }

    // Validation helpers
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        // Basic phone validation - accepts various formats
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    hideAllUI() {
        // Hide all UI overlays
        const socialUI = document.getElementById('social-media-ui');
        const formUI = document.getElementById('contact-form-ui');
        
        if (socialUI) socialUI.style.display = 'none';
        if (formUI) formUI.style.display = 'none';
        
        // Optional: Show navigation again if you want users to restart
        // this.showNavigation();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.uiManager = new UIManager();
});
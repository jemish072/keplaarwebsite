<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>3D Environment</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/ui.css">
</head>

<body>
  <!-- Wrap everything in a container -->
  <div id="ui-container">
    <!-- Video Background -->
    <div id="video-background">
      <video id="bg-video" src="assets/textures/background.mp4" autoplay muted loop playsinline></video>
    </div>

    <!-- UI Panel -->
    <div id="ui-panel-1">
      <img src="assets/textures/logo.png" alt="Keplaar Esports Logo" class="logo">
      <h1>KEPLAAR ESPORTS</h1>
      <h2>Version 2.0 | Canada 2025</h2>
      <button id="enter-button">Enter Environment</button>
    </div>

  </div>

    <!-- SEPARATE Navigation UI (stays visible after intro) -->
  <div id="navigation-ui" style="display: none;">
    <button id="previous-button">Previous Screen</button>
    <button id="next-button">Next Screen</button>
  </div>

  <!-- Social Media UI (initially hidden) -->
  <div id="social-media-ui" class="blurred-ui" style="display: none;">
      <div class="ui-content">
          <button class="close-button">&times;</button>
          <h2>Follow Us</h2>
          <div class="social-grid">
              <div class="social-item" data-platform="instagram">
                  <div class="social-icon">📷</div>
                  <span>Instagram</span>
              </div>
              <div class="social-item" data-platform="twitter">
                  <div class="social-icon">🐦</div>
                  <span>Twitter</span>
              </div>
              <div class="social-item" data-platform="youtube">
                  <div class="social-icon">📺</div>
                  <span>YouTube</span>
              </div>
              <div class="social-item" data-platform="discord">
                  <div class="social-icon">💬</div>
                  <span>Discord</span>
              </div>
          </div>
          <button id="next-to-form" class="next-button">Continue to Contact Form</button>
      </div>
  </div>

  <!-- Contact Form UI -->
  <div id="contact-form-ui" class="blurred-ui" style="display: none;">
      <div class="ui-content">
          <button class="close-button">&times;</button>
          <h2>Join Keplaar Esports</h2>
          <p class="form-subtitle">Apply to become part of our competitive team</p>
          
          <form id="player-application-form" class="vertical-form">
              <!-- 1. Name -->
              <div class="form-group">
                  <label for="player-name">Full Name *</label>
                  <input type="text" id="player-name" name="name" required 
                        placeholder="Enter your full name">
              </div>

              <!-- 2. Game Selection -->
              <div class="form-group">
                  <label for="player-game">Primary Game *</label>
                  <div class="select-wrapper">
                      <select id="player-game" name="game" required>
                          <option value="" disabled selected>Select your primary game</option>
                          <option value="valorant">VALORANT</option>
                          <option value="fortnite">Fortnite</option>
                          <option value="dota2">Dota 2</option>
                          <option value="pubg">PUBG</option>
                      </select>
                      <span class="select-arrow">▼</span>
                  </div>
              </div>

              <!-- 3. Rank -->
              <div class="form-group">
                  <label for="player-rank">Current Rank *</label>
                  <input type="text" id="player-rank" name="rank" required 
                        placeholder="e.g., Radiant, Immortal, Diamond, etc.">
              </div>

              <!-- 4. In-Game ID -->
              <div class="form-group">
                  <label for="player-id">In-Game ID *</label>
                  <input type="text" id="player-id" name="game_id" required 
                        placeholder="Your username in the game">
              </div>

              <!-- 5. Email -->
              <div class="form-group">
                  <label for="player-email">Email Address *</label>
                  <input type="email" id="player-email" name="email" required 
                        placeholder="you@example.com">
              </div>

              <!-- 6. Phone Number -->
              <div class="form-group">
                  <label for="player-phone">Phone Number *</label>
                  <input type="tel" id="player-phone" name="phone" required 
                        placeholder="+1 (123) 456-7890">
              </div>

              <!-- 7. Portfolio PDF (Optional) -->
              <div class="form-group">
                  <label for="player-portfolio">Portfolio/Highlights (Optional)</label>
                  <div class="file-upload">
                      <input type="file" id="player-portfolio" name="portfolio" 
                            accept=".pdf,.PDF" class="file-input">
                      <label for="player-portfolio" class="file-label">
                          <span class="file-icon">📄</span>
                          <span class="file-text">Upload PDF file (max 5MB)</span>
                      </label>
                      <div class="file-info" id="file-info">No file chosen</div>
                  </div>
                  <small class="file-hint">Upload your tournament results, highlights, or resume (PDF only)</small>
              </div>

              <!-- Submit Button -->
              <button type="submit" class="submit-button">
                  <span class="submit-text">Submit Application</span>
                  <span class="submit-loading" style="display: none;">⏳ Processing...</span>
              </button>
              
              <p class="form-note">* Required fields</p>
          </form>
      </div>
  </div>

  <!-- Library Scripts -->
  <script src="js/libs/three.min.js"></script>
  <script src="js/libs/OrbitControls.js"></script> <!-- This must come before GLTFLoader -->
  <script src="js/libs/GLTFLoader.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

  <!-- Application Scripts (in correct order) -->
  <script src="js/sceneManager.js"></script>
  <script src="js/cameraController.js"></script>
  <script src="js/interaction.js"></script>
  <script src="js/uiManager.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
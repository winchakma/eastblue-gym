const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html'));

const navTemplate = `
  <nav class="navbar">
    <a href="index.html" class="nav-logo">EAST <span>BLUE</span></a>

    <div class="nav-links">
      <a href="index.html">Home</a>
      <a href="classes.html">Classes</a>
      <a href="activity.html">Activity</a>
      <a href="dashboard.html" class="nav-dashboard-link hidden">Dashboard</a>
      <a href="challenge.html" class="nav-dashboard-link hidden">Challenge</a>
      <a href="membership.html">Membership</a>
      <a href="about.html">About</a>
    </div>

    <div class="nav-actions">
      <a href="membership.html" class="btn-nav btn-nav-outline nav-auth-only">Sign In</a>
      <a href="membership.html" class="btn-nav btn-nav-fill nav-auth-only">Start Free Trial</a>
      
      <div id="navProfileBtn" class="nav-profile-link nav-dashboard-link hidden" style="display: flex; align-items: center; gap: 12px; cursor: pointer; position: relative;">
        <span id="nav-greeting" class="text-xs font-bold text-yellow-400 hidden lg:inline">Elite Member</span>
        <img id="nav-avatar" src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Profile" style="width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--yellow); object-fit: cover;">
        
        <div id="navDropdown" class="nav-dropdown">
            <a href="dashboard.html">Dashboard</a>
            <a href="profile.html">Settings</a>
            <hr style="border: 0; border-top: 1px solid var(--border); margin: 8px 0;">
            <a href="#" onclick="logout()">Logout</a>
        </div>
      </div>
    </div>

    <button class="hamburger" type="button" aria-label="Open menu" aria-controls="mobile-menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </nav>

  <div class="mobile-menu" id="mobile-menu">
    <a href="index.html">Home</a>
    <a href="classes.html">Classes</a>
    <a href="activity.html">Activity</a>
    <a href="dashboard.html" class="nav-dashboard-link hidden">Dashboard</a>
    <a href="challenge.html" class="nav-dashboard-link hidden">Challenge</a>
    <a href="membership.html">Membership</a>
    <a href="about.html">About</a>
    <hr style="border: 0; border-top: 1px solid var(--border); margin: 10px 0; width: 80%;">
    <a href="membership.html" class="nav-auth-only">Sign In</a>
    <a href="membership.html" class="nav-auth-only">Start Free Trial</a>
    <a href="#" class="nav-dashboard-link hidden" onclick="logout()">Logout</a>
  </div>

  <!-- GLOBAL AUTH MODAL -->
  <div id="authModal" class="modal-overlay hidden">
    <div class="modal-content glass auth-modal-inner">
      <button class="modal-close" id="closeAuthModal">&times;</button>
      
      <div class="auth-tabs">
        <button class="auth-tab active" onclick="switchTab('login')">Sign In</button>
        <button class="auth-tab" onclick="switchTab('register')">Register</button>
      </div>

      <!-- Login Form -->
      <form id="loginFormModal" class="auth-form active ajax-form" action="/api/auth/login" method="POST">
        <h2 class="modal-title">WELCOME <span>BACK</span></h2>
        <p class="modal-subtitle">Enter your elite credentials to continue.</p>
        
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" name="email" class="form-input" placeholder="you@example.com" required>
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" name="password" class="form-input" placeholder="••••••••" required>
        </div>
        <button type="submit" class="btn btn-yellow w-full justify-center mt-4">Sign In</button>
        <p class="auth-switch-text">Don't have an account? <a href="#" onclick="switchTab('register')">Join the Elite</a></p>
      </form>

      <!-- Register Form -->
      <form id="registerFormModal" class="auth-form ajax-form" action="/api/auth/register" method="POST">
        <h2 class="modal-title">START <span>A TRIAL</span></h2>
        <p class="modal-subtitle">Join the East Blue community today.</p>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">First Name</label>
            <input type="text" name="firstName" class="form-input" placeholder="John" required>
          </div>
          <div class="form-group">
            <label class="form-label">Last Name</label>
            <input type="text" name="lastName" class="form-input" placeholder="Doe" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" name="email" class="form-input" placeholder="you@example.com" required>
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" name="password" class="form-input" placeholder="••••••••" required>
        </div>
        <button type="submit" class="btn btn-yellow w-full justify-center mt-4">Create Account</button>
        <p class="auth-switch-text">Already a member? <a href="#" onclick="switchTab('login')">Sign In</a></p>
      </form>
    </div>
  </div>
`;

const footerTemplate = `
  <footer>
    <div class="footer-grid">
      <div class="footer-brand reveal">
        <a href="index.html" style="text-decoration:none; color:inherit;"><h3>EAST <span>BLUE</span></h3></a>
        <p>Redefining fitness through high-performance training and elite community experiences. Join the movement today.</p>
        <div class="footer-socials">
          <a href="#" class="footer-social-btn" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
          <a href="#" class="footer-social-btn" aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
          <a href="#" class="footer-social-btn" aria-label="Twitter"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg></a>
          <a href="#" class="footer-social-btn" aria-label="LinkedIn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></a>
        </div>
      </div>

      <div class="footer-mailing reveal reveal-delay-1">
        <h4>Membership</h4>
        <h3>Unlock <span>Access</span></h3>
        <p>Be the first to know about special offers, new workouts & upcoming events.</p>
        <a href="membership.html" class="btn btn-yellow" style="padding:12px 24px; font-size:11px;">Join The Elite</a>
      </div>

      <div class="footer-col reveal reveal-delay-2">
        <h4>Navigate</h4>
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="classes.html">Classes</a></li>
          <li><a href="activity.html">Activity</a></li>
          <li><a href="dashboard.html" class="nav-dashboard-link hidden">Dashboard</a></li>
        </ul>
      </div>

      <div class="footer-col reveal reveal-delay-3">
        <h4>Support</h4>
        <ul>
          <li><a href="support.html#faq">Help Center</a></li>
          <li><a href="contact.html">Contact Us</a></li>
          <li><a href="support.html#privacy">Privacy Policy</a></li>
          <li><a href="support.html#terms">Terms of Service</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; 2026 East Blue Gym. All rights reserved.</p>
      <div class="footer-bottom-links">
        <a href="support.html#terms">Terms & Disclosures</a>
        <a href="support.html#privacy">Privacy Policy</a>
      </div>
    </div>
  </footer>
`;

htmlFiles.forEach(file => {
    let content = fs.readFileSync(path.join(root, file), 'utf8');

    // Replace navbar (find <nav>...</nav> and following mobile menu if exists)
    content = content.replace(/<nav[\s\S]*?<\/nav>/, navTemplate.trim());
    content = content.replace(/<div class="mobile-menu"[\s\S]*?<\/div>/, ''); // Remove old mobile menu if it was outside nav
    
    // Ensure mobile menu is only once (our template includes it)
    // Actually, let's just make sure we don't have duplicates
    
    // Replace footer
    content = content.replace(/<footer[\s\S]*?<\/footer>/, footerTemplate.trim());

    // Ensure scripts are at the end
    if (!content.includes('js/script.js')) {
        content = content.replace('</body>', '<script src="js/script.js?v=2026"></script>\n</body>');
    }
    if (!content.includes('js/chatbot.js')) {
        content = content.replace('</body>', '<link rel="stylesheet" href="css/chatbot.css">\n<script src="js/chatbot.js"></script>\n</body>');
    }

    fs.writeFileSync(path.join(root, file), content, 'utf8');
    console.log(`Standardized ${file}`);
});

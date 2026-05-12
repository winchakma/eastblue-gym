/* ============================================
   EAST BLUE GYM — MAIN SCRIPT
   ============================================ */

/* ---- GLOBAL UTILITIES ---- */
window.showToast = function(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
};

window.updateDashboardUI = function(user) {
  if (!user || user.error) return;
  document.querySelectorAll('#nav-avatar, #sidebar-avatar').forEach(img => {
    img.src = user.profilePicture || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
  });
  const elements = {
    'member-nickname': user.nickname || user.username || 'Elite Member',
    'member-bio': user.bio || 'No bio set. Customize your profile in settings!',
    'member-email': user.email,
    'user-greeting': 'Hello, ' + (user.nickname || user.username.split(' ')[0] || 'Member') + '!',
    'nav-greeting': user.nickname || user.username || 'Elite Member',
    'membership-type': user.membershipType || 'Free Trial',
    'profile-name-display': user.username,
    'profile-email-display': user.email,
    'display-membership-tier': user.membershipType || 'ELITE ANNUAL',
    'member-since': user.date ? new Date(user.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2026'
  };
  Object.entries(elements).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });

  // Fetch BMR if it exists on the dashboard
  if (document.getElementById('bmr-value')) {
    fetch('/api/user/status')
      .then(res => res.json())
      .then(status => {
        if (status.bmr) {
          document.getElementById('bmr-value').innerHTML = `${status.bmr} <span class="text-sm font-normal text-[#555]">kcal</span>`;
        }
      });
  }
};

window.logout = function() {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
};

window.switchTab = function(tabName) {
  const authTabs = document.querySelectorAll('.auth-tab');
  const authForms = document.querySelectorAll('.auth-form');
  if (authTabs.length && authForms.length) {
    authTabs.forEach(btn => btn.classList.toggle('active', btn.textContent.toLowerCase().includes(tabName)));
    authForms.forEach(form => form.classList.toggle('active', form.id.toLowerCase().includes(tabName)));
  }
  const controlBtns = document.querySelectorAll('.tab-btn');
  const controlContents = document.querySelectorAll('.tab-content');
  if (controlBtns.length && controlContents.length) {
    controlBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
    controlContents.forEach(content => content.classList.toggle('active', content.dataset.tab === tabName));
  }
};

/* ---- MAIN INITIALIZATION ---- */
document.addEventListener('DOMContentLoaded', () => {

  /* ---- NAVBAR & NAV LOGIC ---- */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  /* ---- MOBILE MENU LOGIC ---- */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !isExpanded);
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
      }
    });
  }

  /* ---- ACTIVE LINK HIGHLIGHTING ---- */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  const token = localStorage.getItem('token');
  if (token) {
    document.querySelectorAll('.nav-dashboard-link').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('.nav-auth-only').forEach(el => el.classList.add('hidden'));
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(user => { if (!user.error) window.updateDashboardUI(user); })
      .catch(err => console.error('Data load error:', err));
  }

  /* ---- NAV PROFILE DROPDOWN ---- */
  const navProfileBtn = document.getElementById('navProfileBtn');
  const navDropdown = document.getElementById('navDropdown');
  if (navProfileBtn && navDropdown) {
    navProfileBtn.addEventListener('click', (e) => { e.stopPropagation(); navDropdown.classList.toggle('active'); });
    document.addEventListener('click', (e) => { if (!navProfileBtn.contains(e.target)) navDropdown.classList.remove('active'); });
  }

  /* ---- GLOBAL MODAL LOGIC ---- */
  const authModal = document.getElementById('authModal');
  const closeAuthModal = document.getElementById('closeAuthModal');
  
  window.openAuthModal = function(tab = 'login') {
    if (authModal) {
      authModal.classList.remove('hidden');
      window.switchTab(tab);
    }
  };

  if (closeAuthModal) {
    closeAuthModal.addEventListener('click', () => authModal.classList.add('hidden'));
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) authModal.classList.add('hidden');
    });
  }

  // Update nav buttons to open modal
  document.querySelectorAll('.nav-auth-only').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (window.location.pathname.includes('membership.html')) return;
      e.preventDefault();
      const isRegister = btn.textContent.toLowerCase().includes('trial') || btn.textContent.toLowerCase().includes('register');
      window.openAuthModal(isRegister ? 'register' : 'login');
    });
  });

  /* ---- COUNTER ANIMATION (THE HEARTBEAT) ---- */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      el.textContent = prefix + (Number.isInteger(target) ? Math.floor(current) : current.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counterEls = document.querySelectorAll('.stat-num[data-target]');
  if (counterEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(el => observer.observe(el));
  }

  /* ---- SCROLL REVEAL ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(el => revObserver.observe(el));
  }

  /* ---- HASH NAVIGATION ---- */
  const hash = window.location.hash.substring(1);
  if (hash === 'register' || hash === 'signin' || hash === 'login') {
    setTimeout(() => {
      window.switchTab(hash === 'signin' ? 'login' : hash);
      const target = document.getElementById(hash === 'register' || hash === 'signin' ? 'signin' : hash);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  /* ---- FORMS (AJAX) ---- */
  document.querySelectorAll('form.ajax-form').forEach(form => {
    if (form.id === 'profileUpdateForm') return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending...';
      try {
        const formData = Object.fromEntries(new FormData(form));
        const res = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        const data = await res.json();
        if (res.ok) {
          window.showToast(data.message || 'Success!', 'success');
          if (data.token) {
            localStorage.setItem('token', data.token);
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
          } else { form.reset(); }
        } else { window.showToast(data.error || 'Error', 'error'); }
      } catch (err) { 
        console.error('AJAX Error:', err);
        window.showToast(err.message || 'Network error. Check your connection.', 'error'); 
      } finally { btn.disabled = false; btn.textContent = originalText; }
    });
  });

  /* ---- PLACEHOLDER HANDLERS ---- */
  document.querySelectorAll('a[href="#"], button:not([type="submit"])').forEach(el => {
    if (el.id === 'btnOpenSettings' || el.id === 'navProfileBtn' || el.classList.contains('hamburger') || el.id === 'btnCheckIn' || el.id === 'btnClaimPerk' || el.id === 'closeChat') return;
    el.addEventListener('click', (e) => {
      if (el.textContent.toLowerCase().includes('forgot') || el.classList.contains('footer-social-btn') || el.textContent.toLowerCase().includes('app store') || el.textContent.toLowerCase().includes('google play')) {
        e.preventDefault();
        window.showToast('This feature is currently in development for the Elite version.', 'info');
      }
    });
  });
  const checkInBtn = document.getElementById('btnCheckIn');
  if (checkInBtn) {
    checkInBtn.addEventListener('click', () => {
      checkInBtn.textContent = 'CHECKED IN'; checkInBtn.disabled = true; checkInBtn.style.opacity = '0.5';
      window.showToast('Attendance recorded!', 'success');
    });
  }
  const cancelBtn = document.getElementById('btnCancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to cancel this booking?')) {
        cancelBtn.closest('.flex.items-center').style.opacity = '0.3';
        cancelBtn.textContent = 'CANCELLED'; cancelBtn.disabled = true;
        window.showToast('Booking cancelled successfully.', 'info');
      }
    });
  }
  const claimBtn = document.getElementById('btnClaimPerk');
  if (claimBtn) {
    claimBtn.addEventListener('click', () => {
      claimBtn.textContent = 'CLAIMED'; claimBtn.disabled = true;
      window.showToast('Protein Perk claimed!', 'success');
    });
  }
  const keepPushingBtn = document.getElementById('btnKeepPushing');
  if (keepPushingBtn) {
    keepPushingBtn.addEventListener('click', () => {
      window.showToast('You are 65% there! Complete 1 more session today to hit your goal.', 'info');
    });
  }
  const streakBtn = document.getElementById('btnStreak');
  if (streakBtn) {
    streakBtn.addEventListener('click', () => {
      window.showToast('You are on a 24-day streak! Only 6 days left to unlock your reward.', 'success');
    });
  }
  const bmrValueEl = document.getElementById('bmr-value');
  if (bmrValueEl) {
    bmrValueEl.addEventListener('click', () => {
      window.showToast('Talk to our AI Gym Assistant (bottom right) to recalculate your BMR!', 'info');
    });
  }

  /* ---- FAQ ACCORDION LOGIC ---- */
  document.querySelectorAll('.faq-item, .faq-question').forEach(item => {
    item.addEventListener('click', () => {
      const parent = item.closest('.faq-item') || item;
      const wasActive = parent.classList.contains('active');
      
      // Close others
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      
      // Toggle current
      if (!wasActive) parent.classList.add('active');
    });
  });

  /* ---- MODAL LOGIC ---- */
  const profileModal = document.getElementById('profileModal');
  const btnOpenSettings = document.getElementById('btnOpenSettings');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const profileUpdateForm = document.getElementById('profileUpdateForm');

  if (btnOpenSettings) {
    btnOpenSettings.addEventListener('click', () => {
      profileModal.classList.remove('hidden');
      fetch('/api/user/profile').then(res => res.json()).then(user => {
        if (user.error) return;
        document.getElementById('edit-username').value = user.username || '';
        document.getElementById('edit-nickname').value = user.nickname || '';
        document.getElementById('edit-bio').value = user.bio || '';
      });
    });
  }
  if (btnCloseModal) btnCloseModal.addEventListener('click', () => profileModal.classList.add('hidden'));
  if (profileUpdateForm) {
    profileUpdateForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = profileUpdateForm.querySelector('button[type="submit"]');
      const formData = new FormData(profileUpdateForm);
      btn.disabled = true;
      try {
        const res = await fetch('/api/user/profile/update', { method: 'POST', body: formData });
        const data = await res.json();
        if (res.ok) {
          window.showToast(data.message, 'success');
          profileModal.classList.add('hidden');
          window.updateDashboardUI(data.user);
      } catch (err) { window.showToast('Network error', 'error'); } finally { btn.disabled = false; }
    });
  }

  /* ---- SECURITY TAB HANDLERS ---- */
  const changeEmailForm = document.getElementById('changeEmailForm');
  const changePasswordForm = document.getElementById('changePasswordForm');

  if (changeEmailForm) {
    changeEmailForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = changeEmailForm.querySelector('button[type="submit"]');
      const newEmailInput = changeEmailForm.querySelector('input[name="newEmail"]');
      if (!newEmailInput) return;
      const newEmail = newEmailInput.value;
      btn.disabled = true;
      try {
        const res = await fetch('/api/user/profile/change-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newEmail })
        });
        const data = await res.json();
        if (res.ok) {
          window.showToast(data.message, 'success');
          changeEmailForm.reset();
          fetch('/api/user/profile').then(r => r.json()).then(u => window.updateDashboardUI(u));
        } else { window.showToast(data.error, 'error'); }
      } catch (err) { window.showToast('Network error', 'error'); } finally { btn.disabled = false; }
    });
  }

  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = changePasswordForm.querySelector('button[type="submit"]');
      const newPasswordInput = changePasswordForm.querySelector('input[name="newPassword"]');
      if (!newPasswordInput) return;
      const newPassword = newPasswordInput.value;
      btn.disabled = true;
      try {
        const res = await fetch('/api/user/profile/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newPassword })
        });
        const data = await res.json();
        if (res.ok) {
          window.showToast(data.message, 'success');
          changePasswordForm.reset();
        } else { window.showToast(data.error, 'error'); }
      } catch (err) { window.showToast('Network error', 'error'); } finally { btn.disabled = false; }
    });
  }

});

/* ---- STYLES INJECTION ---- */
const styles = `.toast { position: fixed; bottom: 32px; right: 32px; background: #1a1a1a; color: #f5f5f5; font-family: 'Barlow', sans-serif; font-size: 14px; padding: 14px 24px; border-radius: 6px; border-left: 4px solid #f5e642; box-shadow: 0 8px 30px rgba(0,0,0,0.4); z-index: 9999; opacity: 0; transform: translateX(20px); transition: all 0.35s ease; } .toast.show { opacity: 1; transform: translateX(0); } .toast.toast-error { border-left-color: #e8392a; } .toast.toast-success { border-left-color: #f5e642; } .toast.toast-info { border-left-color: #3498db; } .hidden { display: none !important; }`;
const sTag = document.createElement('style'); sTag.textContent = styles; document.head.appendChild(sTag);

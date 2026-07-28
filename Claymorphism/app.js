/**
 * ClayAcademy - Kids Learning Website Template JS Interactions
 * Features: Synthesized Retro Audio, View Switcher, Copy-to-Clipboard, and a Mini Math Game.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. SOUND EFFECTS (Web Audio API Synthesizer)
  // ==========================================
  let soundEnabled = true;
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // Helper to play synthesized beep/pop
  function playSound(type) {
    if (!soundEnabled) return;
    
    // Resume context if suspended (browser security)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'click') {
      // Soft clay pop sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
      
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
      
      osc.start(now);
      osc.stop(now + 0.15);
    } 
    else if (type === 'correct') {
      // High pitch bell arpeggio (success)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
      
      osc.start(now);
      osc.stop(now + 0.35);
    } 
    else if (type === 'wrong') {
      // Low deflating buzzer
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.25);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
      
      osc.start(now);
      osc.stop(now + 0.25);
    }
    else if (type === 'congrats') {
      // Chiptune victory fanfare
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const noteOsc = audioCtx.createOscillator();
        const noteGain = audioCtx.createGain();
        
        noteOsc.connect(noteGain);
        noteGain.connect(audioCtx.destination);
        
        const noteTime = now + (index * 0.08);
        noteOsc.type = 'square';
        noteOsc.frequency.setValueAtTime(freq, noteTime);
        
        noteGain.gain.setValueAtTime(0.15, noteTime);
        noteGain.gain.linearRampToValueAtTime(0.01, noteTime + 0.2);
        
        noteOsc.start(noteTime);
        noteOsc.stop(noteTime + 0.2);
      });
    }
  }

  // Toggle Sound Button
  const soundToggle = document.getElementById('sound-toggle');
  if (soundToggle) {
    soundToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      soundEnabled = !soundEnabled;
      soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
      if (soundEnabled) {
        playSound('click');
      }
    });
  }

  // Play click on all clay buttons
  document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('clay-btn') && !e.target.classList.contains('clay-btn-disabled')) {
      playSound('click');
    }
    if (e.target.classList.contains('clay-card-interactive')) {
      playSound('click');
    }
  });


  // ==========================================
  // 2. VIEW SWITCHING & SMOOTH NAVIGATION
  // ==========================================
  const navItems = document.querySelectorAll('.nav-links li');
  const viewPanels = document.querySelectorAll('.view-panel');
  const logoBtn = document.getElementById('logo-btn');
  const btnBackHome = document.getElementById('btn-back-home');
  const footerStyleRef = document.getElementById('footer-style-ref');
  const footerStyleguideLink = document.getElementById('footer-styleguide-link');

  function switchToView(viewId, scrollTargetId = null) {
    // Update nav active classes
    navItems.forEach(item => {
      if (item.getAttribute('data-target') === viewId && !scrollTargetId) {
        if (viewId === 'styleguide-panel' && item.id === 'nav-styleguide') {
          item.classList.add('active');
        } else if (viewId === 'landing-panel' && item.id !== 'nav-styleguide') {
          // Highlight first nav item (Home) by default
          item.classList.remove('active');
          if (item.querySelector('a').getAttribute('href') === '#home') {
            item.classList.add('active');
          }
        } else {
          item.classList.remove('active');
        }
      } else {
        item.classList.remove('active');
      }
    });

    // Show/Hide Panels
    viewPanels.forEach(panel => {
      if (panel.id === viewId) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    // Scroll to element if requested
    if (scrollTargetId) {
      setTimeout(() => {
        const targetElement = document.getElementById(scrollTargetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Mobile Menu Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navLinksContainer = document.querySelector('.nav-links');
  
  if (menuToggle && navLinksContainer) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      playSound('click');
      navLinksContainer.classList.toggle('show');
    });

    // Close menu when clicking anywhere else
    document.addEventListener('click', (e) => {
      if (!navLinksContainer.contains(e.target) && e.target !== menuToggle) {
        navLinksContainer.classList.remove('show');
      }
    });
  }

  // Bind Navbar links
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPanel = item.getAttribute('data-target');
      const scrollId = item.getAttribute('data-scroll');
      
      // Update active nav class manually
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      switchToView(targetPanel, scrollId);
      
      // Close mobile menu
      if (navLinksContainer) {
        navLinksContainer.classList.remove('show');
      }
    });
  });

  // Bind logo
  if (logoBtn) {
    logoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchToView('landing-panel');
    });
  }

  // Bind Back to Homepage button in Style Guide
  if (btnBackHome) {
    btnBackHome.addEventListener('click', () => {
      switchToView('landing-panel');
    });
  }

  // Bind Footer links
  if (footerStyleRef) {
    footerStyleRef.addEventListener('click', (e) => {
      e.preventDefault();
      switchToView('styleguide-panel');
    });
  }
  if (footerStyleguideLink) {
    footerStyleguideLink.addEventListener('click', (e) => {
      e.preventDefault();
      switchToView('styleguide-panel');
    });
  }


  // ==========================================
  // 3. STYLE GUIDE SUB-SECTION NAVIGATION
  // ==========================================
  const styleNavBtns = document.querySelectorAll('.style-nav-btn');
  const styleguideSections = document.querySelectorAll('.styleguide-section');

  styleNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSecId = btn.getAttribute('data-sec');
      
      // Update active style of navigation buttons
      styleNavBtns.forEach(b => {
        b.classList.remove('clay-btn-white');
        b.classList.add('clay-btn-white');
      });
      btn.classList.remove('clay-btn-white'); // Makes it colored primary blue

      // Toggle display of sections
      styleguideSections.forEach(sec => {
        if (sec.id === targetSecId) {
          sec.style.display = 'block';
        } else {
          sec.style.display = 'none';
        }
      });
    });
  });


  // ==========================================
  // 4. COPY CODE SNIPPETS
  // ==========================================
  const copyBtns = document.querySelectorAll('.copy-btn');

  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetCodeId = btn.getAttribute('data-target');
      const codeElement = document.getElementById(targetCodeId);
      
      if (codeElement) {
        // Create clean code representation
        const rawCode = codeElement.textContent;
        
        navigator.clipboard.writeText(rawCode).then(() => {
          btn.textContent = 'Copied! ✓';
          btn.classList.add('copied');
          
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 2000);
        }).catch(err => {
          console.error('Could not copy code snippet: ', err);
          btn.textContent = 'Error ❌';
        });
      }
    });
  });


  // ==========================================
  // 5. MATH POP! INTERACTIVE GAME LOGIC
  // ==========================================
  const equationEl = document.getElementById('game-equation');
  const statusEl = document.getElementById('game-status');
  const scoreEl = document.getElementById('game-score');
  const progressBar = document.getElementById('game-progress');
  const optionBtns = document.querySelectorAll('.game-opt');
  const starsCounterText = document.getElementById('stars-count');

  let currentAnswer = 0;
  let gameScore = 0;
  const targetWinScore = 3;
  let isGameOver = false;

  // Generate equation
  function generateNewQuestion() {
    if (isGameOver) return;
    
    // Reset option states
    optionBtns.forEach(btn => {
      btn.classList.remove('clay-btn-secondary', 'clay-btn-danger', 'clay-btn-white');
      btn.classList.add('clay-btn-white');
      btn.style.transform = '';
      btn.disabled = false;
    });
    statusEl.textContent = 'Tap the right clay bubble!';
    statusEl.style.color = 'var(--text-medium)';

    // Math operation (addition or subtraction)
    const op = Math.random() > 0.5 ? '+' : '-';
    let num1, num2;
    
    if (op === '+') {
      num1 = Math.floor(Math.random() * 6) + 1; // 1-6
      num2 = Math.floor(Math.random() * 5) + 1; // 1-5
      currentAnswer = num1 + num2;
    } else {
      num1 = Math.floor(Math.random() * 6) + 5; // 5-11
      num2 = Math.floor(Math.random() * 4) + 1; // 1-4
      currentAnswer = num1 - num2;
    }

    equationEl.textContent = `${num1} ${op} ${num2}`;

    // Options generation (one correct, two close incorrect)
    const options = [currentAnswer];
    while (options.length < 3) {
      const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      const wrongOpt = currentAnswer + offset;
      if (wrongOpt >= 0 && !options.includes(wrongOpt)) {
        options.push(wrongOpt);
      }
    }

    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    // Apply values to buttons
    optionBtns.forEach((btn, index) => {
      btn.textContent = options[index];
      btn.setAttribute('data-val', options[index]);
    });
  }

  // Answer selection handler
  optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const chosenVal = parseInt(btn.getAttribute('data-val'));
      
      // Disable options during animation delay
      optionBtns.forEach(b => b.disabled = true);

      if (chosenVal === currentAnswer) {
        // Success
        playSound('correct');
        btn.classList.remove('clay-btn-white');
        btn.classList.add('clay-btn-secondary'); // Green color
        btn.style.transform = 'scale(1.1)';
        statusEl.textContent = '⭐ Awesome Job! ⭐';
        statusEl.style.color = 'var(--clay-green)';
        
        gameScore++;
        scoreEl.textContent = gameScore;
        
        // Update main topbar star count
        const currentStars = parseInt(starsCounterText.textContent);
        starsCounterText.textContent = currentStars + 1;
        starsCounterText.style.transform = 'scale(1.3)';
        setTimeout(() => starsCounterText.style.transform = '', 200);

        // Update progress bar
        const progressPercentage = (gameScore / targetWinScore) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        if (gameScore >= targetWinScore) {
          // Game Completed
          isGameOver = true;
          setTimeout(() => {
            playSound('congrats');
            showModal('Congratulations!', `Fantastic math skills! You answered all ${targetWinScore} equations correctly. Here is your Golden Trophy! 🏆`);
            resetGame();
          }, 800);
        } else {
          // Load next question
          setTimeout(generateNewQuestion, 1500);
        }
      } else {
        // Failure
        playSound('wrong');
        btn.classList.remove('clay-btn-white');
        btn.classList.add('clay-btn-danger'); // Pink/Red color
        btn.style.transform = 'translateX(5px)';
        statusEl.textContent = 'Oops! Try again next time!';
        statusEl.style.color = 'var(--clay-pink)';
        
        // Highlight correct option
        optionBtns.forEach(b => {
          if (parseInt(b.getAttribute('data-val')) === currentAnswer) {
            b.classList.remove('clay-btn-white');
            b.classList.add('clay-btn-secondary');
          }
        });

        setTimeout(generateNewQuestion, 1800);
      }
    });
  });

  function resetGame() {
    gameScore = 0;
    scoreEl.textContent = gameScore;
    progressBar.style.width = '0%';
    isGameOver = false;
    generateNewQuestion();
  }

  // Initialize first game question
  generateNewQuestion();


  // ==========================================
  // 6. MODALS OVERLAYS CONTROLLER
  // ==========================================
  const modalOverlay = document.getElementById('main-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalText = document.getElementById('modal-text');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  function showModal(title, text) {
    if (modalOverlay) {
      modalTitle.textContent = title;
      modalText.textContent = text;
      modalOverlay.classList.add('active');
    }
  }

  function hideModal() {
    if (modalOverlay) {
      playSound('click');
      modalOverlay.classList.remove('active');
    }
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', hideModal);
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      hideModal();
    }
  });

  // Modal triggers on site buttons
  const btnHeroStart = document.getElementById('btn-hero-start');
  const btnHeroTour = document.getElementById('btn-hero-tour');
  const btnLogin = document.getElementById('btn-login');
  const btnPremium = document.getElementById('btn-pricing-premium');
  const btnFree = document.getElementById('btn-pricing-free');
  
  if (btnHeroStart) {
    btnHeroStart.addEventListener('click', () => {
      switchToView('landing-panel', 'game-section');
    });
  }

  if (btnHeroTour) {
    btnHeroTour.addEventListener('click', () => {
      showModal('Welcome to ClayAcademy! 🎈', 'We have set up this website preview so you can interact with clay elements. Look around the homepage, play the Math Pop game, or open the Style Guide tab in the navigation bar above to view the exact HTML/CSS snippets!');
    });
  }

  const navLoginMobile = document.getElementById('nav-login-mobile');

  if (btnLogin) {
    btnLogin.addEventListener('click', () => {
      showModal('Sign In Portal 🔑', 'This kids-safe sign in form is mock-active! In production, this can connect to Firebase or your local backend. Check the Form Inputs section in the Style Guide to see the components.');
    });
  }

  if (navLoginMobile) {
    navLoginMobile.addEventListener('click', (e) => {
      e.preventDefault();
      showModal('Sign In Portal 🔑', 'This kids-safe sign in form is mock-active! In production, this can connect to Firebase or your local backend. Check the Form Inputs section in the Style Guide to see the components.');
    });
  }

  if (btnPremium) {
    btnPremium.addEventListener('click', () => {
      showModal('Super Scholar Premium 🌟', 'Unlocked unlimited access to math island, gravity science explorer, art lab, and 50+ worksheets. Mock-subscription checkout completed!');
    });
  }

  if (btnFree) {
    btnFree.addEventListener('click', () => {
      showModal('Current Subscription 🧭', 'You are currently browsing under the Explorer Free Account. Head to the game section below to try the active equations!');
    });
  }

  // Interactive popup inside Style Guide
  const btnTriggerModal = document.getElementById('btn-trigger-modal');
  if (btnTriggerModal) {
    btnTriggerModal.addEventListener('click', () => {
      showModal('Style Guide Modal 🔮', 'This is a sample claymorphic modal dialog. It has a high border-radius, soft backdrop filter blur, and bouncy scaling animations.');
    });
  }

  // ==========================================
  // 7. INTERACTIVE FILTERS FOR COURSE EXPLORER
  // ==========================================
  const filterBtns = document.querySelectorAll('.course-filter-btn');
  const courseCards = document.querySelectorAll('.course-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-category');
      
      // Play Click sound
      playSound('click');

      // Update button active state
      filterBtns.forEach(b => {
        b.classList.remove('clay-btn-white');
        b.classList.add('clay-btn-white');
      });
      btn.classList.remove('clay-btn-white');

      // Toggle display of course cards
      courseCards.forEach(card => {
        const cardSubject = card.getAttribute('data-subject');
        
        if (category === 'all' || cardSubject === category) {
          card.style.display = 'flex';
          card.classList.add('pop-in');
          setTimeout(() => card.classList.remove('pop-in'), 400);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

});

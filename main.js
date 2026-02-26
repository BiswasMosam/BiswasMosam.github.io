// Section fade-in on scroll
const sections = document.querySelectorAll('section');
const options = { threshold: 0.1 };
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, options);
sections.forEach(section => {
  observer.observe(section);
});

// Typing effect for hero section
const text = '> Hi, I\'m Mosam Biswas';
const typingElement = document.getElementById('typing-text');
let index = 0;
function type() {
  if (!typingElement) return;
  if (typingElement.dataset.typingStarted !== '1') typingElement.dataset.typingStarted = '1';
  if (index === 0) typingElement.textContent = '';
  if (index < text.length) {
    typingElement.textContent = text.slice(0, index + 1);
    index++;
    setTimeout(type, 100);
    return;
  }

  setTimeout(() => {
    index = 0;
    type();
  }, 10000);
}
window.addEventListener('load', type);

// Secret double-click on "Mosam Biswas" opens photography page (guard if element missing)
const mosamLink = document.getElementById('mosam-link');
if (mosamLink) {
  mosamLink.ondblclick = function() {
    window.open('sheichobi/sheichobi.html', '_blank');
  };
}

// Certificate modal logic
function openCertModal(src, altText) {
  const modal = document.getElementById('certModal');
  const modalImg = document.getElementById('certModalImg');
  if (!modal || !modalImg) return;

  modalImg.src = src;
  if (altText) modalImg.alt = altText;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closeCertModal() {
  const modal = document.getElementById('certModal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
}
const certModal = document.getElementById('certModal');
if (certModal) {
  certModal.onclick = function(e) {
    if (e.target === this) closeCertModal();
  };
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeCertModal();
});

// Contact: copy Gmail address
document.addEventListener('click', async (e) => {
  const copyBtn = e.target && e.target.closest ? e.target.closest('.contact-pill__copy') : null;
  if (!copyBtn) return;

  e.preventDefault();
  e.stopPropagation();

  const textToCopy = copyBtn.getAttribute('data-copy') || '';
  if (!textToCopy) return;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(textToCopy);
    } else {
      const temp = document.createElement('textarea');
      temp.value = textToCopy;
      temp.setAttribute('readonly', '');
      temp.style.position = 'absolute';
      temp.style.left = '-9999px';
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    }

    if (!copyBtn.dataset.originalHtml) copyBtn.dataset.originalHtml = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fa-solid fa-copy" aria-hidden="true"></i><span>Copied</span>';
    setTimeout(() => {
      copyBtn.innerHTML = copyBtn.dataset.originalHtml || '<i class="fa-solid fa-copy" aria-hidden="true"></i><span>Copy</span>';
    }, 900);
  } catch {
    // no-op
  }
});

function blobPath(cx, cy, r, t, points = 32, wobble = 13, freq = 1.9) {
  let d = '';
  for (let i = 0; i < 360; i += 360 / points) {
    let rad = (i * Math.PI) / 180;
    let offset = Math.sin(rad * freq + t) * wobble;
    let x = cx + Math.cos(rad) * (r + offset);
    let y = cy + Math.sin(rad) * (r + offset);
    d += (i === 0 ? 'M' : 'L') + x + ',' + y + ' ';
  }
  d += 'Z';
  return d;
}

function animateBlobs() {
  const t = Date.now() / 900;
  document.getElementById('blob1').setAttribute('d', blobPath(320 + Math.sin(t)*70, 220 + Math.cos(t/2.9)*40, 120, t));
  document.getElementById('blob2').setAttribute('d', blobPath(700 + Math.cos(t/2)*60, 400 + Math.sin(t/2.9)*60, 140, t+2));
  document.getElementById('blob3').setAttribute('d', blobPath(500 + Math.sin(t/1.5)*50, 600 + Math.cos(t/2.9)*50, 100, t+4));
  document.getElementById('blob4').setAttribute('d', blobPath(900 + Math.sin(t/1.3)*50, 200 + Math.cos(t/2.9)*50, 90, t+6));
  document.getElementById('blob5').setAttribute('d', blobPath(200 + Math.cos(t/1.7)*60, 650 + Math.sin(t/2.9)*60, 80, t+8));
  document.getElementById('blob6').setAttribute('d', blobPath(600 + Math.sin(t/1.2)*55, 150 + Math.cos(t/2.9)*55, 85, t+10));
  // Move silver blob to right bottom area
  document.getElementById('blob7').setAttribute('d', blobPath(1050 + Math.sin(t/1.4)*70, 500 + Math.cos(t/2.9)*70, 75, t+12));
  requestAnimationFrame(animateBlobs);
}
// Start animation only if blobs are present to avoid null errors
if (document.getElementById('blob1')) {
  animateBlobs();
}

document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            alert("Right-click is disabled on this website.");
        });

function initProjectsFanDeck() {
  const section = document.querySelector('[data-projects-fan]');
  const viewport = section ? section.querySelector('[data-projects-control]') : null;
  const deck = section ? section.querySelector('[data-projects-deck]') : null;
  const cards = deck ? Array.from(deck.querySelectorAll('[data-project-card]')) : [];

  if (!section || !viewport || !deck || cards.length < 3) return;

  const wrap = (value, size) => ((value % size) + size) % size;
  const easeInOut = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
  const shortestSignedDelta = (index, center, total) => {
    let delta = index - center;
    if (delta > total / 2) delta -= total;
    if (delta < -total / 2) delta += total;
    return delta;
  };

  cards.forEach((card, index) => {
    card.style.setProperty('--card-order', String(index));
  });

  let centerIndex = Math.floor(cards.length / 2);
  let centerFloat = centerIndex;
  let direction = 1;
  let isControlMode = false;
  let isHoverPaused = false;
  let phase = 'hold';
  let phaseElapsed = 0;
  let lastTimestamp = 0;
  let rafId = null;

  const NORMAL_HOLD_MS = 10000;
  const NORMAL_MOVE_MS = 900;
  const CONTROL_MOVE_MS = 2000;

  const renderDeck = (activeCenter, centerHovered = false) => {
    const spread = Math.max(90, Math.min(170, viewport.clientWidth * 0.19));
    const lift = Math.max(14, Math.min(28, viewport.clientHeight * 0.06));

    cards.forEach((card, index) => {
      const delta = shortestSignedDelta(index, activeCenter, cards.length);
      const absDelta = Math.abs(delta);

      card.classList.remove('is-center', 'is-side-1', 'is-side-2', 'is-left', 'is-right');

      if (absDelta > 2.6) {
        card.style.opacity = '0';
        card.style.pointerEvents = 'none';
        card.style.transform = 'translate3d(-50%, -50%, -320px) scale(0.6)';
        card.style.zIndex = '0';
        return;
      }

      const x = delta * spread;
      const y = Math.pow(absDelta, 1.45) * lift;
      const rotate = delta * 14;
      let scale = 1 - absDelta * 0.12;
      const z = 320 - absDelta * 120;
      const opacity = 1 - absDelta * 0.16;

      if (absDelta < 0.5) {
        card.classList.add('is-center');
        card.style.pointerEvents = 'auto';
        if (centerHovered) scale += 0.06;
      } else if (absDelta < 1.5) {
        card.classList.add('is-side-1');
        card.style.pointerEvents = 'none';
      } else {
        card.classList.add('is-side-2');
        card.style.pointerEvents = 'none';
      }

      card.classList.add(delta < 0 ? 'is-left' : 'is-right');
      card.style.opacity = String(Math.max(0.25, opacity));
      card.style.zIndex = String(Math.round(100 - absDelta * 18));
      card.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) rotate(${rotate}deg) scale(${Math.max(0.72, scale)})`;
    });
  };

  const restartMovePhase = () => {
    centerIndex = wrap(Math.round(centerFloat), cards.length);
    centerFloat = centerIndex;
    phase = 'move';
    phaseElapsed = 0;
  };

  const tick = (timestamp) => {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    if (isHoverPaused) {
      renderDeck(centerIndex, true);
      rafId = requestAnimationFrame(tick);
      return;
    }

    phaseElapsed += delta;

    if (phase === 'hold') {
      centerFloat = centerIndex;
      renderDeck(centerFloat, false);

      if (isControlMode) {
        phase = 'move';
        phaseElapsed = 0;
      } else if (phaseElapsed >= NORMAL_HOLD_MS) {
        phase = 'move';
        phaseElapsed = 0;
      }
    } else {
      const moveDuration = isControlMode ? CONTROL_MOVE_MS : NORMAL_MOVE_MS;
      const progress = Math.min(phaseElapsed / moveDuration, 1);
      const eased = easeInOut(progress);
      centerFloat = centerIndex + direction * eased;
      renderDeck(centerFloat, false);

      if (progress >= 1) {
        centerIndex = wrap(centerIndex + direction, cards.length);
        centerFloat = centerIndex;

        if (isControlMode) {
          phase = 'move';
          phaseElapsed = 0;
        } else {
          phase = 'hold';
          phaseElapsed = 0;
        }
      }
    }

    rafId = requestAnimationFrame(tick);
  };

  cards.forEach((card) => {
    const links = Array.from(card.querySelectorAll('a[href]'));

    links.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
      });

      link.addEventListener('pointerdown', () => {
        if (!card.classList.contains('is-center')) return;
        isHoverPaused = true;
        section.classList.add('projects-fan--paused');
      });

      link.addEventListener('mouseenter', () => {
        if (!card.classList.contains('is-center')) return;
        isHoverPaused = true;
        section.classList.add('projects-fan--paused');
      });

      link.addEventListener('mouseleave', () => {
        if (!isHoverPaused) return;
        isHoverPaused = false;
        section.classList.remove('projects-fan--paused');
        lastTimestamp = performance.now();
      });
    });

    card.addEventListener('mouseenter', () => {
      if (!card.classList.contains('is-center')) return;
      isHoverPaused = true;
      section.classList.add('projects-fan--paused');
    });

    card.addEventListener('click', () => {
      if (!card.classList.contains('is-center')) return;

      const link = card.querySelector('.project-fan-card__body a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      const target = link.getAttribute('target');
      if (!href) return;

      if (target === '_blank') {
        window.open(href, '_blank', 'noopener,noreferrer');
        return;
      }

      window.location.assign(href);
    });

    card.addEventListener('mouseleave', () => {
      if (!isHoverPaused) return;
      isHoverPaused = false;
      section.classList.remove('projects-fan--paused');
      lastTimestamp = performance.now();
    });
  });

  viewport.addEventListener('mousemove', (event) => {
    const bounds = viewport.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left) / bounds.width;

    if (ratio < 0.38) {
      if (direction !== -1 || !isControlMode) {
        direction = -1;
        isControlMode = true;
        restartMovePhase();
      }
      return;
    }

    if (ratio > 0.62) {
      if (direction !== 1 || !isControlMode) {
        direction = 1;
        isControlMode = true;
        restartMovePhase();
      }
      return;
    }

    isControlMode = false;
  });

  viewport.addEventListener('mouseleave', () => {
    isControlMode = false;
  });

  const startRotation = () => {
    if (rafId) cancelAnimationFrame(rafId);
    phase = 'hold';
    phaseElapsed = 0;
    lastTimestamp = 0;
    section.classList.add('projects-fan--active');
    renderDeck(centerIndex, false);
    rafId = requestAnimationFrame(tick);
  };

  const revealObserver = new IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        section.classList.add('projects-fan--entered');
        observerInstance.unobserve(section);

        setTimeout(() => {
          startRotation();
        }, 1200);
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px'
    }
  );

  revealObserver.observe(section);
}

/*

                              ::::::::::::::::::::                              
                        -::::::::::::::::::::::::::::::-                        
                     ::::::::::::::::::::::::::::::::::::::-                    
                  :::::-+%@@+::::::::::::::::::::::-%#+-::::::-                 
               :::::=%@@@@@@@-:::::::::::::::::::::%@@@@@%=:::::-               
             :::::#@@@@@@@@#::::-*%@@@@@@@@@@@*-:::*@@@@@@@@@=::::-             
           ::::-%@@@@@@@@=:::*@@@@@@@@@@@@@@@@@@@@*:::#@@@@@@@@+::::-           
         :::::#@@@@@@@@+::-%@@@@@@@@@@@@@@@@@@@@@@@@%-:-#@@@@@@@@+::::=         
        ::::+@@@@@@@@%-:-%@@@@@@@@@@@@@@@@@@@@@@@@@@@@%-:=%@@@@@@@%-:::-        
       ::::*@@@@@@@@*::+@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@+::#@@@@@@@@+::::+      
     ::::-%@@@@@@@@*::*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*::%@@@@@@@@#::::=     
    :::::%@@@@@@@@#::+@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@+::#@@@@@@@@#::::=    
    ::::%@@@@@@@@@-:=@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@=:=@@@@@@@@@#::::@   
   ::::*@@@@@@@@@*::*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#::*@@@@@@@@@+::::+  
  ::::+@@@@@@@@@@-::%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%::-@@@@@@@@@@=:::-  
 :::::%@@@@@@@@@%-::@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@-::%@@@@@@@@@#::::+ 
 ::::+@@@@@@@@@@%-::@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@:::%@@@@@@@@@@=:::: 
:::::@@@@@@@@@@@%-::%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%:::%@@@@@@@@@@%::::-
::::=@@@@@@@@@@@@-::*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#::-%@@@@@@@@@@@=:::=
::::+@@@@@@@@@@@@*::=@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@=::+@@@@@@@@@@@@*:::=
::::*@@@@@@@@@@@@@-::+@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@+:::%@@@@@@@@@@@@#:::-
::::#@@@@@@@@@@@@@*:::*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*:::+@@@@@@@@@@@@@#::::
::::#@@@@@@@@@@@@@@=:::=@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@+::::%@@@@@@@@@@@@@#::::
::::*@@@@@@@@@@@@@@@-::::#@@@@@@@@@@@@@@@@@@@@@@@@@@@@%:::::%@@@@@@@@@@@@@@#:::-
::::+@@@@@@@@@@@@%-:::::::-%@@@@@@@@@@@@@@@@@@@@@@@@%-:::::::*@@@@@@@@@@@@@*:::-
::::=@@@@@@@@@%=:::::::::::::+@@@@@@@@@@@@@@@@@@@@@@@%-::::::::-#@@@@@@@@@@+:::=
:::::%@@@@@@+:::::::::::::::::::-+%@@@@@@@@@@%+-:=%@@@@%-:::::::::=%@@@@@@@::::=
 ::::-%@@#-::::::::::::::::::::::::::::::::::::::::=%@@@@%+:::::::::-+%@@@+::::# 
 -::::==::::::::::::-#-::::::::::::::::::::::::::::::-#@@@@@*::::::::::-##::::+ 
  ::::::::::::::::=@@@@@#-::::::::::::::::::::::::::::::*@@@@@#-:::::::::::::-  
   :::::::::::::*@@@@@@@@@@@*-:::::::::::::::::::=*:::::::+%@@@@%-:::::::::::*  
    :::::::::-%@@@@@*::+%@@@@@@@@%#+-:::::-=*%%@@@@@#:::::::-%@@@@%=::::::::%   
    -::::::+%@@@@%=:::::::-+%@@@@@@@@@@@@@@@@@@@@@%=::::::::::-#@@@@@*:::::=    
     -:::*@@@@@#-::::::::::::::-=+#%@@@@@@@%#*=-:::::::::::::::#@@@@*:::::+     
      -*@@@@@*::::::::::::::::::::::::::::::::::::::::::::::-#@@@@%-::::-*      
        #@%=:::::::::--:::::::::::::::::::::::::::::::::::=%@@@@%=:::::-        
         :::::::::::#@@@#-:::::::::::::::::::::::::::::=%@@@@@%=::::::+         
           -:::::::=@@@@@@@@%+:::::::::::::::::::::+%@@@@@@@%-::::::=           
             :::::::::=%@@@@@@@@@%%%#**+++**#%%%@@@@@@@@@%=:::::::=             
               -::::::::::=*%@@@@@@@@@@@@@@@@@@@@@@@@%+-::::::::=               
                 =:::::::::::::-=+*#%%@@@@@@%%#*+=-::::::::::-+                 
                    =-::::::::::::::::::::::::::::::::::::-+                    
                        =-::::::::::::::::::::::::::::-*                        
                              +-::::::::::::::::-+                              

*/
// 3D Model viewer enhancements
let currentAnimationIndex = 0;
let availableAnimations = [];

// Function to play greeting animation
function playGreeting() {
  const modelViewer = document.getElementById('about-3d-model');
  if (!modelViewer) return;
  
  if (availableAnimations.length > 0) {
    // Play the first animation or cycle through them
    const animationName = availableAnimations[currentAnimationIndex];
    modelViewer.animationName = animationName;
    modelViewer.play();
    
    // Cycle to next animation for next click
    currentAnimationIndex = (currentAnimationIndex + 1) % availableAnimations.length;
    
    // Pause auto-rotate while animating
    modelViewer.autoRotate = false;
    
    // Resume auto-rotate after animation
    setTimeout(() => {
      modelViewer.autoRotate = true;
    }, 3000);
  } else {
    // If no animations, do a fun camera movement
    animateCamera();
  }
}

// Animate camera as fallback
function animateCamera() {
  const modelViewer = document.getElementById('about-3d-model');
  if (!modelViewer) return;
  
  const originalOrbit = modelViewer.getCameraOrbit();
  
  // Zoom in and rotate
  modelViewer.cameraOrbit = '45deg 75deg 80%';
  
  setTimeout(() => {
    modelViewer.cameraOrbit = '-45deg 75deg 80%';
  }, 500);
  
  setTimeout(() => {
    modelViewer.cameraOrbit = '0deg 75deg 105%';
  }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  initProjectsFanDeck();

  const modelViewer = document.getElementById('about-3d-model');
  
  if (modelViewer) {
    // Add loading complete event
    modelViewer.addEventListener('load', () => {
      console.log('3D Model loaded successfully!');
      
      // Get available animations
      availableAnimations = modelViewer.availableAnimations || [];
      console.log('Available animations:', availableAnimations);
      
      // Auto-play first animation on load
      if (availableAnimations.length > 0) {
        setTimeout(() => {
          playGreeting();
        }, 1000);
      }
    });

    // Add error handling
    modelViewer.addEventListener('error', (event) => {
      console.error('Failed to load 3D model:', event);
    });

    // Add interaction events for enhanced UX
    modelViewer.addEventListener('camera-change', () => {
      // Model is being interacted with
      modelViewer.style.filter = 'drop-shadow(0 0 30px rgba(124, 58, 237, 0.6))';
    });

    // Reset glow after interaction
    let interactionTimeout;
    modelViewer.addEventListener('camera-change', () => {
      clearTimeout(interactionTimeout);
      interactionTimeout = setTimeout(() => {
        modelViewer.style.filter = '';
      }, 1000);
    });

    // Add touch/click visual feedback
    modelViewer.addEventListener('mousedown', () => {
      modelViewer.style.transform = 'scale(0.98)';
      modelViewer.style.transition = 'transform 0.1s ease';
    });

    modelViewer.addEventListener('mouseup', () => {
      modelViewer.style.transform = 'scale(1)';
    });
  }

  // Badge hover effects with ripple
  const badges = document.querySelectorAll('.about a[style*="border-radius: 9999px"]');
  badges.forEach(badge => {
    badge.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-3px) scale(1.05)';
    });
    badge.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Education cards parallax effect on hover
  const eduCards = document.querySelectorAll('.about div[style*="border: 2px solid"]');
  eduCards.forEach(card => {
    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(10px) scale(1.02)`;
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });
});
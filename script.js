/* ==========================================================================
   ODESY WEBSITE - INTERACTIVE JAVASCRIPT CONTROLLER (v5 REFINEMENTS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  /* ------------------------------------------------------------------------
     1. DUAL CURSOR SYSTEM (ZERO-DELAY DOT + LAGGING DIFFERENCE CIRCLE)
     ------------------------------------------------------------------------ */
  const cursorDot = document.getElementById('custom-cursor-dot');
  const cursorCircle = document.getElementById('custom-cursor-circle');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let circleX = mouseX;
  let circleY = mouseY;
  let isHovered = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Immediate zero-delay dot update
    if (cursorDot) {
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }
  });

  // Smooth lerp trailing lag loop for circle
  function animateDualCursor() {
    circleX += (mouseX - circleX) * 0.15;
    circleY += (mouseY - circleY) * 0.15;
    
    if (cursorCircle) {
      cursorCircle.style.transform = `translate3d(${circleX}px, ${circleY}px, 0) translate(-50%, -50%) scale(${isHovered ? 1.5 : 1})`;
    }
    requestAnimationFrame(animateDualCursor);
  }
  requestAnimationFrame(animateDualCursor);

  function attachCursorEvents() {
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .interactive, .phase-card, .client-cell, .testimonial-card, .faq-nav-btn, .team-nav-btn, .interest-chip, .project-card, .social-unit, .faq-card, .video-audio-toggle');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => { isHovered = true; });
      el.addEventListener('mouseleave', () => { isHovered = false; });
    });
  }
  attachCursorEvents();

  /* ------------------------------------------------------------------------
     2. FLOATING CUSTOM SCROLLBAR (ARRASTRABLE & CLIC EN TRACK)
     ------------------------------------------------------------------------ */
  const scrollbarThumb = document.getElementById('floating-scrollbar-thumb');
  const scrollbarTrack = document.getElementById('floating-scrollbar-track');
  let isDraggingScrollbar = false;

  function updateFloatingScrollbar() {
    if (!scrollbarThumb || !scrollbarTrack || isDraggingScrollbar) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;
    const scrollP = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    const trackHeight = scrollbarTrack.offsetHeight;
    const thumbHeight = scrollbarThumb.offsetHeight;
    const maxThumbTravel = trackHeight - thumbHeight;
    scrollbarThumb.style.transform = `translateY(${scrollP * maxThumbTravel}px)`;
  }

  function scrollByTrackPosition(clientY) {
    if (!scrollbarTrack || !scrollbarThumb) return;
    const trackRect = scrollbarTrack.getBoundingClientRect();
    const thumbHeight = scrollbarThumb.offsetHeight;
    const maxThumbTravel = trackRect.height - thumbHeight;
    if (maxThumbTravel <= 0) return;

    // Calcular posición centrando el thumb en el cursor
    let clickPos = clientY - trackRect.top - (thumbHeight / 2);
    let boundedPos = Math.max(0, Math.min(maxThumbTravel, clickPos));
    let progress = boundedPos / maxThumbTravel;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: progress * maxScroll,
      behavior: 'auto'
    });
    scrollbarThumb.style.transform = `translateY(${boundedPos}px)`;
  }

  if (scrollbarTrack && scrollbarThumb) {
    // Arrastre al hacer clic sostenido en el indicador (thumb)
    scrollbarThumb.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      isDraggingScrollbar = true;
      scrollbarTrack.classList.add('is-dragging');
      document.body.style.userSelect = 'none';
    });

    // Salto directo al hacer clic en cualquier punto del riel (track)
    scrollbarTrack.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDraggingScrollbar = true;
      scrollbarTrack.classList.add('is-dragging');
      document.body.style.userSelect = 'none';
      scrollByTrackPosition(e.clientY);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDraggingScrollbar) return;
      e.preventDefault();
      scrollByTrackPosition(e.clientY);
    });

    window.addEventListener('mouseup', () => {
      if (isDraggingScrollbar) {
        isDraggingScrollbar = false;
        scrollbarTrack.classList.remove('is-dragging');
        document.body.style.userSelect = '';
        updateFloatingScrollbar();
      }
    });

    // Soporte táctil en caso de uso en pantalla táctil
    scrollbarTrack.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        isDraggingScrollbar = true;
        scrollbarTrack.classList.add('is-dragging');
        scrollByTrackPosition(e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isDraggingScrollbar && e.touches.length > 0) {
        scrollByTrackPosition(e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (isDraggingScrollbar) {
        isDraggingScrollbar = false;
        scrollbarTrack.classList.remove('is-dragging');
        updateFloatingScrollbar();
      }
    });
  }

  /* ------------------------------------------------------------------------
     3. HERO TITLE DYNAMIC WORD TYPEWRITER & BACKSPACE ROTATOR
     ------------------------------------------------------------------------ */
  const words = [
    'Marketing',
    'Diseño',
    'Estrategia',
    'Branding',
    'Contenido',
    'Innovación',
    'Tecnología',
    'Resultados'
  ];
  let wordIndex = 0;
  let charIndex = words[0].length;
  let isDeleting = true;
  const dynamicWordEl = document.getElementById('dynamic-word');

  function typeWriterStep() {
    if (!dynamicWordEl) return;

    const currentWord = words[wordIndex];

    if (isDeleting) {
      // Backspace letter by letter from end
      dynamicWordEl.textContent = currentWord.substring(0, charIndex);
      if (charIndex > 0) {
        charIndex--;
        setTimeout(typeWriterStep, 50);
      } else {
        // Finished deleting, move to next word and start typing
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(typeWriterStep, 220);
      }
    } else {
      // Type letter by letter left to right
      dynamicWordEl.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex < currentWord.length) {
        setTimeout(typeWriterStep, 95);
      } else {
        // Finished typing full word, pause 1.8s before deleting
        isDeleting = true;
        setTimeout(typeWriterStep, 1800);
      }
    }
  }

  // Initial pause on 'Marketing' then begin deleting after 1.8 seconds
  setTimeout(typeWriterStep, 1800);

  /* ------------------------------------------------------------------------
     4. HERO VIDEO AUDIO MUTE / UNMUTE TOGGLE
     ------------------------------------------------------------------------ */
  const heroVideo = document.getElementById('hero-video');
  const videoAudioToggle = document.getElementById('video-audio-toggle');
  const iconMuted = document.getElementById('icon-muted');
  const iconUnmuted = document.getElementById('icon-unmuted');

  if (videoAudioToggle && heroVideo) {
    videoAudioToggle.addEventListener('click', () => {
      heroVideo.muted = !heroVideo.muted;
      if (heroVideo.muted) {
        iconMuted.style.display = 'block';
        iconUnmuted.style.display = 'none';
      } else {
        iconMuted.style.display = 'none';
        iconUnmuted.style.display = 'block';
      }
    });
  }

  /* ------------------------------------------------------------------------
     5. NAVBAR AUTO-HIDE ON SCROLL DOWN & REVEAL ON SCROLL UP
     ------------------------------------------------------------------------ */
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    let currentScrollY = window.scrollY;

    if (currentScrollY > 40) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }

    if (currentScrollY > lastScrollY && currentScrollY > 90) {
      navbar.classList.add('navbar-hidden');
    } else if (currentScrollY < lastScrollY) {
      navbar.classList.remove('navbar-hidden');
    }

    lastScrollY = currentScrollY;
    updateFloatingScrollbar();
  }, { passive: true });

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
    });

    const mobileLinks = mobileMenu.querySelectorAll('a, button');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. PINNED SECTION 1: METODOLOGÍA (COLOR SCRUB + EXTENDED CARDS)
     ------------------------------------------------------------------------ */
  const metTrigger = document.getElementById('metodologia-trigger');
  const metBg = document.getElementById('metodologia-bg');
  const metIsotipo = document.getElementById('metodologia-isotipo');
  const phrase1 = document.getElementById('phrase-1');
  const phrase2 = document.getElementById('phrase-2');
  const phrase3 = document.getElementById('phrase-3');
  const phaseCards = document.querySelectorAll('.phase-card');

  function interpolateColor(color1, color2, factor) {
    let result = color1.slice();
    for (let i = 0; i < 3; i++) {
      result[i] = Math.round(result[i] + factor * (color2[i] - result[i]));
    }
    return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
  }

  function updateMetodologiaScroll() {
    if (!metTrigger) return;

    const rect = metTrigger.getBoundingClientRect();
    const triggerHeight = metTrigger.offsetHeight - window.innerHeight;
    const scrollDistance = -rect.top;

    let progress = Math.max(0, Math.min(1, scrollDistance / triggerHeight));

    // STAGE 1: Isotipo Scale & Initial Background Fade (Progress 0.0 -> 0.15)
    if (progress <= 0.15) {
      let stageProgress = progress / 0.15;
      let scale = 1 + (stageProgress * 3.8);
      let opacity = stageProgress;
      
      if (metIsotipo) {
        metIsotipo.style.transform = `scale(${scale})`;
        metIsotipo.style.opacity = Math.max(0, 1 - (stageProgress * 0.85));
      }
      if (metBg) {
        metBg.style.opacity = opacity;
        metBg.style.backgroundColor = 'rgb(245, 162, 3)';
      }
    } else {
      if (metIsotipo) metIsotipo.style.opacity = 0;
      if (metBg) metBg.style.opacity = 1;

      // CONTINUOUS SCROLL COLOR SCRUBBING across cards (Progress 0.15 -> 1.0)
      let colorP = (progress - 0.15) / 0.85;
      let currentColor;
      const rgbOrange = [245, 162, 3];
      const rgbMagenta = [229, 8, 126];
      const rgbPurple = [120, 63, 145];

      if (colorP <= 0.5) {
        let subP = colorP / 0.5;
        currentColor = interpolateColor(rgbOrange, rgbMagenta, subP);
      } else {
        let subP = (colorP - 0.5) / 0.5;
        currentColor = interpolateColor(rgbMagenta, rgbPurple, subP);
      }

      if (metBg) metBg.style.backgroundColor = currentColor;
    }

    // STAGE 2: 3 Pinned Phrases Sequence (Progress 0.12 -> 0.44)
    if (progress > 0.12 && progress <= 0.22) {
      let p1Progress = (progress - 0.12) / 0.10;
      let p1Opacity = Math.sin(p1Progress * Math.PI);
      if (phrase1) {
        phrase1.style.opacity = p1Opacity;
        phrase1.style.transform = `translate(-50%, -50%) scale(${0.96 + (p1Progress * 0.08)})`;
      }
    } else {
      if (phrase1) phrase1.style.opacity = 0;
    }

    if (progress > 0.22 && progress <= 0.32) {
      let p2Progress = (progress - 0.22) / 0.10;
      let p2Opacity = Math.sin(p2Progress * Math.PI);
      if (phrase2) {
        phrase2.style.opacity = p2Opacity;
        phrase2.style.transform = `translate(-50%, -50%) scale(${0.96 + (p2Progress * 0.08)})`;
      }
    } else {
      if (phrase2) phrase2.style.opacity = 0;
    }

    if (progress > 0.32 && progress <= 0.44) {
      let p3Progress = (progress - 0.32) / 0.12;
      let p3Opacity = Math.sin(p3Progress * Math.PI);
      if (phrase3) {
        phrase3.style.opacity = p3Opacity;
        phrase3.style.transform = `translate(-50%, -50%) scale(${0.96 + (p3Progress * 0.08)})`;
      }
    } else {
      if (phrase3) phrase3.style.opacity = 0;
    }

    // STAGE 3: Stacked Cards Deck with Extended Display Scroll Duration (Progress 0.42 -> 1.0)
    if (progress > 0.42) {
      let cardsProgress = (progress - 0.42) / 0.58;
      const totalCards = phaseCards.length;

      phaseCards.forEach((card, index) => {
        let cardStart = index / totalCards;
        
        if (cardsProgress >= cardStart) {
          let cardP = Math.min(1, (cardsProgress - cardStart) / (1 / totalCards));
          let translateY = (1 - Math.min(1, cardP * 1.8)) * 90;
          let opacity = Math.min(1, cardP * 2.2);
          
          let activeIndex = Math.floor(cardsProgress * totalCards);
          let stackedOffset = 0;
          let stackedScale = 1;
          
          if (index < activeIndex) {
            let depth = activeIndex - index;
            stackedOffset = depth * -14;
            stackedScale = 1 - (depth * 0.03);
          }

          card.style.transform = `translateY(${translateY + stackedOffset}px) scale(${stackedScale})`;
          card.style.opacity = opacity;
          card.style.zIndex = index + 1;
        } else {
          card.style.transform = `translateY(120vh) scale(0.9)`;
          card.style.opacity = 0;
        }
      });
    } else {
      phaseCards.forEach(card => {
        card.style.transform = `translateY(120vh) scale(0.9)`;
        card.style.opacity = 0;
      });
    }
  }

  /* ------------------------------------------------------------------------
     7. PINNED SECTION 2: NUESTROS PROYECTOS (HORIZONTAL SCROLL SCRUB)
     ------------------------------------------------------------------------ */
  const proyectosTrigger = document.getElementById('proyectos-trigger');
  const projectsTrack = document.getElementById('projects-track');

  function updateProyectosScroll() {
    if (!proyectosTrigger || !projectsTrack) return;

    const rect = proyectosTrigger.getBoundingClientRect();
    const triggerHeight = proyectosTrigger.offsetHeight - window.innerHeight;
    const scrollDistance = -rect.top;

    let progress = Math.max(0, Math.min(1, scrollDistance / triggerHeight));

    // Calculate maximum horizontal travel distance of track
    const trackWidth = projectsTrack.scrollWidth;
    const viewportWidth = window.innerWidth;
    const maxTranslate = Math.max(0, trackWidth - viewportWidth + (viewportWidth * 0.1));

    projectsTrack.style.transform = `translateX(-${progress * maxTranslate}px)`;
  }

  /* Combined Scroll Listener */
  window.addEventListener('scroll', () => {
    updateMetodologiaScroll();
    updateProyectosScroll();
  }, { passive: true });

  updateMetodologiaScroll();
  updateProyectosScroll();
  updateFloatingScrollbar();

  /* ------------------------------------------------------------------------
     8. EQUIPO DE TRABAJO SLIDER CONTROLLER
     ------------------------------------------------------------------------ */
  const teamTrack = document.getElementById('team-slider-track');
  const teamPrevBtn = document.getElementById('team-prev');
  const teamNextBtn = document.getElementById('team-next');
  let currentTeamIndex = 0;
  const teamCards = document.querySelectorAll('.team-slide-card');
  const totalTeamCards = teamCards.length;

  function updateTeamSlider() {
    if (!teamTrack) return;
    const cardWidth = teamCards[0] ? teamCards[0].offsetWidth + 32 : 400; // 32px gap
    teamTrack.style.transform = `translateX(-${currentTeamIndex * cardWidth}px)`;
  }

  if (teamPrevBtn && teamNextBtn) {
    teamPrevBtn.addEventListener('click', () => {
      currentTeamIndex = (currentTeamIndex - 1 + totalTeamCards) % totalTeamCards;
      updateTeamSlider();
    });

    teamNextBtn.addEventListener('click', () => {
      currentTeamIndex = (currentTeamIndex + 1) % totalTeamCards;
      updateTeamSlider();
    });
  }

  window.addEventListener('resize', () => {
    updateTeamSlider();
    updateFloatingScrollbar();
  });

  /* ------------------------------------------------------------------------
     9. CONTACT FORM INLINE & MULTI-SELECT INTEREST CHIPS
     ------------------------------------------------------------------------ */
  const interestChips = document.querySelectorAll('.interest-chip');
  const contactFormInline = document.getElementById('contact-form-inline');
  const inlineFormSuccess = document.getElementById('inline-form-success');

  interestChips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
    });
  });

  if (contactFormInline) {
    contactFormInline.addEventListener('submit', (e) => {
      e.preventDefault();
      if (inlineFormSuccess) {
        inlineFormSuccess.classList.add('visible');
        setTimeout(() => {
          contactFormInline.reset();
          interestChips.forEach(c => c.classList.remove('active'));
          setTimeout(() => {
            inlineFormSuccess.classList.remove('visible');
          }, 3000);
        }, 1500);
      }
    });
  }

  /* ------------------------------------------------------------------------
     10. INFINITE FAQ CAROUSEL SLIDER
     ------------------------------------------------------------------------ */
  const faqTrack = document.getElementById('faq-track');
  const faqPrevBtn = document.getElementById('faq-prev');
  const faqNextBtn = document.getElementById('faq-next');
  let currentFaqIndex = 0;
  const totalFaqSlides = document.querySelectorAll('.faq-slide-item').length;

  function updateFaqSlider() {
    if (!faqTrack) return;
    let cardStep = 408;
    if (window.innerWidth <= 600) cardStep = 328;
    faqTrack.style.transform = `translateX(-${currentFaqIndex * cardStep}px)`;
  }

  if (faqPrevBtn && faqNextBtn) {
    faqPrevBtn.addEventListener('click', () => {
      currentFaqIndex = (currentFaqIndex - 1 + totalFaqSlides) % totalFaqSlides;
      updateFaqSlider();
    });

    faqNextBtn.addEventListener('click', () => {
      currentFaqIndex = (currentFaqIndex + 1) % totalFaqSlides;
      updateFaqSlider();
    });
  }

  /* ------------------------------------------------------------------------
     11. TESTIMONIALS DECK HOVER & CLICK UNFURL INTERACTION (SMOOTH & FLUID)
     ------------------------------------------------------------------------ */
  const testimonialsDeck = document.getElementById('testimonials-deck');
  if (testimonialsDeck) {
    testimonialsDeck.addEventListener('mouseenter', () => {
      testimonialsDeck.classList.add('unfurled');
    });
    testimonialsDeck.addEventListener('mouseleave', () => {
      testimonialsDeck.classList.remove('unfurled');
    });
    testimonialsDeck.addEventListener('click', () => {
      testimonialsDeck.classList.toggle('unfurled');
    });
  }

});

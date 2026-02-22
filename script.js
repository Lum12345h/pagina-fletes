'use strict';

const HERLAR = (function () {

  const STATE = {
    heroSlideIndex: 0,
    heroSlideTotal: 4,
    heroTimer: null,
    testiIndex: 0,
    testiPerView: 3,
    testiTotal: 6,
    testiTimer: null,
    countersTriggered: false,
    scrollY: 0,
    isMobileMenuOpen: false,
  };

  const SELECTORS = {
    loader: '#loader',
    app: '#app',
    header: '#header',
    hamburger: '#hamburger',
    mainNav: '#main-nav',
    navLinks: '.nav-link',
    heroBgSlider: '#heroBgSlider',
    heroSlides: '.hero-slide',
    heroSlideDots: '#heroSlideDots',
    heroSlideDotsButtons: '#heroSlideDots .dot',
    statNumbers: '.stat-number',
    testimonialsTrack: '#testimonialsTrack',
    testiPrev: '#testiPrev',
    testiNext: '#testiNext',
    testiDots: '#testiDots',
    fleetItems: '.fleet-item',
    imageModal: '#imageModal',
    modalClose: '#modalClose',
    modalImg: '#modalImg',
    contactForm: '#contactForm',
    submitBtn: '#submitBtn',
    whatsappFab: '#whatsappFab',
    toastContainer: '#toastContainer',
    currentYear: '#currentYear',
    revealElements: '.reveal-up, .reveal-left, .reveal-right',
  };

  function qs(selector, context) {
    return (context || document).querySelector(selector);
  }

  function qsa(selector, context) {
    return Array.from((context || document).querySelectorAll(selector));
  }

  function on(el, event, handler, options) {
    if (el) el.addEventListener(event, handler, options || false);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function throttle(fn, interval) {
    let lastTime = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastTime >= interval) {
        lastTime = now;
        fn.apply(this, args);
      }
    };
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function formatNumber(value) {
    return Math.floor(value).toLocaleString('es-MX');
  }

  function showToast(message, type, duration) {
    const container = qs(SELECTORS.toastContainer);
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast ' + (type || 'info');
    const iconMap = { success: '✓', warning: '!', info: '·' };
    const icon = iconMap[type] || iconMap.info;
    toast.innerHTML = '<span style="font-size:18px;flex-shrink:0;font-weight:700;">' + icon + '</span><span>' + message + '</span>';
    container.appendChild(toast);
    const removeToast = function () {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    };
    setTimeout(removeToast, duration || 4000);
  }

  function initLoader() {
    const loader = qs(SELECTORS.loader);
    const app = qs(SELECTORS.app);
    if (!loader || !app) return;
    setTimeout(function () {
      loader.classList.add('fade-out');
      app.classList.remove('hidden');
      app.classList.add('visible');
      setTimeout(function () {
        loader.style.display = 'none';
        initScrollReveal();
        triggerHeroAnimations();
      }, 500);
    }, 1800);
  }

  function triggerHeroAnimations() {
    const elements = qsa('.hero-section .reveal-up');
    elements.forEach(function (el, i) {
      const delay = parseInt(el.dataset.delay || '0') + i * 120;
      setTimeout(function () {
        el.classList.add('visible');
      }, delay);
    });
  }

  function initScrollReveal() {
    const elements = qsa(SELECTORS.revealElements);
    if (!elements.length) return;
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.12,
    };
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.delay || '0');
          setTimeout(function () {
            el.classList.add('visible');
          }, delay);
          observer.unobserve(el);
        }
      });
    }, observerOptions);
    elements.forEach(function (el) {
      if (!el.closest('.hero-section')) {
        observer.observe(el);
      }
    });
  }

  function initHeader() {
    const header = qs(SELECTORS.header);
    if (!header) return;
    const handleScroll = throttle(function () {
      STATE.scrollY = window.scrollY;
      if (window.scrollY > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      updateActiveNavLink();
    }, 80);
    on(window, 'scroll', handleScroll, { passive: true });
    handleScroll();
  }

  function updateActiveNavLink() {
    const sections = ['inicio', 'servicios', 'nosotros', 'ventajas', 'galeria', 'contacto'];
    const scrollPos = window.scrollY + 120;
    let currentSection = 'inicio';
    sections.forEach(function (id) {
      const section = document.getElementById(id);
      if (section && section.offsetTop <= scrollPos) {
        currentSection = id;
      }
    });
    qsa(SELECTORS.navLinks).forEach(function (link) {
      link.classList.toggle('active', link.dataset.section === currentSection);
    });
  }

  function initMobileMenu() {
    const hamburger = qs(SELECTORS.hamburger);
    const nav = qs(SELECTORS.mainNav);
    if (!hamburger || !nav) return;
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    function openMenu() {
      STATE.isMobileMenuOpen = true;
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      nav.classList.add('open');
      overlay.classList.add('active');
      document.body.classList.add('menu-open');
    }

    function closeMenu() {
      STATE.isMobileMenuOpen = false;
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
      overlay.classList.remove('active');
      document.body.classList.remove('menu-open');
    }

    on(hamburger, 'click', function () {
      if (STATE.isMobileMenuOpen) { closeMenu(); } else { openMenu(); }
    });
    on(overlay, 'click', closeMenu);
    qsa(SELECTORS.navLinks).forEach(function (link) {
      on(link, 'click', closeMenu);
    });
    on(document, 'keydown', function (e) {
      if (e.key === 'Escape' && STATE.isMobileMenuOpen) closeMenu();
    });
  }

  function initSmoothScroll() {
    qsa('a[href^="#"]').forEach(function (anchor) {
      on(anchor, 'click', function (e) {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      });
    });
  }

  function initHeroSlider() {
    const slides = qsa(SELECTORS.heroSlides);
    const dots = qsa(SELECTORS.heroSlideDotsButtons);
    if (!slides.length) return;
    STATE.heroSlideTotal = slides.length;

    function goToSlide(index) {
      slides[STATE.heroSlideIndex].classList.remove('active');
      if (dots[STATE.heroSlideIndex]) dots[STATE.heroSlideIndex].classList.remove('active');
      STATE.heroSlideIndex = ((index % STATE.heroSlideTotal) + STATE.heroSlideTotal) % STATE.heroSlideTotal;
      slides[STATE.heroSlideIndex].classList.add('active');
      if (dots[STATE.heroSlideIndex]) dots[STATE.heroSlideIndex].classList.add('active');
      slides[STATE.heroSlideIndex].style.animation = 'none';
      slides[STATE.heroSlideIndex].offsetHeight;
      slides[STATE.heroSlideIndex].style.animation = 'heroZoom 8s ease forwards';
    }

    function startAutoplay() {
      STATE.heroTimer = setInterval(function () {
        goToSlide(STATE.heroSlideIndex + 1);
      }, 5500);
    }

    function stopAutoplay() { clearInterval(STATE.heroTimer); }

    dots.forEach(function (dot, i) {
      on(dot, 'click', function () {
        stopAutoplay();
        goToSlide(i);
        startAutoplay();
      });
    });

    const slider = qs(SELECTORS.heroBgSlider);
    let touchStartX = 0;
    on(slider, 'touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    on(slider, 'touchend', function (e) {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        stopAutoplay();
        goToSlide(diff > 0 ? STATE.heroSlideIndex + 1 : STATE.heroSlideIndex - 1);
        startAutoplay();
      }
    }, { passive: true });
    startAutoplay();
  }

  function initCounters() {
    const statNumbers = qsa(SELECTORS.statNumbers);
    if (!statNumbers.length) return;
    const statsSection = qs('.stats-band');
    if (!statsSection) return;
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !STATE.countersTriggered) {
          STATE.countersTriggered = true;
          animateCounters(statNumbers);
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(statsSection);
  }

  function animateCounters(elements) {
    elements.forEach(function (el) {
      const target = parseInt(el.dataset.target) || 0;
      const suffix = el.dataset.suffix || '';
      const duration = 2200;
      const startTime = performance.now();
      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        const currentValue = Math.floor(easedProgress * target);
        el.textContent = formatNumber(currentValue) + suffix;
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = formatNumber(target) + suffix;
        }
      }
      requestAnimationFrame(update);
    });
  }

  function initTestimonialsSlider() {
    const track = qs(SELECTORS.testimonialsTrack);
    const prevBtn = qs(SELECTORS.testiPrev);
    const nextBtn = qs(SELECTORS.testiNext);
    const dotsContainer = qs(SELECTORS.testiDots);
    if (!track) return;
    const cards = Array.from(track.children);
    STATE.testiTotal = cards.length;

    function getPerView() {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 1024) return 2;
      return 3;
    }

    function getMaxIndex() {
      return Math.max(0, STATE.testiTotal - STATE.testiPerView);
    }

    function buildDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      const maxIndex = getMaxIndex();
      for (let i = 0; i <= maxIndex; i++) {
        const dot = document.createElement('button');
        dot.className = 'testi-dot' + (i === STATE.testiIndex ? ' active' : '');
        dot.setAttribute('aria-label', 'Testimonio ' + (i + 1));
        on(dot, 'click', function () { goToTesti(i); });
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      if (!dotsContainer) return;
      qsa('.testi-dot', dotsContainer).forEach(function (dot, i) {
        dot.classList.toggle('active', i === STATE.testiIndex);
      });
    }

    function getCardWidth() {
      const card = cards[0];
      if (!card) return 0;
      const rect = card.getBoundingClientRect();
      const style = getComputedStyle(track);
      const gap = parseInt(style.gap || style.columnGap || '0');
      return rect.width + gap;
    }

    function goToTesti(index) {
      STATE.testiPerView = getPerView();
      const maxIndex = getMaxIndex();
      STATE.testiIndex = clamp(index, 0, maxIndex);
      const cardWidth = getCardWidth();
      const offset = STATE.testiIndex * cardWidth;
      track.style.transform = 'translateX(-' + offset + 'px)';
      updateDots();
    }

    function startTestiAutoplay() {
      STATE.testiTimer = setInterval(function () {
        const maxIndex = getMaxIndex();
        goToTesti(STATE.testiIndex >= maxIndex ? 0 : STATE.testiIndex + 1);
      }, 5000);
    }

    function stopTestiAutoplay() { clearInterval(STATE.testiTimer); }

    on(prevBtn, 'click', function () {
      stopTestiAutoplay();
      goToTesti(STATE.testiIndex - 1);
      startTestiAutoplay();
    });
    on(nextBtn, 'click', function () {
      stopTestiAutoplay();
      goToTesti(STATE.testiIndex + 1);
      startTestiAutoplay();
    });

    let touchStartX = 0;
    on(track, 'touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
      stopTestiAutoplay();
    }, { passive: true });
    on(track, 'touchend', function (e) {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goToTesti(diff > 0 ? STATE.testiIndex + 1 : STATE.testiIndex - 1);
      startTestiAutoplay();
    }, { passive: true });

    const handleResize = debounce(function () {
      STATE.testiPerView = getPerView();
      goToTesti(Math.min(STATE.testiIndex, getMaxIndex()));
      buildDots();
    }, 200);
    on(window, 'resize', handleResize);

    STATE.testiPerView = getPerView();
    buildDots();
    goToTesti(0);
    startTestiAutoplay();
  }

  function initFleetGallery() {
    const items = qsa(SELECTORS.fleetItems);
    const modal = qs(SELECTORS.imageModal);
    const modalImg = qs(SELECTORS.modalImg);
    const modalClose = qs(SELECTORS.modalClose);
    if (!items.length || !modal || !modalImg) return;

    function openModal(src, alt) {
      modalImg.src = src;
      modalImg.alt = alt || 'Imagen de flota';
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      if (modalClose) modalClose.focus();
    }

    function closeModal() {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      modalImg.src = '';
    }

    items.forEach(function (item) {
      const img = item.querySelector('img');
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', 'Ver imagen ampliada');
      on(item, 'click', function () { if (img) openModal(img.src, img.alt); });
      on(item, 'keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (img) openModal(img.src, img.alt);
        }
      });
    });

    on(modalClose, 'click', closeModal);
    on(modal, 'click', function (e) { if (e.target === modal) closeModal(); });
    on(document, 'keydown', function (e) {
      if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
    });
  }

  function validateField(field) {
    const value = field.value.trim();
    const name = field.name;
    const errorEl = field.parentElement ? field.parentElement.querySelector('.form-error') : null;
    let errorMsg = '';
    if (field.hasAttribute('required') && !value) {
      errorMsg = 'Este campo es obligatorio.';
    } else if (name === 'telefono' && value) {
      const digitsOnly = value.replace(/[\s\-\(\)]/g, '');
      if (!/^\d{10,12}$/.test(digitsOnly)) errorMsg = 'Ingresa un número válido de 10 dígitos.';
    } else if (name === 'nombre' && value && value.length < 2) {
      errorMsg = 'El nombre es demasiado corto.';
    } else if (name === 'servicio' && value === '') {
      errorMsg = 'Selecciona un tipo de servicio.';
    } else if ((name === 'origen' || name === 'destino') && value && value.length < 5) {
      errorMsg = 'Ingresa una dirección más completa.';
    }
    if (errorEl) errorEl.textContent = errorMsg;
    field.classList.toggle('error', !!errorMsg);
    return !errorMsg;
  }

  function buildWhatsAppMessage(data) {
    const serviceLabels = {
      'flete-muebles': 'Flete de muebles',
      'linea-blanca': 'Línea blanca / Electrodomésticos',
      'costco': 'Compra de Costco',
      'mudanza': 'Mudanza',
      'carga-general': 'Carga general',
      'otro': 'Otro',
    };
    const serviceLabel = serviceLabels[data.servicio] || data.servicio || 'No especificado';
    let msg = 'Hola, me gustaría cotizar un servicio de fletes.\n\n';
    msg += 'Nombre: ' + data.nombre + '\n';
    msg += 'Teléfono: ' + data.telefono + '\n';
    msg += 'Servicio: ' + serviceLabel + '\n';
    msg += 'Origen: ' + data.origen + '\n';
    msg += 'Destino: ' + data.destino + '\n';
    if (data.descripcion) msg += 'Descripción: ' + data.descripcion + '\n';
    msg += '\nQuedo en espera de su cotización. Gracias.';
    return encodeURIComponent(msg);
  }

  function initContactForm() {
    const form = qs(SELECTORS.contactForm);
    const submitBtn = qs(SELECTORS.submitBtn);
    if (!form) return;
    const fields = Array.from(form.querySelectorAll('input, select, textarea'));

    fields.forEach(function (field) {
      on(field, 'blur', function () { if (field.value.trim()) validateField(field); });
      on(field, 'input', function () { if (field.classList.contains('error')) validateField(field); });
    });

    const labels = Array.from(form.querySelectorAll('.form-label'));
    labels.forEach(function (label) {
      const inputId = label.getAttribute('for');
      const input = inputId ? form.querySelector('#' + inputId) : null;
      if (!input) return;
      on(input, 'focus', function () { label.style.color = 'var(--red)'; });
      on(input, 'blur', function () { label.style.color = ''; });
    });

    on(form, 'submit', function (e) {
      e.preventDefault();
      let isValid = true;
      fields.forEach(function (field) { if (!validateField(field)) isValid = false; });
      if (!isValid) {
        const firstError = form.querySelector('.error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        showToast('Por favor, revisa los campos marcados.', 'warning');
        return;
      }
      const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
      const btnLoading = submitBtn ? submitBtn.querySelector('.btn-loading') : null;
      if (btnText) btnText.style.display = 'none';
      if (btnLoading) btnLoading.style.display = '';
      if (submitBtn) submitBtn.disabled = true;
      const data = {
        nombre: form.querySelector('#nombre').value.trim(),
        telefono: form.querySelector('#telefono').value.trim(),
        servicio: form.querySelector('#servicio').value,
        origen: form.querySelector('#origen').value.trim(),
        destino: form.querySelector('#destino').value.trim(),
        descripcion: form.querySelector('#descripcion') ? form.querySelector('#descripcion').value.trim() : '',
      };
      setTimeout(function () {
        const message = buildWhatsAppMessage(data);
        const waUrl = 'https://wa.me/5213318358780?text=' + message;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        showToast('Redirigiendo a WhatsApp. Tu cotización está lista.', 'success');
        form.reset();
        fields.forEach(function (f) { f.classList.remove('error'); });
        if (btnText) btnText.style.display = '';
        if (btnLoading) btnLoading.style.display = 'none';
        if (submitBtn) submitBtn.disabled = false;
      }, 800);
    });
  }

  function initWhatsAppFab() {
    const fab = qs(SELECTORS.whatsappFab);
    if (!fab) return;
    let lastScrollY = 0;
    fab.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease, box-shadow 0.25s ease';
    const handleScroll = throttle(function () {
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY;
      if (scrollDiff > 50 && currentScrollY > 300) {
        fab.style.transform = 'translateY(100px)';
        fab.style.opacity = '0';
      } else if (scrollDiff < -20 || currentScrollY < 300) {
        fab.style.transform = '';
        fab.style.opacity = '';
      }
      lastScrollY = currentScrollY;
    }, 100);
    on(window, 'scroll', handleScroll, { passive: true });
  }

  function initCurrentYear() {
    const el = qs(SELECTORS.currentYear);
    if (el) el.textContent = new Date().getFullYear();
  }

  function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.id = 'scrollProgress';
    progressBar.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:var(--red);z-index:9999;transition:width 0.1s linear;pointer-events:none;width:0%;';
    document.body.appendChild(progressBar);
    const updateProgress = throttle(function () {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
    }, 50);
    on(window, 'scroll', updateProgress, { passive: true });
  }

  function initParallaxHero() {
    const overlay = qs('.hero-overlay');
    if (!overlay) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const handleScroll = throttle(function () {
      if (window.scrollY > window.innerHeight) return;
      const progress = window.scrollY / window.innerHeight;
      const opacity = 0.6 + progress * 0.35;
      overlay.style.background = 'linear-gradient(135deg, rgba(21,37,69,' + Math.min(opacity + 0.15, 0.98) + ') 0%, rgba(21,37,69,' + Math.min(opacity, 0.85) + ') 50%, rgba(21,37,69,' + Math.min(opacity - 0.1, 0.55) + ') 100%)';
    }, 30);
    on(window, 'scroll', handleScroll, { passive: true });
  }

  function initServiceCardInteractions() {
    const cards = qsa('.service-card');
    cards.forEach(function (card) {
      const icon = card.querySelector('.service-icon-wrap');
      on(card, 'mouseenter', function () {
        if (icon) { icon.style.transform = 'rotate(-6deg) scale(1.08)'; icon.style.transition = 'transform 0.25s ease'; }
      });
      on(card, 'mouseleave', function () {
        if (icon) icon.style.transform = '';
      });
    });
  }

  function initWhyCardRipple() {
    const cards = qsa('.why-card');
    if (!document.getElementById('rippleStyle')) {
      const style = document.createElement('style');
      style.id = 'rippleStyle';
      style.textContent = '@keyframes rippleAnim{to{transform:scale(4);opacity:0;}}';
      document.head.appendChild(style);
    }
    cards.forEach(function (card) {
      on(card, 'click', function (e) {
        const ripple = document.createElement('span');
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        ripple.style.cssText = 'position:absolute;width:' + size + 'px;height:' + size + 'px;left:' + x + 'px;top:' + y + 'px;background:rgba(214,43,43,0.12);border-radius:50%;transform:scale(0);animation:rippleAnim 0.6s ease-out forwards;pointer-events:none;';
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
        card.appendChild(ripple);
        setTimeout(function () { if (ripple.parentNode) ripple.parentNode.removeChild(ripple); }, 700);
      });
    });
  }

  function initBackToTop() {
    const btn = document.createElement('button');
    btn.id = 'backToTop';
    btn.setAttribute('aria-label', 'Volver al inicio');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><polyline points="18,15 12,9 6,15"/></svg>';
    btn.style.cssText = 'position:fixed;bottom:100px;right:28px;z-index:800;width:44px;height:44px;border-radius:50%;background:var(--navy);color:var(--white);border:2px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:var(--shadow-md);transition:opacity 0.3s ease,transform 0.3s ease,background 0.2s ease;opacity:0;transform:translateY(16px);pointer-events:none;';
    document.body.appendChild(btn);
    const handleScroll = throttle(function () {
      if (window.scrollY > 600) {
        btn.style.opacity = '1';
        btn.style.transform = 'translateY(0)';
        btn.style.pointerEvents = '';
      } else {
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(16px)';
        btn.style.pointerEvents = 'none';
      }
    }, 100);
    on(window, 'scroll', handleScroll, { passive: true });
    on(btn, 'click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    on(btn, 'mouseenter', function () { btn.style.background = 'var(--red)'; btn.style.borderColor = 'var(--red)'; });
    on(btn, 'mouseleave', function () { btn.style.background = 'var(--navy)'; btn.style.borderColor = 'rgba(255,255,255,0.1)'; });
  }

  function initNavKeyboardAccess() {
    const navList = qs('.nav-list');
    if (!navList) return;
    const links = qsa('.nav-link', navList);
    links.forEach(function (link, i) {
      on(link, 'keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const next = links[(i + 1) % links.length];
          if (next) next.focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = links[(i - 1 + links.length) % links.length];
          if (prev) prev.focus();
        }
      });
    });
  }

  function initPhoneFormatting() {
    const telInput = qs('#telefono');
    if (!telInput) return;
    on(telInput, 'input', function () {
      let v = telInput.value.replace(/\D/g, '');
      if (v.length > 10) v = v.slice(0, 10);
      if (v.length >= 7) {
        v = v.slice(0, 2) + ' ' + v.slice(2, 6) + ' ' + v.slice(6);
      } else if (v.length >= 3) {
        v = v.slice(0, 2) + ' ' + v.slice(2);
      }
      telInput.value = v;
    });
  }

  function initCostcoBannerReveal() {
    const features = qsa('.costco-feature');
    const banner = qs('.costco-banner');
    if (!banner || !features.length) return;
    features.forEach(function (f) {
      f.style.opacity = '0';
      f.style.transform = 'translateX(-20px)';
      f.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
    });
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          features.forEach(function (f, i) {
            setTimeout(function () {
              f.style.opacity = '1';
              f.style.transform = 'translateX(0)';
            }, i * 100);
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(banner);
  }

  function initSectionTagAnimation() {
    const tags = qsa('.section-tag');
    if (!document.getElementById('tagRevealStyle')) {
      const style = document.createElement('style');
      style.id = 'tagRevealStyle';
      style.textContent = '@keyframes tagReveal{from{opacity:0;transform:translateY(10px) scale(0.9);}to{opacity:1;transform:translateY(0) scale(1);}}';
      document.head.appendChild(style);
    }
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'tagReveal 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    tags.forEach(function (tag) {
      tag.style.opacity = '0';
      observer.observe(tag);
    });
  }

  function initAboutBadgeAnimation() {
    const badge = qs('.about-experience-badge');
    if (!badge) return;
    if (!document.getElementById('badgePopStyle')) {
      const style = document.createElement('style');
      style.id = 'badgePopStyle';
      style.textContent = '@keyframes badgePop{to{opacity:1;transform:scale(1);}}';
      document.head.appendChild(style);
    }
    badge.style.opacity = '0';
    badge.style.transform = 'scale(0.7)';
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          badge.style.animation = 'badgePop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(badge);
  }

  function initStatsHover() {
    const statItems = qsa('.stat-item');
    statItems.forEach(function (item) {
      on(item, 'mouseenter', function () {
        item.style.transform = 'scale(1.05)';
        item.style.transition = 'transform 0.25s ease';
      });
      on(item, 'mouseleave', function () { item.style.transform = ''; });
    });
  }

  function initHeaderLogoHover() {
    const logo = qs('.header-logo');
    if (!logo) return;
    const stripeTop = logo.querySelector('.logo-stripe-top');
    const stripeMid = logo.querySelector('.logo-stripe-mid');
    const fletes = logo.querySelector('.logo-fletes');
    on(logo, 'mouseenter', function () {
      if (stripeTop) { stripeTop.style.transform = 'skewX(-8deg) scaleX(1.2)'; stripeTop.style.transition = 'transform 0.3s ease'; }
      if (stripeMid) { stripeMid.style.transform = 'skewX(-8deg) scaleX(0.9) translateX(4px)'; stripeMid.style.transition = 'transform 0.3s ease'; }
      if (fletes) { fletes.style.textShadow = '0 0 20px rgba(214,43,43,0.4)'; fletes.style.transition = 'text-shadow 0.3s ease'; }
    });
    on(logo, 'mouseleave', function () {
      if (stripeTop) stripeTop.style.transform = '';
      if (stripeMid) stripeMid.style.transform = '';
      if (fletes) fletes.style.textShadow = '';
    });
  }

  function initAccesibilityFixes() {
    qsa('.fleet-item').forEach(function (item) {
      if (!item.getAttribute('tabindex')) item.setAttribute('tabindex', '0');
    });
    qsa('.social-link').forEach(function (link) {
      if (!link.getAttribute('aria-label')) link.setAttribute('aria-label', 'Red social');
    });
    qsa('.btn').forEach(function (btn) {
      if (btn.tagName === 'BUTTON' && !btn.type) btn.type = 'button';
    });
  }

  function initPillHoverEffects() {
    qsa('.pill').forEach(function (pill) {
      on(pill, 'mouseenter', function () {
        pill.style.background = 'rgba(214,43,43,0.15)';
        pill.style.borderColor = 'rgba(214,43,43,0.35)';
        pill.style.color = 'rgba(255,255,255,0.95)';
        pill.style.transition = 'all 0.2s ease';
      });
      on(pill, 'mouseleave', function () {
        pill.style.background = '';
        pill.style.borderColor = '';
        pill.style.color = '';
      });
    });
  }

  function initFleetItemExpand() {
    qsa('.fleet-item').forEach(function (item) {
      const caption = item.querySelector('.fleet-caption');
      if (!caption) return;
      on(item, 'mouseenter', function () { caption.style.padding = '24px 20px'; });
      on(item, 'mouseleave', function () { caption.style.padding = ''; });
    });
  }

  function initCtaBandReveal() {
    const ctaBand = qs('.cta-band');
    if (!ctaBand) return;
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const actions = ctaBand.querySelector('.cta-band-actions');
          const text = ctaBand.querySelector('.cta-band-text');
          if (text) {
            text.style.opacity = '0';
            text.style.transform = 'translateY(30px)';
            text.style.transition = 'all 0.6s ease';
            setTimeout(function () { text.style.opacity = '1'; text.style.transform = ''; }, 100);
          }
          if (actions) {
            actions.style.opacity = '0';
            actions.style.transform = 'translateY(30px)';
            actions.style.transition = 'all 0.6s ease';
            setTimeout(function () { actions.style.opacity = '1'; actions.style.transform = ''; }, 250);
          }
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(ctaBand);
  }

  function initHeroBadgePulse() {
    const badge = qs('.hero-badge');
    if (!badge) return;
    setInterval(function () {
      badge.style.boxShadow = '0 0 0 6px rgba(214,43,43,0.15)';
      setTimeout(function () { badge.style.boxShadow = ''; }, 700);
    }, 3500);
  }

  function init() {
    initLoader();
    initHeader();
    initMobileMenu();
    initSmoothScroll();
    initHeroSlider();
    initCounters();
    initTestimonialsSlider();
    initFleetGallery();
    initContactForm();
    initWhatsAppFab();
    initCurrentYear();
    initScrollProgress();
    initParallaxHero();
    initServiceCardInteractions();
    initWhyCardRipple();
    initStatsHover();
    initHeaderLogoHover();
    initCostcoBannerReveal();
    initNavKeyboardAccess();
    initBackToTop();
    initAccesibilityFixes();
    initSectionTagAnimation();
    initFleetItemExpand();
    initPhoneFormatting();
    initAboutBadgeAnimation();
    initPillHoverEffects();
    initCtaBandReveal();
    initHeroBadgePulse();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    showToast: showToast,
  };

})();

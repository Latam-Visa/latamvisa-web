/* =====================================================
   VISA ESTUDIANTIL AUSTRALIA — Interactions
   ===================================================== */
'use strict';

// ─── CUSTOM CURSOR (FAST) ─────────────────────────
const cursorOuter = document.getElementById('cursorOuter');
const cursorDot   = document.getElementById('cursorDot');

let mouseX = 0, mouseY = 0;
let outerX = 0, outerY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  // Inner dot follows immediately
  cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
});

// Outer ring follows with fast lerp (0.25 = fast, closer to 1 = instant)
function animateCursor() {
  const LERP = 0.25; // faster than default — increase to make even faster
  outerX += (mouseX - outerX) * LERP;
  outerY += (mouseY - outerY) * LERP;
  cursorOuter.style.transform = `translate(${outerX}px, ${outerY}px) translate(-50%, -50%)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor state on interactive elements
document.querySelectorAll('a, button, .aprob-item, .testi-card, .faq-q, select, input, textarea').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorOuter.style.width  = '52px';
    cursorOuter.style.height = '52px';
    cursorOuter.style.background = 'rgba(197,255,0,0.08)';
    cursorOuter.style.borderColor = '#C5FF00';
    cursorDot.style.background = '#C5FF00';
  });
  el.addEventListener('mouseleave', () => {
    cursorOuter.style.width  = '36px';
    cursorOuter.style.height = '36px';
    cursorOuter.style.background = 'transparent';
    cursorOuter.style.borderColor = 'rgba(197,255,0,0.7)';
    cursorDot.style.background = '#C5FF00';
  });
});

// ─── NAVBAR SCROLL ────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ─── HAMBURGER MENU ───────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ─── SCROLL REVEAL ────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

// Auto-add reveal to elements that don't already have it
function initReveal() {
  const selectors = [
    '.section-label',
    '.section-title',
    '.section-sub',
    '.cultural-values',
    '.quote-band',
    '.footer-quote-main',
    '.footer-identity',
    '.footer-links-row',
    '.faq-item',
    '.contact-text',
    '.contact-form-wrap',
  ];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
      }
    });
  });

  document.querySelectorAll('.reveal').forEach((el, i) => {
    // Stagger items in the same grid parent
    const stagger = Math.min(i % 8, 5) * 80;
    el.style.transitionDelay = stagger + 'ms';
    revealObserver.observe(el);
  });
}

// ─── ACTIVE NAV LINK (scroll spy) ─────────────────
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const spyObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.35 });

sections.forEach(sec => spyObserver.observe(sec));

// ─── PARALLAX ON HERO BG ──────────────────────────
const heroBg = document.querySelector('.hero-bg-img');
if (heroBg) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroBg.style.transform = `scale(1) translateY(${scrolled * 0.22}px)`;
    }
  }, { passive: true });
}

// ─── VIDEO PREVIEW — load first frame ─────────────
document.querySelectorAll('.video-preview').forEach(video => {
  video.currentTime = 0.5;
});

// ─── MEDIA MODAL ──────────────────────────────────
const modalOverlay = document.getElementById('modalOverlay');
const modalImg     = document.getElementById('modalImg');
const modalVideo   = document.getElementById('modalVideo');

function openMedia(src, type) {
  modalImg.style.display   = 'none';
  modalVideo.style.display = 'none';
  modalImg.src   = '';
  modalVideo.src = '';

  if (type === 'image') {
    modalImg.src = src;
    modalImg.style.display = 'block';
  } else if (type === 'video') {
    modalVideo.src = src;
    modalVideo.style.display = 'block';
    modalVideo.play().catch(() => {}); // auto-play on open
  }

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalVideo.pause();
  modalVideo.src = '';
  modalImg.src   = '';
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ─── FAQ ACCORDION ────────────────────────────────
function toggleFaq(id) {
  const item   = document.getElementById(id);
  const isOpen = item.classList.contains('open');

  document.querySelectorAll('.faq-item.open').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
  });

  if (!isOpen) {
    item.classList.add('open');
    item.querySelector('.faq-q').setAttribute('aria-expanded', 'true');
  }
}

document.querySelectorAll('.faq-q').forEach(btn => {
  btn.setAttribute('aria-expanded', 'false');
});

// ─── FORM SUBMISSION ──────────────────────────────
function handleSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  btn.textContent = 'Enviando…';
  btn.disabled = true;

  setTimeout(() => {
    document.getElementById('contactForm').style.display = 'none';
    document.getElementById('formSuccess').style.display = 'block';
  }, 1200);
}

// ─── INIT ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initReveal();

  // Open first FAQ
  const firstFaq = document.getElementById('faq1');
  if (firstFaq) {
    firstFaq.classList.add('open');
    firstFaq.querySelector('.faq-q').setAttribute('aria-expanded', 'true');
  }

  // Stagger aprob items individually for nicer animation
  document.querySelectorAll('.aprob-item').forEach((el, i) => {
    el.style.transitionDelay = (i * 40) + 'ms';
  });
  document.querySelectorAll('.testi-card').forEach((el, i) => {
    el.style.transitionDelay = (i * 35) + 'ms';
  });
});

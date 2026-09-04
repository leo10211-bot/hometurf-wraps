const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach((el) => revealObserver.observe(el));

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Carousel */

const track = document.getElementById('carousel-track');
const slides = track.querySelectorAll('.carousel-slide');
const dotsWrap = document.getElementById('carousel-dots');
const prevBtn = document.getElementById('carousel-prev');
const nextBtn = document.getElementById('carousel-next');
let slideIndex = 0;
let autoplayTimer = null;

slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.setAttribute('role', 'tab');
  dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
  dot.addEventListener('click', () => goToSlide(i));
  dotsWrap.appendChild(dot);
});

const dots = dotsWrap.querySelectorAll('button');

function goToSlide(i) {
  slideIndex = (i + slides.length) % slides.length;
  track.style.transform = `translateX(-${slideIndex * 100}%)`;
  dots.forEach((d, di) => d.classList.toggle('active', di === slideIndex));
}

function startAutoplay() {
  if (prefersReducedMotion) return;
  stopAutoplay();
  autoplayTimer = setInterval(() => goToSlide(slideIndex + 1), 4000);
}

function stopAutoplay() {
  if (autoplayTimer) clearInterval(autoplayTimer);
}

prevBtn.addEventListener('click', () => { goToSlide(slideIndex - 1); startAutoplay(); });
nextBtn.addEventListener('click', () => { goToSlide(slideIndex + 1); startAutoplay(); });

const carousel = document.getElementById('carousel');
carousel.addEventListener('mouseenter', stopAutoplay);
carousel.addEventListener('mouseleave', startAutoplay);
carousel.addEventListener('focusin', stopAutoplay);
carousel.addEventListener('focusout', startAutoplay);

goToSlide(0);
startAutoplay();

/* Quick-view drawer + checkout */

const shopCards = document.querySelectorAll('.shop-card');
const drawer = document.getElementById('drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const drawerClose = document.getElementById('drawer-close');
const drawerBuyBtn = document.getElementById('drawer-buy');
const drawerMock = document.getElementById('drawer-mock');
const drawerTitle = document.getElementById('drawer-title');
const drawerPrice = document.getElementById('drawer-price');
const drawerNote = document.getElementById('drawer-note');

let lastFocused = null;
let activeCard = null;

function openDrawer(card) {
  lastFocused = document.activeElement;
  activeCard = card;

  drawerMock.className = 'deck-mock drawer-mock ' + card.dataset.deckClass;
  drawerTitle.textContent = card.dataset.board;
  drawerPrice.textContent = card.dataset.price + ' — pricing coming soon';
  drawerNote.textContent = '';

  drawer.classList.add('open');
  drawerOverlay.classList.add('open');
  drawerClose.focus();
  document.addEventListener('keydown', onDrawerKeydown);
}

function closeDrawer() {
  drawer.classList.remove('open');
  drawerOverlay.classList.remove('open');
  document.removeEventListener('keydown', onDrawerKeydown);
  if (lastFocused) lastFocused.focus();
}

function onDrawerKeydown(e) {
  if (e.key === 'Escape') closeDrawer();
}

function goToCheckout(card) {
  const url = card.dataset.checkoutUrl;
  if (url) {
    window.location.href = url;
    return;
  }
  return false;
}

shopCards.forEach((card) => {
  card.addEventListener('click', () => openDrawer(card));
});

drawerClose.addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);

drawerBuyBtn.addEventListener('click', () => {
  if (!activeCard) return;
  const went = goToCheckout(activeCard);
  if (went === false) {
    drawerNote.textContent = 'Checkout link coming soon for this board.';
    drawerNote.style.color = 'var(--muted)';
  }
});

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

/* Quick-view drawer */

const shopCards = document.querySelectorAll('.shop-card');
const orderBoardField = document.getElementById('order-board');
const drawer = document.getElementById('drawer');
const drawerOverlay = document.getElementById('drawer-overlay');
const drawerClose = document.getElementById('drawer-close');
const drawerOrderBtn = document.getElementById('drawer-order');
const drawerMock = document.getElementById('drawer-mock');
const drawerTitle = document.getElementById('drawer-title');
const drawerPrice = document.getElementById('drawer-price');

let lastFocused = null;
let activeCard = null;

function openDrawer(card) {
  lastFocused = document.activeElement;
  activeCard = card;

  drawerMock.className = 'deck-mock drawer-mock ' + card.dataset.deckClass;
  drawerTitle.textContent = card.dataset.board;
  drawerPrice.textContent = card.dataset.price + ' — pricing coming soon';

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

shopCards.forEach((card) => {
  card.addEventListener('click', () => openDrawer(card));
});

drawerClose.addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);

drawerOrderBtn.addEventListener('click', () => {
  if (!activeCard) return;

  shopCards.forEach((c) => c.classList.remove('selected'));
  activeCard.classList.add('selected');
  orderBoardField.value = `${activeCard.dataset.board} (${activeCard.dataset.price})`;

  closeDrawer();
  document.getElementById('order').scrollIntoView({ behavior: 'smooth', block: 'start' });
  const nameField = document.querySelector('#order-form input[name="name"]');
  if (nameField) nameField.focus({ preventScroll: true });
});

/* Order form */

const form = document.getElementById('order-form');
const note = document.getElementById('form-note');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const board = form.board.value.trim();
  const name = form.name.value.trim();
  const email = form.email.value.trim();

  if (!board) {
    note.textContent = 'Pick a board from the shop above first.';
    note.style.color = '#a11c1c';
    return;
  }

  if (!name || !email) {
    note.textContent = 'Please fill in your name and email.';
    note.style.color = '#a11c1c';
    return;
  }

  const address = form.address.value.trim();
  const message = form.message.value.trim();

  const body = [
    `Board: ${board}`,
    `Name: ${name}`,
    `Email: ${email}`,
    address ? `Shipping address: ${address}` : null,
    message ? `Message: ${message}` : null,
  ].filter(Boolean).join('\n');

  const mailto = `mailto:hello@hometurfwraps.com?subject=${encodeURIComponent('Board order: ' + board)}&body=${encodeURIComponent(body)}`;

  window.location.href = mailto;
  note.style.color = 'var(--muted)';
  note.textContent = 'Opening your email client to send the order...';
});

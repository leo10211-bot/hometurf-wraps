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

const shopCards = [...document.querySelectorAll('.shop-card')];
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

function findCardByBoard(board) {
  return shopCards.find((c) => c.dataset.board === board);
}

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

  recordRecent(card.dataset.board);
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
  card.addEventListener('click', (e) => {
    if (e.target.closest('.heart-btn')) return;
    openDrawer(card);
  });
  card.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target === card) {
      e.preventDefault();
      openDrawer(card);
    }
  });
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

/* Zoom lightbox */

const lightboxOverlay = document.getElementById('lightbox-overlay');
const lightboxMock = document.getElementById('lightbox-mock');
const lightboxClose = document.getElementById('lightbox-close');

function openLightbox() {
  if (!activeCard) return;
  lightboxMock.className = 'deck-mock lightbox-mock ' + activeCard.dataset.deckClass;
  lightboxOverlay.classList.add('open');
  lightboxClose.focus();
  document.addEventListener('keydown', onLightboxKeydown);
}

function closeLightbox() {
  lightboxOverlay.classList.remove('open');
  document.removeEventListener('keydown', onLightboxKeydown);
  drawerMock.focus();
}

function onLightboxKeydown(e) {
  if (e.key === 'Escape') closeLightbox();
}

drawerMock.addEventListener('click', openLightbox);
lightboxClose.addEventListener('click', closeLightbox);
lightboxOverlay.addEventListener('click', (e) => {
  if (e.target === lightboxOverlay) closeLightbox();
});

/* Favorites */

const FAVORITES_KEY = 'hometurf_favorites';

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
}

function saveFavorites(list) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
  } catch {
    /* localStorage unavailable — favorites just won't persist */
  }
}

let favorites = loadFavorites();
const favoritesCountEl = document.getElementById('favorites-count');

function isFavorite(board) {
  return favorites.includes(board);
}

function updateFavoritesUI() {
  shopCards.forEach((card) => {
    const heart = card.querySelector('.heart-btn');
    heart.setAttribute('aria-pressed', String(isFavorite(card.dataset.board)));
  });
  favoritesCountEl.textContent = String(favorites.length);
  favoritesCountEl.hidden = favorites.length === 0;
}

function toggleFavorite(board) {
  favorites = isFavorite(board) ? favorites.filter((b) => b !== board) : [...favorites, board];
  saveFavorites(favorites);
  updateFavoritesUI();
  applyFilters();
}

shopCards.forEach((card) => {
  card.querySelector('.heart-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFavorite(card.dataset.board);
  });
});

document.getElementById('nav-favorites').addEventListener('click', () => {
  document.getElementById('shop').scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  if (!favoritesOnly) {
    favoritesOnly = true;
    favoritesToggleBtn.setAttribute('aria-pressed', 'true');
    applyFilters();
  }
});

updateFavoritesUI();

/* Search + filter */

const searchInput = document.getElementById('shop-search');
const leagueFilterBtns = [...document.querySelectorAll('.filter-btn[data-league-filter]')];
const favoritesToggleBtn = document.getElementById('favorites-toggle');
const shopEmpty = document.getElementById('shop-empty');

let currentLeague = 'all';
let favoritesOnly = false;

leagueFilterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    currentLeague = btn.dataset.leagueFilter;
    leagueFilterBtns.forEach((b) => b.classList.toggle('active', b === btn));
    applyFilters();
  });
});

favoritesToggleBtn.addEventListener('click', () => {
  favoritesOnly = !favoritesOnly;
  favoritesToggleBtn.setAttribute('aria-pressed', String(favoritesOnly));
  applyFilters();
});

searchInput.addEventListener('input', () => applyFilters());

function setCardVisible(card, visible) {
  const isHidden = card.classList.contains('filtered-hidden');
  if (visible && isHidden) {
    card.classList.remove('filtered-hidden');
    if (prefersReducedMotion) {
      card.classList.remove('filtering-out');
    } else {
      card.classList.add('filtering-out');
      requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('filtering-out')));
    }
  } else if (!visible && !isHidden) {
    if (prefersReducedMotion) {
      card.classList.add('filtered-hidden');
    } else {
      card.classList.add('filtering-out');
      setTimeout(() => card.classList.add('filtered-hidden'), 200);
    }
  }
}

function applyFilters() {
  const term = searchInput.value.trim().toLowerCase();
  let anyVisible = false;

  shopCards.forEach((card) => {
    const matchesSearch = !term || card.dataset.board.toLowerCase().includes(term);
    const matchesLeague = currentLeague === 'all' || card.dataset.league === currentLeague;
    const matchesFavorites = !favoritesOnly || isFavorite(card.dataset.board);
    const shouldShow = matchesSearch && matchesLeague && matchesFavorites;
    setCardVisible(card, shouldShow);
    if (shouldShow) anyVisible = true;
  });

  shopEmpty.hidden = anyVisible;
}

/* Recently viewed tray */

const RECENT_KEY = 'hometurf_recent';
const MAX_RECENT = 6;

function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
}

function saveRecent(list) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* localStorage unavailable — recents just won't persist */
  }
}

let recentBoards = loadRecent();
const recentTray = document.getElementById('recent-tray');
const recentTrayItems = document.getElementById('recent-tray-items');

function renderRecentTray() {
  recentTrayItems.innerHTML = '';
  const validBoards = recentBoards.filter((b) => findCardByBoard(b));

  if (validBoards.length === 0) {
    recentTray.hidden = true;
    document.body.classList.remove('has-recent-tray');
    return;
  }

  validBoards.forEach((board) => {
    const card = findCardByBoard(board);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'recent-tray-item ' + card.dataset.deckClass;
    btn.setAttribute('aria-label', 'View ' + board);
    btn.addEventListener('click', () => openDrawer(card));
    recentTrayItems.appendChild(btn);
  });

  recentTray.hidden = false;
  document.body.classList.add('has-recent-tray');
}

function recordRecent(board) {
  recentBoards = [board, ...recentBoards.filter((b) => b !== board)].slice(0, MAX_RECENT);
  saveRecent(recentBoards);
  renderRecentTray();
}

renderRecentTray();

/* 3D tilt on hover (desktop, motion allowed) */

const supportsHoverTilt = !prefersReducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (supportsHoverTilt) {
  shopCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-4px) rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* Scroll parallax in hero */

if (!prefersReducedMotion) {
  const heroLogo = document.querySelector('.hero-logo');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const offset = Math.min(window.scrollY, 400);
      heroLogo.style.transform = `translateY(${(offset * 0.15).toFixed(1)}px)`;
      ticking = false;
    });
  }, { passive: true });
}

const revealEls = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach((el) => observer.observe(el));

const shopCards = document.querySelectorAll('.shop-card');
const orderBoardField = document.getElementById('order-board');

shopCards.forEach((card) => {
  card.addEventListener('click', () => {
    shopCards.forEach((c) => c.classList.remove('selected'));
    card.classList.add('selected');

    const board = card.dataset.board;
    const price = card.dataset.price;
    orderBoardField.value = `${board} (${price})`;

    document.getElementById('order').scrollIntoView({ behavior: 'smooth', block: 'start' });
    const nameField = document.querySelector('#order-form input[name="name"]');
    if (nameField) nameField.focus({ preventScroll: true });
  });
});

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

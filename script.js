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

const form = document.getElementById('quote-form');
const note = document.getElementById('form-note');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = form.name.value.trim();
  const email = form.email.value.trim();

  if (!name || !email) {
    note.textContent = 'Please fill in your name and email.';
    note.style.color = '#a11c1c';
    return;
  }

  const deckSize = form.deck_size.value.trim();
  const team = form.team.value.trim();
  const message = form.message.value.trim();

  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    deckSize ? `Deck size: ${deckSize}` : null,
    team ? `Team / colors: ${team}` : null,
    message ? `Message: ${message}` : null,
  ].filter(Boolean).join('\n');

  const mailto = `mailto:hello@hometurfwraps.com?subject=${encodeURIComponent('Custom wrap quote request')}&body=${encodeURIComponent(body)}`;

  window.location.href = mailto;
  note.style.color = 'var(--muted)';
  note.textContent = 'Opening your email client to send the request...';
});

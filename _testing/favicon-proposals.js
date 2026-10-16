(() => {
  const icon = document.querySelector('#preview-icon');
  const status = document.querySelector('#preview-status');
  const buttons = [...document.querySelectorAll('[data-icon]')];
  for (const button of buttons) {
    button.addEventListener('click', () => {
      icon.href = button.dataset.icon;
      icon.type = 'image/svg+xml';
      status.textContent = `Previewing: ${button.dataset.name}`;
      for (const other of buttons) other.setAttribute('aria-pressed', String(other === button));
    });
  }
  document.querySelector('#reset').addEventListener('click', () => {
    icon.href = '../favicon.ico';
    icon.removeAttribute('type');
    status.textContent = 'Previewing the current icon';
    for (const button of buttons) button.setAttribute('aria-pressed', 'false');
  });
})();

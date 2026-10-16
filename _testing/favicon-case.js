(() => {
  const icon16 = document.querySelector('#preview-16');
  const icon32 = document.querySelector('#preview-32');
  const status = document.querySelector('#preview-status');
  const buttons = [...document.querySelectorAll('[data-icon]')];
  function select(button, updateURL = true) {
    icon16.href = `${button.dataset.icon}-16.png`;
    icon32.href = `${button.dataset.icon}-32.png`;
    status.textContent = `Previewing: ${button.dataset.name}`;
    for (const other of buttons) {
      const selected = other === button;
      other.setAttribute('aria-pressed', String(selected));
      other.closest('.choice').classList.toggle('active', selected);
    }
    if (updateURL) {
      const url = new URL(location.href);
      url.searchParams.set('pick', button.dataset.number);
      history.replaceState(null, '', url);
    }
  }
  for (const button of buttons) button.addEventListener('click', () => select(button));
  const initial = new URLSearchParams(location.search).get('pick') || '13';
  select(buttons.find(button => button.dataset.number === initial) || buttons[1], false);
})();

(() => {
  const designs = {
    column: {
      file: 'text-column.html', title: '01 / Quiet column',
      description: 'The closest continuation of your original site. The name stays compact, the JMP gets the largest paper title, and the AER status sits above its paper.',
      assessment: 'My pick for your brief: enough structure to feel deliberate, while keeping the understated personal-site character. The CV is visible alongside the job-market notice.'
    },
    margin: {
      file: 'text-margin.html', title: '02 / Margin notes',
      description: 'Small numbered labels occupy the left margin. All substantive content follows a shared text axis. On phones, the labels sit just above their sections.',
      assessment: 'Choose this for a more distinctive composition without adding graphics. The annotation column uses more horizontal space, and the phone page is a little longer.'
    },
    index: {
      file: 'text-index.html', title: '03 / Research index',
      description: 'A bold sans-serif name above a compact monospace research catalogue. Brackets, slashes, and numbered entries echo the original text-based navigation.',
      assessment: 'Choose this for a stronger personal identity. The monospace paper titles feel more technical and take more space than the proportional text in Quiet column.'
    },
    current: {
      file: '../index.html', title: 'Current homepage',
      description: 'Your existing front page, including the recently added job-market status and papers.',
      assessment: 'The main opportunity is hierarchy: give the JMP, publication status, and contact details their own place in the composition.'
    }
  };
  const frame = document.querySelector('#design-frame');
  const stage = document.querySelector('#study-stage');
  const viewport = document.querySelector('#study-viewport');
  const designButtons = [...document.querySelectorAll('[data-design]')];
  const deviceButtons = [...document.querySelectorAll('[data-device].study-device')];
  const currentButton = document.querySelector('#compare-current');
  const params = new URLSearchParams(location.search);
  let selected = Object.hasOwn(designs, params.get('design')) && params.get('design') !== 'current' ? params.get('design') : 'column';
  let comparing = params.get('compare') === 'current';
  let device = params.get('device') === 'phone' || (!params.has('device') && matchMedia('(max-width: 600px)').matches) ? 'phone' : 'desktop';

  function fitPreview() {
    const naturalWidth = device === 'phone' ? 390 : 1160;
    const naturalHeight = device === 'phone' ? 780 : 900;
    const scale = Math.min(1, viewport.clientWidth / naturalWidth);
    viewport.style.height = `${Math.ceil(naturalHeight * scale)}px`;
    frame.style.width = `${naturalWidth}px`;
    frame.style.height = `${naturalHeight}px`;
    frame.style.transform = `scale(${scale})`;
    frame.style.marginInline = scale === 1 ? 'auto' : '0';
  }

  function remember() {
    const next = new URL(location.href);
    next.searchParams.set('design', selected);
    next.searchParams.set('device', device);
    if (comparing) next.searchParams.set('compare', 'current');
    else next.searchParams.delete('compare');
    try { history.replaceState(null, '', next); } catch { /* Some file previews restrict history changes. */ }
  }

  function renderDesign() {
    const design = designs[comparing ? 'current' : selected];
    frame.src = design.file + (comparing ? '' : '?preview');
    frame.title = `${design.title} homepage preview`;
    document.querySelector('#open-design').href = design.file;
    document.querySelector('#design-title').textContent = design.title;
    document.querySelector('#design-description').textContent = design.description;
    document.querySelector('#design-assessment').textContent = design.assessment;
    designButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.design === selected)));
    currentButton.setAttribute('aria-pressed', String(comparing));
    currentButton.textContent = comparing ? 'return to proposal' : 'compare with current';
    remember();
  }

  function renderDevice() {
    stage.dataset.device = device;
    deviceButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.device === device)));
    fitPreview();
    remember();
  }

  designButtons.forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.design;
    comparing = false;
    renderDesign();
  }));
  deviceButtons.forEach(button => button.addEventListener('click', () => {
    device = button.dataset.device;
    renderDevice();
  }));
  currentButton.addEventListener('click', () => { comparing = !comparing; renderDesign(); });
  frame.addEventListener('load', () => {
    // Browsers may isolate file:// documents; the design still works in that case.
    try { frame.contentDocument.documentElement.classList.add('in-review'); } catch { /* Keep standalone navigation visible. */ }
    fitPreview();
  });
  if ('ResizeObserver' in window) new ResizeObserver(fitPreview).observe(viewport);
  else addEventListener('resize', fitPreview);
  renderDesign();
  renderDevice();
})();

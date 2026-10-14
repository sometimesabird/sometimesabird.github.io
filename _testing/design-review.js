(() => {
  const designs = {
    editorial: {
      title: '01 / Editorial',
      file: 'design-editorial.html',
      description: 'Large serif typography, generous space, and fine rules. Your job-market status has a small inset panel; the two papers sit side by side.',
      assessment: 'Best for a quiet academic presence. The tradeoff: the two papers receive similar emphasis, so the JMP has less prominence than in the other options.'
    },
    split: {
      title: '02 / Split profile',
      file: 'design-split.html',
      description: 'A darker profile column holds your affiliation, fields, CV, and contact. Research gets the wider column, with the job-market paper featured above the AER paper.',
      assessment: 'My recommendation for the job market: visitors can find your JMP and CV immediately. The tradeoff is a longer phone page because the profile stacks above the research.'
    },
    folio: {
      title: '03 / Folio',
      file: 'design-folio.html',
      description: 'Bold sans-serif typography and a cream job-market-paper panel against warm charcoal. The AER paper occupies a smaller dark panel alongside it.',
      assessment: 'Best for visual impact. The tradeoff: the large cream panel is more assertive than the rest of your current aesthetic.'
    },
    compact: {
      title: '04 / Field notes',
      file: 'design-compact.html',
      description: 'A compact masthead, a geometric bird, and a numbered research index. The JMP has its own dark inset; the AER status sits directly above the second paper’s title.',
      assessment: 'Best for retaining your personal character while keeping the research easy to scan. The bird is optional; the numbered layout also works without it.'
    },
    current: {
      title: 'Current homepage',
      file: '../index.html',
      description: 'The existing page, with the recently added job-market status and selected research.',
      assessment: 'The content is useful, but similar type sizes and spacing make affiliation, personal information, research, and job-market details run together.'
    }
  };

  const frame = document.querySelector('#design-frame');
  const stage = document.querySelector('#review-stage');
  const viewport = document.querySelector('#review-viewport');
  const designButtons = [...document.querySelectorAll('[data-design]')];
  const deviceButtons = [...document.querySelectorAll('[data-device].review-device')];
  const params = new URLSearchParams(location.search);
  let selected = Object.hasOwn(designs, params.get('design')) ? params.get('design') : 'split';
  let device = params.get('device') === 'phone' || (!params.has('device') && matchMedia('(max-width: 760px)').matches) ? 'phone' : 'desktop';

  function fitPreview() {
    const naturalWidth = device === 'phone' ? 390 : 1440;
    const scale = Math.min(1, viewport.clientWidth / naturalWidth);
    const visibleHeight = device === 'phone' ? 710 : 900;
    viewport.style.height = `${Math.round(visibleHeight * scale)}px`;
    frame.style.width = `${naturalWidth}px`;
    frame.style.height = `${visibleHeight}px`;
    frame.style.transform = `scale(${scale})`;
  }

  function rememberSelection() {
    const next = new URL(location.href);
    next.searchParams.set('design', selected);
    next.searchParams.set('device', device);
    // Some browsers restrict history changes on file:// pages.
    try { history.replaceState(null, '', next); } catch { /* Preview still works. */ }
  }

  function selectDesign(key) {
    selected = key;
    const design = designs[key];
    frame.src = `${design.file}?clean`;
    frame.title = `${design.title} homepage preview`;
    document.querySelector('#open-design').href = design.file;
    document.querySelector('#design-title').textContent = design.title;
    document.querySelector('#design-description').textContent = design.description;
    document.querySelector('#design-assessment').textContent = design.assessment;
    designButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.design === key)));
    rememberSelection();
  }

  function selectDevice(key) {
    device = key;
    stage.dataset.device = device;
    deviceButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.device === device)));
    fitPreview();
    rememberSelection();
  }

  designButtons.forEach(button => button.addEventListener('click', () => selectDesign(button.dataset.design)));
  deviceButtons.forEach(button => button.addEventListener('click', () => selectDevice(button.dataset.device)));
  new ResizeObserver(fitPreview).observe(viewport);
  frame.addEventListener('load', fitPreview);
  selectDesign(selected);
  selectDevice(device);
})();

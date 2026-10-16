// the pointer as a light on the glass (glass-studies.css, "the material").
// the fixed lamp sits up and to the left of the page; the pointer pulls each
// surface's rim highlight toward itself, by the study's --rim-follow share,
// and lays a glint on the surface under it that fades with distance. the
// pointer is smoothed before use, so the light lags a hair behind the hand
// and nothing twitches, and when it leaves the window the light fades out,
// leaving every surface exactly at rest. hover-capable pointers without a
// reduced-motion preference only. ?lamp=x,y pins the pointer at viewport
// coordinates, for screenshots.
(function () {
  var SURFACES = '.side, .card, .market, .question, .site-nav, .portrait, .badge, .copy, .icon-links a, .text-link, .copied';
  var REST = 315;      // deg: the fixed lamp's direction, 0 up and clockwise
  var REACH = 360;     // px: how far past a surface's edge the glint still reaches
  var SMOOTH = 0.1;    // s: time constant of the pointer smoothing
  var FADE_IN = 0.3, FADE_OUT = 0.7; // s: the light's arrival and departure
  var DEG = 180 / Math.PI;

  var query = new URLSearchParams(location.search);
  var pinned = query.get('lamp');
  var able = !!pinned || (window.matchMedia && matchMedia('(hover: hover)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (!able) return;

  var follow = parseFloat(getComputedStyle(document.body).getPropertyValue('--rim-follow'));
  if (isNaN(follow)) follow = 0.5;
  var surfaces = [].slice.call(document.querySelectorAll(SURFACES));
  var rx = Math.sin(REST / DEG), ry = -Math.cos(REST / DEG);
  var tx = 0, ty = 0, sx = 0, sy = 0, w = 0, present = false, seen = false;
  var raf = 0, last = 0;

  if (pinned) {
    var at = pinned.split(',');
    sx = +at[0] || 0;
    sy = +at[1] || 0;
    w = 1;
    paint();
    return;
  }

  document.addEventListener('pointermove', function (event) {
    if (event.pointerType === 'touch') return;
    tx = event.clientX;
    ty = event.clientY;
    if (!seen) { sx = tx; sy = ty; seen = true; }
    present = true;
    start();
  });
  document.addEventListener('pointerout', function (event) {
    if (!event.relatedTarget) leave();
  });
  window.addEventListener('blur', leave);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) leave();
  });
  document.addEventListener('scroll', start, { passive: true });
  window.addEventListener('resize', start);

  function leave() {
    present = false;
    start();
  }

  function start() {
    if (!raf && seen) raf = requestAnimationFrame(frame);
  }

  function frame(now) {
    raf = 0;
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    var k = 1 - Math.exp(-dt / SMOOTH);
    sx += (tx - sx) * k;
    sy += (ty - sy) * k;
    var target = present ? 1 : 0;
    w += (target - w) * (1 - Math.exp(-dt / (present ? FADE_IN : FADE_OUT)));
    var settled = Math.abs(tx - sx) < 0.2 && Math.abs(ty - sy) < 0.2 && Math.abs(target - w) < 0.002;
    if (settled) { sx = tx; sy = ty; w = target; last = 0; }
    paint();
    if (!settled) raf = requestAnimationFrame(frame);
  }

  // for each surface: the rim's bright point is the lamp's direction blended
  // toward the pointer's, as unit vectors so the blend never jumps across
  // the wrap; the glint sits at the pointer in the surface's own coordinates,
  // full inside the surface and fading smoothly to nothing REACH px outside
  function paint() {
    var rects = surfaces.map(function (el) { return el.getBoundingClientRect(); });
    surfaces.forEach(function (el, i) {
      var r = rects[i];
      if (!r.width) return;
      var dx = sx - (r.left + r.width / 2), dy = sy - (r.top + r.height / 2);
      var d = Math.hypot(dx, dy) || 1;
      var k = follow * w;
      var vx = (1 - k) * rx + k * dx / d, vy = (1 - k) * ry + k * dy / d;
      var ang = Math.atan2(vx, -vy) * DEG;
      if (ang < 0) ang += 360;
      var ox = Math.max(r.left - sx, 0, sx - r.right), oy = Math.max(r.top - sy, 0, sy - r.bottom);
      var q = 1 - Math.min(1, Math.hypot(ox, oy) / REACH);
      q = q * q * (3 - 2 * q);
      var s = el.style;
      s.setProperty('--ang', ang.toFixed(2));
      s.setProperty('--px', (sx - r.left).toFixed(1) + 'px');
      s.setProperty('--py', (sy - r.top).toFixed(1) + 'px');
      s.setProperty('--lw', (w * q).toFixed(3));
    });
  }
})();

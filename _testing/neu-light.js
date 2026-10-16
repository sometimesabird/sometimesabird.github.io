// the pointer as a second lamp (neu-light-*.html, neu-light.css). the page's
// fixed lamp up and to the left stays the main light; the pointer is a weak
// second one, read three ways by the three studies:
//   sway — the lamp's direction tilts toward the pointer for the whole page
//   lamp — a point lamp over the desk, read separately by each surface
//   full — that lamp alone: shadows fall straight away from the pointer
//   glow — no geometry changes; a pool of light and a rim glint follow it
// the pointer is smoothed before use, so the light lags a hair behind the
// hand and nothing twitches, and when the pointer leaves the window the
// second lamp fades out, leaving 01c exactly as it was. the dial scales the
// whole effect and remembers its setting per study. hover-capable pointers
// without a reduced-motion preference only. ?lamp=x,y pins the pointer at
// viewport coordinates for screenshots; ?dial=n sets the dial for them.
(function () {
    var body = document.body;
    var mode = body.classList.contains('neu-light-sway') ? 'sway'
        : body.classList.contains('neu-light-lamp') ? 'lamp'
        : body.classList.contains('neu-light-lamp-full') ? 'full'
        : body.classList.contains('neu-light-glow') ? 'glow' : null;
    if (!mode) return;
    var query = new URLSearchParams(location.search);
    var pinned = query.get('lamp');
    if (!pinned && (!window.matchMedia || !matchMedia('(hover: hover)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches)) return;

    var SURFACES = '.slab, .key, .portrait, .market, .question, .badge, .site-nav a, .proposal-menu summary, .proposal-menu nav, .light-dial';
    // the pointer lamp's share against the fixed lamp. the point lamp is read
    // from each surface, and the far ones feel all of it, so it gets less
    var WEIGHT = mode === 'lamp' ? 0.32 : 0.4;
    var LAMP_H = 700;    // px: the lamp's height over the desk; a surface this far away feels its full weight (lamp)
    var LAMP_REACH = 1.5;// in heights: the pointer term stops growing past this distance (lamp)
    var LEN_MIN = 0.85, LEN_MAX = 1.1; // bounds on shadow length as the two lamps add or cancel (lamp)
    var FULL_H = 0.3;    // of the window's width: the full lamp's height; a surface this far away casts a rest-length shadow (full)
    var FULL_MAX = 1.25; // in rest lengths: the longest shadow the full lamp casts (full)
    var FULL_FLAT = 0.5; // in heights: the distance within which the surface gradient flattens toward the lamp (full)
    var GLINT_REACH = 480; // px from the surface's edge at which the glint has faded out (glow)
    var SMOOTH = 0.1;    // s: time constant of the pointer smoothing
    var FADE_IN = 0.3, FADE_OUT = 0.7; // s: the second lamp's arrival and departure

    var SQ = Math.SQRT1_2, DEG = 180 / Math.PI;
    var surfaces = [].slice.call(document.querySelectorAll(SURFACES));
    var tx = 0, ty = 0, sx = 0, sy = 0, w = 0, present = false, seen = false;
    var dial = 1, raf = 0, last = 0;

    // the dial: 100% is the default, 0 is off, 200% twice the default; for
    // the full lamp it is the pointer's share against the fixed lamp, 0 to 100%
    var input = document.querySelector('.light-dial input');
    var output = document.querySelector('.light-dial output');
    var key = 'neu-light-dial-' + mode;
    if (input) {
        try { var saved = localStorage.getItem(key); if (saved !== null) input.value = saved; } catch (e) {}
        if (query.has('dial')) input.value = query.get('dial');
        readDial();
        input.addEventListener('input', function () {
            readDial();
            try { localStorage.setItem(key, input.value); } catch (e) {}
            start();
        });
    }
    function readDial() {
        dial = input.value / 100;
        if (output) output.textContent = input.value + '%';
    }

    if (pinned) {
        var at = pinned.split(',');
        tx = sx = +at[0] || 0;
        ty = sy = +at[1] || 0;
        w = 1;
        present = seen = true;
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

    function paint() {
        if (mode === 'sway') sway();
        else if (mode === 'lamp') lamp();
        else if (mode === 'full') full();
        else glow();
    }

    // the lamp's rays run from the pointer toward the middle of the window;
    // added at a fraction of their weight to the fixed lamp's, they tilt the
    // one direction every shadow on the page shares. the vector is written
    // once, on the body, and inherited
    function sway() {
        var R = Math.hypot(innerWidth, innerHeight) / 2;
        var k = WEIGHT * dial * w;
        var vx = SQ + k * (innerWidth / 2 - sx) / R;
        var vy = SQ + k * (innerHeight / 2 - sy) / R;
        write(body, vx, vy, 1);
    }

    // a point lamp: for each surface, the rays run from the pointer to the
    // surface's centre, growing with distance as a near light's shadows do,
    // and add to the fixed lamp's. where the two agree the shadow lengthens
    // a little; where they oppose, it shortens and stands more upright
    function lamp() {
        var k = WEIGHT * dial * w;
        var rects = surfaces.map(function (el) { return el.getBoundingClientRect(); });
        surfaces.forEach(function (el, i) {
            var r = rects[i];
            if (!r.width) return;
            var dx = (r.left + r.width / 2 - sx) / LAMP_H;
            var dy = (r.top + r.height / 2 - sy) / LAMP_H;
            var d = Math.hypot(dx, dy);
            if (d > LAMP_REACH) { dx *= LAMP_REACH / d; dy *= LAMP_REACH / d; }
            var vx = SQ + k * dx, vy = SQ + k * dy;
            var n = Math.hypot(vx, vy);
            write(el, vx, vy, Math.min(LEN_MAX, Math.max(LEN_MIN, n)));
        });
    }

    // the pointer as the only lamp: the shadow vector is the run from the
    // pointer to the surface's centre over the lamp's height, so it points
    // straight away from the pointer, reaches rest length one height out,
    // and vanishes under it. the dial mixes the fixed lamp back in; the
    // mix passes through zero smoothly, so nothing snaps as the pointer
    // crosses a centre, and the surface gradient flattens there too
    function full() {
        var share = Math.min(1, dial) * w;
        var H = Math.min(640, Math.max(320, innerWidth * FULL_H));
        var rects = surfaces.map(function (el) { return el.getBoundingClientRect(); });
        surfaces.forEach(function (el, i) {
            var r = rects[i];
            if (!r.width) return;
            var dx = (r.left + r.width / 2 - sx) / H;
            var dy = (r.top + r.height / 2 - sy) / H;
            var d = Math.hypot(dx, dy);
            if (d > FULL_MAX) { dx *= FULL_MAX / d; dy *= FULL_MAX / d; d = FULL_MAX; }
            var vx = (1 - share) * SQ + share * dx, vy = (1 - share) * SQ + share * dy;
            var flat = Math.min(1, d / FULL_FLAT);
            write(el, vx, vy, 1, false, 1 - share + share * flat);
        });
    }

    // the lamp vector (--lx, --ly), scaled so rest is (1, 1): unit length
    // unless the caller keeps the length in it; --lm is the length factor;
    // --la the gradient angle, 145 at rest; --lc the gradient contrast
    function write(el, vx, vy, m, unit, lc) {
        var n = unit === false ? 1 : Math.hypot(vx, vy) || 1;
        var s = el.style;
        s.setProperty('--lx', (vx / n * Math.SQRT2).toFixed(4));
        s.setProperty('--ly', (vy / n * Math.SQRT2).toFixed(4));
        s.setProperty('--lm', m.toFixed(4));
        s.setProperty('--la', (145 + Math.atan2(vx, -vy) * DEG - 135).toFixed(2));
        s.setProperty('--lc', (lc === undefined ? 1 : lc).toFixed(4));
    }

    // the pool is centred on the pointer in each surface's own coordinates,
    // and in the document's for the page; the glint faces the pointer and
    // fades with the pointer's distance from the surface's edge
    function glow() {
        var pool = dial * w;
        var bs = body.style;
        bs.setProperty('--pool', pool.toFixed(4));
        bs.setProperty('--px', sx.toFixed(1));
        bs.setProperty('--py', (sy + (window.scrollY || 0)).toFixed(1));
        var rects = surfaces.map(function (el) { return el.getBoundingClientRect(); });
        surfaces.forEach(function (el, i) {
            var r = rects[i];
            if (!r.width) return;
            var s = el.style;
            s.setProperty('--px', (sx - r.left).toFixed(1));
            s.setProperty('--py', (sy - r.top).toFixed(1));
            var ex = Math.max(r.left - sx, 0, sx - r.right);
            var ey = Math.max(r.top - sy, 0, sy - r.bottom);
            var g = pool * Math.max(0, 1 - Math.hypot(ex, ey) / GLINT_REACH);
            var dx = r.left + r.width / 2 - sx, dy = r.top + r.height / 2 - sy;
            var n = Math.max(Math.hypot(dx, dy), 40);
            s.setProperty('--gx', (dx / n).toFixed(4));
            s.setProperty('--gy', (dy / n).toFixed(4));
            s.setProperty('--g', g.toFixed(4));
        });
    }
})();

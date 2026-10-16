// themes: the fun page offers five (the picker there), and a short script in
// the head of every page reads the choice and loads that theme's stylesheet
// before anything paints. this runs after the page and does the rest:
//   - the picker on the fun page, which swaps the stylesheet in place
//   - what a theme adds to the shared markup: the neumorphic sun/moon key in
//     the sidebar, the instrument's four screws
//   - the neumorphic pointer lamp (below)
// the choice and the dark/light preference live in localStorage ('theme',
// 'theme-light'); the head script reads them first and leaves them, with the
// stylesheet map and the marking routine, as window.siteTheme.
(function () {
    var site = window.siteTheme;
    if (!site) return;
    var theme = site.theme, light = site.light;
    var sheet = document.querySelector('link[data-theme-sheet]');
    var radios = [].slice.call(document.querySelectorAll('.theme-picker input[name="theme"]'));

    function neu() { return theme.indexOf('neu') === 0; }

    // ------------------------------------------------------------------
    // switching: the new stylesheet is fetched first and the old one dropped
    // only once it has arrived, so the page is never left unstyled; the html
    // marks, the trimmings and the lamp change at that same moment
    // ------------------------------------------------------------------
    function setTheme(next, nextLight) {
        theme = next;
        light = !!nextLight;
        try {
            localStorage.setItem('theme', theme);
            localStorage.setItem('theme-light', light ? '1' : '0');
        } catch (e) {}
        var href = site.sheets[theme];
        if (sheet && sheet.getAttribute('href') === href) { settle(); return; }
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.setAttribute('data-theme-sheet', '');
        link.onload = link.onerror = function () {
            // a quicker switch may have overtaken this one
            if (link.getAttribute('href') !== site.sheets[theme]) { link.remove(); return; }
            if (sheet && sheet !== link) sheet.remove();
            sheet = link;
            settle();
        };
        document.head.appendChild(link);
    }

    // the lamp lets go of the old surfaces before the trimmings gather the new
    function settle() {
        site.mark(theme, light);
        lamp.reset();
        trim();
        radios.forEach(function (radio) { radio.checked = radio.value === theme; });
    }

    radios.forEach(function (radio) {
        radio.addEventListener('change', function () {
            if (radio.checked) setTheme(radio.value, light);
        });
    });

    // ------------------------------------------------------------------
    // trimmings: the neumorphic theme's key for dark and light, at the top
    // right of the sidebar (theme-neu.css places it); the instrument's four
    // screws, one in each corner of the faceplate. both are added and taken
    // away as the theme changes, so the other themes never see them
    // ------------------------------------------------------------------
    var key = null, screws = null;
    var SUN = '<svg class="icon-sun" viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><circle cx="8" cy="8" r="3"/><path d="M8 1.2v1.5M8 13.3v1.5M1.2 8h1.5M13.3 8h1.5M3.2 3.2l1.05 1.05M11.75 11.75l1.05 1.05M3.2 12.8l1.05-1.05M11.75 4.25l1.05-1.05"/></svg>';
    var MOON = '<svg class="icon-moon" viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M14 8.53A6 6 0 1 1 7.47 2 4.67 4.67 0 0 0 14 8.53z"/></svg>';

    function trim() {
        var side = document.querySelector('.side');
        var page = document.querySelector('.page');
        if (neu() && side && !key) {
            key = document.createElement('button');
            key.type = 'button';
            key.className = 'theme-toggle';
            key.innerHTML = SUN + MOON;
            key.addEventListener('click', function () { setTheme(theme, !light); });
            side.appendChild(key);
        } else if (!neu() && key) {
            key.remove();
            key = null;
        }
        if (key) {
            var text = (light ? 'Light' : 'Dark') + ' theme. Switch to ' + (light ? 'dark' : 'light') + ' theme';
            key.setAttribute('aria-label', text);
            key.title = text;
        }
        if (theme === 'instrument' && page && !screws) {
            screws = document.createElement('div');
            screws.className = 'screws';
            screws.setAttribute('aria-hidden', 'true');
            screws.innerHTML = '<span></span><span></span><span></span><span></span>';
            page.prepend(screws);
        } else if (theme !== 'instrument' && screws) {
            screws.remove();
            screws = null;
        }
        lamp.collect();
    }

    // ------------------------------------------------------------------
    // the pointer as a second lamp (theme-neu.css, "the lamp"). the fixed
    // lamp up and to the left stays the main light; the pointer is a weak
    // second one, read two ways:
    //   Neumorphic — a small lamp hangs over the desk; each surface's shadow
    //     leans away from it and shortens as it comes near, so things react
    //     one by one as the pointer passes
    //   Neumorphic Reactive — that lamp alone: shadows fall straight away
    //     from the pointer, long when it is far and gone when it is overhead,
    //     where the surface sits flat in its own soft halo
    // the pointer is smoothed before use, so the light lags a hair behind the
    // hand and nothing twitches, and when the pointer leaves the window the
    // second lamp fades out, leaving every surface exactly at rest. hover-
    // capable pointers without a reduced-motion preference only. ?lamp=x,y
    // pins the pointer at viewport coordinates, for screenshots
    // ------------------------------------------------------------------
    var lamp = (function () {
        var SURFACES = '.side, .card, .research-jmp, .portrait, .market, .question, .badge, .site-nav a, .copy, .icon-links a, .text-link, .theme-toggle, .theme-picker label, .abstract-text';
        var WEIGHT = 0.32;    // the pointer lamp's share against the fixed lamp
        var LAMP_H = 700;     // px: the lamp's height over the desk; a surface this far away feels its full weight
        var LAMP_REACH = 1.5; // in heights: the pointer term stops growing past this distance
        var LEN_MIN = 0.85, LEN_MAX = 1.1; // bounds on shadow length as the two lamps add or cancel
        var FULL_H = 0.3;     // of the window's width: the full lamp's height; a surface this far away casts a rest-length shadow
        var FULL_MAX = 1.25;  // in rest lengths: the longest shadow the full lamp casts
        var FULL_FLAT = 0.5;  // in heights: the distance within which the surface gradient flattens toward the lamp
        var SMOOTH = 0.1;     // s: time constant of the pointer smoothing
        var FADE_IN = 0.3, FADE_OUT = 0.7; // s: the second lamp's arrival and departure
        var VARS = ['--lx', '--ly', '--lm', '--la', '--lc'];

        var SQ = Math.SQRT1_2, DEG = 180 / Math.PI;
        var surfaces = [];
        var tx = 0, ty = 0, sx = 0, sy = 0, w = 0, present = false, seen = false;
        var raf = 0, last = 0;
        var pinned = new URLSearchParams(location.search).get('lamp');
        var able = !!pinned || (window.matchMedia && matchMedia('(hover: hover)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches);

        function mode() {
            return !able ? null : theme === 'neu' ? 'lamp' : theme === 'neu-reactive' ? 'full' : null;
        }

        function collect() {
            surfaces = [].slice.call(document.querySelectorAll(SURFACES));
            if (pinned && mode()) {
                var at = pinned.split(',');
                tx = sx = +at[0] || 0;
                ty = sy = +at[1] || 0;
                w = 1;
                present = seen = true;
                paint();
            } else {
                start();
            }
        }

        // every surface back to the fixed lamp alone
        function reset() {
            surfaces.forEach(function (el) {
                VARS.forEach(function (name) { el.style.removeProperty(name); });
            });
        }

        if (able && !pinned) {
            document.addEventListener('pointermove', function (event) {
                if (event.pointerType === 'touch' || !mode()) return;
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
        }

        function leave() {
            present = false;
            start();
        }

        function start() {
            if (!raf && seen && mode()) raf = requestAnimationFrame(frame);
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
            var m = mode();
            if (m === 'lamp') overhead();
            else if (m === 'full') alone();
        }

        // a point lamp: for each surface, the rays run from the pointer to the
        // surface's centre, growing with distance as a near light's shadows
        // do, and add to the fixed lamp's. where the two agree the shadow
        // lengthens a little; where they oppose, it shortens and stands more
        // upright
        function overhead() {
            var k = WEIGHT * w;
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
                write(el, vx, vy, Math.min(LEN_MAX, Math.max(LEN_MIN, n)), true, 1);
            });
        }

        // the pointer as the only lamp: the shadow vector is the run from the
        // pointer to the surface's centre over the lamp's height, so it points
        // straight away from the pointer, reaches rest length one height out,
        // and vanishes under it. as the pointer arrives or leaves, the fixed
        // lamp is mixed back in; the mix passes through zero smoothly, so
        // nothing snaps as the pointer crosses a centre, and the surface
        // gradient flattens there too
        function alone() {
            var share = w;
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
        // when asked, else as given; --lm the length factor; --la the gradient
        // angle, 145 at rest; --lc the gradient contrast
        function write(el, vx, vy, m, unit, lc) {
            var n = unit ? Math.hypot(vx, vy) || 1 : 1;
            var s = el.style;
            s.setProperty('--lx', (vx / n * Math.SQRT2).toFixed(4));
            s.setProperty('--ly', (vy / n * Math.SQRT2).toFixed(4));
            s.setProperty('--lm', m.toFixed(4));
            s.setProperty('--la', (145 + Math.atan2(vx, -vy) * DEG - 135).toFixed(2));
            s.setProperty('--lc', lc.toFixed(4));
        }

        return { collect: collect, reset: reset };
    })();

    settle();
})();

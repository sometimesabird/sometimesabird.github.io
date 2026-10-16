// themes: the fun page offers six (the picker there), and a short script in
// the head of every page reads the choice and loads that theme's stylesheet
// before anything paints. this runs after the page and does the rest:
//   - the picker on the fun page, which swaps the stylesheet in place
//   - what a theme adds to the shared markup: the neumorphic sun/moon key in
//     the sidebar, the instrument's four screws, the glass's refraction filter
//   - the neumorphic pointer lamp and the glass's pointer light (below)
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

    // the lights let go of the old surfaces before the trimmings gather the new
    function settle() {
        site.mark(theme, light);
        lamp.reset();
        shine.reset();
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
    // screws, one in each corner of the faceplate; the glass theme's
    // refraction filter, an SVG with no size of its own that the sheets'
    // backdrop-filter points at (theme-glass.css, "the material"), with the
    // html marked lens-ok where the browser can bend a backdrop through it
    // (Chromium; Safari and Firefox keep the plain blur). all are added and
    // taken away as the theme changes, so the other themes never see them
    // ------------------------------------------------------------------
    var key = null, screws = null, lens = null;
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
        if (theme === 'glass' && !lens) {
            lens = document.createElement('div');
            lens.className = 'lens-filter';
            lens.setAttribute('aria-hidden', 'true');
            lens.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
            lens.innerHTML = LENS;
            document.body.appendChild(lens);
            document.documentElement.classList.toggle('lens-ok', !!window.chrome && !!window.CSS && CSS.supports('backdrop-filter', 'url(#x)'));
        } else if (theme !== 'glass' && lens) {
            lens.remove();
            lens = null;
            document.documentElement.classList.remove('lens-ok');
        }
        lamp.collect();
        shine.collect();
    }

    // the refraction: a displacement map (a 256px PNG; red is x, green is y,
    // 128 is no displacement) stretched over each sheet, neutral deep inside
    // and pushing outward in a band along the edge of a rounded rectangle,
    // so the backdrop is magnified at the rim as through thick glass
    var LENS = '<svg width="0" height="0"><filter id="lens" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
        '<feImage href="data:image/png;base64,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" result="map" preserveAspectRatio="none"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="map" scale="40" xChannelSelector="R" yChannelSelector="G"/></filter></svg>';

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

    // ------------------------------------------------------------------
    // the pointer as a light on the glass (theme-glass.css, "the material").
    // the fixed lamp sits up and to the left of the page; the pointer pulls
    // each surface's rim highlight toward itself, by the theme's --rim-follow
    // share, and lays a glint on the surface under it that fades with
    // distance. the pointer is smoothed before use, so the light lags a hair
    // behind the hand and nothing twitches, and when it leaves the window the
    // light fades out, leaving every surface exactly at rest. hover-capable
    // pointers without a reduced-motion preference only; ?lamp=x,y pins the
    // pointer, as for the lamp above
    // ------------------------------------------------------------------
    var shine = (function () {
        var SURFACES = '.side, .card, .research-jmp, .market, .question, .abstract-text, .site-nav, .theme-picker, .portrait, .badge, .copy, .icon-links a, .text-link, .copied';
        var REST = 315;      // deg: the fixed lamp's direction, 0 up and clockwise
        var REACH = 360;     // px: how far past a surface's edge the glint still reaches
        var SMOOTH = 0.1;    // s: time constant of the pointer smoothing
        var FADE_IN = 0.3, FADE_OUT = 0.7; // s: the light's arrival and departure
        var VARS = ['--ang', '--px', '--py', '--lw'];

        var DEG = 180 / Math.PI;
        var rx = Math.sin(REST / DEG), ry = -Math.cos(REST / DEG);
        var surfaces = [], follow = 1;
        var tx = 0, ty = 0, sx = 0, sy = 0, w = 0, present = false, seen = false;
        var raf = 0, last = 0;
        var pinned = new URLSearchParams(location.search).get('lamp');
        var able = !!pinned || (window.matchMedia && matchMedia('(hover: hover)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches);

        function on() { return able && theme === 'glass'; }

        function collect() {
            if (!on()) { surfaces = []; return; }
            surfaces = [].slice.call(document.querySelectorAll(SURFACES));
            follow = parseFloat(getComputedStyle(document.body).getPropertyValue('--rim-follow'));
            if (isNaN(follow)) follow = 1;
            if (pinned) {
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
            surfaces = [];
        }

        if (able && !pinned) {
            document.addEventListener('pointermove', function (event) {
                if (event.pointerType === 'touch' || !on()) return;
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
            // an abstract opening or closing moves everything below it
            document.addEventListener('toggle', start, true);
        }

        function leave() {
            present = false;
            start();
        }

        function start() {
            if (!raf && seen && on()) raf = requestAnimationFrame(frame);
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

        // for each surface: the rim's bright point is the lamp's direction
        // blended toward the pointer's, as unit vectors so the blend never
        // jumps across the wrap; the glint sits at the pointer in the
        // surface's own coordinates, full inside the surface and fading
        // smoothly to nothing REACH px outside it
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

        return { collect: collect, reset: reset };
    })();

    settle();
})();

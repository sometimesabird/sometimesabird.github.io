// text brightens under the cursor (NICITIES.md): the word under the pointer
// and its neighbours brighten, falling off gently along the line and steeply
// across lines, so a soft lamp follows the cursor through the muted prose.
// colours and timing live in styles.css (.w, --lift-*); the reach is below.
// each word of the listed paragraphs is wrapped in a span once (bold words and
// links, which carry their own colours, are left alone); text and layout are
// unchanged. hover-capable pointers only.
(function () {
    if (!window.matchMedia || !matchMedia('(hover: hover)').matches) return;

    var PARAGRAPHS = '.lede, .card .teaser, .nickname, .role, .edu, .research-summary, .abstract-text';
    var REACH_ALONG = 8;  // em along the line at which a word gets 37% of the lift
    var REACH_ACROSS = 1; // lines across at which a word gets 37% of the lift

    var active = null, words = [], lines = [], em = 16;
    var px = 0, py = 0, raf = 0;

    wrapWords();
    document.addEventListener('pointermove', function (event) {
        px = event.clientX;
        py = event.clientY;
        var p = event.target.closest ? event.target.closest(PARAGRAPHS) : null;
        if (p !== active) {
            release();
            if (p) { active = p; measure(p); }
        }
        schedule();
    });
    document.addEventListener('pointerout', function (event) {
        if (!event.relatedTarget) release();
    });
    document.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('blur', release);

    function wrapWords() {
        [].forEach.call(document.querySelectorAll(PARAGRAPHS), function (p) {
            var base = getComputedStyle(p).color;
            var walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
            var nodes = [], node;
            while ((node = walker.nextNode())) nodes.push(node);
            nodes.forEach(function (text) {
                if (!/\S/.test(text.data)) return;
                for (var el = text.parentNode; el !== p; el = el.parentNode) {
                    if (getComputedStyle(el).color !== base) return;
                }
                var frag = document.createDocumentFragment();
                text.data.split(/(\s+)/).forEach(function (piece) {
                    if (!piece) return;
                    if (/^\s+$/.test(piece)) {
                        frag.appendChild(document.createTextNode(piece));
                    } else {
                        var span = document.createElement('span');
                        span.className = 'w';
                        span.textContent = piece;
                        frag.appendChild(span);
                    }
                });
                text.parentNode.replaceChild(frag, text);
            });
        });
    }

    // word positions relative to the paragraph, measured once on entering it
    function measure(p) {
        var pr = p.getBoundingClientRect();
        em = parseFloat(getComputedStyle(p).fontSize) || 16;
        var frags = [];
        words = [].map.call(p.querySelectorAll('.w'), function (span) {
            var w = { el: span, w: 0, frags: [] };
            [].forEach.call(span.getClientRects(), function (r) {
                var f = { left: r.left - pr.left, right: r.right - pr.left, top: r.top - pr.top, bottom: r.bottom - pr.top, line: 0 };
                w.frags.push(f);
                frags.push(f);
            });
            return w;
        });
        // fragments sharing a top sit on one line
        frags.sort(function (a, b) { return a.top - b.top; });
        lines = [];
        frags.forEach(function (f) {
            var last = lines[lines.length - 1];
            if (last && Math.abs(f.top - last.top) < (f.bottom - f.top) / 2) {
                f.line = lines.length - 1;
                last.bottom = Math.max(last.bottom, f.bottom);
            } else {
                f.line = lines.length;
                lines.push({ top: f.top, bottom: f.bottom });
            }
        });
    }

    // a word's share of the lift; brightening waits and takes the in-timing,
    // dimming leaves at once on the out-timing
    function set(w, v) {
        if (Math.abs(v - w.w) < 0.004) return;
        var up = v > w.w;
        w.el.style.transitionDuration = up ? 'var(--lift-in)' : 'var(--lift-out)';
        w.el.style.transitionDelay = up ? 'var(--lift-delay)' : '0s';
        w.el.style.setProperty('--w', v.toFixed(3));
        w.w = v;
    }

    function update() {
        raf = 0;
        if (!active) return;
        var pr = active.getBoundingClientRect();
        var x = px - pr.left, y = py - pr.top;
        // the line under the pointer, or the nearest one
        var cl = 0, best = Infinity;
        lines.forEach(function (l, i) {
            var d = y < l.top ? l.top - y : y > l.bottom ? y - l.bottom : 0;
            if (d < best) { best = d; cl = i; }
        });
        words.forEach(function (w) {
            var v = 0;
            w.frags.forEach(function (f) {
                var dx = (x < f.left ? f.left - x : x > f.right ? x - f.right : 0) / em;
                var dl = f.line - cl;
                var g = Math.exp(-(dx * dx) / (REACH_ALONG * REACH_ALONG) - (dl * dl) / (REACH_ACROSS * REACH_ACROSS));
                if (g > v) v = g;
            });
            set(w, v < 0.01 ? 0 : v);
        });
    }

    function release() {
        words.forEach(function (w) { set(w, 0); });
        active = null;
        words = [];
        lines = [];
    }

    function schedule() {
        if (active && !raf) raf = requestAnimationFrame(update);
    }
})();

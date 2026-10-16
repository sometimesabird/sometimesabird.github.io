// Apply the saved theme before paint, then wire the shared theme key.
// URL previews override the saved choice without replacing it.
(function () {
    var root = document.documentElement;
    var themes = ['dark', 'light'];
    var names = { dark: 'Dark', light: 'Light' };
    var query = new URLSearchParams(location.search);
    var theme = 'dark';

    try {
        var saved = localStorage.getItem('theme');
        if (themes.indexOf(saved) !== -1) theme = saved;
        else if (saved) localStorage.removeItem('theme');
    } catch (e) {}
    for (var i = 0; i < themes.length; i++) {
        if (query.has(themes[i])) {
            theme = themes[i];
            break;
        }
    }

    function apply() {
        root.classList.toggle('theme-light', theme === 'light');
    }
    function nextTheme() {
        return themes[(themes.indexOf(theme) + 1) % themes.length];
    }
    apply();

    document.addEventListener('DOMContentLoaded', function () {
        var key = document.querySelector('.theme-toggle');
        if (!key) return;
        function label() {
            var text = names[theme] + ' theme. Switch to ' + nextTheme() + ' theme';
            key.setAttribute('aria-label', text);
            key.title = text;
        }
        label();
        key.addEventListener('click', function () {
            theme = nextTheme();
            apply();
            try { localStorage.setItem('theme', theme); } catch (e) {}
            label();
        });
    });
})();

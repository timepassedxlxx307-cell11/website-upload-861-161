(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    selectAll('form.site-search').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            var target = './search.html';
            if (value) {
                target += '?q=' + encodeURIComponent(value);
            }
            window.location.href = target;
        });
    });

    var slides = selectAll('[data-hero-slide]');
    var dots = selectAll('[data-hero-dot]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    function startSlider() {
        if (timer) {
            clearInterval(timer);
        }
        timer = setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            startSlider();
        });
    });

    if (slides.length) {
        showSlide(0);
        startSlider();
    }

    selectAll('[data-kind-filter]').forEach(function (button) {
        button.addEventListener('click', function () {
            var value = button.getAttribute('data-kind-filter');
            var root = button.closest('[data-filter-root]') || document;
            selectAll('[data-kind-filter]', root).forEach(function (item) {
                item.classList.toggle('active', item === button);
            });
            selectAll('.movie-card', root).forEach(function (card) {
                var kind = card.getAttribute('data-kind') || '';
                card.style.display = value === 'all' || kind.indexOf(value) !== -1 ? '' : 'none';
            });
        });
    });

    var searchInput = document.querySelector('[data-search-input]');
    var searchGrid = document.querySelector('[data-search-grid]');
    var noResult = document.querySelector('[data-no-result]');
    if (searchInput && searchGrid) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        searchInput.value = initial;

        function applySearch() {
            var value = searchInput.value.trim().toLowerCase();
            var visible = 0;
            selectAll('.movie-card', searchGrid).forEach(function (card) {
                var text = card.getAttribute('data-search') || '';
                var matched = !value || text.indexOf(value) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (noResult) {
                noResult.classList.toggle('show', visible === 0);
            }
        }

        searchInput.addEventListener('input', applySearch);
        applySearch();
    }

    document.addEventListener('error', function (event) {
        var target = event.target;
        if (target && target.tagName === 'IMG') {
            target.classList.add('is-missing');
        }
    }, true);
}());

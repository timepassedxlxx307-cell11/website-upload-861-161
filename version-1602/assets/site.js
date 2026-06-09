(function () {
    'use strict';

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMobileNavigation() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var current = 0;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function setupCardFiltering() {
        var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
        var cardLists = Array.prototype.slice.call(document.querySelectorAll('[data-card-list]'));
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
        if (!searchInputs.length && !filterButtons.length) {
            return;
        }

        var activeCategory = 'all';
        if (filterButtons.length) {
            filterButtons[0].classList.add('active');
        }

        function applyFilters() {
            var query = normalize(searchInputs.map(function (input) {
                return input.value;
            }).join(' '));
            var visibleCount = 0;

            cardLists.forEach(function (list) {
                var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
                cards.forEach(function (card) {
                    var searchText = normalize(card.getAttribute('data-search'));
                    var category = card.getAttribute('data-category') || 'all';
                    var matchQuery = !query || searchText.indexOf(query) !== -1;
                    var matchCategory = activeCategory === 'all' || category === activeCategory;
                    var visible = matchQuery && matchCategory;
                    card.classList.toggle('is-hidden', !visible);
                    if (visible) {
                        visibleCount += 1;
                    }
                });
            });

            Array.prototype.slice.call(document.querySelectorAll('[data-empty-state]')).forEach(function (emptyState) {
                emptyState.classList.toggle('show', visibleCount === 0);
            });
        }

        searchInputs.forEach(function (input) {
            input.addEventListener('input', applyFilters);
        });

        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeCategory = button.getAttribute('data-filter-value') || 'all';
                filterButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                applyFilters();
            });
        });
    }

    function setupGlobalSearch() {
        var input = document.querySelector('[data-global-search-input]');
        var button = document.querySelector('[data-global-search-button]');
        var results = document.querySelector('[data-search-results]');
        var summary = document.querySelector('[data-search-summary]');
        var data = window.MOVIE_SEARCH_INDEX || [];
        if (!input || !results || !summary || !data.length) {
            return;
        }

        function cardTemplate(movie) {
            return [
                '<article class="movie-card">',
                '    <a class="movie-cover" href="' + movie.url + '">',
                '        <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '        <span class="movie-year">' + escapeHtml(movie.year) + '</span>',
                '        <span class="play-chip">播放</span>',
                '    </a>',
                '    <div class="movie-info">',
                '        <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p>' + escapeHtml(movie.oneLine) + '</p>',
                '        <div class="movie-meta">',
                '            <span>' + escapeHtml(movie.region) + '</span>',
                '            <span>' + escapeHtml(movie.type) + '</span>',
                '            <span>' + escapeHtml(movie.genre) + '</span>',
                '        </div>',
                '    </div>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"]/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;'
                }[char];
            });
        }

        function runSearch() {
            var query = normalize(input.value);
            var matches = data.filter(function (movie) {
                return !query || movie.search.indexOf(query) !== -1;
            }).slice(0, 96);
            results.innerHTML = matches.map(cardTemplate).join('');
            summary.textContent = query
                ? '找到 ' + matches.length + ' 条匹配结果，最多显示前 96 条。'
                : '共 ' + data.length + ' 部影片可检索，输入关键词开始筛选。';
        }

        input.addEventListener('input', runSearch);
        if (button) {
            button.addEventListener('click', runSearch);
        }

        var params = new URLSearchParams(window.location.search);
        if (params.get('q')) {
            input.value = params.get('q');
        }
        runSearch();
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('[data-video-shell]'));
        shells.forEach(function (shell) {
            var video = shell.querySelector('video');
            var playButton = shell.querySelector('[data-play-button]');
            if (!video || !playButton) {
                return;
            }
            var source = video.getAttribute('data-video-src');
            var started = false;

            function startPlayback() {
                if (!source) {
                    return;
                }
                if (!started) {
                    if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = source;
                    } else {
                        video.src = source;
                    }
                    started = true;
                }
                playButton.classList.add('hidden');
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        playButton.classList.remove('hidden');
                    });
                }
            }

            playButton.addEventListener('click', startPlayback);
            video.addEventListener('play', function () {
                playButton.classList.add('hidden');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    playButton.classList.remove('hidden');
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNavigation();
        setupHeroCarousel();
        setupCardFiltering();
        setupGlobalSearch();
        setupPlayers();
    });
}());

(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            var opened = mobileNav.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var activeSlide = 0;
    var timer = null;

    function setHeroSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    function startHeroTimer() {
        if (timer || slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            setHeroSlide(activeSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            window.clearInterval(timer);
            timer = null;
            setHeroSlide(index);
            startHeroTimer();
        });
    });

    startHeroTimer();

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function bindPageFilter(input) {
        var grid = input.closest('main') ? input.closest('main').querySelector('.filterable-grid') : document.querySelector('.filterable-grid');
        if (!grid) {
            return;
        }
        var items = Array.prototype.slice.call(grid.querySelectorAll('[data-title]'));
        input.addEventListener('input', function () {
            var keyword = normalize(input.value);
            items.forEach(function (item) {
                var text = normalize(item.getAttribute('data-title') + ' ' + item.getAttribute('data-meta'));
                item.classList.toggle('is-hidden-by-filter', keyword && text.indexOf(keyword) === -1);
            });
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('.page-search-input')).forEach(bindPageFilter);

    function resultMarkup(movie) {
        return '<a class="search-result-item" href="./' + movie.url + '">' +
            '<img src="' + movie.image + '" alt="' + movie.title.replace(/"/g, '&quot;') + '">' +
            '<span><strong>' + movie.title + '</strong><span>' + movie.meta + '</span></span>' +
            '</a>';
    }

    function bindSiteSearch(input) {
        var wrap = input.closest('.hero-search') || input.closest('.page-search-wrap') || input.parentElement;
        var results = wrap ? wrap.querySelector('.site-search-results') : null;
        var form = input.closest('form');

        if (!results || !window.SITE_MOVIES) {
            return;
        }

        function render() {
            var keyword = normalize(input.value);
            if (!keyword) {
                results.classList.remove('is-open');
                results.innerHTML = '';
                return;
            }
            var matched = window.SITE_MOVIES.filter(function (movie) {
                return normalize(movie.title + ' ' + movie.meta + ' ' + movie.tags).indexOf(keyword) !== -1;
            }).slice(0, 12);
            results.innerHTML = matched.length ? matched.map(resultMarkup).join('') : '<div class="search-result-item"><span><strong>没有找到匹配影片</strong><span>请尝试更换关键词</span></span></div>';
            results.classList.add('is-open');
        }

        input.addEventListener('input', render);
        input.addEventListener('focus', render);

        if (form) {
            form.addEventListener('submit', function (event) {
                var first = results.querySelector('a');
                if (first) {
                    event.preventDefault();
                    window.location.href = first.getAttribute('href');
                }
            });
        }

        document.addEventListener('click', function (event) {
            if (wrap && !wrap.contains(event.target)) {
                results.classList.remove('is-open');
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('.site-search-input')).forEach(bindSiteSearch);
})();

function initMoviePlayer(streamUrl) {
    var video = document.getElementById('movie-video');
    var startButton = document.getElementById('player-start');
    var hlsPlayer = null;
    var sourceReady = false;
    var requestedPlay = false;

    if (!video || !streamUrl) {
        return;
    }

    function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                window.setTimeout(function () {
                    video.play().catch(function () {});
                }, 250);
            });
        }
    }

    function prepareSource() {
        if (sourceReady) {
            return;
        }
        sourceReady = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            if (requestedPlay) {
                playVideo();
            }
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsPlayer = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsPlayer.loadSource(streamUrl);
            hlsPlayer.attachMedia(video);
            hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function () {
                if (requestedPlay) {
                    playVideo();
                }
            });
            return;
        }

        video.src = streamUrl;
        if (requestedPlay) {
            playVideo();
        }
    }

    function begin() {
        requestedPlay = true;
        if (startButton) {
            startButton.classList.add('is-hidden');
        }
        prepareSource();
        playVideo();
    }

    if (startButton) {
        startButton.addEventListener('click', begin);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            begin();
        }
    });

    video.addEventListener('play', function () {
        if (startButton) {
            startButton.classList.add('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsPlayer) {
            hlsPlayer.destroy();
        }
    });
}

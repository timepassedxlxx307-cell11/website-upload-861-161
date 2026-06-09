(function () {
    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        show(0);
        start();
    }

    function setupSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        if (!inputs.length || !cards.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function filter(value) {
            var keyword = normalize(value);
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" "));
                card.hidden = keyword.length > 0 && haystack.indexOf(keyword) === -1;
            });
        }

        inputs.forEach(function (input) {
            input.value = initial;
            input.addEventListener("input", function () {
                filter(input.value);
            });
        });

        if (initial) {
            filter(initial);
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupSearch();
    });
})();

function initMoviePlayer(videoId, overlayId, videoUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hlsInstance = null;
    var loaded = false;

    if (!video || !overlay || !videoUrl) {
        return;
    }

    function attachMedia(done) {
        if (loaded) {
            done();
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = videoUrl;
            done();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(videoUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                done();
            });
            return;
        }
        video.src = videoUrl;
        done();
    }

    function playVideo() {
        overlay.classList.add("is-hidden");
        attachMedia(function () {
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        });
    }

    overlay.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });
    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

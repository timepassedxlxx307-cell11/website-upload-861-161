(function () {
    var video = document.getElementById('moviePlayer');
    var overlay = document.querySelector('[data-player-overlay]');
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-player-start]'));

    if (!video || typeof currentVideoUrl === 'undefined') {
        return;
    }

    function attachPlayer() {
        if (video.getAttribute('data-ready') === 'yes') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = currentVideoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(currentVideoUrl);
            hls.attachMedia(video);
            video._hls = hls;
        } else {
            video.src = currentVideoUrl;
        }

        video.setAttribute('data-ready', 'yes');
    }

    function beginPlay() {
        attachPlayer();
        if (overlay) {
            overlay.hidden = true;
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    buttons.forEach(function (button) {
        button.addEventListener('click', beginPlay);
    });

    if (overlay) {
        overlay.addEventListener('click', beginPlay);
    }

    video.addEventListener('click', function () {
        if (video.getAttribute('data-ready') !== 'yes') {
            beginPlay();
        }
    });
}());

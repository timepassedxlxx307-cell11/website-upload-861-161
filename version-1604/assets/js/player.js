import { H as Hls } from './video-vendor-dru42stk.js';

export function initializePlayer(source, poster) {
  var video = document.querySelector('.movie-player');
  var cover = document.querySelector('.player-cover');
  var loading = document.querySelector('.player-loading');
  var message = document.querySelector('.player-message');
  var hls = null;
  var initialized = false;

  if (!video) {
    return;
  }

  if (poster) {
    video.setAttribute('poster', poster);
  }

  function setLoading(isLoading) {
    if (loading) {
      loading.hidden = !isLoading;
    }
  }

  function showMessage() {
    if (message) {
      message.hidden = false;
    }
  }

  function bindSource() {
    if (initialized) {
      return;
    }

    initialized = true;
    setLoading(true);

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        setLoading(false);
      }, { once: true });
      video.addEventListener('error', function () {
        setLoading(false);
        showMessage();
      });
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setLoading(false);
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setLoading(false);
          showMessage();
        }
      });
      return;
    }

    setLoading(false);
    showMessage();
  }

  function playVideo() {
    bindSource();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (cover) {
          cover.classList.remove('is-hidden');
        }
      });
    }
  }

  if (cover) {
    cover.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  });

  video.addEventListener('waiting', function () {
    setLoading(true);
  });

  video.addEventListener('playing', function () {
    setLoading(false);
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

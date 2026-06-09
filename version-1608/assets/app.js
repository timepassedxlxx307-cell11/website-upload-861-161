(function () {
  var menuButton = document.querySelector('.menu-button');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, position) {
      slide.classList.toggle('active', position === currentSlide);
    });
    dots.forEach(function (dot, position) {
      dot.classList.toggle('active', position === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var searchForm = document.querySelector('[data-search-form]');
  if (searchForm) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = searchForm.querySelector('input');
      var query = input ? input.value.trim() : '';
      var target = './catalog.html';
      if (query) {
        target += '?q=' + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var queryInput = filterRoot.querySelector('.filter-search');
    var regionSelect = filterRoot.querySelector('.filter-region');
    var yearSelect = filterRoot.querySelector('.filter-year');
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card, .rank-item'));
    var emptyState = filterRoot.querySelector('.empty-state');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && queryInput) {
      queryInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase();
    }

    function applyFilters() {
      var query = normalize(queryInput && queryInput.value);
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.year
        ].join(' '));
        var cardRegion = card.dataset.region || '';
        var cardYear = card.dataset.year || '';
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (region && cardRegion.indexOf(region) === -1) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visibleCount === 0);
      }
    }

    [queryInput, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  var video = document.querySelector('.player-video');
  if (video) {
    var sourceElement = video.querySelector('source');
    var stream = sourceElement ? sourceElement.getAttribute('src') : '';
    var cover = document.querySelector('.player-cover');
    var initialized = false;
    var hlsInstance = null;

    function prepareVideo() {
      if (initialized || !stream) {
        return;
      }
      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function startVideo() {
      prepareVideo();
      if (cover) {
        cover.classList.add('hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', startVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();

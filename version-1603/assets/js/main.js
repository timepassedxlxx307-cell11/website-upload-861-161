(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('is-active', pos === current);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('is-active', pos === current);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute('data-hero-dot')));
        startHero();
      });
    });

    if (slides.length > 1) {
      startHero();
    }
  }

  var panel = document.querySelector('[data-filter-panel]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

  if (panel && cards.length) {
    var input = panel.querySelector('[data-search-input]');
    var region = panel.querySelector('[data-region-filter]');
    var type = panel.querySelector('[data-type-filter]');
    var year = panel.querySelector('[data-year-filter]');
    var reset = panel.querySelector('[data-filter-reset]');
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && input) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function matchYear(value, selected) {
      if (!selected) {
        return true;
      }
      var number = parseInt(value, 10);
      if (selected === 'older') {
        return Number.isFinite(number) && number < 2020;
      }
      return String(value).indexOf(selected) !== -1;
    }

    function applyFilter() {
      var keyword = normalize(input && input.value);
      var selectedRegion = region ? region.value : '';
      var selectedType = type ? type.value : '';
      var selectedYear = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var ok = true;
        ok = ok && (!keyword || haystack.indexOf(keyword) !== -1);
        ok = ok && (!selectedRegion || card.getAttribute('data-region') === selectedRegion);
        ok = ok && (!selectedType || card.getAttribute('data-type') === selectedType);
        ok = ok && matchYear(card.getAttribute('data-year'), selectedYear);
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (region) {
          region.value = '';
        }
        if (type) {
          type.value = '';
        }
        if (year) {
          year.value = '';
        }
        applyFilter();
      });
    }

    applyFilter();
  }
})();

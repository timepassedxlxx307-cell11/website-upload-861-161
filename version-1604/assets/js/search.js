(function () {
  var input = document.querySelector('[data-search-page-input]');
  var results = document.querySelector('[data-search-results]');
  var summary = document.querySelector('[data-search-summary]');

  if (!input || !results || !summary || !window.MOVIE_SEARCH_INDEX) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  input.value = query;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }

  function render(items, keyword) {
    if (!keyword) {
      results.innerHTML = '';
      summary.textContent = '请输入关键词开始搜索。';
      return;
    }

    if (!items.length) {
      results.innerHTML = '';
      summary.textContent = '没有找到相关内容。';
      return;
    }

    summary.textContent = '找到 ' + items.length + ' 个相关内容';
    results.innerHTML = items.slice(0, 240).map(function (item) {
      return '<article class="movie-card">' +
        '<a class="card-cover" href="./' + escapeHtml(item.file) + '">' +
          '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="play-chip">立即观看</span>' +
        '</a>' +
        '<div class="card-body">' +
          '<h3><a href="./' + escapeHtml(item.file) + '">' + escapeHtml(item.title) + '</a></h3>' +
          '<p>' + escapeHtml(item.oneLine) + '</p>' +
          '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
          '<div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function runSearch(keyword) {
    var normalized = keyword.trim().toLowerCase();

    var items = window.MOVIE_SEARCH_INDEX.filter(function (item) {
      var text = [item.title, item.year, item.region, item.type, item.genre, item.tags, item.oneLine].join(' ').toLowerCase();
      return text.indexOf(normalized) !== -1;
    });

    render(items, normalized);
  }

  runSearch(query);
})();

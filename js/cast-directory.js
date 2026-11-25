(function () {
  'use strict';
  var search = document.getElementById('cast-search');
  var groups = Array.from(document.querySelectorAll('.cast-directory-group'));
  var opened = groups.map(function (group) { return group.open; });
  var searching = false;
  function update() {
    var query = search.value.trim().toLocaleLowerCase();
    if (query && !searching) opened = groups.map(function (group) { return group.open; });
    var total = 0;
    groups.forEach(function (group, index) {
      var count = 0;
      var label = group.querySelector('summary').firstChild.textContent.toLocaleLowerCase();
      group.querySelectorAll('li').forEach(function (entry) {
        var match = !query || (entry.textContent + ' ' + label).toLocaleLowerCase().includes(query);
        entry.hidden = !match;
        if (match) count++;
      });
      group.querySelector('summary small').textContent = '(' + count + ')';
      group.hidden = !count;
      if (query) group.open = count > 0;
      else if (searching) group.open = opened[index];
      total += count;
    });
    searching = !!query;
    document.getElementById('cast-search-status').textContent = query
      ? (total ? total + (total === 1 ? ' match' : ' matches') : 'No matching cast members.')
      : '';
  }
  document.getElementById('cast-search-tools').hidden = false;
  search.addEventListener('input', update);
})();

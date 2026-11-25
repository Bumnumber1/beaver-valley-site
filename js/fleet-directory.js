(function () {
  'use strict';
  var query = document.getElementById('ship-search');
  var groups = Array.from(document.querySelectorAll('.ship-group')).map(function (group) {
    var topic = document.querySelector('.ship-topics a[href="#' + group.id + '"]');
    var groupName = group.querySelector('h3').textContent;
    var entries = Array.from(group.querySelectorAll('.ship-entry')).map(function (entry) {
      return { entry: entry, searchable: (groupName + ' ' + entry.textContent).toLocaleLowerCase() };
    });
    return { group: group, topic: topic, entries: entries };
  });
  function update() {
    var words = query.value.trim().toLocaleLowerCase().split(/\s+/);
    var total = 0;
    groups.forEach(function (item) {
      var count = 0;
      item.entries.forEach(function (row) {
        var match = words.every(function (word) { return row.searchable.includes(word); });
        row.entry.hidden = !match;
        if (match) count++;
      });
      item.group.hidden = item.topic.hidden = count === 0;
      total += count;
    });
    document.getElementById('ship-search-status').textContent = !words[0] ? ''
      : total === 0 ? 'No matching vessels.' : total + (total === 1 ? ' match' : ' matches');
  }
  document.getElementById('ship-search-tools').hidden = false;
  query.addEventListener('input', update);
})();

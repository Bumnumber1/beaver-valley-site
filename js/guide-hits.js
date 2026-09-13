/* Field Guide — "How many hits it takes" (2026-09-13).
   Every figure was counted in the game: each weapon fired at each hull until it sank. A cell is a
   count, or "low–high~average" where luck decides. Styles: css/guide-hits.css. */
(function () {
  var MISSILES = [["Tomahawk / cruise", "32"], ["Anti-ship", "34"], ["Quill", "Porcupine · 26"],
                  ["Heavy missile", "Porcupine · 260"], ["A.S.S. rocket", "32"]];
  var SHIP_GUNS = [["Naval gun", "shell · 14"], ["Frigate gun", "shell · 9"], ["CIWS", "enemy burst · 18"],
                   ["CIWS", "frigate burst · 9"], ["Vulcan", "Porcupine · 6"], ["Autocannon", "5"],
                   ["Twin Vulcan", "A.S.S. · 4.5"], ["Cannon", "Fox · 3.5"], ["30 mm", "Wolverine · 1.6"]];
  var AIR_GUNS = [["Naval gun", "one shell"], ["Frigate gun", "one shell"], ["CIWS", "enemy burst"],
                  ["CIWS", "frigate · rounds"], ["Vulcan", "Porcupine"], ["Autocannon", ""],
                  ["Twin Vulcan", "A.S.S."], ["Cannon", "Fox"], ["30 mm", "Wolverine"]];
  var SA14 = "12–14~12.9";

  var TABLES = [
    {
      id: "ships", tab: "Ships", rowLabel: "Ship",
      cap: "Hits to sink each ship. <b>Heavyweight torpedoes are the ship-killers</b>; missiles take three or four on a frigate; guns barely matter against anything big.",
      groups: [["Torpedoes", 2], ["Missiles & rockets", 5], ["Guns", 9]],
      cols: [["Heavyweight", "Mk 48 · 95"], ["Lightweight", "Mk 46 · 60"]].concat(MISSILES, SHIP_GUNS),
      rows: [
        ["Ox class heavy-lift ship", "civilian", 420, [5, 7, 14, 13, 17, 2, 14, 30, 47, 47, 94, 140, 168, 187, 240, "400+"]],
        ["Badger class destroyer", "Beaver Valley Navy", 240, [3, 4, 8, 8, 10, 1, 8, 18, 27, 27, 54, 80, 96, 107, 138, 300]],
        ["Ferret class destroyer", "hostile navy", 220, [3, 4, 7, 7, 9, 1, 7, 16, 25, 25, 49, 74, 88, 98, 126, 275]],
        ["Skunk class waste tanker", "civilian", 200, [3, 4, 7, 6, 8, 1, 7, 15, 23, 23, 45, 67, 80, 89, 115, 250]],
        ["Marten class frigate", "hostile navy", 110, [2, 2, 4, 4, 5, 1, 4, 8, 13, 13, 25, 37, 44, 49, 63, 138]],
        ["Weasel class frigate", "Beaver Valley Navy", 100, [2, 2, 4, 3, 4, 1, 4, 8, 12, 12, 23, 34, 40, 45, 58, 125]],
        ["Capybara class ferry", "civilian", 100, [2, 2, 4, 3, 4, 1, 4, 8, 12, 12, 23, 34, 40, 45, 58, 125]],
        ["Stoat class patrol cutter", "hostile navy", 92, [1, 2, 3, 3, 4, 1, 3, 7, 11, 6, 11, 16, 19, 21, 27, 58]],
        ["Rabbit class patrol cutter", "coast guard", 90, [1, 2, 3, 3, 4, 1, 3, 7, 10, 5, 10, 15, 18, 20, 26, 57]],
        ["Rat class fast interceptor", "A.S.S.", 45, [1, 1, 2, 2, 2, 1, 2, 4, 5, 3, 5, 8, 9, 10, 13, 29]],
        ["Muskrat class fishing boat", "civilian", 35, [1, 1, 2, 2, 2, 1, 2, 3, 4, 2, 4, 6, 7, 8, 10, 22]],
        ["Mink class assault RHIB", "hostile navy", 28, [1, 1, 1, 1, 2, 1, 1, 2, 4, 2, 4, 5, 6, 7, 8, 18]],
        ["Shrew class RHIB", "Beaver Valley Navy", 25, [1, 1, 1, 1, 1, 1, 1, 2, 3, 2, 3, 5, 5, 6, 8, 16]],
        ["The Badger's RHIB", "Beaver Valley Navy", 25, [1, 1, 1, 1, 1, 1, 1, 2, 3, 2, 3, 5, 5, 6, 8, 16]]
      ]
    },
    {
      id: "surfaced", tab: "Surfaced subs", rowLabel: "Submarine",
      cap: "A submarine on the surface can be shot at with everything. <b>Torpedoes and depth charges work the same whether she is up or down</b> — the rest only reaches her while she is up.",
      groups: [["Torpedoes", 2], ["Depth charges", 2], ["Missiles & rockets", 5], ["Guns", 9]],
      cols: [["Heavyweight", "Mk 48 · 95"], ["Lightweight", "Mk 46"], ["Direct hit", "half the boat"], ["Within 30 m", "a third"]].concat(MISSILES, SHIP_GUNS),
      rows: [
        ["Otter class submarine", "hostile navy", 200, ["1–3~2.3", "1–3~2.2", 2, 3, 7, 6, 8, 1, 7, 15, 23, 23, 45, 67, 80, 89, 115, 250]],
        ["USS Beaver Valley", "your submarine", 100, ["1–2~1.9", "1–3~2.1", 2, 3, 4, 3, 4, 1, 4, 8, 12, 12, 23, 34, 40, 45, 58, 125]]
      ]
    },
    {
      id: "aircraft", tab: "Aircraft", rowLabel: "Aircraft",
      cap: "Hits to bring each aircraft down. <b>Every missile or rocket has a three-in-ten chance to end it at once</b>, which is why those are ranges. Gun rounds never get that luck.",
      groups: [["Missiles & rockets", 5], ["Guns", 9]],
      cols: [["SAM", "34"], ["Air-to-air", "Fox / Wolverine · 30"], ["Quill", "Porcupine · 26"], ["Heavy missile", "Porcupine · 260"], ["A.S.S. rocket", "32"]].concat(AIR_GUNS),
      rows: [
        ["Fox class fighter", "Beaver Valley", 84, ["1–2~1.7", "1–2~1.7", "1–3~2.1", 1, "1–3~2.2", 1, 1, 1, 4, SA14, SA14, SA14, SA14, SA14]],
        ["Wolverine class fighter", "hostile", 76, ["1–2~1.7", "1–2~1.7", "1–2~1.6", 1, "1–3~2.2", 1, 1, 1, 4, SA14, SA14, SA14, SA14, SA14]],
        ["Porcupine", "experimental fighter", 70, ["1–2~1.6", "1–2~1.7", "1–2~1.7", 1, "1–3~2.2", 1, 1, 1, 4, SA14, SA14, SA14, SA14, SA14]],
        ["Beaver Valley Air flight", "civilian airliner", 40, [1, 1, 1, 1, 1, 1, 1, 1, 4, 20, 20, 20, 20, 20]]
      ]
    },
    {
      id: "helicopters", tab: "Helicopters", rowLabel: "Helicopter",
      cap: "Lighter than the jets, same rules: <b>one shell, the fourth close-in round, or ten to fifteen gun rounds</b>. A .50 cal round that connects with a helicopter wrecks it.",
      groups: [["Missiles & rockets", 6], ["Guns", 10]],
      cols: [["SAM", "34"], ["Air-to-air", "30"], ["Quill", "interceptor · 60"], ["Heavy missile", "260"], ["SAM site", "ground"], ["A.S.S. rocket", "32"]].concat(AIR_GUNS, [[".50 cal", "small boats"]]),
      rows: [
        ["Mongoose / Seahawk", "Beaver Valley Navy", 34, [1, "1–2~1.7", 1, 1, 1, "1–2~1.7", 1, 1, 1, 4, "11–14~12.9", "12–14~12.9", "11–14~12.8", "11–14~12.8", "12–14~12.8", "1–2~1.8"]],
        ["Enemy ship's helicopter", "hostile navy", 65, ["1–2~1.7", "1–3~2.2", "1–2~1.7", 1, 1, "1–3~2.2", 1, 1, 1, 4, "11–14~12.9", "12–14~12.8", "12–14~12.8", "12–14~12.9", "12–14~12.9", "1–2~1.7"]],
        ["A.S.S. attack helicopter", "American Security Services", 58, ["1–2~1.7", "1–2~1.7", 1, 1, 1, "1–2~1.7", 1, 1, 1, 4, "11–14~12.8", "12–14~12.9", "12–14~12.8", "11–14~12.8", "12–14~12.8", "1–2~1.7"]]
      ]
    },
    {
      id: "submerged", tab: "Submerged", rowLabel: "Contact",
      cap: "Under water only torpedoes and depth charges reach. <b>The thing in the trench is not a submarine</b> and does not play by submarine rules — though a shot straight into its face does double.",
      groups: [["Torpedoes", 2], ["Depth charges", 2]],
      cols: [["Heavyweight", "Mk 48 · 95"], ["Lightweight", "Mk 46"], ["Direct hit", ""], ["Within 30 m", ""]],
      rows: [
        ["Otter class submarine", "hostile navy", 200, ["1–3~2.3", "1–3~2.2", 2, 3]],
        ["USS Beaver Valley", "your submarine", 100, ["1–2~1.9", "1–3~2.1", 2, 3]],
        ["Whatever lives in the trench", "not a submarine", 550, [6, 10, 62, "400+"]]
      ]
    }
  ];

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function cell(v, sep) {
    var s = String(v), parts = s.split("~"), shown = parts[0];
    var high = parseInt(shown.indexOf("–") >= 0 ? shown.split("–")[1] : shown, 10);
    var band = high <= 1 ? "k1" : high <= 3 ? "k23" : high <= 9 ? "k49" : "k10";
    return '<td class="' + band + (sep ? " sep" : "") + '">' + esc(shown) +
      (parts[1] ? '<span class="avg">avg ' + esc(parts[1]) + "</span>" : "") + "</td>";
  }

  function table(t) {
    var starts = {}, i = 0;
    t.groups.forEach(function (g) { starts[i] = true; i += g[1]; });
    var h1 = '<tr class="grp"><th class="hull"></th><th class="hp"></th>' + t.groups.map(function (g) {
      return '<th colspan="' + g[1] + '" class="sep">' + esc(g[0]) + "</th>";
    }).join("") + "</tr>";
    var h2 = '<tr><th class="hull" scope="col">' + esc(t.rowLabel) + '</th><th class="hp" scope="col">Hull</th>' +
      t.cols.map(function (c, k) {
        return '<th scope="col"' + (starts[k] ? ' class="sep"' : "") + ">" + esc(c[0]) + (c[1] ? "<small>" + esc(c[1]) + "</small>" : "") + "</th>";
      }).join("") + "</tr>";
    var body = t.rows.map(function (r) {
      return '<tr><td class="hull"><b>' + esc(r[0]) + "</b><span>" + esc(r[1]) + '</span></td><td class="hp">' + r[2] + "</td>" +
        r[3].map(function (v, k) { return cell(v, starts[k]); }).join("") + "</tr>";
    }).join("");
    return '<table class="hits-table"><thead>' + h1 + h2 + "</thead><tbody>" + body + "</tbody></table>";
  }

  var root = document.getElementById("hits-matrix");
  if (!root) return;

  root.innerHTML = '<div class="hits-tabs" role="tablist" aria-label="Target type">' +
    TABLES.map(function (t, i) {
      return '<button type="button" class="hits-tab" role="tab" id="hits-tab-' + t.id + '" aria-controls="hits-panel-' + t.id +
        '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + esc(t.tab) + "</button>";
    }).join("") + "</div>" +
    TABLES.map(function (t, i) {
      return '<div class="hits-panel" role="tabpanel" id="hits-panel-' + t.id + '" aria-labelledby="hits-tab-' + t.id + '"' + (i ? " hidden" : "") +
        '><p class="hits-cap">' + t.cap + '</p><div class="hits-scroll">' + table(t) + "</div></div>";
    }).join("");

  var buttons = Array.prototype.slice.call(root.querySelectorAll(".hits-tab"));
  function select(n) {
    buttons.forEach(function (b, k) {
      var on = k === n;
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
      document.getElementById(b.getAttribute("aria-controls")).hidden = !on;
    });
  }
  buttons.forEach(function (b, i) {
    b.addEventListener("click", function () { select(i); });
    b.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var n = (i + (e.key === "ArrowRight" ? 1 : buttons.length - 1)) % buttons.length;
      select(n); buttons[n].focus(); e.preventDefault();
    });
  });
})();

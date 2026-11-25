/* Direct-hit estimates and weapon specifications for the Field Guide. */
(function () {
  var TABLES = [
  {
    "id": "ships",
    "tab": "Ships",
    "rowLabel": "Ship",
    "groups": [["Missile hits", 4], ["Torpedo hits", 2], ["Gun hits", 2]],
    "cols": [["Tomahawk", "32 base hull damage", "245 m/s"], ["Harpoon", "34 base hull damage", "270 m/s"], ["Quill", "26 base hull damage", "720 m/s"], ["Porcupine heavy missile", "260 base hull damage", "310 m/s"], ["Heavyweight torpedo", "Mk 48 · 95 base hull damage", "28.3 m/s"], ["Lightweight torpedo", "Mk 46 / Mk 32 · 60 base hull damage", "23.2 m/s"], ["Naval gun", "14 base hull damage", "900 m/s"], ["20 mm cannon", "Direct hits at the hull damage cap", "1,050 m/s"]],
    "cap": "Estimated hits to exhaust an undamaged hull from direct impacts. Figures use base damage before armor, hit location, fire, flooding, or repairs. The Tomahawk column uses the standard 32-point packet. The Weasel’s own launcher uses 34. The 20 mm column gives a lower bound at the hull’s per-round cap.",
    "rows": [
      ["Weasel", "Beaver Valley guided-missile frigate", 100, [4, 3, 4, 1, 2, 2, 8, "≥10,000"], "30 kn"],
      ["Marten", "Russian guided-missile frigate", 110, [4, 4, 5, 1, 2, 2, 8, "≥11,000"], "31 kn"],
      ["Badger", "Beaver Valley guided-missile destroyer", 240, [8, 8, 10, 1, 3, 4, 18, "≥120,000"], "44 kn"],
      ["Ferret", "Russian guided-missile destroyer", 220, [7, 7, 9, 1, 3, 4, 16, "≥110,000"], "32 kn"],
      ["Rabbit", "Beaver Valley patrol cutter", 90, [3, 3, 4, 1, 1, 2, 7, "≥1,125"], "36 kn"],
      ["Stoat", "Russian patrol cutter", 92, [3, 3, 4, 1, 1, 2, 7, "≥1,150"], "38 kn"],
      ["Mara", "Beaver Valley fleet carrier", 1200, [38, 36, 47, 5, 13, 20, 86, "≥600,000"], "30 kn"],
      ["Kodiak", "Russian fleet carrier", 1200, [38, 36, 47, 5, 13, 20, 86, "≥600,000"], "30 kn"],
      ["Capybara", "Passenger and vehicle ferry", 100, [4, 3, 4, 1, 2, 2, 8, "≥10,000"], "22 kn"],
      ["Skunk", "Liquid-waste tanker", 200, [7, 6, 8, 1, 3, 4, 15, "≥100,000"], "17 kn"],
      ["Ox", "FoundryStop heavy-lift cargo ship", 420, [14, 13, 17, 2, 5, 7, 30, "≥210,000"], "24 kn"],
      ["Muskrat", "Commercial fishing boat", 35, [2, 2, 2, 1, 1, 1, 3, "≥78"], "40 kn"],
      ["Launchpad", "Private motor yacht", 150, [5, 5, 6, 1, 2, 3, 11, "≥15,000"], "24 kn"],
      ["Moose-class tug", "Navy, Coast Guard and fisheries tug", 60, [2, 2, 3, 1, 1, 1, 5, "≥750"], "13.5 kn"],
      ["Polecat (RB-217)", "Russian naval tug", 50, [2, 2, 2, 1, 1, 1, 4, "≥112"], "11.5 kn"],
      ["Shrew", "Beaver Valley boarding boat", 25, [1, 1, 1, 1, 1, 1, 2, "≥56"], "42 kn"],
      ["Mink", "Russian assault RHIB", 28, [1, 1, 2, 1, 1, 1, 2, "≥63"], "48 kn"],
      ["RAT fast interceptor", "A.S.S. speedboat", 45, [2, 2, 2, 1, 1, 1, 4, "≥100"], "68 kn"]
    ]
  },
  {
    "id": "subs",
    "tab": "Submarines",
    "rowLabel": "Submarine",
    "groups": [["Torpedo hits", 2], ["Depth-charge hits", 2], ["Hits on surfaced submarines", 3]],
    "cols": [["Heavyweight torpedo", "85–99 · 15% critical", "28.3 m/s"], ["Lightweight torpedo", "68–82 · 8% critical", "23.2 m/s"], ["Directly overhead", "At maximum blast effect", "9 m/s sink rate"], ["Halfway to blast edge", "One-eighth of maximum hull", "30 m lethal radius"], ["Tomahawk", "32 base hull damage", "245 m/s"], ["Harpoon", "34 base hull damage", "270 m/s"], ["Naval gun", "14 base hull damage", "900 m/s"]],
    "cap": "Torpedo ranges include a one-hit pressure-hull critical. Depth-charge estimates are for the stated distance. The missile and gun columns apply to direct impacts while the submarine is surfaced.",
    "rows": [
      ["Beaver", "Beaver Valley submarine", "100 HP", ["1–2", "1–2", 2, 8, 4, 3, 8], "34 kn"],
      ["Otter", "Russian guided-missile submarine", "200 HP", ["1–3", "1–3", 2, 8, 7, 6, 15], "26 kn"]
    ]
  },
  {
    "id": "aircraft",
    "tab": "Aircraft",
    "rowLabel": "Aircraft",
    "groups": [["Missile hits", 4], ["Gun hits", 3]],
    "cols": [["Surface-to-air missile", "34 base · ×1.5 against air contacts", "600 m/s"], ["Air-to-air missile", "45 base · ×1.5 against air contacts", "680 m/s"], ["Quill", "26 base against a registered contact", "720 m/s"], ["RAT air-to-air missile", "32 base hull damage", "690 m/s"], ["Naval gun", "Terminal direct hit", "900 m/s"], ["20 mm cannon / CIWS", "Ordinary rounds, 2–4 integrity", "1,050 m/s"], [".50-cal gun", "Ordinary rounds, 0.6–1.2 integrity", ""]],
    "cap": "Confirmed direct-hit estimates for registered aircraft contacts. A missile critical can destroy the airframe in one hit. Gun ranges show ordinary hits and exclude rare criticals. The airliner has its own terminal-warhead rule. Carrier flight-deck versions use their own integrity and are listed under their airframe in Fleet.",
    "rows": [
      ["Fox", "Beaver Valley multirole fighter", 84, ["1–2", "1–2", "1–3", "1–2", 1, "21–42", "70–140"], "1,100 kn"],
      ["Wolverine", "Russian air-superiority fighter", 76, ["1–2", "1–2", "1–2", "1–2", 1, "19–38", "64–127"], "1,300 kn"],
      ["Porcupine", "Experimental fighter", 70, ["1–2", "1–2", "1–2", "1–2", 1, "18–35", "59–117"], "780 kn"],
      ["Heron", "Maritime patrol aircraft", 55, ["1–2", 1, "1–2", "1–2", 1, "14–28", "46–92"], "330 kn"],
      ["Beaver Valley Air", "Civilian airliner", 40, [1, 1, 1, 1, 1, "10–20", "34–67"], "280 kn"]
    ]
  },
  {
    "id": "helicopters",
    "tab": "Helicopters",
    "rowLabel": "Helicopter",
    "groups": [["Missile hits", 4], ["Gun hits", 2]],
    "cols": [["Frigate SAM", "34 damage to a track", "600 m/s"], ["Air-to-air missile", "45 base track damage", "680 m/s"], ["Quill", "60 on a tracked helicopter", "720 m/s"], ["RAT air-to-air missile", "32 base track damage", "690 m/s"], ["20 mm cannon / CIWS", "Ordinary rounds, 2–4 integrity", "1,050 m/s"], [".50-cal gun", "Ordinary rounds, 0.6–1.2 integrity", ""]],
    "cap": "Ordinary damage against tracked naval helicopters at full integrity. Ranges include the escort and carrier versions of the same airframe. Critical hits and the launcher’s target handling can change these estimates. Fleet lists the other land-based helicopter specifications.",
    "rows": [
      ["Mongoose", "Weasel, Badger and Mara", "34–80", ["1–3", "1–2", "1–2", "2–3", "9–40", "29–134"], "145 kn"],
      ["Sable", "Marten, Ferret and Kodiak", "65–80", ["2–3", 2, 2, 3, "17–40", "55–134"], "145–146 kn"],
      ["RAT attack helicopter", "A.S.S. combat helicopter", 58, [2, 2, 1, 2, "15–29", "49–97"], "135 kn"]
    ]
  },
  {
    "id": "weapons",
    "tab": "Weapons & reach",
    "spec": true,
    "head": ["Weapon", "Reach", "Speed", "In-game effect"],
    "cap": "Selected launch and engagement ratings from the current game rules. These figures apply to the listed weapons and conditions.",
    "rows": [
      ["Mk 48 heavyweight torpedo", "Up to 4 km on supported launchers", "28.3 m/s", "95 base hull damage against surface ships. Against submarines it deals 85–99, with a 15% pressure-hull critical chance."],
      ["Mk 46 / Mk 32 lightweight torpedo", "Up to 4 km on supported launchers", "23.2 m/s", "60 base hull damage against surface ships. Against submarines it deals 68–82, with an 8% pressure-hull critical chance."],
      ["Tomahawk cruise missile", "Targets within the current operating region", "245 m/s", "32 base hull damage with the standard packet. The Weasel uses 34. VLS-equipped submarines must surface to launch."],
      ["Harpoon anti-ship missile", "Up to 20 km", "270 m/s", "34 base hull damage. Aircraft and ship launchers use their own release checks."],
      ["Tracked deck gun", "Up to 3 km", "900 m/s on the Weasel", "14 base hull damage against ships in the standard packet. A direct hit can destroy an airframe."],
      ["Surface-to-air missile", "10 km horizontal engagement range", "600 m/s", "34 base damage. Registered air contacts apply the airframe multiplier; the frigate track hit uses 34 damage."],
      ["CIWS cannon", "Up to 2 km", "1,050 m/s", "A standard burst is 20 rounds. Missile interception depends on range and actual contact."],
      ["Depth charge", "140 m launch distance, up to 300 m against the deep-water creature", "9 m/s sink rate", "The 30 m lethal radius has a steep damage falloff."],
      ["Air-to-air missile", "Up to 10 km slant range", "680 m/s", "45 base damage. Aircraft impact rules depend on the target."],
      ["Porcupine Quill", "Defensive or designated strike", "720 m/s", "26 base hull damage to a registered contact. It applies 60 to an eligible tracked target."],
      ["Porcupine heavy missile", "Designated target in the operation", "310 m/s", "260 base hull damage from a confirmed hit."],
      ["RAT air-to-air missile", "Eligible air targets", "690 m/s", "32 base damage."],
      ["20 mm cannon / CIWS", "Up to 2 km in supported mounts", "1,050 m/s", "Ordinary airframe hits deliver 2–4 points before rare gun criticals. Hull damage and equipment damage are tracked separately."],
      ["Nuclear Tomahawk", "Targets within the current operating region", "245 m/s", "Separately tracked ammunition and area damage. The hit matrices use conventional weapons."]
    ]
  }
];

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function cell(v, sep) {
    var s = String(v), parts = s.split("~"), shown = parts[0];
    var num = (shown.indexOf("–") >= 0 ? shown.split("–")[1] : shown).replace(/[≥,]/g, "");
    var high = parseInt(num, 10);
    var band = isNaN(high) ? "na" : high <= 1 ? "k1" : high <= 3 ? "k23" : high <= 9 ? "k49" : "k10";
    return '<td class="' + band + (sep ? " sep" : "") + '">' + esc(shown) +
      (parts[1] ? '<span class="avg">avg ' + esc(parts[1]) + "</span>" : "") + "</td>";
  }

  function matrix(t) {
    var starts = {}, i = 0;
    t.groups.forEach(function (g) { starts[i] = true; i += g[1]; });
    var h1 = '<tr class="grp"><th class="hull"></th><th class="hp"></th><th class="ts"></th>' + t.groups.map(function (g) {
      return '<th colspan="' + g[1] + '" class="sep">' + esc(g[0]) + "</th>";
    }).join("") + "</tr>";
    // Column = [name, damage note, projectile speed]; row = [name, side, hull, cells, top speed].
    var h2 = '<tr><th class="hull" scope="col">' + esc(t.rowLabel) + '</th><th class="hp" scope="col">Hull</th>' +
      '<th class="ts" scope="col">Top speed</th>' +
      t.cols.map(function (c, k) {
        return '<th scope="col"' + (starts[k] ? ' class="sep"' : "") + ">" + esc(c[0]) +
          (c[1] ? "<small>" + esc(c[1]) + "</small>" : "") +
          (c[2] ? '<small class="spd">' + esc(c[2]) + "</small>" : "") + "</th>";
      }).join("") + "</tr>";
    var body = t.rows.map(function (r) {
      return '<tr><td class="hull"><b>' + esc(r[0]) + "</b><span>" + esc(r[1]) + '</span></td><td class="hp">' + esc(r[2]) + "</td>" +
        '<td class="ts">' + esc(r[4] || "") + "</td>" +
        r[3].map(function (v, k) { return cell(v, starts[k]); }).join("") + "</tr>";
    }).join("");
    return '<table class="hits-table"><thead>' + h1 + h2 + "</thead><tbody>" + body + "</tbody></table>";
  }

  // A plain reference table: first column is the sticky name, the rest is prose that wraps.
  function spec(t) {
    var head = "<tr>" + t.head.map(function (h, k) {
      return '<th scope="col"' + (k === 0 ? ' class="hull"' : "") + ">" + esc(h) + "</th>";
    }).join("") + "</tr>";
    var body = t.rows.map(function (r) {
      return "<tr>" + r.map(function (v, k) {
        return "<td" + (k === 0 ? ' class="hull"' : "") + ">" + (k === 0 ? "<b>" + esc(v) + "</b>" : esc(v)) + "</td>";
      }).join("") + "</tr>";
    }).join("");
    return '<table class="hits-table spec"><thead>' + head + "</thead><tbody>" + body + "</tbody></table>";
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
        '><p class="hits-cap">' + t.cap + '</p><div class="hits-scroll" tabindex="0" role="region" aria-label="Scrollable weapon comparison">' + (t.spec ? spec(t) : matrix(t)) + "</div></div>";
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

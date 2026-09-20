/* Field Guide — the Ocean Operations reference (rebuilt 2026-09-20).
   Every figure is read out of the game's own weapon rules as they stand today. Hit counts are
   against the HULL alone: a cell is a count, or "low–high~average" where luck decides. Weapon
   speeds are metres per second, hull speeds knots, reaches metres/kilometres.
   Supersedes the 2026-09-13 chart, which predated the weapon-realism pass: gun rounds no longer
   sink ships, torpedo and depth-charge warheads are fixed sizes rather than fractions of the
   victim, and every projectile speed changed.
   Styles: css/guide-hits.css. */
(function () {
  // ---- shared column definitions: [name, note, speed/reach] -------------------------------
  var SHIP_MISSILES = [
    ["Tomahawk", "cruise · 32", "245 m/s"],
    ["Harpoon", "anti-ship · 34", "270 m/s"],
    ["Quill", "Porcupine · 26", "720 m/s"],
    ["Heavy missile", "Porcupine · 260", "310 m/s"],
    ["A.S.S. rocket", "32", "690 m/s"]
  ];
  var AIR_MISSILES = [
    ["SAM", "34 · ×1.5 in the air", "600 m/s"],
    ["Air-to-air", "30 · ×1.5 in the air", "680 m/s"],
    ["Quill", "Porcupine", "720 m/s"],
    ["Heavy missile", "Porcupine · 260", "310 m/s"],
    ["A.S.S. rocket", "32", "690 m/s"]
  ];
  var AIR_GUNS = [
    ["Ship’s shell", "naval gun", "900 m/s"],
    ["Cannon rounds", "20 mm · CIWS", "1,050 m/s"],
    [".50 cal rounds", "small boats", "750 m"]
  ];
  var HEAVY = ["Heavyweight torpedo", "Mk 48 · 95", "28.3 m/s"];
  var LIGHT = ["Lightweight torpedo", "Mk 46 / Mk 32 · 22", "23.2 m/s"];

  var TABLES = [
    {
      id: "ships", tab: "Ships", rowLabel: "Ship",
      cap: "Hits to sink each ship, hull alone. <b>Torpedoes sink ships; missiles wear them down; guns do not sink them at all.</b> The last column is not a joke — that really is how many cannon rounds it would take, and that is the whole point of the rule.",
      groups: [["Torpedoes", 2], ["Missiles & rockets", 5], ["Guns", 2]],
      cols: [HEAVY, LIGHT].concat(SHIP_MISSILES, [
        ["Naval gun", "shell · 14", "900 m/s"],
        ["Cannon & CIWS", "20 mm rounds", "1,050 m/s"]
      ]),
      rows: [
        ["Mara / Kodiak class carrier", "both navies", 1200, [13, 55, 38, 36, 47, 5, 38, 86, "600,000"], "30 kn"],
        ["Ox class heavy-lift ship", "civilian", 420, [5, 20, 14, 13, 17, 2, 14, 30, "210,000"], "14 kn"],
        ["Badger class destroyer", "Beaver Valley Navy", 240, [3, 11, 8, 8, 10, 1, 8, 18, "120,000"], "44 kn"],
        ["Ferret class destroyer", "Russian Navy", 220, [3, 10, 7, 7, 9, 1, 7, 16, "110,000"], "32 kn"],
        ["Skunk class waste tanker", "civilian", 200, [3, 10, 7, 6, 8, 1, 7, 15, "100,000"], "17 kn"],
        ["Marten class frigate", "Russian Navy", 110, [2, 5, 4, 4, 5, 1, 4, 8, "11,000"], "31 kn"],
        ["Weasel class frigate", "Beaver Valley Navy", 100, [2, 5, 4, 3, 4, 1, 4, 8, "10,000"], "30 kn"],
        ["Capybara class ferry", "civilian", 100, [2, 5, 4, 3, 4, 1, 4, 8, "10,000"], "22 kn"],
        ["Stoat class patrol cutter", "Russian Navy", 92, [1, 5, 3, 3, 4, 1, 3, 7, "1,150"], "38 kn"],
        ["Rabbit class patrol cutter", "coast guard", 90, [1, 5, 3, 3, 4, 1, 3, 7, "1,125"], "36 kn"],
        ["Rat class fast interceptor", "A.S.S.", 45, [1, 3, 2, 2, 2, 1, 2, 4, "100"], "68 kn"],
        ["Muskrat class fishing boat", "civilian", 35, [1, 2, 2, 2, 2, 1, 2, 3, "78"], "40 kn"],
        ["Mink class assault RHIB", "Russian Navy", 28, [1, 2, 1, 1, 2, 1, 1, 2, "62"], "48 kn"],
        ["Shrew class RHIB", "Beaver Valley Navy", 25, [1, 2, 1, 1, 1, 1, 1, 2, "56"], "42 kn"],
        ["The Badger’s RHIB", "Beaver Valley Navy", 25, [1, 2, 1, 1, 1, 1, 1, 2, "56"], "32 kn"]
      ]
    },
    {
      id: "subs", tab: "Submarines", rowLabel: "Submarine",
      cap: "A submarine has no reserve buoyancy to spend, so a torpedo warhead is a fixed and enormous thing against her: <b>65–95 from a heavyweight, and one in ten does half again</b>. Depth charges fall away sharply — right on top of her is half the boat, half a radius out is an eighth of that, and at the edge it is nothing. The last three columns only reach her while she is on the surface.",
      groups: [["Torpedoes", 2], ["Depth charges", 2], ["Only while she is surfaced", 3]],
      cols: [
        HEAVY, LIGHT,
        ["Right on her", "half the boat", "sinks 9 m/s"],
        ["At half radius", "an eighth", "lethal radius 30 m"],
        ["Tomahawk", "cruise · 32", "245 m/s"],
        ["Harpoon", "anti-ship · 34", "270 m/s"],
        ["Naval gun", "shell · 14", "900 m/s"]
      ],
      rows: [
        ["Otter class submarine", "Russian Navy", 200, ["2–4~2.9", "5–8~6.7", 2, 8, 7, 6, 15], "26 kn"],
        ["USS Beaver Valley", "your submarine", 100, ["1–2~1.9", "2–5~3.6", 2, 8, 4, 3, 8], "34 kn"],
        ["Whatever lives in the trench", "not a submarine", 550, [6, 25, 62, "400+", "—", "—", "—"], "35 kn"]
      ]
    },
    {
      id: "aircraft", tab: "Aircraft", rowLabel: "Aircraft",
      cap: "A missile that connects has a <b>three-in-ten chance of ending the aircraft where it is</b>, and does half again its normal damage when it does not — which is why those are ranges. Gun rounds get no such luck, and there are a great many more of them than there used to be.",
      groups: [["Missiles & rockets", 5], ["Guns", 3]],
      cols: AIR_MISSILES.concat(AIR_GUNS),
      rows: [
        ["Fox class fighter", "Beaver Valley", 84, ["1–2~1.7", "1–2~1.7", "1–3~2.2", 1, "1–2~1.7", 1, "11–30~23.5", "28–96~67.9"], "1,100 kn"],
        ["Wolverine class fighter", "Russian Navy", 76, ["1–2~1.7", "1–2~1.7", "1–2~1.7", 1, "1–2~1.7", 1, "10–27~21.7", "27–87~63.6"], "1,300 kn"],
        ["Carrier jet", "off Mara or Kodiak", 80, ["1–2~1.7", "1–2~1.7", "1–3~2.2", 1, "1–2~1.7", 1, "10–29~22.6", "27–92~65.9"], "570 kn"],
        ["Porcupine", "experimental fighter", 70, ["1–2~1.7", "1–2~1.7", "1–2~1.7", 1, "1–2~1.7", 1, "10–25~20.3", "25–80~59.8"], "780 kn"],
        ["Beaver Valley Air flight", "civilian airliner", 40, [1, 1, 1, 1, 1, 1, "7–15~12.7", "17–47~38.3"], "280 kn"]
      ]
    },
    {
      id: "helicopters", tab: "Helicopters", rowLabel: "Helicopter",
      cap: "Lighter than the jets, and the same rules — except that a Quill hits an aircraft far harder than it hits a ship: <b>sixty against an airframe, twenty-six against a hull</b>. A ship’s shell is still one shell.",
      groups: [["Missiles & rockets", 5], ["Guns", 3]],
      cols: [
        ["SAM", "34", "600 m/s"],
        ["Air-to-air", "30", "680 m/s"],
        ["Quill", "60 against an airframe", "720 m/s"],
        ["Heavy missile", "260", "310 m/s"],
        ["A.S.S. rocket", "32", "690 m/s"]
      ].concat(AIR_GUNS),
      rows: [
        ["Mongoose / Seahawk", "Beaver Valley Navy", 34, [1, "1–2~1.7", 1, 1, "1–2~1.7", 1, "6–13~11.0", "16–40~33.5"], "93 kn"],
        ["Ship’s helicopter", "Russian Navy · the Badger", 65, ["1–2~1.7", "1–3~2.2", "1–2~1.7", 1, "1–3~2.2", 1, "9–23~19.1", "24–75~56.4"], "152 kn"],
        ["A.S.S. attack helicopter", "American Security Services", 58, ["1–2~1.7", "1–2~1.7", 1, 1, "1–2~1.7", 1, "9–21~17.4", "22–67~51.8"], "179 kn"]
      ]
    },
    {
      id: "weapons", tab: "Weapons & reach", spec: true,
      cap: "What each weapon reaches, how fast it gets there, and what one hit is worth. <b>Reach is the thing to learn first</b> — most of what kills you out there was fired from somewhere you had not looked yet.",
      head: ["Weapon", "Carried by", "Reach", "Speed", "One hit"],
      rows: [
        ["Mk 48 heavyweight torpedo", "Your submarine — four in the tubes, fourteen behind them. The Otter carries ten.", "80 m – 4 km", "28.3 m/s (55 kn)", "95 off a ship. Against a submarine 65–95, and one in ten does half again."],
        ["Mk 46 / Mk 32 lightweight torpedo", "Frigate tubes (6), the Mongoose (2 up, 8 in the magazine), both destroyers (8), carrier helicopters.", "60 m – 4 km", "23.2 m/s (45 kn)", "22 off a ship. 24–40 against a submarine."],
        ["Tomahawk cruise missile", "Submarine VLS (12 cells, surfaced only), the frigate (8), the Marten (12).", "300 m to anywhere in the theatre — but never across one", "245 m/s", "32, and a serious fire."],
        ["Harpoon anti-ship missile", "At sea only the destroyers: Badger 16, Ferret 16. In the air the Fox, the Wolverine (2) and the carrier jets.", "330 m – 20 km, same theatre only", "270 m/s", "34, and flooding."],
        ["Air-to-air missile", "Fox, Wolverine (8), carrier jets, the A.S.S. helicopter.", "10 km slant range — altitude separation counts against it", "680 m/s", "30, half again against an aircraft, three-in-ten outright."],
        ["Surface-to-air missile", "Frigate (16), Badger (48), Ferret (32), Marten (24), each carrier (16), and the sites ashore.", "10 km out, 30,000 ft up, 13.5 km at the corner", "600 m/s, 45 s of flight", "34, half again against an aircraft."],
        ["Quill micro-missile", "The Porcupine — sixteen of them.", "About 11 km of powered flight", "720 m/s", "26 off a hull; 60 off an aircraft or an inbound missile."],
        ["Heavy belly missile", "The Porcupine — one.", "Theatre-wide", "310 m/s", "260. That is every warship short of a carrier, in one."],
        ["A.S.S. rocket", "The A.S.S. attack helicopter.", "About 12 km", "690 m/s", "32 — exactly a Tomahawk."],
        ["Naval gun", "Every warship. Badger 300 shells, Ferret 240, the frigate 200, Marten 180, the cutters 160.", "70 m – 3 km", "900 m/s, ballistic, no homing at all", "14 off a hull. One shell ends any aircraft."],
        ["Autocannon & aircraft cannon", "Cutters (500), RHIBs (240), the Wolverine (500), every carrier jet (510 each, 6,120 in the ship).", "2 km; a gun run on a ship closes to 1 km", "1,050 m/s, plus whatever the shooter is already doing", "2–4 off an airframe. Next to nothing off a hull."],
        ["CIWS", "The frigate (1,500), Ferret (2,000), Badger (2,400), each carrier (3,100).", "2 km", "1,050 m/s", "Twenty rounds in three tenths of a second; 0.9 off an inbound missile."],
        ["Twin Vulcan", "The A.S.S. attack helicopter.", "3 km, and only in a 30° cone off the nose", "1,050 m/s", "4.5 off an airframe."],
        [".50 cal", "RHIBs, the Rat interceptor, small boats.", "750 m", "—", "One round in ten gets through at all. It will still wreck a helicopter."],
        ["Depth charges", "Frigate stern racks (20), the Badger (30). Five to a pattern.", "Rolled off within 140 m — 300 m if you are hunting the thing in the trench", "Sinks at 9 m/s, fuzes from 10 m to 320 m", "Half the boat right on her; an eighth of that half a radius out; nothing at the edge."],
        ["Nuclear Tomahawk", "The submarine, from its own targeting console.", "Theatre-wide, and five kilometres of blast when it lands", "245 m/s", "Everything inside the circle, friendly or not — and it can be shot down like any other missile."]
      ]
    },
    {
      id: "fleet", tab: "The fleet", spec: true,
      cap: "Every hull and airframe out there, what it will do and what it is carrying when the operation starts. <b>Hull is how much punishment it takes; the speed is the best it will ever make.</b>",
      head: ["Vessel", "Side", "Hull", "Top speed", "What she carries"],
      rows: [
        ["USS Beaver Valley — Beaver class", "yours", "100", "34 kn", "Four Mk 48 in the tubes and fourteen behind them, twelve Tomahawk cells, fifteen compartments and a deck."],
        ["Weasel class frigate", "Beaver Valley Navy", "100", "30 kn", "8 Tomahawk, 16 SAM, 6 torpedoes, 20 depth charges, a 76 mm gun with 200 shells, CIWS, and the Mongoose on the deck."],
        ["Badger class destroyer", "Beaver Valley Navy", "240", "44 kn", "300 shells, 16 Harpoon, 48 SAM, 8 torpedoes, 30 depth charges, 2,400 CIWS rounds, a helicopter, a RHIB and sonobuoys."],
        ["Mara class carrier", "Beaver Valley Navy", "1,200", "30 kn", "Four jets and a helicopter, 72 air-to-air and 36 strike reloads, 16 SAM, 3,100 CIWS rounds, 32 chaff, 16 acoustic decoys."],
        ["Rabbit class patrol cutter", "coast guard", "90", "36 kn", "160 shells, 500 cannon rounds, a RHIB, and a helicopter parked on her."],
        ["Shrew class RHIB", "Beaver Valley Navy", "25", "42 kn", "A 240-round pintle gun, four seats, grapples and a boarding party."],
        ["Capybara class ferry", "civilian", "100", "22 kn", "Passengers, vehicles, a timetable, and not one weapon."],
        ["Skunk class waste tanker", "civilian", "200", "17 kn", "Cargo pumps. Nothing else."],
        ["Ox class heavy-lift ship", "civilian", "420", "14 kn", "138 m of open deck, two lattice cranes, and the Angler chocked on it."],
        ["Muskrat class fishing boat", "civilian", "35", "40 kn", "An electromagnetic harpoon, a trawl net, a fish finder and a hold to fill."],
        ["Rat class fast interceptor", "A.S.S.", "45", "68 kn", "Four of them, each fitted differently: a .50 cal (240 rounds), lightweight torpedoes (4), a drone rack, or a sensor mast."],
        ["Otter class submarine", "Russian Navy", "200", "26 kn", "10 Mk 48, 20 cruise missiles she has to surface to fire, 8 acoustic decoys."],
        ["Ferret class destroyer", "Russian Navy", "220", "32 kn", "240 shells, 16 Harpoon, 32 SAM, 8 torpedoes, 2,000 CIWS rounds, decoys and a helicopter."],
        ["Kodiak class carrier", "Russian Navy", "1,200", "30 kn", "The same as Mara, pointed the other way."],
        ["Marten class frigate", "Russian Navy", "110", "31 kn", "180 shells, 12 cruise missiles, 24 SAM, 8 torpedoes, 1,800 CIWS rounds, a helicopter."],
        ["Stoat class patrol cutter", "Russian Navy", "92", "38 kn", "160 shells, 500 cannon rounds, 8 SAM."],
        ["Mink class assault RHIB", "Russian Navy", "28", "48 kn", "A 240-round pintle gun and people who intend to come aboard."],
        ["Lotar — the thing in the trench", "its own side", "550", "35 kn", "Six hundred metres of it."],
        ["Fox class multirole fighter", "Beaver Valley", "84", "1,100 kn", "Four loadouts — air-to-air, Harpoons for maritime strike, precision strike, combat patrol — and an internal cannon."],
        ["Porcupine", "experimental", "70", "780 kn", "Sixteen Quills, one heavy belly missile, a Vulcan, and automatic threat defence."],
        ["Wolverine class fighter", "Russian Navy", "76", "1,300 kn", "8 air-to-air, 2 Harpoon, 500 cannon rounds, 24 flares and 24 chaff."],
        ["Carrier jet", "off either carrier", "80", "570 kn", "510 cannon rounds each, and whatever the wing hangs on it — air-to-air, Harpoons, or nothing but the gun."],
        ["Beaver Valley Air flight", "civilian", "40", "280 kn", "143 souls."],
        ["Mongoose ASW helicopter", "Beaver Valley frigate", "34", "93 kn", "Two Mk 46 with eight in the magazine, a dipping search, sonobuoys."],
        ["Ship’s helicopter", "Russian Navy · the Badger", "65", "152 kn", "Torpedoes, and on the Badger a sonobuoy field of her own."],
        ["A.S.S. attack helicopter", "American Security Services", "58", "179 kn", "Twin Vulcans in a 30° cone, rockets, air-to-air missiles — four of them, flown independently."],
        ["Angler submersible", "FoundryStop", "—", "3 kn", "Two seats, five floodlights, and a hull rated to 11,500 m against a trench 10,900 m deep."]
      ]
    }
  ];

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function cell(v, sep) {
    var s = String(v), parts = s.split("~"), shown = parts[0];
    var num = (shown.indexOf("–") >= 0 ? shown.split("–")[1] : shown).replace(/,/g, "");
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
      return '<tr><td class="hull"><b>' + esc(r[0]) + "</b><span>" + esc(r[1]) + '</span></td><td class="hp">' + r[2] + "</td>" +
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
        '><p class="hits-cap">' + t.cap + '</p><div class="hits-scroll">' + (t.spec ? spec(t) : matrix(t)) + "</div></div>";
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

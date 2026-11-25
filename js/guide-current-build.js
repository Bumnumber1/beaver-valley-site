/* Current game data in the existing Field Guide tables. */
(function () {
  var TABLES = [
  {
    "id": "ships",
    "tab": "Ships",
    "rowLabel": "Ship",
    "groups": [
      [
        "Torpedo hits",
        2
      ]
    ],
    "cols": [
      [
        "Heavyweight torpedo",
        "Mk 48 · 95 base hull damage",
        "28.3 m/s"
      ],
      [
        "Lightweight torpedo",
        "Mk 46 / Mk 32 · 60 base hull damage",
        "23.2 m/s"
      ]
    ],
    "cap": "Hull-only minimum estimates at full undamaged rating. Flooding, armour, hit position and other damage can change the result.",
    "rows": [
      [
        "Weasel",
        "Beaver Valley guided-missile frigate",
        100,
        [
          2,
          2
        ],
        "30 kn"
      ],
      [
        "Marten",
        "Russian guided-missile frigate",
        110,
        [
          2,
          2
        ],
        "31 kn"
      ],
      [
        "Badger",
        "Beaver Valley guided-missile destroyer",
        240,
        [
          3,
          4
        ],
        "44 kn"
      ],
      [
        "Ferret",
        "Russian guided-missile destroyer",
        220,
        [
          3,
          4
        ],
        "32 kn"
      ],
      [
        "Rabbit",
        "Beaver Valley patrol cutter",
        90,
        [
          1,
          2
        ],
        "36 kn"
      ],
      [
        "Stoat",
        "Russian patrol cutter",
        92,
        [
          1,
          2
        ],
        "38 kn"
      ],
      [
        "Mara",
        "Beaver Valley fleet carrier",
        1200,
        [
          13,
          20
        ],
        "30 kn"
      ],
      [
        "Kodiak",
        "Russian fleet carrier",
        1200,
        [
          13,
          20
        ],
        "30 kn"
      ],
      [
        "Capybara",
        "Passenger and vehicle ferry",
        100,
        [
          2,
          2
        ],
        "22 kn"
      ],
      [
        "Skunk",
        "Liquid-waste tanker",
        200,
        [
          3,
          4
        ],
        "17 kn"
      ],
      [
        "Ox",
        "FoundryStop heavy-lift cargo ship",
        420,
        [
          5,
          7
        ],
        "24 kn"
      ],
      [
        "Muskrat",
        "Commercial fishing boat",
        35,
        [
          1,
          1
        ],
        "40 kn"
      ],
      [
        "Launchpad",
        "Private motor yacht",
        150,
        [
          2,
          3
        ],
        "24 kn"
      ],
      [
        "Moose (YT 1)",
        "Beaver Valley Navy tug",
        60,
        [
          1,
          1
        ],
        "13.5 kn"
      ],
      [
        "Polecat (RB-217)",
        "Russian naval tug",
        50,
        [
          1,
          1
        ],
        "11.5 kn"
      ],
      [
        "Seal (CGT 1)",
        "Coast Guard tug",
        60,
        [
          1,
          1
        ],
        "13.5 kn"
      ],
      [
        "Manatee (FT 1)",
        "Fisheries tug",
        60,
        [
          1,
          1
        ],
        "13.5 kn"
      ]
    ]
  },
  {
    "id": "subs",
    "tab": "Submarines",
    "rowLabel": "Submarine",
    "groups": [
      [
        "Torpedo hits",
        2
      ]
    ],
    "cols": [
      [
        "Heavyweight torpedo",
        "85–99 · 15% critical",
        "28.3 m/s"
      ],
      [
        "Lightweight torpedo",
        "68–82 · 8% critical",
        "23.2 m/s"
      ]
    ],
    "cap": "The low end of each range includes a critical pressure-hull hit. Ordinary damage, flooding and compartment state can change the result.",
    "rows": [
      [
        "Beaver",
        "Beaver Valley submarine",
        "100 HP",
        [
          "1–2",
          "1–2"
        ],
        "34 kn"
      ],
      [
        "Otter",
        "Russian guided-missile submarine",
        "200 HP",
        [
          "1–3",
          "1–3"
        ],
        "26 kn"
      ]
    ]
  },
  {
    "id": "aircraft",
    "tab": "Aircraft",
    "spec": true,
    "head": [
      "Vessel or aircraft",
      "Role",
      "Hull",
      "Speed",
      "Equipment and availability"
    ],
    "cap": "Current airframe and speed ratings, including the Fox loadout variants.",
    "rows": [
      [
        "Beaver Valley Air",
        "Civilian airliner",
        "40 HP",
        "280 kn",
        "Crew posts 3 · Armament Unarmed · Passenger cabin, cockpit view and retractable landing gear. · Mission selection"
      ],
      [
        "Heron",
        "Maritime patrol aircraft",
        "55 HP",
        "330 kn",
        "Crew posts 5 · Carries 4 Harpoons, 6 lightweight torpedoes and 48 sonobuoys. Includes magnetic anomaly detection and an observation turret. · Mission selection"
      ],
      [
        "Porcupine",
        "Experimental fighter",
        "70 HP",
        "780 kn",
        "Crew posts 1 · Seating 1 pilot · Vulcan cannon, 16 Quill missiles and one belly missile. · Mission selection"
      ],
      [
        "Wolverine",
        "Russian air-superiority fighter",
        "76 HP",
        "1300 kn",
        "Crew posts 1 · Seating 1 pilot · 500 cannon rounds, 8 air-to-air missiles and 2 anti-ship missiles. · Mission selection"
      ],
      [
        "Fox · Air superiority",
        "Beaver Valley multirole fighter",
        "84 HP",
        "1100 kn",
        "Crew posts 1 · Seating 1 pilot · M61 cannon with 510 rounds and 8 air-to-air missiles. · Mission selection"
      ],
      [
        "Fox · Maritime strike",
        "Beaver Valley multirole fighter",
        "84 HP",
        "1100 kn",
        "Crew posts 1 · Seating 1 pilot · M61 cannon with 510 rounds and 4 air-to-air and 4 anti-ship missiles. · Mission selection"
      ],
      [
        "Fox · Precision strike",
        "Beaver Valley multirole fighter",
        "84 HP",
        "1100 kn",
        "Crew posts 1 · Seating 1 pilot · M61 cannon with 510 rounds and 2 air-to-air, 2 anti-ship and 2 guided strike missiles. · Mission selection"
      ],
      [
        "Fox · Combat patrol",
        "Beaver Valley multirole fighter",
        "84 HP",
        "1100 kn",
        "Crew posts 1 · Seating 1 pilot · M61 cannon with 510 rounds and 6 air-to-air and 2 anti-ship missiles. · Mission selection"
      ],
      [
        "Colosseum airlift",
        "Heavy-lift formation",
        "1000 HP",
        "64 kn",
        "The game tracks the formation of ten heavy-lift helicopters carrying the Colosseum as one contact. · Event contact"
      ],
      [
        "Mara deck fighter",
        "Carrier-based Fox",
        "—",
        "573.4 kn",
        "Manual top speed 295 m/s · Airframe integrity 80 · Starting air-to-air missiles 4 · Fighter berths 7 · Starts with the mixed fit. A pilot can take the aircraft after launch, then recover it aboard the carrier. · Launch from Mara"
      ],
      [
        "Kodiak deck fighter",
        "Carrier-based Wolverine",
        "—",
        "573.4 kn",
        "Manual top speed 295 m/s · Airframe integrity 80 · Starting air-to-air missiles 4 · Fighter berths 7 · Starts with the mixed fit. A pilot can take the aircraft after launch, then recover it aboard the carrier. · Launch from Kodiak"
      ]
    ]
  },
  {
    "id": "helicopters",
    "tab": "Helicopters",
    "spec": true,
    "head": [
      "Vessel or aircraft",
      "Role",
      "Hull",
      "Speed",
      "Equipment and availability"
    ],
    "cap": "Current land-based and shipboard helicopter ratings.",
    "rows": [
      [
        "RAT attack helicopter",
        "A.S.S. combat helicopter",
        "—",
        "135 kn",
        "Cruise 120 kn · Seating 1 pilot + 4 team seats · Airframe integrity 58 · Four numbered RATs share this fit, with one representative aircraft in the mission selector. Their assigned pilots are Felicia Rook (01), Hector Nail (02), Anika Slate (03) and Quentin Mire (04). Twin M134s, two air-to-air missiles, searchlight and rappelling. · Mission selection"
      ],
      [
        "Walrus",
        "Coast Guard rescue helicopter",
        "—",
        "170 kn",
        "Cruise 140 kn · Reverse 35 kn · Seating 12 team seats + pilot · Armament Unarmed · Searchlight, rescue ladder and rappelling. · Mission selection"
      ],
      [
        "Pronghorn",
        "Hospital medevac helicopter",
        "—",
        "137 kn",
        "Cruise 130 kn · Reverse 30 kn · Armament Unarmed · Patient transport and medical response. · Mission selection"
      ],
      [
        "Salamander",
        "Fire rescue helicopter",
        "—",
        "140 kn",
        "Cruise 130 kn · Reverse 45 kn · Firefighting water cannon and fire response. · Mission selection"
      ],
      [
        "Meerkat",
        "Police air support",
        "—",
        "136 kn",
        "Cruise 125 kn · Reverse 25 kn · Seating 6 team seats + pilot · Armament Unarmed · Searchlight and police response. · Mission selection"
      ],
      [
        "Woodchuck",
        "A.S.S. heavy-lift helicopter",
        "—",
        "170 kn",
        "Cruise 150 kn · Reverse 45 kn · Seating 24 team seats + pilot · Armament Unarmed · Team transport and rappelling. · Mission selection"
      ],
      [
        "Chipmunk",
        "Private helicopter",
        "—",
        "100 kn",
        "Cruise 90 kn · Reverse 17 kn · Armament Unarmed · Helipad landings and civilian sightseeing. · Mission selection"
      ],
      [
        "Swift",
        "Postal courier helicopter",
        "—",
        "109 kn",
        "Cruise 100 kn · Reverse 20 kn · Seating 1 passenger + pilot · Armament Unarmed · Carries mail in the rear compartment. · Mission selection"
      ],
      [
        "Chinchilla",
        "Executive transport helicopter",
        "—",
        "155 kn",
        "Cruise 138 kn · Reverse 30 kn · Based aboard the Launchpad motor yacht. · Board on Launchpad"
      ],
      [
        "Mara deck helicopter",
        "Carrier-based anti-submarine helicopter",
        "—",
        "145 kn",
        "Cruise 125 kn · Airframe integrity 80 · Helicopter berths 1 · The dedicated helicopter slot begins with the anti-submarine fit. The carrier planner handles its assignment and return. · Launch from Mara"
      ],
      [
        "Kodiak deck helicopter",
        "Carrier-based anti-submarine helicopter",
        "—",
        "145 kn",
        "Cruise 125 kn · Airframe integrity 80 · Helicopter berths 1 · The dedicated helicopter slot begins with the anti-submarine fit. The carrier planner handles its assignment and return. · Launch from Kodiak"
      ],
      [
        "Weasel Mongoose",
        "Shipborne anti-submarine helicopter",
        "—",
        "145 kn",
        "Cruise 125 kn · Reverse 35 kn · Uses sonobuoys and torpedoes. · Embarked on Weasel"
      ],
      [
        "Badger Mongoose",
        "Shipborne anti-submarine helicopter",
        "—",
        "145 kn",
        "Cruise 125 kn · Reverse 35 kn · Airframe integrity 65 · Uses sonobuoys and torpedoes. · Embarked on Badger"
      ],
      [
        "Ferret Sable",
        "Russian shipborne helicopter",
        "—",
        "146 kn",
        "Cruise 124 kn · Reverse 35 kn · Airframe integrity 65 · Operates from the Marten and Ferret for anti-submarine missions. · Embarked on Ferret"
      ],
      [
        "Marten Sable",
        "Russian shipborne helicopter",
        "—",
        "146 kn",
        "Cruise 124 kn · Reverse 35 kn · Airframe integrity 65 · Operates from the Marten and Ferret for anti-submarine missions. · Embarked on Marten"
      ]
    ]
  },
  {
    "id": "weapons",
    "tab": "Weapons & reach",
    "spec": true,
    "head": [
      "Weapon",
      "Reach",
      "Speed",
      "In-game effect"
    ],
    "cap": "Selected launch and engagement ratings from the current game rules. These figures apply to the listed weapons and conditions.",
    "rows": [
      [
        "Mk 48 heavyweight torpedo",
        "Up to 4 km on supported launchers",
        "28.3 m/s",
        "95 base hull damage against surface ships. Against submarines it deals 85–99, with a 15% pressure-hull critical chance."
      ],
      [
        "Mk 46 / Mk 32 lightweight torpedo",
        "Up to 4 km on supported launchers",
        "23.2 m/s",
        "60 base hull damage against surface ships. Against submarines it deals 68–82, with an 8% pressure-hull critical chance."
      ],
      [
        "Tomahawk cruise missile",
        "Targets within the current operating region",
        "245 m/s",
        "VLS-equipped submarines must surface to launch."
      ],
      [
        "Harpoon anti-ship missile",
        "Up to 20 km",
        "270 m/s",
        "Aircraft and ship launchers use their own release checks."
      ],
      [
        "Tracked deck gun",
        "Up to 3 km",
        "900 m/s on the Weasel",
        "Main-gun shells are ballistic."
      ],
      [
        "Surface-to-air missile",
        "10 km horizontal engagement range",
        "—",
        "Altitude and the launcher affect eligibility."
      ],
      [
        "CIWS cannon",
        "Up to 2 km",
        "1,050 m/s",
        "A standard burst is 20 rounds. Missile interception depends on range and actual contact."
      ],
      [
        "Depth charge",
        "140 m launch distance, up to 300 m against the deep-water creature",
        "9 m/s sink rate",
        "The 30 m lethal radius has a steep damage falloff."
      ]
    ]
  },
  {
    "id": "fleet",
    "tab": "The fleet",
    "spec": true,
    "head": [
      "Vessel or aircraft",
      "Role",
      "Hull",
      "Speed",
      "Equipment and availability"
    ],
    "cap": "Crew posts and passenger seats are listed separately when the game provides them.",
    "rows": [
      [
        "Beaver",
        "Beaver Valley submarine",
        "100 HP",
        "34 kn",
        "Crew posts 11 · Torpedoes 4 ready + 14 in reserve · Mk 48 torpedoes, Tomahawk vertical-launch system, sonar and acoustic decoys. · Mission selection"
      ],
      [
        "Otter",
        "Russian guided-missile submarine",
        "200 HP",
        "26 kn",
        "Crew posts 11 · 10 heavyweight torpedoes, 20 cruise missiles and 8 acoustic decoys. · Mission selection"
      ],
      [
        "Weasel",
        "Beaver Valley guided-missile frigate",
        "100 HP",
        "30 kn",
        "Crew posts 11 · Main gun 200 rounds · Surface-to-air missiles 16 · Torpedoes / depth charges 6 / 20 · Main gun, Tomahawks, surface-to-air missiles, torpedoes, depth charges and close-in defence. Carries a Mongoose helicopter and a boarding boat. · Mission selection"
      ],
      [
        "Marten",
        "Russian guided-missile frigate",
        "110 HP",
        "31 kn",
        "Crew posts 11 · 180 main-gun rounds, 12 cruise missiles, 24 surface-to-air missiles and two types of torpedo. Carries a Sable helicopter. · Mission selection"
      ],
      [
        "Badger",
        "Beaver Valley guided-missile destroyer",
        "240 HP",
        "44 kn",
        "Crew posts 11 · Main gun, Harpoons, surface-to-air missiles, torpedoes, depth charges and close-in defence. Its own RHIB can be launched. · Mission selection"
      ],
      [
        "Ferret",
        "Russian guided-missile destroyer",
        "220 HP",
        "32 kn",
        "Crew posts 11 · 240 main-gun rounds and 16 anti-ship missiles, plus surface-to-air missiles, torpedoes and close-in defence. Carries a Sable helicopter. · Mission selection"
      ],
      [
        "Rabbit",
        "Beaver Valley patrol cutter",
        "90 HP",
        "36 kn",
        "Crew posts 3 · 160 main-gun rounds and 500 autocannon rounds. · Mission selection"
      ],
      [
        "Stoat",
        "Russian patrol cutter",
        "92 HP",
        "38 kn",
        "Crew posts 3 · 160 main-gun rounds, 500 autocannon rounds and 8 surface-to-air missiles. · Mission selection"
      ],
      [
        "Mara",
        "Beaver Valley fleet carrier",
        "1200 HP",
        "30 kn",
        "Crew posts 15 · Fighter berths 4 deck + 3 hangar · 16 surface-to-air missiles, 3,100 close-in defence rounds and room for seven Fox fighters and one helicopter. · Mission selection"
      ],
      [
        "Kodiak",
        "Russian fleet carrier",
        "1200 HP",
        "30 kn",
        "Crew posts 15 · Fighter berths 4 deck + 3 hangar · 16 surface-to-air missiles, 3,100 close-in defence rounds and room for seven Wolverine fighters and one helicopter. · Mission selection"
      ],
      [
        "Capybara",
        "Passenger and vehicle ferry",
        "100 HP",
        "22 kn",
        "Crew posts 6 · Armament Unarmed · Passenger service, docking and drinks aboard. The ferry is the evacuation ship in The Last Ferry. · Mission selection"
      ],
      [
        "Skunk",
        "Liquid-waste tanker",
        "200 HP",
        "17 kn",
        "Crew posts 9 · Cargo 600 t · Armament Unarmed · Uses terminal pumps to load and unload sewage. · Mission selection"
      ],
      [
        "Ox",
        "FoundryStop heavy-lift cargo ship",
        "420 HP",
        "24 kn",
        "Crew posts 4 · Open cargo deck 138 m · Armament Unarmed · Two deck cranes handle heavy cargo. The Angler deep submersible rides on its deck. · Mission selection"
      ],
      [
        "Muskrat",
        "Commercial fishing boat",
        "35 HP",
        "40 kn",
        "Crew posts 3 · Fish hold 18 t · Cable harpoon, trawl net, fish finder and space for the catch. · Mission selection"
      ],
      [
        "Launchpad",
        "Private motor yacht",
        "150 HP",
        "24 kn",
        "Crew posts 7 · Length 118.9 m · Armament Unarmed · Two helipads and a Chinchilla executive helicopter. · Mission selection"
      ],
      [
        "Moose (YT 1)",
        "Beaver Valley Navy tug",
        "60 HP",
        "13.5 kn",
        "Length × beam × draft 30 × 11 × 5 m · Bollard pull 70 t · Displacement 650 t · Armament Unarmed · Can take a vessel in tow and deliver it to a yard. · Mission selection"
      ],
      [
        "Polecat (RB-217)",
        "Russian naval tug",
        "50 HP",
        "11.5 kn",
        "Length × beam × draft 28 × 9.4 × 4.4 m · Bollard pull 45 t · Displacement 500 t · Armament Unarmed · Can take a vessel in tow and deliver it to a yard. · Mission selection"
      ],
      [
        "Seal (CGT 1)",
        "Coast Guard tug",
        "60 HP",
        "13.5 kn",
        "Length × beam × draft 30 × 11 × 5 m · Bollard pull 70 t · Displacement 650 t · Armament Unarmed · Can take a vessel in tow and deliver it to a yard. Shares the Moose hull and its painted YT 1 number. · Mission selection"
      ],
      [
        "Manatee (FT 1)",
        "Fisheries tug",
        "60 HP",
        "13.5 kn",
        "Length × beam × draft 30 × 11 × 5 m · Bollard pull 70 t · Displacement 650 t · Armament Unarmed · Can take a vessel in tow and deliver it to a yard. Shares the Moose hull and its painted YT 1 number. · Mission selection"
      ],
      [
        "Shrew",
        "Beaver Valley boarding boat",
        "25 HP",
        "42 kn",
        "Crew posts 4 · Seating 1 coxswain + 3 passengers · Pintle gun with 240 rounds. Operates as a small-boat command or from a supporting ship. · Mission selection"
      ],
      [
        "Mink",
        "Russian assault RHIB",
        "28 HP",
        "48 kn",
        "Crew posts 4 · Pintle gun with 240 rounds. · Mission selection"
      ],
      [
        "RAT fast interceptor · Sensors",
        "A.S.S. speedboat",
        "45 HP",
        "68 kn",
        "Crew posts 2 · Unarmed sensor fit with air and surface radar and active and passive sonar. · Mission selection"
      ],
      [
        "RAT fast interceptor · .50 cal",
        "A.S.S. speedboat",
        "45 HP",
        "68 kn",
        "Crew posts 2 · Pintle gun with 240 rounds. · Mission selection"
      ],
      [
        "RAT fast interceptor · Torpedoes",
        "A.S.S. speedboat",
        "45 HP",
        "68 kn",
        "Crew posts 2 · Four lightweight torpedoes. · Mission selection"
      ],
      [
        "RAT fast interceptor · Drone launcher",
        "A.S.S. speedboat",
        "45 HP",
        "68 kn",
        "Crew posts 2 · Deploys autonomous drones from its launcher. · Mission selection"
      ],
      [
        "TERN cruising sloop",
        "Civilian watercraft",
        "100 HP",
        "7.5 kn",
        "Length × beam × draft 10.6 × 3.44 × 1.96 m · Seats including helm 3 · Purchase price $85,000 · Cruising sailboat. · Emporium or civilian mission selection"
      ],
      [
        "GULL daysailer",
        "Civilian watercraft",
        "100 HP",
        "6 kn",
        "Length × beam × draft 6.466 × 2.0984 × 1.196 m · Seats including helm 3 · Purchase price $24,000 · Light sailing boat. · Emporium or civilian mission selection"
      ],
      [
        "DOLPHIN civilian speedboat",
        "Civilian watercraft",
        "100 HP",
        "38 kn",
        "Length × beam × draft 7.2 × 2.55 × 0.75 m · Seats including helm 6 · Purchase price $42,000 · Motorboat with bow and rear passenger seats. · Emporium or civilian mission selection"
      ],
      [
        "Cedar touring canoe",
        "Civilian watercraft",
        "100 HP",
        "4 kn",
        "Length × beam × draft 4.9 × 0.94 × 0.22 m · Seats including helm 2 · Purchase price $1,800 · Paddle from the stern with a passenger in the bow. · Emporium or civilian mission selection"
      ],
      [
        "Touring sea kayak",
        "Civilian watercraft",
        "100 HP",
        "4.5 kn",
        "Length × beam × draft 4.3 × 0.64 × 0.2 m · Seats including helm 1 · Purchase price $1,200 · Single-seat paddle craft. · Emporium or civilian mission selection"
      ],
      [
        "Civilian three-seat jetski",
        "Civilian watercraft",
        "100 HP",
        "48 kn",
        "Length × beam × draft 3.35 × 1.24 × 0.27 m · Seats including helm 3 · Purchase price $16,000 · Powered personal watercraft. · Emporium or civilian mission selection"
      ],
      [
        "SEAL TEAM K RHIB",
        "Military launch",
        "100 HP",
        "35 kn",
        "Length × beam × draft 9.4 × 3.35 × 0.45 m · Seats including helm 4 · A dedicated boat at the team’s launch berth. · SEAL Team K berth"
      ],
      [
        "Beaver Valley Air",
        "Civilian airliner",
        "40 HP",
        "280 kn",
        "Crew posts 3 · Armament Unarmed · Passenger cabin, cockpit view and retractable landing gear. · Mission selection"
      ],
      [
        "Heron",
        "Maritime patrol aircraft",
        "55 HP",
        "330 kn",
        "Crew posts 5 · Carries 4 Harpoons, 6 lightweight torpedoes and 48 sonobuoys. Includes magnetic anomaly detection and an observation turret. · Mission selection"
      ],
      [
        "Porcupine",
        "Experimental fighter",
        "70 HP",
        "780 kn",
        "Crew posts 1 · Seating 1 pilot · Vulcan cannon, 16 Quill missiles and one belly missile. · Mission selection"
      ],
      [
        "Wolverine",
        "Russian air-superiority fighter",
        "76 HP",
        "1300 kn",
        "Crew posts 1 · Seating 1 pilot · 500 cannon rounds, 8 air-to-air missiles and 2 anti-ship missiles. · Mission selection"
      ],
      [
        "Fox · Air superiority",
        "Beaver Valley multirole fighter",
        "84 HP",
        "1100 kn",
        "Crew posts 1 · Seating 1 pilot · M61 cannon with 510 rounds and 8 air-to-air missiles. · Mission selection"
      ],
      [
        "Fox · Maritime strike",
        "Beaver Valley multirole fighter",
        "84 HP",
        "1100 kn",
        "Crew posts 1 · Seating 1 pilot · M61 cannon with 510 rounds and 4 air-to-air and 4 anti-ship missiles. · Mission selection"
      ],
      [
        "Fox · Precision strike",
        "Beaver Valley multirole fighter",
        "84 HP",
        "1100 kn",
        "Crew posts 1 · Seating 1 pilot · M61 cannon with 510 rounds and 2 air-to-air, 2 anti-ship and 2 guided strike missiles. · Mission selection"
      ],
      [
        "Fox · Combat patrol",
        "Beaver Valley multirole fighter",
        "84 HP",
        "1100 kn",
        "Crew posts 1 · Seating 1 pilot · M61 cannon with 510 rounds and 6 air-to-air and 2 anti-ship missiles. · Mission selection"
      ],
      [
        "RAT attack helicopter",
        "A.S.S. combat helicopter",
        "—",
        "135 kn",
        "Cruise 120 kn · Seating 1 pilot + 4 team seats · Airframe integrity 58 · Four numbered RATs share this fit, with one representative aircraft in the mission selector. Their assigned pilots are Felicia Rook (01), Hector Nail (02), Anika Slate (03) and Quentin Mire (04). Twin M134s, two air-to-air missiles, searchlight and rappelling. · Mission selection"
      ],
      [
        "Walrus",
        "Coast Guard rescue helicopter",
        "—",
        "170 kn",
        "Cruise 140 kn · Reverse 35 kn · Seating 12 team seats + pilot · Armament Unarmed · Searchlight, rescue ladder and rappelling. · Mission selection"
      ],
      [
        "Pronghorn",
        "Hospital medevac helicopter",
        "—",
        "137 kn",
        "Cruise 130 kn · Reverse 30 kn · Armament Unarmed · Patient transport and medical response. · Mission selection"
      ],
      [
        "Salamander",
        "Fire rescue helicopter",
        "—",
        "140 kn",
        "Cruise 130 kn · Reverse 45 kn · Firefighting water cannon and fire response. · Mission selection"
      ],
      [
        "Meerkat",
        "Police air support",
        "—",
        "136 kn",
        "Cruise 125 kn · Reverse 25 kn · Seating 6 team seats + pilot · Armament Unarmed · Searchlight and police response. · Mission selection"
      ],
      [
        "Woodchuck",
        "A.S.S. heavy-lift helicopter",
        "—",
        "170 kn",
        "Cruise 150 kn · Reverse 45 kn · Seating 24 team seats + pilot · Armament Unarmed · Team transport and rappelling. · Mission selection"
      ],
      [
        "Chipmunk",
        "Private helicopter",
        "—",
        "100 kn",
        "Cruise 90 kn · Reverse 17 kn · Armament Unarmed · Helipad landings and civilian sightseeing. · Mission selection"
      ],
      [
        "Swift",
        "Postal courier helicopter",
        "—",
        "109 kn",
        "Cruise 100 kn · Reverse 20 kn · Seating 1 passenger + pilot · Armament Unarmed · Carries mail in the rear compartment. · Mission selection"
      ],
      [
        "Badger’s RHIB",
        "Destroyer’s embarked boarding boat",
        "25 HP",
        "42 kn",
        "Docking footprint 9.4 × 3.35 m · Patrol transit 28 kn · 240 pintle-gun rounds. Its contact joins the chart when the boat is in the water. · Launch from the Badger"
      ],
      [
        "Angler",
        "Deep submersible",
        "—",
        "3.1 kn",
        "Forward speed 1.6 m/s · Vertical speed 18 m/s · Crush depth 11,500 m · Seats 2 · Length 7.3 m · Lifted weight 11.8 t · The Ox’s crane can lower its floodlit exploration sub to the water. · Deploy from the Ox"
      ],
      [
        "Chinchilla",
        "Executive transport helicopter",
        "—",
        "155 kn",
        "Cruise 138 kn · Reverse 30 kn · Based aboard the Launchpad motor yacht. · Board on Launchpad"
      ],
      [
        "Ironfin",
        "Heavy-lift merchant",
        "100 HP",
        "31 kn",
        "Cruise 16 kn · Length × beam × draft 110 × 20 × 5 m · Cargo capacity 500 t of steel or food · Route cruise 16 kn · Loads freight, waits for a berth and runs its delivery route. Uses the twin-crane Ox hull. · Shipping traffic"
      ],
      [
        "Mercy",
        "Heavy-lift merchant",
        "100 HP",
        "31 kn",
        "Cruise 16 kn · Length × beam × draft 110 × 20 × 5 m · Cargo capacity 250 t of machinery or medicine · Route cruise 16 kn · Loads freight, waits for a berth and runs its delivery route. Uses the twin-crane Ox hull. · Shipping traffic"
      ],
      [
        "Cistern",
        "Fuel carrier",
        "100 HP",
        "31 kn",
        "Cruise 16 kn · Length × beam × draft 110 × 20 × 5 m · Cargo capacity 700 t of fuel · Route cruise 16 kn · Loads freight, waits for a berth and runs its delivery route. Uses the same tank hull as the Skunk. · Shipping traffic"
      ],
      [
        "Skunk 1",
        "Sewer-network tanker · east berth",
        "100 HP",
        "31 kn",
        "Cruise 16 kn · Length × beam × draft 110 × 20 × 5 m · Cargo capacity 600 t of sewage or fuel · Length × beam × draft 110 × 20 × 5 m · Route cruise 16 kn · Loads freight, waits for a berth and runs its delivery route. Uses the same tank hull as the Skunk. · Shipping traffic"
      ],
      [
        "Skunk 2",
        "Sewer-network tanker · west berth",
        "100 HP",
        "31 kn",
        "Cruise 16 kn · Length × beam × draft 110 × 20 × 5 m · Cargo capacity 600 t of sewage or fuel · Length × beam × draft 110 × 20 × 5 m · Route cruise 16 kn · Loads freight, waits for a berth and runs its delivery route. Uses the same tank hull as the Skunk. · Shipping traffic"
      ],
      [
        "Colosseum airlift",
        "Heavy-lift formation",
        "1000 HP",
        "64 kn",
        "The game tracks the formation of ten heavy-lift helicopters carrying the Colosseum as one contact. · Event contact"
      ],
      [
        "Mara deck fighter",
        "Carrier-based Fox",
        "—",
        "573.4 kn",
        "Manual top speed 295 m/s · Airframe integrity 80 · Starting air-to-air missiles 4 · Fighter berths 7 · Starts with the mixed fit. A pilot can take the aircraft after launch, then recover it aboard the carrier. · Launch from Mara"
      ],
      [
        "Mara deck helicopter",
        "Carrier-based anti-submarine helicopter",
        "—",
        "145 kn",
        "Cruise 125 kn · Airframe integrity 80 · Helicopter berths 1 · The dedicated helicopter slot begins with the anti-submarine fit. The carrier planner handles its assignment and return. · Launch from Mara"
      ],
      [
        "Kodiak deck fighter",
        "Carrier-based Wolverine",
        "—",
        "573.4 kn",
        "Manual top speed 295 m/s · Airframe integrity 80 · Starting air-to-air missiles 4 · Fighter berths 7 · Starts with the mixed fit. A pilot can take the aircraft after launch, then recover it aboard the carrier. · Launch from Kodiak"
      ],
      [
        "Kodiak deck helicopter",
        "Carrier-based anti-submarine helicopter",
        "—",
        "145 kn",
        "Cruise 125 kn · Airframe integrity 80 · Helicopter berths 1 · The dedicated helicopter slot begins with the anti-submarine fit. The carrier planner handles its assignment and return. · Launch from Kodiak"
      ],
      [
        "Weasel Mongoose",
        "Shipborne anti-submarine helicopter",
        "—",
        "145 kn",
        "Cruise 125 kn · Reverse 35 kn · Uses sonobuoys and torpedoes. · Embarked on Weasel"
      ],
      [
        "Badger Mongoose",
        "Shipborne anti-submarine helicopter",
        "—",
        "145 kn",
        "Cruise 125 kn · Reverse 35 kn · Airframe integrity 65 · Uses sonobuoys and torpedoes. · Embarked on Badger"
      ],
      [
        "Ferret Sable",
        "Russian shipborne helicopter",
        "—",
        "146 kn",
        "Cruise 124 kn · Reverse 35 kn · Airframe integrity 65 · Operates from the Marten and Ferret for anti-submarine missions. · Embarked on Ferret"
      ],
      [
        "Marten Sable",
        "Russian shipborne helicopter",
        "—",
        "146 kn",
        "Cruise 124 kn · Reverse 35 kn · Airframe integrity 65 · Operates from the Marten and Ferret for anti-submarine missions. · Embarked on Marten"
      ]
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

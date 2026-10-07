/* Safe confetti wrapper: never breaks the app if the library failed to load */
function fireConfetti(opts) {
    try {
        if (typeof confetti === 'function') confetti(opts);
        else console.warn('canvas-confetti did not load (CDN blocked or offline).');
    } catch (e) { console.warn('Confetti error:', e); }
}

/* ==============================================================
   MAIN TRACKER LOGIC
============================================================== */
const TMDB_API_KEY = "768707eae09a474cb47d2dd0de6d559f"; 

let showNonCanon = false;

// Data mapping: c = Chronological order, pc = Post credit scenes, dd = Doomsday Prep
// Ordered by priority: Main MCU -> Connected Sagas -> Televison -> Standalones/One-Shots at the bottom
const db = [
    { category: "The Infinity Saga - Phase 1", color: "#f1c40f", excludeProgress: false, items: [
        {id: 875, title: "Iron Man (2008)", r: 126, c: 3, pc: 1}, 
        {id: 544, title: "The Incredible Hulk (2008)", r: 112, c: 5, pc: 1}, 
        {id: 678, title: "Iron Man 2 (2010)", r: 124, c: 4, pc: 1}, 
        {id: 935, title: "Thor (2011)", r: 114, c: 6, pc: 1}, 
        {id: 784, title: "Captain America: The First Avenger (2011)", r: 124, c: 1, pc: 1, dd: true}, 
        {id: 579, title: "The Avengers (2012)", r: 143, c: 7, pc: 2, dd: true}
    ] },
    { category: "The Infinity Saga - Phase 2", color: "#e67e22", excludeProgress: false, items: [
        {id: 264, title: "Iron Man 3 (2013)", r: 130, c: 8, pc: 1}, 
        {id: 529, title: "Thor: The Dark World (2013)", r: 112, c: 9, pc: 2}, 
        {id: 744, title: "Captain America: The Winter Soldier (2014)", r: 136, c: 10, pc: 2}, 
        {id: 487, title: "Guardians of the Galaxy (2014)", r: 121, c: 11, pc: 2}, 
        {id: 956, title: "Avengers: Age of Ultron (2015)", r: 141, c: 12, pc: 2}, 
        {id: 766, title: "Ant-Man (2015)", r: 117, c: 13, pc: 2}
    ] },
    { category: "The Infinity Saga - Phase 3", color: "#e74c3c", excludeProgress: false, items: [
        {id: 748, title: "Captain America: Civil War (2016)", r: 147, c: 14, pc: 2}, 
        {id: 869, title: "Doctor Strange (2016)", r: 115, c: 17, pc: 2}, 
        {id: 896, title: "Guardians of the Galaxy Vol. 2 (2017)", r: 136, c: 11.5, pc: 5}, 
        {id: 536, title: "Spider-Man: Homecoming (2017)", r: 133, c: 16, pc: 2}, 
        {id: 118, title: "Thor: Ragnarok (2017)", r: 130, c: 18, pc: 2}, 
        {id: 333, title: "Black Panther (2018)", r: 134, c: 15, pc: 2}, 
        {id: 965, title: "Avengers: Infinity War (2018)", r: 149, c: 19, pc: 1, dd: true}, 
        {id: 852, title: "Ant-Man and the Wasp (2018)", r: 118, c: 20, pc: 2}, 
        {id: 726, title: "Captain Marvel (2019)", r: 123, c: 2, pc: 2}, 
        {id: 949, title: "Avengers: Endgame (2019)", r: 181, c: 21, pc: 0, dd: true}, 
        {id: 313, title: "Spider-Man: Far From Home (2019)", r: 129, c: 22, pc: 2}
    ] },
    { category: "The Multiverse Saga - Phase 4", color: "#9b59b6", excludeProgress: false, items: [
        {id: 212, title: "WandaVision", episodes: 9, r: 350, c: 23, pc: 2}, 
        {id: 588, title: "The Falcon and the Winter Soldier", episodes: 6, r: 270, c: 24, pc: 1}, 
        {id: 966, title: "Loki - Season 1", episodes: 6, r: 280, c: 21.5, pc: 1, dd: true}, 
        {id: 595, title: "Black Widow (2021)", r: 134, c: 14.5, pc: 1}, 
        {id: 460, title: "What If...? - Season 1", episodes: 9, r: 300, c: 21.6, pc: 1}, 
        {id: 255, title: "Shang-Chi and the Legend of the Ten Rings (2021)", r: 132, c: 25, pc: 2, dd: true}, 
        {id: 140, title: "Eternals (2021)", r: 156, c: 26, pc: 2}, 
        {id: 326, title: "Hawkeye", episodes: 6, r: 270, c: 29, pc: 1}, 
        {id: 655, title: "Spider-Man: No Way Home (2021)", r: 148, c: 27, pc: 2, dd: true}, 
        {id: 447, title: "Moon Knight", episodes: 6, r: 280, c: 30, pc: 1}, 
        {id: 155, title: "Doctor Strange in the Multiverse of Madness (2022)", r: 126, c: 28, pc: 2, dd: true}, 
        {id: 564, title: "Ms. Marvel", episodes: 6, r: 280, c: 31, pc: 1}, 
        {id: 632, title: "Thor: Love and Thunder (2022)", r: 119, c: 32, pc: 2}, 
        {id: 952, title: "I Am Groot - Season 1", episodes: 5, r: 20, c: 11.6}, 
        {id: 947, title: "She-Hulk: Attorney at Law", episodes: 9, r: 310, c: 33, pc: 1}, 
        {id: 603, title: "Werewolf by Night (2022)", r: 53, c: 34}, 
        {id: 415, title: "Black Panther: Wakanda Forever (2022)", r: 161, c: 35, pc: 1, dd: true}, 
        {id: 895, title: "The Guardians of the Galaxy Holiday Special (2022)", r: 42, c: 36, pc: 1}
    ] },
    { category: "The Multiverse Saga - Phase 5", color: "#8e44ad", excludeProgress: false, items: [
        {id: 514, title: "Ant-Man and the Wasp: Quantumania (2023)", r: 125, c: 37, pc: 2}, 
        {id: 781, title: "Guardians of the Galaxy Vol. 3 (2023)", r: 150, c: 38, pc: 2}, 
        {id: 314, title: "Secret Invasion", episodes: 6, r: 220, c: 39}, 
        {id: 546, title: "Loki - Season 2", episodes: 6, r: 280, c: 39.1, dd: true}, 
        {id: 878, title: "The Marvels (2023)", r: 105, c: 40, pc: 1}, 
        {id: 812, title: "What If...? - Season 2", episodes: 9, r: 300, c: 41}, 
        {id: 958, title: "Echo", episodes: 5, r: 220, c: 42}, 
        {id: 702, title: "Deadpool & Wolverine (2024)", r: 127, c: 43, pc: 1, dd: true}, 
        {id: 569, title: "Agatha All Along", episodes: 9, r: 350, c: 44}, 
        {id: 866, title: "What If...? - Season 3", episodes: 8, r: 300, c: 45}, 
        {id: 689, title: "Your Friendly Neighborhood Spider-Man", episodes: 10, r: 300, c: 46}, 
        {id: 519, title: "Captain America: Brave New World (2025)", r: 135, c: 47, dd: true}, 
        {id: 783, title: "Daredevil: Born Again", episodes: 9, r: 400, c: 48}, 
        {id: 684, title: "Thunderbolts* (2025)", r: 130, c: 49, dd: true}, 
        {id: 565, title: "Ironheart", episodes: 6, r: 300, c: 50}
    ] },
    { category: "The Multiverse Saga - Phase 6", color: "#2ecc71", excludeProgress: false, items: [
        {id: 945, title: "The Fantastic Four: First Steps (2025)", r: 130, c: 51, dd: true}, 
        {id: 559, title: "Eyes of Wakanda (2025)", episodes: 4, r: 200, c: 51.1},
        {id: 172, title: "Marvel Zombies (2025)", episodes: 4, r: 200, c: 51.2},
        {id: 357, title: "Wonder Man (2026)", episodes: 10, r: 300, c: 51.3},
        {id: 774, title: "Daredevil: Born Again - Season 2", episodes: 9, r: 400, c: 51.31},
        {id: 586, title: "The Punisher: One Last Kill (2026)", r: 50, c: 51.32},
        {id: 238, title: "Your Friendly Neighborhood Spider-Man - Season 2", episodes: 10, r: 300, c: 51.33},
        {id: 161, title: "Spider-Man: Brand New Day (2026)", r: 135, c: 51.34},
        {id: 804, title: "Avengers: Endgame Encore (2026)", r: 185, c: 51.35, pc: 4, dd: true, upcoming: true},
        {id: 803, title: "VisionQuest (2026)", episodes: 6, r: 300, c: 51.4, upcoming: true},
        {id: 213, title: "Avengers: Doomsday (2026)", r: 150, c: 52, upcoming: true}, 
        {id: 312, title: "Daredevil: Born Again - Season 3", episodes: 9, r: 400, c: 52.1, upcoming: true},
        {id: 942, title: "Avengers: Secret Wars (2027)", r: 160, c: 53, upcoming: true}
    ] },
    { category: "Marvel One-Shots", color: "#3498db", excludeProgress: false, items: [
        {id: 203, title: "The Consultant (2011)", r: 4, c: 4.1}, 
        {id: 205, title: "A Funny Thing Happened on the Way to Thor's Hammer (2011)", r: 4, c: 4.2}, 
        {id: 420, title: "Item 47 (2012)", r: 12, c: 7.1}, 
        {id: 211, title: "Agent Carter (2013)", r: 15, c: 1.1}, 
        {id: 574, title: "All Hail the King (2014)", r: 14, c: 8.1}
    ] },
    { category: "The Defenders Saga", color: "#c0392b", excludeProgress: false, items: [
        {id: 142, title: "Daredevil - Season 1", episodes: 13, r: 700, c: 60}, 
        {id: 473, title: "Jessica Jones - Season 1", episodes: 13, r: 650, c: 61}, 
        {id: 793, title: "Daredevil - Season 2", episodes: 13, r: 700, c: 62}, 
        {id: 401, title: "Luke Cage - Season 1", episodes: 13, r: 650, c: 63}, 
        {id: 927, title: "Iron Fist - Season 1", episodes: 13, r: 650, c: 64}, 
        {id: 874, title: "The Defenders", episodes: 8, r: 400, c: 65}, 
        {id: 162, title: "The Punisher - Season 1", episodes: 13, r: 650, c: 66}, 
        {id: 889, title: "Jessica Jones - Season 2", episodes: 13, r: 650, c: 67}, 
        {id: 542, title: "Luke Cage - Season 2", episodes: 13, r: 650, c: 68}, 
        {id: 165, title: "Iron Fist - Season 2", episodes: 10, r: 500, c: 69}, 
        {id: 266, title: "Daredevil - Season 3", episodes: 13, r: 700, c: 70}, 
        {id: 309, title: "The Punisher - Season 2", episodes: 13, r: 650, c: 71}, 
        {id: 599, title: "Jessica Jones - Season 3", episodes: 13, r: 650, c: 72}
    ] },
    { category: "Fox's X-Men Universe", color: "#d35400", excludeProgress: false, items: [
        {id: 235, title: "X-Men (2000)", r: 104, c: 100, dd: true}, 
        {id: 463, title: "X2: X-Men United (2003)", r: 134, c: 101, dd: true}, 
        {id: 981, title: "X-Men: The Last Stand (2006)", r: 104, c: 102}, 
        {id: 823, title: "X-Men Origins: Wolverine (2009)", r: 107, c: 103}, 
        {id: 922, title: "X-Men: First Class (2011)", r: 132, c: 104}, 
        {id: 959, title: "The Wolverine (2013)", r: 126, c: 105}, 
        {id: 133, title: "X-Men: Days of Future Past (2014)", r: 132, c: 106}, 
        {id: 128, title: "Deadpool (2016)", r: 108, c: 107}, 
        {id: 508, title: "X-Men: Apocalypse (2016)", r: 144, c: 108}, 
        {id: 433, title: "Logan (2017)", r: 137, c: 109}, 
        {id: 854, title: "Legion", episodes: 27, r: 1350, c: 109.1}, 
        {id: 299, title: "The Gifted", episodes: 29, r: 1250, c: 109.2}, 
        {id: 189, title: "Deadpool 2 (2018)", r: 119, c: 110}, 
        {id: 881, title: "X-Men: Dark Phoenix (2019)", r: 114, c: 111}, 
        {id: 157, title: "The New Mutants (2020)", r: 94, c: 112}
    ] },
    { category: "Fox's Fantastic Four", color: "#2980b9", excludeProgress: false, items: [
        {id: 776, title: "Fantastic Four (1994)", r: 90, c: 120}, 
        {id: 483, title: "Fantastic Four (2005)", r: 106, c: 121}, 
        {id: 749, title: "Fantastic Four: Rise of the Silver Surfer (2007)", r: 92, c: 122}, 
        {id: 548, title: "Fantastic Four (2015)", r: 100, c: 123}
    ] },
    { category: "Sony's Spider-Man Legacy", color: "#ff4757", excludeProgress: false, items: [
        {id: 625, title: "Spider-Man (2002)", r: 121, c: 130}, 
        {id: 176, title: "Spider-Man 2 (2004)", r: 127, c: 131}, 
        {id: 256, title: "Spider-Man 3 (2007)", r: 139, c: 132}, 
        {id: 331, title: "The Amazing Spider-Man (2012)", r: 136, c: 133}, 
        {id: 836, title: "The Amazing Spider-Man 2 (2014)", r: 142, c: 134}, 
        {id: 436, title: "Venom (2018)", r: 112, c: 135}, 
        {id: 671, title: "Spider-Man: Into the Spider-Verse (2018)", r: 117, c: 136}, 
        {id: 296, title: "Venom: Let There Be Carnage (2021)", r: 97, c: 137}, 
        {id: 719, title: "Morbius (2022)", r: 104, c: 138}, 
        {id: 120, title: "Spider-Man: Across the Spider-Verse (2023)", r: 140, c: 139}, 
        {id: 677, title: "Madame Web (2024)", r: 116, c: 140}, 
        {id: 185, title: "Kraven the Hunter (2024)", r: 120, c: 141}, 
        {id: 745, title: "Venom: The Last Dance (2024)", r: 120, c: 142}, 
        {id: 365, title: "Spider-Noir", episodes: 8, r: 400, c: 143}
    ] },
    { category: "Legacy Marvel Television", color: "#1abc9c", excludeProgress: false, items: [
        {id: 233, title: "Agents of S.H.I.E.L.D. - Season 1", episodes: 22, r: 950, c: 80}, 
        {id: 151, title: "Agents of S.H.I.E.L.D. - Season 2", episodes: 22, r: 950, c: 81}, 
        {id: 994, title: "Agents of S.H.I.E.L.D. - Season 3", episodes: 22, r: 950, c: 82}, 
        {id: 408, title: "Agents of S.H.I.E.L.D. - Season 4", episodes: 22, r: 950, c: 83}, 
        {id: 661, title: "Agents of S.H.I.E.L.D. - Season 5", episodes: 22, r: 950, c: 84}, 
        {id: 593, title: "Agents of S.H.I.E.L.D. - Season 6", episodes: 13, r: 550, c: 85}, 
        {id: 446, title: "Agents of S.H.I.E.L.D. - Season 7", episodes: 13, r: 550, c: 86}, 
        {id: 611, title: "Agent Carter - Season 1", episodes: 8, r: 350, c: 87}, 
        {id: 512, title: "Agent Carter - Season 2", episodes: 10, r: 420, c: 88}, 
        {id: 676, title: "Inhumans (2017)", episodes: 8, r: 350, c: 89}, 
        {id: 321, title: "Runaways - Season 1", episodes: 10, r: 450, c: 90}, 
        {id: 650, title: "Runaways - Season 2", episodes: 13, r: 600, c: 91}, 
        {id: 933, title: "Runaways - Season 3", episodes: 10, r: 450, c: 92}, 
        {id: 338, title: "Cloak & Dagger - Season 1", episodes: 10, r: 450, c: 93}, 
        {id: 571, title: "Cloak & Dagger - Season 2", episodes: 10, r: 450, c: 94}, 
        {id: 251, title: "Helstrom", episodes: 10, r: 450, c: 95}
    ] },
    { category: "Multiverse Legacy & Standalones", color: "#95a5a6", excludeProgress: true, items: [
        {id: 692, title: "Supaidāman (Japanese Spider-Man)", episodes: 41, r: 1000, c: 147.1}, 
        {id: 169, title: "Howard the Duck (1986)", r: 110, c: 148}, 
        {id: 270, title: "The Punisher (1989)", r: 89, c: 149}, 
        {id: 761, title: "Captain America (1990)", r: 97, c: 149.1}, 
        {id: 637, title: "Blade (1998)", r: 120, c: 150}, 
        {id: 648, title: "Blade II (2002)", r: 117, c: 151}, 
        {id: 894, title: "Daredevil (2003)", r: 103, c: 152}, 
        {id: 334, title: "Hulk (2003)", r: 138, c: 153}, 
        {id: 851, title: "Blade: Trinity (2004)", r: 113, c: 154}, 
        {id: 457, title: "The Punisher (2004)", r: 124, c: 155}, 
        {id: 747, title: "Elektra (2005)", r: 97, c: 156}, 
        {id: 631, title: "Man-Thing (2005)", r: 97, c: 156.1}, 
        {id: 498, title: "Ghost Rider (2007)", r: 114, c: 157}, 
        {id: 285, title: "Punisher: War Zone (2008)", r: 103, c: 158}, 
        {id: 254, title: "Ghost Rider: Spirit of Vengeance (2011)", r: 95, c: 159}
    ] },
    { category: "Marvel Animated Legacy", color: "#f39c12", excludeProgress: true, items: [
        {id: 626, title: "X-Men: The Animated Series", episodes: 76, r: 1600, c: 160}, 
        {id: 252, title: "Spider-Man: The Animated Series (1994)", episodes: 65, r: 1350, c: 161}, 
        {id: 977, title: "X-Men: Evolution", episodes: 52, r: 1100, c: 162}, 
        {id: 501, title: "Ultimate Avengers: The Movie (2006)", r: 72, c: 163}, 
        {id: 127, title: "Ultimate Avengers 2 (2006)", r: 73, c: 164}, 
        {id: 277, title: "The Invincible Iron Man (2007)", r: 83, c: 165}, 
        {id: 106, title: "Doctor Strange: The Sorcerer Supreme (2007)", r: 76, c: 166}, 
        {id: 549, title: "The Spectacular Spider-Man", episodes: 26, r: 550, c: 167}, 
        {id: 405, title: "Next Avengers: Heroes of Tomorrow (2008)", r: 78, c: 168}, 
        {id: 751, title: "Wolverine and the X-Men", episodes: 26, r: 550, c: 169}, 
        {id: 342, title: "Hulk Vs. (2009)", r: 82, c: 170}, 
        {id: 822, title: "Planet Hulk (2010)", r: 81, c: 171}, 
        {id: 662, title: "The Avengers: Earth's Mightiest Heroes", episodes: 52, r: 1100, c: 172}, 
        {id: 358, title: "Thor: Tales of Asgard (2011)", r: 77, c: 173}, 
        {id: 901, title: "X-Men '97 - Season 1", episodes: 10, r: 350, c: 174}, 
        {id: 960, title: "X-Men '97 - Season 2", episodes: 10, r: 350, c: 174.1}, 
        {id: 323, title: "Marvel Anime: Iron Man", episodes: 12, r: 280, c: 175}, 
        {id: 282, title: "Marvel Anime: Wolverine", episodes: 12, r: 280, c: 176}, 
        {id: 221, title: "Marvel Anime: X-Men", episodes: 12, r: 280, c: 177}, 
        {id: 861, title: "Marvel Anime: Blade", episodes: 12, r: 280, c: 178}, 
        {id: 465, title: "Marvel Disk Wars: The Avengers", episodes: 51, r: 1120, c: 179}, 
        {id: 121, title: "Marvel Future Avengers", episodes: 39, r: 850, c: 180}, 
        {id: 995, title: "Phineas and Ferb: Mission Marvel (2013)", r: 44, c: 181}, 
        {id: 455, title: "LEGO Marvel Super Heroes: Maximum Overload (2013)", r: 22, c: 182}, 
        {id: 602, title: "LEGO Marvel Super Heroes: Avengers Reassembled! (2015)", r: 22, c: 183}, 
        {id: 236, title: "LEGO Marvel Spider-Man: Vexed by Venom (2019)", r: 22, c: 184}, 
        {id: 740, title: "The Good, the Bart, and the Loki (2021)", r: 6, c: 184.1}, 
        {id: 204, title: "LEGO Marvel Avengers: Code Red (2023)", r: 44, c: 185}
    ] }
];

let userData = JSON.parse(localStorage.getItem('marvelTrackerV6')) || {};
let totalMainMCUItems = 0;
let currentFilter = 'all';
let tmdbCache = {}; 
let isChronoMode = false;
let isDevOffline = false;
const allDbItems = db.flatMap(s => s.items.map(i => ({...i, sectionColor: s.color, excludeProgress: s.excludeProgress, category: s.category})));

const CATEGORY_RENAMES = { "Fox's Fantastic Four (Legacy)": "Fox's Fantastic Four" };

/* Moves old title-keyed progress to the new 3-digit item IDs (safe to run repeatedly) */
function migrateUserData() {
    let changed = false;
    allDbItems.forEach(item => {
        const old = userData[item.title];
        if (old !== undefined) {
            if (userData[item.id] === undefined) userData[item.id] = old;
            delete userData[item.title];
            changed = true;
        }
    });
    // Carry the "phase completed" flag over when a category gets renamed
    Object.entries(CATEGORY_RENAMES).forEach(([oldName, newName]) => {
        const oldKey = `${oldName}_completed`, newKey = `${newName}_completed`;
        if (userData[oldKey] !== undefined) {
            if (userData[newKey] === undefined) userData[newKey] = userData[oldKey];
            delete userData[oldKey];
            changed = true;
        }
    });
    if (changed) localStorage.setItem('marvelTrackerV6', JSON.stringify(userData));
}

function initializeData() {
    migrateUserData();
    totalMainMCUItems = 0;
    db.forEach(sec => {
        sec.items.forEach(item => {
            if (!sec.excludeProgress && !item.upcoming) totalMainMCUItems++;
            if (!userData[item.id]) userData[item.id] = { watched: false, rating: 0, note: "" };
            if (userData[item.id].inProgress === undefined) userData[item.id].inProgress = false;
            if (item.episodes && !userData[item.id].watchedEps) userData[item.id].watchedEps = new Array(item.episodes).fill(userData[item.id].watched ? true : false);
            if(userData[item.id].note === undefined) userData[item.id].note = "";
        });
    });
}

function save() { localStorage.setItem('marvelTrackerV6', JSON.stringify(userData)); updateDashboards(); }

function updateDashboards() {
    updateProgress(); updateLeaderboard(); updateUpNext(); updateNerdStats();
    if(!isChronoMode) updateMiniProgressBars();
    applyFilterToDOM();
}

function toggleNonCanon() {
    showNonCanon = !showNonCanon;
    const btn = document.getElementById('btn-toggle-noncanon');
    if (btn) {
        btn.innerText = `🌌 Non-Canon & Animation: ${showNonCanon ? 'ON' : 'OFF'}`;
        btn.classList.toggle('active', showNonCanon);
    }
    render();
}

// Scroll To Top Logic
window.addEventListener('scroll', () => {
    const btn = document.getElementById('scrollTopBtn');
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        btn.style.display = "block";
    } else {
        btn.style.display = "none";
    }
});

function togglePhase(headerEl) {
    const content = headerEl.nextElementSibling;
    const toggleIcon = headerEl.querySelector('.phase-toggle');
    if (content.style.display === 'none') {
        content.style.display = 'block';
        toggleIcon.innerText = '▼';
    } else {
        content.style.display = 'none';
        toggleIcon.innerText = '▶';
    }
}

function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userData));
    const a = document.createElement('a'); a.href = dataStr; a.download = "marvel_watchlist_backup.json";
    document.body.appendChild(a); a.click(); a.remove();
}

function importData(event) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try { userData = JSON.parse(e.target.result); initializeData(); save(); render(); alert("Watchlist imported!"); } 
        catch (err) { alert("Error importing data."); }
    };
    reader.readAsText(file); event.target.value = ''; 
}

function updateProgress() {
    let mainWatched = 0;
    let watchedPhases = [];
    
    db.forEach(sec => {
        if (sec.excludeProgress) return;
        let validItems = sec.items.filter(i => !i.upcoming);
        let watchedCount = validItems.filter(i => userData[i.id].watched).length;
        if (watchedCount > 0) {
            watchedPhases.push({ color: sec.color, count: watchedCount });
            mainWatched += watchedCount;
        }
    });
    
    let totalPct = totalMainMCUItems > 0 ? (mainWatched / totalMainMCUItems) * 100 : 0;
    let fillBg = 'transparent';
    
    // Build the dynamic, perfectly smooth gradient out of strictly the colors that are currently checked
    if (watchedPhases.length === 1) {
        fillBg = watchedPhases[0].color;
    } else if (watchedPhases.length > 1) {
        let gradientStops = [];
        let runningCount = 0;
        
        watchedPhases.forEach((phase) => {
            let sharePct = (phase.count / mainWatched) * 100;
            let startPct = (runningCount / mainWatched) * 100;
            let midPct = startPct + (sharePct / 2);
            gradientStops.push(`${phase.color} ${midPct}%`);
            runningCount += phase.count;
        });
        
        let firstColor = watchedPhases[0].color;
        let lastColor = watchedPhases[watchedPhases.length - 1].color;
        fillBg = `linear-gradient(to right, ${firstColor} 0%, ${gradientStops.join(', ')}, ${lastColor} 100%)`;
    }
    
    const fillEl = document.getElementById('main-progress-fill');
    if (fillEl) {
        fillEl.style.width = totalPct + '%';
        fillEl.style.background = fillBg;
    }
    
    const pctText = document.getElementById('progress-percent');
    if (pctText) pctText.innerText = (Math.round(totalPct) || 0) + '%';
}

function updateMiniProgressBars() {
    db.forEach((sec, idx) => {
        let validItems = sec.items.filter(i => !i.upcoming);
        let watched = validItems.filter(item => userData[item.id].watched).length;
        let pct = validItems.length > 0 ? Math.round((watched / validItems.length) * 100) : 0;
        
        let wrapperEl = document.getElementById(`mini-prog-wrapper-${idx}`);
        let fillEl = document.getElementById(`mini-prog-${idx}`);
        let textEl = document.getElementById(`mini-pct-${idx}`);
        let phaseCheck = document.getElementById(`phase-check-${idx}`);
        
        if (wrapperEl) { wrapperEl.removeAttribute('title'); wrapperEl.dataset.tip = `${watched} / ${validItems.length} watched · ${validItems.length - watched} left`; }
        if (fillEl) fillEl.style.width = pct + '%';
        if (textEl) textEl.innerText = pct + '%';
        if (phaseCheck) phaseCheck.checked = (watched === validItems.length && validItems.length > 0);

        if (pct === 100 && !userData[`${sec.category}_completed`] && !sec.excludeProgress && validItems.length > 0) {
            fireConfetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: [sec.color, '#ffffff', '#e62429'], zIndex: 9999 });
            userData[`${sec.category}_completed`] = true; localStorage.setItem('marvelTrackerV6', JSON.stringify(userData));
        } else if (pct < 100 && userData[`${sec.category}_completed`]) {
            userData[`${sec.category}_completed`] = false; localStorage.setItem('marvelTrackerV6', JSON.stringify(userData));
        }
    });
}

function updateLeaderboard() {
    const rated = allDbItems.filter(i => userData[i.id] && userData[i.id].rating > 0)
        .sort((a, b) => userData[b.id].rating - userData[a.id].rating).slice(0, 10);
    const lb = document.getElementById('leaderboard');
    lb.innerHTML = rated.length === 0 ? '<li>No ratings yet!</li>' : '';
    rated.forEach((item, idx) => lb.innerHTML += `<li><span>${idx+1}. ${item.title.replace(/\s\(\d{4}\)/, '')}</span> <span class="lb-score">${userData[item.id].rating}/10</span></li>`);
}

/* Categories hidden while "Non-Canon & Animation" is OFF (same ones render() skips) */
const NON_CANON_CATEGORIES = ["Multiverse Legacy & Standalones", "Marvel Animated Legacy"];

function getNextUnwatched() {
    const searchList = isChronoMode ? [...allDbItems].sort((a, b) => (a.c || 999) - (b.c || 999)) : allDbItems;
    return searchList.find(item =>
        !userData[item.id].watched && !item.excludeProgress && !item.upcoming &&
        (showNonCanon || !NON_CANON_CATEGORIES.includes(item.category))
    ) || null;
}

function updateUpNext() {
    const next = getNextUnwatched();
    document.getElementById('up-next').innerText = next ? next.title.replace(/\s\(\d{4}\)/, '') : "All caught up!";

    const jumpBtn = document.getElementById('btn-jump');
    if (jumpBtn) {
        jumpBtn.innerText = next ? '\u2b07 Jump to it' : '\u2b07 Nothing to jump to';
        jumpBtn.classList.toggle('done', !next);
    }
}

/* Scrolls to the next unwatched title, opening its phase / clearing filters if they hide it */
function jumpToNext() {
    const item = getNextUnwatched();
    if (!item) return;
    const wrapper = document.querySelector(`.item-wrapper[data-id="${item.id}"]`);
    if (!wrapper) return;

    if (wrapper.style.display === 'none') {      // hidden by a filter or the search box
        document.getElementById('search-input').value = '';
        setFilter('all');
    }
    const content = wrapper.closest('.section-content');
    if (content && content.style.display === 'none') togglePhase(content.previousElementSibling);

    wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    wrapper.classList.remove('jump-highlight');
    void wrapper.offsetWidth;                    // restart the animation if clicked again
    wrapper.classList.add('jump-highlight');
    setTimeout(() => wrapper.classList.remove('jump-highlight'), 2600);
}

function updateNerdStats() {
    let watchedCount = 0; let totalMinutes = 0; let totalScore = 0; let countScore = 0; let phaseStats = {};
    db.forEach(sec => {
        phaseStats[sec.category] = { total: 0, count: 0 };
        sec.items.forEach(item => {
            if (userData[item.id].watched) watchedCount++;
            let runtimeToUse = userData[item.id].exactRuntime || item.r;
            if (item.episodes) totalMinutes += (runtimeToUse / item.episodes) * userData[item.id].watchedEps.filter(Boolean).length;
            else if (userData[item.id].watched) totalMinutes += runtimeToUse;
            if (userData[item.id].rating > 0) {
                totalScore += userData[item.id].rating; countScore++;
                phaseStats[sec.category].total += userData[item.id].rating; phaseStats[sec.category].count++;
            }
        });
    });
    
    document.getElementById('stat-count').innerText = watchedCount;
    document.getElementById('stat-time').innerText = `${Math.floor(totalMinutes/1440)}d ${Math.floor((totalMinutes%1440)/60)}h ${Math.round(totalMinutes%60)}m`;
    document.getElementById('stat-avg').innerText = countScore > 0 ? (totalScore / countScore).toFixed(1) + '/10' : '0/10';
    let bestPhase = 'None', bestAvg = 0;
    for (let p in phaseStats) {
        if (phaseStats[p].count > 0 && (phaseStats[p].total / phaseStats[p].count) > bestAvg) { bestAvg = phaseStats[p].total / phaseStats[p].count; bestPhase = p; }
    }
    document.getElementById('stat-phase').innerText = bestPhase.replace("The Infinity Saga - ", "").replace("The Multiverse Saga - ", "");
}

function setFilter(type) {
    currentFilter = type;
    document.querySelectorAll('.filter-btn:not(.btn-random):not(.dev-btn):not(.btn-noncanon)').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-filter-' + type).classList.add('active');
    
    // Toggle the immersive green Doomsday screen mode
    document.body.classList.toggle('doomsday-active', type === 'doomsday');
    
    applyFilterToDOM();
}

function applyFilterToDOM() {
    const query = document.getElementById('search-input').value.toLowerCase();
    document.querySelectorAll('.item-wrapper').forEach(wrapper => {
        const titleText = wrapper.getAttribute('data-full-title');
        const isWatched = wrapper.querySelector('.main-checkbox').checked;
        const inProgress = userData[wrapper.getAttribute('data-id')]?.inProgress;
        const dbItem = allDbItems.find(i => i.title === titleText);
        
        let show = true;
        if (currentFilter === 'watched' && !isWatched) show = false;
        if (currentFilter === 'unwatched' && isWatched) show = false;
        if (currentFilter === 'started' && (!inProgress || isWatched)) show = false;
        if (currentFilter === 'doomsday' && !dbItem?.dd) show = false;
        if (query !== '' && !titleText.toLowerCase().includes(query)) show = false;
        
        wrapper.style.display = show ? 'block' : 'none';
    });
    
    document.querySelectorAll('.section').forEach(sec => {
        const visibleItems = sec.querySelectorAll('.item-wrapper[style="display: block;"], .item-wrapper:not([style*="none"])');
        sec.style.display = visibleItems.length === 0 ? 'none' : 'block';
    });
}

function setMode(mode) {
    isChronoMode = (mode === 'chrono');
    document.getElementById('btn-release').classList.toggle('active', !isChronoMode);
    document.getElementById('btn-chrono').classList.toggle('active', isChronoMode);
    render();
}

function updateStarsDisplay(starBoxes, rating) {
    starBoxes.forEach((box, idx) => {
        const fill = box.querySelector('.star-fill');
        const fullVal = (idx + 1) * 2; const halfVal = fullVal - 1;
        if (rating >= fullVal) fill.style.width = '100%';
        else if (rating === halfVal) fill.style.width = '50%';
        else fill.style.width = '0%';
    });
}

function toggleEps(id) {
    const el = document.getElementById('eps-' + id);
    const expander = document.getElementById('exp-' + id);
    if (el.style.display === 'none') { el.style.display = 'grid'; expander.innerText = '▲'; } 
    else { el.style.display = 'none'; expander.innerText = '▼'; }
}

async function fetchPoster(title, imgElement) {
    if (isDevOffline) return;
    
    const yearMatch = title.match(/\((\d{4})\)/);
    const exactYear = yearMatch ? yearMatch[1] : '';
    let cleanTitle = title.replace(/\s\(\d{4}\)/, '').replace(/ - Season \d+/, '');
    
    let searchQuery = cleanTitle;
    if (searchQuery === "Avengers: Endgame Encore") {
        searchQuery = "Avengers: Endgame";
    }
    
    try {
        const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            let bestMatch = data.results[0];
            
            if (exactYear && searchQuery !== "Avengers: Endgame") {
                const yearMatchObj = data.results.find(r => 
                    (r.release_date && r.release_date.startsWith(exactYear)) || 
                    (r.first_air_date && r.first_air_date.startsWith(exactYear))
                );
                if (yearMatchObj) bestMatch = yearMatchObj;
            }
            
            tmdbCache[title] = bestMatch;
            if (bestMatch.poster_path) {
                imgElement.src = `https://image.tmdb.org/t/p/w200${bestMatch.poster_path}`;
                imgElement.style.display = 'block';
            }
        }
    } catch(e) { console.log("TMDB fetch error", e); }
}

/* ==============================================================
   SEND TO PHONE (your progress travels inside a link)
============================================================== */
const LIVE_URL = 'https://yyoaavv.github.io/Marvel-Tracker/';
const MAX_SYNC_BYTES = 3 * 1024 * 1024;   // safety cap for what a link may unpack to
let pendingSync = null;

function bytesToB64Url(bytes) {
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64UrlToBytes(str) {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64 + '='.repeat((4 - b64.length % 4) % 4));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
}

async function packProgress(obj) {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    if (typeof CompressionStream === 'function') {
        const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
        return 'd' + bytesToB64Url(new Uint8Array(await new Response(stream).arrayBuffer()));
    }
    return 'r' + bytesToB64Url(bytes);          // very old browsers: no compression
}

async function unpackProgress(token) {
    if (token.length > MAX_SYNC_BYTES) throw new Error('too-big');
    const mode = token[0];
    const bytes = b64UrlToBytes(token.slice(1));
    let text;
    if (mode === 'r') {
        text = new TextDecoder().decode(bytes);
    } else if (mode === 'd') {
        if (typeof DecompressionStream !== 'function') throw new Error('browser-too-old');
        const reader = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
        const chunks = []; let total = 0;
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            total += value.length;
            if (total > MAX_SYNC_BYTES) throw new Error('too-big');
            chunks.push(value);
        }
        text = new TextDecoder().decode(await new Blob(chunks).arrayBuffer());
    } else {
        throw new Error('bad-format');
    }
    const obj = JSON.parse(text);
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('bad-format');
    return obj;
}

function countWatched(data) {
    return Object.values(data).filter(v => v && typeof v === 'object' && v.watched === true).length;
}

async function openSendToPhone() {
    const modal = document.getElementById('send-modal');
    const box = document.getElementById('send-link');
    const note = document.getElementById('send-note');
    const shareBtn = document.getElementById('btn-share-link');
    shareBtn.style.display = (navigator.share ? '' : 'none');
    box.value = 'Preparing your link...';
    note.textContent = '';
    modal.style.display = 'flex';
    try {
        const token = await packProgress(userData);
        const base = location.protocol.startsWith('http') ? location.origin + location.pathname : LIVE_URL;
        const link = `${base}#sync=${token}`;
        box.value = link;
        note.textContent = link.length > 8000
            ? `This link is long (${link.length.toLocaleString()} characters). Some apps may cut it off. If it doesn't work on your phone, use Export / Import Backup instead.`
            : 'Anyone with this link can see your progress and notes, so only send it to yourself.';
    } catch (err) {
        box.value = '';
        note.textContent = 'Something went wrong while making the link. Try Export Backup File instead.';
    }
}

async function copySyncLink() {
    const box = document.getElementById('send-link');
    const btn = document.getElementById('btn-copy-link');
    if (!box.value.startsWith('http')) return;
    try { await navigator.clipboard.writeText(box.value); }
    catch (e) { box.select(); document.execCommand('copy'); }
    const old = btn.innerText;
    btn.innerText = '\u2705 Copied!';
    setTimeout(() => { btn.innerText = old; }, 1800);
}

async function shareSyncLink() {
    const box = document.getElementById('send-link');
    if (!box.value.startsWith('http')) return;
    try { await navigator.share({ title: 'Marvel Tracker progress', url: box.value }); } catch (e) { /* cancelled */ }
}

function showSyncModal(title, text, canLoad) {
    document.getElementById('sync-title').innerText = title;
    document.getElementById('sync-text').innerText = text;
    document.getElementById('btn-sync-load').style.display = canLoad ? '' : 'none';
    document.getElementById('btn-sync-cancel').innerText = canLoad ? 'Cancel' : 'Close';
    document.getElementById('sync-modal').style.display = 'flex';
}

/* Runs on page load: if the page was opened from a "send to phone" link, offer to load it */
async function checkIncomingSync() {
    const m = location.hash.match(/^#sync=([A-Za-z0-9_-]+)$/);
    if (!m) return;
    history.replaceState(null, '', location.pathname + location.search);   // so a refresh doesn't ask again
    try {
        pendingSync = await unpackProgress(m[1]);
        const incoming = countWatched(pendingSync);
        const current = countWatched(userData);
        showSyncModal('\ud83d\udce5 Load progress from link?',
            `This link has ${incoming} watched title${incoming === 1 ? '' : 's'}. This device currently has ${current}. Loading will replace the progress saved on this device.`, true);
    } catch (err) {
        pendingSync = null;
        const msg = err && err.message === 'browser-too-old'
            ? 'This browser is too old to open this link. Try updating it, or use Export / Import Backup.'
            : 'This link looks damaged or incomplete (some apps cut off long links). Try sending it again, or use Export / Import Backup.';
        showSyncModal('\u26a0\ufe0f Could not read link', msg, false);
    }
}

/* Also react if a link is pasted into a tab where the tracker is already open */
window.addEventListener('hashchange', checkIncomingSync);

function acceptIncomingSync() {
    if (!pendingSync) return;
    userData = pendingSync;
    pendingSync = null;
    initializeData(); save(); render();
    closeModal(null, 'sync-modal', true);
}

function cancelIncomingSync() {
    pendingSync = null;
    closeModal(null, 'sync-modal', true);
}

/* ==============================================================
   ADD TO HOME SCREEN (phone shortcut)
============================================================== */
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstallPrompt = e; });
window.addEventListener('appinstalled', () => { deferredInstallPrompt = null; setupInstallUI(); });

function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function setupInstallUI() {
    const btn = document.getElementById('btn-shortcut');
    if (btn && isStandalone()) btn.style.display = 'none';          // already running as an app
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
}

async function openShortcutHelp() {
    // Chrome / Edge / Android can install with one tap
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        try { await deferredInstallPrompt.userChoice; } catch (e) {}
        deferredInstallPrompt = null;
        return;
    }
    const ua = navigator.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);
    let steps, note = '';
    if (isIOS) {
        steps = ['Tap the <b>Share</b> button (the square with an arrow) in Safari.',
                 'Scroll down and tap <b>Add to Home Screen</b>.',
                 'Tap <b>Add</b>.'];
        note = 'Tip: on iPhone this works from Safari. If you opened the page in another app, open it in Safari first.';
    } else if (isAndroid) {
        steps = ['Tap the <b>\u22ee menu</b> in Chrome (top right).',
                 'Tap <b>Add to Home screen</b> (or <b>Install app</b>).',
                 'Tap <b>Add</b>.'];
    } else {
        steps = ['Open this page on your phone to add it there.',
                 'On this computer you can also click the <b>install icon</b> in the address bar, or open the <b>\u22ee menu</b> and choose <b>Cast, save, and share \u2192 Install page as app</b>.'];
    }
    document.getElementById('shortcut-body').innerHTML =
        `<ol>${steps.map(x => `<li>${x}</li>`).join('')}</ol>` + (note ? `<p class="sheet-note">${note}</p>` : '');
    document.getElementById('shortcut-modal').style.display = 'flex';
}

function closeModal(event, modalId, force = false) {
    if (force || event.target.id === modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = "none";
        if (modalId === 'info-modal') {
            document.getElementById('modal-text').innerHTML = 'Loading...';
            document.getElementById('modal-img').innerHTML = '';
        }
    }
}

/* ==============================================================
   WHERE TO WATCH (TMDB watch/providers, data by JustWatch)
============================================================== */
const REGION_KEY = 'marvelTrackerRegion';
const PROVIDER_GROUPS = [['flatrate', 'Stream'], ['free', 'Free'], ['ads', 'Free with ads'], ['rent', 'Rent'], ['buy', 'Buy']];

function escHtml(str) { return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function regionName(code) {
    try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code; } catch (e) { return code; }
}

function getPreferredRegion(available) {
    let saved = null;
    try { saved = localStorage.getItem(REGION_KEY); } catch (e) {}
    const langRegion = ((navigator.language || '').split('-')[1] || '').toUpperCase();
    return [saved, langRegion, 'US'].find(c => c && available.includes(c)) || available[0];
}

function setProviderRegion(code) {
    try { localStorage.setItem(REGION_KEY, code); } catch (e) {}
    renderProviders(code);
}

function renderProviders(forcedRegion) {
    const box = document.getElementById('providers-box');
    if (!box) return;
    const data = window.currentProviders || {};
    const regions = Object.keys(data)
        .filter(r => PROVIDER_GROUPS.some(([k]) => data[r][k] && data[r][k].length))
        .sort((a, b) => regionName(a).localeCompare(regionName(b)));

    if (regions.length === 0) {
        box.innerHTML = '<div class="providers"><strong>Where to watch:</strong> <span class="prov-none">No streaming info available for this title yet.</span></div>';
        return;
    }

    const region = (forcedRegion && regions.includes(forcedRegion)) ? forcedRegion : getPreferredRegion(regions);
    const options = regions.map(r => `<option value="${r}" ${r === region ? 'selected' : ''}>${escHtml(regionName(r))}</option>`).join('');

    const groups = PROVIDER_GROUPS.map(([key, label]) => ({ key, label, list: data[region][key] || [] })).filter(g => g.list.length);

    let rows = '';
    groups.forEach(g => {
        const chips = g.list.map(p => p.logo_path
            ? `<img class="prov-logo" src="https://image.tmdb.org/t/p/w92${p.logo_path}" alt="${escHtml(p.provider_name)}" title="${escHtml(p.provider_name)}">`
            : `<span class="prov-chip">${escHtml(p.provider_name)}</span>`).join('');
        rows += `<div class="prov-row"><span class="prov-label">${g.label}</span><div class="prov-logos">${chips}</div></div>`;
    });
    if (!rows) rows = '<span class="prov-none">Not available in this region.</span>';

    const link = data[region].link ? `<a class="prov-link" href="${escHtml(data[region].link)}" target="_blank" rel="noopener noreferrer">All options &rarr;</a>` : '';
    box.innerHTML = `
        <div class="providers">
            <div class="prov-head">
                <strong>Where to watch</strong>
                <select class="prov-select" onchange="setProviderRegion(this.value)" aria-label="Country">${options}</select>
            </div>
            ${rows}
            <div class="prov-foot">${link}<span class="prov-credit">Streaming data by JustWatch</span></div>
        </div>`;
}

async function openInfo(title) {
    const modal = document.getElementById('info-modal');
    const imgWrapper = document.getElementById('modal-img');
    const textWrapper = document.getElementById('modal-text');
    const modalContent = document.getElementById('modal-content');
    
    let dbItem = allDbItems.find(i => i.title === title);
    modalContent.style.borderColor = dbItem ? dbItem.sectionColor : 'var(--accent)';
    modal.style.display = "block";
    
    if (isDevOffline) {
        imgWrapper.innerHTML = "";
        textWrapper.innerHTML = "<strong style='color:red;'>Developer Offline Mode Active. Cannot fetch TMDB data.</strong>";
        return;
    }

    imgWrapper.innerHTML = ""; textWrapper.innerHTML = "Fetching official database and trailers...";
    
    let cached = tmdbCache[title];
    if (!cached) {
        const yearMatch = title.match(/\((\d{4})\)/);
        const exactYear = yearMatch ? yearMatch[1] : '';
        let cleanTitle = title.replace(/\s\(\d{4}\)/, '').replace(/ - Season \d+/, '');
        let searchQuery = cleanTitle === "Avengers: Endgame Encore" ? "Avengers: Endgame" : cleanTitle;
        
        try {
            const response = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                cached = data.results[0];
                if (exactYear && searchQuery !== "Avengers: Endgame") {
                    const yearMatchObj = data.results.find(r => (r.release_date && r.release_date.startsWith(exactYear)) || (r.first_air_date && r.first_air_date.startsWith(exactYear)));
                    if (yearMatchObj) cached = yearMatchObj;
                }
                tmdbCache[title] = cached;
            }
        } catch(e) { console.log(e); }
    }

    if (!cached) { textWrapper.innerHTML = "No data found for this title yet. Check API key."; return; }

    try {
        const mediaType = cached.media_type || (title.includes("Season") || title.includes("Agents") || title.includes("Daredevil") || title.includes("Inhumans") || title.includes("Spider-Noir") || title.includes("X-Men: The Animated Series") || title.includes("X-Men: Evolution") || title.includes("Wolverine and the X-Men") || title.includes("The Avengers: Earth's Mightiest Heroes") || title.includes("Spectacular Spider-Man") || title.includes("X-Men '97") || title.includes("Anime") || title === "Legion" || title === "The Gifted" || title.includes("Supaidāman") || title.includes("Marvel Disk Wars") || title.includes("Future Avengers") ? 'tv' : 'movie');
        const response = await fetch(`https://api.themoviedb.org/3/${mediaType}/${cached.id}?api_key=${TMDB_API_KEY}&append_to_response=videos,watch/providers`);
        const details = await response.json();

        let titleName = details.title || details.name || cached.title || cached.name;
        if (title.includes("Encore")) titleName = "Avengers: Endgame Encore";
        
        const releaseDate = details.release_date || details.first_air_date || 'Unknown';
        
        let exactRuntime = details.runtime || (details.episode_run_time && details.episode_run_time.length > 0 ? details.episode_run_time[0] : 0);
        if (exactRuntime > 0) {
            if (dbItem && userData[dbItem.id]) userData[dbItem.id].exactRuntime = exactRuntime * (dbItem?.episodes || 1);
            save(); 
        }

        const pcBadge = dbItem?.pc ? `<span class="badge-pc">🎬 x${dbItem.pc}</span>` : '';
        if (cached.poster_path) imgWrapper.innerHTML = `<img src="https://image.tmdb.org/t/p/w300${cached.poster_path}">`;

        let trailerHtml = "";
        if (details.videos && details.videos.results && details.videos.results.length > 0) {
            let trailer = details.videos.results.find(v => v.site === 'YouTube' && v.type === 'Trailer');
            if (!trailer) trailer = details.videos.results.find(v => v.site === 'YouTube');
            
            if (trailer) {
                trailerHtml = `
                <div class="video-container" onclick="window.open('https://www.youtube.com/watch?v=${trailer.key}', '_blank')">
                    <img src="https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg" onerror="this.src='https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg'" alt="Trailer Thumbnail">
                    <div class="play-btn">
                        <div class="play-icon"></div>
                    </div>
                </div>`;
            }
        }

        window.currentProviders = (details['watch/providers'] && details['watch/providers'].results) || {};
        textWrapper.innerHTML = `
            <h2 style="color: ${dbItem ? dbItem.sectionColor : 'var(--accent)'}; margin: 0 0 10px 0;">${titleName} ${pcBadge}</h2>
            <p><strong>Release Date:</strong> ${title.includes("Encore") ? "2026-09-04" : releaseDate}</p>
            <p><strong>Length:</strong> ${exactRuntime > 0 ? exactRuntime + ' mins' : 'N/A'}</p>
            <p class="modal-overview">${details.overview || "No overview available."}</p>
            ${trailerHtml}
            <div id="providers-box"></div>
        `;
        renderProviders();
    } catch (e) { textWrapper.innerHTML = "Error loading detailed information."; }
}

function handleRandomizerSelect(title) {
    closeModal(null, 'random-modal', true);
    document.getElementById('search-input').value = '';
    setFilter('all');

    const el = document.querySelector(`.item-wrapper[data-full-title="${title.replace(/"/g, '\\"')}"]`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const origBg = el.style.backgroundColor;
        el.style.backgroundColor = 'rgba(230, 36, 41, 0.2)';
        el.style.transition = 'background-color 0.5s ease';
        setTimeout(() => el.style.backgroundColor = origBg, 1500);
    }
    openInfo(title);
}

function openRandomizer() { 
    document.getElementById('random-modal').style.display = "block"; 
    document.getElementById('rand-result').innerHTML = ''; 
    const optLegacy = document.querySelector('#rand-pool option[value="Multiverse Legacy & Standalones"]');
    const optAnimated = document.querySelector('#rand-pool option[value="Marvel Animated Legacy"]');
    if (optLegacy) optLegacy.style.display = showNonCanon ? 'block' : 'none';
    if (optAnimated) optAnimated.style.display = showNonCanon ? 'block' : 'none';
}

function spinWheel() {
    const format = document.getElementById('rand-format').value;
    const poolType = document.getElementById('rand-pool').value;
    let pool = [];

    allDbItems.forEach(item => {
        if (userData[item.id].watched) return;
        if (!showNonCanon && (item.category === "Multiverse Legacy & Standalones" || item.category === "Marvel Animated Legacy")) return;

        const isShow = !!item.episodes;
        if (format === 'movie' && isShow) return;
        if (format === 'show' && !isShow) return;
        if (poolType === 'mcu' && item.excludeProgress) return;
        if (poolType === 'Infinity Saga' && !item.category.includes('Infinity Saga')) return;
        if (poolType === 'Multiverse Saga' && !item.category.includes('Multiverse Saga')) return;
        if (poolType !== 'all' && poolType !== 'mcu' && poolType !== 'Infinity Saga' && poolType !== 'Multiverse Saga') {
            if (item.category !== poolType) return;
        }
        pool.push(item);
    });

    const resEl = document.getElementById('rand-result');
    if (pool.length === 0) { resEl.innerHTML = `<span style="color:var(--accent);">No unwatched titles match your filters!</span>`; return; }

    let spins = 0; resEl.style.color = '#fff';
    const interval = setInterval(() => {
        resEl.innerText = pool[Math.floor(Math.random() * pool.length)].title.replace(/\s\(\d{4}\)/, '');
        if (++spins > 20) {
            clearInterval(interval);
            const pick = pool[Math.floor(Math.random() * pool.length)];
            const cleanTitle = pick.title.replace(/\s\(\d{4}\)/, '');
            resEl.innerHTML = `<strong style="color:var(--star-on); font-size:1.4rem;">${cleanTitle}</strong><br><button onclick="handleRandomizerSelect('${pick.title.replace(/'/g, "\\'")}')" class="filter-btn" style="width:auto; padding:5px 20px; margin-top:15px; border-color:${pick.sectionColor}">View Details</button>`;
            fireConfetti({particleCount: 80, spread: 60, origin: {y: 0.6}});
        }
    }, 50);
}

const posterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const wrapper = entry.target;
            const title = wrapper.getAttribute('data-full-title');
            const img = wrapper.querySelector('.poster-img');
            if (title && img) {
                fetchPoster(title, img);
                observer.unobserve(wrapper);
            }
        }
    });
}, { rootMargin: "150px" });

function generateItemHTML(item, sectionColor) {
    const title = item.title;
    const cleanTitle = title.replace(/\s\(\d{4}\)/, '');
    const data = userData[item.id];
    const isShow = !!item.episodes;
    const isDD = item.dd ? 'doomsday-item' : '';
    
    let starsHTML = '';
    for(let i = 1; i <= 5; i++) starsHTML += `<div class="star-box" data-star="${i}"><span class="star-bg">★</span><span class="star-fill">★</span><div class="hitbox left" data-val="${(i * 2) - 1}"></div><div class="hitbox right" data-val="${i * 2}"></div></div>`;

    const safeID = title.replace(/[^a-zA-Z0-9]/g, '');
    let expanderHTML = isShow ? `<span class="expander" id="exp-${safeID}" onclick="toggleEps('${safeID}')">▼</span>` : `<span class="expander-placeholder"></span>`;
    
    let epsHTML = '';
    if (isShow) {
        epsHTML = `<div class="episodes-container" id="eps-${safeID}" style="display:none;">`;
        for(let e = 0; e < item.episodes; e++) epsHTML += `<div class="ep-row"><label><input type="checkbox" class="ep-check" data-ep="${e}" style="accent-color: ${sectionColor};" ${data.watchedEps[e] ? 'checked' : ''}> Ep ${e+1}</label></div>`;
        epsHTML += `</div>`;
    }
    
    return `
        <div class="item-wrapper ${isDD}" data-id="${item.id}" data-full-title="${title}">
            <div class="item ${data.watched ? 'watched' : ''}">
                <div class="item-left">
                    ${expanderHTML}
                    <input type="checkbox" class="main-checkbox" style="accent-color: ${sectionColor};" ${data.watched ? 'checked' : ''}>
                    <img class="poster-img" alt="Poster">
                    <span class="title">${cleanTitle}</span>
                </div>
                <div class="rating-container">
                    <span class="started-icon ${data.inProgress ? 'active' : ''}" title="Watching / In Progress">⏳</span>
                    <span class="info-icon" title="View Info" onclick="openInfo('${title.replace(/'/g, "\\'")}')">ℹ</span>
                    <span class="note-icon ${data.note ? 'active' : ''}" title="Review Notes">📝</span>
                    <div class="star-rating">${starsHTML}</div>
                    <span class="rating-value">${data.rating > 0 ? data.rating + '/10' : '-/10'}</span>
                </div>
            </div>
            ${epsHTML}
            <div class="note-box" style="display: none;"><textarea placeholder="Write your review or thoughts here...">${data.note}</textarea></div>
        </div>
    `;
}

function attachItemListeners(wrapperDiv, item, sectionColor) {
    const title = item.title; const isShow = !!item.episodes; const data = userData[item.id];
    const itemDiv = wrapperDiv.querySelector('.item');
    const mainCheckbox = wrapperDiv.querySelector('.main-checkbox');
    const epCheckboxes = wrapperDiv.querySelectorAll('.ep-check');
    const starBoxes = wrapperDiv.querySelectorAll('.star-box');
    const hitboxes = wrapperDiv.querySelectorAll('.hitbox');
    const ratingDisplay = wrapperDiv.querySelector('.rating-value');
    const noteIcon = wrapperDiv.querySelector('.note-icon');
    const noteBox = wrapperDiv.querySelector('.note-box');
    const textarea = wrapperDiv.querySelector('textarea');
    const startedIcon = wrapperDiv.querySelector('.started-icon');
    
    posterObserver.observe(wrapperDiv);
    
    updateStarsDisplay(starBoxes, data.rating);
    
    // Manual Started Icon Click
    startedIcon.addEventListener('click', () => {
        userData[item.id].inProgress = !userData[item.id].inProgress;
        startedIcon.classList.toggle('active', userData[item.id].inProgress);
        
        if (userData[item.id].inProgress && userData[item.id].watched) {
            userData[item.id].watched = false;
            mainCheckbox.checked = false;
            itemDiv.classList.remove('watched');
            
            if (isShow) {
                userData[item.id].watchedEps[userData[item.id].watchedEps.length - 1] = false;
                epCheckboxes[epCheckboxes.length - 1].checked = false;
            }
        }
        save();
    });

    if (isShow) {
        epCheckboxes.forEach(epCheck => {
            epCheck.addEventListener('change', (e) => {
                userData[item.id].watchedEps[parseInt(e.target.getAttribute('data-ep'))] = e.target.checked;
                const allWatched = userData[item.id].watchedEps.every(val => val === true);
                const someWatched = userData[item.id].watchedEps.some(val => val === true);
                
                userData[item.id].watched = allWatched; 
                mainCheckbox.checked = allWatched; 
                itemDiv.classList.toggle('watched', allWatched);
                
                // Auto-toggle in progress state for TV shows
                userData[item.id].inProgress = (!allWatched && someWatched);
                startedIcon.classList.toggle('active', userData[item.id].inProgress);
                
                save();
            });
        });
    }

    mainCheckbox.addEventListener('change', (e) => {
        userData[item.id].watched = e.target.checked; 
        itemDiv.classList.toggle('watched', e.target.checked);
        
        if (e.target.checked) {
            userData[item.id].inProgress = false;
            startedIcon.classList.remove('active');
        } else if (isShow) {
            userData[item.id].inProgress = false;
            startedIcon.classList.remove('active');
        }

        if (isShow) { 
            userData[item.id].watchedEps.fill(e.target.checked); 
            epCheckboxes.forEach(cb => cb.checked = e.target.checked); 
        }
        save();
    });
    
    hitboxes.forEach(hitbox => {
        const val = parseInt(hitbox.getAttribute('data-val'), 10);
        hitbox.addEventListener('mouseenter', () => updateStarsDisplay(starBoxes, val));
        hitbox.addEventListener('click', () => {
            userData[item.id].rating = userData[item.id].rating === val ? 0 : val;
            if(userData[item.id].rating > 0) {
                userData[item.id].watched = true; 
                userData[item.id].inProgress = false;
                startedIcon.classList.remove('active');
                mainCheckbox.checked = true; 
                itemDiv.classList.add('watched');
                if (isShow) { userData[item.id].watchedEps.fill(true); epCheckboxes.forEach(cb => cb.checked = true); }
            }
            ratingDisplay.innerText = userData[item.id].rating > 0 ? userData[item.id].rating + '/10' : '-/10';
            updateStarsDisplay(starBoxes, userData[item.id].rating); save();
        });
    });
    wrapperDiv.querySelector('.star-rating').addEventListener('mouseleave', () => updateStarsDisplay(starBoxes, userData[item.id].rating));
    
    noteIcon.addEventListener('click', () => { noteBox.style.display = noteBox.style.display === 'none' ? 'block' : 'none'; if(noteBox.style.display === 'block') textarea.focus(); });
    textarea.addEventListener('input', (e) => { userData[item.id].note = e.target.value; noteIcon.classList.toggle('active', e.target.value.trim() !== ''); save(); });
}

function render() {
    initializeData();
    const container = document.getElementById('content');
    container.innerHTML = '';
    
    if (isChronoMode) {
        const secDiv = document.createElement('div'); secDiv.className = 'section';
        secDiv.innerHTML = `
            <div class="section-header" style="border-bottom: 2px solid #8e44ad; cursor: pointer;" onclick="togglePhase(this)">
                <div style="display:flex; align-items:center; gap: 10px;">
                    <span class="phase-toggle">▼</span>
                    <h2 style="margin: 0;">The Sacred Timeline (Chronological)</h2>
                </div>
            </div>
            <div class="section-content"></div>
        `;
        
        let chronoItems = [...allDbItems].filter(i => i.c !== undefined);
        if (!showNonCanon) {
            chronoItems = chronoItems.filter(i => i.category !== "Multiverse Legacy & Standalones" && i.category !== "Marvel Animated Legacy");
        }
        chronoItems.sort((a, b) => a.c - b.c);

        const contentDiv = secDiv.querySelector('.section-content');
        chronoItems.forEach(item => {
            const wrapperDiv = document.createElement('div');
            wrapperDiv.innerHTML = generateItemHTML(item, item.sectionColor);
            attachItemListeners(wrapperDiv.firstElementChild, item, item.sectionColor);
            contentDiv.appendChild(wrapperDiv.firstElementChild);
        });
        container.appendChild(secDiv);
    } else {
        db.forEach((section, secIdx) => {
            if (!showNonCanon && (section.category === "Multiverse Legacy & Standalones" || section.category === "Marvel Animated Legacy")) {
                return;
            }

            const secDiv = document.createElement('div'); secDiv.className = 'section';
            
            let miniProg = section.excludeProgress ? '' : `
                <div class="mini-progress-wrapper" id="mini-prog-wrapper-${secIdx}" tabindex="0">
                    <input type="checkbox" class="phase-checkbox" id="phase-check-${secIdx}" title="Mark entire phase watched" style="accent-color: ${section.color}; margin-right: 10px;">
                    <span class="mini-progress-text" id="mini-pct-${secIdx}" style="color: ${section.color};">0%</span>
                    <div class="mini-progress-container">
                        <div class="mini-progress-fill" id="mini-prog-${secIdx}" style="background-color: ${section.color};"></div>
                    </div>
                </div>`;
                
            secDiv.innerHTML = `
                <div class="section-header" style="border-bottom: 2px solid ${section.color}; cursor: pointer;" onclick="togglePhase(this)">
                    <div style="display:flex; align-items:center; gap: 10px;">
                        <span class="phase-toggle">▼</span>
                        <h2 style="margin: 0;">${section.category}</h2>
                    </div>
                    <div onclick="event.stopPropagation()">${miniProg}</div>
                </div>
                <div class="section-content"></div>
            `;
            
            const contentDiv = secDiv.querySelector('.section-content');
            section.items.forEach(item => {
                const wrapperDiv = document.createElement('div');
                wrapperDiv.innerHTML = generateItemHTML(item, section.color);
                attachItemListeners(wrapperDiv.firstElementChild, item, section.color);
                contentDiv.appendChild(wrapperDiv.firstElementChild);
            });
            
            const phaseCheck = secDiv.querySelector('.phase-checkbox');
            if (phaseCheck) {
                phaseCheck.addEventListener('change', (e) => {
                    const isChecked = e.target.checked;
                    section.items.forEach(item => {
                        userData[item.id].watched = isChecked;
                        userData[item.id].inProgress = false;
                        if (item.episodes) userData[item.id].watchedEps.fill(isChecked);
                    });
                    
                    const itemWrappers = contentDiv.querySelectorAll('.item-wrapper');
                    itemWrappers.forEach(wrapper => {
                        const mainCb = wrapper.querySelector('.main-checkbox');
                        if(mainCb) mainCb.checked = isChecked;
                        
                        const itemDiv = wrapper.querySelector('.item');
                        if(itemDiv) {
                            if(isChecked) itemDiv.classList.add('watched');
                            else itemDiv.classList.remove('watched');
                        }
                        
                        const startedIcon = wrapper.querySelector('.started-icon');
                        if(startedIcon) startedIcon.classList.remove('active');
                        
                        const epCbs = wrapper.querySelectorAll('.ep-check');
                        epCbs.forEach(cb => cb.checked = isChecked);
                    });
                    
                    save(); 
                });
            }
            
            container.appendChild(secDiv);
        });
    }
    updateDashboards();
}

function initDoomsdayClock() {
    const doomDate = new Date("December 18, 2026 00:00:00").getTime();
    
    setInterval(() => {
        const now = new Date().getTime();
        const distance = doomDate - now;
        
        if (distance < 0) {
            document.getElementById("doom-clock").innerHTML = "DOOM HAS ARRIVED.";
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById("doom-clock").innerHTML = 
            `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
}

/* ==============================================================
   DEVELOPER TOOLS SECRETS & LOGIC
============================================================== */

let secretClickCount = 0;
let secretClickTimer;
function handleSecretClick() {
    secretClickCount++;
    clearTimeout(secretClickTimer);
    if (secretClickCount >= 5) {
        document.getElementById('dev-modal').style.display = 'block';
        document.getElementById('dev-json-editor').value = JSON.stringify(userData, null, 2);
        secretClickCount = 0;
    }
    secretClickTimer = setTimeout(() => { secretClickCount = 0; }, 1000);
}

function devSetScenario(type) {
    allDbItems.forEach(item => {
        let shouldWatch = false;
        if (type === 'all') shouldWatch = true;
        if (type === 'casual' && !item.episodes && !item.excludeProgress) shouldWatch = true;
        if (type === 'doomsday' && item.dd) shouldWatch = true;
        
        userData[item.id].watched = shouldWatch;
        userData[item.id].inProgress = false;
        if (item.episodes) userData[item.id].watchedEps.fill(shouldWatch);
    });
    save(); render();
}

function devGenerateRatings() {
    allDbItems.forEach(item => {
        userData[item.id].watched = true;
        userData[item.id].inProgress = false;
        if (item.episodes) userData[item.id].watchedEps.fill(true);
        
        const roll = Math.random();
        let r = 7;
        if (roll < 0.03) r = 10;
        else if (roll < 0.16) r = 9;
        else if (roll < 0.42) r = 8;
        else if (roll < 0.72) r = 7;
        else if (roll < 0.89) r = 6;
        else if (roll < 0.96) r = 5;
        else r = Math.floor(Math.random() * 2) + 3;

        userData[item.id].rating = r;
    });
    save(); render();
}

function devClearRatings() {
    allDbItems.forEach(item => { userData[item.id].rating = 0; });
    save(); render();
}

function devTriggerConfetti() { fireConfetti({ particleCount: 200, spread: 90, origin: { y: 0.5 } }); }

function devToggleOffline() {
    isDevOffline = !isDevOffline;
    const btn = document.getElementById('dev-offline-btn');
    btn.innerText = `🌐 Simulate API Offline: ${isDevOffline ? 'ON (Failing)' : 'OFF'}`;
    btn.style.borderColor = isDevOffline ? '#e74c3c' : '#555';
    btn.style.color = isDevOffline ? '#e74c3c' : '#eee';
}

function devClearCache() {
    tmdbCache = {};
    alert("TMDB Cache Cleared. Images will reload next time you render or scroll.");
    render();
}

function devToggleWireframe() {
    document.body.classList.toggle('dev-wireframe');
}

function devRunAudit() {
    console.group("🛠 MCU Database Audit");
    let cList = {}; let dupes = []; let missingR = []; let idSeen = {}; let idProblems = [];
    allDbItems.forEach(i => {
        if (i.c) {
            if (cList[i.c]) dupes.push(`Chrono conflict on ID ${i.c}: ${i.title} & ${cList[i.c]}`);
            else cList[i.c] = i.title;
        }
        if (!i.r && !i.episodes) missingR.push(i.title);
        if (!i.id) idProblems.push(`Missing id: ${i.title}`);
        else if (idSeen[i.id]) idProblems.push(`Duplicate id ${i.id}: ${i.title} & ${idSeen[i.id]}`);
        else idSeen[i.id] = i.title;
    });
    if(dupes.length) console.warn("Duplicate Chronological Orders:", dupes); else console.log("✅ Chrono Order is clean.");
    if(idProblems.length) console.warn("Item ID problems:", idProblems); else console.log("\u2705 Item IDs are clean.");
    if(missingR.length) console.warn("Missing Runtimes:", missingR); else console.log("✅ Runtimes are clean.");
    console.log(`Total Database Items: ${allDbItems.length}`);
    console.groupEnd();
    alert("Audit completed! Open your browser's Developer Tools Console (F12) to view the report.");
}

function devSaveJSON() {
    try {
        const newJson = JSON.parse(document.getElementById('dev-json-editor').value);
        userData = newJson; migrateUserData(); initializeData(); save(); render();
        alert("JSON applied successfully!");
    } catch(e) {
        alert("Invalid JSON format! Check for missing commas or brackets.");
    }
}

function devHardReset() {
    if (confirm("⚠️ FACTORY RESET: This will wipe all saved data. Are you sure?")) {
        localStorage.removeItem('marvelTrackerV6');
        userData = {}; initializeData(); save(); render();
        document.getElementById('dev-json-editor').value = JSON.stringify(userData, null, 2);
    }
}

window.onload = function() {
    render();
    initDoomsdayClock();
    checkIncomingSync();
    setupInstallUI();
};

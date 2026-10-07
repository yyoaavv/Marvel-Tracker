# Marvel Tracker

[![Live Demo](https://img.shields.io/badge/Live-Website-e62429?style=for-the-badge)](https://yyoaavv.github.io/Marvel-Tracker/)

Marvel Tracker is a comprehensive, privacy-first web dashboard designed for hardcore Marvel fans. Track your journey through the MCU, Fox's X-Men, Sony's Spider-Man universe, and legacy TV shows without needing an account.

### 🚀 Live Website
**Play with the live tracker here:** [https://yyoaavv.github.io/Marvel-Tracker/](https://yyoaavv.github.io/Marvel-Tracker/)

---

## ✨ Core Features

*   **The Sacred Timeline & Release Order:** Toggle seamlessly between the in-universe chronological timeline and traditional release phases.
*   **Complete Multiverse Coverage:** Includes the Infinity Saga, Multiverse Saga, Marvel One-Shots, The Defenders, Fox X-Men, Fox's Fantastic Four, Sony's Spider-Man (including Spider-Noir), Legacy Marvel Television, and animated series.
*   **Deep TMDB Integration:** Click on any title to pull real-time release data, official synopses, high-quality posters, and playable YouTube trailers directly inside the app.
*   **Where to Watch:** Every title's info window shows which streaming services carry it (plus rent/buy options) in your country, with a country picker. Streaming data provided by JustWatch via TMDB.
*   **Dynamic Progress Bars:** A main progress bar with an animated gradient built from the colors of the phases you've watched, plus a mini progress bar for every phase. Hover (or tap) a mini bar to see exactly how many you've watched and how many are left, like `6 / 14 watched · 8 left`.
*   **Started But Not Finished:** Mark anything you've begun watching with the ⏳ icon (it also turns on automatically when you've watched some episodes of a show), and use the **Started / Watching** filter to jump back to it.
*   **Search & Filter:** Filter your list by All, Watched, Unwatched, Started, Doomsday Prep, and optional Non-Canon & Animation titles.
*   **Up Next & Jump:** A quick panel that shows what you should watch next, with a **Jump to it** button that scrolls straight to that title (opening its phase and clearing any filters hiding it).
*   **Nerd Stats & Hall of Fame:** Tracks your total watch time down to the minute, calculates your average rating, determines your favorite Phase, and builds a custom Top 10 Leaderboard based on your 1-10 star ratings.
*   **Doomsday Prep Mode:** A specialized filter that isolates only the essential multiverse movies you need to watch before *Avengers: Doomsday*. Essential titles get a green glow, and a Doomsday countdown clock keeps you on track.
*   **The Randomizer Wheel:** Can't decide what to watch? Spin the wheel to randomly select an unwatched movie or show based on your current filters.
*   **Celebrations:** Confetti and a glow effect when you complete a Phase.
*   **Privacy First (No Accounts Required):** All watch progress, ratings, and custom review notes are saved securely to your browser's `localStorage`.
*   **Send Progress:** One tap creates a link containing your progress. Send it to yourself and open it on another device (phone to computer or computer to phone) and it offers to load everything (it always asks before replacing anything).
*   **Create Shortcut:** Install the tracker as an app on your home screen or desktop. Works with one tap on Chrome/Edge/Android and with a short guide on iPhone.
*   **Data Portability:** Export your watch history as a backup JSON file, and import it on your phone or another computer to bring your progress with you.

## 📁 Project Structure

```
Marvel-Tracker/
├── index.html    # Page markup
├── style.css     # All styling (themes, progress bars, glows, tooltips)
├── script.js     # Data, rendering, filters, stats, TMDB calls
├── favicon.png   # Tab icon
├── manifest.webmanifest, sw.js, icon-192.png, icon-512.png, apple-touch-icon.png  # Home-screen install support
└── README.md
```

## 🛠️ Built With
*   **HTML5, CSS3, JavaScript (Vanilla)** - Client-side rendering and logic, no frameworks or build step.
*   **The Movie Database (TMDB) API** - Live metadata, posters, and trailers.
*   **Canvas Confetti** - Visual celebration effects for completing Phases.
*   **GitHub Pages** - Hosting and deployment.

## 💾 Local Setup (For Developers)
If you want to download the code and run this locally:
1. Clone this repository to your machine.
2. Keep `index.html`, `style.css`, `script.js` and `favicon.png` together in the same folder.
3. Open `script.js` and set `TMDB_API_KEY` (near the top) to your own free key from [TMDB](https://www.themoviedb.org/settings/api).
4. Open `index.html` in any modern web browser. No local server is required for the base functionality.

**Adding new titles:** give every item a unique 3-digit `id` (100-999) in `script.js`. Progress is saved by ID, so you can safely rename a title later without losing anyone's data. The developer audit checks for missing or duplicate IDs.

> **Note:** Your progress is stored in the browser's `localStorage`, which is tied to the address you open the site from. Use **Export Backup File** before moving to a new address or device, then import it there.

---
*made by yyoaavv* | Featuring the custom progress-ring icon

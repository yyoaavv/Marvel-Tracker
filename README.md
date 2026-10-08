# Unplugged

A private, offline-first tracker for breaking a habit. One honest check-in a day, with tools for the moments that are hard. Everything stays on your device: no accounts, no servers, no analytics.

**Live app:** https://yyoaavv.github.io/Unplugged/

## Features

- **Daily check-in:** log each day as clean or slipped, fix past days from the calendar, or fill in a whole range at once.
- **Slip journal:** when you log a slip, an optional 2-second survey asks about the trigger (Stress, Boredom, Fatigue, Loneliness, Late night screen time), where you were, and when. Skip it any time, or add details later.
- **Pattern insights:** the Stats tab turns your tags into plain-language insights, such as your most common trigger, setting and time of day.
- **Urge support:** the "I need help now" panel offers guided breathing, a 10-minute ride-it-out timer, ideas to change the scene, and your own reasons.
- **Your reasons:** pick built-in reasons or write your own; one is shown back to you when an urge hits.
- **Streaks and achievements:** current and best streak, milestones from day one to a full year, and extra badges.
- **Stats:** last 30 days, weekday breakdown, six-month trend and a year heatmap.
- **Themes:** nine themes plus a custom one, each with light and dark mode.
- **Backup:** export and import your data as a JSON file.
- **Installable PWA:** add it to your home screen for a full-screen app that works offline.

## Privacy

All data is stored in your browser's `localStorage`. Nothing is sent anywhere. The only network request is the optional Google Font; the service worker caches it, and the app falls back to system fonts without it.

Clearing your browser data erases your log, so use **Settings > Export backup** regularly.

## Run it

It's plain HTML, CSS and JavaScript with no build step.

**Locally:** open `index.html` in a browser. The service worker and install option need `https` or `localhost`, so for those run a local server:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

**GitHub Pages:**

1. Push all the files to your repository.
2. Go to **Settings > Pages**, choose your branch and the root folder, and save.
3. Open the `https://<username>.github.io/<repo>/` link, then use your browser's Install or Add to Home Screen option.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole app |
| `manifest.json` | PWA name, colors and icons |
| `sw.js` | Service worker for offline use |
| `favicon.svg` | Browser tab icon (adapts to light and dark mode) |
| `icon.svg`, `icon-maskable.svg` | App icons (SVG) used when installing the app |
| `apple-touch-icon.png` | iPhone and iPad home screen icon (iOS needs PNG) |

## Updating

After changing any file, bump the `CACHE` version at the top of `sw.js` (for example `unplugged-v2`) so installed copies pick up the new version and clean out the old cache.

## Disclaimer

Unplugged is a self-help tool, not medical or mental health care. If you're struggling, consider talking to a doctor, therapist or someone you trust.

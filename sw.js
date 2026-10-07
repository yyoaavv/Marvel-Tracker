// Minimal service worker: it only makes the site installable as an app.
// It does NOT cache anything, so you always get the latest files from the network.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => { /* let the browser handle every request normally */ });

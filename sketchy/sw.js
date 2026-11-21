const CACHE = 'sketchy-studio-v4';
const ASSETS = ['./', './index.html', './studio.css', './studio.js', './party.js', './banks.js',
  './studio.jpg', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE)
    .then(cache => cache.addAll(ASSETS.map(path => new Request(path, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith('sketchy-studio-') && key !== CACHE)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const scope = self.registration.scope;
  if (event.request.method !== 'GET' || !url.href.startsWith(scope)) return;
  const path = url.pathname.slice(new URL(scope).pathname.length);
  if (!ASSETS.includes('./' + path)) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    return await cache.match('./' + path) ?? fetch(event.request);
  }));
});

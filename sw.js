const CACHE = 'quest-hq-v1';
const ASSETS = [
  '/Elsies-room-makeover/',
  '/Elsies-room-makeover/index.html',
  '/Elsies-room-makeover/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Never cache Supabase API calls
  if (e.request.url.includes('supabase.co')) return;
  // Never cache Google Fonts
  if (e.request.url.includes('googleapis.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

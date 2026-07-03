const CACHE_NAME = 'nod-v1-cache-v1';
const ASSETS_TO_CACHE = [
  'index.html',
  'styles.css',
  'app.js',
  'manifest.json',
  'audio/attention-chime.mp3'
];

// Install Event: Cache essential app assets[span_3](start_span)[span_3](end_span)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up old caches[span_4](start_span)[span_4](end_span)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Cache First for offline stability[span_5](start_span)[span_5](end_span)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

// Notification Push Event for daily reminders[span_6](start_span)[span_6](end_span)
self.addEventListener('push', (event) => {
  const options = {
    body: 'Time for your daily micro-movement check-in.',[span_7](start_span)[span_7](end_span)
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    tag: 'nod-reminder',[span_8](start_span)[span_8](end_span)
    renotify: false[span_9](start_span)[span_9](end_span)
  };
  event.waitUntil(
    self.registration.showNotification('NOD Companion', options)
  );
});

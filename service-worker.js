self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('sensor-test-cache').then(cache => {
            return cache.addAll([
                '/',
                '/home.html',
                '/pageInit.html',
                '/pagasobre.html',
                '/style.css',
                '/styleprince.css',
                '/manifest.json',
                '/script.js'
            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
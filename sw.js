// Service Worker para Ho'oponopono PWA
const CACHE_NAME = 'hooponopono-v1';
const urlsToCache = [
    '/',
    '/manifest.json',
    '/styles.css',
    '/script.js',
    '/icon-180.png',
    '/icon-192.png',
    '/icon-512.png'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Cache aberto');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.log('⚠️ Service Worker: Erro no cache:', error);
            })
    );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Retorna cache se disponível, senão busca na rede
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: Ativado');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

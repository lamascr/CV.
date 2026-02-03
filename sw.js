// Service Worker para Carlos Lamas Portfolio
// Versión: 1.0.0

const CACHE_NAME = 'carlos-lamas-portfolio-v1.0.0';
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

// Archivos a cachear para funcionamiento offline
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/animations.css',
    '/script.js',
    '/app.js',
    '/imgs/profile_photo_6.jpg',
    '/imgs/cad_design_1.jpg',
    '/imgs/cad_software_1.jpg',
    '/imgs/maintenance_1.jpg',
    '/imgs/maintenance_2.jpg',
    '/imgs/blueprint_2.jpg',
    '/cv/carlos-lamas-cv.pdf'
];

// URLs externas a cachear
const EXTERNAL_CACHE = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500;600&display=swap'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
    console.log('Service Worker: Instalando...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Cacheando archivos estáticos');
                return cache.addAll([
                    ...STATIC_FILES,
                    ...EXTERNAL_CACHE
                ]);
            })
            .then(() => {
                console.log('Service Worker: Archivos cacheados exitosamente');
                // Forzar activación inmediata
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Error al cachear archivos:', error);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
    console.log('Service Worker: Activando...');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => {
                            // Eliminar caches antiguos
                            return cacheName !== CACHE_NAME &&
                                cacheName !== STATIC_CACHE &&
                                cacheName !== DYNAMIC_CACHE;
                        })
                        .map(cacheName => {
                            console.log('Service Worker: Eliminando cache antiguo:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('Service Worker: Activado exitosamente');
                // Reclamar control inmediato
                return self.clients.claim();
            })
    );
});

// Interceptar peticiones
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Solo manejar requests HTTP/HTTPS
    if (!request.url.startsWith('http')) {
        return;
    }

    // Estrategia diferente según el tipo de recurso
    if (isStaticFile(request.url)) {
        // Cache First para archivos estáticos
        event.respondWith(cacheFirstStrategy(request));
    } else if (isImageFile(request.url)) {
        // Cache First con fallback para imágenes
        event.respondWith(cacheFirstWithFallback(request));
    } else if (isExternalResource(request.url)) {
        // Network First con cache fallback para recursos externos
        event.respondWith(networkFirstStrategy(request));
    } else {
        // Stale While Revalidate para páginas HTML
        event.respondWith(staleWhileRevalidateStrategy(request));
    }
});

// ============================================
// ESTRATEGIAS DE CACHE
// ============================================

// Cache First: Buscar en cache primero, luego en red
async function cacheFirstStrategy(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Cache First Strategy failed:', error);
        return new Response('Archivo no disponible offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Network First: Buscar en red primero, luego en cache
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Network request failed, trying cache:', request.url);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return new Response('Contenido no disponible', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Stale While Revalidate: Usar cache inmediatamente y actualizar en background
async function staleWhileRevalidateStrategy(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    // Hacer fetch en background para actualizar cache
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => {
        // Silently fail for network requests
        return cachedResponse;
    });

    // Devolver cache inmediatamente si existe, si no, esperar red
    return cachedResponse || fetchPromise;
}

// Cache First con fallback específico para imágenes
async function cacheFirstWithFallback(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Imagen de fallback genérica
        return new Response(
            `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f3f4f6"/>
                <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280">
                    Imagen no disponible
                </text>
            </svg>`,
            {
                headers: { 'Content-Type': 'image/svg+xml' }
            }
        );
    }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function isStaticFile(url) {
    const staticExtensions = ['.css', '.js', '.html', '.pdf', '.ico', '.txt'];
    return staticExtensions.some(ext => url.includes(ext)) ||
        STATIC_FILES.some(file => url.includes(file));
}

function isImageFile(url) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => url.includes(ext));
}

function isExternalResource(url) {
    return url.includes('fonts.googleapis.com') ||
        url.includes('fonts.gstatic.com') ||
        url.includes('cdnjs.cloudflare.com') ||
        url.includes('unpkg.com');
}

// ============================================
// EVENTOS ADICIONALES
// ============================================

// Mensaje del cliente principal
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
        }).then(() => {
            event.ports[0].postMessage({ success: true });
        });
    }
});

// Notificación de actualización disponible
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
        // Mostrar notificación al usuario
        self.registration.showNotification('Actualización disponible', {
            body: 'Una nueva versión del sitio está disponible. Recarga para actualizarla.',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            actions: [
                {
                    action: 'update',
                    title: 'Actualizar'
                },
                {
                    action: 'dismiss',
                    title: 'Más tarde'
                }
            ]
        });
    }
});

// Manejo de notificaciones
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'update') {
        // Forzar actualización
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }).then(() => {
                return self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage({ type: 'RELOAD_PAGE' });
                    });
                });
            })
        );
    } else if (event.action === 'dismiss') {
        // No hacer nada, la notificación ya se cerró
    } else {
        // Click en el cuerpo de la notificación
        event.waitUntil(
            self.clients.matchAll().then(clients => {
                // Si ya hay una ventana abierta, enfocarla
                for (const client of clients) {
                    if (client.url === self.registration.scope && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Si no hay ventana abierta, abrir una nueva
                if (self.clients.openWindow) {
                    return self.clients.openWindow('/');
                }
            })
        );
    }
});

// Sincronización en background
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        // Aquí puedes implementar lógica de sincronización en background
        // Por ejemplo, enviar analytics, sincronizar datos, etc.
        console.log('Background sync executed');
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Push notifications (para futuras implementaciones)
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Nueva notificación',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver detalles',
                icon: '/icons/checkmark.png'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: '/icons/xmark.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Carlos Lamas Portfolio', options)
    );
});

console.log('Service Worker: Cargado y listo para interceptar peticiones');

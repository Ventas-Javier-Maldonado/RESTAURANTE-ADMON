/* =========================================================
   CONTROL RESTAURANTE
   SERVICE WORKER
   ========================================================= */

const CACHE_NAME = "control-restaurante-v1";

const ARCHIVOS = [
	"./",
	"./index.html",
	"./css/styles.css",
	"./js/app.js",
	"./manifest.webmanifest"
];


/* ---------------------------------------------------------
   INSTALACIÓN
   --------------------------------------------------------- */

self.addEventListener("install", (event) => {

	event.waitUntil(

		caches.open(CACHE_NAME)
			.then((cache) => {

				return cache.addAll(ARCHIVOS);

			})

	);

	self.skipWaiting();

});


/* ---------------------------------------------------------
   ACTIVACIÓN
   --------------------------------------------------------- */

self.addEventListener("activate", (event) => {

	event.waitUntil(

		caches.keys()
			.then((nombres) => {

				return Promise.all(

					nombres
						.filter(
							(nombre) =>
								nombre !== CACHE_NAME
						)
						.map(
							(nombre) =>
								caches.delete(nombre)
						)

				);

			})

	);

	self.clients.claim();

});


/* ---------------------------------------------------------
   PETICIONES
   --------------------------------------------------------- */

self.addEventListener("fetch", (event) => {

	event.respondWith(

		caches.match(event.request)
			.then((respuestaCache) => {

				if (respuestaCache) {

					return respuestaCache;

				}

				return fetch(event.request);

			})

	);

});

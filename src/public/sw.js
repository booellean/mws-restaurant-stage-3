const staticCacheName= 'restaurant-review-';
const staticCacheVer = 'v1';
const staticCache = staticCacheName + staticCacheVer; //full version name

//caching code was partly derived from Google Developers, information below
/**
*Author: Google (Individual Names Not Listed)
*Date: April 9th, 2018
*Title: Caching Files with Service Worker
*Code Version: Unknown
*Type: Service Worker
*Web Address: https://developers.google.com/web/ilt/pwa/caching-'files-with-service-worker
*/

/**
* @description Caches site content
* @param {string} cache
* @param {string} staticCache
* @returns {string} During service worker installation, caches site content
*/
self.addEventListener('install', (event) =>{
  event.waitUntil(
    caches.open(staticCache).then( (cache) =>{
      return cache.addAll([
        'restaurant.html',
        'index.html',
        '/js/main.js',
        '/js/dbhelper.js',
        '/js/restaurant_info.js',
        '/js/service_worker.js',
        '/js/idb.js',
        '/js/leaflet.min.js',
        '/css/styles.css',
        '/css/styles-queries.css',
        '/css/normalize.min.css',
        '/css/leaflet.min.css'
      ]);
    })
  );
});

/**
* @description Deletes old cache from old version
* @param {string} cacheName
* @param {string} staticCacheName
* @param {string} staticCache
* @returns {string} During service worker activation, deletes all cache that is no longer found in new service worker version
*/
self.addEventListener('activate', (event) =>{
  event.waitUntil(
    caches.keys().then( (cacheNames) =>{
      return Promise.all(
        cacheNames.filter( (cacheName) =>{
          return cacheName.startsWith(staticCacheName) && cacheName != staticCache;
        }).map( (cacheName) =>{
          return caches.delete(cacheName);
        })
      );
    })
  );
});


/**
* @description fetches from cache or server if content is not cached
* @param {string} res
* @returns {string} returns cache if it is found, else caches the event.request from the server if it is not found
*/
self.addEventListener('fetch', (event) =>{
  if(event.request.method === 'GET'){ //Stops interceptions of POST requests
    event.respondWith(
      caches.open(staticCache).then( (cache) =>{
        return fetch(event.request).then( (res) =>{
          cache.put(event.request, res.clone());
          return res;
        })
      })
    );
  }
});
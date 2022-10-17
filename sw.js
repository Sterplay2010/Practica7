const STATIC_CACHE_NAME = 'static-cache-v1.1'
const INMUTABLE_CACHE_NAME = 'inmutable-cache-v1.1'
const DYNAMIC_CACHE_NAME = 'dinamic-cache-v1.1'

const cleanCache = (nameCache,numItems) => {
    caches.open(nameCache)
        .then((cache)=>{
            cache.keys()
                .then((items)=>{
                    console.log(items.length)
                    if (items.length >= numItems){
                        cache.delete(items[0])
                            .then(()=>{cleanCache(nameCache,numItems)}); // Ver si tienes que eliminar mas caches de nuevo, por la escritura y el guardado
                    }
                })
        })
}


self.addEventListener('install',(event)=>{
    console.log("Service Worker => Installed")

    // cache estatico
    const respCache = caches.open(STATIC_CACHE_NAME)
        .then((cache)=>{
            return cache.addAll([
                '/',
                './index.html',
                './css/style.css',
                './js/app.js',
            ]);
        });

    //cache dinamico
    const respInmutable = caches.open(INMUTABLE_CACHE_NAME)
        .then((cache)=>{
            return cache.addAll(
                [
                    'https://cdn.jsdelivr.net/npm/daisyui@2.31.0/dist/full.css',
                    'https://cdn.jsdelivr.net/npm/tailwindcss@2.2/dist/tailwind.min.css',
                    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css'
                ]
            )
        });

    // Espera hasta que todos los caches se creen
    event.waitUntil(Promise.all([respCache,respInmutable]));
});

/*self.addEventListener('fetch',(event)=>{
    const resp = caches.match(event.request)
    event.respondWith(resp)
})*/


self.addEventListener('fetch', (event)=>{
    //revisar si tenemos cache
    const resp = caches.match(event.request).then((respCache)=>{
        if(respCache){
            return respCache;
        }
        //No estan cache, entonces utilizamos web
        return fetch(event.request).then((respWeb)=>{
            caches.open(DYNAMIC_CACHE_NAME).then((cache)=>{
                //Usamos put porque no conoces nuestro url o algo así (no se utilizo add)
                cache.put(event.request, respWeb)
                cleanCache(DYNAMIC_CACHE_NAME,5);
            })
            return respWeb.clone();
        })
    })

    event.respondWith(resp)
});
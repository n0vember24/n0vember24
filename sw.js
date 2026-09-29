// При каждом обновлении приложения увеличивайте номер версии
const VERSION='v1.1.0';
const SHELL='shell-'+VERSION, RUNTIME='runtime-'+VERSION;
const FILES=['./','./index.html','./manifest.webmanifest','./xlsx.full.min.js','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==SHELL&&k!==RUNTIME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  // Страница: сначала сеть (чтобы получать обновления), без сети — из кэша
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(SHELL).then(c=>c.put('./index.html',cp));return r;}).catch(()=>caches.match('./index.html')));
    return;
  }
  // Шрифты Google: из кэша, в фоне обновляются
  if(url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.open(RUNTIME).then(c=>c.match(req).then(hit=>{const net=fetch(req).then(r=>{c.put(req,r.clone());return r;}).catch(()=>hit);return hit||net;})));
    return;
  }
  // Остальные свои файлы: из кэша, иначе сеть
  if(url.origin===location.origin) e.respondWith(caches.match(req).then(hit=>hit||fetch(req)));
});

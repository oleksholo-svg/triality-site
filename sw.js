// Service worker сайта: кеш для быстрой повторной загрузки.
//
// КОГДА МЕНЯТЬ CACHE_VERSION ('v1' -> 'v2' -> ...):
//  - заменил картинку, script.js или intro.js, НЕ меняя имя файла, и хочешь, чтобы все увидели новую
//    версию как можно скорее. Без смены версии новый файл всё равно подтянется сам, но только со
//    следующего захода (сначала показывается старая копия из кеша, а в фоне качается новая);
//  - удалил с сайта много файлов и хочешь очистить кеш у посетителей.
// Если менял только index.html (тексты, разметку) — версию менять НЕ нужно: страница всегда берётся из сети.
// Видео (*.mp4), exe и perekup-version.txt сюда не попадают вообще.
const CACHE_VERSION = 'v9';
const CACHE = 'triality-' + CACHE_VERSION;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => e.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('triality-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));

const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  const own = url.origin === self.location.origin;
  // exe/версия обновляются при каждой публикации, видео идут кусками (Range) — не трогаем
  if (own && /\.(exe|mp4)$|\/perekup-version\.txt$/i.test(url.pathname)) return;

  if (req.mode === 'navigate') {
    if (!own) return;
    // HTML: сначала сеть (новая версия сайта видна сразу), без сети — из кеша
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./'))
      .then(r => r || Response.error())));
    return;
  }

  // Картинки, скрипты, манифест, Google Fonts: из кеша, в фоне обновляем. Остальное (goatcounter и т.п.) — мимо.
  if (!own && !FONT_HOSTS.includes(url.hostname)) return;
  e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => {
    const net = fetch(req).then(res => {
      if (res.ok || res.type === 'opaque') c.put(req, res.clone());
      return res;
    });
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  })));
});

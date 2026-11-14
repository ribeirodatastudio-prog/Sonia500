// Venecia500 — guarda o app no aparelho para funcionar sem internet.
// Ao publicar uma versão nova, troque o número abaixo.
const PREFIXO = 'venecia500-';
const VERSAO = PREFIXO + 'v2';
const ARQUIVOS = [
  './', 'index.html', 'config.js', 'palavras.js', 'manifest.json',
  '../style.css', '../jogo.js', '../ui.js',
  'icones/apple-touch-icon.png', 'icones/icone-192.png', 'icones/icone-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith(PREFIXO) && n !== VERSAO).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(VERSAO).then((c) => c.match(e.request, { ignoreSearch: true })).then((r) => r || fetch(e.request))
  );
});

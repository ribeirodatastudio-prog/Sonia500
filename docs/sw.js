// Sonia500 — guarda o app no aparelho para funcionar sem internet.
// Ao publicar uma versão nova, troque o número abaixo: o iPhone baixa tudo de novo na próxima abertura.
const PREFIXO = 'sonia500-';
const VERSAO = PREFIXO + 'v6';
const ARQUIVOS = [
  './', 'index.html', 'style.css', 'palavras.js', 'jogo.js', 'ui.js', 'manifest.json',
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

// Primeiro o que está guardado; se não tiver, busca na internet.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(VERSAO).then((c) => c.match(e.request, { ignoreSearch: true })).then((r) => r || fetch(e.request))
  );
});

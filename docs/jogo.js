// Sonia500 — lógica do jogo (sem interface). Funciona no navegador e no Node (para os testes).
(function (raiz) {
  const TAMANHO = 5;
  const MAX_TENTATIVAS = 8;
  const POR_DIA = 2; // palavras do dia
  // Dia 0 da contagem. A palavra do dia muda à meia-noite no horário do aparelho.
  const INICIO = new Date(2026, 10, 1); // 1º de novembro de 2026

  let SECRETAS, ACEITAS_TXT;
  if (typeof module !== 'undefined') ({ SECRETAS, ACEITAS: ACEITAS_TXT } = require('./palavras.js'));
  else ({ SECRETAS, ACEITAS: ACEITAS_TXT } = { SECRETAS: raiz.SECRETAS, ACEITAS: raiz.ACEITAS });

  // Remove acentos, troca Ç por C, deixa maiúsculo.
  function normalizar(p) {
    // Tira acentos (Ç vira C), mas mantém Ñ, que no espanhol é outra letra
    return p.trim().toUpperCase().replace(/Ñ/g, '\u0001').normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').replace(/\u0001/g, 'Ñ');
  }

  // Dicionário de palpites aceitos: chave sem acento -> grafia acentuada
  const ACEITAS = new Map();
  for (const item of ACEITAS_TXT.split(' ')) {
    const [chave, grafia] = item.split(':');
    ACEITAS.set(chave, grafia || chave);
  }

  // Embaralhamento fixo (mesma ordem em qualquer aparelho)
  function mulberry32(semente) {
    return function () {
      semente |= 0; semente = (semente + 0x6d2b79f5) | 0;
      let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const ORDEM = (() => {
    const lista = SECRETAS.slice();
    const rnd = mulberry32(500500);
    for (let i = lista.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [lista[i], lista[j]] = [lista[j], lista[i]];
    }
    return lista;
  })();

  function numeroDoDia(data = new Date()) {
    const d = new Date(data.getFullYear(), data.getMonth(), data.getDate());
    return Math.round((d - INICIO) / 86400000);
  }

  // Duas palavras por dia: a 1ª vem da primeira metade da lista embaralhada, a 2ª da segunda metade.
  // Assim nenhuma se repete antes de ~450 dias, e a palavra 1 é a mesma que já existia antes.
  function palavraDoDia(data = new Date(), qual = 1) {
    const metade = Math.floor(ORDEM.length / POR_DIA);
    const n = numeroDoDia(data);
    const i = ((n % metade) + metade) % metade;
    return ORDEM[i + (qual - 1) * metade];
  }

  function palavraAleatoria(evitar = []) {
    const fora = new Set(evitar.map(normalizar));
    const opcoes = SECRETAS.filter((p) => !fora.has(normalizar(p)));
    const lista = opcoes.length ? opcoes : SECRETAS;
    return lista[Math.floor(Math.random() * lista.length)];
  }

  // Verdes: letra certa no lugar certo. Amarelas: letra existe, outro lugar. Vermelhas: o resto.
  function pontuar(palpite, secreta) {
    const p = normalizar(palpite), s = normalizar(secreta);
    let verdes = 0;
    const sobraP = {}, sobraS = {};
    for (let i = 0; i < s.length; i++) {
      if (p[i] === s[i]) verdes++;
      else {
        sobraP[p[i]] = (sobraP[p[i]] || 0) + 1;
        sobraS[s[i]] = (sobraS[s[i]] || 0) + 1;
      }
    }
    let amarelas = 0;
    for (const letra in sobraP) amarelas += Math.min(sobraP[letra], sobraS[letra] || 0);
    return { verdes, amarelas, vermelhas: s.length - verdes - amarelas };
  }

  // Retorna { ok, palavra (acentuada), erro }
  function validar(palpite) {
    const chave = normalizar(palpite);
    if (chave.length < TAMANHO) return { ok: false, erro: 'Faltam letras' };
    if (chave.length > TAMANHO) return { ok: false, erro: 'Letras demais' };
    if (!ACEITAS.has(chave)) return { ok: false, erro: 'Palavra não encontrada' };
    return { ok: true, palavra: ACEITAS.get(chave) };
  }

  // Dica: uma palavra que daria exatamente as mesmas contagens em todos os palpites já feitos.
  // historico = [{ palpite, verdes, amarelas }]. Se a secreta for passada, a dica nunca é ela:
  // a dica ajuda a pensar, mas não entrega a vitória. Retorna null se não houver o que sugerir.
  function dica(historico, secreta = null) {
    if (!historico.length) return null;
    const proibidas = new Set(historico.map((h) => normalizar(h.palpite)));
    if (secreta) proibidas.add(normalizar(secreta));
    const bate = (c) => historico.every((h) => {
      const r = pontuar(h.palpite, c);
      return r.verdes === h.verdes && r.amarelas === h.amarelas;
    });
    const sortear = (lista) => lista[Math.floor(Math.random() * lista.length)];
    // Primeiro sorteia entre as palavras comuns; se não houver, no dicionário inteiro (só letras distintas).
    const comuns = SECRETAS.filter((c) => !proibidas.has(normalizar(c)) && bate(c));
    if (comuns.length) return sortear(comuns);
    const outras = [];
    for (const [chave, grafia] of ACEITAS) {
      if (!proibidas.has(chave) && new Set(chave).size === TAMANHO && bate(chave)) outras.push(grafia);
    }
    return outras.length ? sortear(outras) : null;
  }

  const Jogo = {
    TAMANHO, MAX_TENTATIVAS, POR_DIA, normalizar, pontuar, validar, dica,
    palavraDoDia, numeroDoDia, palavraAleatoria, total: SECRETAS.length,
  };
  if (typeof module !== 'undefined') module.exports = Jogo;
  else raiz.Jogo = Jogo;
})(typeof window !== 'undefined' ? window : globalThis);

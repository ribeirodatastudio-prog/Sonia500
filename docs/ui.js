// Sonia500 — interface. Usa window.Jogo (jogo.js).
(function () {
  const J = window.Jogo;
  const N = J.TAMANHO, MAX = J.MAX_TENTATIVAS;
  const $ = (id) => document.getElementById(id);
  const CHAVE = 'sonia500:partida';

  // ---------- Estado ----------
  function novaPartida() {
    return {
      dia: J.numeroDoDia(),
      secreta: J.palavraDoDia(),
      palpites: [],            // [{ palavra, verdes, amarelas, vermelhas }]
      atual: Array(N).fill(''), // letras da linha que ela está escrevendo ('' = vazio)
      cursor: 0,               // onde a próxima letra vai (N = linha cheia)
      fim: null,               // 'ganhou' | 'perdeu'
      marcasLetra: {},         // { A: 'fora' | 'existe' }
      marcasPos: Array(N).fill(null), // letra marcada como certa em cada posição
    };
  }
  function carregar() {
    try {
      const s = JSON.parse(localStorage.getItem(CHAVE));
      if (s && s.dia === J.numeroDoDia()) {
        if (typeof s.atual === 'string') { s.atual = Array.from({ length: N }, (_, i) => s.atual[i] || ''); s.cursor = s.atual.indexOf(''); if (s.cursor < 0) s.cursor = N; }
        return s;
      }
    } catch (e) {}
    return novaPartida();
  }
  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(E)); } catch (e) {} }
  let E = carregar();

  // ---------- Números (ficam guardados no aparelho) ----------
  const CHAVE_N = 'sonia500:numeros';
  function lerNumeros() {
    let n = null;
    try { n = JSON.parse(localStorage.getItem(CHAVE_N)); } catch (e) {}
    return n || { jogos: 0, vitorias: 0, sequencia: 0, melhor: 0, ultimaVitoria: null, ultimoDia: null,
      emQuantas: Array(MAX + 1).fill(0), // índice 1..8 = acertou em tantas; 0 = não acertou
      historico: [] };       // [{ dia, palavra, tentativas, ganhou }]
  }
  // Registra a partida do dia uma única vez
  function registrarResultado() {
    const n = lerNumeros();
    if (n.ultimoDia === E.dia) return;
    const ganhou = E.fim === 'ganhou', t = E.palpites.length;
    n.jogos++; n.ultimoDia = E.dia;
    if (ganhou) {
      n.vitorias++; n.emQuantas[t]++;
      n.sequencia = n.ultimaVitoria === E.dia - 1 ? n.sequencia + 1 : 1;
      n.ultimaVitoria = E.dia; n.melhor = Math.max(n.melhor, n.sequencia);
    } else { n.emQuantas[0]++; n.sequencia = 0; }
    n.historico.push({ dia: E.dia, palavra: J.validar(E.secreta).palavra, tentativas: t, ganhou });
    try { localStorage.setItem(CHAVE_N, JSON.stringify(n)); } catch (e) {}
  }
  // Sequência que vale hoje: se pulou um dia sem acertar, zera
  function sequenciaAtual(n) {
    const hoje = J.numeroDoDia();
    return n.ultimaVitoria !== null && n.ultimaVitoria >= hoje - 1 ? n.sequencia : 0;
  }
  function desenharNumeros(alvo) {
    const n = lerNumeros();
    const pct = n.jogos ? Math.round((100 * n.vitorias) / n.jogos) : 0;
    const hoje = n.ultimoDia === J.numeroDoDia() ? n.historico.at(-1) : null;
    const maior = Math.max(1, ...n.emQuantas);
    const barra = (rotulo, qtd, ehHoje, perdeu) =>
      `<div class="barra${ehHoje ? ' hoje' : ''}${perdeu ? ' perdeu' : ''}"><span>${rotulo}</span><i style="width:${Math.max(8, (100 * qtd) / maior)}%">${qtd}</i></div>`;
    let linhas = '';
    for (let t = 1; t <= MAX; t++) linhas += barra(t, n.emQuantas[t], hoje && hoje.ganhou && hoje.tentativas === t, false);
    linhas += barra('✗', n.emQuantas[0], hoje && !hoje.ganhou, true);
    alvo.innerHTML = `
      <div class="placar">
        <div><b>${n.jogos}</b><span>jogos</span></div>
        <div><b>${pct}%</b><span>acertos</span></div>
        <div><b>${sequenciaAtual(n)}</b><span>dias seguidos</span></div>
        <div><b>${n.melhor}</b><span>melhor sequência</span></div>
      </div>
      <h3>Acertou em quantas tentativas</h3>
      <div class="barras">${linhas}</div>
      ${n.jogos ? '' : '<p class="nota">Os números começam a contar quando você terminar a primeira palavra do dia.</p>'}`;
  }

  // ---------- Marcações ----------
  function marcaDoLadrilho(letra, pos) {
    if (!letra || letra === ' ') return null;
    if (E.marcasPos[pos] === letra) return 'certa';
    return E.marcasLetra[letra] || null;
  }
  function marcaDaTecla(letra) {
    if (E.marcasPos.includes(letra)) return 'certa';
    return E.marcasLetra[letra] || null;
  }
  // Toque no ladrilho: sem cor -> vermelho -> amarelo -> verde -> sem cor
  function ciclarLadrilho(letra, pos) {
    const atual = marcaDoLadrilho(letra, pos);
    const limparPos = () => { E.marcasPos = E.marcasPos.map((l) => (l === letra ? null : l)); };
    if (atual === null) { E.marcasLetra[letra] = 'fora'; limparPos(); }
    else if (atual === 'fora') { E.marcasLetra[letra] = 'existe'; }
    else if (atual === 'existe') { E.marcasPos[pos] = letra; E.marcasLetra[letra] = 'existe'; }
    else { delete E.marcasLetra[letra]; limparPos(); }
    salvar(); desenhar();
  }
  // Segurar a tecla: sem cor -> vermelho -> amarelo -> sem cor
  function ciclarTecla(letra) {
    const atual = marcaDaTecla(letra);
    if (atual === null) { E.marcasLetra[letra] = 'fora'; E.marcasPos = E.marcasPos.map((l) => (l === letra ? null : l)); }
    else if (atual === 'fora') E.marcasLetra[letra] = 'existe';
    else { delete E.marcasLetra[letra]; E.marcasPos = E.marcasPos.map((l) => (l === letra ? null : l)); }
    salvar(); desenhar();
  }
  // Anotação óbvia: palpite com 0 verdes e 0 amarelas -> todas as letras estão fora
  function anotarObvio(p) {
    if (p.verdes + p.amarelas === 0) {
      for (const l of J.normalizar(p.palavra)) if (!E.marcasLetra[l] && !E.marcasPos.includes(l)) E.marcasLetra[l] = 'fora';
    }
  }

  // ---------- Grade ----------
  const grade = $('grade');
  function montarGrade() {
    grade.innerHTML = '';
    for (let r = 0; r < MAX; r++) {
      const linha = document.createElement('div');
      linha.className = 'linha'; linha.setAttribute('role', 'row');
      for (let c = 0; c < N; c++) {
        const b = document.createElement('button');
        b.className = 'letra'; b.dataset.r = r; b.dataset.c = c; b.tabIndex = -1;
        linha.appendChild(b);
      }
      linha.appendChild(document.createElement('div'));
      for (const cor of ['verde', 'amarela', 'vermelha']) {
        const d = document.createElement('div');
        d.className = 'conta vazia'; d.dataset.cor = cor;
        d.innerHTML = '<span></span>';
        linha.appendChild(d);
      }
      grade.appendChild(linha);
    }
  }

  function desenharLinha(r, animar = false) {
    const linha = grade.children[r];
    const p = E.palpites[r];
    const ehAtual = !E.fim && r === E.palpites.length;
    const texto = p ? J.normalizar(p.palavra) : ehAtual ? E.atual : [];
    const mostrar = p ? p.palavra : texto; // mostra acentuada depois de enviada
    const letras = linha.querySelectorAll('.letra');
    letras.forEach((b, c) => {
      const l = texto[c] || '';
      b.textContent = mostrar[c] || '';
      b.className = 'letra';
      if (l) b.classList.add('cheia');
      if (ehAtual) b.classList.add('atual');
      if (ehAtual && c === E.cursor) b.classList.add('cursor');
      const m = marcaDoLadrilho(l, c);
      if (m) b.classList.add('m-' + m);
      b.tabIndex = (p && l) || ehAtual ? 0 : -1;
      b.setAttribute('aria-label', l ? `${l}${m ? ', marcada ' + ({ fora: 'vermelha', existe: 'amarela', certa: 'verde' })[m] : ''}` : 'vazio');
      if (animar) { b.classList.add('vira'); b.style.animationDelay = c * 110 + 'ms'; }
      else b.style.animationDelay = '';
    });
    const contas = linha.querySelectorAll('.conta');
    const valores = p ? [p.verdes, p.amarelas, p.vermelhas] : null;
    contas.forEach((d, i) => {
      const s = d.firstElementChild;
      d.className = 'conta' + (p ? '' : ' vazia');
      s.className = p ? d.dataset.cor + (valores[i] === 0 ? ' zero' : '') : '';
      s.textContent = p ? valores[i] : '';
      if (p && animar) { d.classList.add('aparece'); s.style.animationDelay = N * 110 + 200 + i * 90 + 'ms'; }
      else s.style.animationDelay = '';
    });
    if (p) linha.setAttribute('aria-label', `${p.palavra}: ${p.verdes} no lugar certo, ${p.amarelas} em outro lugar, ${p.vermelhas} fora`);
  }

  // ---------- Teclado ----------
  const FILEIRAS = ['QWERTYUIOP', 'ASDFGHJKL⌫', 'ZXCVBNM↵'];
  const teclado = $('teclado');
  function montarTeclado() {
    teclado.innerHTML = '';
    for (const f of FILEIRAS) {
      const fil = document.createElement('div'); fil.className = 'fileira';
      for (const k of f) {
        const b = document.createElement('button'); b.className = 'tecla';
        if (k === '⌫') {
          b.classList.add('larga'); b.dataset.acao = 'apagar'; b.setAttribute('aria-label', 'Apagar');
          b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 5H9l-6 7 6 7h12z"/><path d="M12 9.5l5 5M17 9.5l-5 5"/></svg>';
        } else if (k === '↵') {
          b.classList.add('enviar'); b.dataset.acao = 'enviar'; b.textContent = 'Enviar';
        } else { b.dataset.letra = k; b.textContent = k; }
        fil.appendChild(b);
      }
      teclado.appendChild(fil);
    }
  }
  function desenharTeclado() {
    teclado.querySelectorAll('[data-letra]').forEach((b) => {
      const m = marcaDaTecla(b.dataset.letra);
      b.className = 'tecla' + (m ? ' m-' + m : '');
    });
  }

  // Toque curto digita, toque longo marca
  let segurando = null, segurou = false;
  teclado.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('[data-letra]'); if (!b) return;
    segurou = false;
    segurando = setTimeout(() => { segurou = true; ciclarTecla(b.dataset.letra); }, 450);
  });
  const soltar = () => clearTimeout(segurando);
  teclado.addEventListener('pointerup', soltar);
  teclado.addEventListener('pointercancel', soltar);
  teclado.addEventListener('pointerleave', soltar);
  teclado.addEventListener('contextmenu', (e) => e.preventDefault());
  teclado.addEventListener('click', (e) => {
    const b = e.target.closest('.tecla'); if (!b) return;
    if (b.dataset.letra) { if (segurou) { segurou = false; return; } digitar(b.dataset.letra); }
    else if (b.dataset.acao === 'apagar') apagar();
    else if (b.dataset.acao === 'enviar') enviar();
  });

  // Teclado físico (para testar no computador)
  document.addEventListener('keydown', (e) => {
    if (document.querySelector('dialog[open]') || e.metaKey || e.ctrlKey) return;
    if (e.key === 'Enter') { e.preventDefault(); enviar(); }
    else if (e.key === 'Backspace') apagar();
    else if (e.key === 'ArrowLeft') moverCursor(Math.max(0, Math.min(E.cursor, N) - 1));
    else if (e.key === 'ArrowRight') moverCursor(Math.min(N - 1, E.cursor + 1));
    else if (/^[a-zA-ZçÇ]$/.test(e.key)) digitar(J.normalizar(e.key));
  });

  grade.addEventListener('click', (e) => {
    const b = e.target.closest('.letra'); if (!b) return;
    b.blur();
    const r = +b.dataset.r, c = +b.dataset.c;
    // Linha que ela está escrevendo: o toque escolhe onde vai a próxima letra
    if (!E.fim && r === E.palpites.length) return moverCursor(c);
    if (E.palpites[r]) ciclarLadrilho(J.normalizar(E.palpites[r].palavra)[c], c);
  });

  // ---------- Jogada ----------
  // Próxima casa vazia: primeiro para a direita, depois volta ao começo. N se a linha está cheia.
  function proximaVazia(de) {
    for (let i = de; i < N; i++) if (!E.atual[i]) return i;
    for (let i = 0; i < de; i++) if (!E.atual[i]) return i;
    return N;
  }
  function moverCursor(c) {
    if (E.fim) return;
    E.cursor = c; salvar(); desenharLinha(E.palpites.length);
  }
  function digitar(l) {
    if (E.fim) return;
    let pos = E.cursor < N ? E.cursor : proximaVazia(0);
    if (pos >= N) return;
    E.atual[pos] = l;
    E.cursor = proximaVazia(pos + 1);
    salvar(); desenharLinha(E.palpites.length);
    grade.children[E.palpites.length].children[pos].classList.add('nova');
  }
  function apagar() {
    if (E.fim) return;
    if (E.cursor < N && E.atual[E.cursor]) E.atual[E.cursor] = '';
    else {
      // Casa vazia (ou linha cheia): apaga a letra à esquerda
      const pos = Math.min(E.cursor, N) - 1;
      if (pos < 0) return;
      E.atual[pos] = ''; E.cursor = pos;
    }
    salvar(); desenharLinha(E.palpites.length);
  }
  function enviar() {
    if (E.fim) return;
    if (E.atual.some((l) => !l)) return erro('Faltam letras');
    const v = J.validar(E.atual.join(''));
    if (!v.ok) return erro(v.erro);
    if (E.palpites.some((p) => J.normalizar(p.palavra) === J.normalizar(v.palavra))) return erro('Você já tentou essa');
    const r = J.pontuar(v.palavra, E.secreta);
    const p = { palavra: v.palavra, ...r };
    E.palpites.push(p); E.atual = Array(N).fill(''); E.cursor = 0;
    anotarObvio(p);
    const linha = E.palpites.length - 1;
    if (r.verdes === N) {
      E.fim = 'ganhou';
      J.normalizar(p.palavra).split('').forEach((l, i) => { E.marcasPos[i] = l; E.marcasLetra[l] = 'existe'; });
    } else if (E.palpites.length >= MAX) E.fim = 'perdeu';
    salvar();
    if (E.fim) registrarResultado();
    desenharLinha(linha, true);
    if (!E.fim) desenharLinha(linha + 1);
    atualizarBotoes();
    setTimeout(desenhar, N * 110 + 700); // reflete marcas novas em todas as linhas
    if (E.fim) setTimeout(mostrarFim, N * 110 + 900);
  }
  function erro(msg) {
    const linha = grade.children[E.palpites.length];
    linha.classList.remove('treme'); void linha.offsetWidth; linha.classList.add('treme');
    aviso(msg);
  }
  let avisoTimer;
  function aviso(msg, ms = 1800) {
    const a = $('aviso'); a.textContent = msg; a.classList.add('mostra');
    clearTimeout(avisoTimer); avisoTimer = setTimeout(() => a.classList.remove('mostra'), ms);
  }

  function mostrarFim() {
    const ganhou = E.fim === 'ganhou';
    const n = E.palpites.length;
    $('fim-titulo').textContent = ganhou ? 'Parabéns, Sonia!' : 'Não foi dessa vez';
    $('fim-palavra').textContent = J.validar(E.secreta).palavra;
    $('fim-texto').textContent = ganhou
      ? (n === 1 ? 'Acertou de primeira!' : `Você acertou em ${n} tentativas.`) + ' Amanhã tem palavra nova.'
      : 'Amanhã tem palavra nova.';
    desenharNumeros($('fim-numeros'));
    abrir($('fim'));
  }

  // ---------- Botões ----------
  function atualizarBotoes() {
    $('btn-dica').disabled = !!E.fim || E.palpites.length === 0;
  }
  $('btn-dica').addEventListener('click', () => {
    if (!E.palpites.length) return aviso('Faça um palpite primeiro');
    const d = J.dica(E.palpites.map((p) => ({ palpite: p.palavra, verdes: p.verdes, amarelas: p.amarelas })), E.secreta);
    if (!d) return aviso('Você já tem tudo para acertar!', 2600);
    E.atual = J.normalizar(d).split(''); E.cursor = N; salvar();
    desenharLinha(E.palpites.length);
    aviso('Uma palavra que combina com as pistas', 2400);
  });
  $('btn-limpar').addEventListener('click', () => {
    if (!Object.keys(E.marcasLetra).length && !E.marcasPos.some(Boolean)) return aviso('Nenhuma marca para apagar');
    $('confirma').returnValue = ''; abrir($('confirma'));
  });
  $('confirma').addEventListener('close', () => {
    if ($('confirma').returnValue !== 'sim') return;
    E.marcasLetra = {}; E.marcasPos = Array(N).fill(null);
    if (E.fim === 'ganhou') J.normalizar(E.palpites.at(-1).palavra).split('').forEach((l, i) => { E.marcasPos[i] = l; });
    salvar(); desenhar();
  });
  $('btn-ajuda').addEventListener('click', () => abrir($('ajuda')));
  $('btn-numeros').addEventListener('click', () => { desenharNumeros($('numeros-corpo')); abrir($('numeros')); });
  $('btn-tema').addEventListener('click', () => {
    const raiz = document.documentElement;
    const agora = raiz.dataset.tema || (matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro');
    const novo = agora === 'escuro' ? 'claro' : 'escuro';
    raiz.dataset.tema = novo;
    try { localStorage.setItem('sonia500:tema', novo); } catch (e) {}
  });
  // Fechar janela tocando fora
  document.querySelectorAll('dialog').forEach((d) => d.addEventListener('click', (e) => { if (e.target === d) d.close(); }));

  // Abre a janela no topo, sem foco piscando no botão
  function abrir(d) { d.showModal(); d.scrollTop = 0; if (document.activeElement) document.activeElement.blur(); }

  // ---------- Início ----------
  function desenhar() { for (let r = 0; r < MAX; r++) desenharLinha(r); desenharTeclado(); atualizarBotoes(); }
  montarGrade(); montarTeclado(); desenhar();
  try {
    if (!localStorage.getItem('sonia500:viu-ajuda')) { abrir($('ajuda')); localStorage.setItem('sonia500:viu-ajuda', '1'); }
  } catch (e) {}
  if (E.fim) { registrarResultado(); setTimeout(mostrarFim, 300); }
  // Virou o dia com o app aberto: começa a partida nova
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && E.dia !== J.numeroDoDia()) { E = novaPartida(); salvar(); desenhar(); }
  });
})();

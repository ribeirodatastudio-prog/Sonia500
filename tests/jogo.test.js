const test = require('node:test');
const assert = require('node:assert');
const J = require('../docs/jogo.js');
const { SECRETAS } = require('../docs/palavras.js');

test('exemplo do manual: STARE com 0 verdes, 2 amarelas, 3 vermelhas', () => {
  // CARGO tem A e R, mas em outras posições, e não tem S, T, E
  assert.deepStrictEqual(J.pontuar('STARE', 'CARGO'), { verdes: 0, amarelas: 2, vermelhas: 3 });
});

test('acerto total', () => {
  assert.deepStrictEqual(J.pontuar('TEMPO', 'TEMPO'), { verdes: 5, amarelas: 0, vermelhas: 0 });
});

test('acentos e cedilha não contam', () => {
  assert.deepStrictEqual(J.pontuar('SAUDE', 'SAÚDE'), { verdes: 5, amarelas: 0, vermelhas: 0 });
  assert.deepStrictEqual(J.pontuar('braco', 'BRAÇO'), { verdes: 5, amarelas: 0, vermelhas: 0 });
});

test('letra repetida no palpite conta só uma vez', () => {
  // secreta TEMPO tem um O; palpite OOOOO -> 1 verde (posição 5), resto vermelho
  assert.deepStrictEqual(J.pontuar('OOOOO', 'TEMPO'), { verdes: 1, amarelas: 0, vermelhas: 4 });
  // R e A batem no lugar certo (posições 4 e 5) e consomem as únicas R e A de FEIRA
  assert.deepStrictEqual(J.pontuar('ARARA', 'FEIRA'), { verdes: 2, amarelas: 0, vermelhas: 3 });
  // último A é verde; um dos R vira amarelo (PORTA tem um R); os outros A e R são vermelhos
  assert.deepStrictEqual(J.pontuar('ARARA', 'PORTA'), { verdes: 1, amarelas: 1, vermelhas: 3 });
});

test('validação aceita sem acento e devolve a grafia certa', () => {
  assert.deepStrictEqual(J.validar('saude'), { ok: true, palavra: 'SAÚDE' });
  assert.deepStrictEqual(J.validar('braco'), { ok: true, palavra: 'BRAÇO' });
  assert.strictEqual(J.validar('xxxxx').ok, false);
  assert.strictEqual(J.validar('casa').erro, 'Faltam letras');
  assert.strictEqual(J.validar('casaco').erro, 'Letras demais');
  assert.deepStrictEqual(J.validar(' tempo '), { ok: true, palavra: 'TEMPO' });
});

test('secretas: 5 letras, sem repetir letra, sem K W Y, todas aceitas', () => {
  for (const s of SECRETAS) {
    const n = J.normalizar(s);
    assert.strictEqual(n.length, 5, s);
    assert.strictEqual(new Set(n).size, 5, s);
    assert.ok(!/[KWY]/.test(n), s);
    assert.ok(J.validar(s).ok, s);
  }
});

test('palavra do dia é estável e muda a cada dia', () => {
  const a = J.palavraDoDia(new Date(2026, 10, 9, 8));
  const b = J.palavraDoDia(new Date(2026, 10, 9, 23));
  const c = J.palavraDoDia(new Date(2026, 10, 10, 1));
  assert.strictEqual(a, b);
  assert.notStrictEqual(a, c);
  assert.strictEqual(J.numeroDoDia(new Date(2026, 10, 1)), 0);
});

test('duas palavras por dia, sem repetir antes de esgotar a lista', () => {
  const dias = Math.floor(J.total / 2);
  const vistas = new Set();
  for (let i = 0; i < dias; i++) {
    const d = new Date(2026, 10, 1 + i);
    const a = J.palavraDoDia(d, 1), b = J.palavraDoDia(d, 2);
    assert.notStrictEqual(a, b);
    vistas.add(a); vistas.add(b);
  }
  assert.strictEqual(vistas.size, dias * 2);
});

test('palavra 1 continua igual à palavra do dia de antes', () => {
  assert.strictEqual(J.palavraDoDia(new Date(2026, 10, 9)), 'SADIO');
  assert.strictEqual(J.palavraDoDia(new Date(2026, 10, 9), 1), 'SADIO');
});

test('dica bate com as pistas, não repete palpite e nunca é a secreta', () => {
  for (let rodada = 0; rodada < 50; rodada++) {
    const secreta = J.palavraAleatoria();
    const hist = ['TEMPO', 'BRASA', 'FUNIL'].map((p) => ({ palpite: p, ...J.pontuar(p, secreta) }));
    const d = J.dica(hist, secreta);
    if (d === null) continue; // só sobrou a secreta: sem dica
    for (const h of hist) {
      const r = J.pontuar(h.palpite, d);
      assert.strictEqual(r.verdes, h.verdes); assert.strictEqual(r.amarelas, h.amarelas);
    }
    assert.ok(!['TEMPO', 'BRASA', 'FUNIL'].includes(J.normalizar(d)));
    assert.notStrictEqual(J.normalizar(d), J.normalizar(secreta));
  }
});

test('dica não é sempre a mesma palavra', () => {
  const hist = [{ palpite: 'TEMPO', ...J.pontuar('TEMPO', 'LISTA') }];
  const vistas = new Set();
  for (let i = 0; i < 30; i++) vistas.add(J.dica(hist, 'LISTA'));
  assert.ok(vistas.size > 1);
});

test('sem palpites não há dica', () => {
  assert.strictEqual(J.dica([], 'LISTA'), null);
});

test('Ñ continua sendo letra própria; Ç e acentos não', () => {
  assert.strictEqual(J.normalizar('niño'), 'NIÑO');
  assert.strictEqual(J.normalizar('Maçã'), 'MACA');
  assert.strictEqual(J.normalizar('árbol'), 'ARBOL');
  assert.deepStrictEqual(J.pontuar('NIÑOS', 'NINOS'), { verdes: 4, amarelas: 0, vermelhas: 1 });
});

test('Venecia500: secretas em espanhol válidas', () => {
  const ES = require('../docs/venecia/palavras.js');
  const aceitas = new Set(ES.ACEITAS.split(' ').map((x) => x.split(':')[0]));
  assert.ok(ES.SECRETAS.length >= 600);
  for (const s of ES.SECRETAS) {
    const n = J.normalizar(s);
    assert.strictEqual(n.length, 5, s);
    assert.strictEqual(new Set(n).size, 5, s);
    assert.ok(aceitas.has(n), s);
  }
  assert.strictEqual(new Set(ES.SECRETAS.map(J.normalizar)).size, ES.SECRETAS.length);
});

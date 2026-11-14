# Sonia500

Jogo de palavras no estilo Word500/Palavra500, feito para a Sonia jogar no iPhone. Uma palavra de 5 letras por dia, 8 tentativas. Depois de cada palpite, o jogo mostra só quantas letras estão no lugar certo, quantas estão em outro lugar e quantas não estão na palavra.

## Estrutura

- `docs/` — o app (é o que o GitHub Pages publica)
  - `index.html`, `style.css`, `ui.js` — interface
  - `jogo.js` — lógica do jogo, sem interface
  - `palavras.js` — listas de palavras (gerado, não editar)
  - `manifest.json`, `sw.js`, `icones/` — instalação na tela inicial e uso sem internet
- `tests/` — testes da lógica (`npm test`)
- `tools/` — scripts que geram as listas de palavras; `bloqueadas.txt` tem as palavras que nunca serão a do dia

## Publicar uma versão nova

1. Altere os arquivos em `docs/`.
2. Em `docs/sw.js`, troque `sonia500-v1` por `sonia500-v2` (e assim por diante). Sem isso, o iPhone continua usando a versão guardada.
3. Envie para o GitHub. O app atualiza na próxima vez que ela abrir com internet.

## Venecia500 (espanhol)

Mesmo jogo em espanhol, em `docs/venecia/` (endereço: `/Sonia500/venecia/`). Usa o mesmo `jogo.js`, `ui.js` e `style.css`; o que muda fica em `docs/venecia/config.js` (textos, teclado com Ñ, nome) e `docs/venecia/palavras.js`.

- Ao mudar arquivos compartilhados (`jogo.js`, `ui.js`, `style.css`), troque a versão nos **dois** `sw.js`.
- Palavras: frequência de uso do OpenSubtitles (`hermitdave/FrequencyWords`) + dicionário `an-array-of-spanish-words` (MIT). Comandos no topo de `tools/es/build_palabras.py`; bloqueios em `tools/es/bloqueadas_es.txt`.
- No espanhol o Ñ é uma letra própria; os acentos não contam.
- Modo infinito (`infinito: true` no `config.js`): uma palavra atrás da outra, sem limite por dia. Uma volta inteira passa por todas as palavras sem repetir; a volta seguinte vem embaralhada de outro jeito.

## Palavras

Fonte: lista pública `fserb/pt-br` (a mesma liberada pelo criador do Termo). Para mudar as palavras do dia, edite `tools/bloqueadas.txt` e rode os comandos no topo de `tools/build_palavras.py`.

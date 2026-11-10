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

## Palavras

Fonte: lista pública `fserb/pt-br` (a mesma liberada pelo criador do Termo). Para mudar as palavras do dia, edite `tools/bloqueadas.txt` e rode os comandos no topo de `tools/build_palavras.py`.

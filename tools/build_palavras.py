# Gera docs/palavras.js a partir de tools/raw.json + tools/bloqueadas.txt
# Uso (na pasta do projeto):
#   git clone --depth 1 https://github.com/fserb/pt-br.git
#   python3 tools/build_lists.py pt-br tools/raw.json
#   python3 tools/build_secretas.py tools/raw.json tools/bloqueadas.txt 900 tools/secretas5.json
#   python3 tools/build_palavras.py
import json, unicodedata

def norm(w):
    return ''.join(c for c in unicodedata.normalize('NFD', w) if unicodedata.category(c) != 'Mn').upper()

raw = json.load(open('tools/raw.json', encoding='utf8'))
sec = json.load(open('tools/secretas5.json', encoding='utf8'))[:900]
aceitas = raw['5']['aceitas']  # chave sem acento -> grafia mais comum
for w in sec:
    aceitas[norm(w)] = w

itens = []
for k in sorted(aceitas):
    w = aceitas[k]
    itens.append(k if w.upper() == k else k + ':' + w.upper())

js = "// Gerado por tools/build_palavras.py — não editar à mão. Para mudar as secretas, edite tools/bloqueadas.txt e rode de novo.\n"
js += "var SECRETAS = " + json.dumps([w.upper() for w in sec], ensure_ascii=False) + ";\n"
js += "var ACEITAS = " + json.dumps(' '.join(itens), ensure_ascii=False) + ";\n"
js += "if (typeof module !== 'undefined') module.exports = { SECRETAS, ACEITAS };\n"
open('docs/palavras.js', 'w', encoding='utf8').write(js)
print(len(sec), 'secretas,', len(itens), 'aceitas')

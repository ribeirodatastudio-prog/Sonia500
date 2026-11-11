# Gera docs/venecia/palavras.js (espanhol).
# Fontes: hermitdave/FrequencyWords (OpenSubtitles 2018, es_full.txt) e o pacote npm an-array-of-spanish-words@2.0.0 (MIT).
# Uso, na pasta do projeto:
#   python3 tools/es/candidatas.py <es_full.txt> <index.json> tools/es/raw_es.json
#   python3 tools/es/secretas_es.py tools/es/raw_es.json tools/es/bloqueadas_es.txt 680 tools/es/secretas_es.json
#   python3 tools/es/build_palabras.py <index.json>
import json, sys, unicodedata
def norm(w):
    w = w.upper().replace('Ñ', '\0')
    w = ''.join(c for c in unicodedata.normalize('NFD', w) if unicodedata.category(c) != 'Mn')
    return w.replace('\0', 'Ñ')
raw = json.load(open('tools/es/raw_es.json', encoding='utf8'))
sec = json.load(open('tools/es/secretas_es.json', encoding='utf8'))
dic = {norm(w) for w in json.load(open(sys.argv[1], encoding='utf8')) if len(norm(w)) == 5}
dic = {k for k in dic if all(c in 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ' for c in k)}
aceitas = {k: raw['forma'].get(k, k) for k in dic}
for w in sec: aceitas[norm(w)] = w
itens = [k if aceitas[k] == k else k + ':' + aceitas[k] for k in sorted(aceitas)]
js = "// Gerado por tools/es/build_palabras.py — não editar à mão.\n"
js += "var SECRETAS = " + json.dumps(sec, ensure_ascii=False) + ";\n"
js += "var ACEITAS = " + json.dumps(' '.join(itens), ensure_ascii=False) + ";\n"
js += "if (typeof module !== 'undefined') module.exports = { SECRETAS, ACEITAS };\n"
open('docs/venecia/palavras.js', 'w', encoding='utf8').write(js)
print(len(sec), 'secretas,', len(itens), 'aceitas')

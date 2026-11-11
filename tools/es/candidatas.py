# Lê frequência (OpenSubtitles) + dicionário (an-array-of-spanish-words) e lista candidatas a palavra secreta
import json, sys, unicodedata
freq_path, dic_path, out = sys.argv[1:4]
def norm(w):
    # tira acentos mas mantém Ñ
    w = w.upper().replace('Ñ', '\0')
    w = ''.join(c for c in unicodedata.normalize('NFD', w) if unicodedata.category(c) != 'Mn')
    return w.replace('\0', 'Ñ')
dic = set(norm(w) for w in json.load(open(dic_path, encoding='utf8')))
forma, cont = {}, {}
for linha in open(freq_path, encoding='utf8'):
    p = linha.split()
    if len(p) != 2: continue
    w, c = p[0], int(p[1])
    k = norm(w)
    if len(k) != 5 or not k.isalpha() or k not in dic: continue
    if not all(ch in 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ' for ch in k): continue
    if k not in forma or c > cont[k]: forma[k], cont[k] = w.upper(), c
ranking = sorted(forma, key=lambda k: -cont[k])
cands = [k for k in ranking if len(set(k)) == 5 and not set(k) & set('KW') and not k.endswith('S')]
json.dump({'forma': forma, 'cont': cont, 'cands': cands}, open(out, 'w', encoding='utf8'), ensure_ascii=False)
print(len(dic), 'no dicionário;', len(forma), 'de 5 letras com frequência;', len(cands), 'candidatas')

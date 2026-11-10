import sys, unicodedata, json, re
src = sys.argv[1]; out = sys.argv[2]
def norm(w):
    w = unicodedata.normalize('NFD', w)
    return ''.join(c for c in w if unicodedata.category(c) != 'Mn').upper()
ok = re.compile(r'^[A-Z]+$')
lex = [l.strip() for l in open(f'{src}/lexico', encoding='utf8') if l.strip()]
conj = [l.strip() for l in open(f'{src}/conjugações', encoding='utf8') if l.strip()]
neg = {norm(l.strip()) for l in open(f'{src}/listas/negativas', encoding='utf8') if l.strip()}
icf = {}
for l in open(f'{src}/icf', encoding='utf8'):
    w, s = l.rsplit(',', 1); icf[w] = float(s)

def build(n, n_secret):
    # aceitas: tudo que tem n letras, chave normalizada -> forma acentuada mais comum
    accept = {}
    for w in lex + conj:
        k = norm(w)
        if len(k) != n or not ok.match(k): continue
        best = accept.get(k)
        if best is None or icf.get(w, 99) < icf.get(best, 99): accept[k] = w
    # secretas: so lexico (forma de dicionario), letras distintas, sem K W Y, sem palavrao, mais comuns
    cands = []
    for w in set(lex):
        k = norm(w)
        if len(k) != n or not ok.match(k): continue
        if len(set(k)) != n or set(k) & set('KWY') or k in neg: continue
        if w not in icf: continue
        cands.append((icf[w], w))
    cands.sort()
    secret = [w for _, w in cands[:n_secret]]
    return accept, secret

data = {}
for n, ns in [(5, 2000), (6, 2000)]:
    a, s = build(n, ns)
    data[n] = {'secretas': s, 'aceitas': a}
    print(n, 'aceitas', len(a), 'secretas', len(s), 'ex:', s[:15], s[-10:])
json.dump({str(k): v for k, v in data.items()}, open(out, 'w', encoding='utf8'), ensure_ascii=False)

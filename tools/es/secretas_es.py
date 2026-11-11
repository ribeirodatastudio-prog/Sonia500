import json, sys, unicodedata
raw, bloq_path, n, out = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4]
d = json.load(open(raw, encoding='utf8'))
def norm(w):
    w = w.upper().replace('Ñ', '\0')
    w = ''.join(c for c in unicodedata.normalize('NFD', w) if unicodedata.category(c) != 'Mn')
    return w.replace('\0', 'Ñ')
txt = open(bloq_path, encoding='utf8').read().split('\n', 1)[1]
bloq = {norm(w) for w in txt.split()}
def verbo_provavel(k, f):
    if f.endswith(('Ó', 'É', 'Í', 'Á', 'ÍA', 'ÍAN')): return True            # pretérito / futuro / imperfecto
    if k.endswith('N') and not f.endswith('ÓN') and k not in ('JOVEN', 'ORDEN'): return True  # hacen, dicen...
    if k.endswith('D') and k not in ('SALUD', 'PARED'): return True           # mirad, venid...
    if k.endswith('R') and k[-2] in 'AEI' and k not in ('MEJOR', 'LUGAR', 'MAYOR', 'MENOR', 'COLOR', 'CALOR', 'VALOR', 'HUMOR', 'LÍDER', 'TEMOR', 'TUMOR', 'LICOR', 'LÁSER', 'NIVEL', 'HOGAR', 'SEÑOR', 'FAVOR', 'SABOR', 'VAPOR', 'ACTOR', 'AUTOR', 'DÓLAR', 'SOLAR', 'LUNAR', 'PESAR', 'AZÚCAR'.upper()):
        return False  # infinitivos ficam (estar, comer, salir) — o filtro é só para formas conjugadas
    return False
out_l = []
for k in d['cands']:
    f = d['forma'][k]
    if k in bloq or verbo_provavel(k, f): continue
    out_l.append(f)
    if len(out_l) == n: break
json.dump(out_l, open(out, 'w', encoding='utf8'), ensure_ascii=False)
print(len(out_l)); print(' '.join(out_l[500:]))

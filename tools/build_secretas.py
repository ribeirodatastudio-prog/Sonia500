import json, re, sys
d = json.load(open(sys.argv[1], encoding='utf8'))
bloq = set(open(sys.argv[2], encoding='utf8').read().split('\n',1)[1].split())
N = int(sys.argv[3])
s = [w for w in d['5']['secretas']
     if re.search('[aeiouãõáéíóúâêôrslzm]$', w) and not re.search('[ãõ][^aeo]|^h|sh|th|ph|ck|ll$', w)
     and w not in bloq][:N]
print(len(s), s[-15:], file=sys.stderr)
json.dump(s, open(sys.argv[4], 'w', encoding='utf8'), ensure_ascii=False)

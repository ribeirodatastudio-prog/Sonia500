# Junta tudo num arquivo só, para pré-visualizar como artifact
import re
a='docs/'
html=open(a+'index.html',encoding='utf8').read()
body=html[html.index('<body>')+6:html.index('</body>')]
body=re.sub(r'<script src="([^"]+)"></script>', lambda m:'<script>\n'+open(a+m.group(1),encoding='utf8').read()+'\n</script>', body)
css=open(a+'style.css',encoding='utf8').read().replace('height: 100dvh;','height: 100%;')
out=f'''<title>Sonia500</title>
<style>
{css}
</style>
<script>try {{ const t = localStorage.getItem('sonia500:tema'); if (t === 'claro' || t === 'escuro') document.documentElement.dataset.tema = t; }} catch (e) {{}}</script>
{body}'''
open('preview/sonia500.html','w',encoding='utf8').write(out)
print(len(out))

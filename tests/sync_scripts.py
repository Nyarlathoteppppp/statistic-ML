"""Regenerate the <script> tags for data/lectures/*.js in index.html (between markers)."""
import os, re, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = os.path.join(root, 'index.html'); s = open(p).read()
files = ['data/lectures/_lib.js'] + sorted('data/lectures/' + f for f in os.listdir(os.path.join(root, 'data/lectures')) if re.fullmatch(r'L\d\d\.js', f)) \
    + sorted('data/chapters/' + f for f in os.listdir(os.path.join(root, 'data/chapters')) if re.fullmatch(r'w\d\d\.js', f))
block = '<!-- lectures:start -->\n' + '\n'.join('<script src="%s"></script>' % f for f in files) + '\n<!-- lectures:end -->'
if '<!-- lectures:start -->' in s:
    s = re.sub(r'<!-- lectures:start -->.*?<!-- lectures:end -->', block, s, flags=re.S)
else:
    s = s.replace('<script src="data/formulas.js"></script>', block + '\n<script src="data/formulas.js"></script>')
vfiles = sorted('js/viz/' + f for f in os.listdir(os.path.join(root, 'js/viz')) if re.fullmatch(r'w\d\d\.js', f))
vblock = '<!-- wviz:start -->\n' + '\n'.join('<script src="%s"></script>' % f for f in vfiles) + '\n<!-- wviz:end -->'
if '<!-- wviz:start -->' in s:
    s = re.sub(r'<!-- wviz:start -->.*?<!-- wviz:end -->', vblock, s, flags=re.S)
else:
    s = s.replace('<script src="js/viz/w01.js"></script>', vblock)
open(p, 'w').write(s); print(len(files) - 1, 'lectures linked,', len(vfiles), 'week viz')

"""Flag single-backslash escapes like \\b \\m \\f inside '...' JS strings (they silently eat TeX backslashes)."""
import re, sys, glob
bad = 0
for fn in sys.argv[1:]:
    src = open(fn).read()
    i = 0; n = len(src); line = 1
    while i < n:
        c = src[i]
        if c == '\n': line += 1; i += 1; continue
        if c == '/' and src[i:i+2] == '//':  # line comment
            j = src.find('\n', i); i = n if j < 0 else j; continue
        if c == '/' and src[i:i+2] == '/*':
            j = src.find('*/', i + 2); line += src[i:j].count('\n'); i = j + 2; continue
        if c == '`':  # template literal (String.raw content is fine) - skip, honouring ${...} roughly
            j = i + 1
            while j < n and src[j] != '`':
                if src[j] == '\\': j += 2; continue
                j += 1
            line += src[i:j].count('\n'); i = j + 1; continue
        if c in "'\"":
            q = c; j = i + 1
            while j < n and src[j] != q and src[j] != '\n':
                if src[j] == '\\':
                    e = src[j+1]
                    if e.isalpha() and e not in 'nu':
                        print('%s:%d: suspicious escape \\%s in %s' % (fn, line, e, src[i:min(j+30, n)].replace('\n', ' ')[:90])); bad += 1
                    j += 2; continue
                j += 1
            i = j + 1; continue
        i += 1
print('suspicious escapes:', bad)

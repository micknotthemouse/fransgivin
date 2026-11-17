#!/usr/bin/env python3
"""Concatenate the src/ parts into ONE self-contained ../index.html (inline <style> and <script>).

Usage:  python3 src/build.py [--endpoint https://script.google.com/macros/s/.../exec]

Order: head.html, <style>style.css</style>, body.html, <script> ENDPOINT line, dedupe.js, art.js,
sound.js, fx.js, rest of core.js </script>. Standard library only.
"""
import argparse
import json
import os
import re
import sys

SRC = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(SRC), 'index.html')
PLACEHOLDER = 'const ENDPOINT = ""; /* @@ENDPOINT@@ */'
JS_PARTS = ['dedupe.js', 'art.js', 'sound.js', 'fx.js']


def read(name):
    with open(os.path.join(SRC, name), encoding='utf-8') as f:
        return f.read()


def check_inline(name, text, closer):
    if re.search(r'</' + closer, text, re.I):
        sys.exit('build: %s contains "</%s", which would end the inline block early' % (name, closer))


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--endpoint', default='', help='Apps Script /exec URL to bake in (default: empty = not live / demo)')
    args = ap.parse_args()

    endpoint = args.endpoint.strip()
    if endpoint and not re.fullmatch(r'https://[A-Za-z0-9._~:/?#@!$&()*+,;=%-]+', endpoint):
        sys.exit('build: --endpoint must be a plain https:// URL')

    head = read('head.html')
    css = read('style.css')
    body = read('body.html')
    check_inline('style.css', css, 'style')

    core = read('core.js')
    first, _, core_rest = core.partition('\n')
    if first.strip() != PLACEHOLDER:
        sys.exit('build: the first line of core.js must be exactly: ' + PLACEHOLDER)
    endpoint_line = PLACEHOLDER
    if endpoint:
        endpoint_line = 'const ENDPOINT = %s; /* @@ENDPOINT@@ */' % json.dumps(endpoint).replace('</', '<\\/')

    js = [endpoint_line]
    for name in JS_PARTS:
        part = read(name)
        check_inline(name, part, 'script')
        js.append('/* ---- %s ---- */\n%s' % (name, part.rstrip()))
    check_inline('core.js', core_rest, 'script')
    js.append('/* ---- core.js ---- */\n' + core_rest.rstrip())

    html = (
        head.rstrip() + '\n'
        + '<style>\n' + css.rstrip() + '\n</style>\n</head>\n'
        + body.rstrip() + '\n'
        + '<script>\n' + '\n'.join(js) + '\n</script>\n</body>\n</html>\n'
    )
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(html)
    size = len(html.encode('utf-8'))
    print('wrote %s (%d bytes, %.1f KB)%s' % (OUT, size, size / 1024.0, ' with endpoint' if endpoint else ''))


if __name__ == '__main__':
    main()

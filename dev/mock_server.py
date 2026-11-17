#!/usr/bin/env python3
"""Local dev server: serves index.html and mimics the Apps Script protocol at /api.

Run:  python3 dev/mock_server.py [port]      (default 8765)
Then set the endpoint in index.html, or open http://localhost:8765/?api=http://localhost:8765/api
Behaviors copied from Apps Script: GET ?action=list, POST text/plain JSON (add/remove),
~700ms latency, retry-safe adds, tokens never returned, CORS open.
Add ?fail=1 to /api to force a server error, for testing the retry UI.
"""
import json, os, sys, time, re, threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCK = threading.Lock()
ROWS = []  # {id,name,dish,category,note,createdAt,token,removed}
CATS = ['Main/Ham', 'Sides', 'Apps', 'Desserts', 'Booze', 'Other']
LATENCY = 0.7


def clean(v, n):
    s = re.sub(r'\s+', ' ', re.sub(r'[\x00-\x1f\x7f]', ' ', str(v or ''))).strip()
    return s[:n]


def public(r):
    return {k: r[k] for k in ('id', 'name', 'dish', 'category', 'note', 'createdAt')}


class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def send_json(self, obj, code=200):
        data = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(data)))
        self.cors()
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        self.send_response(204)
        self.cors()
        self.end_headers()

    def do_GET(self):
        u = urlparse(self.path)
        if u.path == '/api':
            q = parse_qs(u.query)
            time.sleep(LATENCY)
            if q.get('fail'):
                return self.send_json({'ok': False, 'error': 'server_error'})
            with LOCK:
                rows = [public(r) for r in ROWS if not r['removed']]
            return self.send_json({'ok': True, 'count': len(rows), 'dishes': rows})
        return super().do_GET()

    def do_POST(self):
        u = urlparse(self.path)
        if u.path != '/api':
            return self.send_json({'ok': False, 'error': 'not_found'}, 404)
        n = int(self.headers.get('Content-Length') or 0)
        try:
            b = json.loads(self.rfile.read(n) or b'{}')
        except Exception:
            return self.send_json({'ok': False, 'error': 'bad_request'})
        time.sleep(LATENCY)
        if parse_qs(u.query).get('fail'):
            return self.send_json({'ok': False, 'error': 'server_error'})
        with LOCK:
            if b.get('action') == 'add':
                rid, tok = str(b.get('id', '')), str(b.get('token', ''))
                if not re.fullmatch(r'[A-Za-z0-9_-]{6,40}', rid):
                    return self.send_json({'ok': False, 'error': 'bad_id'})
                if not re.fullmatch(r'[A-Za-z0-9_-]{8,64}', tok):
                    return self.send_json({'ok': False, 'error': 'bad_token'})
                for r in ROWS:
                    if r['id'] == rid:
                        return self.send_json({'ok': True, 'duplicate': True, 'dish': public(r)})
                name, dish = clean(b.get('name'), 40), clean(b.get('dish'), 80)
                if not name:
                    return self.send_json({'ok': False, 'error': 'missing_fields'})
                if b.get('hp'):
                    return self.send_json({'ok': True, 'dish': {'id': rid, 'name': name, 'dish': dish}})
                live = [r for r in ROWS if not r['removed']]
                if len(ROWS) >= 150 or sum(1 for r in live if r['token'] == tok) >= 12:
                    return self.send_json({'ok': False, 'error': 'full'})
                row = {'id': rid, 'name': name, 'dish': dish,
                       'category': b.get('category') if b.get('category') in CATS else 'Other',
                       'note': clean(b.get('note'), 120),
                       'createdAt': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                       'token': tok, 'removed': False}
                ROWS.append(row)
                return self.send_json({'ok': True, 'dish': public(row)})
            if b.get('action') == 'remove':
                for r in ROWS:
                    if r['id'] == str(b.get('id')):
                        if r['token'] != str(b.get('token')):
                            return self.send_json({'ok': False, 'error': 'not_yours'})
                        r['removed'] = True
                        return self.send_json({'ok': True})
                return self.send_json({'ok': True, 'missing': True})
        return self.send_json({'ok': False, 'error': 'unknown_action'})

    def log_message(self, *a):
        pass


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    print('Serving on http://localhost:%d  (api at /api)' % port, flush=True)
    ThreadingHTTPServer(('127.0.0.1', port), H).serve_forever()

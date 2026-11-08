"""Compare page-1 product order between live and the new storefront (default sort).

Usage: python -X utf8 tools/seo-diff/plp_order_diff.py /shop/ /shop/category/vanity/ ...
Live order: product links of the Elementor loop on the live HTML, in document order.
New order: GET {CMS}/api/storefront/v1/... (same listing the page renders).
"""
import json
import re
import sys
import urllib.request
from urllib.parse import unquote

CMS = 'https://cms-new.banovit.com/api/storefront/v1'
UA = 'Mozilla/5.0 (banovit-new order-diff)'


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60).read().decode('utf-8', 'ignore')


def live_order(path):
    h = get('https://banovit.com' + path)
    out = []
    for m in re.finditer(r'href="https://banovit\.com/shop/([^/"?#]+)/"', h):
        slug = unquote(m.group(1)).lower()
        if slug in ('category', 'tag', 'page') or slug in out:
            continue
        out.append(slug)
    return out


def new_order(path):
    if path == '/shop/':
        api = CMS + '/products'
    else:
        api = CMS + '/categories/' + path.removeprefix('/shop/category/').strip('/') + '/products'
    return [c['slug'] for c in json.loads(get(api))['data']]


for path in sys.argv[1:] or ['/shop/']:
    new = new_order(path)
    live_all = live_order(path)[: len(new)]
    missing = [s for s in live_all if s not in new]  # on live page 1 but not in the CMS catalog yet
    live = [s for s in live_all if s in new]
    new_cmp = [s for s in new if s in live_all]
    same = sum(1 for a, b in zip(live, new_cmp) if a == b)
    print(f'{path}: {same}/{len(live)} common products in the same relative order; live-only (not in CMS): {len(missing)}')
    if missing:
        print('  live-only:', ', '.join(missing))
    for i, (a, b) in enumerate(zip(live, new_cmp)):
        if a != b:
            print(f'  #{i + 1}: live={a}  new={b}')

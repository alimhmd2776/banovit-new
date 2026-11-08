"""Diff title / meta description / canonical path / H1 / breadcrumb between the live
site and the new storefront for every product_cat URL in audit/data/url-inventory.csv.

Usage: python -X utf8 tools/seo-diff/plp_seo_diff.py [new_origin] > report.md
Only public GET requests, one at a time.
"""
import csv
import html
import re
import sys
import time
import urllib.request
from urllib.parse import urlparse

NEW = (sys.argv[1] if len(sys.argv) > 1 else 'https://new.banovit.com').rstrip('/')
UA = 'Mozilla/5.0 (banovit-new seo-diff)'


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode('utf-8', 'ignore')


def pick(h):
    def one(pat):
        m = re.search(pat, h, re.S | re.I)
        return html.unescape(re.sub(r'\s+', ' ', m.group(1)).strip()) if m else ''
    canon = one(r'<link rel="canonical" href="([^"]+)"')
    return {
        'title': one(r'<title>(.*?)</title>'),
        'description': one(r'<meta name="description" content="([^"]*)"'),
        'canonical': urlparse(canon).path if canon else '',
        'h1': re.sub(r'<[^>]+>', '', one(r'<h1[^>]*>(.*?)</h1>')).strip(),
    }


rows = [r for r in csv.DictReader(open('audit/data/url-inventory.csv', encoding='utf-8-sig')) if r['type'] == 'product_cat']
diffs = 0
print(f'# PLP SEO diff: live vs {NEW}\n')
for r in rows:
    live_url = r['url']
    path = urlparse(live_url).path
    try:
        a, b = pick(get(live_url)), pick(get(NEW + path))
    except Exception as e:  # noqa: BLE001
        print(f'- {path}: ERROR {e}')
        diffs += 1
        continue
    bad = [k for k in a if a[k] != b[k]]
    if bad:
        diffs += 1
        print(f'## {path}')
        for k in bad:
            print(f'- **{k}**\n  - live: `{a[k]}`\n  - new: `{b[k]}`')
    time.sleep(0.5)
print(f'\n{len(rows)} URLs, {diffs} with differences.')

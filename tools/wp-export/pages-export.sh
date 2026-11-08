#!/usr/bin/env bash
# Read-only export of all published WordPress pages (content + Yoast head) from the public REST API.
# Usage: tools/wp-export/pages-export.sh [https://banovit.com] > pages.json
set -euo pipefail
SITE="${1:-https://banovit.com}"
FIELDS="id,slug,link,title,content,excerpt,date,date_gmt,modified,parent,menu_order,template,yoast_head_json"
UA="Mozilla/5.0 (banovit-export)"
page=1; out="["
while :; do
  body=$(curl -fsS -A "$UA" -D /tmp/wp-pages-headers "$SITE/wp-json/wp/v2/pages?per_page=100&page=$page&status=publish&_fields=$FIELDS")
  total=$(grep -i '^x-wp-totalpages:' /tmp/wp-pages-headers | tr -dc '0-9')
  chunk="${body#[}"; chunk="${chunk%]}"
  [ -n "$chunk" ] && out="$out${out:+$([ "$out" = "[" ] || echo ,)}$chunk"
  [ "$page" -ge "${total:-1}" ] && break
  page=$((page+1))
done
echo "$out]"

# usage: bash reval.sh [tag ...]   (default tag: products). Revalidates Next.js cache tags; does NOT write DEPLOYED.log.
cd ~/banovit-new
TAGS=${*:-products}; B=$(python3 -c "import json,sys;print(json.dumps({'tags':sys.argv[1:]}))" $TAGS)
S=$(grep ^REVALIDATE_SECRET secrets/web.env | cut -d= -f2- | tr -d '"'); SIG=$(printf "%s" "$B" | openssl dgst -sha256 -hmac "$S" -hex | awk '{print $NF}')
curl -s -X POST -H "content-type: application/json" -H "x-signature: $SIG" -d "$B" http://127.0.0.1:8110/api/revalidate/; echo

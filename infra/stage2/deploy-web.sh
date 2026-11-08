# usage: deploy-web.sh <sha> <thread-label>   (run inside: flock ~/banovit-new/.deploy.lock)
set -euo pipefail
cd ~/banovit-new; SHA=$1; WHO=${2:-architecture}; TS=$(date -u +%Y%m%d-%H%M%S)
[ -f web-$SHA.tgz ] || { echo "missing web-$SHA.tgz"; exit 2; }
mkdir -p state; CUR=$(cat state/web_sha 2>/dev/null || echo none)
if [ "${EXPECT_PREV:-}" != "$CUR" ] && [ "${FORCE_DEPLOY:-}" != "1" ]; then echo "ABORT: deployed web is $CUR; re-check that $SHA contains it (git merge-base --is-ancestor $CUR $SHA) and pass EXPECT_PREV=$CUR"; exit 3; fi
rm -rf web-app.new && mkdir web-app.new && tar -xzf web-$SHA.tgz -C web-app.new
cp -r web-app/node_modules/@img/sharp-linuxmusl-x64 web-app/node_modules/@img/sharp-libvips-linuxmusl-x64 web-app.new/node_modules/@img/
mkdir -p web-app.new/apps/web/.next/cache
sudo mv web-app backups/web-app-before-$SHA-$TS && mv web-app.new web-app
sudo chown -R colleague:colleague web-app
docker compose up -d --force-recreate web 2>&1 | tail -1; sleep 6; docker compose ps web --format '{{.Status}}'
for u in / /shop/ /blog/ /cart/; do printf "%s %s\n" "$u" "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8110$u)"; done
echo $SHA > state/web_sha; echo "$(date -u +%Y-%m-%dT%H:%MZ) | $WHO | $SHA (develop) | unchanged | none (scripts/deploy-web.sh)" >> DEPLOYED.log; tail -1 DEPLOYED.log

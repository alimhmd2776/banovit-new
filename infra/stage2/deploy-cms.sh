# usage (inside flock): bash deploy-cms.sh <sha> <thread>   needs ~/banovit-new/cms-<sha>.tar
set -euo pipefail
cd ~/banovit-new; C=$1; WHO=${2:-architecture}; TS=$(date -u +%Y%m%d-%H%M%S)
[ -f cms-$C.tar ] || { echo "missing cms-$C.tar"; exit 2; }
mkdir -p state; CUR=$(cat state/cms_sha 2>/dev/null || echo none)
if [ "${EXPECT_PREV:-}" != "$CUR" ] && [ "${FORCE_DEPLOY:-}" != "1" ]; then echo "ABORT: deployed cms is $CUR; re-check that $C contains it (git merge-base --is-ancestor $CUR $C) and pass EXPECT_PREV=$CUR"; exit 3; fi
docker compose exec -T cms-db sh -c 'mariadb-dump -uroot -p"$MARIADB_ROOT_PASSWORD" --single-transaction --routines --triggers new_cms' | gzip > backups/new_cms-before-$C-$TS.sql.gz; gzip -t backups/new_cms-before-$C-$TS.sql.gz
sudo tar -czf backups/cms-src-before-$C-$TS.tgz --exclude=cms-src/vendor --exclude=cms-src/storage cms-src
sudo tar -xf cms-$C.tar -C cms-src
sudo chown -R colleague:colleague cms-src && sudo chown -R 33:33 cms-src/storage cms-src/bootstrap/cache cms-src/vendor
A="docker compose exec -T -u www-data -e HOME=/tmp cms"
$A composer install --no-dev -o --no-interaction 2>&1 | tail -1
MIG=$($A php artisan migrate --force 2>&1 | grep -oE "20[0-9]{2}_[0-9_]+[a-z_0-9]+|Nothing to migrate" | tr '\n' ' '); echo "migrate: $MIG"
$A php artisan config:cache >/dev/null; $A php artisan route:cache >/dev/null 2>&1 || $A php artisan route:clear
docker compose restart cms >/dev/null 2>&1; sleep 3
if [ "${SKIP_SPA:-}" != "1" ]; then
D=~/spa-build-$C; rm -rf $D; mkdir -p $D; tar -xf cms-$C.tar -C $D admin-app supplier-app
for app in admin-app supplier-app; do
  docker run --rm -m 1500m -u $(id -u):$(id -g) -e HOME=/tmp -v $D/$app:/app -w /app docker.arvancloud.ir/library/node:24-alpine sh -c "npm ci --no-audit --no-fund >/tmp/ci.log 2>&1 || (tail -3 /tmp/ci.log; exit 1); npx vite build 2>&1 | grep -E 'assets/index-.*\.(js|css)'"
done
tar -czf backups/public-spas-before-$C-$TS.tgz cms-src/public/panel cms-src/public/supplier-app
rm -rf cms-src/public/panel cms-src/public/supplier-app
cp -r $D/admin-app/dist cms-src/public/panel; cp -r $D/supplier-app/dist cms-src/public/supplier-app; rm -rf $D
else echo "SKIP_SPA=1: panels not rebuilt"; fi
for u in /panel/ /supplier-app/; do printf "%s %s\n" $u "$(curl -s -o /dev/null -w '%{http_code}' -H 'Host: cms-new.banovit.com' http://127.0.0.1:8111$u)"; done
echo $C > state/cms_sha; echo "$(date -u +%Y-%m-%dT%H:%MZ) | $WHO | unchanged | $C (integration/storefront) | migrate: $MIG; SPAs $([ "${SKIP_SPA:-}" = 1 ] && echo skipped || echo rebuilt) (deploy-cms.sh); backup new_cms-before-$C-$TS" >> DEPLOYED.log; tail -1 DEPLOYED.log

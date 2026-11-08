# /etc/nginx/sites-available/supplier-new.banovit.com  (then: ln -s ../sites-available/... sites-enabled/; certbot --nginx -d supplier-new.banovit.com)
server {
    listen 80;
    server_name supplier-new.banovit.com;
    add_header X-Robots-Tag "noindex, nofollow, noarchive, nosnippet" always;
    # robots.txt reachable without basic auth so crawlers see Disallow
    location = /robots.txt { auth_basic off; default_type text/plain; return 200 "User-agent: *\nDisallow: /\n"; }
    client_max_body_size 50m;
    # The supplier panel is banovit-cms's supplier-app SPA (built with base
    # /supplier-app/, API under /api/supplier), served by the cms-new
    # container — same as cms.banovit.com/supplier-app on live. The bare
    # domain lands on it.
    location = / { return 302 /supplier-app/; }
    location / {
        proxy_pass http://127.0.0.1:8111;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

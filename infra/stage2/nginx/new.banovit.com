# /etc/nginx/sites-available/new.banovit.com  (then: ln -s ../sites-available/... sites-enabled/; certbot --nginx -d new.banovit.com)
server {
    listen 80;
    server_name new.banovit.com;
    add_header X-Robots-Tag "noindex, nofollow" always;
    auth_basic "banovit new";                       # same htpasswd as test2
    auth_basic_user_file /etc/nginx/banovit-clones.htpasswd;
    client_max_body_size 50m;
    location / {
        proxy_pass http://127.0.0.1:8110;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

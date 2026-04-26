#!/bin/bash
# Deploy The Fiber Dad website
# Run as root or with sudo

set -e

SITE_DIR="/var/www/thefiberdad"
NGINX_CONF="/etc/nginx/sites-available/thefiberdad"

echo "==> Creating web root..."
mkdir -p "$SITE_DIR"

echo "==> Copying site files..."
cp -r /root/website/* "$SITE_DIR/"
chown -R www-data:www-data "$SITE_DIR"
chmod -R 755 "$SITE_DIR"

echo "==> Installing nginx config..."
cp /root/website/nginx.conf "$NGINX_CONF"
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/thefiberdad

# Remove default site if present
rm -f /etc/nginx/sites-enabled/default

echo "==> Testing nginx config..."
nginx -t

echo "==> Reloading nginx..."
systemctl reload nginx

echo ""
echo "✓ Site deployed to $SITE_DIR"
echo "✓ Accessible at http://thefiberdad.com"
echo ""
echo "Next step — get HTTPS (free):"
echo "  apt install certbot python3-certbot-nginx -y"
echo "  certbot --nginx -d thefiberdad.com -d www.thefiberdad.com"

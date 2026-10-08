#!/bin/bash
set -e

echo "▶ Caching config..."
php artisan config:cache
php artisan route:cache

echo "▶ Running migrations..."
php artisan migrate --force

echo "▶ Seeding database..."
php artisan db:seed --force

echo "✅ Starting Apache..."
apache2-foreground

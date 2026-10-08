#!/bin/bash
set -e

echo "▶ Caching config..."
php artisan config:clear
php artisan config:cache
php artisan route:cache

echo "▶ Running migrations (fresh)..."
php artisan migrate:fresh --force

echo "▶ Seeding database..."
php artisan db:seed --force

echo "✅ Starting Apache..."
apache2-foreground

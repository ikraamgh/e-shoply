#!/bin/bash
set -e

echo "▶ Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

echo "▶ Caching config..."
php artisan config:cache
php artisan route:cache

echo "▶ Running migrations..."
php artisan migrate --force

echo "▶ Seeding database..."
php artisan db:seed --force

echo "✅ Deploy complete!"

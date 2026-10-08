# e-Shoply

Full-stack e-commerce app built with **React + Vite** (frontend) and **Laravel** (backend API).

## Structure

```
e-shoply/
├── shoply-frontend/   # React + Vite + TanStack Router + Tailwind CSS
└── shoply-backend/    # Laravel 11 REST API + Sanctum Auth + SQLite
```

## Quick Start

### Backend
```bash
cd shoply-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000
```

### Frontend
```bash
cd shoply-frontend
npm install
npm run dev
```

## Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Customer | alex@shoply.dev | password |
| Admin | admin@shoply.dev | admin123 |

## API Base URL
`http://localhost:8000/api/v1`

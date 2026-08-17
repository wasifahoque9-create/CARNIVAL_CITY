# ShopSphere

ShopSphere is a single-vendor **gadget and electronics e-commerce platform** built per the ShopSphere SRS. It includes a Laravel REST API backend and a Next.js storefront with an admin console.

## Tech Stack

| Layer | Technology | Version (scaffolded) |
|-------|------------|----------------------|
| Backend | Laravel | 13.x (v13.16.1) |
| Frontend | Next.js (App Router, TypeScript) | 16.x (v16.2.9) |
| Database | MySQL (SQLite supported for local dev) | — |
| Auth | Laravel Sanctum (Bearer tokens) | v4.3 |

**Environment tested with:** PHP 8.5.0, Node.js v24.x, npm 11.x

## Project Structure

```
ShopSphere/
├── backend/     # Laravel API
├── frontend/    # Next.js storefront + admin
└── README.md
```

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env   
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

API runs at **http://localhost:8000**

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local  
npm install
npm run dev
```


Storefront runs at **http://localhost:3000**

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shopsphere.com | password |
| Customer | customer@shopsphere.com | password |

## Gadget Categories

Laptop · PC · Desktop · Mobile · Earbuds · Other Accessories

The database is seeded with **36 products** (6 per category) including gadget-specific specifications and color variants for select categories.

## Color Scheme

| Role | Hex | Usage |
|------|-----|-------|
| Primary (Navy) | `#121358` | Header, footer, sidebar, primary buttons |
| Secondary (Amber) | `#F59E0B` | CTAs, price highlights, badges |
| Base (White) | `#FFFFFF` | Page and card backgrounds |

## API Endpoints (SRS D.6)

| Domain | Base Path |
|--------|-----------|
| Auth | `/api/auth` |
| Users | `/api/users` |
| Products | `/api/products` |
| Categories | `/api/categories` |
| Cart | `/api/cart` |
| Orders | `/api/orders` |
| Payments | `/api/payments` |
| Reviews | `/api/reviews` |
| Admin dashboard | `/api/admin/dashboard` |

## Frontend Pages

**Storefront:** Home, category listing, product detail, search, cart, checkout, auth, profile, orders

**Admin:** Dashboard, products, categories, orders, review moderation

## Assumptions

1. **Database:** SQLite is the default for local development (already configured). For MySQL, set `DB_CONNECTION=mysql` and credentials in `backend/.env`.
2. **Payment gateway:** Online payments use a stub `PaymentGatewayService`; COD is fully implemented. Architecture is pluggable for Stripe/SSLCommerz/bKash later.
3. **Email:** `MAIL_MAILER=log` writes notifications to `storage/logs/laravel.log` in local dev.
4. **Product images:** Seeder uses placeholder paths; the UI falls back to a local SVG when images are missing.
5. **Email verification:** Register returns a token immediately; verification link is logged via the mail driver. Confirm with `POST /api/auth/verify-email` using `{ id, hash }`.
6. **Product routes:** Products resolve by slug or numeric ID for better storefront URLs.

## Business Rules Enforced

- **BR-01** Empty cart cannot checkout
- **BR-02** Stock decremented on confirmation, restored on cancel
- **BR-03** Customer cancel only before shipment
- **BR-04** One review per product per customer (delivered orders only)
- **BR-05** COD confirms without upfront payment; gateway requires successful stub payment
- **BR-06** Checkout requires authentication

## License

MIT (default Laravel/Next.js scaffold licenses apply to respective parts)

# AC Shop — Frontend

A modern e-commerce web application built with Vue 3, featuring multi-role authentication (Admin, Owner, Customer), product browsing, cart management, and Stripe-powered checkout.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Options API) |
| UI Components | Element Plus |
| HTTP Client | Axios |
| Routing | Vue Router 4 |
| Payments | Stripe.js |
| Auth | JWT (stored in localStorage) |
| Build Tool | Vite |
| Deployment | GitHub Actions → AWS EC2 + Nginx |

## Features

- **Customer** — Browse shops, search products, manage cart, checkout with Stripe
- **Owner** — Create and manage your shop, upload products with images
- **Admin** — Manage all users and shops with delete controls

## Getting Started

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- A running instance of the [AC Shop backend](https://github.com/your-org/acShop-backend) on port `8080`

### Install & Run

```bash
npm install
npm run dev
```

App runs at `http://localhost:7000` (proxied to backend at `localhost:8080`).

### Build for Production

```bash
npm run build
```

Output goes to `dist/`.

## Project Structure

```
src/
├── assets/          # Static assets (logo, CSS)
├── router/          # Vue Router configuration
├── utils/           # Axios request instance
└── views/
    ├── LoginView.vue       # Auth page
    ├── UserView.vue        # Customer: browse shops
    ├── ShopDetailView.vue  # Customer: shop products + cart
    ├── CartDetailView.vue  # Customer: cart review
    ├── PaymentView.vue     # Customer: Stripe checkout
    ├── OrdersView.vue      # Customer: order history
    ├── OwnerView.vue       # Owner: manage products & shop
    └── AdminView.vue       # Admin: manage users & shops
```

## Environment & Configuration

The Vite dev server proxies `/api` to `http://localhost:8080`. See `vite.config.js` for the proxy setup.

For production, Nginx proxies `/api/` to the backend. See `nginx.conf` for the full server config.

## Deployment

Pushes to `main` automatically trigger a GitHub Actions workflow that:

1. Installs dependencies and builds the app
2. rsync's `dist/` to `/usr/share/nginx/html/` on the EC2 instance
3. Reloads Nginx

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `EC2_HOST` | Public IP or hostname of the EC2 instance |
| `EC2_USER` | SSH username (e.g. `ec2-user`) |
| `EC2_SSH_KEY` | Private key for SSH access |

## Nginx

The `nginx.conf` at the repo root is the recommended server config. It handles:

- Vue Router history mode (`try_files`)
- API reverse proxy to the Spring Boot backend
- Static asset caching (1 year)
- `client_max_body_size 10M` for image uploads

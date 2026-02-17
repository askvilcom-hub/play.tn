# Play.tn

E-commerce platform for gaming, toys, and play products in Tunisia.

## Architecture

Monorepo with 4 applications:

| App | Tech | Port | Description |
|-----|------|------|-------------|
| `storefront` | Next.js 14 (App Router) | 3000 | Customer-facing storefront with SSR/SEO |
| `admin` | React + Bootstrap | 3001 | Admin dashboard for managing products, orders, etc. |
| `user-api` | Express.js + Firebase | 4001 | Public API for storefront (products, cart, orders, auth) |
| `admin-api` | Express.js + Firebase | 4002 | Admin API (CRUD products, categories, blog, coupons, etc.) |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture diagrams and data models.

## Prerequisites

- Node.js >= 20
- npm >= 10
- Firebase project with Firestore enabled
- Firebase service account key (for local development)

## Setup

```bash
# Install all dependencies
npm install

# Copy environment files
cp apps/user-api/.env.example apps/user-api/.env
cp apps/admin-api/.env.example apps/admin-api/.env
cp apps/storefront/.env.example apps/storefront/.env
cp apps/admin/.env.example apps/admin/.env

# Configure your Firebase credentials in each .env file
```

### Environment Variables

**user-api / admin-api:**
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Path to service account JSON file
- `PORT` - Server port (4001 / 4002)

**storefront:**
- `NEXT_PUBLIC_API_URL` - User API URL (default: `http://localhost:4001`)
- `NEXT_PUBLIC_FIREBASE_*` - Firebase client config for auth

**admin:**
- `VITE_API_URL` - Admin API URL (default: `http://localhost:4002`)
- `VITE_FIREBASE_*` - Firebase client config for auth

## Development

```bash
# Run individual apps
npm run dev:storefront    # http://localhost:3000
npm run dev:admin         # http://localhost:3001
npm run dev:user-api      # http://localhost:4001
npm run dev:admin-api     # http://localhost:4002
```

## Build

```bash
# Build all apps
npm run build:all

# Build individual apps
npm run build:storefront
npm run build:admin
npm run build:user-api
npm run build:admin-api
```

## Testing

```bash
npm test                  # Run all tests
npm run test:storefront   # Storefront tests
npm run test:user-api     # User API tests
npm run test:admin-api    # Admin API tests
```

## Project Structure

```
play.tn/
├── apps/
│   ├── storefront/       # Next.js customer storefront
│   ├── admin/            # React admin dashboard
│   ├── user-api/         # Express public API
│   └── admin-api/        # Express admin API
├── packages/             # Shared packages
├── docs/                 # Architecture docs
└── package.json          # Root workspace config
```

## Key Features

- **Storefront:** Product catalog, search, cart, checkout, user accounts, blog, SEO-optimized
- **Admin:** Product/category/order/coupon management, dashboard analytics, blog editor, audit logs
- **APIs:** Firebase Auth (JWT + RBAC), Firestore database, image upload to Cloud Storage
- **Infrastructure:** Designed for Google Cloud Run with Cloud CDN

## License

Private - All rights reserved.

# ShopEZ - Full Stack E-Commerce Platform

A modern, production-ready e-commerce platform built with React, TypeScript, Supabase (PostgreSQL + Edge Functions), and Tailwind CSS.

## Features

### User Features
- Browse products with search, filter, and pagination
- Product detail pages with image gallery and quantity selector
- Shopping cart with real-time billing breakdown (GST, shipping, discounts)
- Checkout with shipping address and order placement
- Order history with expandable details
- Wishlist management
- User profile with address management
- Guest cart (localStorage) merged on login

### Admin Features
- Dashboard with revenue, orders, products, users stats
- Product CRUD with image URLs, categories, pricing
- Category management
- Order status management (pending, processing, shipped, delivered, cancelled)
- User listing
- Banner management for homepage carousel
- Analytics with Chart.js (monthly revenue bar chart, order status pie chart, top products)

### Cart Bug Fix (Critical)
- `POST /api/cart` saves item AND returns full populated cart array with product data
- `CartContext` uses `useReducer` + `SET_CART` action
- Navbar cart count, Cart page, and Checkout all read from the same `CartContext`
- Every cart mutation (POST/PUT/DELETE) dispatches `SET_CART` with API response
- Guest cart stored in localStorage, merged with DB cart on login
- Debug logging: `console.log("Cart API response:", data)` and `console.log("Cart state updated:", state.items.length)`

### Billing Calculation
- Subtotal = sum(price * quantity)
- Discount = sum((price - discountPrice) * quantity)
- Tax = Subtotal * 18% (GST India)
- Shipping = ₹40 if Subtotal < ₹500, else FREE
- Grand Total = Subtotal - Discount + Tax + Shipping
- Live updates when quantity changes

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, React Router DOM, Chart.js, Lucide React Icons
- **Backend**: Supabase Edge Functions (Deno runtime)
- **Database**: Supabase PostgreSQL with Row Level Security
- **Auth**: Supabase Auth (email/password)

## Project Structure

```
src/
  components/       # Navbar, Footer, ProductCard, BillingBreakdown, LoadingSpinner
  context/          # AuthContext, CartContext, WishlistContext, ToastContext
  lib/              # Supabase client
  pages/            # Home, Login, Register, Products, ProductDetail, Cart, Checkout, Orders, Profile, Wishlist
  pages/admin/      # AdminLayout, Dashboard, Products, Categories, Orders, Users, Banners, Analytics
  services/         # API service layer (productApi, cartApi, orderApi, etc.)
  utils/            # Billing calculations, price formatting

supabase/
  functions/shop-api/  # Edge function (all REST API endpoints)
  seed.sql             # Sample data
```

## Database Schema

- **profiles** - User profiles (auto-created on signup via trigger)
- **categories** - Product categories with images
- **products** - Products with pricing, images, stock, ratings
- **reviews** - Product reviews
- **cart_items** - Per-user cart (user_id + product_id unique)
- **orders** - Orders with billing breakdown (subtotal, discount, tax, shipping, grand_total)
- **order_items** - Order line items
- **wishlist_items** - User wishlist
- **banners** - Homepage carousel banners

## API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/products` | GET, POST | List (with search/filter/pagination) or create |
| `/products/:id` | GET, PUT, DELETE | Get, update, or delete product |
| `/cart` | GET, POST | Get cart or add item (returns full populated cart) |
| `/cart/:id` | PUT, DELETE | Update quantity or remove item (returns full populated cart) |
| `/orders` | GET, POST | List orders or place order |
| `/orders/:id` | GET | Get order detail |
| `/categories` | GET, POST | List or create categories |
| `/categories/:id` | PUT, DELETE | Update or delete category |
| `/banners` | GET, POST | List or create banners |
| `/banners/:id` | PUT, DELETE | Update or delete banner |
| `/wishlist` | GET, POST | List or add wishlist item |
| `/wishlist/:id` | DELETE | Remove wishlist item |
| `/profile` | GET, PUT | Get or update user profile |
| `/admin/dashboard` | GET | Dashboard analytics |
| `/admin/users` | GET | List users |
| `/admin/orders` | GET | List all orders |
| `/admin/orders/:id` | PUT | Update order status |

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shopez-dev/shopez-ecommerce.git
cd shopez-ecommerce
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

### Setting Up the Database

1. Run the Supabase migrations (in order) via the Supabase dashboard SQL editor
2. Run `supabase/seed.sql` to populate sample data

### Creating an Admin User

1. Register a normal user through the app
2. In Supabase SQL editor, update their role:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repo to Vercel
2. Set environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
3. Deploy

### Backend (Supabase)
- Edge functions and database are already hosted on Supabase
- Deploy edge function: `supabase functions deploy shop-api`

## License

MIT

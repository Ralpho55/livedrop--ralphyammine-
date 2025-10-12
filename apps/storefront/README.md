# Storefront v1

Storefront v1 is a fully functional and documented e-commerce prototype built with **React 18**, **Vite**, **TailwindCSS**, and **Zustand**.  
It completes the full journey — *Catalog → Product → Cart → Checkout → Order Status* — and integrates a local **Support Assistant** powered by a simple keyword engine.

---

## Features

- 🧱 **Catalog** — search, sort, and filter products from `mock-catalog.json`
- 📄 **Product Details** — related items by shared tags + stock indicator
- 🛒 **Persistent Cart** — Zustand + localStorage for state persistence
- 💳 **Checkout Stub** — generates fake order IDs and redirects to `/order/:id`
- 📦 **Order Status** — shows mock API order progress (Placed → Delivered)
- 💬 **Ask Support Panel** — local Q&A engine using `ground-truth.json`
- 🧪 **Vitest + Storybook** — automated tests and visual component docs

---

## Tech Stack

| Layer | Library |
|-------|----------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | TailwindCSS |
| State Management | Zustand (persist middleware) |
| Testing | Vitest + React Testing Library + Storybook Chromium runner |
| Docs | Storybook 9 |

---

##  Setup & Run

```bash
pnpm install
pnpm dev          # start local dev server
pnpm build        # build production bundle
pnpm test         # run Vitest + Storybook tests
pnpm storybook    # launch Storybook UI at http://localhost:6006

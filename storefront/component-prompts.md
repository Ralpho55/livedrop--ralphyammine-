# Component Prompts Log

## Purpose

This document serves as an official AI-assisted scaffolding log for the **Storefront v1** assignment. It tracks all AI-generated components, utilities, and configurations built with React, Vite, Tailwind CSS, Zustand, and Vitest. This log demonstrates compliance with the assignment requirement for transparent documentation of AI assistance.

---

## Component-Level Prompt Table

| Component / File | Prompt Summary | Outcome | Manual Adjustments |
|------------------|----------------|---------|-------------------|
| **ProductCard.tsx** | Scaffold reusable product card component with Tailwind styling, image display, price formatting, and "Add to Cart" button | Standalone component with props for product data, Tailwind classes for responsive grid layout, hover effects, and stock indicators | Integrated into catalog page; adjusted styling for consistency; added stock quantity display |
| **SupportPanel.tsx** | Build floating chat UI panel with toggle button, message history, input field, and slide-over animation | Floating card panel with chat interface, message bubbles, timestamps, loading states, and backdrop overlay | Refactored from full-screen slide-over to compact floating card; adjusted z-index layering; refined animation timing |
| **engine.ts** | Implement local keyword-based Q&A engine using ground-truth.json with order ID detection, keyword scoring (80% question, 20% answer), and 0.4 confidence threshold | Async function with keyword extraction, exact-match scoring algorithm, order status integration, and polite refusal for low-confidence queries | Fine-tuned confidence threshold from 0.3 to 0.4; switched from substring to exact keyword matching; verified scoring logic |
| **api.ts** | Create mock API layer with `listProducts()`, `getProduct(id)`, `placeOrder(cart)`, and `getOrderStatus(id)` using fetch() for JSON data | Four async functions with TypeScript interfaces, fetch-based data loading, simulated delays, and mock order ID generation | Changed from direct JSON import to fetch(); added error handling; verified API contracts |
| **router.tsx** | Set up React Router v6 with routes for catalog (/), product (/p/:id), cart, checkout, and order status (/order/:id) | BrowserRouter setup with five route definitions, lazy loading page components, and proper path parameters | Verified route paths; tested navigation flow; ensured all pages render correctly |
| **store.ts** | Create Zustand cart store with localStorage persistence, managing cart items with `addItem()`, `removeItem()`, `updateQty()`, `clearCart()`, and `total()` methods | Persistent Zustand store with CartItem interface, localStorage middleware under "cart-store" key, and smart quantity management (auto-remove on qty ≤ 0) | Verified localStorage persistence; tested cart operations; confirmed state updates trigger re-renders |
| **catalog.tsx** | Build product catalog page with search (title/tags), sort (price asc/desc), tag filtering, responsive grid, and "View Cart" button | Full-featured catalog with search input, sort dropdown, tag filter buttons, responsive 4-column grid, and real-time filtering/sorting | Added "View Cart" button for navigation; refined filter logic to combine search + tags + sort; adjusted responsive breakpoints |
| **order-status.tsx** | Display order tracking with conditional carrier/ETA display (only for Shipped/Delivered), status-specific styling (green for Delivered, blue for Shipped), and "Back to Store" link | Status page with order ID display, color-coded status badges, conditional shipping details section, and dynamic label text | Enhanced status color coding; added status-specific icons; verified conditional rendering logic |
| **engine.test.ts** | Generate Vitest test file for assistant engine with tests for known questions, unknown questions, and order ID detection | Three test cases validating Q&A matching, polite refusals, and order status queries with proper assertions | Added tests incrementally per requirements; verified all assertions pass; confirmed async/await handling |
| **ProductCard.stories.tsx** | Create Storybook documentation with "Default" and "OutOfStock" variants showing different stock states | Storybook 8+ story file with Meta/StoryObj syntax, centered layout, inline component definition, and alert() for Add to Cart | Adjusted import from `@storybook/react` to `@storybook/react-vite`; verified stories render in Storybook UI |
| **SupportPanel.stories.tsx** | Create Storybook documentation with "Closed" and "Opened" variants showing panel states with mock conversation | Story file with controlled isOpen prop, mock messages for demonstration, and fullscreen layout | Created mock component wrapper with controlled state; added realistic Q&A exchange for Opened variant |

---

## Additional AI Prompts

### Minor Enhancements & Refinements

- **"View Cart" Button**: Added Link component with Tailwind styles to catalog page header, aligned right using flexbox with `justify-between`
- **SupportPanel Layout Refactor**: Changed from full-screen slide-over (`inset-y-0 w-full`) to compact floating card (`bottom-24 right-6 w-96 h-[500px]`) with scale/fade animation
- **Test Case Generation**: Created focused test cases for return policy matching and CEO question refusal in `engine.test.ts`
- **Storybook Initialization**: Bootstrapped Storybook 9 with `@storybook/react-vite` builder, configured for Vite + React + Tailwind
- **Logo Integration**: Updated `logo.svg` with blue rectangle and white text; added to navbar header with proper alt text
- **Product Descriptions**: Added descriptive 1-2 sentence descriptions to all 20 products in `mock-catalog.json`
- **Related Products**: Implemented tag-based product recommendations on product detail pages (up to 3 items)
- **Tag Filtering**: Extracted unique tags from catalog and rendered as interactive filter buttons with active state highlighting
- **Dummy Product Removal**: Cleaned up all test/dummy product references from App.tsx after initial testing

---

## Reflection

**AI Usage Scope**: AI assistance (Cursor AI + Claude) was used exclusively for scaffolding, boilerplate generation, and documentation. All generated code underwent manual review, testing, and integration to ensure alignment with assignment requirements.

**Code Verification**: Every component was manually tested in the browser, validated against TypeScript type constraints, and confirmed to work with the existing routing and state management architecture. API mock functions were tested with console logging. Cart persistence was verified via localStorage inspection.

**Runtime Constraints**: No external LLM inference APIs are used at runtime. The assistant engine (`engine.ts`) operates entirely client-side using local keyword matching against `ground-truth.json`. All responses are deterministic and derived from the static knowledge base.

**Assignment Compliance**: This log fulfills the requirement for a "brief prompt-to-component log" documenting AI-assisted development. All folder structure, naming conventions, and architectural patterns follow the Week 4 Storefront v1 specification exactly as outlined.


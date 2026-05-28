# Plan: localStorage → MERN Migration (FinanceFlow)

## Context

FinanceFlow is currently a pure client-side SPA that stores all data in `localStorage`. The goal is to migrate it to a full MERN stack: MongoDB for persistence, Express + Node.js on the server, and the existing React/TypeScript frontend refactored to call REST APIs instead of reading/writing `localStorage` directly.

Key decisions made before planning:
- **Auth**: Multi-user with JWT (email + password)
- **Server**: Replace the old `server/` directory (DishQuest legacy) with a clean FinanceFlow server
- **Data migration**: Start fresh — no localStorage migration
- **Deployment**: DigitalOcean droplet (Nginx reverse proxy + PM2)

---

## Step 1 — Rebuild `server/` as a Clean Express/TypeScript App

Delete all legacy DishQuest content from `server/`. Scaffold fresh:

### Files to create

**`server/package.json`**
Dependencies: `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `dotenv`, `cors`  
Dev dependencies: `typescript`, `tsx`, `@types/express`, `@types/node`, `@types/jsonwebtoken`, `@types/bcryptjs`, `@types/cors`  
Scripts: `dev` (tsx watch), `build` (tsc), `start` (node dist/server.js)

**`server/tsconfig.json`**  
Target: `ES2020`, module: `CommonJS`, outDir: `dist/`, rootDir: `src/`, strict: true

**`server/.env`** (update existing — keep `DB_USER`/`DB_PWD`, change database name, add new keys)
```
DB_USER=<existing>
DB_PWD=<existing>
DB_NAME=financeflow
JWT_SECRET=<generate a strong secret>
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
```

**`server/src/app.ts`**  
Express app setup: `cors` (allow `CLIENT_ORIGIN`), `express.json()`, mount all route groups, 404 handler.

**`server/src/server.ts`**  
Entry point: Connect Mongoose to Atlas (`mongodb+srv://${DB_USER}:${DB_PWD}@clustere31.bxve7.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`), then `app.listen(PORT)`.

---

## Step 2 — Mongoose Models (`server/src/models/`)

Each model includes `userId: ObjectId` (ref `User`) for multi-tenancy.

| File | Collection | Key fields |
|---|---|---|
| `User.ts` | `users` | `email` (unique, indexed), `passwordHash`, `createdAt` |
| `Transaction.ts` | `transactions` | `userId`, `date`, `description`, `amount`, `category`, `type`, `isRecurring`, `recurringId` |
| `RecurringTransaction.ts` | `recurringtransactions` | `userId`, `description`, `amount`, `category`, `type`, `frequency`, `startDate`, `endDate?`, `nextDueDate`, `isActive`, `lastGenerated?` |
| `BudgetCategory.ts` | `budgetcategories` | `userId`, `name`, `allocated`, `color`, `icon` |
| `MonthlySnapshot.ts` | `monthlysnapshots` | `userId`, `key` (e.g. `"2026-4"`), `month`, `year`, `income`, `expenses`, `balance`, `savingsRate`, `categoryBreakdowns[]`, `transactionCount`, `createdAt` — compound unique index on `(userId, key)` |
| `UserSettings.ts` | `usersettings` | `userId` (unique), `startingBalance`, `isInitialized` |

---

## Step 3 — Auth Middleware & Auth Routes (`server/src/`)

**`src/middleware/auth.ts`**  
Reads `Authorization: Bearer <token>` header → `jwt.verify()` → attaches `req.userId` (string). Returns 401 on missing/invalid token.

**`src/routes/auth.ts`** — Public routes (no auth middleware)
- `POST /api/auth/register` — hash password with `bcrypt`, create `User` + seed `UserSettings` (isInitialized: false) + seed 8 default `BudgetCategory` docs. Return `{ token, user: { id, email } }`.
- `POST /api/auth/login` — verify password, return JWT.
- `GET /api/auth/me` — (auth required) return current user info.

JWT payload: `{ userId, email }`, expiry: `7d`.

---

## Step 4 — Finance API Routes (`server/src/routes/`)

All routes below require the `auth` middleware. All queries are scoped to `req.userId`.

**`settings.ts`** → mounted at `/api/settings`
- `POST /initialize` — set `startingBalance`, `isInitialized: true` on `UserSettings`
- `PUT /balance` — update `startingBalance`
- `DELETE /reset` — delete all user's transactions, recurring, categories, snapshots; reset `UserSettings`
- `GET /state` — aggregate and return full `FinanceState` shape (settings + all collections) in one response. This is the primary "load everything" endpoint called on app mount.

**`transactions.ts`** → `/api/transactions`
- `POST /` — create transaction, update `UserSettings.startingBalance` (net delta)
- `DELETE /:id` — delete transaction, reverse balance delta

**`recurring.ts`** → `/api/recurring`
- `POST /` — create recurring transaction
- `PUT /:id` — update recurring transaction
- `DELETE /:id` — delete
- `PATCH /:id/toggle` — flip `isActive`
- `POST /:id/generate` — generate a one-time transaction from a recurring template (for the "mark as recurring" flow)

**`budgetCategories.ts`** → `/api/budget-categories`
- `GET /` — list all categories for user
- `POST /` — create category
- `PUT /:id` — update (if name changes, update matching `category` field on all user's transactions and recurring)
- `DELETE /:id` — delete category

**`history.ts`** → `/api/history`
- `GET /snapshots` — return all `MonthlySnapshot` docs for user
- `POST /snapshots` — upsert snapshot (replaces if `key` already exists for this user)

---

## Step 5 — Client API Service Layer (`client/src/lib/`)

Replace `finance-store.ts` and `history-store.ts` localStorage logic with HTTP calls.

**`client/src/lib/api.ts`** — Base fetch wrapper  
- Reads `VITE_API_URL` from env (defaults to `/api` in prod, `http://localhost:5000/api` in dev)
- Attaches `Authorization: Bearer <token>` from `localStorage.getItem('financeflow_token')`
- Throws structured errors on non-2xx responses

**`client/src/lib/auth-api.ts`**  
`register(email, password)`, `login(email, password)`, `getMe()`

**`client/src/lib/finance-api.ts`** — Replaces `finance-store.ts`  
`getFullState()`, `initializeApp(balance)`, `addTransaction(tx)`, `deleteTransaction(id)`, `addRecurring(r)`, `updateRecurring(id, updates)`, `deleteRecurring(id)`, `toggleRecurring(id)`, `addCategory(cat)`, `updateCategory(id, updates)`, `deleteCategory(id)`, `updateBalance(amount)`, `resetApp()`

**`client/src/lib/history-api.ts`** — Replaces `history-store.ts`  
`getSnapshots()`, `saveSnapshot(snapshot)`

Keep `localStorage` only for: `financeflow_token` (JWT), `financeflow_theme` (UI preference).  
Remove all `financeflow_data_v2`, `financeflow_history_v1`, `financeflow_initialized`, `financeflow_onboarding_complete` references.

---

## Step 6 — Client Auth Context & Pages

**`client/src/contexts/AuthContext.tsx`**  
- State: `user: { id, email } | null`, `isLoading: boolean`
- On mount: if token in localStorage, call `getMe()` to validate; set user or clear token
- `login(email, password)` — calls API, stores token, sets user
- `register(email, password)` — calls API, stores token, sets user
- `logout()` — clears token + user state, redirects to `/login`
- Export `useAuth()` hook

**`client/src/pages/Login.tsx`**  
Email + password form. Calls `useAuth().login()`. Redirects to `/` on success. Link to `/register`.

**`client/src/pages/Register.tsx`**  
Email + password form. Calls `useAuth().register()`. Redirects to `/` on success. Link to `/login`.

---

## Step 7 — Refactor `useFinance` and `useHistory` Hooks

**`client/src/hooks/useFinance.ts`**  
Replace synchronous localStorage reads with `async` API calls:
- On mount: call `getFullState()` → populate state (includes `isInitialized` flag from `UserSettings`)
- Add `isLoading: boolean` state for initial fetch
- All mutation methods (`createTransaction`, `editRecurring`, etc.) become `async` — call `finance-api.ts` functions, then re-fetch or optimistically update local state
- Forecast recalculation stays client-side (pure computation from recurring transactions — no change to the algorithm, just input data now comes from the API)

**`client/src/hooks/useHistory.ts`**  
- On mount: call `getSnapshots()` → populate state
- `takeSnapshot(financeState)` calls `saveSnapshot()` API

---

## Step 8 — Update Context, App, and Routing

**`client/src/contexts/FinanceContext.tsx`**  
Wrap existing providers with `AuthContext`. Pass `isLoading` down so components can show loading states.

**`client/src/App.tsx`**  
- Add `AuthProvider` wrapping the whole app
- Add routes: `/login` → `Login.tsx`, `/register` → `Register.tsx`
- Add `ProtectedRoute` component: if no authenticated user, redirect to `/login`
- Wrap all existing routes in `ProtectedRoute`
- The `OnboardingCarousel` (currently triggered by `isInitialized` flag) continues to work — it now checks `UserSettings.isInitialized` from the API response

---

## Step 9 — Client Environment & Vite Dev Proxy

**`client/.env.development`**
```
VITE_API_URL=http://localhost:5000/api
```

**`client/.env.production`**
```
VITE_API_URL=/api
```

**`client/vite.config.ts`** — Add dev proxy (optional, avoids CORS issues in dev):
```ts
server: {
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

---

## Step 10 — DigitalOcean Deployment Prep

**`server/ecosystem.config.js`** (PM2)
```js
module.exports = {
  apps: [{
    name: 'financeflow-api',
    script: 'dist/server.js',
    env_production: { NODE_ENV: 'production', PORT: 5000 }
  }]
}
```

**Nginx config** (on droplet): reverse-proxy `/api` to `localhost:5000`; serve the Vite build (`client/dist/`) as static files for all other routes.

**`client/package.json`** — confirm the existing `build` script produces `client/dist/` (Vite default).

**`.gitignore`** — ensure `server/.env` and `client/.env*.local` are ignored.

---

## Execution Order Summary

```
1. server/ — scaffold package.json, tsconfig, app.ts, server.ts
2. server/ — Mongoose models (6 files)
3. server/ — auth middleware + auth routes
4. server/ — finance API routes (5 route files)
5. client/ — api.ts, auth-api.ts, finance-api.ts, history-api.ts
6. client/ — AuthContext.tsx, Login.tsx, Register.tsx
7. client/ — refactor useFinance.ts and useHistory.ts
8. client/ — update FinanceContext.tsx and App.tsx
9. client/ — .env files + vite.config.ts proxy
10. server/ — PM2 config + deployment notes
```

---

## Verification

1. **Server smoke test**: `cd server && npm run dev` → `GET /api/auth/me` with no token returns 401
2. **Register flow**: `POST /api/auth/register` → returns JWT + seeds 8 default budget categories in MongoDB Atlas
3. **Login flow**: `POST /api/auth/login` → returns JWT
4. **Client dev**: `cd client && npm run dev` → app shows `/register` page (no auth)
5. **Onboarding**: Register → app shows `OnboardingCarousel` → set starting balance → `POST /api/settings/initialize` persists to MongoDB → navigates to Home
6. **CRUD roundtrip**: Add a transaction → verify it appears via `GET /api/settings/state` in browser network tab → refresh page → transaction still present (not from localStorage)
7. **Multi-user isolation**: Register two accounts, add data to each, confirm data is scoped by `userId` in MongoDB
8. **History snapshot**: Navigate to History page → previous month auto-snapshot posts to `/api/history/snapshots`
9. **Type check**: `cd client && npm run check` passes with no errors
10. **Production build**: `npm run build` in client produces `dist/` without errors

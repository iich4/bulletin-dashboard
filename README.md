# PERKESO Bulletin Dashboard

> Portal Pengetahuan & Komunikasi Dalaman (Internal Knowledge & Communication Portal)
> Dibangunkan oleh **IDEONIX Sdn Bhd** untuk **PERKESO (Pertubuhan Keselamatan Sosial)**.

A comprehensive internal bulletin dashboard built with Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Prisma + SQLite, Zustand, Recharts, and Framer Motion. Features a modern **glassmorphism UI** with PERKESO brand colors (#007DC5 blue / #8DC63E green) and IDEONIX accents (#002147 midnight / #FFBF00 amber).

## Features

### Modules (per BRS v1.0)
- **Mock Login** — role-based (Admin / Staff) with IDEONIX-branded glassmorphism login page
- **Dashboard** — stat cards, monthly trend area chart, SOP-by-department pie, recent announcements & circulars, quick links, analytics footer
- **Pengumuman** (Announcements) — category filter pills, search, pinned/new/urgent badges, detail modal with attachments, admin CRUD
- **Akta** (Acts) — filter by category & status, sortable table, document preview, admin CRUD
- **ASIP** — filter by status/category, cards with reference numbers, document preview, admin CRUD
- **SOP** — accordion list with procedure steps, department filter, version tracking, admin CRUD with dynamic step editor
- **Pekeliling** (Circulars) — mandatory badges, sort by date, category filter, admin CRUD
- **Soalan Lazim** (FAQ) — accordion list, category sidebar, internal search, admin CRUD
- **Global Search** — autosuggest dropdown, cross-module results with keyword highlighting (⌘K shortcut)
- **Notifications** — badge counter, type-color-coded dropdown (info/warning/success/critical), mark-as-read
- **Document Preview** — placeholder modal for PDF/DOCX with file info & disabled download (prototype)
- **Dark/Light Mode** — full theme support with PERKESO colors
- **Admin Panel** — content management grid + user management table with CRUD
- **Responsive** — mobile-first; sidebar collapses to hamburger drawer on mobile

### Architecture
- **Frontend**: Next.js 16 (App Router) + TypeScript 5 + Tailwind CSS 4 + shadcn/ui (New York)
- **State**: Zustand (auth + nav stores), TanStack Query-ready
- **Backend**: Next.js API routes (REST endpoints under `/api/*`)
- **Database**: Prisma ORM + **Supabase (PostgreSQL)** — real backend with seed data
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) ≥ 20
- [Bun](https://bun.sh/) (recommended) or npm/yarn/pnpm

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/iich4/bulletin-dashboard.git
cd bulletin-dashboard

# 2. Install dependencies
bun install   # or npm install / yarn install / pnpm install

# 3. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL to your Supabase PostgreSQL connection string
# Get it from: Supabase Dashboard → Project → Settings → Database → Connection string

# 4. Initialize the database (Option A — Prisma CLI, requires PostgreSQL network access)
bun run db:push     # create schema in Supabase
bun run db:seed     # populate with realistic PERKESO dummy data

# 4. Initialize the database (Option B — Supabase SQL Editor, no CLI/network restrictions)
#    a. Open Supabase Dashboard → SQL Editor
#    b. New query → paste contents of supabase/schema.sql → Run
#    c. New query → paste contents of supabase/seed.sql → Run

# 5. Start the dev server
bun run dev
```

Visit `http://localhost:3000` in your browser.

### Demo Accounts (Mock Authentication)

| Role  | Email                    | Password    |
|-------|--------------------------|-------------|
| Admin | admin@perkeso.gov.my     | admin123    |
| Staff | staff@perkeso.gov.my     | staff123    |

Additional seeded accounts: `nurul.huda@perkeso.gov.my` (Admin), `siti.noor@perkeso.gov.my`, `tan.wei@perkeso.gov.my`, `ravi.kumar@perkeso.gov.my` (all Staff, password `staff123`).

## Project Structure

```
.
├── prisma/
│   ├── schema.prisma       # 8-entity schema: User, Announcement, Act, Asip, Sop, Circular, Faq, Notification
│   └── seed.ts             # Realistic dummy data seed
├── src/
│   ├── app/
│   │   ├── api/            # REST API routes (auth, announcements, acts, asip, sop, circulars, faq, notifications, search, users, dashboard-stats)
│   │   ├── globals.css     # Tailwind + glassmorphism utilities + PERKESO/IDEONIX brand colors
│   │   ├── layout.tsx      # Root layout with ThemeProvider
│   │   └── page.tsx        # Auth gate + shell with all module pages
│   ├── components/
│   │   ├── ui/             # shadcn/ui component library
│   │   ├── layout/         # Sidebar, Header, Footer, LoginPage
│   │   ├── dashboard/      # DashboardPage
│   │   ├── modules/        # 7 module pages (announcements, acts, asip, sop, circulars, faq, admin)
│   │   └── common/         # GlassCard, FileIcon, DocPreviewProvider
│   ├── stores/             # Zustand stores (auth-store, nav-store)
│   ├── lib/                # db client, api helpers, types, utils
│   └── hooks/              # use-mobile, use-toast
├── .env.example
├── package.json
└── README.md
```

## API Endpoints

| Method | Endpoint                          | Description                          |
|--------|-----------------------------------|--------------------------------------|
| POST   | `/api/auth/login`                 | Mock login (returns user + token)   |
| GET    | `/api/dashboard-stats`            | Aggregate counts + chart data        |
| GET    | `/api/announcements`              | List (filter by `category`, `search`)|
| POST   | `/api/announcements`              | Create (admin)                       |
| PATCH  | `/api/announcements?id=`          | Update (admin)                       |
| DELETE | `/api/announcements?id=`          | Delete (admin)                       |
| GET    | `/api/acts`                       | List (filter by `category`, `status`, `search`) |
| GET    | `/api/asip`                       | List (filter by `status`, `search`)  |
| GET    | `/api/sop`                        | List (filter by `department`, `search`) |
| GET    | `/api/circulars`                  | List (filter by `category`, `mandatory`, `sort`, `search`) |
| GET    | `/api/faq`                        | List (filter by `category`, `search`)|
| GET    | `/api/notifications?userId=`      | List + unread count                  |
| PATCH  | `/api/notifications?id=`          | Mark as read                         |
| PATCH  | `/api/notifications?userId=&action=readAll` | Mark all as read         |
| GET    | `/api/search?q=`                  | Cross-module global search           |
| GET    | `/api/users`                      | List users (admin)                   |
| POST   | `/api/users`                      | Create user (admin)                  |
| PATCH  | `/api/users?id=`                  | Update user (admin)                  |
| DELETE | `/api/users?id=`                  | Delete user (admin)                  |

All list endpoints return `{ items: [...] }`.

## Database

This project uses **Supabase (PostgreSQL)** as its database, accessed via **Prisma ORM**. The schema is defined in `prisma/schema.prisma` and includes 8 entities per BRS §4.2:

- **User** — id, email, name, role (Admin/Staff), department, branch, position, avatarUrl, isActive, lastLogin
- **Announcement** — title, category, summary, content, authorName, isPinned, isNew, isUrgent, attachments[], coverColor, datePublished
- **Act** — actNumber, title, category, description, version, status, lastUpdated
- **Asip** — title, referenceNo, description, effectiveDate, status, category
- **Sop** — title, department, procedureSteps[], version, approvedBy, dateApproved
- **Circular** — circularNo, title, category, summary, content, isMandatory, dateIssued
- **Faq** — question, answer, category, tags[]
- **Notification** — userId, title, message, type (info/warning/success/critical), module, isRead

### Setting up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project → Settings → Database → Connection string** and copy the **Direct connection** URL
3. Put it in `.env` as `DATABASE_URL` (no quotes needed):
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
   ```
4. Create the schema and seed data using **either** method:
   - **CLI** (if your machine can reach port 5432): `bun run db:push && bun run db:seed`
   - **SQL Editor** (works everywhere): paste `supabase/schema.sql` then `supabase/seed.sql` into the Supabase SQL Editor

> **Note**: For serverless deployments (Vercel, Cloudflare Workers), use the Supabase **connection pooler** URL (port 6543) instead of the direct connection to avoid exhausting the connection pool.

### Regenerating the SQL files

If you modify `prisma/schema.prisma` or the seed data, regenerate the SQL files:

```bash
# Regenerate schema.sql from Prisma schema
bunx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > supabase/schema.sql

# Regenerate seed.sql from seed data
bun run db:seed-sql
```

## Scripts

```bash
bun run dev          # Start dev server (http://localhost:3000)
bun run build        # Production build
bun run lint         # ESLint check
bun run db:push      # Push Prisma schema to SQLite
bun run db:generate  # Regenerate Prisma Client
bun run db:seed      # Populate database with dummy data
bun run db:migrate   # Create migration
bun run db:reset     # Reset database
```

## Brand Colors

### PERKESO (Portal Theme)
| Color           | HEX       | Usage                              |
|-----------------|-----------|------------------------------------|
| Primary Blue    | `#007DC5` | Header, primary buttons, active nav |
| Dark Blue       | `#004E7A` | Hover states                       |
| Primary Green   | `#8DC63E` | "Baharu" badges, success           |
| Dark Green      | `#597E26` | Secondary accents                  |
| Teal            | `#00C5AB` | Info accents                       |
| Gold            | `#F9BF10` | Warning notifications              |
| Orange          | `#F27130` | Operation accents                  |
| Red             | `#ED1C24` | Mandatory/urgent/critical          |

### IDEONIX (Developer Credit)
| Color           | HEX       | Usage                              |
|-----------------|-----------|------------------------------------|
| Midnight Blue   | `#002147` | Login background, footer credit    |
| Amber Orange    | `#FFBF00` | IDEONIX accent on credits          |

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York style)
- **Database**: Prisma ORM + SQLite
- **State**: Zustand (with persist middleware for auth)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Inter (Google Fonts)
- **Toasts**: Sonner
- **Forms**: React Hook Form + Zod

## Development Notes

- This is a **functional prototype** with mock authentication. No real auth/SSO/AD integration is in scope (per BRS §1.3.2).
- The dummy database is **SQLite** (file-based) — no external DB server required.
- All content (Akta, SOP, pekeliling, FAQ) is **sample/dummy data** for demonstration purposes only (per BRS §9.1).
- Document preview uses a **placeholder modal** — no real PDF/DOCX files are uploaded (per BRS §9.2).
- The API layer is fully abstracted, making future production backend integration straightforward (per BRS §5.15 "extension-ready").

## License

Proprietary — © 2026 PERKESO. Developed by IDEONIX Sdn Bhd, Malaysia.

---

**Document Reference**: BRS_PERKESO_Bulletin_Dashboard v1.0 (29 Julai 2026)

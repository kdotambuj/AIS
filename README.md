# AIS — Academic Inventory System

A full-stack web application for managing academic resources (lab equipment, instruments, supplies) across departments in an educational institution. AIS provides a **ticket-based workflow** where students request resources, lab incharges process item-level approvals, and administrators maintain system-wide visibility over inventory and operations.

---

## Table of Contents

- [Abstract](#abstract)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Role-Based Access](#role-based-access)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [License](#license)

---

## Abstract

Academic institutions manage a large number of shared resources — lab equipment, instruments, tools and more — across multiple departments. Tracking availability, handling student requests, and maintaining an audit trail of who used what and when is often done manually or through disconnected processes.

**AIS (Academic Inventory System)** solves this by providing a centralized, role-aware platform that digitizes the entire resource lifecycle:

1. **Discover** — Students browse available resources grouped by authority and category.
2. **Request** — Students create tickets specifying what resources they need, in what quantity, and for which time window.
3. **Decide** — Lab incharges review each ticket item independently — accepting, rejecting, or partially approving.
4. **Fulfill** — Approved items are physically issued, tracked, and eventually returned, completing a full lifecycle with clear audit metadata.

The system supports four distinct user roles (Student, Lab Incharge, HOD, Admin), each with their own dashboard and set of permissions, ensuring that every stakeholder has the appropriate level of access and control.

---

## Key Features

### Resource Management
- **Hierarchical organization**: Resources are organized under *Resource Authorities* → *Resource Categories* → *Resources*.
- **Status tracking**: Each resource has a status — `AVAILABLE`, `OCCUPIED`, `LOST`, or `UNDER_MAINTENANCE`.
- **Quantity management**: Support for tracking item quantities.
- **Bulk upload**: Lab incharges can upload resources in bulk via Excel files (`.xlsx` / `.xls`).

### Ticket Lifecycle
- **Multi-item tickets**: A single ticket can request multiple resources, each evaluated independently.
- **Item-level decisions**: Each ticket item follows its own lifecycle — `PENDING → ACCEPTED → ISSUED → RETURNED` (or `REJECTED` at any stage).
- **Reservation windows**: Each ticket item specifies a `from` and `till` datetime, enabling time-based availability checking.
- **Audit metadata**: Every status transition records who performed the action and when (`approvedBy`, `issuedBy`, `receivedBy` with timestamps).
- **Derived ticket status**: The parent ticket status (`PENDING`, `APPROVED`, `REJECTED`, `RESOLVED`) is computed from the states of its child items.

### User & Department Management
- **Department-based organization**: Users and resource authorities belong to academic departments (Electrical Engg, Mechanical Engg, Civil Engg, etc.).
- **Bulk user creation**: Admins can upload users via Excel spreadsheets.
- **Profile management**: Users can update their profile details and photos.

### Authentication & Authorization
- **JWT-based authentication**: Secure login with HTTP-only cookie tokens.
- **Role-based middleware**: Every API endpoint is protected with role guards (`STUDENT`, `LAB_INCHARGE`, `HOD`, `ADMIN`).
- **Session persistence**: The client uses Redux + an auth provider to persist session state across page loads.

---

## Tech Stack

### Frontend (Client)
| Technology | Purpose |
|---|---|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Utility-first styling |
| **Redux Toolkit** | Global state management |
| **React Redux** | React bindings for Redux |
| **React Hot Toast** | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| **Express 5** | HTTP server framework |
| **TypeScript** | Type safety |
| **Prisma ORM** | Database access and schema management |
| **MySQL** | Relational database (hosted on Railway) |
| **JSON Web Tokens** | Authentication |
| **bcrypt / bcryptjs** | Password hashing |
| **Zod** | Request payload validation |
| **Multer** | File upload handling (Excel bulk imports) |
| **xlsx** | Excel file parsing |
| **tsx** | TypeScript execution for development |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Node.js v20** | Runtime |
| **Railway** | Database hosting (MySQL) |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                     CLIENT (Next.js)                     │
│                                                          │
│  ┌─────────┐  ┌──────────┐  ┌─────┐  ┌──────────────┐  │
│  │ Landing  │  │  Auth    │  │Admin│  │  Student     │  │
│  │  Page    │  │ Sign In  │  │Dash │  │  Dashboard   │  │
│  └─────────┘  └──────────┘  └─────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Lab Incharge │  │     HOD      │  │ Book Resource│   │
│  │  Dashboard   │  │  Dashboard   │  │   Ticket     │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                          │
│  Redux Store (auth slice) ← AuthProvider                │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP (REST API)
                         │ Cookies (JWT)
┌────────────────────────▼─────────────────────────────────┐
│                   BACKEND (Express)                       │
│                                                          │
│  Middlewares: CORS · JSON · CookieParser                │
│  Auth: JWT verify · Role guard                           │
│                                                          │
│  Routes                                                  │
│  ├── /api/v1/auth       (signup, login, me)             │
│  ├── /api/v1/user       (CRUD, bulk upload, profile)    │
│  ├── /api/v1/department (create, list, delete)          │
│  ├── /api/v1/authority  (create, list, my-authority)    │
│  ├── /api/v1/resource   (categories, resources, bulk)   │
│  └── /api/v1/ticket     (create, list, status updates)  │
│                                                          │
│  Services: auth · user · department · authority ·        │
│            resource · ticket                              │
│                                                          │
│  Validation: Zod schemas                                 │
└────────────────────────┬─────────────────────────────────┘
                         │ Prisma Client
┌────────────────────────▼─────────────────────────────────┐
│                     MySQL (Railway)                       │
│                                                          │
│  Tables: User · Department · ResourceAuthority ·         │
│          ResourceCategory · Resource · Ticket ·           │
│          TicketItem                                       │
└──────────────────────────────────────────────────────────┘
```

---

## Role-Based Access

### 🎓 Student
- View and search available resources across all authorities
- Create tickets with multiple resource items (with time windows)
- Track status of every ticket item (pending, accepted, issued, returned)
- View and update profile information

### 🔧 Lab Incharge
- View assigned resource authority and its inventory
- Create resource categories and individual resources
- Bulk upload resources via Excel
- Process incoming tickets — accept, reject, issue, or receive returns on a per-item basis
- View ticket statistics, pending requests, and issued items

### 🏛️ HOD (Head of Department)
- Oversee authority-level operations and governance
- Access department-wide resource visibility

### ⚙️ Admin
- Full system-wide visibility and control
- Manage departments (create, delete)
- Manage users (create individual, bulk upload via Excel, view all)
- Create and assign resource authorities
- View all tickets across the system
- Dashboard with KPIs and department insights

---

## Database Schema

The application uses a relational MySQL database with the following core models:

| Model | Description |
|---|---|
| **User** | System users with role, department, profile info, and credentials |
| **Department** | Academic departments (Electrical, Mechanical, Civil, etc.) |
| **ResourceAuthority** | A managed resource zone (e.g., a specific lab) owned by a Lab Incharge, tied to a department |
| **ResourceCategory** | Grouping of similar resources within an authority (e.g., "Multimeters", "Oscilloscopes") |
| **Resource** | Individual trackable resource with name, model, quantity, and status |
| **Ticket** | A student's request, containing one or more ticket items, directed at an authority |
| **TicketItem** | A single resource request within a ticket — has its own lifecycle, quantity, time window, and audit trail |

### Enums

- **Role**: `STUDENT`, `LAB_INCHARGE`, `ADMIN`, `HOD`
- **ResourceStatus**: `AVAILABLE`, `OCCUPIED`, `LOST`, `UNDER_MAINTENANCE`
- **TicketItemStatus**: `PENDING`, `ACCEPTED`, `REJECTED`, `ISSUED`, `RETURNED`
- **TicketStatus**: `PENDING`, `APPROVED`, `REJECTED`, `RESOLVED`

---

## API Reference

All endpoints are prefixed with `/api/v1`. Authentication is via JWT cookie (`token`).

### Auth — `/api/v1/auth`
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| POST | `/signup` | ✗ | — | Register a new user |
| POST | `/login` | ✗ | — | Login and get JWT cookie |
| GET | `/me` | ✓ | Any | Get current user info |

### Users — `/api/v1/user`
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/users` | ✗ | — | List all users |
| GET | `/profile` | ✓ | Any | Get own profile |
| PATCH | `/profile` | ✓ | Any | Update student details |
| PATCH | `/profile/photo` | ✓ | Any | Update profile photo |
| POST | `/bulk-upload` | ✓ | Admin | Bulk create users via Excel |
| GET | `/bulk-upload/template` | ✓ | Admin | Download Excel template |

### Departments — `/api/v1/department`
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| POST | `/create` | ✗ | — | Create a department |
| GET | `/get` | ✗ | — | List all departments |
| DELETE | `/delete/:id` | ✗ | — | Delete a department |

### Resource Authorities — `/api/v1/authority`
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| POST | `/create` | ✓ | Admin | Create a resource authority |
| GET | `/authorities` | ✓ | All | List all authorities |
| GET | `/my-authority` | ✓ | Lab Incharge | Get own authority |

### Resources — `/api/v1/resource`
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| POST | `/create-category` | ✓ | Admin, Lab Incharge, HOD | Create resource category |
| POST | `/create-resource` | ✓ | Admin, Lab Incharge, HOD | Create a resource |
| GET | `/get/:authorityId` | ✓ | Admin, Lab Incharge, HOD | Get resources by authority |
| GET | `/get` | ✓ | Student, Admin, Lab Incharge | List all resources |
| POST | `/bulk-upload` | ✓ | Lab Incharge, HOD | Bulk create via Excel |
| GET | `/bulk-upload/template` | ✓ | Lab Incharge, HOD | Download Excel template |

### Tickets — `/api/v1/ticket`
| Method | Endpoint | Auth | Roles | Description |
|---|---|---|---|---|
| POST | `/create` | ✓ | Student | Create a ticket |
| POST | `/create-batch` | ✓ | Student | Create batch ticket |
| GET | `/get` | ✓ | Admin, Student, Lab Incharge | List all tickets |
| GET | `/my-authority` | ✓ | Lab Incharge | Get tickets for own authority |
| GET | `/my` | ✓ | Student | Get own tickets |
| GET | `/resource-availability` | ✓ | Student, Lab Incharge, Admin | Check resource availability |
| PATCH | `/update-item-status` | ✓ | Lab Incharge | Update single item status |
| PATCH | `/update-items-status` | ✓ | Lab Incharge | Batch update item statuses |

---

## Project Structure

```
AIS/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── generated/                  # Prisma generated client
│   ├── src/
│   │   ├── app.ts                  # Express app setup, middleware, route mounting
│   │   ├── server.ts               # Server entry point
│   │   ├── config/
│   │   │   └── env.ts              # Environment variable config
│   │   ├── controllers/            # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── authority.controller.ts
│   │   │   ├── department.controller.ts
│   │   │   ├── resource.controller.ts
│   │   │   ├── ticket.controller.ts
│   │   │   └── user.controller.ts
│   │   ├── services/               # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── authority.service.ts
│   │   │   ├── department.service.ts
│   │   │   ├── resource.service.ts
│   │   │   ├── ticket.service.ts
│   │   │   └── user.service.ts
│   │   ├── routes/                 # Express route definitions
│   │   │   ├── auth.route.ts
│   │   │   ├── authority.route.ts
│   │   │   ├── department.route.ts
│   │   │   ├── resource.route.ts
│   │   │   ├── ticket.route.ts
│   │   │   └── user.route.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts   # JWT verification
│   │   │   └── role.middleware.ts   # Role-based access guard
│   │   ├── schema/                 # Zod validation schemas
│   │   │   ├── auth.schema.ts
│   │   │   ├── authority.schema.ts
│   │   │   ├── resource.schema.ts
│   │   │   └── ticket.schema.ts
│   │   ├── lib/
│   │   │   └── prisma.ts           # Prisma client singleton
│   │   └── types/                  # TypeScript type declarations
│   ├── package.json
│   ├── tsconfig.json
│   └── .nvmrc                      # Node v20.20.2
│
├── client/
│   ├── app/
│   │   ├── page.tsx                # Landing page
│   │   ├── layout.tsx              # Root layout (Redux, Auth, Toaster)
│   │   ├── globals.css
│   │   ├── auth/
│   │   │   └── signin/             # Sign-in page
│   │   ├── admin/
│   │   │   └── dashboard/          # Admin dashboard (sidebar, KPIs, CRUD)
│   │   │       └── components/     # 12 admin-specific components
│   │   ├── student/
│   │   │   ├── dashboard/          # Student dashboard (profile, tickets, find resource)
│   │   │   │   └── components/
│   │   │   └── book-resource-ticket/ # Ticket booking page
│   │   ├── lab-incharge/
│   │   │   └── dashboard/          # Lab incharge dashboard (resources, tickets, approvals)
│   │   │       └── components/
│   │   └── hod/
│   │       └── dashboard/          # HOD dashboard
│   ├── store/                      # Redux store
│   │   ├── store.ts
│   │   ├── index.ts
│   │   ├── hooks.ts
│   │   └── slices/                 # Redux slices (auth, etc.)
│   ├── components/
│   │   └── providers/              # ReduxProvider, AuthProvider
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── postcss.config.mjs
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v20+ (see `backend/.nvmrc`)
- **npm** (ships with Node)
- **MySQL** database (local or hosted, e.g. Railway)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AIS
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
PORT=5000
DATABASE_URL="mysql://<user>:<password>@<host>:<port>/<database>"
JWT_SECRET="your-jwt-secret-key"
CLIENT_URL="http://localhost:3000"
```

Generate Prisma client and push schema to DB:

```bash
npx prisma generate
npx prisma db push
```

Start development server:

```bash
npm run dev
```

The backend will run on `http://localhost:5000`.

### 3. Client Setup

```bash
cd client
npm install
```

Create a `.env` file in `/client`:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api/v1
```

Start development server:

```bash
npm run dev
```

The client will run on `http://localhost:3000`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@host:3306/ais` |
| `JWT_SECRET` | Secret key for signing JWTs | `my-super-secret-key` |
| `CLIENT_URL` | Allowed CORS origin | `http://localhost:3000` |

### Client (`client/.env`)

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API base URL | `http://localhost:5000/api/v1` |

---

## Scripts

### Backend

| Script | Command | Description |
|---|---|---|
| `dev` | `tsx watch src/server.ts` | Start dev server with hot reload |
| `build` | `prisma generate && tsc` | Generate Prisma client and compile TS |
| `start` | `node dist/server.js` | Run production build |

### Client

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev` | Start Next.js dev server |
| `build` | `next build` | Create production build |
| `start` | `next start` | Serve production build |
| `lint` | `eslint` | Run ESLint |

---

## License

ISC

# EcoCollect

EcoCollect is an e-waste collection platform that connects residents with local collection centers. Residents can arrange pickups and earn EcoPoints, while center staff manage collection requests and agency users monitor platform activity.

## Features

- Role-based experiences for residents, collection-center staff, and agency administrators
- Account registration, sign-in, profile management, and password updates
- E-waste pickup scheduling, request tracking, and staff status updates
- Collection center directory and reward redemption
- Real-time updates using Socket.IO
- Operational analytics and a health-check endpoint
- Seeded demo accounts and sample data for local development

## Technology

- React, TypeScript, and Vite
- Tailwind CSS
- Node.js and Express
- Socket.IO
- JWT-based authentication
- In-memory demo data store

## Requirements

- Node.js 20 or later
- npm

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell, use:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Set a private `JWT_SECRET` value in `.env`. Use a long, random value, especially outside local development.

4. Start the application:

   ```bash
   npm run dev
   ```

   The application is available at [http://localhost:3000](http://localhost:3000).

## Production build

Build the client and server bundles:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

The server listens on port `3000` and serves the built client from `dist`.

## Demo accounts

The following accounts are seeded for local demonstration:

| Role | Email | Password |
| --- | --- | --- |
| Resident | `citizen.demo@ecocollect.test` | `CitizenPass123!` |
| Center staff | `staff.demo@ecocollect.test` | `StaffPass123!` |
| Agency administrator | `agency.demo@ecocollect.test` | `AgencyAdmin123!` |

These demo credentials are for local development only. Do not use them in a production environment.

## API overview

All API routes are prefixed with `/api`.

| Route | Description |
| --- | --- |
| `/api/health` | Service health check |
| `/api/auth` | Registration, login, and account management |
| `/api/pickups` | Pickup scheduling, lookup, and status management |
| `/api/centers` | Collection center directory |
| `/api/rewards` | Rewards and point redemption |
| `/api/analytics` | Platform analytics |

Protected endpoints require a bearer token returned by the authentication endpoints.

## Data and configuration notes

- The included data store is in memory and is initialized with sample data at startup. Changes are not retained after the server restarts.
- Set `JWT_SECRET` to a strong, private value for any deployed environment. The application has a development fallback when it is not set.
- Demo accounts and seeded records are provided to help explore the application; they are not intended as production data.

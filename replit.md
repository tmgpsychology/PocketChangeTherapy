# PocketChange - Therapy Practice Management App

## Overview

PocketChange is a therapy practice management app with a Capacitor-ready React frontend and Express.js backend. It supports two user types: practitioners who manage clients and goals, and clients who check in on their progress.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + Shadcn UI
- **Mobile**: Capacitor-ready (capacitor.config.ts configured for iOS)
- **Auth**: Session-based auth (express-session + connect-pg-simple + bcryptjs)

## Architecture

### Backend (`artifacts/api-server`)
- Session auth with PostgreSQL session store
- Auth routes: login, logout, register, link-code, forgot password (security question flow)
- Client CRUD with auto-generated 10-char access codes
- Hierarchical goals (unlimited nesting via parentGoalId)
- Goal check-ins: 0-100% slider + 3 reflection questions + barrier tags
- SMS reminder settings storage
- Dashboard with stats and recent activity feed

### Frontend (`artifacts/pocket-change`)
- Warm teal-green theme (HSL 168)
- Mobile-first, iOS safe-area aware
- Two user flows: practitioner and client
- Capacitor config at `capacitor.config.ts`

### Database Schema (`lib/db/src/schema/`)
- `users` - users with role (practitioner/client), security question, linkedClientId
- `clients` - client profiles with 10-char access codes
- `goals` - hierarchical goals with parentGoalId
- `checkins` - progress check-ins with reflection questions
- `sms_reminders` - per-user SMS reminder settings

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## User Flows

### Practitioner
1. Register/login → Dashboard
2. Dashboard: stats + client list + recent activity
3. Clients: list, create (auto-generates access code), view details, edit notes
4. Client detail: hierarchical goal tree, add goals, view progress
5. Settings: account info + logout

### Client
1. Register → Link access code (10-char from practitioner)
2. Portal (Home): goals tree with progress, tap to check in
3. Check-in: 0-100% slider + reflection questions + barrier tags
4. Goal detail: check-in history
5. Reminders: SMS settings (phone, days, time, timezone, message)
6. Settings: account info + logout

## Capacitor (iOS)
- `capacitor.config.ts` is configured for iOS deployment
- StatusBar: DARK style, no overlay
- SplashScreen: auto-hide, 2s duration
- PushNotifications configured
- Safe area insets handled via CSS env()
- App ID: `com.pocketchange.app`

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

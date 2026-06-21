# SchoolHub

A multi-tenant school management platform. Each school signs up with its own
passkey and gets isolated data for staff, students, grading, attendance, and
fees — accessed through phone number + school passkey + password login.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router, Server Actions)
- [NextAuth](https://authjs.dev) v5 (Credentials provider, JWT sessions)
- [Prisma](https://www.prisma.io) 7 with SQLite for local dev (swap the
  datasource to PostgreSQL for production — the schema avoids
  Postgres-only features on purpose)
- Tailwind CSS v4
- TypeScript, react-hook-form + zod

## Getting started

```bash
npm install
cp .env.example .env   # then set AUTH_SECRET (openssl rand -base64 32)
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo logins

Seeded by `npm run db:seed` (phone / school passkey / password):

| Role                       | Phone        | Passkey  | Password   |
| --------------------------- | ------------ | -------- | ---------- |
| Super Admin                 | 08000000000  | admin    | admin123   |
| School Admin (Sunrise Academy) | 08011111111 | SUNRISE1 | admin123   |
| Teacher (Form Teacher, JSS1A)  | 08022222222 | SUNRISE1 | teacher123 |
| Teacher (JSS1B)             | 08033333333  | SUNRISE1 | teacher123 |
| Parent                      | 08044444444  | SUNRISE1 | parent123  |
| Parent                      | 08055555555  | SUNRISE1 | parent123  |

The Super Admin passkey ("admin") is fixed and shared across the platform;
every other role signs in with the unique passkey generated for their
school at registration time.

## Roles

- **Super Admin** — manages every school on the platform (create, suspend,
  regenerate passkey, delete).
- **School Admin** — runs one school: classes, subjects, terms, grading
  weightage/boundaries, staff.
- **Teacher** — enters scores for assigned class/subject combinations; sees
  a live computed percentage and grade as they type.
- **Form Teacher** — a Teacher additionally assigned as a class's form
  teacher; gets attendance and fee recording for that class.
- **Parent** — views their children's report cards, attendance, and fees.

## Other scripts

```bash
npm run lint      # eslint
npm run db:reset  # drop, recreate, and re-migrate the dev database
```

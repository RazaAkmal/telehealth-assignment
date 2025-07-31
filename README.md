# Telehealth Assignment

A modern telehealth application built with Next.js, TypeScript, TailwindCSS, ShadCN/UI, PostgreSQL with Prisma ORM, and Supabase for authentication.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **ShadCN/UI** - Beautiful and accessible React components
- **PostgreSQL** - Relational database
- **Prisma** - ORM for database access
- **Supabase** - Authentication and user management

## Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd telehealth-assignment
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database for your project
2. You can use a local PostgreSQL installation or a cloud service like Supabase, Railway, or Vercel Postgres

### 3. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration for Prisma
DATABASE_URL="postgresql://username:password@localhost:5432/telehealth_db"
DIRECT_URL="postgresql://username:password@localhost:5432/telehealth_db"

# Supabase Configuration (Required for authentication)
NEXT_PUBLIC_SUPABASE_URL="your u
NEXT_PUBLIC_SUPABASE_ANON_KEY="Your Key"

# Replace PostgreSQL credentials with your actual values
```

### 4. Database Setup and Seeding

Run the database migrations to create the schema:

```bash
# Set up the database schema
npm run db:setup
# or
yarn db:setup
```

Then seed the database with sample data:

```bash
# Insert sample data
npm run db:seed
# or
yarn db:seed
```

This will create:
- A test user with email `test@example.com`
- 5 sample patients
- 15 booking appointments in various states

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── dashboard/      # Dashboard views
│   │   ├── queue/      # Patient queue management
│   │   └── admin/      # Admin panel for status management
│   ├── api/            # API routes
│   ├── login/          # Authentication pages
│   └── register/       # Registration pages
├── components/          # React components
│   └── ui/             # ShadCN/UI components
├── lib/                # Utility functions and data access
│   └── prisma.ts      # Prisma client functions
├── types/              # TypeScript type definitions
└── hooks/              # Custom React hooks
```

## Environment Variables Required

For reviewers setting up their own instance, the following environment variables are required:

- `DATABASE_URL` - PostgreSQL connection string for Prisma
- `DIRECT_URL` - Direct connection URL for PostgreSQL (can be same as DATABASE_URL)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (use the one provided above)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (use the one provided above)

## Database Schema

The application uses the following main tables:
- `users` - User profiles and authentication
- `patients` - Patient profiles and medical information
- `bookings` - Appointment scheduling and management

## Main Features

### Queue Management

The main queue view (`/dashboard/queue`) allows providers to:
- View patients by status (pre-booked, active, completed)
- Filter patients by name or doctor
- See patients grouped by status (waiting room, in-call)
- Join video calls with patients who are ready
- View patient details and update their status

### Admin Panel

The admin panel (`/dashboard/admin`) provides:
- Full visibility of all patients in the system
- Ability to move patients between queue statuses (pre-booked, active, completed)
- Tools to update patient statuses within active queue
- Search and filter functionality

## Tools & Commands

- `npm run dev` or `yarn dev`: Start the development server
- `npm run build` or `yarn build`: Build the application for production
- `npm run db:setup` or `yarn db:setup`: Run database migrations
- `npm run db:seed` or `yarn db:seed`: Seed the database with sample data
- `npm run db:studio` or `yarn db:studio`: Open Prisma Studio to explore database (at http://localhost:5555)

## Troubleshooting

### Database Connection Issues

If you encounter database connection problems:

1. Verify PostgreSQL is running
2. Check your `.env` file for correct credentials
3. Ensure you've run the migrations with `npm run db:setup`

### Prisma Client Issues

If you see Prisma Client related errors:

```bash
npx prisma generate
```

### Reset Database

To reset the database and start fresh:

```bash
npx prisma migrate reset
npm run db:seed
```

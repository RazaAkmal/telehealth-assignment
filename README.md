# TeleHealth Assignment

A modern telehealth application built with Next.js, TypeScript, TailwindCSS, ShadCN/UI, and Supabase.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **ShadCN/UI** - Beautiful and accessible React components
- **Supabase** - Backend as a Service for authentication and database

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd telehealth-assignment
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key

### 3. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Database Setup

Run the database migrations and seed data:

```bash
# This will create the necessary tables and insert sample data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── ui/             # ShadCN/UI components
│   └── layout/         # Layout components
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
└── utils/              # Supabase client and utilities
```

## Environment Variables Required

For reviewers setting up their own Supabase instance, the following environment variables are required:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (optional, for server-side operations)

## Database Schema

The application uses the following main tables:
- `users` - User profiles and authentication
- `doctors` - Doctor profiles and specializations
- `patients` - Patient profiles and medical information
- `appointments` - Appointment scheduling and management
- `messages` - Chat messages between patients and doctors

## Features

- User authentication (patients and doctors)
- Doctor profiles and specializations
- Appointment booking and management
- Real-time messaging
- Medical records management
- Responsive design
- Type-safe development with TypeScript

## Development

This project uses:
- Next.js 15 with App Router
- Supabase for backend services
- TailwindCSS for styling
- ESLint for code linting
- TypeScript for type checking

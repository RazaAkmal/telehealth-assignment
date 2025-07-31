#!/bin/bash

# Exit on error
set -e

echo "🗄️  Resetting and seeding database..."

# Run prisma migrate reset with force flag to recreate all migrations and seed data
npx prisma migrate reset --force

echo "✅ Database reset and seed complete!"

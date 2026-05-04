#!/bin/bash
set -e

echo "========================================"
echo "  UPVC App - First-time Setup Script"
echo "========================================"

# 1. Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# 2. Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

# 3. Push schema to DB (creates/updates tables without losing data)
echo ""
echo "🗄️  Syncing database schema..."
npx prisma db push

# 4. Seed the database
echo ""
echo "🌱 Seeding database (admin + settings)..."
npm run db:seed

echo ""
echo "========================================"
echo "✅ Setup complete!"
echo ""
echo "▶️  Run the app:   npm run dev"
echo "🌐 Open:          http://localhost:3000"
echo "🔐 Admin panel:   http://localhost:3000/admin"
echo "   Email:         admin@pristinewindows.in"
echo "   Password:      Admin@Pristine2024!"
echo "========================================"

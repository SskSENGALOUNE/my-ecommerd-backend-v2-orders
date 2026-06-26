#!/bin/bash

echo "🚀 Starting Clean Architecture NestJS Template"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Start PostgreSQL
echo "📦 Starting PostgreSQL database..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Run migrations
echo "🔄 Running Prisma migrations..."
pnpm prisma:migrate

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "  1. Run 'pnpm start:dev' to start the development server"
echo "  2. Visit http://localhost:3000 to see the app"
echo "  3. API endpoints available at http://localhost:3000/ex-tables"
echo ""
echo "📚 Additional commands:"
echo "  - pnpm prisma:studio  # Open Prisma Studio to view/edit data"
echo "  - pnpm test          # Run tests"
echo "  - pnpm lint          # Run linter"
echo ""

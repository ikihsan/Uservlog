#!/bin/bash

echo "🚀 UserBlog Setup Script"
echo "========================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
cd ..

# Install admin dependencies
echo "📦 Installing admin dependencies..."
cd admin
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install admin dependencies"
    exit 1
fi
cd ..

echo ""
echo "✅ Installation completed successfully!"
echo ""
echo "🔥 Next Steps:"
echo "1. Make sure MongoDB is running"
echo "2. Start the backend: cd backend && npm start"
echo "3. Start the frontend: cd frontend && npm start"
echo "4. Start the admin panel: cd admin && npm start"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:3001"
echo "   Admin Panel: http://localhost:3002"
echo "   Backend API: http://localhost:5000"
echo ""
echo "🔑 Default Admin Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "Built with ❤️ by ikcodes"

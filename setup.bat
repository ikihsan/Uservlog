@echo off
echo 🚀 UserBlog Setup Script
echo ========================

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js found
node --version

:: Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

:: Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

:: Install admin dependencies
echo 📦 Installing admin dependencies...
cd admin
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install admin dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo ✅ Installation completed successfully!
echo.
echo 🔥 Next Steps:
echo 1. Make sure MongoDB is running
echo 2. Start the backend: cd backend ^&^& npm start
echo 3. Start the frontend: cd frontend ^&^& npm start
echo 4. Start the admin panel: cd admin ^&^& npm start
echo.
echo 🌐 Access URLs:
echo    Frontend: http://localhost:3001
echo    Admin Panel: http://localhost:3002
echo    Backend API: http://localhost:5000
echo.
echo 🔑 Default Admin Credentials:
echo    Username: admin
echo    Password: admin123
echo.
echo Built with ❤️ by ikcodes
pause

@echo off
echo 🚀 Deploying Fathi.vlogs to Vercel...

echo 📦 Building frontend...
cd frontend
call npm run build
cd ..

echo 📋 Preparing API...
xcopy /s /e /y backend\routes api\routes\
xcopy /s /e /y backend\models api\models\
xcopy /s /e /y backend\middleware api\middleware\
xcopy /s /e /y backend\utils api\utils\
if exist backend\.env copy backend\.env api\.env

echo 🌐 Deploying to Vercel...
vercel --prod

echo ✅ Deployment complete!
echo 🌟 Your site should be available at: https://fathi-vlogs.vercel.app
pause

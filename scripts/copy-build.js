const fs = require('fs');
const path = require('path');

// Cross-platform file copying script for Render deployment
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  const buildDir = path.join(__dirname, '..', 'frontend', 'build');
  const rootDir = path.join(__dirname, '..');
  
  console.log('📦 Copying frontend build files...');
  
  if (fs.existsSync(buildDir)) {
    // Copy all files from frontend/build to root
    fs.readdirSync(buildDir).forEach((item) => {
      const srcPath = path.join(buildDir, item);
      const destPath = path.join(rootDir, item);
      
      if (fs.statSync(srcPath).isDirectory()) {
        copyRecursiveSync(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    });
    
    console.log('✅ Frontend build files copied successfully');
  } else {
    console.error('❌ Frontend build directory not found');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error copying build files:', error.message);
  process.exit(1);
}

const fs = require('fs');
const path = require('path');

// Move build directory to admin-build
const source = path.join(__dirname, 'build');
const destination = path.join(__dirname, 'admin-build');

if (fs.existsSync(source)) {
  if (fs.existsSync(destination)) {
    fs.rmSync(destination, { recursive: true, force: true });
  }
  fs.renameSync(source, destination);
  console.log('Moved build to admin-build');
} else {
  console.error('Build directory not found');
  process.exit(1);
}
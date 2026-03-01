const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const examplePath = path.join(rootDir, '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(examplePath)) {
  fs.copyFileSync(examplePath, envPath);
}

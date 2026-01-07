const fs = require('fs');
const path = require('path');
const toml = require('smol-toml');

const srcDir = path.join(__dirname, '../legacy/conductor/commands/conductor');
const destDir = path.join(__dirname, '../src/prompts/conductor');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir).filter(file => file.endsWith('.toml'));

files.forEach(file => {
  const filePath = path.join(srcDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  try {
    const parsed = toml.parse(content);
    const destPath = path.join(destDir, file.replace('.toml', '.json'));
    fs.writeFileSync(destPath, JSON.stringify(parsed, null, 2));
    console.log(`Converted ${file} to ${path.basename(destPath)}`);
  } catch (e) {
    console.error(`Error converting ${file}:`, e);
    process.exit(1);
  }
});

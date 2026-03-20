// build.js — Run by Netlify at deploy time
// Reads index.html, replaces %%PLACEHOLDERS%% with env vars, writes to dist/

const fs = require('fs');
const path = require('path');

// Create dist folder
if (!fs.existsSync('dist')) fs.mkdirSync('dist');

// Read source HTML
let html = fs.readFileSync('index.html', 'utf8');

// Map of placeholder → environment variable
const replacements = {
  '%%GOOGLE_CLIENT_ID%%':        process.env.GOOGLE_CLIENT_ID        || '',
  '%%EMAILJS_PUBLIC_KEY%%':      process.env.EMAILJS_PUBLIC_KEY      || '',
  '%%EMAILJS_SERVICE_ID%%':      process.env.EMAILJS_SERVICE_ID      || '',
  '%%EMAILJS_TEMPLATE_DAILY%%':  process.env.EMAILJS_TEMPLATE_DAILY  || '',
  '%%EMAILJS_TEMPLATE_WEEKLY%%': process.env.EMAILJS_TEMPLATE_WEEKLY || '',
  '%%STRAVA_CLIENT_ID%%':        process.env.STRAVA_CLIENT_ID        || '',
  '%%FIREBASE_API_KEY%%':        process.env.FIREBASE_API_KEY        || '',
  '%%FIREBASE_AUTH_DOMAIN%%':    process.env.FIREBASE_AUTH_DOMAIN    || '',
  '%%FIREBASE_PROJECT_ID%%':     process.env.FIREBASE_PROJECT_ID     || '',
  '%%FIREBASE_STORAGE_BUCKET%%': process.env.FIREBASE_STORAGE_BUCKET || '',
  '%%FIREBASE_MSG_SENDER_ID%%':  process.env.FIREBASE_MSG_SENDER_ID  || '',
  '%%FIREBASE_APP_ID%%':         process.env.FIREBASE_APP_ID         || '',
  '%%STRAVA_CLIENT_SECRET%%':    '',  // NEVER injected into HTML — server-side only
};

// Replace each placeholder
let replaced = 0;
for (const [placeholder, value] of Object.entries(replacements)) {
  const count = (html.match(new RegExp(placeholder.replace(/%%/g, '%%'), 'g')) || []).length;
  if (count > 0) {
    html = html.split(placeholder).join(value);
    console.log(`  ✓ ${placeholder} → ${value ? '[SET]' : '[EMPTY]'} (${count} occurrence${count>1?'s':''})`);
    replaced += count;
  }
}

if (replaced === 0) {
  console.log('  ℹ  No placeholders found — HTML used as-is');
}

// Write output
fs.writeFileSync(path.join('dist', 'index.html'), html);
console.log('\n✅ Build complete → dist/index.html');
console.log(`   Total replacements: ${replaced}`);

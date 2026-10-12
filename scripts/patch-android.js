// Prepares the generated Android project: notification icon, permissions, version number.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'android', 'app');

// 1. Small monochrome notification icon (a timer)
const drawable = path.join(root, 'src', 'main', 'res', 'drawable');
fs.mkdirSync(drawable, { recursive: true });
fs.writeFileSync(path.join(drawable, 'ic_stat_sungong.xml'), `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp" android:height="24dp"
    android:viewportWidth="24" android:viewportHeight="24">
  <path android:fillColor="#FFFFFFFF" android:pathData="M9,1h6v2H9z"/>
  <path android:fillColor="#FFFFFFFF" android:fillType="evenOdd"
      android:pathData="M12,4A9,9 0,1 1,12,22A9,9 0,1 1,12,4z M12,6A7,7 0,1 0,12,20A7,7 0,1 0,12,6z"/>
  <path android:fillColor="#FFFFFFFF" android:pathData="M11,8h2v5.4l3.2,1.9 -1,1.7 -4.2,-2.5z"/>
</vector>
`);

// 2. Permissions
const manifestPath = path.join(root, 'src', 'main', 'AndroidManifest.xml');
let manifest = fs.readFileSync(manifestPath, 'utf8');
const perms = [
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.SCHEDULE_EXACT_ALARM',
  'android.permission.RECEIVE_BOOT_COMPLETED',
  'android.permission.WAKE_LOCK',
  'android.permission.VIBRATE'
];
const missing = perms.filter(p => !manifest.includes(`"${p}"`));
if (missing.length) {
  const lines = missing.map(p => `    <uses-permission android:name="${p}" />`).join('\n');
  manifest = manifest.replace('</manifest>', `${lines}\n</manifest>`);
  fs.writeFileSync(manifestPath, manifest);
}

// 3. Version number grows with every build so updates install over the old app
const run = parseInt(process.env.GITHUB_RUN_NUMBER || '1', 10);
const gradlePath = path.join(root, 'build.gradle');
let gradle = fs.readFileSync(gradlePath, 'utf8');
gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${run}`)
               .replace(/versionName\s+"[^"]*"/, `versionName "1.0.${run}"`);
fs.writeFileSync(gradlePath, gradle);

console.log('Android project patched. Added permissions:', missing.join(', ') || 'none', '· version', run);

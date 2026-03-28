const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/hp/OneDrive/Desktop/portal-adv/techclub-portal/frontend/src/pages';

const replacements = [
  { regex: /Real-time node engagement tracking/g, replacement: 'Real-time user engagement tracking' },
  { regex: /Active Resource Registry/g, replacement: 'Active Events Database' },
  { regex: /Operational Registry/g, replacement: 'Events List' },
  { regex: /View Registry Interface/g, replacement: 'View Events Interface' },
  { regex: /No logical nodes detected\./g, replacement: 'No active users detected.' },
  { regex: /Verified Nodes/g, replacement: 'Verified Users' },
  { regex: /Node Cluster/g, replacement: 'User Directory' },
  { regex: /Download Encrypted Registry/g, replacement: 'Download Encrypted Database' },
  { regex: /transevent/g, replacement: 'submission' },
];

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.jsx') || fullPath.endsWith('.js'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      replacements.forEach(({regex, replacement}) => {
        content = content.replace(regex, replacement);
      });
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
}

processDir(dir);
console.log('Replacement complete.');

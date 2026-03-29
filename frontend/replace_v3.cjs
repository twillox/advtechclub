const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/hp/OneDrive/Desktop/portal-adv/techclub-portal/frontend/src';

const replacements = [
  { regex: /Secure Operational Header/gi, replacement: 'Admin Management' },
  { regex: /System Operational/gi, replacement: 'Systems Live' },
  { regex: /Council Overseer/gi, replacement: 'Administrator' },
  { regex: /Authorized Management Zone/gi, replacement: 'Admin Dashboard' },
  { regex: /Dynamic Matrix Grid/gi, replacement: 'Dashboard Grid' },
  { regex: /Primary Command Strip/gi, replacement: 'Overview' },
  { regex: /Telemetry Core Metrics/gi, replacement: 'Stats Overview' },
  { regex: /Total Agents/gi, replacement: 'Total Users' },
  { regex: /Active Ops/gi, replacement: 'Active Events' },
  { regex: /Collective XP/gi, replacement: 'Total XP Gained' },
  { regex: /Engagement Analytics Engine/gi, replacement: 'Engagement Stats' },
  { regex: /System Throughput/gi, replacement: 'Activity Levels' },
  { regex: /UPTIME/g, replacement: 'ACTIVE' },
  { regex: /View Events Interface/gi, replacement: 'Manage All Events' },
  { regex: /No active users detected\./gi, replacement: 'No events created yet.' },
  { regex: /Verified Users/gi, replacement: 'Registered Users' },
  { regex: /Fetch Local Data/gi, replacement: 'View Attendees' },
  { regex: /Permanently Purge/gi, replacement: 'Delete' },
  { regex: /Terminal Interface: Event Deployment/gi, replacement: 'Create New Event' },
  { regex: /Central Command/gi, replacement: 'Event Creator' },
  { regex: /Sub-System/gi, replacement: 'Event Module' },
  { regex: /BOOT NEW OPS/gi, replacement: 'NEW EVENT' },
  { regex: /ABORT OPERATION/gi, replacement: 'CANCEL' },
  { regex: /Operation ID/gi, replacement: 'Event Title' },
  { regex: /briefing data entry/gi, replacement: 'event details' },
  { regex: /Commit to Database/gi, replacement: 'Save Event' },
  { regex: /System Allocation/gi, replacement: 'Event Distribution' },
  { regex: /Technical Ops/gi, replacement: 'Workshops' },
  { regex: /Competitive Logic/gi, replacement: 'Hackathons' },
  { regex: /Council Discourse/gi, replacement: 'Seminars' },
  { regex: /Roster Overlay Dashboard Style/gi, replacement: 'Participants' },
  { regex: /Active Connections Synchronized/gi, replacement: 'Participants Registered' },
  { regex: /No Secure Data Signal Detected/gi, replacement: 'No participants yet.' },
  { regex: /Matrix/gi, replacement: 'Dashboard' },
  { regex: /Real-time node engagement tracking/gi, replacement: 'Real-time user engagement' },
  { regex: /Node/gi, replacement: 'Module' },
  { regex: /Protocol/gi, replacement: 'System' },
  { regex: /Nexus/gi, replacement: 'Platform' },
  { regex: /Operational/gi, replacement: 'Active' },
  { regex: /Ops/gi, replacement: 'Events' },
  { regex: /telemetry/gi, replacement: 'data' },
  { regex: /roster/gi, replacement: 'list' },
  { regex: /purge/gi, replacement: 'delete' },
  { regex: /initialize/gi, replacement: 'start' },
  { regex: /Initialize/gi, replacement: 'Start' },
  { regex: /Registry/gi, replacement: 'Database' },
  { regex: /registry/gi, replacement: 'database' },
  { regex: /Identity/gi, replacement: 'Profile' },
  { regex: /identity/gi, replacement: 'profile' },
  { regex: /operative/gi, replacement: 'user' },
  { regex: /Operative/gi, replacement: 'User' },
  { regex: /Pulse/gi, replacement: 'Hub' },
  { regex: /Omniscience/gi, replacement: 'Admin Panel' },
  { regex: /Crew/gi, replacement: 'Team' },
  { regex: /crew/gi, replacement: 'team' },
  { regex: /MISSION/g, replacement: 'EVENT' },
  { regex: /mission/gi, replacement: 'event' },
  { regex: /Mission/gi, replacement: 'Event' },
  { regex: /COVERT/g, replacement: 'ANONYMOUS' },
  { regex: /covert/gi, replacement: 'anonymous' },
  { regex: /TRANSMISSION/g, replacement: 'MESSAGE' },
  { regex: /transmission/gi, replacement: 'message' },
  { regex: /Transmission/gi, replacement: 'Message' },
  { regex: /DEPLOY/g, replacement: 'CREATE' },
  { regex: /deploy/gi, replacement: 'create' },
  { regex: /Deploy/gi, replacement: 'Create' },
  { regex: /ENCRYPTED/g, replacement: 'SECURE' },
  { regex: /encrypted/gi, replacement: 'secure' },
  { regex: /Encrypted/gi, replacement: 'Secure' },
  { regex: /DECRYPT/g, replacement: 'LOAD' },
  { regex: /decrypt/gi, replacement: 'load' },
  { regex: /Decrypt/gi, replacement: 'Load' },
  { regex: /BOOT/g, replacement: 'START' },
  { regex: /boot/gi, replacement: 'start' },
  { regex: /Boot/gi, replacement: 'Start' },
];

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.cjs'))) {
      if (file === 'replace.cjs' || file === 'replace2.cjs') continue;
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

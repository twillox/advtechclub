const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/hp/OneDrive/Desktop/portal-adv/techclub-portal/frontend/src';

const replacements = [
  { regex: /Explore Pulse/g, replacement: 'Explore Events' },
  { regex: /Syncing algorithms\.\.\./g, replacement: 'Loading...' },
  { regex: /Registry Management Node/g, replacement: 'Manage Attendees' },
  { regex: /Enrolled Operatives/g, replacement: 'Registered Users' },
  { regex: /No operatives registered/g, replacement: 'No users registered' },
  { regex: /Edit Mission/g, replacement: 'Edit Event' },
  { regex: /Mission parameters updated/g, replacement: 'Event updated' },
  { regex: /mission briefing/g, replacement: 'project description' },
  { regex: /Mission Handle/g, replacement: 'Username' },
  { regex: /Mission/g, replacement: 'Event' },
  { regex: /mission/g, replacement: 'event' },
  { regex: /XP Pulse Module/g, replacement: 'XP Overview' },
  { regex: /PULSE/g, replacement: 'EVENTS' },
  { regex: /Curated Pulse/g, replacement: 'Curated Events' },
  { regex: /Explore pulse/g, replacement: 'Explore events' },
  { regex: /Raise New Node/g, replacement: 'Create New Ticket' },
  { regex: /Covert Transmission/g, replacement: 'Anonymous Submission' },
  { regex: /Nexus Core Updated\. Knowledge link established\./g, replacement: 'Resources Updated Successfully.' },
  { regex: /System Error: Registry failed to accept transmission\./g, replacement: 'Error: Failed to save to database.' },
  { regex: /Registry failure/g, replacement: 'Database failure' },
  { regex: /Processing Database\.\.\./g, replacement: 'Loading...' },
  { regex: /Entering Workspace\.\.\./g, replacement: 'Loading...' },
  { regex: /LEAVE CREW/g, replacement: 'LEAVE TEAM' },
  { regex: /CREW HUB/g, replacement: 'PROJECTS' },
  { regex: /Crew Hub/g, replacement: 'Projects' },
  { regex: /Crew Space Created!/g, replacement: 'Project Created!' },
  { regex: /Crew Members/g, replacement: 'Team Members' },
  { regex: /Crew/g, replacement: 'Team' },
  { regex: /crew/g, replacement: 'team' },
  { regex: /Initialize New Node/g, replacement: 'Create New Project' },
  { regex: /ACTIVATE CREW SPACE/g, replacement: 'CREATE PROJECT' },
  { regex: /Active My-Crews/g, replacement: 'My Projects' },
  { regex: /Master Project Archive/g, replacement: 'All Projects' },
  { regex: /Zero active transmissions detected in this sector\./g, replacement: 'No projects found.' },
  { regex: /REQUEST ENCRYPTED/g, replacement: 'REQUEST SENT' },
  { regex: /INITIATE CONNECTION/g, replacement: 'JOIN PROJECT' },
  { regex: /Nexus Identity Updated\./g, replacement: 'Profile Updated.' },
  { regex: /Identity node not found\./g, replacement: 'User not found.' },
  { regex: /Nexus Identity Management/g, replacement: 'Profile Management' },
  { regex: /Operative Name/g, replacement: 'Full Name' },
  { regex: /Enable node to be discovered by shareable link/g, replacement: 'Make profile public' },
  { regex: /Voted! Protocol reinforced\./g, replacement: 'Voted successfully.' },
  { regex: /Poll Activated across Nexus!/g, replacement: 'Poll created successfully.' },
  { regex: /System Block: Registry rejected the poll creation\./g, replacement: 'Error: Failed to create poll.' },
  { regex: /Access Protocol \(Password\)/g, replacement: 'Password' },
  { regex: /256-BIT ENCRYPTION/g, replacement: 'SECURE LOGIN' },
  { regex: /decommissioned/g, replacement: 'deleted' },
  { regex: /Secure protocols enabled/g, replacement: 'Secure connection enabled' },
  { regex: /Omniscience/g, replacement: 'Admin Portal' },
  { regex: /Operatives/g, replacement: 'Users' },
  { regex: /operatives/g, replacement: 'users' },
  { regex: /Operative/g, replacement: 'User' },
  { regex: /operative/g, replacement: 'user' },
  { regex: /Master Operations Overview/g, replacement: 'Admin Dashboard' },
  { regex: /Initialize • Scale • Ship/g, replacement: 'Create • Collaborate • Build' },
  { regex: /Nexus/g, replacement: 'Portal' },
  { regex: /Matrix Overview/g, replacement: 'Dashboard' },
  { regex: /Community Pulse/g, replacement: 'Events' },
  { regex: /Project Command/g, replacement: 'Projects' },
  { regex: /Logic Support/g, replacement: 'Support' },
  { regex: /Public Opinion/g, replacement: 'Polls' },
  { regex: /Core Library/g, replacement: 'Resources' },
  { regex: /Council Console/g, replacement: 'Admin Console' },
  { regex: /End Session/g, replacement: 'Logout' },
  { regex: /transmissions/g, replacement: 'projects' },
  { regex: /transmit/g, replacement: 'send' },
  { regex: /transmission/g, replacement: 'submission' },
  { regex: /protocol/g, replacement: 'system' },
  { regex: /Protocol/g, replacement: 'System' },
  { regex: /Pulse/g, replacement: 'Events' }
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

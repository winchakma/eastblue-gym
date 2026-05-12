const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, '..', 'dashboard.html');
let content = fs.readFileSync(filepath, 'utf8');

// Add IDs to buttons
content = content.replace('>Check In</button>', ' id="btnCheckIn">Check In</button>');
content = content.replace('>Cancel</button>', ' id="btnCancel">Cancel</button>');

// Make "Keep pushing!" a button
content = content.replace('Keep pushing!</p>', '<button id="btnKeepPushing" class="text-xs text-yellow-400 mt-1 hover:underline">Keep pushing!</button>');

// Make "30-Day Streak" interactive
content = content.replace('30-Day Streak</h4>', '30-Day Streak</h4><button id="btnStreak" class="text-[10px] text-yellow-400 font-bold uppercase tracking-widest mt-2 hover:underline">View Progress</button>');

fs.writeFileSync(filepath, content, 'utf8');
console.log('Updated dashboard.html with button IDs');

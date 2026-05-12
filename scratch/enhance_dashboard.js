const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, '..', 'dashboard.html');
let content = fs.readFileSync(filepath, 'utf8');

// Remove opacity from streak card
content = content.replace('opacity-50', '');

// Make BMR value interactive
content = content.replace('id="bmr-value"', 'id="bmr-value" style="cursor:pointer;" title="Click to learn more"');

fs.writeFileSync(filepath, content, 'utf8');
console.log('Further enhanced dashboard.html');

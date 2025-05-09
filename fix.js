const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'MineMap.AI', 'static', 'js', 'citizen_map.js');
let content = fs.readFileSync(filePath, 'utf8');

// Ensure proper function definition for window.initMap
content = content.replace(
  /window\.initMap\s*=\s*function\(\)\s*{/,
  'window.initMap = function() {'
);

// Save the file
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed syntax errors in citizen_map.js'); 
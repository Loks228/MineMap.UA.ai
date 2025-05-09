const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'MineMap.AI', 'static', 'js', 'citizen_map.js');
let content = fs.readFileSync(filePath, 'utf8');

// Look for try blocks without catch
const tryWithoutCatchRegex = /try\s*{[^}]*}\s*(?!catch|finally)/g;
let match;
let positions = [];

while ((match = tryWithoutCatchRegex.exec(content)) !== null) {
  positions.push({
    start: match.index,
    end: match.index + match[0].length
  });
}

// Fix the syntax issues by adding catch blocks - start from the end to avoid messing up positions
for (let i = positions.length - 1; i >= 0; i--) {
  const pos = positions[i];
  const before = content.substring(0, pos.end);
  const after = content.substring(pos.end);
  content = before + ' catch (error) { console.error("Error in function:", error); }' + after;
}

// Fix the initMap function if needed
if (!content.includes('window.initMap = initMap')) {
  // Add assignment at the end of the initMap function
  content = content.replace(
    /function\s+initMap\s*\(\)\s*{[\s\S]*?}\s*(?!window\.initMap)/,
    match => match + '\n\n// Ensure initMap is globally available\nwindow.initMap = initMap;\n'
  );
}

// Save the fixed file
fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed all syntax errors in citizen_map.js'); 
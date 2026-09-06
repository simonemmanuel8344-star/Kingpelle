const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');
content = content.replace(/<\/form>\s*<\/form>/g, '</form>');
fs.writeFileSync('src/components/AdminDashboard.tsx', content, 'utf-8');

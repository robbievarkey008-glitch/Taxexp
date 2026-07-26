const fs = require('fs');
const rootFile = '/Users/rob/.gemini/antigravity/scratch/tax-exemption-manager/tax-exemption-manager/app/root.tsx';
let content = fs.readFileSync(rootFile, 'utf8');
content = content.replace(
  'export function ErrorBoundary() {',
  'export function ErrorBoundary() {\n  const e = useRouteError();\n  console.log("ROOT ERROR BOUNDARY CAUGHT:", e);'
);
fs.writeFileSync(rootFile, content);

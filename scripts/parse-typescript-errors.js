const fs = require('fs');
const path = require('path');

const logFiles = [
  'typecheck-backend.log',
  'typecheck-frontend.log',
  'typecheck-api.log',
  'typecheck-web.log'
];

const errors = [];
let totalErrors = 0;

logFiles.forEach(logFile => {
  const logPath = path.join(__dirname, '..', logFile);
  if (fs.existsSync(logPath)) {
    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.includes('error TS')) {
        totalErrors++;
        const match = line.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
        if (match) {
          errors.push({
            file: match[1],
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            code: match[4],
            message: match[5],
            project: logFile.replace('typecheck-', '').replace('.log', '')
          });
        }
      }
    });
  }
});

const result = {
  totalErrors,
  errors: errors.slice(0, 10),
  hasMore: errors.length > 10,
  projects: {
    backend: errors.filter(e => e.project === 'backend').length,
    frontend: errors.filter(e => e.project === 'frontend').length,
    api: errors.filter(e => e.project === 'api').length,
    web: errors.filter(e => e.project === 'web').length
  }
};

console.log(JSON.stringify(result, null, 2));

process.exit(totalErrors > 0 ? 1 : 0);


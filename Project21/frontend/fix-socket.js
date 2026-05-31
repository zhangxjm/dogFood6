const fs = require('fs');
let content = fs.readFileSync('src/services/socket.ts', 'utf8');
content = content.replace(/  off\(event: string, callback\?\?: \(\.\.\.args: any\[\]\) => void\) \{\s*if \(this\.socket\) \{\s*if \(callback\) \{\s*this\.socket\.off\(event, callback\);\s*\} else \{\s*this\.socket\.off\(event\);\s*\}\s*\}\s*emit/, "  off(event: string, callback?: (...args: any[]) => void) {\n    if (this.socket) {\n      if (callback) {\n        this.socket.off(event, callback);\n      } else {\n        this.socket.off(event);\n      }\n    }\n  }\n\n  emit");
fs.writeFileSync('src/services/socket.ts', content, 'utf8');
console.log('修复格式完成');

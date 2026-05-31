const fs = require('fs');
let content = fs.readFileSync('src/services/socket.ts', 'utf8');
const emitMethod = `
  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
`;
content = content.replace(/\}\s*\}\s*export const liveSocket/, emitMethod + '\n}\n\nexport const liveSocket');
fs.writeFileSync('src/services/socket.ts', content, 'utf8');
console.log('添加emit方法完成');

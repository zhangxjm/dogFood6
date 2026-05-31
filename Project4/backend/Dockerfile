FROM docker.1ms.run/library/node:18-alpine

WORKDIR /app

COPY package.json .
RUN npm install --registry=https://registry.npmmirror.com

COPY . .

RUN chmod +x init-data.js

CMD ["sh", "-c", "node init-data.js && node server.js"]

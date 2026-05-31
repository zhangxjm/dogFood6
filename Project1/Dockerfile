FROM node:18-alpine

WORKDIR /app/server

COPY server/package*.json ./
RUN npm install --production

COPY server/ ./

RUN npm install -g serve

EXPOSE 3000

CMD ["node", "index.js"]

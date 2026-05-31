FROM node:18-alpine

WORKDIR /app

COPY server/package.json ./server/
COPY server/tsconfig.json ./server/
COPY server/nest-cli.json ./server/
COPY server/src ./server/src/

WORKDIR /app/server
RUN npm install
RUN npx tsc

RUN mkdir -p /app/server/public

EXPOSE 3000

CMD ["node", "dist/main.js"]

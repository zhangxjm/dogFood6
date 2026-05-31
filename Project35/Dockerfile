FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN mkdir -p /app/database

EXPOSE 3000

CMD ["sh", "-c", "node database/init.js && npm start"]

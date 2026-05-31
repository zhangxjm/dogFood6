FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN npm run init-db

EXPOSE 3000

CMD ["npm", "start"]

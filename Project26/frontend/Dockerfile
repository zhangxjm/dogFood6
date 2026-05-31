FROM docker.1ms.run/library/node:18-alpine AS builder

WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=1024"
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com && \
    npm install --no-audit --no-fund

COPY . .
RUN npm run build

FROM docker.1ms.run/library/nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

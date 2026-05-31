FROM docker.1ms.run/library/golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod ./
COPY . .

RUN apk add --no-cache gcc musl-dev git && \
    GOPROXY=https://goproxy.cn,direct go mod tidy && \
    CGO_ENABLED=1 CGO_CFLAGS="-D_LARGEFILE64_SOURCE" GOOS=linux go build -o main .

FROM docker.1ms.run/library/alpine:latest

RUN apk add --no-cache sqlite-libs
WORKDIR /app

COPY --from=builder /app/main .
RUN mkdir -p /app/data

EXPOSE 8080

CMD ["./main"]

FROM docker.1ms.run/library/golang:1.21-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git gcc musl-dev

COPY go.mod go.sum ./
RUN go env -w GOPROXY=https://goproxy.cn,direct && \
    go mod download

COPY . .

RUN CGO_ENABLED=1 GOOS=linux go build -o main .

FROM docker.1ms.run/library/alpine:latest

WORKDIR /app

RUN apk add --no-cache ca-certificates sqlite-libs

COPY --from=builder /app/main .
COPY .env.example ./.env

RUN mkdir -p /app/data

EXPOSE 8080

CMD ["./main"]

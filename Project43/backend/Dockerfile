FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod go.sum* ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o bci-server ./cmd/server/main.go

FROM alpine:latest

RUN apk add --no-cache ca-certificates sqlite

WORKDIR /app

COPY --from=builder /app/bci-server /app/bci-server
COPY --from=builder /app/.env /app/.env

RUN mkdir -p /app/data

EXPOSE 8080

CMD ["/app/bci-server"]

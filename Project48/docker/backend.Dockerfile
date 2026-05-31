FROM golang:1.21-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git gcc musl-dev

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ .

RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd

FROM alpine:latest

RUN apk add --no-cache sqlite-libs ca-certificates tzdata
ENV TZ=Asia/Shanghai

WORKDIR /app

COPY --from=builder /app/main .
COPY backend/.env ./.env

RUN mkdir -p /app/data

EXPOSE 8080

CMD ["./main"]

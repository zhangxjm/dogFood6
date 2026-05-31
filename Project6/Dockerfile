FROM golang:1.21-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o farmhouse-order-system .

FROM alpine:3.18

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=builder /app/farmhouse-order-system .
COPY --from=builder /app/conf ./conf
COPY --from=builder /app/views ./views
COPY --from=builder /app/static ./static

EXPOSE 8080

CMD ["./farmhouse-order-system"]

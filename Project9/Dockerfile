FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=1 GOOS=linux go build -o classroom-booking-system .

FROM alpine:3.18

RUN apk add --no-cache sqlite

WORKDIR /app

COPY --from=builder /app/classroom-booking-system .
COPY --from=builder /app/frontend ./frontend

EXPOSE 8080

CMD ["./classroom-booking-system"]

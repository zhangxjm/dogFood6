FROM docker.1ms.run/library/golang:1.21-alpine AS builder

RUN apk add --no-cache gcc musl-dev

WORKDIR /app

COPY go.mod ./
COPY config/ ./config/
COPY db/ ./db/
COPY handlers/ ./handlers/
COPY middleware/ ./middleware/
COPY models/ ./models/
COPY services/ ./services/
COPY main.go ./

RUN go mod tidy
RUN CGO_ENABLED=1 GOOS=linux go build -o edge-backend .

FROM docker.1ms.run/library/alpine:3.19

RUN apk add --no-cache sqlite-dev ca-certificates

WORKDIR /app

COPY --from=builder /app/edge-backend .

RUN mkdir -p /app/data

EXPOSE 8080

CMD ["./edge-backend"]

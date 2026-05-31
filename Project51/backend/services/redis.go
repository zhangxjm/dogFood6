package services

import (
	"context"
	"encoding/json"
	"fmt"
	"nft-audit-system/config"
	"time"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client
var ctx = context.Background()

func InitRedis() error {
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", config.App.RedisHost, config.App.RedisPort),
		Password: config.App.RedisPassword,
		DB:       0,
	})

	_, err := RedisClient.Ping(ctx).Result()
	return err
}

func CacheSet(key string, value interface{}, expiration time.Duration) error {
	jsonData, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return RedisClient.Set(ctx, key, jsonData, expiration).Err()
}

func CacheGet(key string, dest interface{}) error {
	data, err := RedisClient.Get(ctx, key).Result()
	if err != nil {
		return err
	}
	return json.Unmarshal([]byte(data), dest)
}

func CacheDelete(key string) error {
	return RedisClient.Del(ctx, key).Err()
}

func CacheDeletePattern(pattern string) error {
	iter := RedisClient.Scan(ctx, 0, pattern, 0).Iterator()
	for iter.Next(ctx) {
		RedisClient.Del(ctx, iter.Val())
	}
	return iter.Err()
}

func Publish(channel string, message interface{}) error {
	jsonData, err := json.Marshal(message)
	if err != nil {
		return err
	}
	return RedisClient.Publish(ctx, channel, jsonData).Err()
}

type AlertMessage struct {
	Type      string      `json:"type"`
	AlertID   string      `json:"alert_id"`
	Data      interface{} `json:"data"`
	Timestamp time.Time   `json:"timestamp"`
}

func PublishAlert(alert AlertMessage) error {
	alert.Timestamp = time.Now()
	return Publish("nft:alerts", alert)
}

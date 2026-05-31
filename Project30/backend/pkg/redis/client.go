package redis


import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"warehouse-system/internal/config"
)

var (
	RedisClient *RedisClientWrapper
	ctx         = context.Background()
)

type RedisClientWrapper struct {
	client *redis.Client
}

func Init() error {
	client := redis.NewClient(&redis.Options{
		Addr:     config.AppConfig.RedisAddr,
		Password: config.AppConfig.RedisPassword,
		DB:       config.AppConfig.RedisDB,
	})

	if err := client.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("failed to connect to redis: %w", err)
	}

	RedisClient = &RedisClientWrapper{client: client}
	return nil
}

func (r *RedisClientWrapper) SetCache(key string, value interface{}, expiration time.Duration) error {
	if r == nil || r.client == nil {
		return nil
	}

	data, err := json.Marshal(value)
	if err != nil {
		return err
	}

	return r.client.Set(ctx, key, data, expiration).Err()
}

func (r *RedisClientWrapper) GetCache(key string, result interface{}) error {
	if r == nil || r.client == nil {
		return fmt.Errorf("redis client not initialized")
	}

	data, err := r.client.Get(ctx, key).Bytes()
	if err != nil {
		return err
	}

	return json.Unmarshal(data, result)
}

func (r *RedisClientWrapper) DeleteCache(key string) error {
	if r == nil || r.client == nil {
		return nil
	}

	return r.client.Del(ctx, key).Err()
}

func (r *RedisClientWrapper) Publish(channel string, message interface{}) error {
	if r == nil || r.client == nil {
		return nil
	}

	data, err := json.Marshal(message)
	if err != nil {
		return err
	}

	return r.client.Publish(ctx, channel, data).Err()
}

func (r *RedisClientWrapper) Lock(key string, value string, expiration time.Duration) (bool, error) {
	if r == nil || r.client == nil {
		return true, nil
	}

	ok, err := r.client.SetNX(ctx, key, value, expiration).Result()
	if err != nil {
		return false, err
	}
	return ok, nil
}

func (r *RedisClientWrapper) Unlock(key string) error {
	if r == nil || r.client == nil {
		return nil
	}

	return r.client.Del(ctx, key).Err()
}

func (r *RedisClientWrapper) Subscribe(channel string) *redis.PubSub {
	if r == nil || r.client == nil {
		return nil
	}

	return r.client.Subscribe(ctx, channel)
}

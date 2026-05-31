package services

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisService struct {
	client *redis.Client
	ctx    context.Context
}

func NewRedisService(host, port string) *RedisService {
	client := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", host, port),
		Password: "",
		DB:       0,
	})

	return &RedisService{
		client: client,
		ctx:    context.Background(),
	}
}

func (r *RedisService) Close() error {
	return r.client.Close()
}

func (r *RedisService) Ping() error {
	return r.client.Ping(r.ctx).Err()
}

func (r *RedisService) SetDeviceStatus(deviceID string, status map[string]interface{}) error {
	key := fmt.Sprintf("device:status:%s", deviceID)
	data, err := json.Marshal(status)
	if err != nil {
		return err
	}
	return r.client.Set(r.ctx, key, data, 30*time.Second).Err()
}

func (r *RedisService) GetDeviceStatus(deviceID string) (map[string]interface{}, error) {
	key := fmt.Sprintf("device:status:%s", deviceID)
	data, err := r.client.Get(r.ctx, key).Bytes()
	if err != nil {
		return nil, err
	}

	var status map[string]interface{}
	err = json.Unmarshal(data, &status)
	return status, err
}

func (r *RedisService) PublishMetric(channel string, metric interface{}) error {
	data, err := json.Marshal(metric)
	if err != nil {
		return err
	}
	return r.client.Publish(r.ctx, channel, data).Err()
}

func (r *RedisService) Subscribe(channel string) *redis.PubSub {
	return r.client.Subscribe(r.ctx, channel)
}

func (r *RedisService) SetCache(key string, value interface{}, expiration time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return r.client.Set(r.ctx, key, data, expiration).Err()
}

func (r *RedisService) GetCache(key string, result interface{}) error {
	data, err := r.client.Get(r.ctx, key).Bytes()
	if err != nil {
		return err
	}
	return json.Unmarshal(data, result)
}

func (r *RedisService) DeleteCache(key string) error {
	return r.client.Del(r.ctx, key).Err()
}

func (r *RedisService) Increment(key string) (int64, error) {
	return r.client.Incr(r.ctx, key).Result()
}

func (r *RedisService) SetExpire(key string, expiration time.Duration) error {
	return r.client.Expire(r.ctx, key, expiration).Err()
}

func (r *RedisService) PushTask(queue string, task interface{}) error {
	data, err := json.Marshal(task)
	if err != nil {
		return err
	}
	return r.client.LPush(r.ctx, queue, data).Err()
}

func (r *RedisService) PopTask(queue string) (string, error) {
	return r.client.RPop(r.ctx, queue).Result()
}

func (r *RedisService) GetQueueLength(queue string) (int64, error) {
	return r.client.LLen(r.ctx, queue).Result()
}

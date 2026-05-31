package quantum

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"time"

	"github.com/go-redis/redis/v8"
	"quantum-key-distribution/config"
)

var ctx = context.Background()
var rdb *redis.Client

type Qubit struct {
	Value     int
	Basis     int
	Measured  bool
}

type KeyGenerationResult struct {
	ID         string  `json:"id"`
	Key        string  `json:"key"`
	Length     int     `json:"length"`
	ErrorRate  float64 `json:"error_rate"`
	RawKey     []int   `json:"raw_key,omitempty"`
	BasesA     []int   `json:"bases_a,omitempty"`
	BasesB     []int   `json:"bases_b,omitempty"`
	Matched    []bool  `json:"matched,omitempty"`
}

type TransmissionResult struct {
	ID           string  `json:"id"`
	Sender       string  `json:"sender"`
	Receiver     string  `json:"receiver"`
	Key          string  `json:"key"`
	Eavesdropped bool    `json:"eavesdropped"`
	ErrorRate    float64 `json:"error_rate"`
	Success      bool    `json:"success"`
	Status       string  `json:"status"`
}

type SecurityCheckResult struct {
	Type    string `json:"type"`
	Passed  bool   `json:"passed"`
	Details string `json:"details"`
	Score   int    `json:"score"`
}

func InitRedis() {
	rdb = redis.NewClient(&redis.Options{
		Addr:     config.GetRedisAddr(),
		Password: config.GetRedisPassword(),
		DB:       config.GetRedisDB(),
	})
}

func CloseRedis() {
	if rdb != nil {
		rdb.Close()
	}
}

func GetRedisClient() *redis.Client {
	return rdb
}

func GenerateBB84Key(length int) (*KeyGenerationResult, error) {
	if length <= 0 {
		return nil, errors.New("key length must be positive")
	}

	aliceBits := make([]int, length)
	aliceBases := make([]int, length)
	bobBases := make([]int, length)
	bobBits := make([]int, length)

	for i := 0; i < length; i++ {
		aliceBits[i] = randomBit()
		aliceBases[i] = randomBit()
		bobBases[i] = randomBit()
		bobBits[i] = measureQubit(aliceBits[i], aliceBases[i], bobBases[i])
	}

	matched := make([]bool, length)
	var finalKey []int
	for i := 0; i < length; i++ {
		matched[i] = aliceBases[i] == bobBases[i]
		if matched[i] {
			finalKey = append(finalKey, bobBits[i])
		}
	}

	keyHex := bitsToHex(finalKey)
	errorRate := calculateErrorRate(aliceBits, bobBits, matched)

	id := generateID()
	result := &KeyGenerationResult{
		ID:        id,
		Key:       keyHex,
		Length:    len(finalKey),
		ErrorRate: errorRate,
		RawKey:    finalKey,
		BasesA:    aliceBases,
		BasesB:    bobBases,
		Matched:   matched,
	}

	cacheKey := fmt.Sprintf("qkd:key:%s", id)
	data, _ := json.Marshal(result)
	rdb.Set(ctx, cacheKey, data, 24*time.Hour)

	return result, nil
}

func SimulateTransmission(keyID, sender, receiver string, eavesdropProb float64) (*TransmissionResult, error) {
	cacheKey := fmt.Sprintf("qkd:key:%s", keyID)
	data, err := rdb.Get(ctx, cacheKey).Result()
	if err != nil {
		return nil, fmt.Errorf("key not found: %v", err)
	}

	var keyResult KeyGenerationResult
	if err := json.Unmarshal([]byte(data), &keyResult); err != nil {
		return nil, err
	}

	eavesdropped := false
	errorRate := keyResult.ErrorRate

	if eavesdropProb > 0 {
		prob, _ := rand.Int(rand.Reader, big.NewInt(100))
		if float64(prob.Int64()) < eavesdropProb*100 {
			eavesdropped = true
			errorRate += 0.15
			if errorRate > 1 {
				errorRate = 1
			}
		}
	}

	success := errorRate < 0.15
	status := "success"
	if eavesdropped {
		status = "compromised"
	} else if !success {
		status = "failed"
	}

	result := &TransmissionResult{
		ID:           generateID(),
		Sender:       sender,
		Receiver:     receiver,
		Key:          keyResult.Key,
		Eavesdropped: eavesdropped,
		ErrorRate:    errorRate,
		Success:      success,
		Status:       status,
	}

	transKey := fmt.Sprintf("qkd:trans:%s", result.ID)
	transData, _ := json.Marshal(result)
	rdb.Set(ctx, transKey, transData, 24*time.Hour)

	return result, nil
}

func PerformSecurityChecks(key string) []SecurityCheckResult {
	var results []SecurityCheckResult

	results = append(results, checkRandomness(key))
	results = append(results, checkEntropy(key))
	results = append(results, checkDistribution(key))
	results = append(results, checkLength(key))

	return results
}

func checkRandomness(key string) SecurityCheckResult {
	score := 0
	runs := 0
	prev := byte(0)
	for i := 0; i < len(key); i++ {
		if i > 0 && key[i] != prev {
			runs++
		}
		prev = key[i]
	}

	expectedRuns := len(key) / 2
	variance := float64(runs-expectedRuns) / float64(expectedRuns) * 100

	passed := variance < 30
	if passed {
		score = 25
	}

	return SecurityCheckResult{
		Type:    "随机数测试",
		Passed:  passed,
		Details: fmt.Sprintf("游程数: %d, 期望值: %d, 偏差: %.2f%%", runs, expectedRuns, variance),
		Score:   score,
	}
}

func checkEntropy(key string) SecurityCheckResult {
	freq := make(map[byte]int)
	for i := 0; i < len(key); i++ {
		freq[key[i]]++
	}

	entropy := 0.0
	total := float64(len(key))
	for _, count := range freq {
		p := float64(count) / total
		entropy -= p * log2(p)
	}

	maxEntropy := 4.0
	normalized := entropy / maxEntropy * 100

	passed := normalized > 70
	score := 0
	if passed {
		score = 25
	}

	return SecurityCheckResult{
		Type:    "熵测试",
		Passed:  passed,
		Details: fmt.Sprintf("香农熵: %.4f bits/char, 最大值: %.4f, 质量: %.1f%%", entropy, maxEntropy, normalized),
		Score:   score,
	}
}

func checkDistribution(key string) SecurityCheckResult {
	freq := make(map[byte]int)
	for i := 0; i < len(key); i++ {
		freq[key[i]]++
	}

	expected := float64(len(key)) / 16
	chiSquare := 0.0
	for _, count := range freq {
		diff := float64(count) - expected
		chiSquare += diff * diff / expected
	}

	passed := chiSquare < 40
	score := 0
	if passed {
		score = 25
	}

	return SecurityCheckResult{
		Type:    "分布测试",
		Passed:  passed,
		Details: fmt.Sprintf("卡方值: %.4f, 字符种类: %d", chiSquare, len(freq)),
		Score:   score,
	}
}

func checkLength(key string) SecurityCheckResult {
	length := len(key) * 4
	passed := length >= 128
	score := 0
	if passed {
		score = 25
	}

	level := "弱"
	if length >= 256 {
		level = "强"
	} else if length >= 128 {
		level = "中"
	}

	return SecurityCheckResult{
		Type:    "密钥长度测试",
		Passed:  passed,
		Details: fmt.Sprintf("密钥长度: %d bits, 安全等级: %s", length, level),
		Score:   score,
	}
}

func randomBit() int {
	n, _ := rand.Int(rand.Reader, big.NewInt(2))
	return int(n.Int64())
}

func measureQubit(value, basisA, basisB int) int {
	if basisA == basisB {
		return value
	}
	return randomBit()
}

func bitsToHex(bits []int) string {
	bytes := make([]byte, 0)
	for i := 0; i < len(bits); i += 8 {
		end := i + 8
		if end > len(bits) {
			end = len(bits)
		}
		var b byte
		for j := i; j < end; j++ {
			b = b<<1 | byte(bits[j])
		}
		bytes = append(bytes, b)
	}
	return hex.EncodeToString(bytes)
}

func calculateErrorRate(a, b []int, matched []bool) float64 {
	sampleSize := 0
	errors := 0
	for i := 0; i < len(a) && i < len(b); i++ {
		if matched[i] {
			sampleSize++
			if a[i] != b[i] {
				errors++
			}
		}
	}
	if sampleSize == 0 {
		return 0
	}
	return float64(errors) / float64(sampleSize)
}

func generateID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func log2(x float64) float64 {
	if x <= 0 {
		return 0
	}
	return fastLog(x) / 0.6931471805599453
}

func fastLog(x float64) float64 {
	result := 0.0
	for x > 1 {
		result += 0.6931471805599453
		x /= 2.718281828459045
	}
	for x < 0.5 {
		result -= 0.6931471805599453
		x *= 2.718281828459045
	}
	x -= 1
	term := x
	for i := 1; i <= 10; i++ {
		result += term / float64(i)
		term *= -x
	}
	return result
}

func StoreKeyInCache(keyID, key string, ttl time.Duration) error {
	return rdb.Set(ctx, fmt.Sprintf("qkd:active:%s", keyID), key, ttl).Err()
}

func GetKeyFromCache(keyID string) (string, error) {
	return rdb.Get(ctx, fmt.Sprintf("qkd:active:%s", keyID)).Result()
}

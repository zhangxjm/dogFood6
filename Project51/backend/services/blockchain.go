package services

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"math/big"
	"nft-audit-system/database"
	"strconv"
	"sync"
	"time"
)

type BlockData struct {
	Number       string   `json:"number"`
	Hash         string   `json:"hash"`
	Timestamp    string   `json:"timestamp"`
	Transactions []string `json:"transactions"`
	GasUsed      string   `json:"gasUsed"`
}

type NFTTransfer struct {
	TxHash      string
	TokenID     string
	From        string
	To          string
	Value       string
	Contract    string
	BlockNumber uint64
}

var (
	latestBlockNumber uint64 = 18500000
	blockMutex        sync.Mutex
	simulatedBlocks   []BlockData
)

func InitBlockchain() {
	for i := 0; i < 10; i++ {
		block := generateSimulatedBlock(latestBlockNumber - uint64(9-i))
		simulatedBlocks = append(simulatedBlocks, block)
	}
}

func generateSimulatedBlock(blockNum uint64) BlockData {
	txCount, _ := rand.Int(rand.Reader, big.NewInt(50))
	txCountInt := int(txCount.Int64()) + 10

	txs := make([]string, txCountInt)
	for i := 0; i < txCountInt; i++ {
		txs[i] = randomHash()
	}

	return BlockData{
		Number:       fmt.Sprintf("0x%x", blockNum),
		Hash:         randomHash(),
		Timestamp:    fmt.Sprintf("0x%x", time.Now().Unix()),
		Transactions: txs,
		GasUsed:      "0x" + strconv.FormatUint(8000000+blockNum%1000000, 16),
	}
}

func randomHash() string {
	b := make([]byte, 32)
	rand.Read(b)
	return "0x" + hex.EncodeToString(b)
}

func GetLatestBlock() (BlockData, error) {
	blockMutex.Lock()
	defer blockMutex.Unlock()

	latestBlockNumber++
	newBlock := generateSimulatedBlock(latestBlockNumber)
	simulatedBlocks = append(simulatedBlocks, newBlock)

	if len(simulatedBlocks) > 100 {
		simulatedBlocks = simulatedBlocks[1:]
	}

	return newBlock, nil
}

func GetBlockByNumber(blockNum uint64) (BlockData, error) {
	blockMutex.Lock()
	defer blockMutex.Unlock()

	for _, block := range simulatedBlocks {
		num, _ := strconv.ParseUint(block.Number[2:], 16, 64)
		if num == blockNum {
			return block, nil
		}
	}

	return generateSimulatedBlock(blockNum), nil
}

func GetRecentBlocks(count int) []BlockData {
	blockMutex.Lock()
	defer blockMutex.Unlock()

	start := len(simulatedBlocks) - count
	if start < 0 {
		start = 0
	}

	result := make([]BlockData, len(simulatedBlocks)-start)
	copy(result, simulatedBlocks[start:])

	return result
}

func ParseNFTTransfer(txHash string) (*NFTTransfer, error) {
	cacheKey := fmt.Sprintf("tx:%s", txHash)
	var cached NFTTransfer
	if err := CacheGet(cacheKey, &cached); err == nil {
		return &cached, nil
	}

	var items []database.NFTItem
	database.DB.Limit(1).Order("RANDOM()").Find(&items)
	if len(items) == 0 {
		return nil, fmt.Errorf("no NFT items found")
	}

	value, _ := rand.Int(rand.Reader, big.NewInt(5000000000000000000))

	transfer := &NFTTransfer{
		TxHash:      txHash,
		TokenID:     items[0].TokenID,
		From:        "0x" + randomAddr()[2:],
		To:          "0x" + randomAddr()[2:],
		Value:       value.String(),
		Contract:    "0x" + randomAddr()[2:],
		BlockNumber: latestBlockNumber,
	}

	CacheSet(cacheKey, transfer, 5*time.Minute)
	return transfer, nil
}

func ParseTransactionData(txHash string) (map[string]interface{}, error) {
	transfer, err := ParseNFTTransfer(txHash)
	if err != nil {
		return nil, err
	}

	bigIntValue, _ := new(big.Int).SetString(transfer.Value, 10)
	valueFloat, _ := new(big.Float).SetInt(bigIntValue).Float64()
	ethValue := valueFloat / 1e18

	result := map[string]interface{}{
		"txHash":      transfer.TxHash,
		"tokenId":     transfer.TokenID,
		"from":        transfer.From,
		"to":          transfer.To,
		"value":       ethValue,
		"contract":    transfer.Contract,
		"blockNumber": transfer.BlockNumber,
		"timestamp":   time.Now().Unix(),
		"type":        "NFT_TRANSFER",
	}

	return result, nil
}

func randomAddr() string {
	b := make([]byte, 20)
	rand.Read(b)
	return "0x" + hex.EncodeToString(b)
}

func GetTransactionDetail(txHash string) (map[string]interface{}, error) {
	var tx database.Transaction
	if err := database.DB.Where("tx_hash = ?", txHash).First(&tx).Error; err == nil {
		return map[string]interface{}{
			"txHash":      tx.TxHash,
			"blockNumber": tx.BlockNumber,
			"tokenId":     tx.TokenID,
			"from":        tx.FromAddr,
			"to":          tx.ToAddr,
			"price":       tx.Price,
			"currency":    tx.Currency,
			"timestamp":   tx.TxTimestamp.Unix(),
			"status":      tx.Status,
			"gasUsed":     tx.GasUsed,
			"gasPrice":    tx.GasPrice,
			"isAnomaly":   tx.IsAnomaly,
			"anomalyType": tx.AnomalyType,
		}, nil
	}

	data, _ := ParseTransactionData(txHash)
	data["gasUsed"] = 85000
	data["gasPrice"] = "25000000000"
	data["status"] = "success"
	data["isAnomaly"] = false
	return data, nil
}

func GetAddressBalance(addr string) map[string]interface{} {
	maxBalance := new(big.Int)
	maxBalance.SetString("10000000000000000000", 10)
	balance, _ := rand.Int(rand.Reader, maxBalance)
	balanceFloat, _ := new(big.Float).SetInt(balance).Float64()

	return map[string]interface{}{
		"address": addr,
		"balance": balanceFloat / 1e18,
		"unit":    "ETH",
	}
}

func GetAddressHistory(addr string, page, size int) map[string]interface{} {
	var txs []database.Transaction
	var total int64

	offset := (page - 1) * size
	database.DB.Where("from_addr = ? OR to_addr = ?", addr, addr).
		Order("tx_timestamp DESC").
		Count(&total).
		Limit(size).
		Offset(offset).
		Find(&txs)

	return map[string]interface{}{
		"total": total,
		"page":  page,
		"size":  size,
		"list":  txs,
	}
}

type ChainStats struct {
	BlockHeight   uint64  `json:"blockHeight"`
	TotalTxCount  int64   `json:"totalTxCount"`
	ActiveWallets int64   `json:"activeWallets"`
	TotalVolume   float64 `json:"totalVolume"`
	APY           float64 `json:"apy"`
}

func GetChainStats() ChainStats {
	blockMutex.Lock()
	height := latestBlockNumber
	blockMutex.Unlock()

	var totalTx int64
	var totalVolume float64
	database.DB.Model(&database.Transaction{}).Count(&totalTx)
	database.DB.Model(&database.Transaction{}).Select("COALESCE(SUM(price), 0)").Scan(&totalVolume)

	var activeWallets int64
	database.DB.Model(&database.Transaction{}).
		Select("COUNT(DISTINCT from_addr)").
		Where("tx_timestamp > ?", time.Now().AddDate(0, 0, -7)).
		Scan(&activeWallets)

	return ChainStats{
		BlockHeight:   height,
		TotalTxCount:  totalTx,
		ActiveWallets: activeWallets,
		TotalVolume:   totalVolume,
		APY:           12.5,
	}
}

func GetCollectionStats(collectionID uint) map[string]interface{} {
	var floorPrice, avgPrice, volume24h float64
	var txCount int64

	database.DB.Model(&database.Transaction{}).
		Where("collection_id = ?", collectionID).
		Select("MIN(price)").Scan(&floorPrice)
	database.DB.Model(&database.Transaction{}).
		Where("collection_id = ?", collectionID).
		Select("AVG(price)").Scan(&avgPrice)
	database.DB.Model(&database.Transaction{}).
		Where("collection_id = ? AND tx_timestamp > ?", collectionID, time.Now().AddDate(0, 0, -1)).
		Select("COALESCE(SUM(price), 0)").Scan(&volume24h)
	database.DB.Model(&database.Transaction{}).
		Where("collection_id = ?", collectionID).
		Count(&txCount)

	return map[string]interface{}{
		"floorPrice": floorPrice,
		"avgPrice":   avgPrice,
		"volume24h":  volume24h,
		"txCount":    txCount,
	}
}

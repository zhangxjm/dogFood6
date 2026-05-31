package database

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"math/big"
	"time"
)

func randomHash() string {
	b := make([]byte, 32)
	rand.Read(b)
	return "0x" + hex.EncodeToString(b)
}

func randomAddr() string {
	b := make([]byte, 20)
	rand.Read(b)
	return "0x" + hex.EncodeToString(b)
}

func randomFloat(min, max float64) float64 {
	n, _ := rand.Int(rand.Reader, big.NewInt(1000000))
	return min + (float64(n.Int64())/1000000.0)*(max-min)
}

func Seed() error {
	var count int64
	DB.Model(&NFTCollection{}).Count(&count)
	if count > 0 {
		return nil
	}

	collections := []NFTCollection{
		{
			ContractAddr: randomAddr(),
			Name:         "数字艺术珍品系列",
			Symbol:       "DART",
			OwnerAddr:    randomAddr(),
			IsVerified:   true,
			CreatedAt:    time.Now().AddDate(0, -6, 0),
		},
		{
			ContractAddr: randomAddr(),
			Name:         "非遗文化数字藏品",
			Symbol:       "HERIT",
			OwnerAddr:    randomAddr(),
			IsVerified:   true,
			CreatedAt:    time.Now().AddDate(0, -4, 0),
		},
		{
			ContractAddr: randomAddr(),
			Name:         "虚拟地产元宇宙",
			Symbol:       "LAND",
			OwnerAddr:    randomAddr(),
			IsVerified:   false,
			CreatedAt:    time.Now().AddDate(0, -2, 0),
		},
		{
			ContractAddr: randomAddr(),
			Name:         "体育明星纪念卡",
			Symbol:       "SPORT",
			OwnerAddr:    randomAddr(),
			IsVerified:   true,
			CreatedAt:    time.Now().AddDate(0, -3, 0),
		},
	}

	for i := range collections {
		if err := DB.Create(&collections[i]).Error; err != nil {
			return err
		}
	}

	nftNames := []string{"山水画#", "书法作品#", "陶瓷艺术#", "京剧脸谱#", "敦煌飞天#", "古钱币#", "青铜器#", "玉器#"}
	for cIdx, collection := range collections {
		for i := 1; i <= 10; i++ {
			tokenID := fmt.Sprintf("%s-%d", collection.Symbol, i)
			item := NFTItem{
				TokenID:       tokenID,
				CollectionID:  collection.ID,
				Name:          fmt.Sprintf("%s%d", nftNames[(cIdx+i)%len(nftNames)], i),
				Description:   fmt.Sprintf("这是一件精美的%s系列数字藏品", collection.Name),
				ImageURI:      fmt.Sprintf("https://example.com/nft/%s.png", tokenID),
				OwnerAddr:     randomAddr(),
				CreatorAddr:   collection.OwnerAddr,
				RoyaltyFee:    randomFloat(0.02, 0.1),
				MintTimestamp: time.Now().AddDate(0, 0, -30-i),
				CreatedAt:     time.Now().AddDate(0, 0, -30-i),
			}
			if err := DB.Create(&item).Error; err != nil {
				return err
			}
		}
	}

	var allNFTs []NFTItem
	DB.Find(&allNFTs)

	anomalyTypes := []string{"", "", "", "", "price_anomaly", "wash_trading", "blacklist_addr", "high_freq_trade"}
	severities := []string{"low", "medium", "high", "critical"}

	for i := 1; i <= 100; i++ {
		nft := allNFTs[(i-1)%len(allNFTs)]
		anomalyIdx := (i + 17) % len(anomalyTypes)
		anomalyType := anomalyTypes[anomalyIdx]
		isAnomaly := anomalyType != ""

		tx := Transaction{
			TxHash:       randomHash(),
			BlockNumber:  uint64(18000000 + i*13),
			TokenID:      nft.TokenID,
			CollectionID: nft.CollectionID,
			FromAddr:     randomAddr(),
			ToAddr:       randomAddr(),
			Price:        randomFloat(0.1, 10.0),
			Currency:     "ETH",
			TxTimestamp:  time.Now().AddDate(0, 0, -i),
			GasUsed:      uint64(80000 + i*100),
			GasPrice:     fmt.Sprintf("%d", 20000000000+i*100000000),
			Status:       "success",
			IsAnomaly:    isAnomaly,
			AnomalyType:  anomalyType,
			AnomalyScore: func() float64 {
				if isAnomaly {
					return randomFloat(0.7, 0.99)
				}
				return randomFloat(0.01, 0.3)
			}(),
			Reported:  i <= 20 && isAnomaly,
			CreatedAt: time.Now().AddDate(0, 0, -i),
		}
		if err := DB.Create(&tx).Error; err != nil {
			return err
		}

		if isAnomaly {
			alert := AnomalyAlert{
				AlertID:       fmt.Sprintf("ALT-%06d", i),
				TxID:          tx.ID,
				AlertType:     anomalyType,
				Severity:      severities[(i+3)%len(severities)],
				Description:   fmt.Sprintf("检测到异常交易类型: %s, 交易哈希: %s", anomalyType, tx.TxHash[:20]+"..."),
				RiskScore:     tx.AnomalyScore,
				InvolvedAddrs: fmt.Sprintf("[%s, %s]", tx.FromAddr, tx.ToAddr),
				Status: func() string {
					if i <= 10 {
						return "resolved"
					} else if i <= 15 {
						return "investigating"
					}
					return "pending"
				}(),
				HandledBy: func() string {
					if i <= 10 {
						return "监管员"
					}
					return ""
				}(),
				HandledAt: func() *time.Time {
					if i <= 10 {
						t := time.Now().AddDate(0, 0, -i+1)
						return &t
					}
					return nil
				}(),
				HandleNote: func() string {
					if i <= 10 {
						return "已核实并标记为风险交易，相关地址已加入监控名单"
					}
					return ""
				}(),
				CreatedAt: tx.CreatedAt,
			}
			if err := DB.Create(&alert).Error; err != nil {
				return err
			}
		}
	}

	reportTypes := []string{"daily", "weekly", "monthly"}
	periods := []string{"2024-01-15", "2024-W03", "2024-01"}
	for i := range reportTypes {
		report := ComplianceReport{
			ReportID:     fmt.Sprintf("RPT-%s-%03d", reportTypes[i], i+1),
			ReportType:   reportTypes[i],
			ReportPeriod: periods[i],
			StartDate:    time.Now().AddDate(0, 0, -30*(i+1)),
			EndDate:      time.Now().AddDate(0, 0, -10*(i+1)),
			TotalTxCount: uint64(100 + i*50),
			AnomalyCount: uint64(5 + i*2),
			TotalVolume:  float64(50 + i*30),
			ReportedCount: uint64(3 + i),
			Status:       "submitted",
			SubmittedAt:  func() *time.Time { t := time.Now(); return &t }(),
			SubmittedBy:  "系统自动上报",
			RegulatorAck: true,
			CreatedAt:    time.Now(),
		}
		if err := DB.Create(&report).Error; err != nil {
			return err
		}
	}

	regulators := []RegulatorUser{
		{Username: "admin", FullName: "系统管理员", Role: "admin", Department: "技术部"},
		{Username: "auditor1", FullName: "张审计", Role: "auditor", Department: "审计科"},
		{Username: "auditor2", FullName: "李监管", Role: "auditor", Department: "监管科"},
		{Username: "compliance", FullName: "王合规", Role: "compliance", Department: "合规部"},
	}
	for _, r := range regulators {
		if err := DB.Create(&r).Error; err != nil {
			return err
		}
	}

	blacklistReasons := []string{"涉嫌洗钱活动", "已知黑客地址", "制裁名单", "欺诈交易"}
	for i := 1; i <= 10; i++ {
		addr := BlacklistAddr{
			Address:  randomAddr(),
			Reason:   blacklistReasons[(i-1)%len(blacklistReasons)],
			Source:   "链上分析系统",
			AddedBy:  "系统自动检测",
			IsActive: true,
			CreatedAt: time.Now().AddDate(0, 0, -i*5),
		}
		if err := DB.Create(&addr).Error; err != nil {
			return err
		}
	}

	for _, collection := range collections {
		oracle := PriceOracle{
			CollectionID:   collection.ID,
			AvgPrice:       randomFloat(1.0, 5.0),
			MaxPrice:       randomFloat(5.0, 15.0),
			MinPrice:       randomFloat(0.05, 0.5),
			Price24hChange: randomFloat(-0.15, 0.25),
			WindowStart:    time.Now().AddDate(0, 0, -1),
			WindowEnd:      time.Now(),
			CreatedAt:      time.Now(),
		}
		if err := DB.Create(&oracle).Error; err != nil {
			return err
		}
	}

	return nil
}

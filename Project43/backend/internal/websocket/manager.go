package websocket

import (
	"encoding/json"
	"log"
	"math"
	"math/rand"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"bci-rehab/pkg/eeg"
	"bci-rehab/pkg/security"
)

type Client struct {
	ID        int64
	Conn      *websocket.Conn
	Send      chan []byte
	SessionID int64
	UserID    int64
	Command   string
	IsActive  bool
	mu        sync.Mutex
}

type Message struct {
	Type      string      `json:"type"`
	Data      interface{} `json:"data"`
	Timestamp time.Time   `json:"timestamp"`
}

type EEGData struct {
	SessionID   int64              `json:"session_id"`
	Timestamp   time.Time          `json:"timestamp"`
	Channels    [8]float64         `json:"channels"`
	Quality     float64            `json:"quality"`
	Command     string             `json:"command"`
	Processed   eeg.ProcessResult  `json:"processed"`
}

type CommandFeedback struct {
	Command    string  `json:"command"`
	Confidence float64 `json:"confidence"`
	Success    bool    `json:"success"`
	Feedback   string  `json:"feedback"`
}

type Manager struct {
	Clients    map[*Client]bool
	Broadcast  chan []byte
	Register   chan *Client
	Unregister chan *Client
	processor  *eeg.EEGProcessor
	mu         sync.RWMutex
}

func NewManager() *Manager {
	return &Manager{
		Clients:    make(map[*Client]bool),
		Broadcast:  make(chan []byte),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		processor:  eeg.NewEEGProcessor(),
	}
}

func (m *Manager) Run() {
	for {
		select {
		case client := <-m.Register:
			m.mu.Lock()
			m.Clients[client] = true
			m.mu.Unlock()
			log.Printf("Client %d connected", client.UserID)

		case client := <-m.Unregister:
			m.mu.Lock()
			if _, ok := m.Clients[client]; ok {
				delete(m.Clients, client)
				close(client.Send)
				client.IsActive = false
				log.Printf("Client %d disconnected", client.UserID)
			}
			m.mu.Unlock()

		case message := <-m.Broadcast:
			m.mu.RLock()
			for client := range m.Clients {
				select {
				case client.Send <- message:
				default:
					close(client.Send)
					delete(m.Clients, client)
				}
			}
			m.mu.RUnlock()
		}
	}
}

func (m *Manager) SimulateEEG(client *Client) {
	if !client.IsActive {
		return
	}

	ticker := time.NewTicker(500 * time.Millisecond)
	defer ticker.Stop()

	sampleCount := 0
	successCount := 0
	confidenceSum := 0.0

	for range ticker.C {
		if !client.IsActive {
			return
		}

		samples := generateSimulatedEEG(client.Command, sampleCount)
		enhanced := m.processor.ProcessWeakSignal(samples[:])
		result := m.processor.Process(enhanced, client.Command)

		channels := [8]float64{}
		for i := 0; i < 8 && i < len(enhanced); i++ {
			channels[i] = math.Round(enhanced[i]*100) / 100
		}

		eegData := EEGData{
			SessionID: client.SessionID,
			Timestamp: time.Now(),
			Channels:  channels,
			Quality:   result.SignalQuality,
			Command:   client.Command,
			Processed: result,
		}

		eegMsg := Message{
			Type:      "eeg_data",
			Data:      eegData,
			Timestamp: time.Now(),
		}

		eegBytes, _ := json.Marshal(eegMsg)
		client.mu.Lock()
		err := client.Conn.WriteMessage(websocket.TextMessage, eegBytes)
		client.mu.Unlock()

		if err != nil {
			log.Printf("Error sending EEG data: %v", err)
			return
		}

		sampleCount++
		confidenceSum += result.Confidence

		success := result.Confidence > 65
		if success {
			successCount++
		}

		if sampleCount%10 == 0 {
			avgConfidence := confidenceSum / 10
			_ = float64(successCount) / 10 * 100

			feedback := generateFeedback(result.Command, result.Confidence, success)
			cmdFeedback := CommandFeedback{
				Command:    client.Command,
				Confidence: math.Round(avgConfidence*10) / 10,
				Success:    success,
				Feedback:   feedback,
			}

			feedbackMsg := Message{
				Type:      "command_feedback",
				Data:      cmdFeedback,
				Timestamp: time.Now(),
			}

			feedbackBytes, _ := json.Marshal(feedbackMsg)
			client.mu.Lock()
			client.Conn.WriteMessage(websocket.TextMessage, feedbackBytes)
			client.mu.Unlock()

			confidenceSum = 0
			successCount = 0
		}

		go storeEEGData(client.SessionID, client.UserID, eegData)
	}
}

func generateSimulatedEEG(command string, count int) [32]float64 {
	var data [32]float64
	baseFreq := getCommandFrequency(command)

	for i := 0; i < 32; i++ {
		t := float64(count*32+i) * 0.01
		noise := (rand.Float64() - 0.5) * 8
		signal := 15 * math.Sin(2*math.Pi*baseFreq*t)
		harmonic := 8 * math.Sin(2*math.Pi*baseFreq*2*t)
		data[i] = signal + harmonic + noise
	}

	return data
}

func getCommandFrequency(command string) float64 {
	switch command {
	case "LEFT_HAND", "RIGHT_HAND":
		return 10.0
	case "LEFT_FOOT", "RIGHT_FOOT", "WALK":
		return 7.5
	case "RELAX":
		return 12.0
	case "FOCUS":
		return 15.0
	case "BOTH_HANDS", "ARMS_UP":
		return 9.0
	case "TONGUE":
		return 11.0
	default:
		return 10.0
	}
}

func generateFeedback(command string, confidence float64, success bool) string {
	if success {
		positiveFeedback := []string{
			"做得很好！继续保持",
			"信号识别成功，非常棒",
			"表现优异，继续加油",
			"脑电信号清晰，识别准确",
			"专注力很好，保持状态",
		}
		return positiveFeedback[rand.Intn(len(positiveFeedback))]
	}

	if confidence > 50 {
		return "接近目标，再专注一点"
	}

	return "请放松，按照提示重新尝试"
}

func storeEEGData(sessionID, userID int64, data EEGData) {
	// Data storage handled in handlers
}

func ValidateConnection(token string) (int64, string, error) {
	claims, err := security.ValidateToken(token)
	if err != nil {
		return 0, "", err
	}
	return claims.UserID, claims.Role, nil
}

var WsManager = NewManager()

type OnMessageFunc func(client *Client, msgType string, data map[string]interface{})

var onMessageCallback OnMessageFunc

func SetOnMessageCallback(f OnMessageFunc) {
	onMessageCallback = f
}

func (c *Client) WritePump() {
	for message := range c.Send {
		c.mu.Lock()
		err := c.Conn.WriteMessage(websocket.TextMessage, message)
		c.mu.Unlock()
		if err != nil {
			log.Printf("Write error: %v", err)
			break
		}
	}
	c.Conn.Close()
}

func (c *Client) ReadPump(manager *Manager) {
	defer func() {
		manager.Unregister <- c
		c.Conn.Close()
	}()

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Read error: %v", err)
			}
			break
		}

		var msg struct {
			Type string                 `json:"type"`
			Data map[string]interface{} `json:"data"`
		}
		if err := json.Unmarshal(message, &msg); err == nil {
			if msg.Type == "command_change" {
				if newCmd, ok := msg.Data["command"].(string); ok {
					c.Command = newCmd
				}
			} else if onMessageCallback != nil {
				onMessageCallback(c, msg.Type, msg.Data)
			}
		}

		manager.Broadcast <- message
	}
}

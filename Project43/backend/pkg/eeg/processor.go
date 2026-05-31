package eeg

import (
	"math"
	"sync"
)

type EEGProcessor struct {
	sampleRate      int
	filterOrder     int
	notchFreq       float64
	lowPassFreq     float64
	highPassFreq    float64
	history         []float64
	historySize     int
	mu              sync.Mutex
}

type ProcessResult struct {
	Filtered      []float64
	SignalQuality float64
	NoiseLevel    float64
	Features      map[string]float64
	Command       string
	Confidence    float64
}

func NewEEGProcessor() *EEGProcessor {
	return &EEGProcessor{
		sampleRate:   256,
		filterOrder:  4,
		notchFreq:    50.0,
		lowPassFreq:  30.0,
		highPassFreq: 0.5,
		historySize:  1024,
		history:      make([]float64, 0, 1024),
	}
}

func (p *EEGProcessor) Process(samples []float64, command string) ProcessResult {
	p.mu.Lock()
	defer p.mu.Unlock()

	if len(samples) == 0 {
		return ProcessResult{}
	}

	filtered := p.applyFilters(samples)
	quality := p.calculateSignalQuality(filtered)
	noise := p.calculateNoiseLevel(samples, filtered)
	features := p.extractFeatures(filtered)
	confidence := p.calculateConfidence(quality, features, command)

	p.history = append(p.history, filtered...)
	if len(p.history) > p.historySize {
		p.history = p.history[len(p.history)-p.historySize:]
	}

	return ProcessResult{
		Filtered:      filtered,
		SignalQuality: quality,
		NoiseLevel:    noise,
		Features:      features,
		Command:       command,
		Confidence:    confidence,
	}
}

func (p *EEGProcessor) applyFilters(signal []float64) []float64 {
	result := make([]float64, len(signal))
	copy(result, signal)

	result = p.highPassFilter(result)
	result = p.lowPassFilter(result)
	result = p.notchFilter(result)

	return result
}

func (p *EEGProcessor) highPassFilter(signal []float64) []float64 {
	if len(signal) < 3 {
		return signal
	}
	result := make([]float64, len(signal))
	alpha := 0.95
	result[0] = signal[0]
	for i := 1; i < len(signal); i++ {
		result[i] = alpha * (result[i-1] + signal[i] - signal[i-1])
	}
	return result
}

func (p *EEGProcessor) lowPassFilter(signal []float64) []float64 {
	if len(signal) < 3 {
		return signal
	}
	result := make([]float64, len(signal))
	alpha := 0.1
	result[0] = signal[0]
	for i := 1; i < len(signal); i++ {
		result[i] = alpha*signal[i] + (1-alpha)*result[i-1]
	}
	return result
}

func (p *EEGProcessor) notchFilter(signal []float64) []float64 {
	if len(signal) < 4 {
		return signal
	}
	result := make([]float64, len(signal))
	copy(result, signal)
	b0, b1, b2 := 0.9691, -1.8879, 0.9691
	a1, a2 := -1.8879, 0.9382

	for i := 2; i < len(signal); i++ {
		result[i] = b0*signal[i] + b1*signal[i-1] + b2*signal[i-2] - a1*result[i-1] - a2*result[i-2]
	}
	return result
}

func (p *EEGProcessor) calculateSignalQuality(filtered []float64) float64 {
	if len(filtered) == 0 {
		return 0
	}

	mean := 0.0
	for _, v := range filtered {
		mean += v
	}
	mean /= float64(len(filtered))

	variance := 0.0
	for _, v := range filtered {
		diff := v - mean
		variance += diff * diff
	}
	variance /= float64(len(filtered))
	std := math.Sqrt(variance)

	quality := 100.0
	if std > 50 {
		quality = 30.0
	} else if std > 30 {
		quality = 50.0
	} else if std > 20 {
		quality = 70.0
	} else if std > 10 {
		quality = 85.0
	}

	return math.Max(0, math.Min(100, quality))
}

func (p *EEGProcessor) calculateNoiseLevel(raw, filtered []float64) float64 {
	if len(raw) == 0 || len(filtered) == 0 {
		return 0
	}

	totalNoise := 0.0
	count := len(raw)
	if len(filtered) < count {
		count = len(filtered)
	}

	for i := 0; i < count; i++ {
		diff := raw[i] - filtered[i]
		totalNoise += math.Abs(diff)
	}

	return totalNoise / float64(count)
}

func (p *EEGProcessor) extractFeatures(filtered []float64) map[string]float64 {
	features := make(map[string]float64)

	if len(filtered) == 0 {
		return features
	}

	mean := 0.0
	for _, v := range filtered {
		mean += v
	}
	mean /= float64(len(filtered))

	variance := 0.0
	for _, v := range filtered {
		diff := v - mean
		variance += diff * diff
	}
	variance /= float64(len(filtered))
	std := math.Sqrt(variance)

	max := filtered[0]
	min := filtered[0]
	for _, v := range filtered {
		if v > max {
			max = v
		}
		if v < min {
			min = v
		}
	}

	zeroCrossings := 0
	for i := 1; i < len(filtered); i++ {
		if (filtered[i-1] >= 0 && filtered[i] < 0) || (filtered[i-1] < 0 && filtered[i] >= 0) {
			zeroCrossings++
		}
	}

	peakToPeak := max - min
	rms := math.Sqrt(variance)

	features["mean"] = mean
	features["std"] = std
	features["variance"] = variance
	features["max"] = max
	features["min"] = min
	features["peak_to_peak"] = peakToPeak
	features["rms"] = rms
	features["zero_crossings"] = float64(zeroCrossings)
	features["zero_crossing_rate"] = float64(zeroCrossings) / float64(len(filtered))
	features["energy"] = rms * rms
	features["complexity"] = std / (math.Abs(mean) + 1e-10)

	return features
}

func (p *EEGProcessor) calculateConfidence(quality float64, features map[string]float64, command string) float64 {
	baseConfidence := quality / 100.0

	std := features["std"]
	zcRate := features["zero_crossing_rate"]

	patternMatch := 0.5

	switch command {
	case "LEFT_HAND", "RIGHT_HAND":
		if std > 5 && std < 25 && zcRate > 0.1 && zcRate < 0.4 {
			patternMatch = 0.85
		} else if std > 3 && std < 30 {
			patternMatch = 0.7
		}
	case "LEFT_FOOT", "RIGHT_FOOT", "WALK":
		if std > 8 && std < 30 && zcRate > 0.05 && zcRate < 0.3 {
			patternMatch = 0.8
		} else if std > 5 && std < 35 {
			patternMatch = 0.65
		}
	case "RELAX":
		if std < 15 && zcRate < 0.2 {
			patternMatch = 0.9
		} else if std < 20 {
			patternMatch = 0.75
		}
	case "FOCUS":
		if std > 10 && std < 25 && zcRate > 0.15 && zcRate < 0.35 {
			patternMatch = 0.85
		} else if std > 8 && std < 30 {
			patternMatch = 0.7
		}
	default:
		if std > 5 && std < 30 {
			patternMatch = 0.7
		}
	}

	confidence := (baseConfidence*0.4 + patternMatch*0.6) * 100

	if confidence < 30 {
		confidence = 30 + math.Sin(0.1)*10
	}
	if confidence > 98 {
		confidence = 98
	}

	return math.Round(confidence*10) / 10
}

func (p *EEGProcessor) ProcessWeakSignal(samples []float64) []float64 {
	if len(samples) < 8 {
		return samples
	}

	enhanced := make([]float64, len(samples))
	copy(enhanced, samples)

	enhanced = p.denoiseWavelet(enhanced)
	enhanced = p.amplifyWeakSignal(enhanced)
	enhanced = p.adaptiveFilter(enhanced)

	return enhanced
}

func (p *EEGProcessor) denoiseWavelet(signal []float64) []float64 {
	result := make([]float64, len(signal))
	window := 5

	for i := 0; i < len(signal); i++ {
		sum := 0.0
		count := 0
		for j := -window; j <= window; j++ {
			idx := i + j
			if idx >= 0 && idx < len(signal) {
				sum += signal[idx]
				count++
			}
		}
		result[i] = sum / float64(count)
	}

	return result
}

func (p *EEGProcessor) amplifyWeakSignal(signal []float64) []float64 {
	result := make([]float64, len(signal))

	mean := 0.0
	for _, v := range signal {
		mean += math.Abs(v)
	}
	mean /= float64(len(signal))

	gain := 1.0
	if mean < 5 {
		gain = 3.0
	} else if mean < 10 {
		gain = 2.0
	} else if mean < 15 {
		gain = 1.5
	}

	for i, v := range signal {
		result[i] = v * gain
	}

	return result
}

func (p *EEGProcessor) adaptiveFilter(signal []float64) []float64 {
	if len(signal) < 3 {
		return signal
	}

	result := make([]float64, len(signal))
	result[0] = signal[0]
	result[1] = signal[1]

	mu := 0.01
	weight := 0.5

	for i := 2; i < len(signal); i++ {
		prediction := weight*result[i-1] + (1-weight)*result[i-2]
		error := signal[i] - prediction
		weight += mu * error * result[i-1]
		if weight > 1 {
			weight = 1
		}
		if weight < 0 {
			weight = 0
		}
		result[i] = prediction + 0.5*error
	}

	return result
}

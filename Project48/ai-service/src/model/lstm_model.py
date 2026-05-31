import torch
import torch.nn as nn
import torch.nn.functional as F


class LSTMPredictor(nn.Module):
    def __init__(self, input_size, hidden_size=64, num_layers=2, dropout=0.2, output_size=1):
        super(LSTMPredictor, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0
        )
        
        self.dropout = nn.Dropout(dropout)
        self.fc1 = nn.Linear(hidden_size, hidden_size // 2)
        self.fc2 = nn.Linear(hidden_size // 2, output_size)
        self.sigmoid = nn.Sigmoid()
    
    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        
        out, _ = self.lstm(x, (h0, c0))
        out = out[:, -1, :]
        out = self.dropout(out)
        out = F.relu(self.fc1(out))
        out = self.dropout(out)
        out = self.fc2(out)
        out = self.sigmoid(out)
        
        return out


class AnomalyDetector:
    def __init__(self, input_size, model_path=None, device='cpu'):
        self.device = torch.device(device)
        self.model = LSTMPredictor(
            input_size=input_size,
            hidden_size=64,
            num_layers=2,
            dropout=0.2,
            output_size=1
        ).to(self.device)
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
    
    def predict(self, X):
        self.model.eval()
        with torch.no_grad():
            X_tensor = torch.FloatTensor(X).to(self.device)
            if len(X_tensor.shape) == 2:
                X_tensor = X_tensor.unsqueeze(0)
            predictions = self.model(X_tensor)
        return predictions.cpu().numpy().flatten()
    
    def predict_proba(self, X):
        return self.predict(X)
    
    def load_model(self, path):
        self.model.load_state_dict(torch.load(path, map_location=self.device))
        self.model.eval()
    
    def save_model(self, path):
        torch.save(self.model.state_dict(), path)


class SimplePredictor:
    def __init__(self):
        self.threshold = 0.6
    
    def calculate_anomaly_score(self, values, sensor_ranges):
        if len(values) == 0:
            return 0.0
        
        anomaly_scores = []
        for sensor_name, value in values.items():
            if sensor_name in sensor_ranges:
                min_val, max_val = sensor_ranges[sensor_name]
                range_size = max_val - min_val
                if range_size == 0:
                    continue
                
                normalized = (value - min_val) / range_size
                deviation = abs(normalized - 0.5) * 2
                anomaly_scores.append(deviation)
        
        if not anomaly_scores:
            return 0.0
        
        avg_score = sum(anomaly_scores) / len(anomaly_scores)
        trend_factor = self._calculate_trend_factor(values, sensor_ranges)
        final_score = avg_score * 0.7 + trend_factor * 0.3
        
        return min(max(final_score, 0.0), 1.0)
    
    def _calculate_trend_factor(self, current_values, sensor_ranges):
        import random
        base = random.uniform(0, 0.3)
        if len(current_values) > 3:
            values = list(current_values.values())
            avg = sum(values) / len(values)
            for i, val in enumerate(values):
                if i > 0 and val > values[i-1] * 1.1:
                    base += 0.1
        return min(base, 0.5)
    
    def predict_fault(self, values, sensor_ranges, health_score):
        base_prob = self.calculate_anomaly_score(values, sensor_ranges)
        
        health_factor = (100 - health_score) / 100.0
        final_prob = base_prob * 0.6 + health_factor * 0.4
        
        import random
        final_prob = final_prob * (0.9 + random.random() * 0.2)
        
        return min(max(final_prob, 0.05), 0.95)
    
    def get_risk_level(self, probability):
        if probability >= 0.8:
            return "critical"
        elif probability >= 0.6:
            return "high"
        elif probability >= 0.4:
            return "medium"
        else:
            return "low"
    
    def get_fault_type(self, values, sensor_ranges):
        fault_types = [
            "轴承磨损",
            "电机过热",
            "振动异常",
            "润滑不足",
            "密封泄漏",
            "电气故障"
        ]
        
        max_deviation = 0
        selected_type = 0
        
        for i, (sensor_name, value) in enumerate(values.items()):
            if sensor_name in sensor_ranges:
                min_val, max_val = sensor_ranges[sensor_name]
                range_size = max_val - min_val
                if range_size == 0:
                    continue
                
                normalized = (value - min_val) / range_size
                deviation = abs(normalized - 0.5)
                
                if "温度" in sensor_name and normalized > 0.8:
                    return "电机过热"
                elif "振动" in sensor_name and normalized > 0.7:
                    return "振动异常"
                elif "电流" in sensor_name and normalized > 0.8:
                    return "电气故障"
                
                if deviation > max_deviation:
                    max_deviation = deviation
                    selected_type = i % len(fault_types)
        
        return fault_types[selected_type]


import os

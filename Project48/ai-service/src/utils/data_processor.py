import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import pickle
import os


class DataProcessor:
    def __init__(self, sequence_length=24):
        self.sequence_length = sequence_length
        self.scalers = {}
        self.feature_columns = []
    
    def fit_transform(self, df, feature_columns):
        self.feature_columns = feature_columns
        
        for col in feature_columns:
            scaler = MinMaxScaler(feature_range=(0, 1))
            df[col] = scaler.fit_transform(df[[col]])
            self.scalers[col] = scaler
        
        return df
    
    def transform(self, df):
        for col in self.feature_columns:
            if col in self.scalers and col in df.columns:
                df[col] = self.scalers[col].transform(df[[col]])
        
        return df
    
    def inverse_transform(self, df):
        for col in self.feature_columns:
            if col in self.scalers and col in df.columns:
                df[col] = self.scalers[col].inverse_transform(df[[col]])
        
        return df
    
    def create_sequences(self, df, target_col=None):
        if len(self.feature_columns) == 0:
            raise ValueError("Feature columns not set. Call fit_transform first.")
        
        data = df[self.feature_columns].values
        sequences = []
        targets = []
        
        for i in range(len(data) - self.sequence_length):
            seq = data[i:(i + self.sequence_length)]
            sequences.append(seq)
            
            if target_col and target_col in df.columns:
                target = df.iloc[i + self.sequence_length][target_col]
                targets.append(target)
        
        sequences = np.array(sequences)
        
        if target_col:
            targets = np.array(targets)
            return sequences, targets
        
        return sequences
    
    def extract_features(self, df):
        features = {}
        
        for col in self.feature_columns:
            if col in df.columns:
                values = df[col].values
                features[f'{col}_mean'] = np.mean(values)
                features[f'{col}_std'] = np.std(values)
                features[f'{col}_min'] = np.min(values)
                features[f'{col}_max'] = np.max(values)
                features[f'{col}_kurtosis'] = pd.Series(values).kurtosis()
                features[f'{col}_skew'] = pd.Series(values).skew()
        
        return features
    
    def detect_outliers(self, df, column, threshold=3):
        if column not in df.columns:
            return []
        
        values = df[column].values
        mean = np.mean(values)
        std = np.std(values)
        
        if std == 0:
            return []
        
        z_scores = np.abs((values - mean) / std)
        outlier_indices = np.where(z_scores > threshold)[0]
        
        return outlier_indices.tolist()
    
    def add_noise(self, data, noise_level=0.01):
        noise = np.random.normal(0, noise_level, data.shape)
        return data + noise
    
    def save_scalers(self, path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'wb') as f:
            pickle.dump({
                'scalers': self.scalers,
                'feature_columns': self.feature_columns,
                'sequence_length': self.sequence_length
            }, f)
    
    def load_scalers(self, path):
        with open(path, 'rb') as f:
            data = pickle.load(f)
            self.scalers = data['scalers']
            self.feature_columns = data['feature_columns']
            self.sequence_length = data['sequence_length']


def generate_synthetic_data(n_samples=1000, n_features=4, anomaly_ratio=0.1):
    np.random.seed(42)
    
    data = np.random.randn(n_samples, n_features)
    data = np.cumsum(data, axis=0)
    data = (data - data.min(axis=0)) / (data.max(axis=0) - data.min(axis=0))
    
    labels = np.zeros(n_samples)
    
    n_anomalies = int(n_samples * anomaly_ratio)
    anomaly_indices = np.random.choice(n_samples, n_anomalies, replace=False)
    
    for idx in anomaly_indices:
        data[idx] += np.random.uniform(2, 5, n_features)
        labels[idx] = 1
    
    columns = [f'sensor_{i}' for i in range(n_features)]
    df = pd.DataFrame(data, columns=columns)
    df['timestamp'] = pd.date_range(start='2024-01-01', periods=n_samples, freq='H')
    df['anomaly'] = labels
    
    return df


def sliding_window(data, window_size, step_size=1):
    windows = []
    for i in range(0, len(data) - window_size + 1, step_size):
        windows.append(data[i:i+window_size])
    return np.array(windows)

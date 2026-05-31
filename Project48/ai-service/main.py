import os
import sys
import json
import time
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.service.prediction_service import PredictionService

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

prediction_service = PredictionService(model_dir="./data/models")


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "AI Prediction Service",
        "version": "v1.2.0",
        "timestamp": datetime.now().isoformat()
    })


@app.route('/api/model-info', methods=['GET'])
def get_model_info():
    try:
        info = prediction_service.get_model_info()
        return jsonify(info)
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        device_id = data.get('device_id')
        sensor_data = data.get('sensor_data', {})
        health_score = data.get('health_score', 80)
        
        if device_id is None:
            return jsonify({"error": "device_id is required"}), 400
        
        result = prediction_service.predict_device(
            device_id=device_id,
            sensor_data=sensor_data,
            health_score=health_score
        )
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in prediction: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/predict/batch', methods=['POST'])
def predict_batch():
    try:
        data = request.get_json()
        device_data_list = data.get('devices', [])
        
        if not device_data_list:
            return jsonify({"error": "devices list is required"}), 400
        
        results = prediction_service.predict_batch(device_data_list)
        
        return jsonify({
            "count": len(results),
            "predictions": results
        })
    except Exception as e:
        logger.error(f"Error in batch prediction: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/predict/series/<int:device_id>', methods=['GET', 'POST'])
def predict_series(device_id):
    try:
        days = int(request.args.get('days', 7))
        
        if request.method == 'POST':
            data = request.get_json()
            historical_data = data.get('historical_data', [])
        else:
            historical_data = []
        
        result = prediction_service.predict_series(
            device_id=device_id,
            historical_data=historical_data,
            days=days
        )
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in series prediction: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/train/<int:device_id>', methods=['POST'])
def train_model(device_id):
    try:
        data = request.get_json()
        training_data = data.get('training_data', [])
        
        if not training_data:
            return jsonify({"error": "training_data is required"}), 400
        
        result = prediction_service.train_model(device_id, training_data)
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error training model: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/health-score/<int:device_id>', methods=['POST'])
def calculate_health_score(device_id):
    try:
        data = request.get_json()
        sensor_data = data.get('sensor_data', {})
        
        score = prediction_service.get_health_score(device_id, sensor_data)
        
        return jsonify({
            "device_id": device_id,
            "health_score": score,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error calculating health score: {e}")
        return jsonify({"error": str(e)}), 500


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 50051))
    host = os.environ.get('HOST', '0.0.0.0')
    
    logger.info(f"Starting AI Prediction Service on {host}:{port}")
    logger.info(f"Model directory: {prediction_service.model_dir}")
    logger.info(f"Health check: http://{host}:{port}/health")
    
    app.run(host=host, port=port, debug=False, threaded=True)

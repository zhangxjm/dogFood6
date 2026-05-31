import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-123456')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///pet_feeder.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    MQTT_HOST = os.environ.get('MQTT_HOST', 'localhost')
    MQTT_PORT = int(os.environ.get('MQTT_PORT', 1883))
    MQTT_KEEPALIVE = 60
    
    INFLUXDB_HOST = os.environ.get('INFLUXDB_HOST', 'localhost')
    INFLUXDB_PORT = int(os.environ.get('INFLUXDB_PORT', 8086))
    INFLUXDB_TOKEN = os.environ.get('INFLUXDB_TOKEN', 'pet-feeder-token-123456')
    INFLUXDB_ORG = os.environ.get('INFLUXDB_ORG', 'pet-feeder')
    INFLUXDB_BUCKET = os.environ.get('INFLUXDB_BUCKET', 'pet-data')
    INFLUXDB_URL = f"http://{INFLUXDB_HOST}:{INFLUXDB_PORT}"

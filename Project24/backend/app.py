from flask import Flask, send_from_directory
from flask_cors import CORS
from config import Config
from models import db
from mqtt_client import MQTTClient
from routes import api_bp
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
import os
import threading

scheduler = None

def create_app():
    app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
    app.config.from_object(Config)
    
    CORS(app)
    
    db.init_app(app)
    
    mqtt_client = MQTTClient(
        host=app.config['MQTT_HOST'],
        port=app.config['MQTT_PORT'],
        keepalive=app.config['MQTT_KEEPALIVE']
    )
    mqtt_client.init_app(
        app,
        influxdb_url=app.config['INFLUXDB_URL'],
        influxdb_token=app.config['INFLUXDB_TOKEN'],
        influxdb_org=app.config['INFLUXDB_ORG'],
        influxdb_bucket=app.config['INFLUXDB_BUCKET']
    )
    
    app.mqtt_client = mqtt_client
    app.extensions['mqtt_client'] = mqtt_client
    
    app.register_blueprint(api_bp)
    
    @app.route('/')
    def index():
        return send_from_directory(app.static_folder, 'index.html')
    
    @app.errorhandler(404)
    def not_found(e):
        if os.path.exists(os.path.join(app.static_folder, 'index.html')):
            return send_from_directory(app.static_folder, 'index.html')
        return {'error': 'Not Found'}, 404
    
    return app

def init_scheduler(app):
    global scheduler
    scheduler = BackgroundScheduler()
    
    def check_schedules():
        with app.app_context():
            from models import FeedingSchedule, Device, FeedingRecord
            from datetime import datetime
            
            now = datetime.now()
            current_time = now.strftime("%H:%M")
            
            schedules = FeedingSchedule.query.filter_by(
                time=current_time,
                enabled=True
            ).all()
            
            for schedule in schedules:
                device = Device.query.filter_by(status='online').first()
                if device:
                    payload = {
                        'action': 'feed',
                        'portion': schedule.portion,
                        'pet_id': schedule.pet_id,
                        'timestamp': datetime.utcnow().isoformat()
                    }
                    try:
                        if hasattr(app, 'mqtt_client') and app.mqtt_client is not None:
                            app.mqtt_client.publish(f"{device.mqtt_topic}/command", payload)
                        
                        record = FeedingRecord(
                            pet_id=schedule.pet_id,
                            device_id=device.id,
                            portion=schedule.portion,
                            status='pending'
                        )
                        db.session.add(record)
                        db.session.commit()
                        
                        app.logger.info(f"Scheduled feeding triggered for pet {schedule.pet_id}: {schedule.portion}g")
                    except Exception as e:
                        app.logger.error(f"Failed to trigger scheduled feeding: {e}")
    
    def check_device_status():
        with app.app_context():
            from models import Device, Alert
            
            timeout = datetime.utcnow() - timedelta(minutes=5)
            devices = Device.query.filter(Device.last_heartbeat < timeout).all()
            
            for device in devices:
                if device.status == 'online':
                    device.status = 'offline'
                    
                    existing_alert = Alert.query.filter_by(
                        device_id=device.id,
                        alert_type='device_offline',
                        resolved=False
                    ).first()
                    
                    if not existing_alert:
                        alert = Alert(
                            alert_type='device_offline',
                            severity='warning',
                            message=f"设备 {device.name} 已离线超过5分钟",
                            device_id=device.id
                        )
                        db.session.add(alert)
                    
                    app.logger.warning(f"Device {device.name} marked as offline")
            
            db.session.commit()
    
    scheduler.add_job(check_schedules, 'cron', minute='*')
    scheduler.add_job(check_device_status, 'interval', minutes=1)
    scheduler.start()
    
    return scheduler

def try_connect_mqtt(app, retries=3, delay=5):
    for i in range(retries):
        try:
            app.mqtt_client.connect()
            return True
        except Exception as e:
            app.logger.warning(f"MQTT connection attempt {i+1}/{retries} failed: {e}")
            if i < retries - 1:
                import time
                time.sleep(delay)
    return False

if __name__ == '__main__':
    app = create_app()
    
    with app.app_context():
        db.create_all()
        
        from init_data import init_data
        init_data()
        
        try:
            threading.Thread(target=try_connect_mqtt, args=(app,), daemon=True).start()
        except Exception as e:
            app.logger.error(f"Failed to start MQTT connection thread: {e}")
        
        try:
            init_scheduler(app)
        except Exception as e:
            app.logger.error(f"Failed to start scheduler: {e}")
    
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)

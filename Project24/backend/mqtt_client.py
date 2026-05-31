import paho.mqtt.client as mqtt
from datetime import datetime
import json
import sqlite3
from contextlib import contextmanager

class MQTTClient:
    def __init__(self, host, port, keepalive, app=None):
        self.host = host
        self.port = port
        self.keepalive = keepalive
        self.client = mqtt.Client()
        self.app = app
        self._message_handlers = {}
        self.use_sqlite_fallback = False
        self._init_fallback_db()
        
    def _init_fallback_db(self):
        try:
            conn = sqlite3.connect('influx_fallback.db')
            c = conn.cursor()
            c.execute('''CREATE TABLE IF NOT EXISTS mqtt_messages
                         (id INTEGER PRIMARY KEY AUTOINCREMENT,
                          topic TEXT,
                          device_id TEXT,
                          payload TEXT,
                          timestamp DATETIME)''')
            conn.commit()
            conn.close()
        except Exception as e:
            if self.app:
                self.app.logger.error(f"Failed to init fallback DB: {e}")
    
    @contextmanager
    def _get_db(self):
        conn = sqlite3.connect('influx_fallback.db')
        try:
            yield conn
        finally:
            conn.close()
        
    def init_app(self, app, influxdb_url, influxdb_token, influxdb_org, influxdb_bucket):
        self.app = app
        self.influx_bucket = influxdb_bucket
        self.influx_org = influxdb_org
        
        try:
            from influxdb_client import InfluxDBClient
            from influxdb_client.client.write_api import SYNCHRONOUS
            self.influx_client = InfluxDBClient(url=influxdb_url, token=influxdb_token, org=influxdb_org)
            self.influx_write_api = self.influx_client.write_api(write_options=SYNCHRONOUS)
            self.influx_query_api = self.influx_client.query_api()
            self.use_sqlite_fallback = False
        except Exception as e:
            if self.app:
                self.app.logger.warning(f"InfluxDB not available, using SQLite fallback: {e}")
            self.use_sqlite_fallback = True
        
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        self.client.on_disconnect = self._on_disconnect
        
    def connect(self):
        try:
            if self.client is None:
                self.client = mqtt.Client()
            self.client.connect(self.host, self.port, self.keepalive)
            self.client.loop_start()
            with self.app.app_context():
                self.app.logger.info(f"MQTT client connected to {self.host}:{self.port}")
        except Exception as e:
            with self.app.app_context():
                self.app.logger.warning(f"Failed to connect to MQTT, will retry: {e}")
    
    def disconnect(self):
        if self.client is not None:
            self.client.loop_stop()
            self.client.disconnect()
        if hasattr(self, 'influx_client') and self.influx_client:
            self.influx_client.close()
    
    def _on_connect(self, client, userdata, flags, rc):
        with self.app.app_context():
            self.app.logger.info(f"MQTT connected with result code {rc}")
        client.subscribe("petfeeder/+/status")
        client.subscribe("petfeeder/+/feeding")
        client.subscribe("petfeeder/+/heartbeat")
    
    def _on_message(self, client, userdata, msg):
        try:
            topic = msg.topic
            payload = json.loads(msg.payload.decode())
            
            with self.app.app_context():
                self._write_to_storage(topic, payload)
                self._process_message(topic, payload)
                
        except Exception as e:
            with self.app.app_context():
                self.app.logger.error(f"Error processing MQTT message: {e}")
    
    def _on_disconnect(self, client, userdata, rc):
        with self.app.app_context():
            self.app.logger.warning(f"MQTT disconnected with result code {rc}")
    
    def _write_to_storage(self, topic, payload):
        try:
            device_id = payload.get('device_id', 'unknown')
            
            if self.use_sqlite_fallback:
                with self._get_db() as conn:
                    c = conn.cursor()
                    c.execute("INSERT INTO mqtt_messages (topic, device_id, payload, timestamp) VALUES (?, ?, ?, ?)",
                              (topic, str(device_id), json.dumps(payload), datetime.utcnow()))
                    conn.commit()
            else:
                from influxdb_client import Point
                point = Point("mqtt_message") \
                    .tag("topic", topic) \
                    .field("payload", json.dumps(payload)) \
                    .time(datetime.utcnow())
                
                if 'device_id' in payload:
                    point = point.tag("device_id", str(payload['device_id']))
                
                self.influx_write_api.write(bucket=self.influx_bucket, org=self.influx_org, record=point)
        except Exception as e:
            self.app.logger.error(f"Failed to write to storage: {e}")
    
    def _process_message(self, topic, payload):
        from models import db, Device, FeedingRecord, Alert, DeviceStatus
        
        topic_parts = topic.split('/')
        if len(topic_parts) >= 3:
            device_id = topic_parts[1]
            message_type = topic_parts[2]
            
            device = Device.query.filter_by(mqtt_topic=f"petfeeder/{device_id}").first()
            
            if device:
                device.last_heartbeat = datetime.utcnow()
                device.status = 'online'
                
                if message_type == 'heartbeat':
                    device.battery_level = payload.get('battery', device.battery_level)
                    
                    if device.battery_level < 20:
                        device.low_power_mode = True
                        existing_alert = Alert.query.filter_by(
                            device_id=device.id,
                            alert_type='low_battery',
                            resolved=False
                        ).first()
                        if not existing_alert:
                            alert = Alert(
                                alert_type='low_battery',
                                severity='warning',
                                message=f"设备 {device.name} 电量过低，已进入低功耗模式",
                                device_id=device.id
                            )
                            db.session.add(alert)
                    elif device.battery_level >= 30:
                        device.low_power_mode = False
                
                elif message_type == 'feeding':
                    if payload.get('success', False):
                        record = FeedingRecord(
                            pet_id=payload.get('pet_id', 1),
                            device_id=device.id,
                            portion=payload.get('portion', 0),
                            status='success'
                        )
                        db.session.add(record)
                    else:
                        alert = Alert(
                            alert_type='feeding_failed',
                            severity='error',
                            message=f"设备 {device.name} 投喂失败: {payload.get('error', '未知错误')}",
                            device_id=device.id
                        )
                        db.session.add(alert)
                
                status_record = DeviceStatus(
                    device_id=device.id,
                    status=device.status,
                    battery_level=device.battery_level,
                    signal_strength=payload.get('signal_strength')
                )
                db.session.add(status_record)
                
                db.session.commit()
    
    def publish(self, topic, payload):
        try:
            if self.client is None:
                self.app.logger.warning(f"MQTT client not connected, cannot publish to {topic}")
                return
            self.client.publish(topic, json.dumps(payload))
            with self.app.app_context():
                self.app.logger.info(f"Published to {topic}: {payload}")
        except Exception as e:
            with self.app.app_context():
                self.app.logger.error(f"Failed to publish: {e}")
    
    def subscribe(self, topic, handler):
        self._message_handlers[topic] = handler
        if self.client is not None:
            self.client.subscribe(topic)
    
    def query_influxdb(self, query):
        if self.use_sqlite_fallback:
            return []
        return self.influx_query_api.query(query, org=self.influx_org)

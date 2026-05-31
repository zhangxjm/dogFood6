from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Pet(db.Model):
    __tablename__ = 'pets'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    species = db.Column(db.String(50), nullable=False)
    breed = db.Column(db.String(100))
    age = db.Column(db.Float)
    weight = db.Column(db.Float)
    daily_portion = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    feeding_schedules = db.relationship('FeedingSchedule', backref='pet', lazy=True, cascade='all, delete-orphan')
    feeding_records = db.relationship('FeedingRecord', backref='pet', lazy=True, cascade='all, delete-orphan')

class FeedingSchedule(db.Model):
    __tablename__ = 'feeding_schedules'
    
    id = db.Column(db.Integer, primary_key=True)
    pet_id = db.Column(db.Integer, db.ForeignKey('pets.id'), nullable=False)
    time = db.Column(db.String(5), nullable=False)
    portion = db.Column(db.Float, nullable=False)
    enabled = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Device(db.Model):
    __tablename__ = 'devices'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    device_type = db.Column(db.String(50), nullable=False)
    mqtt_topic = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(20), default='offline')
    battery_level = db.Column(db.Float, default=100.0)
    low_power_mode = db.Column(db.Boolean, default=False)
    last_heartbeat = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class FeedingRecord(db.Model):
    __tablename__ = 'feeding_records'
    
    id = db.Column(db.Integer, primary_key=True)
    pet_id = db.Column(db.Integer, db.ForeignKey('pets.id'), nullable=False)
    device_id = db.Column(db.Integer, db.ForeignKey('devices.id'))
    portion = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='success')
    notes = db.Column(db.Text)

class Alert(db.Model):
    __tablename__ = 'alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    alert_type = db.Column(db.String(50), nullable=False)
    severity = db.Column(db.String(20), nullable=False)
    message = db.Column(db.Text, nullable=False)
    device_id = db.Column(db.Integer, db.ForeignKey('devices.id'))
    pet_id = db.Column(db.Integer, db.ForeignKey('pets.id'))
    resolved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime)

class DeviceStatus(db.Model):
    __tablename__ = 'device_status'
    
    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.Integer, db.ForeignKey('devices.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    battery_level = db.Column(db.Float)
    signal_strength = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

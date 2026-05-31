from flask import Blueprint, request, jsonify, current_app
from models import db, Device, DeviceStatus, Alert
from extensions import get_mqtt_client
from datetime import datetime, timedelta
import json

devices_bp = Blueprint('devices', __name__)

@devices_bp.route('', methods=['GET'])
def get_devices():
    devices = Device.query.all()
    return jsonify([{
        'id': d.id,
        'name': d.name,
        'device_type': d.device_type,
        'mqtt_topic': d.mqtt_topic,
        'status': d.status,
        'battery_level': d.battery_level,
        'low_power_mode': d.low_power_mode,
        'last_heartbeat': d.last_heartbeat.isoformat() if d.last_heartbeat else None,
        'created_at': d.created_at.isoformat()
    } for d in devices])

@devices_bp.route('', methods=['POST'])
def create_device():
    data = request.json
    device = Device(
        name=data['name'],
        device_type=data['device_type'],
        mqtt_topic=data['mqtt_topic']
    )
    db.session.add(device)
    db.session.commit()
    return jsonify({'id': device.id, 'message': '创建设备成功'}), 201

@devices_bp.route('/<int:device_id>', methods=['GET'])
def get_device(device_id):
    device = Device.query.get_or_404(device_id)
    return jsonify({
        'id': device.id,
        'name': device.name,
        'device_type': device.device_type,
        'mqtt_topic': device.mqtt_topic,
        'status': device.status,
        'battery_level': device.battery_level,
        'low_power_mode': device.low_power_mode,
        'last_heartbeat': device.last_heartbeat.isoformat() if device.last_heartbeat else None,
        'created_at': device.created_at.isoformat()
    })

@devices_bp.route('/<int:device_id>', methods=['PUT'])
def update_device(device_id):
    device = Device.query.get_or_404(device_id)
    data = request.json
    device.name = data.get('name', device.name)
    device.device_type = data.get('device_type', device.device_type)
    device.mqtt_topic = data.get('mqtt_topic', device.mqtt_topic)
    device.low_power_mode = data.get('low_power_mode', device.low_power_mode)
    db.session.commit()
    return jsonify({'message': '更新成功'})

@devices_bp.route('/<int:device_id>', methods=['DELETE'])
def delete_device(device_id):
    device = Device.query.get_or_404(device_id)
    db.session.delete(device)
    db.session.commit()
    return jsonify({'message': '删除成功'})

@devices_bp.route('/<int:device_id>/command', methods=['POST'])
def send_command(device_id):
    device = Device.query.get_or_404(device_id)
    data = request.json
    command = data.get('command')
    
    if command == 'feed':
        payload = {
            'action': 'feed',
            'portion': data.get('portion', 50),
            'pet_id': data.get('pet_id', 1),
            'timestamp': datetime.utcnow().isoformat()
        }
        mqtt_client = get_mqtt_client()
        if mqtt_client:
            mqtt_client.publish(f"{device.mqtt_topic}/command", payload)
        return jsonify({'message': '投喂指令已发送'})
    
    elif command == 'reboot':
        payload = {
            'action': 'reboot',
            'timestamp': datetime.utcnow().isoformat()
        }
        mqtt_client = get_mqtt_client()
        if mqtt_client:
            mqtt_client.publish(f"{device.mqtt_topic}/command", payload)
        return jsonify({'message': '重启指令已发送'})
    
    elif command == 'low_power':
        device.low_power_mode = data.get('enabled', True)
        db.session.commit()
        payload = {
            'action': 'set_low_power',
            'enabled': device.low_power_mode,
            'timestamp': datetime.utcnow().isoformat()
        }
        mqtt_client = get_mqtt_client()
        if mqtt_client:
            mqtt_client.publish(f"{device.mqtt_topic}/command", payload)
        return jsonify({'message': '低功耗模式设置已发送'})
    
    return jsonify({'message': '未知指令'}), 400

@devices_bp.route('/<int:device_id>/status', methods=['GET'])
def get_device_status_history(device_id):
    days = request.args.get('days', 1, type=int)
    start_date = datetime.utcnow() - timedelta(days=days)
    statuses = DeviceStatus.query.filter(
        DeviceStatus.device_id == device_id,
        DeviceStatus.timestamp >= start_date
    ).order_by(DeviceStatus.timestamp.asc()).all()
    
    return jsonify([{
        'id': s.id,
        'device_id': s.device_id,
        'status': s.status,
        'battery_level': s.battery_level,
        'signal_strength': s.signal_strength,
        'timestamp': s.timestamp.isoformat()
    } for s in statuses])

@devices_bp.route('/<int:device_id>/feed', methods=['POST'])
def manual_feed(device_id):
    from models import FeedingRecord
    device = Device.query.get_or_404(device_id)
    data = request.json
    portion = data.get('portion', 50)
    pet_id = data.get('pet_id', 1)
    
    payload = {
        'action': 'feed',
        'portion': portion,
        'pet_id': pet_id,
        'timestamp': datetime.utcnow().isoformat()
    }
    mqtt_client = get_mqtt_client()
    if mqtt_client:
        mqtt_client.publish(f"{device.mqtt_topic}/command", payload)
    
    record = FeedingRecord(
        pet_id=pet_id,
        device_id=device_id,
        portion=portion,
        status='pending'
    )
    db.session.add(record)
    db.session.commit()
    
    return jsonify({'message': '手动投喂指令已发送', 'record_id': record.id})

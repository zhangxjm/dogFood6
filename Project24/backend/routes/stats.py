from flask import Blueprint, request, jsonify
from models import db, FeedingRecord, Pet, Device, Alert
from datetime import datetime, timedelta
from sqlalchemy import func

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('/overview', methods=['GET'])
def get_overview():
    total_pets = Pet.query.count()
    total_devices = Device.query.count()
    online_devices = Device.query.filter_by(status='online').count()
    offline_devices = Device.query.filter_by(status='offline').count()
    low_power_devices = Device.query.filter_by(low_power_mode=True).count()
    unresolved_alerts = Alert.query.filter_by(resolved=False).count()
    
    today = datetime.utcnow().date()
    today_feedings = FeedingRecord.query.filter(
        func.date(FeedingRecord.timestamp) == today
    ).count()
    
    today_portion = db.session.query(func.sum(FeedingRecord.portion)).filter(
        func.date(FeedingRecord.timestamp) == today,
        FeedingRecord.status == 'success'
    ).scalar() or 0
    
    return jsonify({
        'total_pets': total_pets,
        'total_devices': total_devices,
        'online_devices': online_devices,
        'offline_devices': offline_devices,
        'low_power_devices': low_power_devices,
        'unresolved_alerts': unresolved_alerts,
        'today_feedings': today_feedings,
        'today_total_portion': float(today_portion)
    })

@stats_bp.route('/feeding/daily', methods=['GET'])
def get_daily_feeding_stats():
    days = request.args.get('days', 7, type=int)
    pet_id = request.args.get('pet_id', type=int)
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    query = db.session.query(
        func.date(FeedingRecord.timestamp).label('date'),
        func.sum(FeedingRecord.portion).label('total_portion'),
        func.count(FeedingRecord.id).label('feeding_count')
    ).filter(
        FeedingRecord.timestamp >= start_date,
        FeedingRecord.status == 'success'
    )
    
    if pet_id:
        query = query.filter_by(pet_id=pet_id)
    
    results = query.group_by(
        func.date(FeedingRecord.timestamp)
    ).order_by('date').all()
    
    daily_data = []
    for i in range(days):
        current_date = (datetime.utcnow() - timedelta(days=days - 1 - i)).date()
        day_data = next((r for r in results if r.date == current_date), None)
        daily_data.append({
            'date': current_date.isoformat(),
            'total_portion': float(day_data.total_portion) if day_data else 0,
            'feeding_count': day_data.feeding_count if day_data else 0
        })
    
    return jsonify(daily_data)

@stats_bp.route('/feeding/hourly', methods=['GET'])
def get_hourly_feeding_stats():
    days = request.args.get('days', 1, type=int)
    pet_id = request.args.get('pet_id', type=int)
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    query = db.session.query(
        func.strftime('%Y-%m-%d %H:00:00', FeedingRecord.timestamp).label('hour'),
        func.sum(FeedingRecord.portion).label('total_portion'),
        func.count(FeedingRecord.id).label('feeding_count')
    ).filter(
        FeedingRecord.timestamp >= start_date,
        FeedingRecord.status == 'success'
    )
    
    if pet_id:
        query = query.filter_by(pet_id=pet_id)
    
    results = query.group_by('hour').order_by('hour').all()
    
    return jsonify([{
        'hour': r.hour,
        'total_portion': float(r.total_portion),
        'feeding_count': r.feeding_count
    } for r in results])

@stats_bp.route('/alerts', methods=['GET'])
def get_alert_stats():
    days = request.args.get('days', 7, type=int)
    start_date = datetime.utcnow() - timedelta(days=days)
    
    alerts = Alert.query.filter(Alert.created_at >= start_date).all()
    
    type_counts = {}
    severity_counts = {}
    
    for alert in alerts:
        type_counts[alert.alert_type] = type_counts.get(alert.alert_type, 0) + 1
        severity_counts[alert.severity] = severity_counts.get(alert.severity, 0) + 1
    
    return jsonify({
        'total': len(alerts),
        'by_type': type_counts,
        'by_severity': severity_counts,
        'days': days
    })

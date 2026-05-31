from flask import Blueprint, request, jsonify
from models import db, Alert
from datetime import datetime, timedelta

alerts_bp = Blueprint('alerts', __name__)

@alerts_bp.route('', methods=['GET'])
def get_alerts():
    resolved = request.args.get('resolved', 'false').lower() == 'true'
    severity = request.args.get('severity')
    days = request.args.get('days', 7, type=int)
    
    query = Alert.query
    
    if not resolved:
        query = query.filter_by(resolved=False)
    
    if severity:
        query = query.filter_by(severity=severity)
    
    if days > 0:
        start_date = datetime.utcnow() - timedelta(days=days)
        query = query.filter(Alert.created_at >= start_date)
    
    alerts = query.order_by(Alert.created_at.desc()).all()
    
    return jsonify([{
        'id': a.id,
        'alert_type': a.alert_type,
        'severity': a.severity,
        'message': a.message,
        'device_id': a.device_id,
        'pet_id': a.pet_id,
        'resolved': a.resolved,
        'created_at': a.created_at.isoformat(),
        'resolved_at': a.resolved_at.isoformat() if a.resolved_at else None
    } for a in alerts])

@alerts_bp.route('/<int:alert_id>/resolve', methods=['POST'])
def resolve_alert(alert_id):
    alert = Alert.query.get_or_404(alert_id)
    alert.resolved = True
    alert.resolved_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': '告警已处理'})

@alerts_bp.route('/unresolved/count', methods=['GET'])
def get_unresolved_count():
    count = Alert.query.filter_by(resolved=False).count()
    warning_count = Alert.query.filter_by(resolved=False, severity='warning').count()
    error_count = Alert.query.filter_by(resolved=False, severity='error').count()
    critical_count = Alert.query.filter_by(resolved=False, severity='critical').count()
    
    return jsonify({
        'total': count,
        'warning': warning_count,
        'error': error_count,
        'critical': critical_count
    })

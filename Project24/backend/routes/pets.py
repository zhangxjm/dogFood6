from flask import Blueprint, request, jsonify
from models import db, Pet, FeedingSchedule, FeedingRecord
from datetime import datetime, timedelta

pets_bp = Blueprint('pets', __name__)

@pets_bp.route('', methods=['GET'])
def get_pets():
    pets = Pet.query.all()
    return jsonify([{
        'id': pet.id,
        'name': pet.name,
        'species': pet.species,
        'breed': pet.breed,
        'age': pet.age,
        'weight': pet.weight,
        'daily_portion': pet.daily_portion,
        'created_at': pet.created_at.isoformat()
    } for pet in pets])

@pets_bp.route('', methods=['POST'])
def create_pet():
    data = request.json
    pet = Pet(
        name=data['name'],
        species=data['species'],
        breed=data.get('breed'),
        age=data.get('age'),
        weight=data.get('weight'),
        daily_portion=data['daily_portion']
    )
    db.session.add(pet)
    db.session.commit()
    return jsonify({'id': pet.id, 'message': '创建成功'}), 201

@pets_bp.route('/<int:pet_id>', methods=['GET'])
def get_pet(pet_id):
    pet = Pet.query.get_or_404(pet_id)
    return jsonify({
        'id': pet.id,
        'name': pet.name,
        'species': pet.species,
        'breed': pet.breed,
        'age': pet.age,
        'weight': pet.weight,
        'daily_portion': pet.daily_portion,
        'created_at': pet.created_at.isoformat()
    })

@pets_bp.route('/<int:pet_id>', methods=['PUT'])
def update_pet(pet_id):
    pet = Pet.query.get_or_404(pet_id)
    data = request.json
    pet.name = data.get('name', pet.name)
    pet.species = data.get('species', pet.species)
    pet.breed = data.get('breed', pet.breed)
    pet.age = data.get('age', pet.age)
    pet.weight = data.get('weight', pet.weight)
    pet.daily_portion = data.get('daily_portion', pet.daily_portion)
    db.session.commit()
    return jsonify({'message': '更新成功'})

@pets_bp.route('/<int:pet_id>', methods=['DELETE'])
def delete_pet(pet_id):
    pet = Pet.query.get_or_404(pet_id)
    db.session.delete(pet)
    db.session.commit()
    return jsonify({'message': '删除成功'})

@pets_bp.route('/<int:pet_id>/schedules', methods=['GET'])
def get_pet_schedules(pet_id):
    schedules = FeedingSchedule.query.filter_by(pet_id=pet_id).all()
    return jsonify([{
        'id': s.id,
        'pet_id': s.pet_id,
        'time': s.time,
        'portion': s.portion,
        'enabled': s.enabled,
        'created_at': s.created_at.isoformat()
    } for s in schedules])

@pets_bp.route('/<int:pet_id>/schedules', methods=['POST'])
def create_schedule(pet_id):
    pet = Pet.query.get_or_404(pet_id)
    data = request.json
    schedule = FeedingSchedule(
        pet_id=pet_id,
        time=data['time'],
        portion=data['portion'],
        enabled=data.get('enabled', True)
    )
    db.session.add(schedule)
    db.session.commit()
    return jsonify({'id': schedule.id, 'message': '创建成功'}), 201

@pets_bp.route('/<int:pet_id>/records', methods=['GET'])
def get_pet_records(pet_id):
    days = request.args.get('days', 7, type=int)
    start_date = datetime.utcnow() - timedelta(days=days)
    records = FeedingRecord.query.filter(
        FeedingRecord.pet_id == pet_id,
        FeedingRecord.timestamp >= start_date
    ).order_by(FeedingRecord.timestamp.desc()).all()
    
    return jsonify([{
        'id': r.id,
        'pet_id': r.pet_id,
        'device_id': r.device_id,
        'portion': r.portion,
        'timestamp': r.timestamp.isoformat(),
        'status': r.status,
        'notes': r.notes
    } for r in records])

@pets_bp.route('/<int:pet_id>/stats', methods=['GET'])
def get_pet_stats(pet_id):
    days = request.args.get('days', 7, type=int)
    start_date = datetime.utcnow() - timedelta(days=days)
    records = FeedingRecord.query.filter(
        FeedingRecord.pet_id == pet_id,
        FeedingRecord.timestamp >= start_date
    ).all()
    
    total_portion = sum(r.portion for r in records if r.status == 'success')
    avg_daily = total_portion / days if days > 0 else 0
    success_count = sum(1 for r in records if r.status == 'success')
    fail_count = sum(1 for r in records if r.status != 'success')
    
    pet = Pet.query.get_or_404(pet_id)
    
    return jsonify({
        'pet_id': pet_id,
        'pet_name': pet.name,
        'total_portion': total_portion,
        'avg_daily_portion': avg_daily,
        'target_daily_portion': pet.daily_portion,
        'feeding_count': len(records),
        'success_count': success_count,
        'fail_count': fail_count,
        'days': days
    })

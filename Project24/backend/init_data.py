from models import db, Pet, FeedingSchedule, Device, FeedingRecord, Alert
from datetime import datetime, timedelta
import random

def init_data():
    if Pet.query.count() == 0:
        pet1 = Pet(
            name='小黄',
            species='狗',
            breed='金毛寻回犬',
            age=3.0,
            weight=25.0,
            daily_portion=200.0
        )
        pet2 = Pet(
            name='小白',
            species='猫',
            breed='英国短毛猫',
            age=2.0,
            weight=4.5,
            daily_portion=80.0
        )
        db.session.add(pet1)
        db.session.add(pet2)
        db.session.flush()
        
        schedule1 = FeedingSchedule(
            pet_id=pet1.id,
            time='08:00',
            portion=80.0,
            enabled=True
        )
        schedule2 = FeedingSchedule(
            pet_id=pet1.id,
            time='18:00',
            portion=120.0,
            enabled=True
        )
        schedule3 = FeedingSchedule(
            pet_id=pet2.id,
            time='09:00',
            portion=30.0,
            enabled=True
        )
        schedule4 = FeedingSchedule(
            pet_id=pet2.id,
            time='21:00',
            portion=50.0,
            enabled=True
        )
        db.session.add_all([schedule1, schedule2, schedule3, schedule4])
    
    if Device.query.count() == 0:
        device1 = Device(
            name='智能喂食器-客厅',
            device_type='feeder',
            mqtt_topic='petfeeder/device001',
            status='online',
            battery_level=85.0,
            low_power_mode=False,
            last_heartbeat=datetime.utcnow()
        )
        device2 = Device(
            name='智能喂食器-阳台',
            device_type='feeder',
            mqtt_topic='petfeeder/device002',
            status='online',
            battery_level=92.0,
            low_power_mode=False,
            last_heartbeat=datetime.utcnow()
        )
        db.session.add_all([device1, device2])
        db.session.flush()
        
        if FeedingRecord.query.count() == 0:
            pets = Pet.query.all()
            devices = Device.query.all()
            
            for pet in pets:
                for day in range(7):
                    date = datetime.utcnow() - timedelta(days=day)
                    num_feedings = random.randint(1, 3)
                    
                    for _ in range(num_feedings):
                        hour = random.randint(6, 22)
                        feeding_time = date.replace(hour=hour, minute=random.randint(0, 59))
                        
                        record = FeedingRecord(
                            pet_id=pet.id,
                            device_id=random.choice(devices).id,
                            portion=random.uniform(20, 100),
                            timestamp=feeding_time,
                            status='success' if random.random() > 0.1 else 'failed'
                        )
                        db.session.add(record)
    
    db.session.commit()
    print("Data initialization completed!")

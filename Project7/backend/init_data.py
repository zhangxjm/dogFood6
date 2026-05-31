import sys
import os
from datetime import date, timedelta

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app import models, crud, schemas

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        shop_count = db.query(models.Shop).count()
        if shop_count > 0:
            print("Data already exists, skipping initialization.")
            return
        
        print("Initializing sample data...")
        
        sample_shops = [
            {"shop_number": "A101", "name": "美味餐饮店", "owner_name": "张三", "phone": "13800138001", "area": 80.0},
            {"shop_number": "A102", "name": "时尚服装店", "owner_name": "李四", "phone": "13800138002", "area": 60.0},
            {"shop_number": "A103", "name": "快乐超市", "owner_name": "王五", "phone": "13800138003", "area": 120.0},
            {"shop_number": "B201", "name": "美容美发店", "owner_name": "赵六", "phone": "13800138004", "area": 50.0},
            {"shop_number": "B202", "name": "数码电子店", "owner_name": "钱七", "phone": "13800138005", "area": 70.0},
        ]
        
        created_shops = []
        for shop_data in sample_shops:
            shop = schemas.ShopCreate(**shop_data)
            db_shop = crud.create_shop(db, shop)
            created_shops.append(db_shop)
            print(f"Created shop: {db_shop.shop_number} - {db_shop.name}")
        
        today = date.today()
        last_month = today.replace(day=1) - timedelta(days=1)
        reading_date = last_month.replace(day=25)
        
        for idx, shop in enumerate(created_shops):
            base_electric = 1000 + idx * 200
            base_water = 100 + idx * 30
            
            reading = schemas.MeterReadingCreate(
                shop_id=shop.id,
                reading_date=reading_date,
                electric_previous=base_electric,
                electric_current=base_electric + 250 + idx * 30,
                water_previous=base_water,
                water_current=base_water + 15 + idx * 5,
                remark="初始化数据"
            )
            db_reading = crud.create_meter_reading(db, reading)
            print(f"Created meter reading for shop {shop.shop_number}")
            
            bill = crud.generate_bill_from_reading(db, db_reading.id)
            if bill:
                print(f"Generated bill {bill.bill_month} for shop {shop.shop_number}, total: {bill.total_amount}")
        
        paid_shop = created_shops[0]
        paid_bill = db.query(models.Bill).filter(models.Bill.shop_id == paid_shop.id).first()
        if paid_bill:
            payment = schemas.PaymentCreate(
                shop_id=paid_shop.id,
                bill_id=paid_bill.id,
                payment_date=date.today(),
                amount=paid_bill.total_amount,
                payment_method="银行转账",
                remark="初始化缴费记录"
            )
            crud.create_payment(db, payment)
            print(f"Created payment for shop {paid_shop.shop_number}")
        
        print("Sample data initialization completed successfully!")
        
    except Exception as e:
        print(f"Error initializing data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_db()

from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Shop(Base):
    __tablename__ = "shops"

    id = Column(Integer, primary_key=True, index=True)
    shop_number = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    owner_name = Column(String(100))
    phone = Column(String(20))
    area = Column(Float, comment="面积(平方米)")
    electric_rate = Column(Float, default=1.2, comment="电费单价(元/度)")
    water_rate = Column(Float, default=4.5, comment="水费单价(元/吨)")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    meter_readings = relationship("MeterReading", back_populates="shop")
    bills = relationship("Bill", back_populates="shop")
    payments = relationship("Payment", back_populates="shop")


class MeterReading(Base):
    __tablename__ = "meter_readings"

    id = Column(Integer, primary_key=True, index=True)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)
    reading_date = Column(Date, nullable=False)
    electric_previous = Column(Float, comment="上期电表读数")
    electric_current = Column(Float, comment="本期电表读数")
    electric_usage = Column(Float, comment="本期用电量")
    water_previous = Column(Float, comment="上期水表读数")
    water_current = Column(Float, comment="本期水表读数")
    water_usage = Column(Float, comment="本期用水量")
    remark = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    shop = relationship("Shop", back_populates="meter_readings")
    bill = relationship("Bill", back_populates="meter_reading", uselist=False)


class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)
    meter_reading_id = Column(Integer, ForeignKey("meter_readings.id"), nullable=False)
    bill_month = Column(String(7), nullable=False, comment="账期(YYYY-MM)")
    electric_usage = Column(Float, comment="用电量(度)")
    electric_amount = Column(Float, comment="电费(元)")
    water_usage = Column(Float, comment="用水量(吨)")
    water_amount = Column(Float, comment="水费(元)")
    total_amount = Column(Float, comment="总费用(元)")
    is_paid = Column(Boolean, default=False)
    payment_deadline = Column(Date, comment="缴费截止日期")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    shop = relationship("Shop", back_populates="bills")
    meter_reading = relationship("MeterReading", back_populates="bill")
    payment = relationship("Payment", back_populates="bill", uselist=False)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)
    bill_id = Column(Integer, ForeignKey("bills.id"), nullable=False)
    payment_date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False, comment="缴费金额")
    payment_method = Column(String(50), comment="缴费方式")
    remark = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    shop = relationship("Shop", back_populates="payments")
    bill = relationship("Bill", back_populates="payment")

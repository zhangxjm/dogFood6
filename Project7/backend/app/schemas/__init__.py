from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class ShopBase(BaseModel):
    shop_number: str = Field(..., max_length=50)
    name: str = Field(..., max_length=100)
    owner_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    area: Optional[float] = None
    electric_rate: float = 1.2
    water_rate: float = 4.5
    is_active: bool = True


class ShopCreate(ShopBase):
    pass


class ShopUpdate(ShopBase):
    pass


class Shop(ShopBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MeterReadingBase(BaseModel):
    shop_id: int
    reading_date: date
    electric_previous: Optional[float] = 0
    electric_current: float
    electric_usage: Optional[float] = 0
    water_previous: Optional[float] = 0
    water_current: float
    water_usage: Optional[float] = 0
    remark: Optional[str] = None


class MeterReadingCreate(MeterReadingBase):
    pass


class MeterReadingUpdate(MeterReadingBase):
    pass


class MeterReading(MeterReadingBase):
    id: int
    created_at: datetime
    shop: Optional[Shop] = None

    class Config:
        from_attributes = True


class BillBase(BaseModel):
    shop_id: int
    meter_reading_id: int
    bill_month: str = Field(..., max_length=7)
    electric_usage: float = 0
    electric_amount: float = 0
    water_usage: float = 0
    water_amount: float = 0
    total_amount: float = 0
    is_paid: bool = False
    payment_deadline: Optional[date] = None


class BillCreate(BillBase):
    pass


class BillUpdate(BaseModel):
    is_paid: Optional[bool] = None
    payment_deadline: Optional[date] = None


class Bill(BillBase):
    id: int
    created_at: datetime
    shop: Optional[Shop] = None
    meter_reading: Optional[MeterReading] = None

    class Config:
        from_attributes = True


class PaymentBase(BaseModel):
    shop_id: int
    bill_id: int
    payment_date: date
    amount: float
    payment_method: Optional[str] = Field(None, max_length=50)
    remark: Optional[str] = None


class PaymentCreate(PaymentBase):
    pass


class Payment(PaymentBase):
    id: int
    created_at: datetime
    shop: Optional[Shop] = None
    bill: Optional[Bill] = None

    class Config:
        from_attributes = True


class BillWithDetails(Bill):
    shop_name: Optional[str] = None
    shop_number: Optional[str] = None
    has_overdue: Optional[bool] = False


class DashboardStats(BaseModel):
    total_shops: int = 0
    total_unpaid_bills: int = 0
    total_unpaid_amount: float = 0
    total_monthly_revenue: float = 0
    overdue_count: int = 0
    overdue_amount: float = 0

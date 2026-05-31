from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import CopyrightRecord, HeritageModel
from app.models.schemas import CopyrightCreate, CopyrightResponse
from datetime import datetime
import hashlib
import json
import random

router = APIRouter(prefix="/copyright", tags=["数字版权存证"])


def generate_hash(data: str) -> str:
    return "0x" + hashlib.sha256(data.encode()).hexdigest()


def generate_transaction_id() -> str:
    return "0x" + ''.join([random.choice('0123456789abcdef') for _ in range(64)])


@router.get("/", response_model=List[CopyrightResponse])
def list_copyrights(
    heritage_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(CopyrightRecord)
    if heritage_id:
        query = query.filter(CopyrightRecord.heritage_id == heritage_id)
    if status:
        query = query.filter(CopyrightRecord.status == status)
    
    return query.order_by(CopyrightRecord.timestamp.desc()).offset(skip).limit(limit).all()


@router.get("/{record_id}", response_model=CopyrightResponse)
def get_copyright(record_id: int, db: Session = Depends(get_db)):
    record = db.query(CopyrightRecord).filter(CopyrightRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="版权记录不存在")
    return record


@router.post("/", response_model=CopyrightResponse)
def register_copyright(copyright: CopyrightCreate, db: Session = Depends(get_db)):
    heritage = db.query(HeritageModel).filter(HeritageModel.id == copyright.heritage_id).first()
    if not heritage:
        raise HTTPException(status_code=404, detail="关联文物不存在")
    
    existing = db.query(CopyrightRecord).filter(CopyrightRecord.heritage_id == copyright.heritage_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="该文物已注册版权")
    
    data_to_hash = f"{copyright.work_name}{copyright.author}{datetime.now().isoformat()}"
    register_hash = generate_hash(data_to_hash)
    transaction_id = generate_transaction_id()
    block_number = str(random.randint(18000000, 19000000))
    
    db_record = CopyrightRecord(
        heritage_id=copyright.heritage_id,
        work_name=copyright.work_name,
        author=copyright.author,
        creation_date=copyright.creation_date,
        register_hash=register_hash,
        transaction_id=transaction_id,
        block_number=block_number,
        certificate_url=f"/certificates/{copyright.heritage_id}_{register_hash[:16]}.pdf",
        status="registered",
        work_metadata=copyright.work_metadata
    )
    db.add(db_record)
    
    heritage.copyright_registered = True
    heritage.copyright_hash = register_hash
    heritage.copyright_register_time = datetime.now()
    
    db.commit()
    db.refresh(db_record)
    return db_record


@router.post("/simulate-register")
def simulate_register_copyright(db: Session = Depends(get_db)):
    unregistered = db.query(HeritageModel).filter(HeritageModel.copyright_registered == False).all()
    
    results = []
    for heritage in unregistered:
        data_to_hash = f"{heritage.name}{datetime.now().isoformat()}"
        register_hash = generate_hash(data_to_hash)
        transaction_id = generate_transaction_id()
        block_number = str(random.randint(18000000, 19000000))
        
        record = CopyrightRecord(
            heritage_id=heritage.id,
            work_name=f"{heritage.name}三维数字模型",
            author="非遗数字化平台",
            creation_date=datetime.now().strftime("%Y-%m-%d"),
            register_hash=register_hash,
            transaction_id=transaction_id,
            block_number=block_number,
            certificate_url=f"/certificates/{heritage.id}_{register_hash[:16]}.pdf",
            status="registered",
            work_metadata=json.dumps({"auto_registered": True})
        )
        db.add(record)
        
        heritage.copyright_registered = True
        heritage.copyright_hash = register_hash
        heritage.copyright_register_time = datetime.now()
        
        results.append({
            "heritage_id": heritage.id,
            "heritage_name": heritage.name,
            "register_hash": register_hash
        })
    
    db.commit()
    
    return {"message": "批量版权存证完成", "registered_count": len(results), "results": results}


@router.post("/{record_id}/verify")
def verify_copyright(record_id: int, db: Session = Depends(get_db)):
    record = db.query(CopyrightRecord).filter(CopyrightRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="版权记录不存在")
    
    is_valid = record.register_hash is not None and len(record.register_hash) > 0
    
    return {
        "valid": is_valid,
        "record_id": record_id,
        "register_hash": record.register_hash,
        "transaction_id": record.transaction_id,
        "block_number": record.block_number,
        "timestamp": record.timestamp
    }


@router.delete("/{record_id}")
def delete_copyright(record_id: int, db: Session = Depends(get_db)):
    record = db.query(CopyrightRecord).filter(CopyrightRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="版权记录不存在")
    
    heritage = db.query(HeritageModel).filter(HeritageModel.id == record.heritage_id).first()
    if heritage:
        heritage.copyright_registered = False
        heritage.copyright_hash = None
        heritage.copyright_register_time = None
    
    db.delete(record)
    db.commit()
    return {"message": "删除成功"}

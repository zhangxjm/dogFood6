import hashlib
import uuid
from datetime import datetime
from typing import Dict, List, Optional
from sqlalchemy.orm import Session

from ..models import Work, TraceRecord
from ..schemas import WorkCreate, TraceRecordCreate


class TraceabilityService:
    def generate_traceability_code(self, craft_id: Optional[int], creator_id: int) -> str:
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        unique_id = str(uuid.uuid4()).replace("-", "")[:8]
        raw_string = f"HERITAGE-{craft_id or '0'}-{creator_id}-{timestamp}-{unique_id}"
        hash_code = hashlib.sha256(raw_string.encode()).hexdigest()[:16].upper()
        return f"HC{timestamp}{hash_code}"

    def generate_block_hash(self, previous_hash: str, data: Dict) -> str:
        data_string = f"{previous_hash}-{data.get('action')}-{data.get('timestamp')}"
        return hashlib.sha256(data_string.encode()).hexdigest()

    def create_work_with_trace(
        self,
        db: Session,
        work_data: WorkCreate,
        creator_id: int
    ) -> Work:
        traceability_code = self.generate_traceability_code(
            work_data.craft_id,
            creator_id
        )

        work = Work(
            **work_data.model_dump(exclude={"trace_records"}),
            creator_id=creator_id,
            traceability_code=traceability_code,
            quality_verified=False
        )
        db.add(work)
        db.flush()

        genesis_record = TraceRecord(
            work_id=work.id,
            step_number=0,
            action="作品创建",
            description=f"作品《{work.title}》创建成功，溯源码：{traceability_code}",
            operator="系统",
            location="数字传承平台",
            timestamp=datetime.utcnow()
        )
        db.add(genesis_record)

        if work_data.trace_records:
            for i, record_data in enumerate(work_data.trace_records):
                trace_record = TraceRecord(
                    **record_data.model_dump(exclude={"step_number"}),
                    work_id=work.id,
                    step_number=i + 1,
                    timestamp=datetime.utcnow()
                )
                db.add(trace_record)

        db.commit()
        db.refresh(work)
        return work

    def add_trace_record(
        self,
        db: Session,
        work_id: int,
        record_data: TraceRecordCreate
    ) -> TraceRecord:
        work = db.query(Work).filter(Work.id == work_id).first()
        if not work:
            raise ValueError("Work not found")

        max_step = db.query(TraceRecord).filter(
            TraceRecord.work_id == work_id
        ).count()

        trace_record = TraceRecord(
            **record_data.model_dump(),
            work_id=work_id,
            step_number=max_step,
            timestamp=datetime.utcnow()
        )
        db.add(trace_record)
        db.commit()
        db.refresh(trace_record)
        return trace_record

    def verify_work(self, db: Session, work_id: int) -> bool:
        work = db.query(Work).filter(Work.id == work_id).first()
        if not work:
            return False

        work.quality_verified = True
        db.commit()

        verification_record = TraceRecord(
            work_id=work_id,
            action="品质认证",
            description="作品已通过平台品质认证，符合非遗技艺标准",
            operator="平台审核员",
            timestamp=datetime.utcnow()
        )
        db.add(verification_record)
        db.commit()

        return True

    def get_trace_history(self, db: Session, traceability_code: str) -> Optional[Dict]:
        work = db.query(Work).filter(
            Work.traceability_code == traceability_code
        ).first()

        if not work:
            return None

        trace_records = db.query(TraceRecord).filter(
            TraceRecord.work_id == work.id
        ).order_by(TraceRecord.step_number).all()

        return {
            "work": work,
            "trace_records": trace_records,
            "is_verified": work.quality_verified,
            "record_count": len(trace_records),
            "integrity_score": self._calculate_integrity_score(trace_records)
        }

    def _calculate_integrity_score(self, records: List[TraceRecord]) -> float:
        if not records:
            return 0.0

        score = 100.0
        expected_steps = set(range(len(records)))
        actual_steps = set(r.step_number for r in records)

        missing_steps = expected_steps - actual_steps
        score -= len(missing_steps) * 10

        for record in records:
            if not record.timestamp:
                score -= 5
            if not record.operator:
                score -= 2

        return max(0.0, min(100.0, score))

    def verify_integrity(self, db: Session, work_id: int) -> Dict:
        work = db.query(Work).filter(Work.id == work_id).first()
        if not work:
            return {"valid": False, "error": "Work not found"}

        trace_records = db.query(TraceRecord).filter(
            TraceRecord.work_id == work_id
        ).order_by(TraceRecord.timestamp).all()

        issues = []

        for i in range(1, len(trace_records)):
            curr = trace_records[i]
            prev = trace_records[i - 1]

            if curr.timestamp < prev.timestamp:
                issues.append(f"记录 {curr.id} 时间戳早于前一条记录")

            if curr.step_number <= prev.step_number:
                issues.append(f"记录 {curr.id} 步骤号不正确")

        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "record_count": len(trace_records),
            "integrity_score": self._calculate_integrity_score(trace_records)
        }


traceability_service = TraceabilityService()

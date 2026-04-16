from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.operation_log import OperationLog

router = APIRouter(prefix="/logs", tags=["logs"])


@router.get("")
def list_logs(
    object_type: Optional[str] = Query(default=None),
    action: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(OperationLog)

    if object_type:
        query = query.filter(OperationLog.object_type == object_type)

    if action:
        query = query.filter(OperationLog.action == action)

    logs = query.order_by(OperationLog.id.desc()).all()

    return [
        {
            "id": log.id,
            "object_type": log.object_type,
            "object_id": log.object_id,
            "action": log.action,
            "detail": log.detail,
            "operator": log.operator,
            "time": log.time,
        }
        for log in logs
    ]
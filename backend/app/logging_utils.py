from sqlalchemy.orm import Session
from app.models.operation_log import OperationLog


def write_log(
    db: Session,
    object_type: str,
    object_id: int,
    action: str,
    detail: str,
    operator: str = "system",
):
    log = OperationLog(
        object_type=object_type,
        object_id=object_id,
        action=action,
        detail=detail,
        operator=operator,
    )
    db.add(log)
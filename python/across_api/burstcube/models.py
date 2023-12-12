import hashlib
from decimal import Decimal
from typing import Optional

import arc  # type: ignore
from pydantic import computed_field

from ..base.models import DynamoDBBase, TLEEntryModelBase
from ..base.schema import BaseSchema, OptionalCoordSchema

# class BurstCubeTOOModel(Base):
#     """SQLAlchemy model for BurstCubeTOO"""

#     __tablename__ = "burstcube_too"

#     id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
#     timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
#     username: Mapped[str] = mapped_column(String(20), nullable=False)
#     trigger_mission: Mapped[str] = mapped_column(String(30), nullable=False)
#     trigger_instrument: Mapped[str] = mapped_column(String(30), nullable=False)
#     trigger_id: Mapped[str] = mapped_column(String(30), nullable=False)
#     trigger_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
#     trigger_duration: Mapped[float] = mapped_column(Float, nullable=True)
#     classification: Mapped[str] = mapped_column(String(30), nullable=True)
#     justification: Mapped[str] = mapped_column(String(1000), nullable=True)
#     ra: Mapped[float] = mapped_column(Float, nullable=True)
#     dec: Mapped[float] = mapped_column(Float, nullable=True)
#     error: Mapped[float] = mapped_column(Float, nullable=True)
#     begin: Mapped[datetime] = mapped_column(DateTime)
#     end: Mapped[datetime] = mapped_column(DateTime)
#     exposure: Mapped[float] = mapped_column(Float)
#     offset: Mapped[float] = mapped_column(Float)
#     reason: Mapped[TOOReason] = mapped_column(
#         Enum(TOOReason), nullable=False, default=TOOReason.none
#     )
#     too_status: Mapped[TOOStatus] = mapped_column(
#         Enum(TOOStatus), nullable=False, default=TOOStatus.requested
#     )
#     too_info: Mapped[str] = mapped_column(String(), nullable=False)


class BurstCubeTOOModel(OptionalCoordSchema, DynamoDBBase):
    __tablename__ = "burstcube_too"
    username: str
    timestamp: str
    trigger_mission: str
    trigger_instrument: str
    trigger_id: str
    trigger_time: str
    trigger_duration: Optional[Decimal] = None
    classification: Optional[str] = None
    justification: Optional[str] = None
    begin: Optional[str] = None
    end: Optional[str] = None
    exposure: Decimal = Decimal(200)
    offset: Decimal = Decimal(-50)
    reason: str = "None"
    too_status: str = "Requested"
    too_info: str = ""

    @computed_field  # type: ignore
    @property
    def id(self) -> str:
        return hashlib.md5(
            f"{self.trigger_time}{self.trigger_mission}".encode()
        ).hexdigest()

    @classmethod
    def delete_table(cls):
        arc.tables.table(cls.__tablename__).delete()


class BurstCubeTLEEntryModel(BaseSchema, TLEEntryModelBase):
    """TLE Entry for Mission"""

    __tablename__ = "burstcube_tle"

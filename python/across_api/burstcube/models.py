from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, String, func
from sqlalchemy.orm import Mapped, mapped_column

from ..api_db import Base
from ..base.models import TLEEntryModelBase
from ..base.schema import BaseSchema
from .schema import TOOReason, TOOStatus


class BurstCubeTOOModel(Base):
    """SQLAlchemy model for BurstCubeTOO"""

    __tablename__ = "burstcube_too"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    username: Mapped[str] = mapped_column(String(20), nullable=False)
    trigger_mission: Mapped[str] = mapped_column(String(30), nullable=False)
    trigger_instrument: Mapped[str] = mapped_column(String(30), nullable=False)
    trigger_id: Mapped[str] = mapped_column(String(30), nullable=False)
    trigger_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    trigger_duration: Mapped[float] = mapped_column(Float, nullable=True)
    classification: Mapped[str] = mapped_column(String(30), nullable=True)
    justification: Mapped[str] = mapped_column(String(1000), nullable=True)
    ra: Mapped[float] = mapped_column(Float, nullable=True)
    dec: Mapped[float] = mapped_column(Float, nullable=True)
    error: Mapped[float] = mapped_column(Float, nullable=True)
    begin: Mapped[datetime] = mapped_column(DateTime)
    end: Mapped[datetime] = mapped_column(DateTime)
    exposure: Mapped[float] = mapped_column(Float)
    offset: Mapped[float] = mapped_column(Float)
    reason: Mapped[TOOReason] = mapped_column(
        Enum(TOOReason), nullable=False, default=TOOReason.none
    )
    too_status: Mapped[TOOStatus] = mapped_column(
        Enum(TOOStatus), nullable=False, default=TOOStatus.requested
    )
    too_info: Mapped[str] = mapped_column(String(), nullable=False)


class BurstCubeTLEEntryModel(BaseSchema, TLEEntryModelBase):
    """TLE Entry for Mission"""

    __tablename__ = "burstcube_tle"


# FIXME: It's not clear to me why I have to create the tables here, they should be created by including them in api.arc?
try:
    BurstCubeTLEEntryModel.create_table()
except Exception:
    pass

from core.database import Base
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String


class Vpn_nodes(Base):
    __tablename__ = "vpn_nodes"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    region = Column(String, nullable=False)
    city = Column(String, nullable=False)
    country_code = Column(String, nullable=False)
    latency = Column(Integer, nullable=False)
    load = Column(Integer, nullable=False)
    protocol = Column(String, nullable=False)
    status = Column(String, nullable=False)
    is_free = Column(Boolean, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)
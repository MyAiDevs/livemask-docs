import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.vpn_nodes import Vpn_nodes

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class Vpn_nodesService:
    """Service layer for Vpn_nodes operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Vpn_nodes]:
        """Create a new vpn_nodes"""
        try:
            obj = Vpn_nodes(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created vpn_nodes with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating vpn_nodes: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Vpn_nodes]:
        """Get vpn_nodes by ID"""
        try:
            query = select(Vpn_nodes).where(Vpn_nodes.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching vpn_nodes {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of vpn_nodess"""
        try:
            query = select(Vpn_nodes)
            count_query = select(func.count(Vpn_nodes.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Vpn_nodes, field):
                        query = query.where(getattr(Vpn_nodes, field) == value)
                        count_query = count_query.where(getattr(Vpn_nodes, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Vpn_nodes, field_name):
                        query = query.order_by(getattr(Vpn_nodes, field_name).desc())
                else:
                    if hasattr(Vpn_nodes, sort):
                        query = query.order_by(getattr(Vpn_nodes, sort))
            else:
                query = query.order_by(Vpn_nodes.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching vpn_nodes list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Vpn_nodes]:
        """Update vpn_nodes"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Vpn_nodes {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated vpn_nodes {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating vpn_nodes {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete vpn_nodes"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Vpn_nodes {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted vpn_nodes {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting vpn_nodes {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Vpn_nodes]:
        """Get vpn_nodes by any field"""
        try:
            if not hasattr(Vpn_nodes, field_name):
                raise ValueError(f"Field {field_name} does not exist on Vpn_nodes")
            result = await self.db.execute(
                select(Vpn_nodes).where(getattr(Vpn_nodes, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching vpn_nodes by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Vpn_nodes]:
        """Get list of vpn_nodess filtered by field"""
        try:
            if not hasattr(Vpn_nodes, field_name):
                raise ValueError(f"Field {field_name} does not exist on Vpn_nodes")
            result = await self.db.execute(
                select(Vpn_nodes)
                .where(getattr(Vpn_nodes, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Vpn_nodes.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching vpn_nodess by {field_name}: {str(e)}")
            raise
import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.subscription_plans import Subscription_plans

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class Subscription_plansService:
    """Service layer for Subscription_plans operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Subscription_plans]:
        """Create a new subscription_plans"""
        try:
            obj = Subscription_plans(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created subscription_plans with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating subscription_plans: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Subscription_plans]:
        """Get subscription_plans by ID"""
        try:
            query = select(Subscription_plans).where(Subscription_plans.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching subscription_plans {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of subscription_planss"""
        try:
            query = select(Subscription_plans)
            count_query = select(func.count(Subscription_plans.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Subscription_plans, field):
                        query = query.where(getattr(Subscription_plans, field) == value)
                        count_query = count_query.where(getattr(Subscription_plans, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Subscription_plans, field_name):
                        query = query.order_by(getattr(Subscription_plans, field_name).desc())
                else:
                    if hasattr(Subscription_plans, sort):
                        query = query.order_by(getattr(Subscription_plans, sort))
            else:
                query = query.order_by(Subscription_plans.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching subscription_plans list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Subscription_plans]:
        """Update subscription_plans"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Subscription_plans {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated subscription_plans {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating subscription_plans {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete subscription_plans"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Subscription_plans {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted subscription_plans {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting subscription_plans {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Subscription_plans]:
        """Get subscription_plans by any field"""
        try:
            if not hasattr(Subscription_plans, field_name):
                raise ValueError(f"Field {field_name} does not exist on Subscription_plans")
            result = await self.db.execute(
                select(Subscription_plans).where(getattr(Subscription_plans, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching subscription_plans by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Subscription_plans]:
        """Get list of subscription_planss filtered by field"""
        try:
            if not hasattr(Subscription_plans, field_name):
                raise ValueError(f"Field {field_name} does not exist on Subscription_plans")
            result = await self.db.execute(
                select(Subscription_plans)
                .where(getattr(Subscription_plans, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Subscription_plans.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching subscription_planss by {field_name}: {str(e)}")
            raise
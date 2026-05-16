import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.subscription_plans import Subscription_plansService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/subscription_plans", tags=["subscription_plans"])


# ---------- Pydantic Schemas ----------
class Subscription_plansData(BaseModel):
    """Entity data schema (for create/update)"""
    name: str
    price_monthly: float
    price_yearly: float = None
    max_nodes: int = None
    bandwidth_limit: str = None
    features: str = None
    is_active: bool


class Subscription_plansUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    name: Optional[str] = None
    price_monthly: Optional[float] = None
    price_yearly: Optional[float] = None
    max_nodes: Optional[int] = None
    bandwidth_limit: Optional[str] = None
    features: Optional[str] = None
    is_active: Optional[bool] = None


class Subscription_plansResponse(BaseModel):
    """Entity response schema"""
    id: int
    name: str
    price_monthly: float
    price_yearly: Optional[float] = None
    max_nodes: Optional[int] = None
    bandwidth_limit: Optional[str] = None
    features: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Subscription_plansListResponse(BaseModel):
    """List response schema"""
    items: List[Subscription_plansResponse]
    total: int
    skip: int
    limit: int


class Subscription_plansBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Subscription_plansData]


class Subscription_plansBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Subscription_plansUpdateData


class Subscription_plansBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Subscription_plansBatchUpdateItem]


class Subscription_plansBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Subscription_plansListResponse)
async def query_subscription_planss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query subscription_planss with filtering, sorting, and pagination"""
    logger.debug(f"Querying subscription_planss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Subscription_plansService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")
        
        result = await service.get_list(
            skip=skip, 
            limit=limit,
            query_dict=query_dict,
            sort=sort,
        )
        logger.debug(f"Found {result['total']} subscription_planss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying subscription_planss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Subscription_plansListResponse)
async def query_subscription_planss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query subscription_planss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying subscription_planss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Subscription_plansService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query_dict=query_dict,
            sort=sort
        )
        logger.debug(f"Found {result['total']} subscription_planss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying subscription_planss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Subscription_plansResponse)
async def get_subscription_plans(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single subscription_plans by ID"""
    logger.debug(f"Fetching subscription_plans with id: {id}, fields={fields}")
    
    service = Subscription_plansService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Subscription_plans with id {id} not found")
            raise HTTPException(status_code=404, detail="Subscription_plans not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching subscription_plans {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Subscription_plansResponse, status_code=201)
async def create_subscription_plans(
    data: Subscription_plansData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new subscription_plans"""
    logger.debug(f"Creating new subscription_plans with data: {data}")
    
    service = Subscription_plansService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create subscription_plans")
        
        logger.info(f"Subscription_plans created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating subscription_plans: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating subscription_plans: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Subscription_plansResponse], status_code=201)
async def create_subscription_planss_batch(
    request: Subscription_plansBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple subscription_planss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} subscription_planss")
    
    service = Subscription_plansService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} subscription_planss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Subscription_plansResponse])
async def update_subscription_planss_batch(
    request: Subscription_plansBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple subscription_planss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} subscription_planss")
    
    service = Subscription_plansService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} subscription_planss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Subscription_plansResponse)
async def update_subscription_plans(
    id: int,
    data: Subscription_plansUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing subscription_plans"""
    logger.debug(f"Updating subscription_plans {id} with data: {data}")

    service = Subscription_plansService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Subscription_plans with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Subscription_plans not found")
        
        logger.info(f"Subscription_plans {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating subscription_plans {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating subscription_plans {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_subscription_planss_batch(
    request: Subscription_plansBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple subscription_planss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} subscription_planss")
    
    service = Subscription_plansService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} subscription_planss successfully")
        return {"message": f"Successfully deleted {deleted_count} subscription_planss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_subscription_plans(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single subscription_plans by ID"""
    logger.debug(f"Deleting subscription_plans with id: {id}")
    
    service = Subscription_plansService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Subscription_plans with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Subscription_plans not found")
        
        logger.info(f"Subscription_plans {id} deleted successfully")
        return {"message": "Subscription_plans deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting subscription_plans {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
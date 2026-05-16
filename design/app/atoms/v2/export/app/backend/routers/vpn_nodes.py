import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.vpn_nodes import Vpn_nodesService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/vpn_nodes", tags=["vpn_nodes"])


# ---------- Pydantic Schemas ----------
class Vpn_nodesData(BaseModel):
    """Entity data schema (for create/update)"""
    region: str
    city: str
    country_code: str
    latency: int
    load: int
    protocol: str
    status: str
    is_free: bool


class Vpn_nodesUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    region: Optional[str] = None
    city: Optional[str] = None
    country_code: Optional[str] = None
    latency: Optional[int] = None
    load: Optional[int] = None
    protocol: Optional[str] = None
    status: Optional[str] = None
    is_free: Optional[bool] = None


class Vpn_nodesResponse(BaseModel):
    """Entity response schema"""
    id: int
    region: str
    city: str
    country_code: str
    latency: int
    load: int
    protocol: str
    status: str
    is_free: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Vpn_nodesListResponse(BaseModel):
    """List response schema"""
    items: List[Vpn_nodesResponse]
    total: int
    skip: int
    limit: int


class Vpn_nodesBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Vpn_nodesData]


class Vpn_nodesBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Vpn_nodesUpdateData


class Vpn_nodesBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Vpn_nodesBatchUpdateItem]


class Vpn_nodesBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Vpn_nodesListResponse)
async def query_vpn_nodess(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query vpn_nodess with filtering, sorting, and pagination"""
    logger.debug(f"Querying vpn_nodess: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Vpn_nodesService(db)
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
        logger.debug(f"Found {result['total']} vpn_nodess")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying vpn_nodess: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Vpn_nodesListResponse)
async def query_vpn_nodess_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query vpn_nodess with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying vpn_nodess: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Vpn_nodesService(db)
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
        logger.debug(f"Found {result['total']} vpn_nodess")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying vpn_nodess: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Vpn_nodesResponse)
async def get_vpn_nodes(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single vpn_nodes by ID"""
    logger.debug(f"Fetching vpn_nodes with id: {id}, fields={fields}")
    
    service = Vpn_nodesService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Vpn_nodes with id {id} not found")
            raise HTTPException(status_code=404, detail="Vpn_nodes not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching vpn_nodes {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Vpn_nodesResponse, status_code=201)
async def create_vpn_nodes(
    data: Vpn_nodesData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new vpn_nodes"""
    logger.debug(f"Creating new vpn_nodes with data: {data}")
    
    service = Vpn_nodesService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create vpn_nodes")
        
        logger.info(f"Vpn_nodes created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating vpn_nodes: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating vpn_nodes: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Vpn_nodesResponse], status_code=201)
async def create_vpn_nodess_batch(
    request: Vpn_nodesBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple vpn_nodess in a single request"""
    logger.debug(f"Batch creating {len(request.items)} vpn_nodess")
    
    service = Vpn_nodesService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} vpn_nodess successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Vpn_nodesResponse])
async def update_vpn_nodess_batch(
    request: Vpn_nodesBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple vpn_nodess in a single request"""
    logger.debug(f"Batch updating {len(request.items)} vpn_nodess")
    
    service = Vpn_nodesService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} vpn_nodess successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Vpn_nodesResponse)
async def update_vpn_nodes(
    id: int,
    data: Vpn_nodesUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing vpn_nodes"""
    logger.debug(f"Updating vpn_nodes {id} with data: {data}")

    service = Vpn_nodesService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Vpn_nodes with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Vpn_nodes not found")
        
        logger.info(f"Vpn_nodes {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating vpn_nodes {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating vpn_nodes {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_vpn_nodess_batch(
    request: Vpn_nodesBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple vpn_nodess by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} vpn_nodess")
    
    service = Vpn_nodesService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} vpn_nodess successfully")
        return {"message": f"Successfully deleted {deleted_count} vpn_nodess", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_vpn_nodes(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single vpn_nodes by ID"""
    logger.debug(f"Deleting vpn_nodes with id: {id}")
    
    service = Vpn_nodesService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Vpn_nodes with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Vpn_nodes not found")
        
        logger.info(f"Vpn_nodes {id} deleted successfully")
        return {"message": "Vpn_nodes deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting vpn_nodes {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
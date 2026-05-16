import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.favorite_nodes import Favorite_nodesService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/favorite_nodes", tags=["favorite_nodes"])


# ---------- Pydantic Schemas ----------
class Favorite_nodesData(BaseModel):
    """Entity data schema (for create/update)"""
    node_id: int


class Favorite_nodesUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    node_id: Optional[int] = None


class Favorite_nodesResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    node_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Favorite_nodesListResponse(BaseModel):
    """List response schema"""
    items: List[Favorite_nodesResponse]
    total: int
    skip: int
    limit: int


class Favorite_nodesBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Favorite_nodesData]


class Favorite_nodesBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Favorite_nodesUpdateData


class Favorite_nodesBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Favorite_nodesBatchUpdateItem]


class Favorite_nodesBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Favorite_nodesListResponse)
async def query_favorite_nodess(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query favorite_nodess with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying favorite_nodess: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Favorite_nodesService(db)
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
            user_id=str(current_user.id),
        )
        logger.debug(f"Found {result['total']} favorite_nodess")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying favorite_nodess: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Favorite_nodesListResponse)
async def query_favorite_nodess_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query favorite_nodess with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying favorite_nodess: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Favorite_nodesService(db)
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
        logger.debug(f"Found {result['total']} favorite_nodess")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying favorite_nodess: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Favorite_nodesResponse)
async def get_favorite_nodes(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single favorite_nodes by ID (user can only see their own records)"""
    logger.debug(f"Fetching favorite_nodes with id: {id}, fields={fields}")
    
    service = Favorite_nodesService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Favorite_nodes with id {id} not found")
            raise HTTPException(status_code=404, detail="Favorite_nodes not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching favorite_nodes {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Favorite_nodesResponse, status_code=201)
async def create_favorite_nodes(
    data: Favorite_nodesData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new favorite_nodes"""
    logger.debug(f"Creating new favorite_nodes with data: {data}")
    
    service = Favorite_nodesService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create favorite_nodes")
        
        logger.info(f"Favorite_nodes created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating favorite_nodes: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating favorite_nodes: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Favorite_nodesResponse], status_code=201)
async def create_favorite_nodess_batch(
    request: Favorite_nodesBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple favorite_nodess in a single request"""
    logger.debug(f"Batch creating {len(request.items)} favorite_nodess")
    
    service = Favorite_nodesService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} favorite_nodess successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Favorite_nodesResponse])
async def update_favorite_nodess_batch(
    request: Favorite_nodesBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple favorite_nodess in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} favorite_nodess")
    
    service = Favorite_nodesService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} favorite_nodess successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Favorite_nodesResponse)
async def update_favorite_nodes(
    id: int,
    data: Favorite_nodesUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing favorite_nodes (requires ownership)"""
    logger.debug(f"Updating favorite_nodes {id} with data: {data}")

    service = Favorite_nodesService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Favorite_nodes with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Favorite_nodes not found")
        
        logger.info(f"Favorite_nodes {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating favorite_nodes {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating favorite_nodes {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_favorite_nodess_batch(
    request: Favorite_nodesBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple favorite_nodess by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} favorite_nodess")
    
    service = Favorite_nodesService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} favorite_nodess successfully")
        return {"message": f"Successfully deleted {deleted_count} favorite_nodess", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_favorite_nodes(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single favorite_nodes by ID (requires ownership)"""
    logger.debug(f"Deleting favorite_nodes with id: {id}")
    
    service = Favorite_nodesService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Favorite_nodes with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Favorite_nodes not found")
        
        logger.info(f"Favorite_nodes {id} deleted successfully")
        return {"message": "Favorite_nodes deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting favorite_nodes {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
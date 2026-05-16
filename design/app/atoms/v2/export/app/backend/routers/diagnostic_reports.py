import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.diagnostic_reports import Diagnostic_reportsService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/diagnostic_reports", tags=["diagnostic_reports"])


# ---------- Pydantic Schemas ----------
class Diagnostic_reportsData(BaseModel):
    """Entity data schema (for create/update)"""
    issue_type: str
    node_id: int = None
    protocol: str = None
    network_type: str = None
    app_version: str = None
    config_version: str = None
    error_code: str = None
    description: str = None
    status: str


class Diagnostic_reportsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    issue_type: Optional[str] = None
    node_id: Optional[int] = None
    protocol: Optional[str] = None
    network_type: Optional[str] = None
    app_version: Optional[str] = None
    config_version: Optional[str] = None
    error_code: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class Diagnostic_reportsResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    issue_type: str
    node_id: Optional[int] = None
    protocol: Optional[str] = None
    network_type: Optional[str] = None
    app_version: Optional[str] = None
    config_version: Optional[str] = None
    error_code: Optional[str] = None
    description: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Diagnostic_reportsListResponse(BaseModel):
    """List response schema"""
    items: List[Diagnostic_reportsResponse]
    total: int
    skip: int
    limit: int


class Diagnostic_reportsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Diagnostic_reportsData]


class Diagnostic_reportsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Diagnostic_reportsUpdateData


class Diagnostic_reportsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Diagnostic_reportsBatchUpdateItem]


class Diagnostic_reportsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Diagnostic_reportsListResponse)
async def query_diagnostic_reportss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query diagnostic_reportss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying diagnostic_reportss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Diagnostic_reportsService(db)
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
        logger.debug(f"Found {result['total']} diagnostic_reportss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying diagnostic_reportss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Diagnostic_reportsListResponse)
async def query_diagnostic_reportss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query diagnostic_reportss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying diagnostic_reportss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Diagnostic_reportsService(db)
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
        logger.debug(f"Found {result['total']} diagnostic_reportss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying diagnostic_reportss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Diagnostic_reportsResponse)
async def get_diagnostic_reports(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single diagnostic_reports by ID (user can only see their own records)"""
    logger.debug(f"Fetching diagnostic_reports with id: {id}, fields={fields}")
    
    service = Diagnostic_reportsService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Diagnostic_reports with id {id} not found")
            raise HTTPException(status_code=404, detail="Diagnostic_reports not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching diagnostic_reports {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Diagnostic_reportsResponse, status_code=201)
async def create_diagnostic_reports(
    data: Diagnostic_reportsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new diagnostic_reports"""
    logger.debug(f"Creating new diagnostic_reports with data: {data}")
    
    service = Diagnostic_reportsService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create diagnostic_reports")
        
        logger.info(f"Diagnostic_reports created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating diagnostic_reports: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating diagnostic_reports: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Diagnostic_reportsResponse], status_code=201)
async def create_diagnostic_reportss_batch(
    request: Diagnostic_reportsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple diagnostic_reportss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} diagnostic_reportss")
    
    service = Diagnostic_reportsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} diagnostic_reportss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Diagnostic_reportsResponse])
async def update_diagnostic_reportss_batch(
    request: Diagnostic_reportsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple diagnostic_reportss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} diagnostic_reportss")
    
    service = Diagnostic_reportsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} diagnostic_reportss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Diagnostic_reportsResponse)
async def update_diagnostic_reports(
    id: int,
    data: Diagnostic_reportsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing diagnostic_reports (requires ownership)"""
    logger.debug(f"Updating diagnostic_reports {id} with data: {data}")

    service = Diagnostic_reportsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Diagnostic_reports with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Diagnostic_reports not found")
        
        logger.info(f"Diagnostic_reports {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating diagnostic_reports {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating diagnostic_reports {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_diagnostic_reportss_batch(
    request: Diagnostic_reportsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple diagnostic_reportss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} diagnostic_reportss")
    
    service = Diagnostic_reportsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} diagnostic_reportss successfully")
        return {"message": f"Successfully deleted {deleted_count} diagnostic_reportss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_diagnostic_reports(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single diagnostic_reports by ID (requires ownership)"""
    logger.debug(f"Deleting diagnostic_reports with id: {id}")
    
    service = Diagnostic_reportsService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Diagnostic_reports with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Diagnostic_reports not found")
        
        logger.info(f"Diagnostic_reports {id} deleted successfully")
        return {"message": "Diagnostic_reports deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting diagnostic_reports {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
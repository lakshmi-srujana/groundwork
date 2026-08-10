import os
import base64
import hashlib
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

try:
    from supabase import create_client, Client
    if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
        supabase: Optional[Client] = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    else:
        supabase = None
except Exception:
    supabase = None


# --- Models ---

class AssignTaskRequest(BaseModel):
    title: str
    description: str
    item_name: str
    quantity: int
    district: str
    ward: str
    volunteer_id: str
    coordinator_id: str
    due_date: Optional[str] = None


class PledgeTaskRequest(BaseModel):
    item_name: str
    quantity: int
    description: Optional[str] = None
    district: str
    ward: str
    volunteer_id: str
    due_date: Optional[str] = None


class UploadIPFSRequest(BaseModel):
    image_base64: str


# --- Routes ---

@router.post("/assign-task")
async def assign_task(req: AssignTaskRequest):
    """Coordinator assigns a task to a volunteer."""
    try:
        if supabase:
            result = supabase.table("tasks").insert({
                "title": req.title,
                "description": req.description,
                "item_name": req.item_name,
                "quantity": req.quantity,
                "district": req.district,
                "ward": req.ward,
                "assigned_to": req.volunteer_id,
                "assigned_by": req.coordinator_id,
                "is_self_pledged": False,
                "status": "pending",
                "due_date": req.due_date,
            }).execute()
            return {"success": True, "task": result.data}
        else:
            return {
                "success": True,
                "task": [{
                    "id": "task-assigned-mock",
                    "title": req.title,
                    "district": req.district,
                    "ward": req.ward,
                    "status": "pending",
                }],
                "mock": True,
            }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to assign task: {str(e)}",
        )


@router.post("/pledge-task")
async def pledge_task(req: PledgeTaskRequest):
    """Volunteer creates their own self-pledged task and inserts it into Supabase."""
    title = f"Delivering {req.quantity} {req.item_name} to {req.ward}"

    if not supabase:
        raise HTTPException(
            status_code=500,
            detail="Supabase client not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env",
        )

    try:
        task_data = {
            "title": title,
            "description": req.description,
            "item_name": req.item_name,
            "quantity": req.quantity,
            "district": req.district,
            "ward": req.ward,
            "assigned_to": req.volunteer_id,
            "assigned_by": None,
            "is_self_pledged": True,
            "status": "pending",
            "due_date": req.due_date,
            "created_at": datetime.utcnow().isoformat(),
        }

        result = supabase.table("tasks").insert(task_data).execute()

        if not result.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to insert task into Supabase: Empty response returned",
            )

        inserted_row = result.data[0]
        return {
            "success": True,
            "id": inserted_row.get("id"),
            "status": inserted_row.get("status"),
            "task": inserted_row,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Supabase insert failed: {str(e)}",
        )


@router.post("/upload-ipfs")
async def upload_ipfs(req: UploadIPFSRequest):
    """Upload a proof image to IPFS via Web3.storage and return the CID + URL."""
    try:
        image_bytes = base64.b64decode(req.image_base64)
        mock_cid = "bafybeig" + hashlib.sha256(image_bytes[:256]).hexdigest()[:48]

        w3s_token = os.getenv("WEB3_STORAGE_TOKEN")
        if w3s_token and not w3s_token.startswith("mock"):
            try:
                from web3storage import Client as W3Client
                w3 = W3Client(token=w3s_token)
                cid = w3.upload(image_bytes, name="proof.jpg")
                return {"cid": cid, "ipfs_url": f"https://{cid}.ipfs.w3s.link/proof.jpg"}
            except Exception:
                pass

        return {
            "cid": mock_cid,
            "ipfs_url": f"https://{mock_cid}.ipfs.w3s.link/proof.jpg",
            "mock": True,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"IPFS upload failed: {str(e)}",
        )

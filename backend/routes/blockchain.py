import os
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()


class BlockchainWriteRequest(BaseModel):
    volunteer_id: str
    task_id: str
    ipfs_cid: str
    verdict: str


@router.post("/write-blockchain")
async def write_blockchain(req: BlockchainWriteRequest):
    """
    Write a verification record to the Polygon blockchain via Thirdweb.
    Only called when verdict = 'verified'.
    """
    try:
        from thirdweb import ThirdwebSDK
        from thirdweb.types import SDKOptions

        private_key = os.getenv("THIRDWEB_PRIVATE_KEY")
        secret_key = os.getenv("THIRDWEB_SECRET_KEY")
        contract_address = os.getenv("CONTRACT_ADDRESS")

        if not all([private_key, secret_key, contract_address]):
            raise HTTPException(
                status_code=500,
                detail="Blockchain configuration missing. Check THIRDWEB_PRIVATE_KEY, THIRDWEB_SECRET_KEY, and CONTRACT_ADDRESS env vars.",
            )

        sdk = ThirdwebSDK.from_private_key(
            private_key,
            "polygon",
            SDKOptions(secret_key=secret_key),
        )

        contract = sdk.get_contract(contract_address)
        tx = contract.call(
            "recordVerification",
            [
                req.volunteer_id,
                req.task_id,
                req.ipfs_cid,
                int(time.time()),
                req.verdict,
            ],
        )
        tx_hash = tx.receipt.transaction_hash

        return {"tx_hash": tx_hash}

    except ImportError:
        # Thirdweb SDK not installed — return a mock hash for development
        mock_hash = f"0x{''.join(['ab' for _ in range(32)])}"
        return {"tx_hash": mock_hash, "mock": True}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Blockchain write failed: {str(e)}",
        )

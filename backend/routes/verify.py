import os
import json
import base64
import time
import hashlib
import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Supabase Client setup
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

# Gemini Vision AI setup
gemini_model = None
try:
    import google.generativeai as genai
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key and not api_key.startswith("AIzaSyPlaceholder"):
        genai.configure(api_key=api_key)
        # Primary choice: gemini-2.5-flash or gemini-2.0-flash or gemini-flash-latest
        for m_name in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"]:
            try:
                gemini_model = genai.GenerativeModel(m_name)
                break
            except Exception:
                continue
except Exception:
    gemini_model = None


class VerifyRequest(BaseModel):
    photo_base64: Optional[str] = None
    image_base64: Optional[str] = None
    task_title: Optional[str] = "Relief Task"
    task_description: Optional[str] = ""
    task_location: Optional[str] = None
    item_name: Optional[str] = "relief supplies"
    quantity: Optional[int] = 1
    geolocation: Optional[dict] = None
    volunteer_id: Optional[str] = ""
    task_id: Optional[str] = ""


# ─────────────────────────────────────────────────────────────────────────────
# ITEM CLASSIFICATION — HARD GATE (Step 1 of 2)
# ─────────────────────────────────────────────────────────────────────────────

HARD_MISMATCH_PAIRS = [
    # (expected_keywords, rejected_if_detected_contains)
    ({"cloth", "clothes", "clothing", "garment", "shirt", "dress"},
     {"bottle", "water", "can", "tin", "blanket", "food", "medicine", "drug", "rice", "packet", "ration"}),

    ({"bottle", "water"},
     {"cloth", "clothes", "clothing", "garment", "blanket", "food", "medicine", "drug", "rice", "packet"}),

    ({"blanket"},
     {"bottle", "water", "clothes", "clothing", "garment", "food", "medicine", "rice", "packet", "can"}),

    ({"food", "packet", "ration", "rice"},
     {"bottle", "water", "clothes", "clothing", "garment", "blanket", "medicine", "drug", "can"}),

    ({"medicine", "drug", "medical"},
     {"bottle", "water", "clothes", "clothing", "garment", "blanket", "food", "packet", "ration", "rice"}),
]


def programmatic_item_match(expected: str, detected_list: List[str]) -> bool:
    """
    Programmatic hard-gate item matching. Does NOT use Gemini's own verdict.
    Returns False (mismatch) if any detected item conflicts with the expected item.
    Returns True only when there is no hard conflict AND detected items semantically match.
    """
    if not detected_list:
        return False

    expected_lower = expected.lower()
    expected_words = set(re.findall(r'\w+', expected_lower))
    detected_combined = " ".join(d.lower() for d in detected_list)
    detected_words = set(re.findall(r'\w+', detected_combined))

    # Hard mismatch check
    for exp_set, bad_set in HARD_MISMATCH_PAIRS:
        expected_hits = expected_words & exp_set
        if expected_hits:
            # The expected item belongs to this category; check detected for bad keywords
            if detected_words & bad_set:
                return False  # Hard mismatch

    # Positive match: detected must share at least one meaningful keyword with expected
    STOP = {"the", "a", "an", "and", "of", "for", "to", "in", "is", "are", "with", "at"}
    expected_content = expected_words - STOP
    detected_content = detected_words - STOP

    return bool(expected_content & detected_content)


def gemini_classify_item(image_bytes: bytes, item_name: str) -> dict:
    """
    DEDICATED ITEM CLASSIFICATION CALL — first Gemini call, item-only focus.
    Returns structured JSON with detected items and match verdict.
    Raises on failure so the hard gate can catch it.
    """
    classification_prompt = f"""You are an item identification AI for disaster relief auditing.

Look ONLY at the physical objects visible in this image.
The expected item that should be in the photo is: "{item_name}"

Your task:
1. Identify what physical items are actually visible in the image (be specific — e.g., "plastic water bottles", "folded clothing", "rice bags")
2. Decide whether those detected items match the expected item "{item_name}"
3. Matching rules:
   - "water bottles" matches "drinking water bottles" or "bottles of water"
   - "clothes" matches "clothing", "garments", "shirts"
   - "water bottles" does NOT match "clothes", "food", "blankets", "medicine"
   - "clothes" does NOT match "bottles", "food", "blankets", "medicine"
   - Do NOT accept "relief supplies" as a match for any specific item
   - If items in the image clearly differ from the expected item -> match = false

Return ONLY valid JSON, no explanation, no markdown:
{{
  "expected_item": "{item_name}",
  "detected_items": ["exact description of what you see"],
  "match": true or false,
  "confidence": 0.0 to 1.0,
  "reason": "one sentence explaining what was seen and whether it matches"
}}"""

    image_part = {"mime_type": "image/jpeg", "data": image_bytes}
    response = gemini_model.generate_content([image_part, classification_prompt])
    response_text = response.text.strip()

    # Strip markdown fences
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        response_text = "\n".join(lines).strip()
    if response_text.startswith("json"):
        response_text = response_text[4:].strip()

    return json.loads(response_text)


def gemini_full_verify(image_bytes: bytes, item_name: str, quantity: int,
                       task_title: str, task_location: str) -> dict:
    """
    FULL VERIFICATION CALL — second Gemini call, after item match is confirmed.
    Only called when item classification already passed.
    """
    full_prompt = f"""You are a disaster relief verification AI.

The submitted photo has already passed item identification: it shows "{item_name}".
Now evaluate the remaining evidence criteria:

Task: {task_title}
Expected Item: {quantity}x {item_name}
Location: {task_location}

Evaluate ONLY:
1. Is a human face/volunteer clearly visible in the frame?
2. Is a recipient, delivery point, or site context visible?
3. Is the approximate quantity ({quantity}) visually supported?
4. Does the scene look consistent with active disaster relief?
5. Are there signs the image is recycled or staged?

Return ONLY valid JSON:
{{
  "face_detected": true or false,
  "recipient_or_site_visible": true or false,
  "quantity_supported": true or false,
  "scene_consistent_with_relief": true or false,
  "image_appears_reused_or_staged": true or false,
  "confidence": 0.0 to 1.0,
  "notes": "one sentence summary"
}}"""

    image_part = {"mime_type": "image/jpeg", "data": image_bytes}
    response = gemini_model.generate_content([image_part, full_prompt])
    response_text = response.text.strip()

    if response_text.startswith("```"):
        lines = response_text.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        response_text = "\n".join(lines).strip()
    if response_text.startswith("json"):
        response_text = response_text[4:].strip()

    return json.loads(response_text)


def opencv_classify_item(image_bytes: bytes, item_name: str, quantity: int) -> dict:
    """
    Local OpenCV fallback — image sharpness + face detection only.
    Does NOT guess item identity from the task title.
    When Gemini is unavailable, item_match is conservatively set to uncertain/false.
    """
    try:
        import cv2
        import numpy as np

        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            return {
                "verdict": "uncertain",
                "confidence": 0.25,
                "face_detected": False,
                "items_visible": False,
                "item_match": False,
                "expected_item": item_name,
                "detected_items": ["unreadable image"],
                "quantity_supported": False,
                "task_completed": False,
                "recipient_or_site_visible": False,
                "notes": "Image is unreadable or corrupted. Cannot verify.",
            }

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        face_detected = len(faces) > 0

        variance = cv2.Laplacian(gray, cv2.CV_64F).var()
        brightness = float(np.mean(gray))

        if variance <= 15.0 or brightness <= 15.0:
            return {
                "verdict": "uncertain",
                "confidence": 0.35,
                "face_detected": face_detected,
                "items_visible": False,
                "item_match": False,
                "expected_item": item_name,
                "detected_items": ["blurry / dark - item unidentifiable"],
                "quantity_supported": False,
                "task_completed": False,
                "recipient_or_site_visible": False,
                "notes": f"Photo too blurry or dark to identify '{item_name}'. Cannot verify without Gemini API.",
            }

        return {
            "verdict": "uncertain",
            "confidence": 0.45,
            "face_detected": face_detected,
            "items_visible": True,
            "item_match": False,
            "expected_item": item_name,
            "detected_items": ["item unidentifiable without Gemini Vision API"],
            "quantity_supported": False,
            "task_completed": False,
            "recipient_or_site_visible": brightness > 25.0,
            "notes": (
                f"Gemini Vision API is not configured. Cannot identify whether the visible item matches '{item_name}'."
            ),
        }

    except Exception as e:
        return {
            "verdict": "uncertain",
            "confidence": 0.20,
            "face_detected": False,
            "items_visible": False,
            "item_match": False,
            "expected_item": item_name,
            "detected_items": ["cv2 error"],
            "quantity_supported": False,
            "task_completed": False,
            "recipient_or_site_visible": False,
            "notes": f"Local CV engine failed: {str(e)}. Cannot verify without Gemini API.",
        }


@router.post("/verify-proof")
async def verify_proof(req: VerifyRequest):
    """
    Two-phase Gemini verification pipeline with hard programmatic item match gate.
    """
    raw_photo = req.photo_base64 or req.image_base64
    if not raw_photo:
        raise HTTPException(status_code=400, detail="Missing photo_base64 or image_base64 in request body.")

    if "," in raw_photo:
        raw_photo = raw_photo.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(raw_photo)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 image data: {str(e)}")

    task_title = req.task_title or "Relief Delivery"
    item_name = (req.item_name or "relief supplies").strip()
    quantity = req.quantity or 1

    if req.task_location:
        task_location = req.task_location
    elif req.geolocation:
        lat = req.geolocation.get("lat", "unknown")
        lng = req.geolocation.get("lng", "unknown")
        task_location = f"Lat: {lat}, Lng: {lng}"
    else:
        task_location = "Field Location"

    # PRE-CALL LOG
    print(f"\n{'='*60}")
    print(f"[VERIFY-PROOF] New verification request")
    print(f"  EXPECTED ITEM : '{item_name}'")
    print(f"  EXPECTED QTY  : {quantity}")
    print(f"  TASK          : {task_title}")
    print(f"  GEMINI READY  : {gemini_model is not None}")
    print(f"{'='*60}")

    detected_items: List[str] = []
    item_match: bool = False
    item_confidence: float = 0.0
    item_reason: str = ""
    gemini_item_raw: Optional[dict] = None

    if gemini_model is not None:
        try:
            gemini_item_raw = gemini_classify_item(image_bytes, item_name)
            detected_items = gemini_item_raw.get("detected_items", [])
            if isinstance(detected_items, str):
                detected_items = [detected_items]
            gemini_item_match = bool(gemini_item_raw.get("match", False))
            item_confidence = float(gemini_item_raw.get("confidence", 0.0))
            item_reason = gemini_item_raw.get("reason", "")

            # PROGRAMMATIC OVERRIDE: cross-check Gemini's match with hard rules
            programmatic_match = programmatic_item_match(item_name, detected_items)

            # item_match is True ONLY if BOTH Gemini AND programmatic check agree
            item_match = gemini_item_match and programmatic_match

            print(f"\n[PHASE 1 - ITEM CLASSIFICATION]")
            print(f"  EXPECTED ITEM    : '{item_name}'")
            print(f"  DETECTED ITEMS   : {detected_items}")
            print(f"  GEMINI MATCH     : {gemini_item_match}")
            print(f"  PROGRAMMATIC     : {programmatic_match}")
            print(f"  FINAL ITEM MATCH : {item_match}")
            print(f"  ITEM CONFIDENCE  : {item_confidence}")
            print(f"  REASON           : {item_reason}")

        except Exception as e:
            print(f"[PHASE 1 ERROR] Gemini item classification failed: {e}")
            gemini_item_raw = None

    # If Gemini classification failed or is not available, use OpenCV
    if not gemini_item_raw:
        cv_result = opencv_classify_item(image_bytes, item_name, quantity)
        print(f"\n[PHASE 1 - LOCAL CV FALLBACK]")
        print(f"  EXPECTED ITEM  : '{item_name}'")
        print(f"  DETECTED ITEMS : {cv_result['detected_items']}")
        print(f"  ITEM MATCH     : {cv_result['item_match']}")
        print(f"  VERDICT        : {cv_result['verdict']}")

        final_verdict = cv_result["verdict"]
        notes = cv_result["notes"]
        _log_final(item_name, cv_result["detected_items"], cv_result["item_match"],
                   False, item_confidence, "N/A (local CV)", final_verdict)
        return _build_response(
            verdict=final_verdict,
            confidence=cv_result["confidence"],
            face_detected=cv_result["face_detected"],
            items_visible=cv_result["items_visible"],
            item_match=cv_result["item_match"],
            item_name=item_name,
            detected_items=cv_result["detected_items"],
            quantity_supported=cv_result["quantity_supported"],
            task_completed=cv_result["task_completed"],
            recipient_or_site_visible=cv_result["recipient_or_site_visible"],
            notes=notes,
            image_bytes=image_bytes,
            task_id=req.task_id,
            volunteer_id=req.volunteer_id,
        )

    # HARD GATE: item_match is the unbreakable criterion
    if not item_match:
        det_str = ", ".join(detected_items) if detected_items else "unidentified items"
        verdict = "rejected" if item_confidence >= 0.5 else "uncertain"
        notes = f"Verification failed: The submitted photo shows {det_str}, but this task requires {item_name}. {item_reason}"

        _log_final(item_name, detected_items, item_match, False, item_confidence,
                   "N/A (failed item gate)", verdict)
        return _build_response(
            verdict=verdict,
            confidence=item_confidence,
            face_detected=False,
            items_visible=bool(detected_items),
            item_match=False,
            item_name=item_name,
            detected_items=detected_items,
            quantity_supported=False,
            task_completed=False,
            recipient_or_site_visible=False,
            notes=notes,
            image_bytes=image_bytes,
            task_id=req.task_id,
            volunteer_id=req.volunteer_id,
        )

    # PHASE 2: FULL VERIFICATION (only reached if item_match == True)
    face_detected = False
    quantity_supported = False
    recipient_or_site_visible = False
    scene_consistent = True
    is_reused = False
    full_confidence = item_confidence
    notes = item_reason

    try:
        full_result = gemini_full_verify(image_bytes, item_name, quantity, task_title, task_location)
        face_detected = bool(full_result.get("face_detected", False))
        quantity_supported = bool(full_result.get("quantity_supported", False))
        recipient_or_site_visible = bool(full_result.get("recipient_or_site_visible", False))
        scene_consistent = bool(full_result.get("scene_consistent_with_relief", True))
        is_reused = bool(full_result.get("image_appears_reused_or_staged", False))
        full_confidence = float(full_result.get("confidence", item_confidence))
        notes = full_result.get("notes", item_reason)

        print(f"\n[PHASE 2 - FULL VERIFICATION]")
        print(f"  FACE DETECTED  : {face_detected}")
        print(f"  QTY SUPPORTED  : {quantity_supported}")
        print(f"  SITE VISIBLE   : {recipient_or_site_visible}")
        print(f"  SCENE OK       : {scene_consistent}")
        print(f"  REUSED IMAGE   : {is_reused}")
        print(f"  CONFIDENCE     : {full_confidence}")

    except Exception as e:
        print(f"[PHASE 2 ERROR] Full verification call failed: {e}. Applying conservative verdict.")
        notes = f"Item '{item_name}' was identified, but full evidence check could not complete: {str(e)}"
        _log_final(item_name, detected_items, item_match, False, item_confidence,
                   "N/A (phase 2 error)", "uncertain")
        return _build_response(
            verdict="uncertain",
            confidence=item_confidence,
            face_detected=False,
            items_visible=True,
            item_match=True,
            item_name=item_name,
            detected_items=detected_items,
            quantity_supported=False,
            task_completed=False,
            recipient_or_site_visible=False,
            notes=notes,
            image_bytes=image_bytes,
            task_id=req.task_id,
            volunteer_id=req.volunteer_id,
        )

    # FINAL VERDICT GATES
    if is_reused:
        verdict = "rejected"
        notes = f"Image appears recycled or staged. {notes}"
    elif not quantity_supported:
        verdict = "rejected"
        notes = f"Pledged quantity ({quantity}x {item_name}) is not visually supported in the photo. {notes}"
    elif not face_detected:
        verdict = "rejected"
        notes = f"No volunteer face detected in the frame. {notes}"
    elif full_confidence < 0.75:
        verdict = "uncertain"
    else:
        verdict = "verified"

    task_completed = verdict == "verified"

    _log_final(item_name, detected_items, item_match, face_detected, full_confidence,
               "Gemini", verdict)

    return _build_response(
        verdict=verdict,
        confidence=full_confidence,
        face_detected=face_detected,
        items_visible=True,
        item_match=True,
        item_name=item_name,
        detected_items=detected_items,
        quantity_supported=quantity_supported,
        task_completed=task_completed,
        recipient_or_site_visible=recipient_or_site_visible,
        notes=notes,
        image_bytes=image_bytes,
        task_id=req.task_id,
        volunteer_id=req.volunteer_id,
    )


def _log_final(expected_item, detected_items, item_match, face_detected,
               confidence, gemini_verdict_label, final_verdict):
    print(f"\n{'-'*60}")
    print(f"[VERIFICATION AUDIT LOG]")
    print(f"  EXPECTED ITEM  : '{expected_item}'")
    print(f"  DETECTED ITEMS : {detected_items}")
    print(f"  ITEM MATCH     : {item_match}")
    print(f"  FACE DETECTED  : {face_detected}")
    print(f"  CONFIDENCE     : {confidence}")
    print(f"  GEMINI VERDICT : {gemini_verdict_label}")
    print(f"  FINAL VERDICT  : {final_verdict}")
    print(f"{'-'*60}\n")


def _build_response(*, verdict, confidence, face_detected, items_visible,
                    item_match, item_name, detected_items, quantity_supported,
                    task_completed, recipient_or_site_visible, notes,
                    image_bytes, task_id, volunteer_id):
    """Build the standard API response and update Supabase task status."""
    status_str = verdict

    if supabase and task_id:
        try:
            supabase.table("tasks").update({"status": status_str}).eq("id", task_id).execute()
        except Exception as db_err:
            print(f"[Supabase update] {db_err}")

    mock_cid = "bafybeig" + hashlib.sha256(image_bytes[:256]).hexdigest()[:48]
    ipfs_hash = f"ipfs://{mock_cid}"
    tx_hash_raw = hashlib.sha256(f"{task_id}{volunteer_id}{time.time()}".encode()).hexdigest()
    polygon_tx_hash = f"0x{tx_hash_raw}"

    return {
        "verdict": verdict,
        "confidence": confidence,
        "confidence_percent": int(confidence * 100),
        "face_detected": face_detected,
        "items_visible": items_visible,
        "item_match": item_match,
        "expected_item": item_name,
        "detected_items": detected_items,
        "quantity_supported": quantity_supported,
        "task_completed": task_completed,
        "recipient_or_site_visible": recipient_or_site_visible,
        "ai_notes": notes,
        "notes": notes,
        "ipfs_hash": ipfs_hash,
        "polygon_tx_hash": polygon_tx_hash,
    }

import io
import json
import base64
from PIL import Image
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def get_test_image_base64():
    img = Image.new("RGB", (100, 100), color=(200, 100, 50))
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")

def test_verify_hard_gate():
    print("\n--- RUNNING STEP 7 END-TO-END TEST ON /verify-proof ---")

    img_b64 = get_test_image_base64()

    payload = {
        "image_base64": img_b64,
        "task_title": "Deliver 20 Clothes Garments",
        "item_name": "clothes",
        "quantity": 20,
        "task_location": "Wayanad, Ward 5",
        "volunteer_id": "vol-123",
        "task_id": "task-456"
    }

    response = client.post("/verify-proof", json=payload)
    print(f"Status Code: {response.status_code}")
    data = response.json()
    print("\nResponse Payload:")
    print(json.dumps(data, indent=2))

    print("\n--- VERIFYING HARD GATE ASSERTIONS ---")
    print(f"EXPECTED ITEM : '{data.get('expected_item')}'")
    print(f"DETECTED ITEMS: {data.get('detected_items')}")
    print(f"ITEM MATCH    : {data.get('item_match')}")
    print(f"FINAL VERDICT : {data.get('verdict')}")
    print(f"NOTES         : {data.get('notes')}")

    assert data.get("expected_item") == "clothes"
    assert data.get("item_match") is False
    assert data.get("verdict") in ["rejected", "uncertain"]
    assert data.get("verdict") != "verified"
    assert data.get("task_completed") is False
    print("\n[SUCCESS] PASS: Item match hard gate enforced successfully! Mismatched/unclear item was NOT approved.")

if __name__ == "__main__":
    test_verify_hard_gate()

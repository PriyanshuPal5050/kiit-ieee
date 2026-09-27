import urllib.request
import urllib.error
import json
import os
import sys

BASE_URL = "http://localhost:3000"

def log_test(name, passed, detail=""):
    mark = "PASS" if passed else "FAIL"
    print(f"[{mark}] {name}" + (f" -> {detail}" if detail else ""))
    if not passed:
        sys.exit(1)

def request_json(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content)
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            return e.code, json.loads(content)
        except Exception:
            return e.code, {"raw": content}

print("=================================================================")
print("=== RUNNING KIIT IEEE COMPLETE E2E AUDIT & VERIFICATION SUITE ===")
print("=================================================================\n")

# 1. Test Server Root & Health
status, res = request_json("/api/events")
log_test("GET /api/events - Database Reachability", status == 200 and res.get("success") is True, f"Found {len(res.get('events', []))} events")

# 2. Test AI Event Helper Natural Language Commands
helper_payload_1 = {
    "instruction": "Change speaker name to Priyanshu Pal, update venue to Campus 6, and change timing to 2 PM to 5 PM",
    "event": {
        "title": "AI & Edge Computer Vision Masterclass",
        "campus": "Campus 15",
        "speakers": [{"name": "Dr. Priyadarshi Sen", "designation": "AI Lead"}]
    }
}
status, res = request_json("/api/ai/event-helper", method="POST", data=helper_payload_1)
log_test("POST /api/ai/event-helper - Complex Natural Language Instruction", status == 200 and res.get("success") is True)
diff = res.get("data", {}).get("diff", {})
log_test("AI Event Helper - Speaker Name Mutation", "speakerName" in diff and "Priyanshu Pal" in str(diff["speakerName"]), f"Speaker: {diff.get('speakerName')}")
log_test("AI Event Helper - Campus/Venue Mutation", "campus" in diff and "Campus 6" in str(diff["campus"]), f"Campus: {diff.get('campus')}")
log_test("AI Event Helper - Time Mutation", "startTime" in diff and ("14:00" in str(diff["startTime"]) or "2" in str(diff["startTime"])), f"Times: {diff.get('startTime')} to {diff.get('endTime')}")

# 3. Test AI Content Generator Endpoint
gen_payload = {
    "eventName": "Autonomous Edge Robotics & Perception Workshop",
    "eventType": "Workshop",
    "category": "Robotics & IoT",
    "campus": "Campus 12",
    "building": "School of Electronics Engineering (ETC/ECE)",
    "room": "Robotics & Embedded Lab",
    "startDate": "2026-11-15",
    "endDate": "2026-11-16",
    "startTime": "09:30",
    "endTime": "17:00",
    "speakerName": "Dr. Priyadarshi Sen",
    "speakerDesignation": "Lead Robotics Scientist",
    "speakerOrg": "NeuralTech Research",
    "eligibility": "Open to 2nd, 3rd, and 4th year B.Tech students",
    "contactPerson": "Aryan Mohapatra",
    "contactPhone": "+91 674 2725113",
    "seats": 100,
    "fee": "Free (IEEE Sponsored)",
    "customPrompt": "Target 3rd year engineering students with real-world sensor fusion and ROS 2."
}
status, res = request_json("/api/ai/generate-event", method="POST", data=gen_payload)
log_test("POST /api/ai/generate-event - AI Content Synthesis", status == 200 and res.get("success") is True)
ai_data = res.get("data", {})
log_test("AI Content - Generated Title Integrity", bool(ai_data.get("title")), f"Title: {ai_data.get('title')}")
log_test("AI Content - Generated Short Description", bool(ai_data.get("shortDescription")), f"Desc: {ai_data.get('shortDescription')[:60]}...")
log_test("AI Content - Generated Syllabus Learn/Build", bool(ai_data.get("whatWillLearn")) and bool(ai_data.get("whatWillBuild")))
log_test("AI Content - Generated WhatsApp Announcement", "whatsappAnnouncement" in ai_data and len(ai_data["whatsappAnnouncement"]) > 50)

# 4. Test Event Publishing Flow (Publish -> Database -> Event ID -> Slug)
test_publish_id = f"evt-e2e-audit-{os.getpid()}"
publish_payload = {
    "id": test_publish_id,
    "title": "Quantum Computing & Quantum Algorithms Masterclass",
    "tagline": "Quantum annealing, Qiskit circuits, and cryptographic algorithms on quantum hardware.",
    "category": "AI & Machine Learning",
    "format": "Offline",
    "eventType": "Masterclass",
    "difficulty": "Advanced",
    "price": 0,
    "priceLabel": "Free (IEEE Sponsored)",
    "date": "24 Oct 2026",
    "startDate": "2026-10-24",
    "endDate": "2026-10-24",
    "time": "10:00 AM – 04:30 PM",
    "startTime": "10:00",
    "endTime": "16:30",
    "reportingTime": "09:00 AM",
    "venue": "Campus 15, Tech Lab 4 (AI/ML Lab), Campus 15",
    "campus": "Campus 15",
    "building": "School of Computer Engineering",
    "room": "Tech Lab 4 (AI/ML Lab)",
    "address": "Campus 15, KIIT Deemed to be University, Patia, Bhubaneswar, Odisha 751024",
    "bannerGradient": "from-purple-600 via-indigo-600 to-cyan-600",
    "speaker": {
        "name": "Dr. Priyadarshi Sen",
        "role": "Principal Quantum Researcher",
        "org": "KIIT University & IEEE",
        "bio": "Specialist in quantum information systems and NISQ device simulation."
    },
    "seatsTotal": 90,
    "seatsFilled": 0,
    "eligibility": "Open to all KIIT B.Tech students",
    "prerequisites": ["Linear algebra", "Python programming"],
    "whatYouWillBuild": ["5-qubit Bell State circuit", "Grover Search implementation"],
    "whatWillLearn": "Superposition, entanglement, quantum gates, and Qiskit simulator deployment.",
    "whatToBring": "Personal laptop with Python 3.11 installed."
}

status, res = request_json("/api/events/publish", method="POST", data=publish_payload)
log_test("POST /api/events/publish - Create Event in Database", status == 200 and res.get("success") is True)
published_event = res.get("event", {})
returned_id = published_event.get("id")
returned_slug = published_event.get("slug")
returned_status = published_event.get("status")

log_test("Publish Flow - Preserved Unique Event ID", bool(returned_id), f"ID: {returned_id}")
log_test("Publish Flow - Generated Event Slug", bool(returned_slug), f"Slug: {returned_slug}")
log_test("Publish Flow - Strict 'PUBLISHED' Status", returned_status == "PUBLISHED", f"Status: {returned_status}")

# 5. Test Retrieval by Real Database ID
status, res = request_json(f"/api/events/{returned_id}")
log_test(f"GET /api/events/{returned_id} - Lookup by Event ID", status == 200 and res.get("success") is True)
fetched_evt = res.get("event", {})
log_test("Data Synchronization - Title Verification", fetched_evt.get("title") == publish_payload["title"])
log_test("Data Synchronization - Speaker Verification", fetched_evt.get("speaker", {}).get("name") == "Dr. Priyadarshi Sen")
log_test("Data Synchronization - Venue Coordinates", fetched_evt.get("campus") == "Campus 15")

# 6. Test Retrieval by Real Database Slug
status, res = request_json(f"/api/events/{returned_slug}")
log_test(f"GET /api/events/{returned_slug} - Lookup by Event Slug", status == 200 and res.get("success") is True)
slug_evt = res.get("event", {})
log_test("Slug Routing - Identical Event Data Match", slug_evt.get("id") == returned_id)

# 7. Test 404 Error Handling for Non-Existent Event
status, res = request_json("/api/events/non-existent-event-slug-xyz-999")
log_test("GET /api/events/non-existent-id - 404 Not Found Handling", status == 404 and res.get("success") is False, f"HTTP {status}: {res.get('error')}")

# 8. Test Physical Disk Persistence in data/events.json
events_file = os.path.join(os.getcwd(), "data", "events.json")
log_test("Physical Disk Persistence - File Exists", os.path.isfile(events_file), events_file)
with open(events_file, "r", encoding="utf-8") as f:
    disk_events = json.load(f)

disk_match = next((e for e in disk_events if e.get("id") == returned_id), None)
log_test("Physical Disk Persistence - Event Found in data/events.json", disk_match is not None, f"Found record '{disk_match.get('title') if disk_match else 'None'}'")
log_test("Physical Disk Persistence - Status on Disk is PUBLISHED", disk_match.get("status") == "PUBLISHED")

# 9. Test Browser Refresh Simulation (Full Reload from DB)
status, res = request_json("/api/events")
all_events = res.get("events", [])
refresh_match = next((e for e in all_events if e.get("id") == returned_id), None)
log_test("Browser Refresh Simulation - GET /api/events Retains Published Event", refresh_match is not None)

# 10. Data Integrity - Verify All Payload Fields Preserved
log_test("Data Integrity - Category Preserved", refresh_match.get("category") == publish_payload["category"])
log_test("Data Integrity - Seats Total Preserved", refresh_match.get("seatsTotal") == publish_payload["seatsTotal"])
log_test("Data Integrity - Prerequisites Preserved", refresh_match.get("prerequisites") == publish_payload["prerequisites"])
log_test("Data Integrity - What You Will Build Preserved", refresh_match.get("whatYouWillBuild") == publish_payload["whatYouWillBuild"])

# 11. Slug Routing Equivalence
status_id, res_id = request_json(f"/api/events/{returned_id}")
status_slug, res_slug = request_json(f"/api/events/{returned_slug}")
log_test("Slug Routing Equivalence - HTTP Status Match", status_id == 200 and status_slug == 200)
log_test("Slug Routing Equivalence - Object Equality", res_id.get("event") == res_slug.get("event"))

print("\n=================================================================")
print("=== ALL 23 API, DATABASE, AND PERSISTENCE AUDIT TESTS PASSED! ===")
print("=================================================================")

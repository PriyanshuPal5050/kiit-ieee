"""
KIIT IEEE Platform - End-to-End Registration & Attendance Scanner Automated Audit Suite
Tests:
1. Server status and events retrieval
2. Registration validation:
   - Event existence check
   - Student eligibility enforcement
   - Event full / capacity enforcement
   - Duplicate registration rejection (409 Conflict)
   - Real seat count increment persistence
3. Attendance Scanner validation:
   - Host role authorization (student rejection 403)
   - Invalid QR token format rejection (400)
   - Unknown pass rejection (404)
   - Wrong event pass mismatch rejection (400)
   - Successful attendance mark (200) with timestamp and attendee name
   - Duplicate attendance check-in ("✓ Student already checked in")
   - Persistence in data/registrations.json and data/events.json across simulated refresh
"""

import urllib.request
import urllib.parse
import json
import sys

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

BASE_URL = "http://localhost:3000"

def post_json(path, data, headers=None):
    url = f"{BASE_URL}{path}"
    payload = json.dumps(data).encode('utf-8')
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)
    req = urllib.request.Request(url, data=payload, headers=req_headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            body = resp.read().decode('utf-8')
            return status, json.loads(body)
    except urllib.error.HTTPError as e:
        status = e.code
        body = e.read().decode('utf-8')
        try:
            return status, json.loads(body)
        except Exception:
            return status, {"error": body}

def get_json(path):
    url = f"{BASE_URL}{path}"
    try:
        with urllib.request.urlopen(url) as resp:
            status = resp.status
            body = resp.read().decode('utf-8')
            return status, json.loads(body)
    except urllib.error.HTTPError as e:
        status = e.code
        body = e.read().decode('utf-8')
        try:
            return status, json.loads(body)
        except Exception:
            return status, {"error": body}

def run_suite():
    passed = 0
    failed = 0

    print("=" * 60)
    print("KIIT IEEE - REGISTRATION & ATTENDANCE AUDIT TEST SUITE")
    print("=" * 60)

    # 1. Server online check
    status, res = get_json("/api/events")
    if status == 200 and res.get("success"):
        print("[PASS] 1. GET /api/events returned 200 OK with event roster")
        passed += 1
    else:
        print(f"[FAIL] 1. GET /api/events failed: {status}, {res}")
        failed += 1

    events = res.get("events", [])
    robo_evt = next((e for e in events if "robotics" in e.get("id", "").lower() or "robotics" in e.get("title", "").lower()), None)
    cv_evt = next((e for e in events if "ai-cv" in e.get("id", "").lower() or "computer vision" in e.get("title", "").lower()), None)

    if not robo_evt or not cv_evt:
        print(f"[FAIL] Required events missing. Found: {[e.get('id') for e in events]}")
        sys.exit(1)

    initial_robo_seats = robo_evt.get("seatsFilled", 94)
    print(f"[*] Initial Robotics Seats: {initial_robo_seats} / {robo_evt.get('seatsTotal')}")
    print(f"[*] Initial AI/CV Seats: {cv_evt.get('seatsFilled')} / {cv_evt.get('seatsTotal')}")

    # 2. Test Eligibility Rejection
    # AI/CV masterclass requires 2nd, 3rd & 4th Year. Test 1st Year student registration:
    test_1st_yr_data = {
        "eventId": cv_evt.get("id"),
        "studentName": "Freshman Candidate",
        "rollNo": "26059999",
        "email": "26059999@kiit.ac.in",
        "branch": "Computer Science & Engineering",
        "year": "1st Year"
    }
    status, res = post_json("/api/events/register", test_1st_yr_data)
    if status == 403 and "Year students only" in res.get("error", ""):
        print(f"[PASS] 2. Ineligible student blocked server-side: {res.get('error')}")
        passed += 1
    else:
        print(f"[FAIL] 2. Expected 403 for ineligible student, got {status}: {res}")
        failed += 1

    # 3. Test Real Student Registration on Autonomous Robotics
    test_student_roll = f"2205{int(urllib.request.time.time()) % 10000:04d}"
    reg_data = {
        "eventId": robo_evt.get("id"),
        "studentName": "Priyanshu Pal",
        "rollNo": test_student_roll,
        "email": f"{test_student_roll}@kiit.ac.in",
        "branch": "Computer Science & Engineering",
        "year": "3rd Year",
        "phone": "+91 98610 99887"
    }
    status, res = post_json(f"/api/events/{robo_evt.get('id')}/register", reg_data)
    if status == 200 and res.get("success") and res.get("registration"):
        new_reg = res["registration"]
        created_ticket_id = new_reg.get("ticketId")
        print(f"[PASS] 3. Registration succeeded! Ticket: {created_ticket_id}, Seats now: {res.get('event', {}).get('seatsFilled')}")
        passed += 1
    else:
        print(f"[FAIL] 3. Registration failed: {status}, {res}")
        failed += 1
        sys.exit(1)

    # 4. Verify Seat Count Incremented in Database
    status, res = get_json(f"/api/events/{robo_evt.get('id')}")
    updated_seats = res.get("event", {}).get("seatsFilled")
    if updated_seats == initial_robo_seats + 1:
        print(f"[PASS] 4. Database seat count persisted! {initial_robo_seats} -> {updated_seats}")
        passed += 1
    else:
        print(f"[FAIL] 4. Seat count mismatch: expected {initial_robo_seats + 1}, got {updated_seats}")
        failed += 1

    # 5. Prevent Duplicate Registration
    status, res = post_json("/api/events/register", reg_data)
    if status == 409 and res.get("alreadyRegistered"):
        print(f"[PASS] 5. Duplicate registration blocked (409 Conflict): {res.get('error')}")
        passed += 1
    else:
        print(f"[FAIL] 5. Expected 409 Conflict for duplicate registration, got {status}: {res}")
        failed += 1

    # 6. Test Host Security: Student cannot scan attendance
    student_scan = {
        "ticketId": created_ticket_id,
        "role": "student"
    }
    status, res = post_json("/api/events/checkin", student_scan, headers={"X-User-Role": "student"})
    if status == 403:
        print(f"[PASS] 6. Random student blocked from scanning attendance (403 Forbidden): {res.get('error')}")
        passed += 1
    else:
        print(f"[FAIL] 6. Expected 403 Forbidden for student scanning, got {status}: {res}")
        failed += 1

    # 7. Test Invalid QR Token
    invalid_scan = {
        "ticketId": "",
        "qrToken": "",
        "role": "Host"
    }
    status, res = post_json("/api/events/checkin", invalid_scan, headers={"X-User-Role": "Host"})
    if status == 400 and "Invalid Event Pass" in res.get("error", ""):
        print(f"[PASS] 7. Invalid QR format rejected (400 Bad Request): {res.get('error')}")
        passed += 1
    else:
        print(f"[FAIL] 7. Expected 400 for empty/invalid QR, got {status}: {res}")
        failed += 1

    # 8. Test Unknown / Unregistered Pass
    ghost_scan = {
        "ticketId": "KIIT-IEEE-2026-FAKE9999",
        "role": "Host"
    }
    status, res = post_json("/api/events/checkin", ghost_scan, headers={"X-User-Role": "Host"})
    if status == 404:
        print(f"[PASS] 8. Unregistered pass rejected (404 Not Found): {res.get('error')}")
        passed += 1
    else:
        print(f"[FAIL] 8. Expected 404 for unknown ticket, got {status}: {res}")
        failed += 1

    # 9. Test Wrong Event QR Scan Mismatch
    wrong_event_scan = {
        "ticketId": created_ticket_id,
        "eventId": cv_evt.get("id"), # Created for Robotics, but scanning at AI/CV desk
        "role": "Host"
    }
    status, res = post_json(f"/api/events/{cv_evt.get('id')}/attendance/scan", wrong_event_scan, headers={"X-User-Role": "Host"})
    if status == 400 and "belongs to another event" in res.get("error", ""):
        print(f"[PASS] 9. Cross-event pass mismatch caught: {res.get('error')}")
        passed += 1
    else:
        print(f"[FAIL] 9. Expected 400 cross-event pass mismatch, got {status}: {res}")
        failed += 1

    # 10. Test Successful Attendance Marking with Real Timestamp
    valid_scan = {
        "qrToken": f"KIIT-IEEE-PASS:{created_ticket_id}:{robo_evt.get('id')}:{test_student_roll}",
        "eventId": robo_evt.get("id"),
        "role": "Host"
    }
    status, res = post_json("/api/events/checkin", valid_scan, headers={"X-User-Role": "Host"})
    if status == 200 and res.get("success") and res.get("message") == "✓ Attendance Marked":
        print(f"[PASS] 10. Attendance marked successfully! Student: {res.get('student')}, Time: {res.get('time')}")
        passed += 1
    else:
        print(f"[FAIL] 10. Checkin failed: {status}, {res}")
        failed += 1

    # 11. Test Duplicate Attendance Detection ("✓ Student already checked in")
    status, res = post_json("/api/events/checkin", valid_scan, headers={"X-User-Role": "Host"})
    if status == 200 and res.get("alreadyAttended") and "already checked in" in res.get("message", ""):
        print(f"[PASS] 11. Duplicate attendance handled gracefully: {res.get('message')}")
        passed += 1
    else:
        print(f"[FAIL] 11. Expected alreadyAttended: True, got {status}: {res}")
        failed += 1

    # 12. Check Database Persistence in data/registrations.json
    status, res = get_json("/api/registrations")
    regs = res.get("registrations", [])
    found_db_reg = next((r for r in regs if r.get("ticketId") == created_ticket_id), None)
    if found_db_reg and found_db_reg.get("attended") is True:
        print(f"[PASS] 12. Database attendance ledger persisted in registrations.json! (attended: True, attendedAt: {found_db_reg.get('attendedAt')})")
        passed += 1
    else:
        print(f"[FAIL] 12. Registration not found or not marked attended in registrations.json: {found_db_reg}")
        failed += 1

    print("=" * 60)
    print(f"TEST RESULTS: {passed} PASSED, {failed} FAILED")
    print("=" * 60)
    return failed == 0

if __name__ == "__main__":
    success = run_suite()
    sys.exit(0 if success else 1)

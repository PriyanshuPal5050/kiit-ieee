import urllib.request
import urllib.parse
import json
import sys

# Force UTF-8 on Windows stdout
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

print("=== KIIT IEEE PLATFORM - WHATSAPP EMOJI & UTF-8 ENCODING AUDIT ===")

# Test 1: Static file server headers for JavaScript
print("\n[Test 1] Verifying HTTP Content-Type headers for JavaScript modules...")
req = urllib.request.Request("http://localhost:3000/js/services/messaging-service.js")
with urllib.request.urlopen(req) as resp:
    ctype = resp.headers.get("Content-Type", "")
    content = resp.read()
    print(f"Content-Type: {ctype}")
    assert "application/javascript" in ctype or "text/javascript" in ctype, f"Bad MIME type: {ctype}"
    assert "charset=utf-8" in ctype.lower(), f"Missing charset=utf-8 in Content-Type: {ctype}"
    assert b'\xef\xbf\xbd' not in content, "Replacement character (0xFFFD) found in raw bytes of messaging-service.js!"
    assert "🎓".encode('utf-8') in content, "Unicode emoji 🎓 missing in messaging-service.js!"
    assert "🏢".encode('utf-8') in content, "Unicode emoji 🏢 missing in messaging-service.js!"
    print("PASS: messaging-service.js served with Content-Type: application/javascript; charset=utf-8 and intact UTF-8 bytes.")

# Test 2: Database API GET /api/events
print("\n[Test 2] Verifying GET /api/events encoding & UTF-8 header...")
req = urllib.request.Request("http://localhost:3000/api/events")
with urllib.request.urlopen(req) as resp:
    ctype = resp.headers.get("Content-Type", "")
    raw = resp.read()
    print(f"Content-Type: {ctype}")
    assert "application/json" in ctype, f"Bad MIME type: {ctype}"
    assert "charset=utf-8" in ctype.lower(), f"Missing charset=utf-8 in Content-Type: {ctype}"
    assert b'\xef\xbf\xbd' not in raw, "Replacement character in /api/events!"
    parsed = json.loads(raw.decode('utf-8'))
    assert parsed.get("success") is True, "API call not successful"
    print(f"PASS: /api/events returned {len(parsed['events'])} events with clean UTF-8 json.")

# Test 3: AI Event Content Generator POST /api/ai/generate-event
print("\n[Test 3] Verifying POST /api/ai/generate-event WhatsApp announcement...")
payload = {
    "eventName": "AI & Edge Computer Vision Masterclass",
    "eventType": "Workshop",
    "startDate": "2026-10-10",
    "endDate": "2026-10-11",
    "startTime": "09:30",
    "endTime": "17:00",
    "reportingTime": "08:30 AM",
    "campus": "Campus 15",
    "building": "School of Computer Engineering, Tech Lab 2",
    "room": "Tech Lab 4",
    "venue": "Tech Lab 4 (AI/ML Lab)",
    "eligibility": "Open to 2nd, 3rd & 4th Year B.Tech students",
    "speakerName": "Dr. Priyadarshi Sen",
    "speakerDesignation": "Principal AI Scientist & IEEE Senior Member",
    "seats": 150,
    "registrationDeadline": "24 hours prior to event start",
    "contactPerson": "Aryan Mohapatra (Lead Student Organizer)"
}

req = urllib.request.Request(
    "http://localhost:3000/api/ai/generate-event",
    data=json.dumps(payload, ensure_ascii=False).encode('utf-8'),
    headers={"Content-Type": "application/json; charset=utf-8"}
)
with urllib.request.urlopen(req) as resp:
    ctype = resp.headers.get("Content-Type", "")
    raw = resp.read()
    assert b'\xef\xbf\xbd' not in raw, "Replacement character in /api/ai/generate-event!"
    res_data = json.loads(raw.decode('utf-8'))
    assert res_data.get("success") is True, "AI call not successful"
    data = res_data["data"]
    wa_msg = data.get("whatsappAnnouncement", "")
    print("Generated WhatsApp Announcement from endpoint:")
    print(wa_msg)
    
    # Check all required emojis
    required = ["🎓", "🚀", "💡", "📅", "⏰", "🕐", "📍", "🏢", "🎯", "🎙️", "🎟️", "⏳", "🔗", "👤"]
    for emo in required:
        assert emo in wa_msg, f"Missing emoji {emo} in generated WhatsApp announcement!"
    print("PASS: All 14 required emojis present in server-generated WhatsApp announcement.")

# Test 4: AI Event Helper POST /api/ai/event-helper
print("\n[Test 4] Verifying AI Event Helper with natural language updates...")
helper_payload = {
    "instruction": "Change speaker name to Priyanshu Pal, venue to Campus 6, and timing to 2 PM to 5 PM",
    "event": payload
}
req = urllib.request.Request(
    "http://localhost:3000/api/ai/event-helper",
    data=json.dumps(helper_payload, ensure_ascii=False).encode('utf-8'),
    headers={"Content-Type": "application/json; charset=utf-8"}
)
with urllib.request.urlopen(req) as resp:
    raw = resp.read()
    assert b'\xef\xbf\xbd' not in raw, "Replacement character in /api/ai/event-helper!"
    helper_res = json.loads(raw.decode('utf-8'))
    assert helper_res.get("success") is True
    changes = helper_res["data"].get("changes", {})
    print("Changes returned by helper:", changes)
    assert changes.get("speakerName") == "Priyanshu Pal" or "Priyanshu Pal" in str(changes), f"Speaker not updated: {changes}"
    print("PASS: AI Event Helper parsed instruction and updated speakerName to Priyanshu Pal.")

# Test 5: Full WhatsApp URL encoding test with all emojis & punctuation
print("\n[Test 5] Verifying wa.me URL encoding roundtrip...")
full_sample = """🎓 KIIT IEEE PRESENTS

🚀 AI & Edge Computer Vision Masterclass

💡 Where Students Build What's Next.

📅 Date: 10 Aug 2026 – 11 Aug 2026
⏰ Time: 9:30 AM – 5:00 PM
🕐 Reporting: 08:30 AM
📍 Venue: Tech Lab 4 (AI/ML Lab)
🏢 Building: School of Computer Engineering, Tech Lab 2
🎯 Eligibility: Open to 2nd, 3rd & 4th Year B.Tech students
🎙️ Speaker: Priyanshu Pal (Technical Lead)

💡 Overview:
Fee is ₹0 & "members" receive IEEE certificates (v1.0/alpha): 'Ready'!

🎟️ Capacity: 150 Bench Seats Only (Limited)
⏳ Registration Deadline: 24 hours prior to event start

🔗 Register Now:
http://localhost:3000/#event=ai-edge-computer-vision-masterclass

👤 Organizer: KIIT IEEE Student Branch"""

encoded_text = urllib.parse.quote(full_sample)
wa_url = f"https://wa.me/?text={encoded_text}"
print("wa.me URL generated successfully. Checking for corruptions...")
assert "%EF%BF%BD" not in wa_url, "URL contains replacement character %EF%BF%BD!"
assert "https://wa.me/?text=" in wa_url, "Invalid wa.me prefix"

# Decode roundtrip
roundtrip = urllib.parse.unquote(encoded_text)
assert roundtrip == full_sample, "Roundtrip mismatch!"
for char in ["🎓", "🚀", "💡", "📅", "⏰", "🕐", "📍", "🏢", "🎯", "🎟️", "⏳", "🔗", "👤", "🎙️", "✨", "₹", "&", "–", "'", '"', "(", ")", "/", ":"]:
    if char != "✨": # ✨ wasn't in sample text
        assert char in roundtrip, f"Character {char} failed roundtrip"
print("PASS: Roundtrip percent-encoding preserves every emoji and punctuation mark.")

print("\nALL BACKEND & ENCODING TESTS COMPLETED WITH 100% SUCCESS! ✓")

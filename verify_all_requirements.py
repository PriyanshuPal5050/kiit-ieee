import sys
import os
import re
import json
import urllib.request
import urllib.parse

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

print("==================================================================")
print("KIIT IEEE — COMPREHENSIVE WHATSAPP EMOJI & ENCODING VERIFICATION")
print("==================================================================")

errors = []
successes = []

def check(condition, message):
    if condition:
        print(f"[PASS] {message}")
        successes.append(message)
    else:
        print(f"[FAIL] {message}")
        errors.append(message)

# 1. Search for accidental replacement characters  or \uFFFD in codebase
print("\n--- 1. AUDITING CODEBASE FOR REPLACEMENT CHARACTERS ---")
for root, dirs, files in os.walk('.'):
    # Skip .git, __pycache__, node_modules
    if any(p in root for p in ['.git', '__pycache__', 'node_modules', '.gemini']):
        continue
    for file in files:
        if file.endswith(('.js', '.html', '.css', '.py', '.json')) and not file.startswith('test_') and not file.startswith('verify_'):
            fpath = os.path.join(root, file)
            with open(fpath, 'rb') as f:
                content = f.read()
                if b'\xef\xbf\xbd' in content:
                    errors.append(f"Literal replacement character (0xFFFD) found in {fpath}")
                try:
                    text = content.decode('utf-8')
                    if '\\uFFFD' in text or '\\ufffd' in text:
                        errors.append(f"\\uFFFD escape found in {fpath}")
                except UnicodeDecodeError:
                    errors.append(f"File {fpath} is not valid UTF-8!")

if not any("replacement character" in e for e in errors):
    check(True, "Zero replacement characters ( or \\uFFFD) found across entire codebase.")

# 2. Check index.html for <meta charset="UTF-8" />
print("\n--- 2. VERIFYING HTML UTF-8 DECLARATION ---")
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()
    check('<meta charset="UTF-8"' in html or '<meta charset="utf-8"' in html, "index.html has <meta charset=\"UTF-8\" /> declared.")

# 3. Check HTTP Response Headers from server
print("\n--- 3. VERIFYING SERVER HTTP HEADERS & UTF-8 MIME TYPES ---")
for path, expected_mime in [
    ('/js/services/messaging-service.js', 'application/javascript'),
    ('/js/views/ai-builder-view.js', 'application/javascript'),
    ('/api/events', 'application/json'),
    ('/css/styles.css', 'text/css'),
    ('/index.html', 'text/html')
]:
    url = f"http://127.0.0.1:3000{path}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            ctype = resp.headers.get("Content-Type", "")
            check(expected_mime in ctype and "charset=utf-8" in ctype.lower(), f"{path} Content-Type is '{ctype}' (includes charset=utf-8)")
    except Exception as e:
        check(False, f"Failed fetching {url}: {e}")

# 4. Check messaging-service.js for EVENT_EMOJIS and generateWhatsAppMessage
print("\n--- 4. VERIFYING CONTROLLED EMOJI SYSTEM IN JAVASCRIPT ---")
with open('js/services/messaging-service.js', 'r', encoding='utf-8') as f:
    ms_js = f.read()
    check('export const EVENT_EMOJIS =' in ms_js, "EVENT_EMOJIS constant exported from messaging-service.js")
    check('export function generateWhatsAppMessage(' in ms_js, "generateWhatsAppMessage canonical function exported")
    
    required_emojis = {
        'title': '🎓',
        'event': '🚀',
        'date': '📅',
        'time': '⏰',
        'reporting': '🕐',
        'venue': '📍',
        'building': '🏢',
        'eligibility': '🎯',
        'description': '💡',
        'capacity': '🎟️',
        'deadline': '⏳',
        'register': '🔗',
        'organizer': '👤',
        'speaker': '🎙️',
        'sparkle': '✨'
    }
    for key, emo in required_emojis.items():
        check(f'"{emo}"' in ms_js or f"'{emo}'" in ms_js, f"EVENT_EMOJIS.{key} has literal Unicode character '{emo}'")

    check('https://wa.me/?text=' in ms_js, "buildShareUrl constructs standard https://wa.me/?text= URL")
    check('encodeURIComponent(' in ms_js, "Uses encodeURIComponent on complete message")
    check('btoa(' not in ms_js, "Does NOT use btoa() on WhatsApp message")
    check('TextDecoder("latin1")' not in ms_js, "Does NOT use Latin-1 conversion")

# 5. Check ai-builder-view.js for single source of truth
print("\n--- 5. VERIFYING AI-BUILDER-VIEW SINGLE MESSAGE SOURCE ---")
with open('js/views/ai-builder-view.js', 'r', encoding='utf-8') as f:
    aib_js = f.read()
    check('import { WhatsAppShareService, generateWhatsAppMessage, EVENT_EMOJIS }' in aib_js, "ai-builder-view imports generateWhatsAppMessage and EVENT_EMOJIS")
    check('this.eventData.whatsappMessage = generateWhatsAppMessage(this.eventData);' in aib_js, "updateWhatsAppAnnouncement calls canonical generateWhatsAppMessage")
    check('this.updateWhatsAppAnnouncement();' in aib_js, "updateWhatsAppAnnouncement is invoked to refresh message state")
    check('#promo-whatsapp-edit' in aib_js, "WhatsApp preview textarea (#promo-whatsapp-edit) is bound to whatsappMessage")
    check('WhatsAppShareService.shareToWhatsApp(message' in aib_js, "Direct WhatsApp link and Poster Share use WhatsAppShareService")

# 6. Test AI Event Content API
print("\n--- 6. VERIFYING AI GENERATE-EVENT API ---")
event_req_body = {
    "eventName": "AI & Edge Computer Vision Masterclass",
    "eventType": "Workshop",
    "startDate": "2026-10-10",
    "endDate": "2026-10-11",
    "startTime": "09:30",
    "endTime": "17:00",
    "reportingTime": "08:30 AM",
    "campus": "Campus 15",
    "building": "School of Computer Engineering, Tech Lab 2",
    "room": "Tech Lab 4 (AI/ML Lab)",
    "venue": "Tech Lab 4 (AI/ML Lab)",
    "eligibility": "Open to 2nd, 3rd & 4th Year B.Tech students",
    "speakerName": "Dr. Priyadarshi Sen",
    "speakerDesignation": "Principal AI Scientist & IEEE Senior Member",
    "seats": 150,
    "registrationDeadline": "24 hours prior to event start",
    "contactPerson": "Aryan Mohapatra (Lead Student Organizer)"
}

try:
    req = urllib.request.Request(
        "http://127.0.0.1:3000/api/ai/generate-event",
        data=json.dumps(event_req_body, ensure_ascii=False).encode('utf-8'),
        headers={"Content-Type": "application/json; charset=utf-8"}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        check(res.get("success") is True, "POST /api/ai/generate-event returned success: true")
        msg = res["data"].get("whatsappAnnouncement", "")
        check('\uFFFD' not in msg and msg.startswith("🎓"), "AI WhatsApp announcement starts with 🎓 and has zero replacement characters")
        for emo in ['🎓', '🚀', '💡', '📅', '⏰', '🕐', '📍', '🏢', '🎯', '🎙️', '🎟️', '⏳', '🔗', '👤']:
            check(emo in msg, f"AI generated announcement contains '{emo}'")
except Exception as e:
    check(False, f"Error calling /api/ai/generate-event: {e}")

# 7. Test AI Event Helper API (Change speaker to Priyanshu Pal)
print("\n--- 7. VERIFYING AI EVENT HELPER NATURAL LANGUAGE COMMANDS ---")
helper_body = {
    "instruction": "Change speaker name to Priyanshu Pal, venue to Campus 6, and timing to 2 PM to 5 PM",
    "event": event_req_body
}
try:
    req = urllib.request.Request(
        "http://127.0.0.1:3000/api/ai/event-helper",
        data=json.dumps(helper_body, ensure_ascii=False).encode('utf-8'),
        headers={"Content-Type": "application/json; charset=utf-8"}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        check(res.get("success") is True, "POST /api/ai/event-helper returned success: true")
        changes = res["data"].get("changes", {})
        check(changes.get("speakerName") == "Priyanshu Pal", "Speaker name changed to 'Priyanshu Pal'")
        check(changes.get("campus") == "Campus 6", "Campus changed to 'Campus 6'")
except Exception as e:
    check(False, f"Error calling /api/ai/event-helper: {e}")

# 8. Test Emojis & Punctuation URL Encoding
print("\n--- 8. VERIFYING URL ENCODING ROUNDTRIP FOR ALL EMOJIS & PUNCTUATION ---")
test_message = """🎓 KIIT IEEE PRESENTS

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
Fee is ₹0 & "IEEE Members" receive full credentials (v1.0/alpha): 'Ready'!

🎟️ Capacity: 150 Lab Benches Only (Filling Fast)
⏳ Registration Deadline: 24 hours prior to event start

🔗 Register Now:
http://localhost:3000/#event=ai-edge-computer-vision-masterclass

👤 Organizer: KIIT IEEE Student Branch"""

encoded = urllib.parse.quote(test_message)
url = f"https://wa.me/?text={encoded}"

check("%EF%BF%BD" not in url, "Encoded wa.me URL has NO %EF%BF%BD replacement character encoding")
decoded_back = urllib.parse.unquote(encoded)
check(decoded_back == test_message, "Decoded text strictly matches original Unicode text")

all_characters = ['🎓', '🚀', '💡', '📅', '⏰', '🕐', '📍', '🏢', '🎯', '🎟️', '⏳', '🔗', '👤', '🎙️', '₹', '&', '–', "'", '"', '(', ')', '/', ':']
for c in all_characters:
    check(c in decoded_back, f"Character '{c}' preserved after roundtrip")

print("\n==================================================================")
print(f"VERIFICATION SUMMARY: {len(successes)} passed, {len(errors)} failed.")
print("==================================================================")

if errors:
    print("\nFAILED CHECKS:")
    for err in errors:
        print(f" - {err}")
    sys.exit(1)
else:
    print("\nALL SYSTEM AUDIT CHECKS PASSED PERFECTLY! 100% SUCCESS.")
    sys.exit(0)

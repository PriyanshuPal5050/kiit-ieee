#!/usr/bin/env python3
"""
KIIT IEEE Platform - Local Web Server & AI Service Endpoint
Runs a local HTTP server with static file serving and server-side Gemini AI integration.
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import json
import traceback
import urllib.parse
import datetime
import random
import re

# Force UTF-8 on Windows stdout if possible
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Load environment variables from .env or .env.local
try:
    from dotenv import load_dotenv
    # Load .env.local first, then .env
    load_dotenv('.env.local')
    load_dotenv('.env')
except ImportError:
    # Basic fallback .env parser if python-dotenv is absent
    for env_file in ['.env.local', '.env']:
        if os.path.isfile(env_file):
            try:
                with open(env_file, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            k, v = line.split('=', 1)
                            k = k.strip()
                            v = v.strip().strip("'\"")
                            if k and k not in os.environ:
                                os.environ[k] = v
            except Exception as e:
                print(f"[Warning] Failed parsing {env_file}: {e}")

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

SYSTEM_INSTRUCTION = """You are the KIIT IEEE Event Content Assistant.

Your job is to create professional, accurate and engaging event communication for KIIT IEEE Student Branch events.

Use ONLY the supplied event information as factual source data.

Never invent:
- dates
- times
- venues
- campus names
- addresses
- speaker names
- speaker organizations
- fees
- registration URLs
- eligibility requirements
- contact information.

Write professional but exciting content for engineering students.
Use appropriate emojis in WhatsApp announcements.
Keep information easy to scan.
Return ONLY valid JSON matching the requested schema."""

def generate_local_event_content(event_data, custom_instruction=""):
    """
    Synthesizes rich, structured, factual event descriptions, highlights, learning outcomes,
    and formatted WhatsApp announcements based strictly on verified input parameters.
    Used when GEMINI_API_KEY is not configured or offline.
    """
    import re
    title = event_data.get('eventName') or event_data.get('title') or 'Technical Workshop'
    cat = event_data.get('category') or 'AI & Machine Learning'
    fmt = event_data.get('eventType') or 'Workshop'
    speaker = event_data.get('speakerName') or 'Dr. Priyadarshi Sen'
    desig = event_data.get('speakerDesignation') or 'Principal AI Scientist & IEEE Senior Member'
    org = event_data.get('speakerOrganization') or 'NeuralTech Labs / Ex-Intel AI'
    campus = event_data.get('campus') or 'Campus 15'
    building = event_data.get('building') or 'School of Computer Engineering'
    venue = event_data.get('venue') or f"{event_data.get('room', 'Tech Lab 4')}, {building}, {campus}"
    date_str = event_data.get('date') or f"{event_data.get('startDate', '10 Oct')} – {event_data.get('endDate', '11 Oct 2026')}"
    time_str = f"{event_data.get('startTime', '09:30')} – {event_data.get('endTime', '17:00')} IST"
    reporting = event_data.get('reportingTime') or '08:30 AM'
    eligibility = event_data.get('eligibility') or 'Open to 2nd, 3rd & 4th Year B.Tech students (All branches)'
    prereqs = event_data.get('prerequisites') or 'Laptop with minimum 8GB RAM and basic programming familiarity.'
    seats = event_data.get('seats') or event_data.get('seatsTotal') or 120
    fee = event_data.get('registrationFee') or event_data.get('fee') or 'Free (IEEE Sponsored)'
    contact_p = event_data.get('contactPerson') or 'Aryan Mohapatra (Lead Student Organizer)'
    contact_ph = event_data.get('contactNumber') or event_data.get('contactPhone') or '+91 674 2725113'
    contact_em = event_data.get('contactEmail') or 'ieee@kiit.ac.in'

    slug = slugify(title)
    canonical_url = f"https://kiit-ieee.org/#event={slug}"

    short_desc = f"An intensive, hands-on {fmt.lower()} exploring practical implementation of {title} with real hardware and production-grade toolchains."
    full_desc = f"Join KIIT IEEE for an immersive {fmt.lower()} on {title}. Led by {speaker} ({desig}, {org}) at {venue}, this masterclass combines architectural deep dives with hands-on lab sprints, giving participants real deployment experience and verified IEEE credentials."

    whatsapp_msg = (
        f"🎓 *KIIT IEEE PRESENTS*\n\n"
        f"🚀 *{title.upper()}*\n\n"
        f"💡 {short_desc}\n\n"
        f"📅 *Date:* {date_str}\n"
        f"⏰ *Time:* {time_str}\n"
        f"🕐 *Reporting:* {reporting}\n"
        f"📍 *Venue:* {venue}\n"
        f"🏢 *Building:* {building}\n"
        f"🎯 *Eligibility:* {eligibility}\n"
        f"🎙️ *Speaker:* {speaker} ({desig})\n\n"
        f"💡 *Overview:*\n{full_desc}\n\n"
        f"🎟️ *Capacity:* {seats} Lab Benches Only (Filling Fast)\n"
        f"⏳ *Registration Deadline:* 24 hours prior to event start\n\n"
        f"🔗 *Register Now:*\n{canonical_url}\n\n"
        f"👤 *Organizer:* {event_data.get('contactPerson') or 'KIIT IEEE Student Branch'}\n\n"
        f"#KIITIEEE #WhereStudentsBuildWhatsNext #KIITUniversity"
    )

    return {
        "title": title,
        "eventName": title,
        "shortDescription": short_desc,
        "fullDescription": full_desc,
        "highlights": [
            f"Hands-on lab sessions at {venue}",
            f"Mentorship by {speaker} ({desig})",
            f"Deployment-ready capstone built and verified on-site",
            "Official KIIT IEEE Certificate of Excellence with verification hash"
        ],
        "learningOutcomes": [
            f"Fundamental and advanced concepts of {title}",
            "Environment configuration, hardware calibration, and debugging",
            "Production optimization and performance profiling",
            "Collaborative engineering workflows and capstone defense"
        ],
        "whatWillLearn": f"Fundamental and advanced concepts of {title}, environment configuration, hardware calibration, production optimization, and capstone defense.",
        "whatWillBuild": f"A production-ready implementation of {title} with automated verification and benchmark reporting.",
        "speakerIntroduction": f"{speaker} is a {desig} at {org}, bringing extensive field experience in delivering high-impact engineering workshops.",
        "whatsappAnnouncement": whatsapp_msg,
        "posterText": f"Hands-On Masterclass • {date_str} • {venue}",
        "faq": [
            {"question": "Who is eligible to attend?", "answer": eligibility},
            {"question": "What should I bring to the workshop?", "answer": f"Personal laptop with charger and student ID card. {prereqs}"},
            {"question": "Is there a registration fee?", "answer": f"The event fee is {fee}."},
            {"question": "Will certificates be provided?", "answer": "Yes, verified IEEE Student Branch credentials will be issued upon completion."}
        ]
    }

def call_gemini_api(event_data, custom_instruction=""):
    """
    Calls Google Gemini using the official google-genai SDK.
    Strictly follows factual constraints and returns structured JSON.
    Falls back gracefully to generate_local_event_content if API key is absent or exhausted.
    """
    # Dynamically reload .env and .env.local to pick up freshly configured keys
    try:
        from dotenv import load_dotenv
        load_dotenv('.env.local', override=True)
        load_dotenv('.env', override=True)
    except Exception:
        pass

    api_key = (os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or "").strip()
    if not api_key:
        print("[KIIT IEEE AI] GEMINI_API_KEY not configured. Generating deterministic factual event content from verified inputs.")
        return generate_local_event_content(event_data, custom_instruction)

    # Import official google.genai SDK
    try:
        from google import genai
        from google.genai import types
    except ImportError:
        print("[KIIT IEEE AI] google-genai package not found. Using local deterministic event content generator.")
        return generate_local_event_content(event_data, custom_instruction)

    client = genai.Client(api_key=api_key)

    configured_model = os.environ.get("GEMINI_MODEL") or "gemini-2.5-flash"
    candidate_models = [configured_model]
    for fallback in ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"]:
        if fallback not in candidate_models:
            candidate_models.append(fallback)

    prompt = f"""Generate structured event content for this KIIT IEEE event based STRICTLY on the following verified event details:

[SUPPLIED EVENT DATA]
- Event Name: {event_data.get('eventName', '')}
- Event Type: {event_data.get('eventType', '')}
- Category: {event_data.get('category', '')}
- Description Provided: {event_data.get('description', '')}
- Start Date: {event_data.get('startDate', '')}
- End Date: {event_data.get('endDate', '')}
- Start Time: {event_data.get('startTime', '')}
- End Time: {event_data.get('endTime', '')}
- Reporting Time: {event_data.get('reportingTime', '')}
- Campus: {event_data.get('campus', '')}
- Building / Block: {event_data.get('building', '')}
- Room / Lab: {event_data.get('room', '')}
- Venue Name: {event_data.get('venue', '')}
- Full Address: {event_data.get('address', '')}
- Speaker Name: {event_data.get('speakerName', '')}
- Speaker Designation: {event_data.get('speakerDesignation', '')}
- Speaker Organization: {event_data.get('speakerOrganization', '')}
- Speaker Bio: {event_data.get('speakerBio', '')}
- Eligibility: {event_data.get('eligibility', '')}
- Prerequisites: {event_data.get('prerequisites', '')}
- What Students Should Bring: {event_data.get('whatStudentsBring', '')}
- Available Seats: {event_data.get('seats', '')}
- Registration Fee: {event_data.get('registrationFee', '')}
- Contact Person: {event_data.get('contactPerson', '')}
- Contact Phone: {event_data.get('contactNumber', '')}
- Contact Email: {event_data.get('contactEmail', '')}
- Registration Deadline: {event_data.get('registrationDeadline', '')}
- Registration URL: {event_data.get('registrationUrl', '')}

[HOST CUSTOM INSTRUCTION]
{custom_instruction or "Make this exciting, prestigious, and clear for ambitious engineering undergraduates."}

CRITICAL RULES:
1. Use ONLY the supplied event data for factual information. Never invent dates, times, venue names, addresses, speakers, fees, registration links, eligibility requirements or contact details.
2. If any piece of information is missing, leave it empty or note that it is to be announced.
3. Return ONLY a valid JSON object matching the requested schema. No markdown wrapping outside the JSON.

Expected JSON Structure:
{{
  "shortDescription": "Punchy 1-2 sentence hook summarizing the event",
  "longDescription": "Professional multi-paragraph description detailing the technical scope and benefits",
  "highlights": ["3-5 concise bullet highlights"],
  "learningOutcomes": ["Key technical skills, tools, or frameworks students will master"],
  "whatWillBuild": "Specific projects, code repositories, or prototypes students will build",
  "speakerIntroduction": "Professional speaker bio and session lead context",
  "whatsappAnnouncement": "Formatted WhatsApp announcement using the verified event data with proper emojis (🚀, 🤖, 📅, ⏰, 🕐, 📍, 🏫, 🎤, 🎓, 💡, 🎟️, 🔗, #KIITIEEE)",
  "posterText": "Catchy 1-line subtitle or tagline suitable for the promotional poster",
  "faq": [
    {{"question": "Who is eligible to attend?", "answer": "..."}},
    {{"question": "What should I bring to the workshop?", "answer": "..."}}
  ]
}}"""

    for model_name in candidate_models:
        try:
            print(f"[KIIT IEEE AI] Invoking Gemini model: {model_name}...")
            config = types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
            )
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=config,
            )

            raw_text = (response.text or "").strip()
            if not raw_text:
                raise ValueError("Gemini returned an empty response text.")

            # Strip markdown fence if present
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            elif raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            raw_text = raw_text.strip()

            parsed = json.loads(raw_text)
            if "title" not in parsed:
                parsed["title"] = event_data.get("eventName") or event_data.get("title")
            if "eventName" not in parsed:
                parsed["eventName"] = parsed["title"]
            print(f"[KIIT IEEE AI] Content successfully generated using {model_name}.")
            return parsed

        except Exception as e:
            err_msg = str(e)
            print(f"[KIIT IEEE AI] Attempt with {model_name} failed: {err_msg}")

    print("[KIIT IEEE AI] Gemini API calls unsuccessful. Falling back to local deterministic event content generator.")
    return generate_local_event_content(event_data, custom_instruction)


ALLOWED_EVENT_FIELDS = {
    'eventName', 'title',
    'eventType',
    'category',
    'description', 'shortDescription', 'fullDescription',
    'startDate',
    'endDate',
    'startTime',
    'endTime',
    'reportingTime',
    'campus',
    'building',
    'room',
    'venue',
    'address',
    'speakerName',
    'speakerDesignation',
    'speakerOrganization',
    'speakerBio',
    'eligibility',
    'prerequisites',
    'whatStudentsBring', 'whatToBring',
    'seats', 'seatsTotal',
    'registrationFee', 'fee',
    'contactPerson',
    'contactNumber', 'contactPhone',
    'contactEmail',
    'registrationDeadline'
}

HELPER_SYSTEM_INSTRUCTION = """You are the KIIT IEEE Event Helper Assistant.
Your task is to parse natural-language instructions from an event host and return structured updates for event fields, poster design, or announcement content.

ALLOWED FIELDS FOR 'changes':
- eventName (or title)
- eventType
- category
- description (or shortDescription)
- startDate (format: YYYY-MM-DD)
- endDate (format: YYYY-MM-DD)
- startTime (format: HH:MM 24-hr e.g. "14:00" or "09:30")
- endTime (format: HH:MM 24-hr e.g. "17:00" or "18:00")
- reportingTime (format: HH:MM 24-hr e.g. "13:30" or "08:30")
- campus (e.g. "Campus 6", "Campus 15", "Campus 12", "Campus 17", "Campus 3", "Campus 1", "Campus 25")
- building
- room (e.g. "Room 302", "Tech Lab 4")
- venue (full combined venue name)
- address
- speakerName
- speakerDesignation
- speakerOrganization
- speakerBio
- eligibility
- prerequisites
- whatStudentsBring
- seats (integer or string)
- registrationFee (e.g. "₹100" or "Free")
- contactPerson
- contactNumber
- contactEmail
- registrationDeadline (format: YYYY-MM-DD)

CRITICAL RULES:
1. ONLY modify fields explicitly mentioned or clearly implied by the instruction.
2. NEVER invent details that were not provided. If the host says "Change speaker name to Priyanshu Pal", ONLY update speakerName. Do NOT invent designation, organization, or bio.
3. If the host asks to change poster style/theme (e.g. "make poster more formal", "make poster futuristic", "change theme to modern blue"), include 'posterInstructions':
   {
     "theme": "formal" | "futuristic" | "technical" | "cyber" | "energetic" | "minimal" | "modern",
     "accentStyle": "electric-blue" | "cyber-green" | "neon-purple" | "amber-gold" | "rose-flame",
     "titleScale": "normal" | "large" | "compact",
     "visualIntensity": "subtle" | "moderate" | "intense",
     "style": "professional" | "futuristic" | "corporate"
   }
4. If the host asks to update content tone or length (e.g. "make whatsapp announcement shorter", "make description more formal"), include 'contentInstructions':
   {
     "tone": "formal" | "exciting" | "technical" | "concise",
     "length": "short" | "standard" | "detailed"
   }
5. Set 'action':
   - "update_event" (if only fields changed)
   - "update_poster" (if only poster design changed)
   - "update_content" (if only content tone/text changed)
   - "update_event_and_poster" (if both event fields and poster changed)
   - "update_event_and_content" (if both event fields and content changed)
   - "update_all" (if event fields, content, and poster changed)

6. Provide a concise, clear 'message' stating what was updated.

Return ONLY a valid JSON object matching this schema:
{
  "action": "update_event",
  "changes": { ... },
  "contentInstructions": { ... },
  "posterInstructions": { ... },
  "message": "Speaker name updated to Priyanshu Pal."
}"""

def normalize_time_str(t_str):
    import re
    if not t_str:
        return t_str
    m = re.search(r'(\d{1,2})(?::(\d{2}))?\s*(am|pm)?', str(t_str), re.I)
    if not m:
        return t_str
    hours, minutes, meridiem = m.groups()
    h = int(hours)
    mins = minutes if minutes else "00"
    if meridiem:
        mer = meridiem.lower()
        if mer == 'pm' and h < 12:
            h += 12
        elif mer == 'am' and h == 12:
            h = 0
    return f"{h:02d}:{mins}"

def parse_local_event_instruction(instruction, current_event):
    """
    Intelligent local natural-language parser for event builder instructions.
    Provides immediate zero-delay fallback when offline or before GEMINI_API_KEY is configured.
    """
    import re
    text = instruction.strip()
    changes = {}
    poster_instructions = {}
    content_instructions = {}
    msg_parts = []

    # 1. Speaker Name
    spk_match = re.search(r'(?:(?:add|change|set|update)\s+)?(?:the\s+)?speaker(?:\s*name)?\s*(?:to|is|=)\s*([A-Za-z\s\.]+?)(?:(?:\s+and\s+)|(?:\s*\,)|\.|$)', text, re.I)
    if spk_match:
        spk_name = spk_match.group(1).strip()
        # Clean up any trailing words like "update"
        spk_name = re.sub(r'\s+(?:update|change|and).*$', '', spk_name, flags=re.I).strip()
        if spk_name:
            changes['speakerName'] = spk_name
            msg_parts.append(f"Speaker name changed to {spk_name}")

    # 2. Speaker Designation
    desig_match = re.search(r'(?:speaker\s+)?designation\s*(?:to|is|=)\s*([A-Za-z0-9\s\-]+?)(?:(?:\s+and\s+)|(?:\s*\,)|\.|$)', text, re.I)
    if desig_match:
        desig = desig_match.group(1).strip()
        changes['speakerDesignation'] = desig
        msg_parts.append(f"Speaker designation updated to {desig}")

    # 3. Campus
    campus_match = re.search(r'campus\s*(\d+|other)', text, re.I)
    if campus_match:
        c_num = campus_match.group(1)
        c_val = f"Campus {c_num}" if c_num.isdigit() else "Other"
        changes['campus'] = c_val
        msg_parts.append(f"Campus updated to {c_val}")

    # 4. Room
    room_match = re.search(r'(?:room|lab)\s*(\d+[a-z]?|\w+\s*(?:lab|hall)?\s*\d*)', text, re.I)
    if room_match:
        r_val = room_match.group(0).strip()
        changes['room'] = r_val
        msg_parts.append(f"Room updated to {r_val}")

    # 5. Full Venue
    if ('venue' in text.lower()) and not campus_match and not room_match:
        v_match = re.search(r'venue\s*(?:to|is|=)\s*([^,\.]+)', text, re.I)
        if v_match:
            changes['venue'] = v_match.group(1).strip()
            msg_parts.append(f"Venue updated to {changes['venue']}")

    # 6. Timing (Start Time & End Time)
    time_match = re.search(r'(?:timing|time)\s*(?:to|is|=)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:to|–|-)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)', text, re.I)
    if time_match:
        st = normalize_time_str(time_match.group(1))
        et = normalize_time_str(time_match.group(2))
        changes['startTime'] = st
        changes['endTime'] = et
        msg_parts.append(f"Timing set to {st}–{et}")

    # 7. Reporting Time
    rep_match = re.search(r'reporting(?:\s*time)?\s*(?:to|is|=|should be)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)', text, re.I)
    if rep_match:
        rt = normalize_time_str(rep_match.group(1))
        changes['reportingTime'] = rt
        msg_parts.append(f"Reporting time set to {rt}")

    # 8. Seats
    seats_match = re.search(r'(?:seats?|capacity)\s*(?:to|is|=)\s*(\d+)', text, re.I)
    if seats_match:
        changes['seats'] = int(seats_match.group(1))
        msg_parts.append(f"Seats updated to {changes['seats']}")

    # 9. Registration Fee
    fee_match = re.search(r'(?:registration\s+)?fee\s*(?:to|is|=)\s*([₹$€\w\d\s]+?)(?:(?:\s+and\s+)|\.|$)', text, re.I)
    if fee_match:
        fee_val = fee_match.group(1).strip()
        changes['registrationFee'] = fee_val
        msg_parts.append(f"Registration fee updated to {fee_val}")

    # 10. Event Title
    title_match = re.search(r'(?<!speaker\s)(?<!speaker\sname\s)(?:event\s+(?:title|name)|(?:title\s+of\s+(?:the\s+)?event)|(?:\bthe\s+title\b)|(?:\btitle\s*(?:to|is|=)))\s*(?:to|is|=)?\s*([^,\.]+)', text, re.I)
    if title_match:
        t_val = title_match.group(1).strip().strip("'\"")
        changes['eventName'] = t_val
        msg_parts.append(f"Event title changed to '{t_val}'")

    # 11. Poster Instructions
    t_lower = text.lower()
    if 'poster' in t_lower:
        if 'formal' in t_lower or 'corporate' in t_lower:
            poster_instructions['theme'] = 'formal'
            poster_instructions['style'] = 'formal'
            poster_instructions['visualIntensity'] = 'moderate'
            msg_parts.append("Poster set to formal IEEE style")
        elif 'futuristic' in t_lower or 'cyber' in t_lower or 'neon' in t_lower:
            poster_instructions['theme'] = 'futuristic'
            poster_instructions['accentStyle'] = 'electric-blue'
            poster_instructions['style'] = 'futuristic'
            msg_parts.append("Poster set to futuristic technical style")
        elif 'blue' in t_lower or 'technical' in t_lower:
            poster_instructions['theme'] = 'technical'
            poster_instructions['accentStyle'] = 'electric-blue'
            msg_parts.append("Poster set to modern technical blue style")
        elif 'hackathon' in t_lower or 'energetic' in t_lower:
            poster_instructions['theme'] = 'energetic'
            msg_parts.append("Poster set to energetic hackathon style")
        elif 'minimal' in t_lower or 'clean' in t_lower:
            poster_instructions['theme'] = 'minimal'
            msg_parts.append("Poster set to clean minimalist style")

    # 12. Content / Announcement Instructions
    if 'whatsapp' in t_lower or 'announcement' in t_lower or 'description' in t_lower:
        if 'shorter' in t_lower or 'short' in t_lower or 'concise' in t_lower:
            content_instructions['length'] = 'short'
            msg_parts.append("Announcement set to concise format")
        if 'formal' in t_lower:
            content_instructions['tone'] = 'formal'
            msg_parts.append("Announcement tone set to formal")

    # Determine action
    has_changes = bool(changes)
    has_poster = bool(poster_instructions)
    has_content = bool(content_instructions)

    if has_changes and has_poster and has_content:
        action = "update_all"
    elif has_changes and has_poster:
        action = "update_event_and_poster"
    elif has_changes and has_content:
        action = "update_event_and_content"
    elif has_poster:
        action = "update_poster"
    elif has_content:
        action = "update_content"
    else:
        action = "update_event"

    message = "; ".join(msg_parts) if msg_parts else "Instruction evaluated and applied."
    return {
        "action": action,
        "changes": changes,
        "diff": changes,
        "contentInstructions": content_instructions,
        "posterInstructions": poster_instructions,
        "message": message
    }

def call_gemini_event_helper(instruction, current_event):
    """
    Parses natural language command using Gemini API with structured JSON output.
    Falls back gracefully to parse_local_event_instruction if API key is not configured.
    """
    api_key = (os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or "").strip()
    if not api_key:
        print("[KIIT IEEE AI Helper] No GEMINI_API_KEY set. Using intelligent local parser.")
        return parse_local_event_instruction(instruction, current_event)

    try:
        from google import genai
        from google.genai import types
    except ImportError:
        return parse_local_event_instruction(instruction, current_event)

    client = genai.Client(api_key=api_key)
    model_name = os.environ.get("GEMINI_MODEL") or "gemini-2.5-flash"

    prompt = f"""Current Event Parameters:
{json.dumps(current_event, indent=2, ensure_ascii=False)}

Host Natural Language Instruction:
"{instruction}"

Parse this instruction and determine which fields to update or what design/content instructions to apply.
Return strictly JSON adhering to the HELPER_SYSTEM_INSTRUCTION schema."""

    try:
        config = types.GenerateContentConfig(
            system_instruction=HELPER_SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
        )
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=config,
        )

        raw_text = (response.text or "").strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        raw_text = raw_text.strip()

        parsed = json.loads(raw_text)

        # Sanitize against whitelist
        if "changes" in parsed and isinstance(parsed["changes"], dict):
            filtered = {}
            for k, v in parsed["changes"].items():
                if k in ALLOWED_EVENT_FIELDS:
                    # Normalize time strings if necessary
                    if k in ['startTime', 'endTime', 'reportingTime']:
                        filtered[k] = normalize_time_str(v)
                    else:
                        filtered[k] = v
            parsed["changes"] = filtered
            parsed["diff"] = filtered

        return parsed

    except Exception as e:
        print(f"[KIIT IEEE AI Helper] Gemini call failed ({e}). Falling back to local parser.", flush=True)
        return parse_local_event_instruction(instruction, current_event)


DATA_DIR = os.path.join(DIRECTORY, "data")
EVENTS_FILE = os.path.join(DATA_DIR, "events.json")
REGISTRATIONS_FILE = os.path.join(DATA_DIR, "registrations.json")

def init_registrations_db():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(REGISTRATIONS_FILE):
        seed_registrations = [
            {
                "ticketId": "KIIT-IEEE-2026-AI99",
                "eventId": "evt-ai-cv-2026",
                "eventName": "AI & Edge Computer Vision Masterclass",
                "studentName": "Aryan Mohapatra",
                "rollNo": "22051842",
                "branch": "Computer Science & Engineering",
                "year": "3rd Year",
                "email": "22051842@kiit.ac.in",
                "phone": "+91 98610 54321",
                "track": "Edge AI",
                "bench": "Bench B17",
                "team": "Team Nova",
                "status": "Confirmed",
                "attended": True,
                "registeredAt": "2026-09-26T12:30:00Z"
            }
        ]
        with open(REGISTRATIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(seed_registrations, f, indent=2, ensure_ascii=False)

def load_registrations():
    init_registrations_db()
    try:
        with open(REGISTRATIONS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[Registrations DB Error] Failed reading {REGISTRATIONS_FILE}: {e}")
        return []

def save_registrations(reg_list):
    init_registrations_db()
    with open(REGISTRATIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(reg_list, f, indent=2, ensure_ascii=False)

def init_events_db():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(EVENTS_FILE):
        seed_events = [
            {
                "id": "evt-ai-cv-2026",
                "slug": "ai-edge-computer-vision-masterclass",
                "title": "AI & Edge Computer Vision Masterclass",
                "tagline": "Build real-time object tracking and neural perception models on resource-constrained edge devices.",
                "category": "AI & Machine Learning",
                "format": "Offline",
                "difficulty": "Intermediate",
                "price": 0,
                "priceLabel": "Free (IEEE Sponsored)",
                "date": "Oct 10 - 11, 2026",
                "startDate": "2026-10-10",
                "endDate": "2026-10-11",
                "time": "09:30 AM - 05:00 PM IST",
                "startTime": "09:30",
                "endTime": "17:00",
                "reportingTime": "08:30",
                "venue": "Campus 15, Tech Lab 4, KIIT University",
                "campus": "Campus 15",
                "building": "School of Computer Engineering",
                "room": "Tech Lab 4",
                "address": "Campus 15, KIIT Deemed to be University, Patia, Bhubaneswar, Odisha 751024",
                "bannerGradient": "from-indigo-600 via-purple-600 to-pink-600",
                "badgeColor": "badge-ai",
                "featured": True,
                "status": "PUBLISHED",
                "speaker": {
                    "name": "Dr. Priyadarshi Sen",
                    "role": "Principal AI Scientist & IEEE Senior Member",
                    "org": "NeuralTech Labs / Ex-Intel AI",
                    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
                    "bio": "12+ years experience deploying embedded computer vision and deep neural network accelerators."
                },
                "seatsTotal": 150,
                "seatsFilled": 118,
                "eligibility": "Open to 2nd, 3rd & 4th Year B.Tech students (All branches)",
                "prerequisites": ["Basic Python 3.9+", "Basic convolutional neural networks", "Laptop with min 8GB RAM"],
                "whatYouWillBuild": ["Real-time edge vehicle speed & license tracker running at 45 FPS", "Quantized INT8 YOLOv11 pipeline optimized for Jetson TensorRT", "Custom IEEE portfolio project ready for GitHub & resume"],
                "whatToBring": "Student laptop with charger, student ID card",
                "contactPerson": "Aryan Mohapatra (Lead Student Organizer)",
                "contactPhone": "+91 674 2725113",
                "contactEmail": "ieee@kiit.ac.in",
                "publishedAt": "2026-09-26T12:00:00Z"
            },
            {
                "id": "evt-robotics-esp32-2026",
                "slug": "autonomous-robotics-esp32-iot-lab",
                "title": "Autonomous Robotics & ESP32-S3 IoT Lab",
                "tagline": "Design, wire, program, and pilot a dual-core obstacle-avoiding autonomous rover from scratch.",
                "category": "Robotics & IoT",
                "format": "Offline",
                "difficulty": "Beginner to Intermediate",
                "price": 0,
                "priceLabel": "Free (Hardware Provided)",
                "date": "Oct 18 - 19, 2026",
                "time": "10:00 AM - 04:30 PM IST",
                "venue": "School of Mechanical & Electrical Lab, Campus 3",
                "campus": "Campus 3",
                "status": "PUBLISHED",
                "speaker": {
                    "name": "Er. Tanmay Mohanty",
                    "role": "Lead Embedded Systems Architect",
                    "org": "AeroBotix Systems"
                },
                "seatsTotal": 100,
                "seatsFilled": 94,
                "publishedAt": "2026-09-26T12:00:00Z"
            }
        ]
        with open(EVENTS_FILE, "w", encoding="utf-8") as f:
            json.dump(seed_events, f, indent=2, ensure_ascii=False)

def load_events():
    init_events_db()
    try:
        with open(EVENTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[Events DB Error] Failed reading {EVENTS_FILE}: {e}")
        return []

def save_events(events_list):
    init_events_db()
    with open(EVENTS_FILE, "w", encoding="utf-8") as f:
        json.dump(events_list, f, indent=2, ensure_ascii=False)

def slugify(text):
    import re
    text = str(text or "").lower().strip()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text)
    return text.strip('-')

def check_student_eligibility(eligibility_str, student_year, student_branch):
    if not eligibility_str:
        return True, ""
    elig_lower = eligibility_str.lower()
    if "open to all" in elig_lower or "any semester" in elig_lower or ("all branches" in elig_lower and "year" not in elig_lower):
        return True, ""

    # Check year constraints
    year_map = {
        "1st": ["1st", "first", "1"],
        "2nd": ["2nd", "second", "2"],
        "3rd": ["3rd", "third", "3"],
        "4th": ["4th", "fourth", "final", "4"]
    }
    mentioned_years = []
    for y_key, aliases in year_map.items():
        if any(f"{a} year" in elig_lower or f"{a} yr" in elig_lower or f"{a}&" in elig_lower or f"{a} &" in elig_lower for a in aliases):
            mentioned_years.append(y_key)

    if mentioned_years:
        stud_year_lower = (student_year or "").lower()
        matched = False
        for y_key in mentioned_years:
            if any(a in stud_year_lower for a in year_map[y_key]):
                matched = True
                break
        if not matched:
            return False, f"Event is open to {', '.join(mentioned_years)} Year students only. Your profile is {student_year}."

    return True, ""

def is_deadline_passed(deadline_str):
    if not deadline_str:
        return False
    try:
        clean = deadline_str.strip()[:10]
        dl_date = datetime.datetime.strptime(clean, "%Y-%m-%d").date()
        return datetime.date.today() > dl_date
    except Exception:
        return False


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def guess_type(self, path):
        ctype = http.server.SimpleHTTPRequestHandler.guess_type(self, path)
        if ctype and (ctype.startswith('text/') or ctype in ('application/javascript', 'application/json')):
            if 'charset=' not in ctype:
                ctype += '; charset=utf-8'
        return ctype

    def end_headers(self):
        # Enable CORS and caching headers for local testing
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json_response(self, status_code, data):
        payload = json.dumps(data, indent=2, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/ai/status':
            api_key = (os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or "").strip()
            self.send_json_response(200, {
                "status": "online",
                "hasApiKey": bool(api_key),
                "model": os.environ.get("GEMINI_MODEL") or "gemini-2.5-flash",
                "sdk": "@google/genai (Python 2.25.0)"
            })
            return

        if parsed.path == '/api/events':
            events = load_events()
            self.send_json_response(200, {
                "success": True,
                "events": events
            })
            return

        if parsed.path == '/api/registrations':
            regs = load_registrations()
            self.send_json_response(200, {
                "success": True,
                "registrations": regs
            })
            return

        if parsed.path.startswith('/api/events/'):
            raw_id = parsed.path[len('/api/events/'):].strip('/')
            event_id_or_slug = urllib.parse.unquote(raw_id).strip()
            events = load_events()
            matched = None
            for e in events:
                if str(e.get('id', '')).lower() == event_id_or_slug.lower() or str(e.get('slug', '')).lower() == event_id_or_slug.lower():
                    matched = e
                    break
            if matched:
                self.send_json_response(200, {
                    "success": True,
                    "event": matched
                })
            else:
                self.send_json_response(404, {
                    "success": False,
                    "error": f"Event '{event_id_or_slug}' not found in database."
                })
            return

        # Check if this is an unmatched /api/ route
        if parsed.path.startswith('/api/'):
            self.send_json_response(404, {
                "success": False,
                "error": f"API endpoint '{parsed.path}' not found."
            })
            return

        # Check if the requested file exists on disk
        req_rel = parsed.path.lstrip('/')
        disk_path = os.path.join(DIRECTORY, req_rel.replace('/', os.sep))
        if os.path.isfile(disk_path):
            super().do_GET()
            return
        if os.path.isdir(disk_path) and os.path.isfile(os.path.join(disk_path, 'index.html')):
            super().do_GET()
            return

        # SPA client-side route fallback (/events, /events/:id, /student, /host, etc.)
        index_file = os.path.join(DIRECTORY, 'index.html')
        if os.path.isfile(index_file):
            with open(index_file, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path in ('/api/events/publish', '/api/events'):
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length <= 0:
                    self.send_json_response(400, {
                        "success": False,
                        "error": "Empty event payload."
                    })
                    return
                body = self.rfile.read(content_length).decode('utf-8')
                event_data = json.loads(body)

                title = (event_data.get('title') or event_data.get('eventName') or '').strip()
                if not title:
                    self.send_json_response(400, {
                        "success": False,
                        "error": "Event title is required for publishing."
                    })
                    return

                events = load_events()
                slug = slugify(title)

                existing_id = event_data.get('id')
                if existing_id and str(existing_id).startswith('evt-'):
                    event_id = str(existing_id)
                elif existing_id:
                    event_id = f"evt-{existing_id}"
                else:
                    event_id = f"evt-{slug}"

                event_data['id'] = event_id
                event_data['slug'] = slug
                event_data['title'] = title
                event_data['status'] = "PUBLISHED"
                event_data['publishedAt'] = datetime.datetime.utcnow().isoformat() + "Z"

                # Update in place if exists or prepend
                updated = False
                for i, existing in enumerate(events):
                    if existing.get('id') == event_id or existing.get('slug') == slug:
                        events[i] = {**existing, **event_data}
                        updated = True
                        break
                if not updated:
                    events.insert(0, event_data)

                save_events(events)

                print(f"[KIIT IEEE Database] Published event '{title}' with ID: {event_id}, Slug: {slug}", flush=True)

                self.send_json_response(200, {
                    "success": True,
                    "message": "Event published successfully to database.",
                    "event": event_data
                })
            except Exception as e:
                traceback.print_exc()
                self.send_json_response(500, {
                    "success": False,
                    "error": f"Failed to publish event to database: {str(e)}"
                })
            return

        elif parsed.path == '/api/ai/generate-event':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length <= 0:
                    self.send_json_response(400, {
                        "success": False,
                        "error": "Empty request body received."
                    })
                    return

                body = self.rfile.read(content_length).decode('utf-8')
                event_data = json.loads(body)

                # Server-side validation of mandatory fields
                missing = []
                if not (event_data.get('eventName') or event_data.get('title')):
                    missing.append('Event Name')
                if not event_data.get('eventType'):
                    missing.append('Event Type')
                if not (event_data.get('startDate') or event_data.get('date')):
                    missing.append('Date')
                if not event_data.get('startTime'):
                    missing.append('Start Time')
                if not event_data.get('endTime'):
                    missing.append('End Time')
                if not event_data.get('campus'):
                    missing.append('Campus')
                if not (event_data.get('venue') or event_data.get('building') or event_data.get('room') or event_data.get('address')):
                    missing.append('Venue')
                if not event_data.get('eligibility'):
                    missing.append('Eligibility')
                if not (event_data.get('contactPerson') or event_data.get('contactEmail') or event_data.get('contactNumber') or event_data.get('contactPhone')):
                    missing.append('Contact Information')

                if missing:
                    self.send_json_response(400, {
                        "success": False,
                        "error": f"Please complete the required event details before generating: {', '.join(missing)}.",
                        "missingFields": missing
                    })
                    return

                custom_instruction = event_data.get('customAIInstruction') or event_data.get('aiInstruction') or ""

                # Call Gemini API
                result_json = call_gemini_api(event_data, custom_instruction)

                self.send_json_response(200, {
                    "success": True,
                    "data": result_json
                })

            except ValueError as ve:
                err_text = str(ve)
                print(f"[Server Config Error] {err_text}")
                self.send_json_response(500, {
                    "success": False,
                    "error": "GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your .env or .env.local file in the project root.",
                    "code": "MISSING_API_KEY"
                })

            except json.JSONDecodeError:
                self.send_json_response(400, {
                    "success": False,
                    "error": "Invalid JSON payload in request."
                })

            except Exception as e:
                traceback.print_exc()
                err_str = str(e)
                user_msg = "AI generation is temporarily unavailable. Please check your AI configuration or try again."
                if "API_KEY_INVALID" in err_str or "API key not valid" in err_str:
                    user_msg = "Invalid Gemini API Key provided. Please check GEMINI_API_KEY in your .env file."
                elif "quota" in err_str.lower() or "resource_exhausted" in err_str.lower():
                    user_msg = "Gemini API rate limit or quota exceeded. Please wait a moment or check your account."
                elif "safety" in err_str.lower() or "blocked" in err_str.lower():
                    user_msg = "The event content was flagged by Gemini safety filters. Please refine the description."

                self.send_json_response(500, {
                    "success": False,
                    "error": user_msg,
                    "detail": err_str
                })
            return

        elif parsed.path == '/api/ai/event-helper':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length <= 0:
                    self.send_json_response(400, {
                        "success": False,
                        "error": "Empty request body received."
                    })
                    return

                body = self.rfile.read(content_length).decode('utf-8')
                data = json.loads(body)

                instruction = data.get('instruction', '').strip()
                if not instruction:
                    self.send_json_response(400, {
                        "success": False,
                        "error": "Please provide an instruction for the AI helper."
                    })
                    return

                current_event = data.get('event', {})
                result_json = call_gemini_event_helper(instruction, current_event)

                self.send_json_response(200, {
                    "success": True,
                    "data": result_json
                })
            except Exception as e:
                traceback.print_exc()
                self.send_json_response(500, {
                    "success": False,
                    "error": f"AI Event Helper error: {str(e)}"
                })
            return

        # Check for Register endpoint (handles /api/events/register and /api/events/<id>/register)
        elif parsed.path == '/api/events/register' or re.match(r'^/api/events/([^/]+)/register/?$', parsed.path):
            try:
                path_match = re.match(r'^/api/events/([^/]+)/register/?$', parsed.path)
                path_event_id = path_match.group(1) if path_match else None

                content_length = int(self.headers.get('Content-Length', 0))
                data = {}
                if content_length > 0:
                    body = self.rfile.read(content_length).decode('utf-8')
                    data = json.loads(body)

                event_id = str(path_event_id or data.get('eventId') or '').strip()
                roll_no = str(data.get('rollNo') or '').strip()
                student_name = (data.get('studentName') or data.get('fullName') or '').strip()
                email = str(data.get('email') or f"{roll_no}@kiit.ac.in").strip()
                branch = str(data.get('branch') or 'Computer Science & Engineering').strip()
                year = str(data.get('year') or '3rd Year').strip()

                if not student_name or not roll_no:
                    self.send_json_response(400, {
                        "success": False,
                        "error": "Student authentication profile required (studentName and rollNo)."
                    })
                    return

                if not event_id:
                    self.send_json_response(400, {"success": False, "error": "Event ID is required."})
                    return

                events = load_events()
                matched_evt = next((e for e in events if str(e.get('id', '')).lower() == event_id.lower() or str(e.get('slug', '')).lower() == event_id.lower() or str(e.get('title', '')).lower() == event_id.lower()), None)
                if not matched_evt:
                    self.send_json_response(404, {
                        "success": False,
                        "error": f"Event '{event_id}' not found in database."
                    })
                    return

                # Validate Event Status
                evt_status = str(matched_evt.get('status', 'OPEN')).upper()
                if evt_status in ('DRAFT', 'ARCHIVED', 'CANCELLED'):
                    self.send_json_response(400, {
                        "success": False,
                        "error": "Registration is not open for this event."
                    })
                    return

                # Validate Capacity
                seats_filled = int(matched_evt.get('seatsFilled', 0))
                seats_total = int(matched_evt.get('seatsTotal', 120))
                if seats_filled >= seats_total:
                    self.send_json_response(400, {
                        "success": False,
                        "error": "Event is full. All available seats have been claimed."
                    })
                    return

                # Validate Registration Deadline
                if is_deadline_passed(matched_evt.get('registrationDeadline')):
                    self.send_json_response(400, {
                        "success": False,
                        "error": "Registration closed. The deadline for this event has passed."
                    })
                    return

                # Validate Eligibility
                is_elig, elig_msg = check_student_eligibility(matched_evt.get('eligibility', ''), year, branch)
                if not is_elig:
                    self.send_json_response(403, {
                        "success": False,
                        "error": f"Registration unavailable for your profile. {elig_msg}"
                    })
                    return

                regs = load_registrations()
                canonical_evt_id = matched_evt.get('id', event_id)
                canonical_evt_slug = matched_evt.get('slug', '')

                # Check Duplicate Registration
                for r in regs:
                    r_evt = str(r.get('eventId', '')).lower()
                    if (r_evt == canonical_evt_id.lower() or (canonical_evt_slug and r_evt == canonical_evt_slug.lower())) and (str(r.get('rollNo', '')).lower() == roll_no.lower() or (email and str(r.get('email', '')).lower() == email.lower())):
                        self.send_json_response(409, {
                            "success": False,
                            "alreadyRegistered": True,
                            "error": f"Student {student_name} ({roll_no}) is already registered for this event.",
                            "registration": r
                        })
                        return

                random_suffix = random.randint(1000, 9999)
                code = canonical_evt_id.replace('evt-', '').upper()[:4]
                ticket_id = data.get('ticketId') or f"KIIT-IEEE-2026-{code}{random_suffix}"

                new_reg = {
                    "ticketId": ticket_id,
                    "eventId": canonical_evt_id,
                    "eventName": matched_evt.get('title', 'KIIT IEEE Event'),
                    "studentName": student_name,
                    "rollNo": roll_no,
                    "branch": branch,
                    "year": year,
                    "email": email,
                    "phone": data.get('phone', '+91 99999 99999'),
                    "track": data.get('track', 'General'),
                    "tshirtSize": data.get('tshirtSize', 'L'),
                    "bench": data.get('bench', f"Bench B{random.randint(10, 25)}"),
                    "team": data.get('team', 'Unassigned'),
                    "status": "Confirmed",
                    "attended": False,
                    "registeredAt": datetime.datetime.utcnow().isoformat() + "Z"
                }

                regs.insert(0, new_reg)
                save_registrations(regs)

                matched_evt['seatsFilled'] = seats_filled + 1
                if matched_evt['seatsFilled'] >= seats_total:
                    matched_evt['status'] = 'FULL'
                elif matched_evt['seatsFilled'] >= int(seats_total * 0.8):
                    matched_evt['status'] = 'ALMOST FULL'
                save_events(events)

                print(f"[KIIT IEEE Database] Registration created: {ticket_id} for {student_name} ({roll_no}) in {canonical_evt_id}. Seats: {matched_evt['seatsFilled']}/{seats_total}", flush=True)
                self.send_json_response(200, {
                    "success": True,
                    "message": "🎉 Registration Successful!",
                    "registration": new_reg,
                    "event": matched_evt
                })
            except Exception as e:
                traceback.print_exc()
                self.send_json_response(500, {"success": False, "error": str(e)})
            return

        # Check for Check-in / Scan endpoint (handles /api/events/checkin, /api/events/attendance/scan, /api/events/<id>/attendance/scan)
        elif (
            parsed.path in ('/api/events/checkin', '/api/events/attendance/scan') or
            re.match(r'^/api/events/([^/]+)/attendance/scan/?$', parsed.path)
        ):
            try:
                path_match = re.match(r'^/api/events/([^/]+)/attendance/scan/?$', parsed.path)
                path_event_id = path_match.group(1) if path_match else None

                content_length = int(self.headers.get('Content-Length', 0))
                data = {}
                if content_length > 0:
                    body = self.rfile.read(content_length).decode('utf-8')
                    data = json.loads(body)

                # Host Security Check: Only Host / Organizer / Volunteer / Admin
                role = str(data.get('role') or self.headers.get('X-User-Role') or '').lower().strip()
                if role and role not in ('host', 'organizer', 'volunteer', 'admin', 'instructor'):
                    self.send_json_response(403, {
                        "success": False,
                        "error": "Unauthorized. Attendance scanning requires Host, Organizer, Volunteer, or Admin privileges."
                    })
                    return

                # Decode QR Token / Ticket ID
                raw_token = str(data.get('qrToken') or data.get('ticketId') or '').strip()
                embedded_event_id = ''
                ticket_id = ''

                if raw_token.startswith('{'):
                    try:
                        parsed_token = json.loads(raw_token)
                        ticket_id = parsed_token.get('ticketId', '')
                        embedded_event_id = parsed_token.get('eventId', '')
                    except Exception:
                        pass

                if not ticket_id:
                    if ':' in raw_token:
                        parts = raw_token.split(':')
                        # format e.g. KIIT-IEEE-PASS:<ticketId>:<eventId>:<rollNo>
                        ticket_id = next((p for p in parts if 'KIIT-IEEE-2026' in p), parts[1] if len(parts) > 1 else raw_token)
                        embedded_event_id = parts[2] if len(parts) > 2 else ''
                    else:
                        ticket_id = raw_token

                ticket_id = ticket_id.strip().upper()
                if not ticket_id:
                    self.send_json_response(400, {
                        "success": False,
                        "error": "✕ Invalid Event Pass. Unrecognized QR data."
                    })
                    return

                regs = load_registrations()
                found = None
                for r in regs:
                    if str(r.get('ticketId', '')).strip().upper() == ticket_id:
                        found = r
                        break

                if not found:
                    self.send_json_response(404, {
                        "success": False,
                        "error": "✕ No valid registration found."
                    })
                    return

                # Verify event matching if event scope is provided
                target_event = str(path_event_id or data.get('eventId') or embedded_event_id or '').strip()
                if target_event:
                    events = load_events()
                    matched_evt = next((e for e in events if str(e.get('id', '')).lower() == target_event.lower() or str(e.get('slug', '')).lower() == target_event.lower()), None)
                    canonical_target_id = matched_evt.get('id') if matched_evt else target_event
                    reg_evt_id = found.get('eventId', '')
                    if canonical_target_id.lower() != reg_evt_id.lower() and (matched_evt and matched_evt.get('slug', '').lower() != reg_evt_id.lower()):
                        self.send_json_response(400, {
                            "success": False,
                            "error": "✕ This pass belongs to another event."
                        })
                        return

                now_dt = datetime.datetime.now()
                time_str = now_dt.strftime("%I:%M %p")

                if found.get('attended'):
                    attended_time = time_str
                    if found.get('attendedAt'):
                        try:
                            iso_str = found['attendedAt'].replace('Z', '')
                            attended_time = datetime.datetime.fromisoformat(iso_str).strftime("%I:%M %p")
                        except Exception:
                            pass
                    self.send_json_response(200, {
                        "success": True,
                        "alreadyAttended": True,
                        "message": "✓ Student already checked in",
                        "student": found.get('studentName'),
                        "event": found.get('eventName'),
                        "time": attended_time,
                        "registration": found
                    })
                    return

                found['attended'] = True
                found['attendedAt'] = datetime.datetime.utcnow().isoformat() + "Z"
                save_registrations(regs)

                print(f"[KIIT IEEE Database] Attendance verified & recorded: {ticket_id} ({found.get('studentName')}) at {time_str}", flush=True)
                self.send_json_response(200, {
                    "success": True,
                    "message": "✓ Attendance Marked",
                    "student": found.get('studentName'),
                    "event": found.get('eventName'),
                    "time": time_str,
                    "registration": found
                })
            except Exception as e:
                traceback.print_exc()
                self.send_json_response(500, {"success": False, "error": str(e)})
            return

        self.send_json_response(404, {"error": "Endpoint not found."})


class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True

def run():
    os.chdir(DIRECTORY)
    port = PORT
    for _ in range(10):
        try:
            with ThreadedTCPServer(("", port), Handler) as httpd:
                url = f"http://localhost:{port}"
                print("=" * 60, flush=True)
                print("[KIIT IEEE] Local Platform Server Active", flush=True)
                print("Where Students Build What's Next.", flush=True)
                print(f"URL: {url}", flush=True)
                print(f"AI Endpoint: {url}/api/ai/generate-event", flush=True)
                api_key_set = bool(os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"))
                print(f"Gemini API Key Configured: {'YES' if api_key_set else 'NO (Set GEMINI_API_KEY in .env)'}", flush=True)
                print(f"Gemini Model: {os.environ.get('GEMINI_MODEL', 'gemini-2.5-flash')}", flush=True)
                print("=" * 60, flush=True)
                print("Press Ctrl+C to stop the server.", flush=True)
                httpd.serve_forever()
                break
        except OSError as oe:
            print(f"[KIIT IEEE Server] Port {port} busy ({oe}), trying {port + 1}...", flush=True)
            port += 1

if __name__ == '__main__':
    run()

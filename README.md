# KIIT IEEE — Intelligent Student Event Operating System
> **"Where Students Build What’s Next."**

An AI-powered, production-grade student event management platform and laboratory operating system built for the **KIIT IEEE Student Branch** community at Kalinga Institute of Industrial Technology, Bhubaneswar.

---

## ⚡ Product Vision & Key Philosophy

KIIT IEEE is not a static college website or a corporate dashboard template. It is an intelligent event operating system designed to manage the entire technical student lifecycle:

$$\text{DISCOVER} \longrightarrow \text{REGISTER} \longrightarrow \text{PREPARE} \longrightarrow \text{ATTEND} \longrightarrow \text{PARTICIPATE} \longrightarrow \text{BUILD} \longrightarrow \text{SUBMIT} \longrightarrow \text{VERIFY} \longrightarrow \text{EARN}$$

Every interaction is functional, stateful, and reactive. Buttons perform real actions, registrations generate unique cryptographic tickets, organizers can scan QR passes in real-time, the AI Copilot streams step-by-step code troubleshooting, and certificates render onto high-resolution canvas with gold foil seals and verifiable ledger hashes.

---

## 🚀 Quick Start Guide

The application is completely self-contained with **zero external package installations required**.

### Method 1: One-Click Windows Launcher (Recommended)
Simply double-click:
```cmd
start.bat
```
This automatically launches the lightweight Python server and opens your default browser at `http://localhost:3000`.

### Method 2: Python Command Line
```powershell
python server.py
```
Open [http://localhost:3000](http://localhost:3000) in Edge, Firefox, or Chrome.

### Method 3: Direct Browser Launch
You can also open `index.html` directly in any modern browser!

---

## 💎 Design System & Visual Identity

* **Aesthetic Direction:** Apple-level cleanliness + Linear-level product design + creative engineering aesthetic + campus energy.
* **Palette:**
  * **Brand Primary:** Electric Indigo (`#6366f1`)
  * **Cyber Cyan:** (`#06b6d4`)
  * **Electric Violet:** (`#8b5cf6`)
  * **Emerald Success:** (`#10b981`)
  * **Amber Warning:** (`#f59e0b`)
  * **Rose Urgent:** (`#f43f5e`)
  * **Canvas Canvas:** Deep Midnight Obsidian (`#07090e`, `#0c1017`)
* **Motion & Physics:** 60 FPS interactive physics particle canvas ("Event Universe"), spring press button response, smooth glassmorphic card elevation, and confetti burst animations.
* **Zero-Dependency Audio Synthesizer:** Built-in Web Audio API frequency generator producing subtle UI haptics (clicks, success arpeggios, check-in chimes, and scanner beeps).

---

## 🛠️ Complete Feature Walkthrough

### 1. Interactive Hero & "Event Universe"
* Dynamic 60 FPS HTML5 canvas physics simulation featuring interconnected floating technical nodes (AI/ML, Robotics, Copilot, MegaHack, Campus 15).
* Subtle magnetic attraction/repulsion responding to mouse cursor position.
* Real-time season badge: *Autumn 2026 Season Open • 14 Technical Workshops*.
* Live stat counters: 4,200+ Students, 85+ Events, 1,200+ Projects, 98% Readiness Rate.

### 2. Multi-Faceted Event Discovery
* Real-time search across event titles, syllabus topics, instructors, and lab venues.
* Filter pills for:
  * **Categories:** AI & Machine Learning, Robotics & IoT, Web & Cloud, Hackathons, Cybersecurity, Embedded Systems.
  * **Format Mode:** Offline (Campus Labs), Online, Hybrid.
  * **Difficulty:** Beginner, Intermediate, Advanced.
* Instant layout toggling between **Grid View** and **Compact List View**.
* Seat capacity progress indicators (e.g. *118 / 150 Claimed - Filling Fast*).

### 3. Comprehensive Event Detail Modal
* Full-bleed gradient header with instructor profile spotlight.
* Hour-by-hour timeline milestones and syllabus breakdown.
* Hardware Kit & Lab Infrastructure specifications (ESP32-S3 boards, high-speed camera modules, Jetson nodes).
* Prerequisites checklist and interactive FAQs accordion.
* Sticky registration action box with countdown and seat counter.

### 4. 5-Step Event Registration Wizard
* **Step 1:** Personal details (Name, KIIT Roll No, university email, phone).
* **Step 2:** Academic details (School of Computer Engineering, Year, Section).
* **Step 3:** Track specialization & official IEEE workshop T-shirt sizing.
* **Step 4:** Laptop and environment readiness confirmation + GitHub handle.
* **Step 5:** Review & Pass Generation with `canvas-confetti` celebration and immediate digital ticket creation!

### 5. Digital IEEE Attendee Pass (QR Code)
* Conference/airline-style boarding pass with notched borders.
* Scannable high-contrast QR matrix rendered directly on canvas.
* Copyable verification pass ID (e.g. `KIIT-IEEE-2026-AI99`).
* Real-time door attendance status (*Confirmed* vs. *Attended ✓*).

### 6. Student Dashboard ("My KIIT IEEE")
* Personalized greeting with dynamic student identity.
* Next workshop radar countdown (*Starts in 2 days*).
* Visual Readiness score ring (*Environment 87% Ready*).
* Filterable tabs: Active Registrations, Earned Certificates, Challenge Submissions, and Skills Matrix.
* AI recommendations tailored to student department and career goals.

### 7. Pre-Workshop Readiness ("Workshop Ready Check")
* Friendly diagnostic checklist evaluating:
  * Operating System (Windows 11 x64 validated)
  * Python 3.10+ runtime & virtual environments
  * Git CLI & GitHub authentication
  * VS Code with PlatformIO & Python extensions
  * CH340 / CP2102 serial USB drivers
  * Node.js LTS runtime
* Visual Readiness Score Gauge with smooth animated SVG progress ring.
* One-click "AI Fix Guide" with copyable PowerShell commands to resolve any warning.
* Interactive "Mark Resolved" buttons dynamically recalculate score to 100%!

### 8. AI Workshop Copilot
* Dedicated intelligent technical assistant view.
* Context switcher to tune the AI to any specific workshop curriculum.
* Pre-loaded quick prompts (*"My ESP32 is not detected in COM port"*, *"CUDA out of memory in PyTorch"*, *"Fix Git SSH on campus Wi-Fi"*).
* Token-by-token streaming response simulation.
* Markdown formatting with syntax-highlighted code blocks and 1-click **Copy Code** button.
* Expandable **Technical Reasoning & Trace** drawer.
* Optional setting to plug in a Google Gemini API key for live LLM generation, or use the built-in offline diagnostic engine!

### 9. Organizer Dashboard ("IEEE Command Center")
* 5 High-level metric KPI cards (Total Registrations, Active Events, Attendance %, Support Queue, Certificates Issued).
* Interactive **Chart.js** graphs:
  * 7-Day Registration Velocity & Growth Trend (Line chart)
  * Curriculum Domain Distribution (Doughnut chart)
* Live Participant Management Roster table with search, event filters, inline "Mark Present" check-in, and **Export CSV** action.

### 10. Create Event with AI Builder
* Natural language prompt interface: *"Create a two-day hands-on Edge AI workshop for 150 students with YOLOv11 quantization."*
* Inspiration preset chips.
* Multi-step progress generator with animated stage logs.
* Complete editable workshop plan editor: customize title, date, venue, syllabus timeline, hardware kit specs, prerequisites, and announcement copy before publishing.
* Published events immediately go live in the Discovery portal!

### 11. Volunteer Support & Bench Dispatch Queue
* Live bench troubleshooting ticket queue for Campus 15 Tech Labs.
* Prioritized cards (HIGH, MEDIUM, LOW) with bench location (e.g. *Bench B17*, *Bench C04*).
* Actions to **Claim Ticket** and **Mark Resolved** with resolution notes.
* Students can dispatch a roving lab volunteer directly to their desk via the **Request Help** modal.

### 12. QR Attendance Station
* High-tech door check-in station with sweeping laser scanner line.
* Webcam video support + rapid barcode simulation with quick test ticket pills.
* Instant verification against registered database, displaying student avatar, roll number, and timestamped attendance confirmation with audio chime.

### 13. Certificates Vault & Public Verification
* High-resolution canvas certificate generator with official gold seal, IEEE emblem, recipient name, grade, and cryptographic hash.
* **Download High-Res PNG** button for instant offline storage.
* Public verification registry: enter any credential ID (e.g. `CERT-IEEE-2026-WEB01` or `KIIT-IEEE-2026-AI99`) to cryptographically verify authentic issuance.

### 14. Challenges & Hackathons Arena
* Active coding bounties with points, deadlines, and prize tags.
* Submission modal with GitHub repository link, demo URL, and architecture summary.
* Campus Hall of Fame leaderboard tracking top student builders.

### 15. Global Command Palette (`Ctrl + K` / `Cmd + K`)
* Fast keyboard-driven command palette accessible from anywhere in the application.
* Instant fuzzy search across events, workshops, pages, and quick actions.
* Arrow keys and Enter navigation.

### 16. Notification Center
* Bell icon with unread count badge.
* Interactive drawer with actionable items (view digital pass, test environment, verify certificate).

---

## 🏛️ Codebase Architecture

```
kiit-ieee/
├── index.html                  # Single Page Application entry point
├── start.bat                   # 1-click Windows launcher
├── server.py                   # Zero-dependency local Python HTTP server
├── README.md                   # Project documentation
├── css/
│   └── styles.css              # Custom design system, gradients, glassmorphism
├── js/
│   ├── app.js                  # Master application coordinator & router
│   ├── state.js                # Centralized reactive store with localStorage persistence
│   ├── demo-data.js            # Realistic seeds for workshops, speakers, tickets, volunteers
│   ├── components/
│   │   ├── navbar.js           # Responsive navigation bar with role switcher
│   │   ├── hero.js             # 60 FPS Event Universe physics canvas
│   │   ├── command-palette.js  # Ctrl+K global search palette
│   │   ├── notifications.js    # Notifications popover dropdown
│   │   ├── registration-modal.js # 5-step registration wizard
│   │   ├── event-detail-modal.js # Detailed event syllabus & specs
│   │   ├── ticket-modal.js     # Scannable QR digital attendee pass
│   │   ├── qr-scanner-modal.js # Attendance station scanner
│   │   ├── volunteer-modal.js  # Student bench help request modal
│   │   ├── profile-modal.js    # Student profile edit modal
│   │   └── toast.js            # Micro-interaction audio-synchronized toasts
│   ├── views/
│   │   ├── home-view.js        # Homepage landing view
│   │   ├── discover-view.js    # Event discovery with multi-filter & layout modes
│   │   ├── student-dashboard.js# "My KIIT IEEE" Student Dashboard
│   │   ├── readiness-view.js   # Pre-workshop diagnostic check
│   │   ├── copilot-view.js     # AI Workshop Copilot
│   │   ├── organizer-view.js   # "IEEE Command Center" Organizer Dashboard
│   │   ├── ai-builder-view.js  # Create Event with AI Builder
│   │   ├── volunteer-view.js   # Live Volunteer Dispatch & Ticket Queue
│   │   ├── certificates-view.js# Canvas certificate viewer & public verification
│   │   ├── challenges-view.js  # Challenges & hackathons arena
│   │   └── profile-view.js     # Student Technical Portfolio
│   └── services/
│       ├── ai-service.js       # AI abstraction (Copilot, Event Generator, Gemini adapter)
│       ├── qr-service.js       # High-contrast canvas QR matrix renderer
│       ├── certificate-service.js # 1920x1080 canvas certificate generator
│       └── audio-service.js    # Web Audio API micro-interaction synthesizer
```

---

## 🛡️ Security & Privacy
* Local browser sandbox architecture with persistent `localStorage`.
* No hardcoded API keys in client bundles.
* Optional user-supplied Gemini API key stored securely in client-side storage only.
* Role-based access control toggle for easy demonstration and reviewer audit.

---

## 🎓 About KIIT IEEE Student Branch
The **KIIT IEEE Student Branch** is one of the most vibrant student technology branches in Region 10 (Asia-Pacific), empowering undergraduate engineers across Computer Science, Electronics, Robotics, and Mechanical Engineering to design and build frontier technology.

**"Where Students Build What's Next."**

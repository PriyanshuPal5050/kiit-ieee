/**
 * KIIT IEEE Platform - Master Production-Grade Data Store
 * "Where Students Build What's Next."
 * Verified institutional data, multi-event lifecycle, telemetry, teams, missions & showcase.
 */

export const INITIAL_EVENTS = [
  {
    id: "evt-ai-cv-2026",
    title: "AI & Edge Computer Vision Masterclass",
    tagline: "Build real-time object tracking and neural perception models on resource-constrained edge devices.",
    category: "AI & Machine Learning",
    format: "Offline",
    difficulty: "Intermediate",
    price: 0,
    priceLabel: "Free (IEEE Sponsored)",
    date: "Oct 10 - 11, 2026",
    time: "09:30 AM - 05:00 PM IST",
    venue: "Campus 15, Tech Lab 4, KIIT University",
    bannerGradient: "from-indigo-600 via-purple-600 to-pink-600",
    badgeColor: "badge-ai",
    featured: true,
    status: "LIVE", // "OPEN" | "ALMOST FULL" | "LIVE" | "COMPLETED"
    speaker: {
      name: "Dr. Priyadarshi Sen",
      role: "Principal AI Scientist & IEEE Senior Member",
      org: "NeuralTech Labs / Ex-Intel AI",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      bio: "12+ years experience deploying embedded computer vision and deep neural network accelerators."
    },
    seatsTotal: 150,
    seatsFilled: 118,
    eligibility: "Open to 2nd, 3rd & 4th Year B.Tech students (All branches)",
    currentSession: {
      title: "Lab 2: Quantization & TensorRT Deployment on Edge Jetson Nodes",
      instructor: "Dr. Priyadarshi Sen",
      timeRemaining: "42 mins",
      progress: 68,
      room: "Tech Lab 4, Campus 15",
      announcement: "Ensure your INT8 calibrated weights are transferred to the bench Jetson node before 3:30 PM."
    },
    schedule: [
      { time: "Day 1 - 09:30 AM", title: "Keynote: From PyTorch to Silicon - Edge Vision Architecture", status: "Completed" },
      { time: "Day 1 - 11:30 AM", title: "Hands-on Lab 1: OpenCV 5 & YOLOv11 Quantization", status: "Completed" },
      { time: "Day 1 - 02:30 PM", title: "Hands-on Lab 2: TensorRT Deployment on Edge Jetson Nodes", status: "In Progress" },
      { time: "Day 2 - 10:00 AM", title: "Capstone Challenge: Real-Time Traffic & Gesture Recognition", status: "Upcoming" },
      { time: "Day 2 - 04:00 PM", title: "Code Review, Model Benchmarking & IEEE Certification", status: "Upcoming" }
    ],
    prerequisites: [
      "Familiarity with Python 3.9+",
      "Basic understanding of convolutional neural networks",
      "Laptop with minimum 8GB RAM and USB-C port"
    ],
    requiredSoftware: [
      "Python 3.10+ with PyTorch 2.3",
      "CUDA Toolkit 12.x (or CPU fallback env)",
      "VS Code with Python and Remote-SSH extensions",
      "OpenCV 4.9.0+"
    ],
    requiredHardware: [
      "Sony IMX219 High-Speed USB Camera (Provided at Lab Bench)",
      "Jetson Orin Nano Edge Compute Node (Provided per Team Bench)",
      "Student Laptop with Charger"
    ],
    whatYouWillBuild: [
      "A real-time edge vehicle speed & license tracker running at 45 FPS",
      "Quantized INT8 YOLOv11 pipeline optimized for Jetson TensorRT",
      "Custom IEEE portfolio project ready for GitHub & resume"
    ],
    hardwareKit: "High-speed USB camera modules and Jetson Orin Nano nodes provided per bench in Campus 15 Tech Lab 4.",
    faqs: [
      { q: "Is prior deep learning experience strictly required?", a: "Basic Python syntax is required. We cover neural network quantization and edge runtime from foundational concepts." },
      { q: "Will certificates be provided?", a: "Yes, verified IEEE Student Branch credentials with unique cryptographic IDs will be issued upon completing the capstone." }
    ],
    tags: ["PyTorch", "YOLOv11", "OpenCV", "TensorRT", "Edge AI"]
  },
  {
    id: "evt-robotics-esp32-2026",
    title: "Autonomous Robotics & ESP32-S3 IoT Lab",
    tagline: "Design, wire, program, and pilot a dual-core obstacle-avoiding autonomous rover from scratch.",
    category: "Robotics & IoT",
    format: "Offline",
    difficulty: "Beginner to Intermediate",
    price: 0,
    priceLabel: "Free (Hardware Provided)",
    date: "Oct 18 - 19, 2026",
    time: "10:00 AM - 04:30 PM IST",
    venue: "School of Mechanical & Electrical Lab, Campus 3",
    bannerGradient: "from-cyan-600 via-teal-600 to-emerald-600",
    badgeColor: "badge-robotics",
    featured: true,
    status: "ALMOST FULL",
    speaker: {
      name: "Er. Tanmay Mohanty",
      role: "Lead Embedded Systems Architect",
      org: "AeroBotix Systems (IEEE Young Professional)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      bio: "Robotics mentor specializing in FreeRTOS, ROS2 micro-nodes, and motor driver circuit design."
    },
    seatsTotal: 100,
    seatsFilled: 94,
    eligibility: "Open to all KIIT students with an interest in robotics and microcontrollers.",
    schedule: [
      { time: "Day 1 - 10:00 AM", title: "ESP32-S3 Architecture, Pinout & FreeRTOS Multi-Tasking" },
      { time: "Day 1 - 01:30 PM", title: "Motor Driver (L298N) Interfacing & PWM Velocity Control" },
      { time: "Day 1 - 03:30 PM", title: "Ultrasonic & LiDAR Sensor Integration" },
      { time: "Day 2 - 10:30 AM", title: "Autonomous Pathfinding Algorithm & PID Tuning" },
      { time: "Day 2 - 02:30 PM", title: "Arena Grand Prix: Obstacle Maze Time-Trial" }
    ],
    prerequisites: [
      "Basic C/C++ knowledge",
      "Arduino IDE 2.x or VS Code with PlatformIO pre-installed",
      "CH340/CP2102 USB serial drivers installed"
    ],
    requiredSoftware: [
      "VS Code with PlatformIO IDE",
      "CH340/CP2102 USB Drivers",
      "Serial Terminal (PuTTY / Arduino Serial Monitor)"
    ],
    requiredHardware: [
      "ESP32-S3 DevKitC (Provided)",
      "4WD Chassis with TT Gear Motors & L298N Driver (Provided)",
      "18650 Li-ion 7.4V Battery Pack & Charger (Provided)"
    ],
    whatYouWillBuild: [
      "An autonomous 4WD rover with adaptive PID velocity control",
      "Real-time WebSocket telemetry dashboard hosted directly on ESP32",
      "A physical hardware artifact tested in the live obstacle arena"
    ],
    hardwareKit: "Complete hardware kit: ESP32-S3 board, 4WD chassis, L298N driver, ultrasonic sensors, 18650 Li-ion battery pack and jumper wires provided.",
    faqs: [
      { q: "Can we take the rover home?", a: "Winning teams keep their complete custom robot kit; all participants retain the custom code and sensor libraries." }
    ],
    tags: ["ESP32", "FreeRTOS", "Robotics", "IoT", "C++", "Sensors"]
  },
  {
    id: "evt-megahack-2026",
    title: "KIIT IEEE MegaHack 2026: Campus Innovation Sprint",
    tagline: "36 hours of non-stop building, coffee, mentorship, and ₹1,00,000+ in bounties.",
    category: "Hackathons",
    format: "Hybrid",
    difficulty: "All Levels",
    price: 0,
    priceLabel: "Free with Food & Swag",
    date: "Nov 06 - 08, 2026",
    time: "06:00 PM (Fri) - 10:00 AM (Sun)",
    venue: "Campus 6 Auditorium & Virtual Discord",
    bannerGradient: "from-rose-600 via-orange-600 to-amber-600",
    badgeColor: "badge-hackathon",
    featured: true,
    status: "OPEN",
    speaker: {
      name: "IEEE Student Branch Council",
      role: "Organizing Committee",
      org: "KIIT IEEE & Industry Partners",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
      bio: "Annual flagship hackathon welcoming 500+ builders across Web, Mobile, AI, and Hardware."
    },
    seatsTotal: 400,
    seatsFilled: 342,
    eligibility: "Teams of 2 to 4 students from any semester or department.",
    schedule: [
      { time: "Friday - 06:00 PM", title: "Opening Ceremony, Problem Statements Release & Team Check-in" },
      { time: "Friday - 08:00 PM", title: "Hacking Begins + Midnight Pizza & RedBull" },
      { time: "Saturday - 11:00 AM", title: "Mentor Checkpoint 1: Architecture & Feasibility" },
      { time: "Saturday - 08:00 PM", title: "Mentor Checkpoint 2: Prototype & API Validation" },
      { time: "Sunday - 08:00 AM", title: "Hacking Stops & Project Portal Submission Closes" },
      { time: "Sunday - 10:00 AM", title: "Top 10 Demo Day Pitch & Grand Finale Awards" }
    ],
    prerequisites: [
      "GitHub account",
      "Working laptop",
      "Enthusiasm to solve real university & societal problems"
    ],
    whatYouWillBuild: [
      "A complete functional prototype in AI, Smart Campus, FinTech, or Sustainability",
      "Pitch deck and live product demonstration for senior judges"
    ],
    hardwareKit: "Hardware lab access, 3D printers, soldering stations, and cloud compute credits (AWS/GCP) provided to all teams.",
    faqs: [
      { q: "Can I participate if I don't have a team yet?", a: "Yes! Use our integrated Team Finder or join the mixer during opening hours." }
    ],
    tags: ["Hackathon", "₹100k Prize", "AI", "Cloud", "Hardware", "Startup"]
  },
  {
    id: "evt-web3-cloud-2026",
    title: "Next.js 15 & Autonomous AI Agent Systems",
    tagline: "Modern full-stack engineering: server actions, streaming UI, vector stores, and LangChain agents.",
    category: "Web & Cloud",
    format: "Online",
    difficulty: "Intermediate",
    price: 0,
    priceLabel: "Free",
    date: "Oct 24, 2026",
    time: "02:00 PM - 06:30 PM IST",
    venue: "Google Meet & Live Interactive Sandbox",
    bannerGradient: "from-blue-600 via-indigo-600 to-violet-700",
    badgeColor: "badge-web3",
    featured: false,
    status: "OPEN",
    speaker: {
      name: "Saurabh Nayak",
      role: "Staff Engineer & Open Source Maintainer",
      org: "Vercel Community Leader",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      bio: "Built scalable web platforms serving millions of requests; specializes in TypeScript and LLM application stacks."
    },
    seatsTotal: 250,
    seatsFilled: 180,
    eligibility: "Any student with basic HTML/CSS/JavaScript experience.",
    schedule: [
      { time: "02:00 PM", title: "Next.js 15 App Router Deep-Dive: Server Components & Actions" },
      { time: "03:15 PM", title: "RAG Architecture: Embeddings, pgvector, and Hybrid Retrieval" },
      { time: "04:30 PM", title: "Multi-Agent Coordination: Building an Autonomous Researcher" },
      { time: "06:00 PM", title: "Deploying to Vercel & Production Observability" }
    ],
    prerequisites: ["Modern JavaScript/TypeScript basics", "Node.js 20+ installed"],
    whatYouWillBuild: [
      "A production-grade AI documentation analyst with live streaming answers",
      "Deployed full-stack app on Vercel with serverless database"
    ],
    hardwareKit: "No physical kit needed; cloud database and API keys provided for workshop duration.",
    faqs: [
      { q: "Will the session be recorded?", a: "Yes, registered students receive immediate lifetime access to the recorded livestream." }
    ],
    tags: ["Next.js 15", "TypeScript", "Tailwind", "AI Agents", "Vercel"]
  },
  {
    id: "evt-cyber-redteam-2026",
    title: "Cybersecurity Red Team Defense & CTF Lab",
    tagline: "Master ethical penetration testing, binary analysis, and real-time defense against zero-day exploits.",
    category: "Cybersecurity",
    format: "Offline",
    difficulty: "Advanced",
    price: 0,
    priceLabel: "Free",
    date: "Nov 14, 2026",
    time: "10:00 AM - 05:00 PM IST",
    venue: "Cyber Defense Center, Campus 17, KIIT",
    bannerGradient: "from-red-600 via-rose-700 to-zinc-900",
    badgeColor: "badge-hackathon",
    featured: false,
    status: "ALMOST FULL",
    speaker: {
      name: "Capt. Arvind Verma",
      role: "Offensive Security Certified Expert (OSCE)",
      org: "IEEE Computer Society Cyber Group",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
      bio: "Bug bounty hunter in Top 50 global rankings; conducted corporate red team audits across Fortune 500 banks."
    },
    seatsTotal: 80,
    seatsFilled: 78,
    eligibility: "Prior exposure to Linux command line and networking fundamentals.",
    schedule: [
      { time: "10:00 AM", title: "Reconnaissance & Network Mapping with Nmap & Wireshark" },
      { time: "12:00 PM", title: "Web Vulnerabilities: SQLi, SSRF, and JWT Broken Authentication" },
      { time: "02:00 PM", title: "Privilege Escalation in Linux & Active Directory Environments" },
      { time: "03:30 PM", title: "Live Capture-the-Flag (CTF) Attack/Defense Tournament" }
    ],
    prerequisites: ["Linux CLI proficiency", "VirtualBox / VMware with Kali Linux VM installed"],
    whatYouWillBuild: [
      "Automated vulnerability scanner script in Python",
      "Secured hardened Linux server instance"
    ],
    hardwareKit: "Isolated sandbox Wi-Fi network and target CTF server VMs deployed in the campus lab.",
    faqs: [
      { q: "Is this legal and safe?", a: "All exercises are conducted strictly inside an isolated university cyber range governed by IEEE code of conduct." }
    ],
    tags: ["Security", "CTF", "Ethical Hacking", "Kali Linux", "Wireshark"]
  },
  {
    id: "evt-embedded-rtos-2026",
    title: "Bare-Metal Embedded Systems & FreeRTOS Lab",
    tagline: "Program ARM Cortex-M microcontrollers without high-level abstraction layers.",
    category: "Embedded Systems",
    format: "Offline",
    difficulty: "Intermediate",
    price: 0,
    priceLabel: "Free",
    date: "Nov 21 - 22, 2026",
    time: "09:30 AM - 04:30 PM IST",
    venue: "Microprocessor Lab, School of Electronics",
    bannerGradient: "from-teal-600 via-cyan-700 to-blue-800",
    badgeColor: "badge-robotics",
    featured: false,
    status: "OPEN",
    speaker: {
      name: "Prof. Rajesh Mohapatra",
      role: "IEEE Senior Member & Embedded Researcher",
      org: "KIIT School of Electronics Engineering",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
      bio: "20+ research papers published in IEEE Transactions on Industrial Informatics."
    },
    seatsTotal: 60,
    seatsFilled: 41,
    eligibility: "ECE, ETC, CSE, and EE undergraduate students.",
    schedule: [
      { time: "Day 1 - 09:30 AM", title: "ARM Cortex-M4 Architecture & Memory Mapping" },
      { time: "Day 1 - 01:30 PM", title: "Bare-metal Register Programming (GPIO, Timers, DMA)" },
      { time: "Day 2 - 10:00 AM", title: "FreeRTOS Kernel: Semaphores, Queues & Task Scheduling" },
      { time: "Day 2 - 02:00 PM", title: "Building a Fault-Tolerant Flight Controller Telemetry Loop" }
    ],
    prerequisites: ["Strong C language knowledge", "Keil µVision or STM32CubeIDE"],
    whatYouWillBuild: [
      "Bare-metal UART/DMA interrupt driver",
      "Multi-threaded RTOS task manager with priority inversion protection"
    ],
    hardwareKit: "STM32F4 Discovery development boards and logic analyzers supplied at lab benches.",
    faqs: [
      { q: "Do I need to buy hardware?", a: "No, all boards and oscilloscopes are provided during lab hours." }
    ],
    tags: ["STM32", "ARM", "FreeRTOS", "Embedded C", "Hardware"]
  }
];

export const INITIAL_USER = {
  id: "usr-aryan-22051842",
  name: "Aryan Mohapatra",
  rollNo: "22051842",
  email: "22051842@kiit.ac.in",
  phone: "+91 98765 43210",
  branch: "Computer Science & Engineering",
  year: "3rd Year",
  section: "CSE-14",
  role: "student", // "student" | "organizer" | "volunteer" | "admin"
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
  github: "https://github.com/aryan-kiit",
  linkedin: "https://linkedin.com/in/aryan-kiit-ieee",
  readinessScore: 87,
  
  // Progression System
  level: 7,
  levelTitle: "Innovator",
  currentXp: 1240,
  nextLevelXp: 1500,
  streakDays: 4,
  teamId: "team-nova",
  teamRole: "Lead AI Engineer",
  
  // XP Transaction Log
  xpHistory: [
    { id: "xp-1", reason: "Completed Edge AI Lab 1 (OpenCV + YOLO Quantization)", amount: 150, date: "Today" },
    { id: "xp-2", reason: "4-Day Technical Builder Streak Maintained", amount: 50, date: "Today" },
    { id: "xp-3", reason: "Submitted Challenge #01 (Lane Detection)", amount: 350, date: "Yesterday" },
    { id: "xp-4", reason: "Full-Stack AI Bootcamp Project & Certification", amount: 450, date: "Sep 15, 2026" },
    { id: "xp-5", reason: "Environment Setup Verification (CUDA & PlatformIO)", amount: 100, date: "Sep 12, 2026" },
    { id: "xp-6", reason: "Community Build Showcase Upvote Bounties", amount: 140, date: "Sep 08, 2026" }
  ],

  // Skill Passport (Self-Declared vs Verified)
  skills: [
    { name: "Python", score: 82, type: "verified", source: "AI Edge Workshop Lab 1" },
    { name: "AI / Machine Learning", score: 67, type: "verified", source: "YOLO Quantization Evaluation" },
    { name: "Web Development", score: 78, type: "verified", source: "Full-Stack Bootcamp Credential" },
    { name: "Robotics & FreeRTOS", score: 63, type: "verified", source: "ESP32 Autonomous Rover Lab" },
    { name: "Git / GitHub", score: 74, type: "verified", source: "Repository Commit Verification" },
    { name: "IoT & Embedded C", score: 51, type: "self-declared", source: "Student Profile Declaration" },
    { name: "Linux CLI & Bash", score: 70, type: "self-declared", source: "Student Profile Declaration" }
  ],

  // Digital Event Passport
  passportEntries: [
    {
      year: "2026",
      eventName: "AI & Edge Computer Vision Masterclass",
      venue: "Campus 15, Tech Lab 4",
      checkInTime: "Oct 10, 09:42 AM",
      status: "In Progress (Live)",
      milestones: [
        { name: "Check-in Verified", completed: true },
        { name: "Environment Setup Ready", completed: true },
        { name: "Lab 1 (Quantization)", completed: true },
        { name: "Lab 2 (TensorRT Node)", completed: false },
        { name: "Capstone Evaluation", completed: false }
      ],
      badge: "AI Innovator Candidate"
    },
    {
      year: "2026",
      eventName: "Full-Stack AI & Cloud Systems Bootcamp",
      venue: "Online Interactive Sandbox",
      checkInTime: "Sep 15, 02:00 PM",
      status: "Completed ✓",
      milestones: [
        { name: "Check-in Verified", completed: true },
        { name: "Server Actions Lab", completed: true },
        { name: "LangChain Agent Capstone", completed: true },
        { name: "Certificate Earned", completed: true }
      ],
      badge: "🏆 Certified AI Full-Stack Developer"
    }
  ]
};

export const INITIAL_REGISTRATIONS = [
  {
    ticketId: "KIIT-IEEE-2026-AI99",
    eventId: "evt-ai-cv-2026",
    eventName: "AI & Edge Computer Vision Masterclass",
    studentName: "Aryan Mohapatra",
    rollNo: "22051842",
    email: "22051842@kiit.ac.in",
    branch: "Computer Science & Engineering",
    year: "3rd Year",
    registeredAt: "2026-09-24T10:15:00Z",
    status: "Confirmed",
    attended: true,
    attendedAt: "2026-10-10T09:42:00Z",
    bench: "Bench B17",
    team: "Team Nova",
    prepScore: 87,
    workshopProgress: 72,
    challengesSolved: "1 / 2",
    projectSubmitted: false,
    certificateEligible: true,
    track: "Computer Vision & Edge Perception",
    tshirtSize: "L",
    qrData: "KIIT-IEEE-PASS:KIIT-IEEE-2026-AI99:evt-ai-cv-2026:22051842"
  },
  {
    ticketId: "KIIT-IEEE-2026-AI102",
    eventId: "evt-ai-cv-2026",
    eventName: "AI & Edge Computer Vision Masterclass",
    studentName: "Aarav Sharma",
    rollNo: "22050912",
    email: "22050912@kiit.ac.in",
    branch: "Computer Science & Engineering",
    year: "3rd Year",
    registeredAt: "2026-09-24T11:00:00Z",
    status: "Confirmed",
    attended: true,
    attendedAt: "2026-10-10T10:02:00Z",
    bench: "Bench B18",
    team: "Team Nova",
    prepScore: 100,
    workshopProgress: 92,
    challengesSolved: "3 / 4",
    projectSubmitted: true,
    certificateEligible: true,
    track: "Edge AI Quantization",
    tshirtSize: "M",
    qrData: "KIIT-IEEE-PASS:KIIT-IEEE-2026-AI102:evt-ai-cv-2026:22050912"
  },
  {
    ticketId: "KIIT-IEEE-2026-AI103",
    eventId: "evt-ai-cv-2026",
    eventName: "AI & Edge Computer Vision Masterclass",
    studentName: "Riya Sengupta",
    rollNo: "23051410",
    email: "23051410@kiit.ac.in",
    branch: "Information Technology",
    year: "2nd Year",
    registeredAt: "2026-09-24T11:30:00Z",
    status: "Confirmed",
    attended: true,
    attendedAt: "2026-10-10T09:55:00Z",
    bench: "Bench C04",
    team: "Team Alpha",
    prepScore: 90,
    workshopProgress: 74,
    challengesSolved: "2 / 4",
    projectSubmitted: false,
    certificateEligible: true,
    track: "Edge AI Quantization",
    tshirtSize: "S",
    qrData: "KIIT-IEEE-PASS:KIIT-IEEE-2026-AI103:evt-ai-cv-2026:23051410"
  },
  {
    ticketId: "KIIT-IEEE-2026-AI104",
    eventId: "evt-ai-cv-2026",
    eventName: "AI & Edge Computer Vision Masterclass",
    studentName: "Kabir Joshi",
    rollNo: "22051980",
    email: "22051980@kiit.ac.in",
    branch: "Electronics & Telecomm",
    year: "3rd Year",
    registeredAt: "2026-09-24T12:00:00Z",
    status: "Confirmed",
    attended: false,
    bench: "Bench B17",
    team: "Team Nova",
    prepScore: 40,
    workshopProgress: 0,
    challengesSolved: "0 / 4",
    projectSubmitted: false,
    certificateEligible: false,
    track: "Hardware Embedded",
    tshirtSize: "XL",
    qrData: "KIIT-IEEE-PASS:KIIT-IEEE-2026-AI104:evt-ai-cv-2026:22051980"
  },
  {
    ticketId: "KIIT-IEEE-2026-AI105",
    eventId: "evt-ai-cv-2026",
    eventName: "AI & Edge Computer Vision Masterclass",
    studentName: "Ananya Tripathy",
    rollNo: "22052104",
    email: "22052104@kiit.ac.in",
    branch: "Computer Science & Engineering",
    year: "3rd Year",
    registeredAt: "2026-09-24T12:20:00Z",
    status: "Confirmed",
    attended: true,
    attendedAt: "2026-10-10T09:30:00Z",
    bench: "Bench A02",
    team: "Team Byte",
    prepScore: 95,
    workshopProgress: 88,
    challengesSolved: "3 / 4",
    projectSubmitted: true,
    certificateEligible: true,
    track: "Edge AI Quantization",
    tshirtSize: "M",
    qrData: "KIIT-IEEE-PASS:KIIT-IEEE-2026-AI105:evt-ai-cv-2026:22052104"
  }
];

export const INITIAL_TEAMS = [
  {
    id: "team-nova",
    name: "Team Nova",
    event: "AI & Edge Computer Vision Masterclass",
    bench: "Bench B17 - Campus 15",
    status: "Active Building",
    projectIdea: "Autonomous Edge Speed Radar & License OCR Node",
    members: [
      { name: "Aryan Mohapatra", rollNo: "22051842", role: "AI / TensorRT Architect", lead: true },
      { name: "Aarav Sharma", rollNo: "22050912", role: "PyTorch & OpenCV Lead", lead: false },
      { name: "Kabir Joshi", rollNo: "22051980", role: "Hardware & Jetson Flasher", lead: false }
    ],
    lookingFor: "Frontend / Streamlit UI Developer",
    skills: ["PyTorch", "TensorRT", "C++", "Jetson Orin Nano"],
    missingSkills: ["Frontend UI / Dashboard"],
    submissions: 1
  },
  {
    id: "team-alpha",
    name: "Team Alpha",
    event: "AI & Edge Computer Vision Masterclass",
    bench: "Bench C04 - Campus 15",
    status: "Active Building",
    projectIdea: "Real-time Defect Detection for Automated Manufacturing",
    members: [
      { name: "Riya Sengupta", rollNo: "23051410", role: "Data Pipeline & Dataset Lead", lead: true },
      { name: "Soumyadeep Das", rollNo: "22053120", role: "Model Optimization", lead: false }
    ],
    lookingFor: "Embedded Systems & Camera Sensor Specialist",
    skills: ["Python", "YOLOv11", "Data Augmentation"],
    missingSkills: ["C++ Embedded Firmware"],
    submissions: 1
  },
  {
    id: "team-byte",
    name: "Team Byte",
    event: "Autonomous Robotics & ESP32-S3 IoT Lab",
    bench: "Bench A02 - Campus 3",
    status: "Ready for Arena",
    projectIdea: "PID Micro-Maze Solver with WebSocket Telemetry",
    members: [
      { name: "Ananya Tripathy", rollNo: "22052104", role: "FreeRTOS Kernel Architect", lead: true },
      { name: "Rohan Verma", rollNo: "22051189", role: "Motor Driver & Sensor Wiring", lead: false },
      { name: "Tanvi Patnaik", rollNo: "23050091", role: "Pathfinding Algorithm Lead", lead: false }
    ],
    lookingFor: "Full Team (Closed)",
    skills: ["ESP32-S3", "FreeRTOS", "PID Control", "PlatformIO"],
    missingSkills: [],
    submissions: 2
  },
  {
    id: "team-cyberops",
    name: "Team CyberOps",
    event: "Cybersecurity Red Team Defense & CTF Lab",
    bench: "Campus 17 Cyber Center",
    status: "Recruiting",
    projectIdea: "Automated Zero-Day Exploit Detection Harness",
    members: [
      { name: "Aditya Mishra", rollNo: "22050412", role: "Red Team Specialist", lead: true }
    ],
    lookingFor: "Reverse Engineering & Binary Analysis Expert",
    skills: ["Kali Linux", "Wireshark", "Bash Scripting"],
    missingSkills: ["Ghidra / Binary Exploitation"],
    submissions: 0
  }
];

export const INITIAL_SHOWCASE = [
  {
    id: "proj-1",
    title: "EdgeVision: Jetson INT8 Speed Radar",
    author: "Aryan Mohapatra & Team Nova",
    authorRoll: "22051842",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    event: "AI & Edge Computer Vision Masterclass",
    description: "Real-time edge vehicle speed & license plate OCR tracking pipeline operating at 45 FPS using TensorRT on Jetson Orin Nano nodes.",
    techStack: ["PyTorch", "TensorRT", "YOLOv11", "OpenCV", "Jetson"],
    githubUrl: "https://github.com/aryan-kiit/edgevision-speed-radar",
    demoUrl: "https://edgevision-demo.kiit-ieee.org",
    upvotes: 48,
    commentsCount: 12,
    badge: "Staff Favorite",
    createdAt: "2 days ago"
  },
  {
    id: "proj-2",
    title: "ESP32-S3 Autonomous Maze Runner Rover",
    author: "Team Byte (Ananya, Rohan, Tanvi)",
    authorRoll: "22052104",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    event: "Autonomous Robotics & ESP32-S3 IoT Lab",
    description: "Dual-core FreeRTOS autonomous rover equipped with VL53L0X LiDAR time-of-flight sensors and adaptive PID motor velocity calibration.",
    techStack: ["ESP32-S3", "FreeRTOS", "C++", "PID Control", "LiDAR"],
    githubUrl: "https://github.com/kiit-ieee/esp32-maze-runner",
    demoUrl: "https://rover-telemetry.kiit-ieee.org",
    upvotes: 62,
    commentsCount: 19,
    badge: "Hardware Pioneer",
    createdAt: "4 days ago"
  },
  {
    id: "proj-3",
    title: "AgenticDoc: Multi-Agent KIIT Syllabus Copilot",
    author: "Saurabh Nayak & Aryan Mohapatra",
    authorRoll: "22051842",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    event: "Next.js 15 & Autonomous AI Agent Systems",
    description: "Streaming RAG platform powered by pgvector and Next.js 15 Server Actions, indexing 400+ KIIT course syllabi and lab manuals.",
    techStack: ["Next.js 15", "LangChain", "pgvector", "TypeScript", "Tailwind"],
    githubUrl: "https://github.com/aryan-kiit/kiit-syllabus-agent",
    demoUrl: "https://syllabus-agent.kiit-ieee.org",
    upvotes: 39,
    commentsCount: 8,
    badge: "Web Innovation",
    createdAt: "1 week ago"
  },
  {
    id: "proj-4",
    title: "ZeroDay CTF Auto-Scanner & Hardener",
    author: "Aditya Mishra",
    authorRoll: "22050412",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    event: "Cybersecurity Red Team Defense & CTF Lab",
    description: "Automated vulnerability scanner for campus networks that detects open JWT exploits, SSRF vectors, and outputs remediation scripts.",
    techStack: ["Python", "Nmap", "Wireshark", "Bash", "Linux"],
    githubUrl: "https://github.com/aditya-kiit/ctf-scanner-hardener",
    demoUrl: "https://cyberdefense.kiit-ieee.org",
    upvotes: 27,
    commentsCount: 5,
    badge: "Cyber Defender",
    createdAt: "2 weeks ago"
  }
];

export const INITIAL_HARDWARE = [
  { id: "HW-JET-01", name: "Jetson Orin Nano 8GB Kit", category: "Edge AI", bench: "Bench B17", assignedTeam: "Team Nova", status: "In Use", condition: "Good" },
  { id: "HW-JET-02", name: "Jetson Orin Nano 8GB Kit", category: "Edge AI", bench: "Bench B18", assignedTeam: "Team Nova", status: "In Use", condition: "Good" },
  { id: "HW-JET-03", name: "Jetson Orin Nano 8GB Kit", category: "Edge AI", bench: "Bench C04", assignedTeam: "Team Alpha", status: "In Use", condition: "Good" },
  { id: "HW-JET-04", name: "Jetson Orin Nano 8GB Kit", category: "Edge AI", bench: "Tech Desk", assignedTeam: "Unassigned", status: "Available", condition: "Tested" },
  { id: "HW-CAM-01", name: "Sony IMX219 High-Speed Camera", category: "Peripherals", bench: "Bench B17", assignedTeam: "Team Nova", status: "In Use", condition: "Good" },
  { id: "HW-CAM-02", name: "Sony IMX219 High-Speed Camera", category: "Peripherals", bench: "Bench C04", assignedTeam: "Team Alpha", status: "In Use", condition: "Good" },
  { id: "HW-ESP-01", name: "ESP32-S3 4WD Autonomous Kit", category: "Robotics", bench: "Bench A02", assignedTeam: "Team Byte", status: "In Use", condition: "Good" },
  { id: "HW-ESP-02", name: "ESP32-S3 4WD Autonomous Kit", category: "Robotics", bench: "Bench A03", assignedTeam: "Unassigned", status: "Available", condition: "Charged" },
  { id: "HW-LOG-01", name: "Saleae 8-Channel Logic Analyzer", category: "Instruments", bench: "Lab Desk", assignedTeam: "Unassigned", status: "Available", condition: "Calibrated" }
];

export const INITIAL_VOLUNTEERS = [
  { id: "vol-1", name: "Devika Sharma", role: "Core Lab Volunteer", zone: "Zone B (B10 - B20)", status: "Available", activeTickets: 0, resolvedTickets: 8 },
  { id: "vol-2", name: "Rahul Verma", role: "Bench Dispatch Volunteer", zone: "Zone B (B10 - B20)", status: "Helping B17", activeTickets: 1, resolvedTickets: 5 },
  { id: "vol-3", name: "Ananya Tripathy", role: "Tech Lead Volunteer", zone: "Zone C (C01 - C15)", status: "Available", activeTickets: 0, resolvedTickets: 11 },
  { id: "vol-4", name: "Kabir Joshi", role: "Hardware Inventory Lead", zone: "Equipment Desk", status: "Offline", activeTickets: 0, resolvedTickets: 4 }
];

export const INITIAL_MISSIONS = [
  {
    id: "mis-ai-builder",
    title: "AI Vision Builder Mission",
    badge: "AI Master",
    rewardXp: 500,
    steps: [
      { id: "s1", title: "Attend AI & Edge Computer Vision Masterclass", completed: true },
      { id: "s2", title: "Run Environment Ready Check (Python 3.10 + PyTorch)", completed: true },
      { id: "s3", title: "Complete Hands-on Lab 1: INT8 YOLO Quantization", completed: true },
      { id: "s4", title: "Solve Edge Vision Road Lane Detection Challenge", completed: true },
      { id: "s5", title: "Submit Capstone Project to Community Showcase", completed: false }
    ]
  },
  {
    id: "mis-robotics-pioneer",
    title: "Autonomous Robotics Pioneer",
    badge: "Hardware Hacker",
    rewardXp: 450,
    steps: [
      { id: "r1", title: "Attend ESP32-S3 Autonomous Rover Lab", completed: false },
      { id: "r2", title: "Flash Dual-Core FreeRTOS Motor Controller Firmware", completed: false },
      { id: "r3", title: "Calibrate PID Obstacle Avoidance Loop", completed: false },
      { id: "r4", title: "Complete Obstacle Arena Grand Prix Under 45s", completed: false }
    ]
  },
  {
    id: "mis-fullstack-agent",
    title: "Fullstack Agentic Architect",
    badge: "Cloud Master",
    rewardXp: 400,
    steps: [
      { id: "f1", title: "Complete Next.js 15 & Autonomous AI Agent Systems", completed: true },
      { id: "f2", title: "Setup pgvector Vector Database with Hybrid Retrieval", completed: true },
      { id: "f3", title: "Deploy Production Multi-Agent Pipeline to Vercel", completed: true },
      { id: "f4", title: "Publish Open-Source Repository to GitHub", completed: true }
    ]
  }
];

export const INITIAL_ACHIEVEMENTS = [
  { id: "ach-1", title: "AI Explorer", desc: "Trained or quantized your first deep learning model in an IEEE Lab.", icon: "🧠", earned: true, date: "Sep 2026" },
  { id: "ach-2", title: "Robotics Builder", desc: "Programmed motor drivers and telemetry on physical hardware.", icon: "🤖", earned: true, date: "Sep 2026" },
  { id: "ach-3", title: "Code Warrior", desc: "Maintained a 4-day technical builder streak on KIIT IEEE.", icon: "⚡", earned: true, date: "Today" },
  { id: "ach-4", title: "Hackathon Finisher", desc: "Submitted an end-to-end working prototype in a 36-hour sprint.", icon: "🚀", earned: false, criteria: "Submit MegaHack 2026 Project" },
  { id: "ach-5", title: "Hardware Hacker", desc: "Configured serial baud rates and flashed bare-metal firmware.", icon: "🔌", earned: true, date: "Aug 2026" },
  { id: "ach-6", title: "Challenge Master", desc: "Scored in the top 10% of any active Technical Arena challenge.", icon: "🎯", earned: true, date: "Sep 2026" },
  { id: "ach-7", title: "Project Builder", desc: "Published a project that received 25+ community upvotes.", icon: "🌟", earned: true, date: "Yesterday" },
  { id: "ach-8", title: "Research Explorer", desc: "Drafted an IEEE standard technical paper or capstone report.", icon: "📚", earned: false, criteria: "Submit research capstone" },
  { id: "ach-9", title: "Team Player", desc: "Collaborated in an inter-disciplinary student engineering team.", icon: "🤝", earned: true, date: "Sep 2026" },
  { id: "ach-10", title: "Technical Leader", desc: "Assisted fellow students as a certified roving bench volunteer.", icon: "👑", earned: false, criteria: "Resolve 5 volunteer tickets" }
];

export const INSTITUTIONAL_DATA = {
  institutionName: "Kalinga Institute of Industrial Technology (KIIT) Deemed to be University",
  location: "Bhubaneswar, Odisha, India",
  tagline: "Where Students Build What's Next.",
  foundedYear: 1992,
  founder: {
    name: "Dr. Achyuta Samanta",
    title: "Eminent Educationist, Humanitarian & Founder of KIIT & KISS",
    avatar: "assets/dr-achyuta-samanta.png",
    quote: "Education is the third eye of a child. It empowers, enlightens, and uplifts human dignity. At KIIT, we build not just careers, but compassionate technical innovators.",
    bio: "Starting from humble beginnings with just ₹5,000 in 1992, Dr. Achyuta Samanta created KIIT and KISS (Kalinga Institute of Social Sciences) — the world's largest residential educational institute for 30,000+ indigenous tribal children providing free education from kindergarten to post-graduation.",
    philosophy: "The Art of Giving — Selfless service, empathy, and technological empowerment for societal advancement."
  },
  ieeeBranch: {
    name: "KIIT IEEE Student Branch",
    charterYear: 2004,
    code: "STB63961",
    counselor: "Dr. J. R. Mohanty, Senior Member IEEE",
    mission: "Empowering undergraduate and postgraduate engineering students to design, prototype, and build state-of-the-art technological solutions across Artificial Intelligence, Embedded Systems, Autonomous Robotics, and Distributed Computing.",
    vision: "To establish KIIT University as the premier technical builder ecosystem in Eastern India where every student develops verified skills, solves real problems, and leads the next generation of global engineering."
  },
  milestones: [
    { year: "1992", title: "Genesis of KIIT", desc: "Established as an Industrial Training Institute with 12 students and two rented rooms by Dr. Achyuta Samanta." },
    { year: "1997", title: "Degree Engineering College", desc: "Transformed into an undergraduate engineering institution fostering research and laboratory excellence." },
    { year: "2004", title: "Deemed University & IEEE Charter", desc: "Conferred Deemed University status by Ministry of HRD; KIIT IEEE Student Branch chartered." },
    { year: "2018", title: "Institute of Eminence (IoE)", desc: "Recognized as an Institution of Eminence by the Government of India, ranking among top universities in Asia." },
    { year: "2026", title: "Intelligent Event Operating System", desc: "Pioneering the AI-powered technical operating system for connected student labs, real-time telemetry, and verified credentials." }
  ],
  stats: {
    students: "30,000+",
    campuses: "25 Green Campuses",
    ranking: "NIRF Top 15 Tier-1",
    patents: "120+ Granted",
    alumni: "75,000+ Worldwide"
  }
};

export const INITIAL_CERTIFICATES = [
  {
    id: "CERT-IEEE-2026-WEB01",
    eventId: "evt-web3-cloud-2026",
    eventName: "Full-Stack AI & Cloud Systems Bootcamp",
    studentName: "Aryan Mohapatra",
    rollNo: "22051842",
    issueDate: "September 15, 2026",
    verificationHash: "0x89F4A72E19C5B284",
    status: "Verified",
    grade: "Distinction with Honors",
    counselor: "Dr. J. R. Mohanty, Branch Counselor, KIIT IEEE",
    chair: "Chairperson, KIIT IEEE Student Branch"
  }
];

export const INITIAL_SUPPORT_TICKETS = [
  {
    id: "TCK-101",
    bench: "Bench B17",
    student: "Aryan Mohapatra (22051842)",
    event: "AI & Edge Computer Vision Masterclass",
    issue: "CH340 USB driver fails to bind to COM port in Windows Device Manager on Jetson Orin node.",
    priority: "HIGH",
    status: "In Progress",
    createdAt: "10 mins ago",
    assignedVolunteer: "Rahul Verma (Bench Dispatch Volunteer)"
  },
  {
    id: "TCK-102",
    bench: "Bench C04",
    student: "Riya Sengupta (23051410)",
    event: "AI & Edge Computer Vision Masterclass",
    issue: "CUDA out of memory error when batch size exceeds 16 during INT8 calibration.",
    priority: "MEDIUM",
    status: "Open",
    createdAt: "18 mins ago",
    assignedVolunteer: null
  },
  {
    id: "TCK-103",
    bench: "Bench A08",
    student: "Soumyadeep Das (22052104)",
    event: "Autonomous Robotics & ESP32-S3 IoT Lab",
    issue: "Git SSH key rejected on KIIT campus Wi-Fi proxy network.",
    priority: "LOW",
    status: "Resolved",
    createdAt: "35 mins ago",
    assignedVolunteer: "Devika Sharma (Core Lab Volunteer)"
  }
];

export const INITIAL_CHALLENGES = [
  {
    id: "CHL-01",
    title: "Edge Vision: Real-Time Lane & Hazard Detection",
    difficulty: "Medium",
    category: "Computer Vision",
    points: 350,
    prize: "₹5,000 + IEEE Official Swag",
    deadline: "Oct 15, 2026",
    participants: 78,
    status: "Active",
    description: "Write an optimized OpenCV/PyTorch pipeline that identifies road lanes in low-light rain video streams at >= 30 FPS.",
    submissionsCount: 24,
    hints: [
      "Use HSV color space filtering for yellow and white lane markers.",
      "Apply Hough Line Transforms with region-of-interest masking."
    ]
  },
  {
    id: "CHL-02",
    title: "ESP32-S3 Micro-Maze Flood-Fill Challenge",
    difficulty: "Hard",
    category: "Embedded Systems",
    points: 500,
    prize: "Raspberry Pi 5 Kit + Trophy",
    deadline: "Oct 25, 2026",
    participants: 52,
    status: "Active",
    description: "Program an ESP32 robot simulation to navigate a randomized 10x10 maze using flood-fill algorithms in under 45 seconds.",
    submissionsCount: 16,
    hints: [
      "Store grid cell walls in a bitmask byte array to minimize RAM overhead.",
      "Update cell Manhattan distances on-the-fly when new obstacles are detected."
    ]
  },
  {
    id: "CHL-03",
    title: "Campus AI Safety & Prompt Injection Defense",
    difficulty: "Easy",
    category: "Prompt & AI Red Teaming",
    points: 200,
    prize: "IEEE Digital Credential Badge",
    deadline: "Nov 02, 2026",
    participants: 120,
    status: "Active",
    description: "Design guardrails and system prompts for an LLM that cannot be jailbroken via indirect prompt injections or role-reversals.",
    submissionsCount: 65,
    hints: [
      "Delimit user input with XML tags.",
      "Use a two-tier evaluation model to verify prompt safety before executing."
    ]
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Registration Confirmed! 🎉",
    body: "You are secured for the AI & Edge Computer Vision Masterclass. Door check-in verified at Bench B17.",
    type: "success",
    timestamp: "10 mins ago",
    read: false,
    action: "openTicket",
    data: "KIIT-IEEE-2026-AI99"
  },
  {
    id: "notif-2",
    title: "Lab 2 In Progress: Jetson Flashing ⚡",
    body: "Please flash your calibrated weights to the Jetson Orin Nano node before 3:30 PM.",
    type: "info",
    timestamp: "25 mins ago",
    read: false,
    action: "openLiveEvent"
  },
  {
    id: "notif-3",
    title: "Certificate Issued! 📜",
    body: "Your credential for Full-Stack AI & Cloud Systems Bootcamp is signed and ready for verification.",
    type: "info",
    timestamp: "1 day ago",
    read: true,
    action: "openCertificates"
  }
];

export const AUDIT_LOGS = [
  { id: "log-1", actor: "Dr. Priyadarshi Sen", action: "Session 2 Started: TensorRT Jetson Lab", timestamp: "Today 02:30 PM", object: "evt-ai-cv-2026" },
  { id: "log-2", actor: "Host QR Desk", action: "Attendance Check-in Verified: Aryan Mohapatra", timestamp: "Today 09:42 AM", object: "KIIT-IEEE-2026-AI99" },
  { id: "log-3", actor: "Rahul Verma", action: "Claimed Support Ticket TCK-101 (Bench B17)", timestamp: "Today 09:50 AM", object: "TCK-101" },
  { id: "log-4", actor: "Devika Sharma", action: "Resolved Support Ticket TCK-103", timestamp: "Today 10:15 AM", object: "TCK-103" },
  { id: "log-5", actor: "Dr. J. R. Mohanty", action: "Issued Verified Certificate CERT-IEEE-2026-WEB01", timestamp: "Sep 15, 2026", object: "Aryan Mohapatra" }
];

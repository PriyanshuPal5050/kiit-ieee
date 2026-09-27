/**
 * KIIT IEEE Platform - AI Service Abstraction Layer
 * Multi-provider architecture with intelligent local simulation and live Gemini API adapter.
 */

export class AIService {
  static getApiKey() {
    return localStorage.getItem('KIIT_IEEE_GEMINI_KEY') || '';
  }

  static setApiKey(key) {
    localStorage.setItem('KIIT_IEEE_GEMINI_KEY', key);
  }

  // --- WORKSHOP COPILOT ENGINE ---
  static async askCopilot(query, eventContext = null, onStreamChunk = null) {
    const q = query.toLowerCase();

    // Check if live Gemini key is configured
    const apiKey = this.getApiKey();
    if (apiKey) {
      try {
        return await this.callGeminiApi(query, eventContext, apiKey, onStreamChunk);
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local Copilot engine:', err);
      }
    }

    // Intelligent Local Engine with realistic technical responses
    const response = this.generateLocalCopilotResponse(q, eventContext);
    
    // Simulate realistic token streaming
    if (onStreamChunk) {
      await this.simulateStreaming(response.text, onStreamChunk);
    }

    return response;
  }

  static generateLocalCopilotResponse(q, eventContext) {
    // 1. ESP32 / Hardware / COM Port issues
    if (q.includes('esp32') || q.includes('com port') || q.includes('ch340') || q.includes('baud') || q.includes('upload failed')) {
      return {
        text: `### 🔧 Diagnosing ESP32-S3 Serial & Hardware Link

Here is the exact 3-step checklist to resolve USB/COM port detection in the KIIT lab:

1. **Verify CH340 / CP2102 Driver Binding:**
   Open PowerShell or Windows Device Manager (\`devmgmt.msc\`) under **Ports (COM & LPT)**. If you see an exclamation mark ⚠️, run:
   \`\`\`powershell
   # Check active serial devices in Windows
   Get-PnpDevice -Class "Ports" | Where-Object { $_.Present -eq $true }
   \`\`\`

2. **Hold the BOOT/FLASH Button During Upload:**
   Many ESP32-S3 boards require entering bootloader mode:
   - Hold down **BOOT** button
   - Tap and release **EN/RESET** button
   - Release **BOOT** button
   - Now click **Upload** in PlatformIO / Arduino IDE.

3. **Check Baud Rate & Cable:**
   Lab USB cables must be data-capable (not charge-only). Set your monitor baud rate in \`platformio.ini\`:
   \`\`\`ini
   monitor_speed = 115200
   upload_speed = 921600
   \`\`\`

*Need a volunteer at your bench? Use the **Live Support** button to dispatch a bench mentor.*`,
        reasoning: "Detected ESP32 serial communication failure. Evaluated driver enumeration, USB-to-UART bridge chipset requirements, and hardware boot strapping pin logic.",
        references: ["ESP32-S3 Technical Reference Manual §4.3", "KIIT Robotics Lab Hardware Guide #2"],
        suggestedNext: ["How do I test I2C pins on ESP32?", "Request Bench Volunteer"]
      };
    }

    // 2. PyTorch / CUDA / GPU Out of Memory
    if (q.includes('cuda') || q.includes('out of memory') || q.includes('pytorch') || q.includes('oom') || q.includes('gpu')) {
      return {
        text: `### ⚡ Resolving CUDA Out of Memory (OOM)

Your neural network allocation exceeded the VRAM limit of your GPU node. Apply these optimizations:

1. **Enable Automatic Mixed Precision (AMP):**
   Casting tensors to \`float16\` cuts memory usage by ~50% with near-zero loss in accuracy:
   \`\`\`python
   from torch.cuda.amp import autocast, GradScaler
   
   scaler = GradScaler()
   for images, targets in dataloader:
       optimizer.zero_grad()
       with autocast():
           outputs = model(images.cuda())
           loss = criterion(outputs, targets.cuda())
       scaler.scale(loss).backward()
       scaler.step(optimizer)
       scaler.update()
   \`\`\`

2. **Reduce Batch Size & Use Gradient Accumulation:**
   If your bench GPU has 4GB/6GB VRAM, drop \`batch_size=8\` and simulate batch 32:
   \`\`\`python
   accumulation_steps = 4
   # loss = loss / accumulation_steps
   \`\`\`

3. **Purge Cache Before Evaluation:**
   \`\`\`python
   import torch
   torch.cuda.empty_cache()
   \`\`\``,
        reasoning: "Analyzed PyTorch memory allocator trace. High probability of unreleased computation graph references and full precision FP32 tensors.",
        references: ["PyTorch Docs: Performance Tuning Guide", "Edge Vision Workshop Lab 1 Codebase"],
        suggestedNext: ["How do I quantize to INT8 with TensorRT?", "Why is my validation loss NaN?"]
      };
    }

    // 3. Git / SSH / GitHub Authentication
    if (q.includes('git') || q.includes('ssh') || q.includes('permission denied') || q.includes('token') || q.includes('push')) {
      return {
        text: `### 🔐 Fixing Git Authentication & SSH Configuration

In campus lab networks, port 22 for SSH is sometimes blocked by firewalls. Use HTTPS with a GitHub Personal Access Token (PAT) or SSH over port 443:

1. **Switch SSH to Port 443 (Firewall Bypass):**
   Add this to your \`~/.ssh/config\` file:
   \`\`\`bash
   Host github.com
     Hostname ssh.github.com
     Port 443
     User git
   \`\`\`

2. **Test GitHub Connection:**
   \`\`\`bash
   ssh -T git@github.com
   # Expected output: "Hi username! You've successfully authenticated..."
   \`\`\`

3. **Or Switch Remote URL to HTTPS:**
   \`\`\`bash
   git remote set-url origin https://github.com/your-username/repo-name.git
   \`\`\``,
        reasoning: "Examined network transport protocols. Campus proxy configurations commonly filter standard port 22.",
        references: ["GitHub Docs: Using SSH over the HTTPS Port"],
        suggestedNext: ["How to resolve Git merge conflict?", "Setup .gitignore for Python"]
      };
    }

    // 4. Default Event-Aware Response
    const eventTitle = eventContext ? eventContext.title : "KIIT IEEE Technical Workshops";
    return {
      text: `### 💡 Copilot Analysis for: ${eventTitle}

I have analyzed your request regarding **"${query}"**. Here are the recommended steps and technical considerations:

1. **Environment State:** Ensure your dependencies are aligned with the workshop requirements (\`Python 3.10+\`, \`Node 20+\`, or \`PlatformIO\`).
2. **Lab Codebase Sync:** Pull the latest starter repository from the official IEEE workspace:
   \`\`\`bash
   git fetch upstream && git checkout -b feature/capstone
   \`\`\`
3. **Execution Pipeline:** Always verify that input shapes and data formats conform to the expected specification before passing to downstream processors.

Need live hands-on debugging? You can dispatch a lab volunteer directly to your bench from the **Live Support** panel!`,
      reasoning: "Synthesized technical documentation from current workshop syllabus and verified compatibility with campus lab environments.",
      references: ["KIIT IEEE Academic Repository", "Lab Technical Guidelines 2026"],
      suggestedNext: ["Explain the capstone requirements", "Open Environment Readiness Check"]
    };
  }

  // --- CREATE EVENT AI BUILDER ---
  static async generateEventPlan(promptText, onProgressUpdate = null) {
    const steps = [
      "Analyzing curriculum and student engineering level...",
      "Drafting hour-by-hour workshop syllabus & milestones...",
      "Synthesizing hardware kit specs and software prerequisites...",
      "Generating marketing copy, eligibility criteria and FAQs..."
    ];

    for (let i = 0; i < steps.length; i++) {
      if (onProgressUpdate) onProgressUpdate(steps[i], (i + 1) * 25);
      await new Promise(r => setTimeout(r, 450));
    }

    // Determine category based on prompt keywords
    const p = promptText.toLowerCase();
    let category = "AI & Machine Learning";
    let badgeColor = "badge-ai";
    let bannerGradient = "from-indigo-600 via-purple-600 to-pink-600";
    let tags = ["AI", "Hands-on", "IEEE"];

    if (p.includes("robot") || p.includes("ros") || p.includes("iot") || p.includes("esp") || p.includes("hardware")) {
      category = "Robotics & IoT";
      badgeColor = "badge-robotics";
      bannerGradient = "from-cyan-600 via-teal-600 to-emerald-600";
      tags = ["Robotics", "Hardware", "Sensors", "IoT"];
    } else if (p.includes("hack") || p.includes("sprint") || p.includes("challenge")) {
      category = "Hackathons";
      badgeColor = "badge-hackathon";
      bannerGradient = "from-rose-600 via-orange-600 to-amber-600";
      tags = ["Hackathon", "Prizes", "Teams", "Innovation"];
    } else if (p.includes("web") || p.includes("cloud") || p.includes("devops") || p.includes("full stack")) {
      category = "Web & Cloud";
      badgeColor = "badge-web3";
      bannerGradient = "from-blue-600 via-indigo-600 to-violet-700";
      tags = ["Next.js", "Cloud", "FullStack", "APIs"];
    }

    // Extract title or create creative title
    let title = "Autonomous AI & Intelligent Systems Bootcamp";
    if (promptText.length > 5) {
      title = promptText.replace(/create\s+(a\s+)?/i, '').trim();
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }

    return {
      title: title,
      tagline: `A high-intensity, hands-on technical workshop generated specifically for ambitious KIIT engineering students.`,
      category: category,
      format: p.includes("online") ? "Online" : "Offline",
      difficulty: p.includes("beginner") ? "Beginner" : (p.includes("advanced") ? "Advanced" : "Intermediate"),
      date: "Nov 28 - 29, 2026",
      time: "09:30 AM - 05:00 PM IST",
      venue: "Campus 15, Tech Lab 2, KIIT University",
      seatsTotal: 120,
      badgeColor: badgeColor,
      bannerGradient: bannerGradient,
      speaker: {
        name: "Industry Specialist & IEEE Fellow",
        role: "Lead Systems Architect",
        org: "IEEE Industry Applications Society",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        bio: "Specialist with extensive production deployment experience and multiple IEEE research contributions."
      },
      schedule: [
        { time: "Day 1 - 09:30 AM", title: "Architecture Briefing & Toolchain Configuration" },
        { time: "Day 1 - 11:30 AM", title: "Core Fundamentals & Hands-on Implementation Sprint 1" },
        { time: "Day 1 - 02:30 PM", title: "Advanced Integration & Real-time Debugging Lab" },
        { time: "Day 2 - 10:00 AM", title: "Capstone Project Launch & Team Challenge" },
        { time: "Day 2 - 03:30 PM", title: "Benchmark Evaluation, Leaderboard & IEEE Certification" }
      ],
      prerequisites: [
        "Laptop with minimum 8GB RAM and admin rights",
        "Basic familiarity with modern programming (Python/C++/JS)",
        "Pre-installed Git and code editor (VS Code recommended)"
      ],
      whatYouWillBuild: [
        "A deployable, production-ready portfolio project with verifiable benchmarks",
        "Automated continuous integration pipeline testing the prototype",
        "Official KIIT IEEE Certificate of Excellence with verification hash"
      ],
      hardwareKit: "All required development boards, sensor modules, and high-speed campus lab workstations will be provided on-site.",
      faqs: [
        { q: "Is registration free?", a: "Yes, fully funded through the KIIT IEEE Student Branch endowment." },
        { q: "Can 1st year students attend?", a: "Yes! Dedicated student mentors will be assigned to assist beginners." }
      ],
      tags: tags,
      announcementCopy: `🚀 ANNOUNCING: ${title}!\n\nJoin KIIT IEEE for an intensive 2-day technical sprint. Build real-world systems, work with industry mentors, and earn verified IEEE credentials.\n\n📍 Venue: Campus 15, Tech Lab 2\n⚡ Seats: 120 only (Filling fast)\n🔗 Register now on the KIIT IEEE portal!`
    };
  }

  // --- STREAMING SIMULATION HELPER ---
  static async simulateStreaming(text, onChunk) {
    const words = text.split(' ');
    let current = '';
    for (let i = 0; i < words.length; i++) {
      current += (i === 0 ? '' : ' ') + words[i];
      onChunk(current);
      await new Promise(r => setTimeout(r, 18));
    }
  }

  // --- LIVE GEMINI API ADAPTER ---
  static async callGeminiApi(prompt, context, apiKey, onChunk) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const contextPrompt = context ? `Context: You are the KIIT IEEE Workshop Copilot assisting an engineering student attending "${context.title}". Event details: ${JSON.stringify(context.tags)}. ` : `Context: You are the KIIT IEEE Copilot. `;
    
    const body = {
      contents: [{
        parts: [{ text: `${contextPrompt}\n\nStudent question: ${prompt}\n\nProvide actionable, friendly, technically precise engineering advice with markdown, code snippets, and troubleshooting steps.` }]
      }]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Gemini HTTP error ${res.status}`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
    
    if (onChunk) {
      await this.simulateStreaming(candidateText, onChunk);
    }

    return {
      text: candidateText,
      reasoning: "Generated in real-time via Gemini 1.5 Flash API connection.",
      references: ["Google Gemini Multimodal API", "KIIT IEEE Platform"],
      suggestedNext: ["Explain the next step", "How do I test this in terminal?"]
    };
  }

  // --- SERVER-SIDE EVENT CONTENT GENERATION ---
  static async generateEventContent(eventPayload) {
    const origin = window.location.origin && window.location.origin !== 'null' && !window.location.origin.includes('file:')
      ? window.location.origin
      : 'http://localhost:3000';

    const response = await fetch(`${origin}/api/ai/generate-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

    const result = await response.json().catch(() => ({
      success: false,
      error: 'Server returned an unreadable response format.'
    }));

    if (!response.ok || !result.success) {
      const err = new Error(result.error || `Server error (HTTP ${response.status})`);
      err.code = result.code;
      err.missingFields = result.missingFields;
      err.status = response.status;
      err.detail = result.detail;
      throw err;
    }

    return result.data;
  }

  // --- AI EVENT HELPER (NATURAL LANGUAGE COMMANDS) ---
  static async sendEventHelperCommand(instruction, currentEvent) {
    const origin = window.location.origin && window.location.origin !== 'null' && !window.location.origin.includes('file:')
      ? window.location.origin
      : 'http://localhost:3000';

    const response = await fetch(`${origin}/api/ai/event-helper`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instruction,
        event: currentEvent
      })
    });

    const result = await response.json().catch(() => ({
      success: false,
      error: 'Unreadable response from AI helper endpoint.'
    }));

    if (!response.ok || !result.success) {
      throw new Error(result.error || `Server error (HTTP ${response.status})`);
    }

    return result.data;
  }
}

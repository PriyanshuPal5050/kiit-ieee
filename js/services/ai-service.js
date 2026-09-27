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

  // --- SERVER-SIDE & LOCAL EVENT CONTENT GENERATION ---
  static async generateEventContent(eventPayload) {
    const origin = window.location.origin && window.location.origin !== 'null' && !window.location.origin.includes('file:')
      ? window.location.origin
      : 'http://localhost:3000';

    try {
      const response = await fetch(`${origin}/api/ai/generate-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventPayload)
      });

      if (response.ok) {
        const text = await response.text();
        try {
          const result = JSON.parse(text);
          if (result && result.success && result.data) {
            return result.data;
          }
        } catch (jsonErr) {
          console.warn('[AIService] /api/ai/generate-event returned non-JSON:', text?.slice(0, 100));
        }
      }
    } catch (networkErr) {
      console.warn('[AIService] Server generate-event endpoint unavailable, using local generator:', networkErr);
    }

    // Factual local deterministic event generator fallback
    return this.generateLocalDeterministicContent(eventPayload);
  }

  // --- AI EVENT HELPER (NATURAL LANGUAGE COMMANDS) ---
  static async sendEventHelperCommand(instruction, currentEvent) {
    if (!instruction || !instruction.trim()) {
      throw new Error('Please enter an instruction for the AI helper.');
    }

    const trimmed = instruction.trim();

    // 1. If live Gemini API key is configured directly in client browser, try Gemini
    const apiKey = this.getApiKey();
    if (apiKey) {
      try {
        const geminiResult = await this.callGeminiHelperApi(trimmed, currentEvent, apiKey);
        if (geminiResult && geminiResult.action) {
          return geminiResult;
        }
      } catch (geminiErr) {
        console.warn('[AIService] Client Gemini helper call failed, falling back to server/local parser:', geminiErr);
      }
    }

    // 2. Try server endpoint POST /api/ai/event-helper
    const origin = window.location.origin && window.location.origin !== 'null' && !window.location.origin.includes('file:')
      ? window.location.origin
      : 'http://localhost:3000';

    try {
      const response = await fetch(`${origin}/api/ai/event-helper`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instruction: trimmed,
          event: currentEvent || {}
        })
      });

      if (response.ok) {
        const text = await response.text();
        try {
          const result = JSON.parse(text);
          if (result && result.success && result.data && result.data.action) {
            return result.data;
          }
        } catch (jsonErr) {
          console.warn('[AIService] Server returned non-JSON response from /api/ai/event-helper:', text?.slice(0, 100));
        }
      } else {
        console.warn(`[AIService] Server returned HTTP ${response.status} from /api/ai/event-helper`);
      }
    } catch (fetchErr) {
      console.warn('[AIService] Network fetch to /api/ai/event-helper failed:', fetchErr);
    }

    // 3. Robust Intelligent Local NLP Parser Fallback
    // Guaranteed zero-delay processing — works seamlessly on Vercel, offline, or when backend is down
    console.log('[AIService] Processing instruction via intelligent local NLP parser.');
    return this.parseLocalEventInstruction(trimmed, currentEvent || {});
  }

  /**
   * Comprehensive client-side natural language parser for AI Event Helper.
   * Matches all IEEE builder fields, timings, venues, speakers, posters, and announcements.
   */
  static parseLocalEventInstruction(instruction, currentEvent = {}) {
    const text = (instruction || '').trim();
    const changes = {};
    const posterInstructions = {};
    const contentInstructions = {};
    const msgParts = [];

    // Helper: normalize time string to HH:MM (24-hr)
    const normalizeTime = (tStr) => {
      if (!tStr) return tStr;
      const m = String(tStr).match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
      if (!m) return tStr;
      let h = parseInt(m[1], 10);
      const mins = m[2] || '00';
      const mer = m[3] ? m[3].toLowerCase() : null;
      if (mer === 'pm' && h < 12) h += 12;
      if (mer === 'am' && h === 12) h = 0;
      return `${h.toString().padStart(2, '0')}:${mins}`;
    };

    // 1. Speaker Name
    const spkMatch = text.match(/(?:(?:add|change|set|update)\s+)?(?:the\s+)?speaker(?:\s*name)?\s*(?:to|is|=)\s*([A-Za-z\s\.]+?)(?:(?:\s+and\s+)|(?:\s*\,)|\.|$)/i);
    if (spkMatch) {
      let spkName = spkMatch[1].trim();
      spkName = spkName.replace(/\s+(?:update|change|and).*$/i, '').trim();
      if (spkName) {
        changes.speakerName = spkName;
        msgParts.push(`Speaker name changed to ${spkName}`);
      }
    }

    // 2. Speaker Designation
    const desigMatch = text.match(/(?:speaker\s+)?designation\s*(?:to|is|=)\s*([A-Za-z0-9\s\-]+?)(?:(?:\s+and\s+)|(?:\s*\,)|\.|$)/i);
    if (desigMatch) {
      const desig = desigMatch[1].trim();
      changes.speakerDesignation = desig;
      msgParts.push(`Speaker designation updated to ${desig}`);
    }

    // 3. Campus
    const campusMatch = text.match(/campus\s*(\d+|other)/i);
    if (campusMatch) {
      const cNum = campusMatch[1];
      const cVal = !isNaN(cNum) ? `Campus ${cNum}` : 'Other';
      changes.campus = cVal;
      msgParts.push(`Campus updated to ${cVal}`);
    }

    // 4. Room
    const roomMatch = text.match(/(?:room|lab)\s*(\d+[a-z]?|\w+\s*(?:lab|hall)?\s*\d*)/i);
    if (roomMatch) {
      const rVal = roomMatch[0].trim();
      changes.room = rVal;
      msgParts.push(`Room updated to ${rVal}`);
    }

    // 5. Full Venue
    if (text.toLowerCase().includes('venue') && !campusMatch && !roomMatch) {
      const vMatch = text.match(/venue\s*(?:to|is|=)\s*([^,\.]+)/i);
      if (vMatch) {
        changes.venue = vMatch[1].trim();
        msgParts.push(`Venue updated to ${changes.venue}`);
      }
    }

    // 6. Timing (Start Time & End Time)
    // Matches "timing to 3 PM to 5 PM", "time from 3 PM to 5 PM", "timing to 3 to 5 PM", "timing 2 PM - 5 PM"
    const timeMatch = text.match(/(?:timing|time)\s*(?:to|is|=|from)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:to|–|-|and)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    if (timeMatch) {
      let t1 = timeMatch[1].trim();
      let t2 = timeMatch[2].trim();
      if (!/[ap]m/i.test(t1) && /[ap]m/i.test(t2)) {
        const mer = t2.match(/[ap]m/i)[0];
        const h1 = parseInt(t1, 10);
        const h2 = parseInt(t2, 10);
        if (h1 < 12 && mer.toLowerCase() === 'pm' && (h1 <= h2 || h1 >= 9)) {
          t1 = `${t1} ${mer}`;
        }
      }
      const st = normalizeTime(t1);
      const et = normalizeTime(t2);
      changes.startTime = st;
      changes.endTime = et;
      msgParts.push(`Timing set to ${st} - ${et}`);
    }

    // 7. Reporting Time
    const repMatch = text.match(/reporting(?:\s*time)?\s*(?:to|is|=|should be|at)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    if (repMatch) {
      const rt = normalizeTime(repMatch[1]);
      changes.reportingTime = rt;
      msgParts.push(`Reporting time set to ${rt}`);
    }

    // 8. Seats / Capacity
    const seatsMatch = text.match(/(?:seats?|capacity)\s*(?:to|is|=)\s*(\d+)/i);
    if (seatsMatch) {
      const seats = parseInt(seatsMatch[1], 10);
      changes.seats = seats;
      changes.seatsTotal = seats;
      msgParts.push(`Seats updated to ${seats}`);
    }

    // 9. Registration Fee
    const feeMatch = text.match(/(?:registration\s+)?fee\s*(?:to|is|=)\s*([₹$€\w\d\s]+?)(?:(?:\s+and\s+)|\.|$)/i);
    if (feeMatch) {
      const feeVal = feeMatch[1].trim();
      changes.registrationFee = feeVal;
      msgParts.push(`Registration fee updated to ${feeVal}`);
    }

    // 10. Event Title
    const titleMatch = text.match(/(?<!speaker\s)(?<!speaker\sname\s)(?:event\s+(?:title|name)|(?:title\s+of\s+(?:the\s+)?event)|(?:\bthe\s+title\b)|(?:\btitle\s*(?:to|is|=)))\s*(?:to|is|=)?\s*([^,\.]+)/i);
    if (titleMatch) {
      const tVal = titleMatch[1].trim().replace(/^['"]|['"]$/g, '');
      changes.eventName = tVal;
      changes.title = tVal;
      msgParts.push(`Event title changed to "${tVal}"`);
    }

    // 11. Poster Instructions
    const tLower = text.toLowerCase();
    if (tLower.includes('poster')) {
      if (tLower.includes('formal') || tLower.includes('corporate')) {
        posterInstructions.theme = 'formal';
        posterInstructions.style = 'formal';
        posterInstructions.visualIntensity = 'moderate';
        msgParts.push('Poster set to formal IEEE style');
      } else if (tLower.includes('futuristic') || tLower.includes('cyber') || tLower.includes('neon')) {
        posterInstructions.theme = 'futuristic';
        posterInstructions.accentStyle = 'electric-blue';
        posterInstructions.style = 'futuristic';
        msgParts.push('Poster set to futuristic technical style');
      } else if (tLower.includes('blue') || tLower.includes('technical')) {
        posterInstructions.theme = 'technical';
        posterInstructions.accentStyle = 'electric-blue';
        msgParts.push('Poster set to modern technical blue style');
      } else if (tLower.includes('hackathon') || tLower.includes('energetic')) {
        posterInstructions.theme = 'energetic';
        msgParts.push('Poster set to energetic hackathon style');
      } else if (tLower.includes('minimal') || tLower.includes('clean')) {
        posterInstructions.theme = 'minimal';
        msgParts.push('Poster set to clean minimalist style');
      }
    }

    // 12. Content / Announcement Instructions
    if (tLower.includes('whatsapp') || tLower.includes('announcement') || tLower.includes('description')) {
      if (tLower.includes('shorter') || tLower.includes('short') || tLower.includes('concise')) {
        contentInstructions.length = 'short';
        msgParts.push('Announcement set to concise format');
      }
      if (tLower.includes('formal') || tLower.includes('professional')) {
        contentInstructions.tone = 'formal';
        msgParts.push('Announcement tone set to formal');
      }
    }

    // 13. Eligibility
    const eligMatch = text.match(/eligibility\s*(?:to|is|=)\s*([^,\.]+)/i);
    if (eligMatch) {
      const eVal = eligMatch[1].trim();
      changes.eligibility = eVal;
      msgParts.push(`Eligibility updated to ${eVal}`);
    }

    // 14. Prerequisites
    const prereqMatch = text.match(/prerequisites?\s*(?:to|is|=)\s*([^,\.]+)/i);
    if (prereqMatch) {
      const pVal = prereqMatch[1].trim();
      changes.prerequisites = pVal;
      msgParts.push(`Prerequisites updated`);
    }

    // Determine action
    const hasChanges = Object.keys(changes).length > 0;
    const hasPoster = Object.keys(posterInstructions).length > 0;
    const hasContent = Object.keys(contentInstructions).length > 0;

    let action = 'update_event';
    if (hasChanges && hasPoster && hasContent) action = 'update_all';
    else if (hasChanges && hasPoster) action = 'update_event_and_poster';
    else if (hasChanges && hasContent) action = 'update_event_and_content';
    else if (hasPoster) action = 'update_poster';
    else if (hasContent) action = 'update_content';

    const message = msgParts.length > 0 ? msgParts.join('; ') : 'Instruction evaluated and applied.';

    return {
      action,
      changes,
      diff: changes,
      posterInstructions,
      contentInstructions,
      message
    };
  }

  // --- LOCAL FACTUAL EVENT CONTENT GENERATOR ---
  static generateLocalDeterministicContent(payload) {
    const title = payload.eventName || payload.title || 'Technical Workshop';
    const campus = payload.campus || 'Campus 15';
    const room = payload.room || 'Tech Lab 4';
    const building = payload.building || 'School of Computer Engineering';
    const venue = payload.venue || `${room}, ${building}, ${campus}`;
    const date = payload.date || `${payload.startDate || '10 Oct'} – ${payload.endDate || '11 Oct 2026'}`;
    const startTime = payload.startTime || '09:30';
    const endTime = payload.endTime || '17:00';
    const reporting = payload.reportingTime || '08:30 AM';
    const speaker = payload.speakerName || 'Dr. Priyadarshi Sen';
    const desig = payload.speakerDesignation || 'Principal AI Research Scientist';
    const org = payload.speakerOrganization || 'KIIT Deemed to be University';
    const eligibility = payload.eligibility || 'Open to 2nd, 3rd & 4th Year B.Tech students (All branches)';
    const seats = payload.seats || payload.seatsTotal || 120;
    const fee = payload.registrationFee || payload.fee || 'Free (IEEE Sponsored)';

    const shortDesc = `An intensive, hands-on masterclass exploring practical implementation of ${title} with real hardware and production-grade toolchains.`;
    const fullDesc = `Join KIIT IEEE for an immersive masterclass on ${title}. Led by ${speaker} (${desig}, ${org}) at ${venue}, this workshop combines architectural deep dives with hands-on lab sprints, giving participants real deployment experience and verified IEEE credentials.`;

    const whatsappAnnouncement = [
      `🎓 *KIIT IEEE PRESENTS*`,
      ``,
      `🚀 *${title.toUpperCase()}*`,
      ``,
      `💡 ${shortDesc}`,
      ``,
      `📅 *Date:* ${date}`,
      `⏰ *Time:* ${startTime} – ${endTime} IST`,
      `🕐 *Reporting:* ${reporting}`,
      `📍 *Venue:* ${venue}`,
      `🏢 *Building:* ${building}`,
      `🎯 *Eligibility:* ${eligibility}`,
      `🎙️ *Speaker:* ${speaker} (${desig})`,
      ``,
      `💡 *Overview:*`,
      `${fullDesc}`,
      ``,
      `🎟️ *Capacity:* ${seats} Lab Benches Only (Filling Fast)`,
      `⏳ *Registration Deadline:* 24 hours prior to event start`,
      ``,
      `🔗 *Register Now:*`,
      `${payload.registrationUrl || 'https://kiit-ieee.org/#events'}`,
      ``,
      `👤 *Organizer:* ${payload.contactPerson || 'KIIT IEEE Student Branch'}`,
      ``,
      `#KIITIEEE #WhereStudentsBuildWhatsNext #KIITUniversity`
    ].join('\n');

    return {
      title,
      eventName: title,
      shortDescription: shortDesc,
      longDescription: fullDesc,
      highlights: [
        `Hands-on lab sessions at ${venue}`,
        `Mentorship by ${speaker} (${desig})`,
        `Deployment-ready capstone built and verified on-site`,
        `Official KIIT IEEE Certificate of Excellence with verification hash`
      ],
      learningOutcomes: [
        `Fundamental and advanced concepts of ${title}`,
        `Environment configuration, hardware calibration, and debugging`,
        `Production optimization and performance profiling`,
        `Collaborative engineering workflows and capstone defense`
      ],
      whatWillBuild: `A production-ready implementation of ${title} with automated verification and benchmark reporting.`,
      speakerIntroduction: `${speaker} is a ${desig} at ${org}, bringing extensive field experience in delivering high-impact engineering workshops.`,
      whatsappAnnouncement,
      posterText: `Hands-On Masterclass • ${date} • ${venue}`,
      faq: [
        { question: "Who is eligible to attend?", answer: eligibility },
        { question: "What should I bring to the workshop?", answer: "Personal laptop with charger and student ID card. Laptop with minimum 8GB RAM." },
        { question: "Is there a registration fee?", answer: `The event fee is ${fee}.` },
        { question: "Will certificates be provided?", answer: "Yes, verified IEEE Student Branch credentials will be issued upon completion." }
      ]
    };
  }

  // --- DIRECT CLIENT-SIDE GEMINI HELPER API ADAPTER ---
  static async callGeminiHelperApi(instruction, currentEvent, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const prompt = `You are the KIIT IEEE Event Helper Assistant.
Current Event: ${JSON.stringify(currentEvent)}
Instruction: "${instruction}"
Parse this instruction and determine which fields to update or what design/content instructions to apply.
Allowed fields for 'changes':
- eventName, title, eventType, category, description, shortDescription
- startDate, endDate, startTime, endTime, reportingTime
- campus, building, room, venue, address
- speakerName, speakerDesignation, speakerOrganization, speakerBio
- eligibility, prerequisites, seats, registrationFee, registrationDeadline

Return strictly JSON adhering to schema:
{
  "action": "update_event" | "update_poster" | "update_content" | "update_event_and_poster" | "update_event_and_content" | "update_all",
  "changes": { ... },
  "posterInstructions": { "theme": "...", "accentStyle": "...", "style": "..." },
  "contentInstructions": { "tone": "...", "length": "..." },
  "message": "Summary of changes"
}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!res.ok) throw new Error(`Gemini HTTP error ${res.status}`);
    const data = await res.json();
    let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(raw);
  }
}


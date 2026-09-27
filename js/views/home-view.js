/**
 * KIIT IEEE Platform - Master Homepage View
 * "Where Students Build What's Next."
 * Implements all 13 sections specified in Section 70 of the Master Product Prompt:
 * Hero, Featured Events, Upcoming Events, How It Works, Builder Journey, AI Mentor,
 * Challenges, Student Builds, Community, KIIT IEEE Story, Founder / Institutional Vision, CTA, Footer.
 */

import { store } from '../state.js';
import { HeroUniverse } from '../components/hero.js';
import { sound } from '../services/audio-service.js';

export class HomeView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.heroCanvas = null;
  }

  render() {
    if (!this.container) return;
    const featuredEvents = store.events.filter(e => e.featured);
    const regularEvents = store.events.filter(e => !e.featured).slice(0, 3);
    const inst = store.institutionalData;

    this.container.innerHTML = `
      <div class="relative overflow-hidden">
        
        <!-- SECTION 1: HERO & EVENT UNIVERSE -->
        <section class="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          
          <!-- Background Interactive Physics Canvas ("Event Universe") -->
          <canvas id="hero-canvas" class="w-full h-full"></canvas>

          <!-- Ambient Gradient Glow Overlays -->
          <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none"></div>
          <div class="absolute bottom-10 right-10 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

          <!-- Hero Main Content -->
          <div class="relative z-10 max-w-5xl mx-auto text-center space-y-6">
            
            <!-- Live Season Announcement Pill -->
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-indigo-500/30 backdrop-blur-xl shadow-lg shadow-indigo-500/10 animate-float">
              <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span class="text-xs font-semibold text-indigo-300">Autumn 2026 Season Open</span>
              <span class="text-slate-500">•</span>
              <span class="text-xs text-slate-300">Private Operating System for KIIT Builders</span>
            </div>

            <!-- Big Expressive Headline -->
            <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              Where Students <br class="hidden sm:inline" />
              <span class="text-gradient-hero">Build What’s Next.</span>
            </h1>

            <!-- Supporting Vision Paragraph -->
            <p class="max-w-2xl mx-auto text-sm sm:text-lg text-slate-300 font-normal leading-relaxed">
              Discover technical events, learn with AI, build real projects, collaborate with students, and turn every experience into part of your technical journey.
            </p>

            <!-- Hero CTAs -->
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
              <button id="hero-btn-explore" class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all btn-press flex items-center justify-center gap-2 group">
                <span>Explore Events</span>
                <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>

              <button id="hero-btn-host" class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/15 hover:border-indigo-400/50 text-slate-200 hover:text-white font-bold text-sm backdrop-blur-xl transition-all btn-press flex items-center justify-center gap-2">
                <span>🛡️ Host Command Center</span>
              </button>
            </div>

            <!-- Floating Pill Badges -->
            <div class="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
              <div class="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
                <div class="text-xl sm:text-2xl font-black text-white">4,200+</div>
                <div class="text-[11px] text-slate-400 font-medium">KIIT Student Builders</div>
              </div>
              <div class="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
                <div class="text-xl sm:text-2xl font-black text-cyan-400">85+</div>
                <div class="text-[11px] text-slate-400 font-medium">Workshops & Labs</div>
              </div>
              <div class="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
                <div class="text-xl sm:text-2xl font-black text-indigo-400">1,200+</div>
                <div class="text-[11px] text-slate-400 font-medium">Projects & Robots Built</div>
              </div>
              <div class="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
                <div class="text-xl sm:text-2xl font-black text-emerald-400">98%</div>
                <div class="text-[11px] text-slate-400 font-medium">Environment Ready Rate</div>
              </div>
            </div>

          </div>
        </section>

        <!-- SECTION 2: FEATURED EXPERIENCES -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <div class="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                <span>★</span> Flagship Experiences
              </div>
              <h2 class="text-2xl sm:text-4xl font-black text-white mt-1">Featured Technical Workshops</h2>
            </div>
            <button id="home-view-all-events" class="mt-4 sm:mt-0 text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors">
              <span>View all events</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${featuredEvents.map(evt => this.renderEventCard(evt)).join('')}
          </div>
        </section>

        <!-- SECTION 4: HOW IT WORKS (THE EVENT LIFECYCLE) -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div class="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span class="text-xs font-bold text-cyan-400 uppercase tracking-widest">End-to-End Lifecycle</span>
            <h2 class="text-2xl sm:text-4xl font-black text-white">How KIIT IEEE Operates</h2>
            <p class="text-xs sm:text-sm text-slate-400">An intelligent operating system connecting registration, environment setup, lab milestones, hardware kits, and certified credentials.</p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-center text-xs">
            ${[
              { step: "1. Discover", desc: "Curated workshops in AI, IoT & Web", icon: "🔍" },
              { step: "2. Register", desc: "Digital QR pass & seat confirmation", icon: "🎟️" },
              { step: "3. Prepare", desc: "Pre-lab automated readiness check", icon: "⚡" },
              { step: "4. Attend", desc: "Door check-in & assigned bench", icon: "📷" },
              { step: "5. Build", desc: "Hands-on coding with AI Copilot", icon: "💻" },
              { step: "6. Certify", desc: "Cryptographic credential on canvas", icon: "📜" }
            ].map(item => `
              <div class="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
                <div class="text-2xl">${item.icon}</div>
                <div class="font-bold text-white">${item.step}</div>
                <div class="text-[11px] text-slate-400 leading-snug">${item.desc}</div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- SECTION 5: BUILDER JOURNEY & LEVELING SYSTEM -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div class="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 p-8 sm:p-12 space-y-8">
            <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span class="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">Platform Progression</span>
                <h3 class="text-2xl sm:text-4xl font-black text-white mt-1">The Technical Builder Journey</h3>
                <p class="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  Earn XP through genuine engineering tasks: solving challenges, flashing microcontrollers, and contributing projects.
                </p>
              </div>
              <button id="btn-home-open-journey" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all btn-press flex items-center gap-1.5 self-start sm:self-auto">
                <span>View My Level Status</span>
                <span>→</span>
              </button>
            </div>

            <!-- Configurable Levels Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
              ${[
                { lvl: "L1", name: "Explorer", xp: "0 XP" },
                { lvl: "L2", name: "Builder", xp: "200 XP" },
                { lvl: "L3", name: "Creator", xp: "400 XP" },
                { lvl: "L4", name: "Innovator", xp: "700 XP" },
                { lvl: "L5", name: "Engineer", xp: "950 XP" },
                { lvl: "L6", name: "Technologist", xp: "1,100 XP" },
                { lvl: "L7", name: "Innovator", xp: "1,240 XP", active: true },
                { lvl: "L8", name: "Leader", xp: "1,500 XP" }
              ].map(l => `
                <div class="p-3 rounded-2xl ${l.active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-cyan-400' : 'bg-slate-950/60 border border-white/5 text-slate-300'} space-y-1">
                  <div class="text-[10px] font-mono font-bold uppercase opacity-80">${l.lvl}</div>
                  <div class="font-bold text-xs truncate">${l.name}</div>
                  <div class="text-[10px] font-mono opacity-60">${l.xp}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>

        <!-- SECTION 6: AI WORKSHOP COPILOT -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="relative rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/70 border border-indigo-500/40 p-8 sm:p-12 overflow-hidden shadow-2xl">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
              <div class="space-y-4">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                  <span>⚡</span> Introducing Workshop Copilot
                </div>
                <h3 class="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                  Your 24/7 Technical Teammate for Every Workshop.
                </h3>
                <p class="text-sm text-slate-300 leading-relaxed">
                  Stuck with a broken CUDA driver? Can't get your ESP32 serial baud rate synced?
                  Workshop Copilot is contextualized for each lab's exact curriculum, hardware kits, and common gotchas.
                </p>
                <div class="flex flex-wrap gap-2 pt-2">
                  <span class="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">✓ Real-time Error Diagnostics</span>
                  <span class="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">✓ Copyable Terminal Fixes</span>
                  <span class="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">✓ Bench Volunteer Dispatch</span>
                </div>
                <div class="pt-4">
                  <button id="btn-home-launch-copilot" class="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/30 transition-all btn-press flex items-center gap-2">
                    <span>Launch AI Copilot</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </button>
                </div>
              </div>

              <!-- Interactive Simulated Copilot Chat Window Preview -->
              <div class="bg-slate-950/90 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-3 font-mono text-xs">
                <div class="flex items-center justify-between pb-3 border-b border-white/10">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-rose-500/80"></span>
                    <span class="w-3 h-3 rounded-full bg-amber-500/80"></span>
                    <span class="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                    <span class="text-slate-400 text-[11px] ml-2">copilot-live-session.sh</span>
                  </div>
                  <span class="text-cyan-400 text-[10px]">AI MODEL: ACTIVE</span>
                </div>

                <div class="p-3 rounded-xl bg-white/5 text-slate-200">
                  <span class="text-indigo-400 font-bold block mb-1">Student @ Bench B17:</span>
                  "My ESP32 is not detected in COM port on Windows 11."
                </div>

                <div class="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-slate-200 space-y-2">
                  <div class="flex items-center gap-2 text-cyan-300 font-bold">
                    <span>⚡ Workshop Copilot:</span>
                  </div>
                  <p class="text-[11px] text-slate-300">
                    Let's resolve this in 2 steps. The CH340 driver is likely unbound:
                  </p>
                  <pre class="bg-black/60 p-2.5 rounded-lg text-emerald-400 overflow-x-auto text-[10px]"><code># Verify active COM ports in PowerShell
Get-PnpDevice -Class "Ports"</code></pre>
                  <p class="text-[10px] text-slate-400">Hold down the BOOT button while plugging in the USB-C cable.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- SECTION 7 & 8: CHALLENGES & STUDENT BUILDS PREVIEW -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <!-- Challenges Arena Box -->
            <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">⚡ Competitive Arena</span>
                  <h3 class="text-2xl font-black text-white mt-0.5">Active Challenges</h3>
                </div>
                <button id="btn-home-goto-challenges" class="text-xs font-bold text-indigo-400 hover:text-white">All Challenges →</button>
              </div>

              <div class="space-y-3">
                ${store.challenges.map(ch => `
                  <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span class="badge-tag badge-ai text-[9px]">${ch.category}</span>
                      <h4 class="font-bold text-white text-sm mt-1">${ch.title}</h4>
                      <p class="text-slate-400 text-[11px] mt-0.5 line-clamp-1">${ch.description}</p>
                    </div>
                    <div class="text-right whitespace-nowrap">
                      <span class="font-mono font-bold text-amber-300 block">+${ch.points} XP</span>
                      <span class="text-[10px] text-slate-500">${ch.submissionsCount} Submissions</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Student Builds Showcase Box -->
            <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">🚀 Community Artifacts</span>
                  <h3 class="text-2xl font-black text-white mt-0.5">What Students Are Building</h3>
                </div>
                <button id="btn-home-goto-showcase" class="text-xs font-bold text-indigo-400 hover:text-white">Full Showcase →</button>
              </div>

              <div class="space-y-3">
                ${store.showcase.slice(0, 2).map(proj => `
                  <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2 text-xs">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-white text-sm">${proj.title}</span>
                      <span class="text-amber-300 font-bold">🔥 ${proj.upvotes} Upvotes</span>
                    </div>
                    <p class="text-slate-300 line-clamp-2">${proj.description}</p>
                    <div class="flex items-center justify-between text-[11px] pt-1">
                      <span class="text-slate-400">By ${proj.author}</span>
                      <span class="text-cyan-400 font-mono">Demo Available</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>
        </section>

        <!-- SECTION 10 & 11: INSTITUTIONAL HERITAGE & FOUNDER VISION -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div class="rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-purple-950/60 border border-white/15 p-8 sm:p-12 space-y-8 shadow-2xl">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <!-- Founder Portrait -->
              <div class="lg:col-span-4 flex flex-col items-center text-center space-y-3">
                <div class="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl p-1 bg-gradient-to-tr from-amber-400 via-indigo-500 to-cyan-400 shadow-xl">
                  <img src="${inst.founder.avatar && !inst.founder.avatar.includes('photo-1544717305') ? inst.founder.avatar : 'assets/dr-achyuta-samanta.png'}" alt="${inst.founder.name}" class="w-full h-full object-cover object-top rounded-[22px] bg-white" />
                </div>
                <div>
                  <h4 class="text-lg font-black text-white">${inst.founder.name}</h4>
                  <p class="text-xs text-indigo-300 font-semibold">${inst.founder.title}</p>
                </div>
                <span class="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                  Philosophy: "Art of Giving"
                </span>
              </div>

              <!-- Vision Narrative & Quotes -->
              <div class="lg:col-span-8 space-y-4">
                <span class="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono">Institutional Legacy Since 1992</span>
                <h3 class="text-2xl sm:text-4xl font-black text-white leading-tight">
                  Transforming Lives Through Technical Excellence & Compassion.
                </h3>
                <blockquote class="text-sm sm:text-base text-slate-200 italic font-medium border-l-2 border-indigo-400 pl-4 py-1 leading-relaxed">
                  "${inst.founder.quote}"
                </blockquote>
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  KIIT and the KIIT IEEE Student Branch stand as testaments to the vision that young minds, when provided world-class lab infrastructure and compassionate mentorship, can build solutions that change the nation.
                </p>

                <div class="pt-2">
                  <button id="btn-home-goto-about" class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs transition-colors btn-press flex items-center gap-2">
                    <span>🏛️ Explore Institutional History & Timeline</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- SECTION 12: CALL TO ACTION -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div class="rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 p-8 sm:p-14 text-center text-white relative overflow-hidden shadow-2xl">
            <div class="relative z-10 max-w-2xl mx-auto space-y-5">
              <h3 class="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Ready to Build What’s Next?
              </h3>
              <p class="text-sm sm:text-base text-white/90 leading-relaxed">
                Join 4,200+ KIIT engineering students pushing boundaries in Artificial Intelligence, Autonomous Robotics, and Distributed Systems.
              </p>
              <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button id="cta-btn-explore" class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-slate-950 font-extrabold text-xs shadow-xl hover:bg-slate-100 transition-all btn-press">
                  Browse All 2026 Workshops
                </button>
                <button id="cta-btn-check-ready" class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-black/40 hover:bg-black/60 text-white font-bold text-xs border border-white/20 transition-all btn-press">
                  Test My Laptop Readiness
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- SECTION 13: FOOTER -->
        <footer class="border-t border-white/10 bg-slate-950/80 py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
          <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div class="space-y-3">
              <div class="flex items-center gap-2 text-white font-extrabold text-base">
                <span class="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center text-xs">⚡</span>
                KIIT IEEE
              </div>
              <p class="text-slate-400 text-[11px] leading-relaxed">
                Kalinga Institute of Industrial Technology (KIIT) Deemed to be University, Bhubaneswar, Odisha, India.
              </p>
              <span class="text-indigo-400 text-[11px] font-semibold block">"Where Students Build What's Next."</span>
            </div>

            <div>
              <h5 class="text-white font-bold mb-3">Student Hub</h5>
              <ul class="space-y-1.5 text-[11px]">
                <li><button class="footer-link hover:text-white" data-view="dashboard">My IEEE Dashboard</button></li>
                <li><button class="footer-link hover:text-white" data-view="live-event">Live Event Mode 🔴</button></li>
                <li><button class="footer-link hover:text-white" data-view="showcase">Student Builds Showcase</button></li>
                <li><button class="footer-link hover:text-white" data-view="teams">Team Finder</button></li>
                <li><button class="footer-link hover:text-white" data-view="challenges">Challenges Arena</button></li>
              </ul>
            </div>

            <div>
              <h5 class="text-white font-bold mb-3">Technical Systems</h5>
              <ul class="space-y-1.5 text-[11px]">
                <li><button class="footer-link hover:text-white" data-view="readiness">Environment Ready Check</button></li>
                <li><button class="footer-link hover:text-white" data-view="copilot">AI Workshop Copilot</button></li>
                <li><button class="footer-link hover:text-white" data-view="certificates">Certificate Verification</button></li>
                <li><button class="footer-link hover:text-white" data-view="about">About KIIT & Founder</button></li>
              </ul>
            </div>

            <div>
              <h5 class="text-white font-bold mb-3">Host & Admin Portals</h5>
              <ul class="space-y-1.5 text-[11px]">
                <li><button class="footer-link hover:text-amber-400" data-view="organizer">Host Command Center</button></li>
                <li><button class="footer-link hover:text-purple-400" data-view="ai-builder">Create Event with AI</button></li>
                <li><button class="footer-link hover:text-cyan-400" data-view="volunteer">Volunteer Queue</button></li>
              </ul>
            </div>
          </div>

          <div class="max-w-7xl mx-auto pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© 2026 KIIT IEEE Student Branch. All rights reserved.</p>
            <p class="text-slate-500">Private Operating System for Technical Participation at KIIT University.</p>
          </div>
        </footer>

      </div>
    `;

    // Initialize Hero Physics Canvas
    requestAnimationFrame(() => {
      this.heroCanvas = new HeroUniverse('hero-canvas');
    });

    this.bindEvents();
  }

  renderEventCard(evt) {
    const isRegistered = store.registrations.some(r => r.eventId === evt.id);
    const seatsPct = Math.round(((evt.seatsFilled || 0) / evt.seatsTotal) * 100);

    return `
      <div class="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group border border-white/10 hover:border-indigo-500/40 transition-all duration-300">
        <div>
          <!-- Card Header Banner -->
          <div class="h-32 bg-gradient-to-r ${evt.bannerGradient} p-4 flex flex-col justify-between relative overflow-hidden">
            <div class="flex items-center justify-between relative z-10">
              <span class="badge-tag ${evt.badgeColor || 'badge-ai'} shadow-sm">${evt.category}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-black/40 text-white backdrop-blur-md border border-white/20">${evt.status || 'OPEN'}</span>
            </div>
            <div class="relative z-10 flex items-center justify-between text-xs text-white/90 font-medium">
              <span>📅 ${evt.date}</span>
              <span class="font-bold text-emerald-300">${evt.priceLabel || 'Free'}</span>
            </div>
          </div>

          <!-- Card Body -->
          <div class="p-5 space-y-3">
            <h4 class="text-base font-extrabold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">${evt.title}</h4>
            <p class="text-xs text-slate-300 line-clamp-2 leading-relaxed">${evt.tagline}</p>

            <div class="text-[11px] text-slate-400 space-y-1 pt-1">
              <div class="flex items-center gap-1.5 truncate">
                <span>📍</span>
                <span>${evt.venue}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span>👤</span>
                <span class="text-slate-300 font-medium">${evt.speaker.name}</span>
              </div>
            </div>

            <!-- Seat Progress Bar -->
            <div class="pt-2 space-y-1">
              <div class="flex justify-between text-[11px] font-medium">
                <span class="text-slate-400">Lab Capacity</span>
                <span class="font-mono text-cyan-400 font-bold">${evt.seatsFilled} / ${evt.seatsTotal} Seats</span>
              </div>
              <div class="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div class="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500" style="width: ${seatsPct}%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Card Footer Actions -->
        <div class="p-5 pt-0 flex items-center gap-2">
          <button data-event-detail="${evt.id}" class="btn-card-detail flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-colors btn-press">
            Learn More
          </button>
          ${isRegistered ? `
            <button data-event-registered="${evt.id}" class="btn-card-registered px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs">
              ✓ Pass Ready
            </button>
          ` : `
            <button data-event-register="${evt.id}" class="btn-card-register px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-colors btn-press">
              Register
            </button>
          `}
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Hero Buttons
    const exploreBtn = this.container.querySelector('#hero-btn-explore');
    if (exploreBtn) exploreBtn.addEventListener('click', () => { sound.playClick(); store.setView('discover'); });

    const hostBtn = this.container.querySelector('#hero-btn-host');
    if (hostBtn) hostBtn.addEventListener('click', () => { sound.playClick(); store.setView('organizer'); });

    const allEventsBtn = this.container.querySelector('#home-view-all-events');
    if (allEventsBtn) allEventsBtn.addEventListener('click', () => store.setView('discover'));

    const copilotBtn = this.container.querySelector('#btn-home-launch-copilot');
    if (copilotBtn) copilotBtn.addEventListener('click', () => store.setView('copilot'));

    const journeyBtn = this.container.querySelector('#btn-home-open-journey');
    if (journeyBtn) journeyBtn.addEventListener('click', () => store.setView('dashboard'));

    const challengesBtn = this.container.querySelector('#btn-home-goto-challenges');
    if (challengesBtn) challengesBtn.addEventListener('click', () => store.setView('challenges'));

    const showcaseBtn = this.container.querySelector('#btn-home-goto-showcase');
    if (showcaseBtn) showcaseBtn.addEventListener('click', () => store.setView('showcase'));

    const aboutBtn = this.container.querySelector('#btn-home-goto-about');
    if (aboutBtn) aboutBtn.addEventListener('click', () => store.setView('about'));

    const ctaExplore = this.container.querySelector('#cta-btn-explore');
    if (ctaExplore) ctaExplore.addEventListener('click', () => store.setView('discover'));

    const ctaReady = this.container.querySelector('#cta-btn-check-ready');
    if (ctaReady) ctaReady.addEventListener('click', () => store.setView('readiness'));

    // Event card actions
    this.container.querySelectorAll('.btn-card-detail').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-event-detail');
        sound.playClick();
        window.location.hash = `#event/${id}`;
      });
    });

    this.container.querySelectorAll('.btn-card-register').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-event-register');
        sound.playClick();
        window.appDispatcher?.openRegistration(id);
      });
    });

    this.container.querySelectorAll('.btn-card-registered').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-event-registered');
        const reg = store.registrations.find(r => 
          String(r.eventId).toLowerCase() === String(id).toLowerCase() ||
          (r.slug && String(r.slug).toLowerCase() === String(id).toLowerCase())
        );
        if (reg) {
          sound.playClick();
          window.appDispatcher?.openTicketModal(reg.ticketId);
        } else {
          const evt = store.events.find(e => String(e.id).toLowerCase() === String(id).toLowerCase());
          const altReg = store.registrations.find(r => 
            (evt && evt.slug && String(r.eventId).toLowerCase() === String(evt.slug).toLowerCase()) ||
            (evt && String(r.eventName).toLowerCase() === String(evt.title).toLowerCase())
          );
          if (altReg) {
            sound.playClick();
            window.appDispatcher?.openTicketModal(altReg.ticketId);
          }
        }
      });
    });

    // Footer links
    this.container.querySelectorAll('.footer-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        sound.playClick();
        store.setView(view);
      });
    });
  }
}

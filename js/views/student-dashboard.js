/**
 * KIIT IEEE Platform - Student Experience Hub ("My KIIT IEEE")
 * "Where Students Build What's Next."
 * Level 7 Innovator, 1,240 XP bar, 4-day builder streak, Continue Building,
 * Multi-step missions, Digital Event Passport, and Skill Passport (Verified vs Declared).
 */

import { store } from '../state.js';
import { sound } from '../services/audio-service.js';
import { toast } from '../components/toast.js';

export class StudentDashboardView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeTab = 'overview'; // 'overview' | 'events' | 'missions' | 'passport' | 'skills' | 'history'
  }

  render() {
    if (!this.container) return;
    const user = store.user;
    const regs = store.registrations.filter(r => r.rollNo === user.rollNo || r.studentName === user.name);
    const certs = store.certificates.filter(c => c.rollNo === user.rollNo || c.studentName === user.name);
    const activeMissions = store.missions;
    const xpPercent = Math.min(100, Math.round(((user.currentXp || 1240) / (user.nextLevelXp || 1500)) * 100));

    // Next upcoming or live registered event
    const liveReg = regs.find(r => {
      const e = store.events.find(evt => evt.id === r.eventId);
      return e && e.status === 'LIVE';
    }) || regs[0];
    const liveEvent = liveReg ? store.events.find(e => e.id === liveReg.eventId) : null;

    // AI recommendations with rationale
    const recommended = store.events.filter(e => !regs.some(r => r.eventId === e.id)).slice(0, 2);

    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        
        <!-- Welcome Banner & Level Progression -->
        <div class="relative rounded-3xl bg-gradient-to-r from-indigo-950/90 via-slate-900 to-cyan-950/80 border border-indigo-500/30 p-6 sm:p-8 overflow-hidden shadow-2xl">
          <div class="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>

          <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            
            <!-- Student Identity & Level Tag -->
            <div class="flex items-center gap-4">
              <img src="${user.avatar}" alt="${user.name}" class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-indigo-400/50 shadow-xl" />
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <h1 class="text-2xl sm:text-3xl font-black text-white">Good morning, ${user.name.split(' ')[0]} 👋</h1>
                  <span class="live-pulse"></span>
                </div>
                <p class="text-xs text-slate-300">
                  What are you building next? • <span class="font-mono text-indigo-300 font-bold">${user.rollNo}</span> (${user.branch})
                </p>
                
                <!-- Level & Streak Badges -->
                <div class="flex flex-wrap items-center gap-2 pt-1">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                    LEVEL ${user.level || 7} — ${user.levelTitle || 'INNOVATOR'}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    🔥 ${user.streakDays || 4}-Day Builder Streak
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Team: ${user.teamRole || 'Lead AI Engineer'} (${user.teamId ? 'Team Nova' : 'Independent'})
                  </span>
                </div>
              </div>
            </div>

            <!-- Quick Launch Buttons -->
            <div class="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <button id="dash-btn-live-mode" class="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md shadow-rose-600/30 transition-all btn-press flex items-center justify-center gap-1.5 animate-pulse">
                <span>🔴</span> Enter Live Event
              </button>
              <button id="dash-btn-copilot" class="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition-all btn-press flex items-center justify-center gap-1.5">
                <span>⚡</span> AI Mentor
              </button>
            </div>

          </div>

          <!-- XP Progress Bar -->
          <div class="mt-6 pt-5 border-t border-white/10 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-white font-mono">${(user.currentXp || 1240).toLocaleString()} XP</span>
              <span class="text-slate-400 font-mono">${xpPercent}% to Level ${(user.level || 7) + 1} (${user.nextLevelXp || 1500} XP)</span>
            </div>
            <div class="w-full h-3 rounded-full bg-slate-950 overflow-hidden p-[2px] border border-white/10">
              <div class="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-500" style="width: ${xpPercent}%"></div>
            </div>
          </div>

        </div>

        <!-- Continue Building & Recommended Row -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Continue Building (In-Progress Event) -->
          <div class="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span class="text-xs font-bold uppercase tracking-wider text-cyan-400">Continue Building</span>
              </div>
              <span class="text-xs font-mono text-amber-300 font-bold">72% Completed</span>
            </div>

            <div>
              <h3 class="text-lg font-black text-white">${liveEvent ? liveEvent.title : 'AI & Edge Computer Vision Masterclass'}</h3>
              <p class="text-xs text-slate-300 mt-1">Lab 2: INT8 TensorRT Quantization on Jetson Orin Nano nodes.</p>
            </div>

            <!-- Personalized Event Journey Step Progress -->
            <div class="grid grid-cols-4 sm:grid-cols-8 gap-1 pt-1 text-center text-[10px]">
              <div class="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">✓ Registered</div>
              <div class="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">✓ Profile</div>
              <div class="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">✓ Setup Ready</div>
              <div class="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">✓ Check-in</div>
              <div class="p-1.5 rounded-lg bg-indigo-500/30 text-indigo-200 font-bold border border-indigo-500/40 animate-pulse">Lab 2 In Prog</div>
              <div class="p-1.5 rounded-lg bg-white/5 text-slate-400">□ Challenge</div>
              <div class="p-1.5 rounded-lg bg-white/5 text-slate-400">□ Project</div>
              <div class="p-1.5 rounded-lg bg-white/5 text-slate-400">□ Certificate</div>
            </div>

            <div class="pt-2 flex items-center justify-between">
              <span class="text-xs text-slate-400 font-mono">📍 Campus 15 Tech Lab 4 • Bench B17</span>
              <button id="btn-continue-live-session" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-xs shadow-md transition-all btn-press flex items-center gap-1.5">
                <span>Continue Lab</span>
                <span>→</span>
              </button>
            </div>
          </div>

          <!-- AI Recommended For You -->
          <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-indigo-400 text-lg">💡</span>
              <span class="text-xs font-bold uppercase tracking-wider text-indigo-300">AI Recommendations</span>
            </div>
            
            <p class="text-xs text-slate-300">
              Because you completed <span class="text-cyan-300 font-semibold">Python + PyTorch</span> activities:
            </p>

            <div class="space-y-2.5">
              ${recommended.map(evt => `
                <div class="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1 group">
                  <div class="flex items-center justify-between">
                    <span class="badge-tag badge-ai text-[9px]">${evt.category}</span>
                    <span class="text-[10px] text-emerald-400 font-bold">${evt.priceLabel || 'Free'}</span>
                  </div>
                  <h4 class="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">${evt.title}</h4>
                  <div class="pt-1 flex justify-between items-center text-[10px]">
                    <span class="text-slate-400">📅 ${evt.date}</span>
                    <button data-quick-reg="${evt.id}" class="btn-rec-register text-indigo-400 hover:text-white font-bold">Register →</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

        <!-- Navigation Tabs Bar -->
        <div class="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
          ${[
            { id: 'overview', label: 'Hub Overview' },
            { id: 'events', label: `My Events (${regs.length})` },
            { id: 'missions', label: `Active Missions (${activeMissions.length})` },
            { id: 'passport', label: 'Digital Event Passport 📜' },
            { id: 'skills', label: 'Skill Passport ⚡' },
            { id: 'history', label: 'XP History' }
          ].map(tab => `
            <button data-tab="${tab.id}" class="dash-tab-btn px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap btn-press ${this.activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}">
              ${tab.label}
            </button>
          `).join('')}
        </div>

        <!-- Dynamic Tab Content -->
        <div id="dash-tab-content">
          ${this.renderActiveTabContent(regs, certs, activeMissions, user)}
        </div>

      </div>
    `;

    this.bindEvents();
  }

  renderActiveTabContent(regs, certs, activeMissions, user) {
    switch (this.activeTab) {
      case 'events':
        return this.renderMyEventsTab(regs);
      case 'missions':
        return this.renderMissionsTab(activeMissions);
      case 'passport':
        return this.renderPassportTab(user);
      case 'skills':
        return this.renderSkillsTab(user);
      case 'history':
        return this.renderHistoryTab(user);
      case 'overview':
      default:
        return this.renderOverviewTab(regs, activeMissions);
    }
  }

  // --- TAB: OVERVIEW ---
  renderOverviewTab(regs, activeMissions) {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Active Mission Spotlight -->
        <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-white">Active Technical Mission</h3>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">+500 XP Reward</span>
          </div>

          <div>
            <h4 class="text-sm font-black text-white">${activeMissions[0].title}</h4>
            <p class="text-xs text-slate-400 mt-0.5">Solve the capstone road perception challenge to unlock the AI Master badge.</p>
          </div>

          <div class="space-y-2 text-xs">
            ${activeMissions[0].steps.map(s => `
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                <span class="${s.completed ? 'text-slate-300' : 'text-white font-semibold'}">${s.title}</span>
                <span class="${s.completed ? 'text-emerald-400 font-bold' : 'text-slate-500'} font-mono">${s.completed ? '✓ Done' : 'Incomplete'}</span>
              </div>
            `).join('')}
          </div>

          <button id="btn-goto-missions" class="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-colors">
            View All Missions →
          </button>
        </div>

        <!-- Recent Achievements -->
        <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-white">Earned Badges & Achievements</h3>
            <span class="text-xs text-slate-400 font-mono">${store.achievements.filter(a => a.earned).length} / ${store.achievements.length} Unlocked</span>
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            ${store.achievements.slice(0, 4).map(ach => `
              <div class="p-3 rounded-2xl ${ach.earned ? 'bg-indigo-950/40 border-indigo-500/30' : 'bg-slate-950/40 border-white/5 opacity-60'} border space-y-1">
                <div class="text-2xl">${ach.icon}</div>
                <div class="text-xs font-bold text-white">${ach.title}</div>
                <div class="text-[10px] text-slate-400 line-clamp-1">${ach.desc}</div>
              </div>
            `).join('')}
          </div>

          <button id="btn-goto-showcase" class="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-colors">
            Explore Community Showcase →
          </button>
        </div>

      </div>
    `;
  }

  // --- TAB: MY EVENTS ---
  renderMyEventsTab(regs) {
    return `
      <div class="space-y-4">
        <h3 class="text-base font-bold text-white">Your Confirmed Event Registrations</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${regs.map(r => {
            const evt = store.events.find(e => e.id === r.eventId);
            return `
              <div class="glass-card p-6 rounded-3xl border border-white/10 space-y-4 flex flex-col justify-between">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="badge-tag badge-ai text-[10px]">${r.track || 'General AI'}</span>
                    <span class="text-xs font-mono font-bold text-cyan-300">${r.ticketId}</span>
                  </div>
                  <h4 class="text-base font-bold text-white">${r.eventName}</h4>
                  <p class="text-xs text-slate-400">
                    Status: <span class="text-emerald-400 font-bold">${r.status}</span> • ${r.attended ? 'Attended ✓' : 'Door Check-in Ready'}
                  </p>
                </div>

                <div class="pt-3 border-t border-white/10 flex items-center gap-2">
                  <button data-ticket-id="${r.ticketId}" class="btn-dash-open-pass flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors btn-press">
                    View QR Pass 🎟️
                  </button>
                  <button data-live-id="${r.eventId}" class="btn-dash-open-live px-4 py-2.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors">
                    Live Event 🔴
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // --- TAB: MISSIONS ---
  renderMissionsTab(activeMissions) {
    return `
      <div class="space-y-6">
        <div>
          <h3 class="text-base font-bold text-white">Multi-Step Technical Missions</h3>
          <p class="text-xs text-slate-400">Complete multi-session milestones to earn verified portfolio badges and XP</p>
        </div>

        <div class="space-y-4">
          ${activeMissions.map(m => `
            <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-base font-black text-white">${m.title}</h4>
                  <span class="text-xs text-indigo-300 font-medium">Badge: ${m.badge}</span>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  +${m.rewardXp} XP
                </span>
              </div>

              <div class="space-y-2 text-xs">
                ${m.steps.map(step => `
                  <div class="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <input 
                        type="checkbox" 
                        data-mission-id="${m.id}" 
                        data-step-id="${step.id}" 
                        class="chk-mission-step w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-slate-900 border-white/20" 
                        ${step.completed ? 'checked disabled' : ''} 
                      />
                      <span class="${step.completed ? 'line-through text-slate-400' : 'text-slate-200 font-medium'}">${step.title}</span>
                    </div>
                    <span class="text-[10px] font-mono ${step.completed ? 'text-emerald-400 font-bold' : 'text-slate-500'}">
                      ${step.completed ? '✓ Completed' : 'Pending'}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --- TAB: DIGITAL EVENT PASSPORT ---
  renderPassportTab(user) {
    const entries = user.passportEntries || [];
    return `
      <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div>
          <h3 class="text-xl font-black text-white">Digital Event Passport</h3>
          <p class="text-xs text-slate-400">Cryptographically stamped timeline of verified KIIT IEEE laboratory participation</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${entries.map(entry => `
            <div class="p-5 rounded-3xl bg-slate-950/80 border border-indigo-500/30 relative overflow-hidden space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono font-bold text-cyan-400 uppercase">${entry.year} Edition</span>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ${entry.status}
                </span>
              </div>
              <h4 class="text-base font-bold text-white">${entry.eventName}</h4>
              <p class="text-xs text-slate-400">📍 ${entry.venue} • Check-in: <span class="font-mono text-slate-300">${entry.checkInTime}</span></p>
              
              <div class="space-y-1 pt-1 text-xs">
                ${entry.milestones.map(m => `
                  <div class="flex items-center gap-2">
                    <span class="${m.completed ? 'text-emerald-400' : 'text-slate-600'}">✓</span>
                    <span class="${m.completed ? 'text-slate-200' : 'text-slate-500'}">${m.name}</span>
                  </div>
                `).join('')}
              </div>

              <div class="pt-2 text-xs font-bold text-amber-300 font-mono">
                ${entry.badge}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --- TAB: SKILL PASSPORT ---
  renderSkillsTab(user) {
    const skills = user.skills || [];
    return `
      <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div>
          <h3 class="text-xl font-black text-white">Skill Passport</h3>
          <p class="text-xs text-slate-400">Verified through laboratory completion and code submissions vs. self-declared proficiencies</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${skills.map(s => `
            <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2 text-xs">
              <div class="flex items-center justify-between">
                <span class="font-bold text-white">${s.name}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${s.type === 'verified' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-slate-400'}">
                  ${s.type === 'verified' ? '✓ Verified' : 'Self-Declared'}
                </span>
              </div>

              <div class="flex items-center justify-between text-[11px] text-slate-400">
                <span>Score: <strong class="text-cyan-400 font-mono">${s.score}/100</strong></span>
                <span class="text-slate-500 text-[10px] truncate max-w-[180px]">${s.source}</span>
              </div>

              <div class="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div class="h-full rounded-full ${s.type === 'verified' ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' : 'bg-slate-700'}" style="width: ${s.score}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --- TAB: XP TRANSACTION HISTORY ---
  renderHistoryTab(user) {
    const history = user.xpHistory || [];
    return `
      <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <div>
          <h3 class="text-xl font-black text-white">XP Transaction Ledger</h3>
          <p class="text-xs text-slate-400">Every XP reward is recorded as an immutable progression transaction</p>
        </div>

        <div class="space-y-2 text-xs">
          ${history.map(tx => `
            <div class="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
              <div class="space-y-0.5">
                <div class="font-bold text-white">${tx.reason}</div>
                <div class="text-[10px] text-slate-500 font-mono">${tx.date}</div>
              </div>
              <span class="font-mono font-black text-emerald-400 text-sm">+${tx.amount} XP</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Switch tabs
    this.container.querySelectorAll('.dash-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
      });
    });

    // Enter Live Mode
    const liveBtn = this.container.querySelector('#dash-btn-live-mode');
    if (liveBtn) liveBtn.addEventListener('click', () => store.setView('live-event'));

    // Launch Copilot
    const copilotBtn = this.container.querySelector('#dash-btn-copilot');
    if (copilotBtn) copilotBtn.addEventListener('click', () => store.setView('copilot'));

    // Continue Lab session
    const continueBtn = this.container.querySelector('#btn-continue-live-session');
    if (continueBtn) continueBtn.addEventListener('click', () => store.setView('live-event'));

    // Open QR pass
    this.container.querySelectorAll('.btn-dash-open-pass').forEach(btn => {
      btn.addEventListener('click', () => {
        const tkt = btn.getAttribute('data-ticket-id');
        sound.playClick();
        window.appDispatcher?.openTicketModal(tkt);
      });
    });

    // Quick open Live Event from event card
    this.container.querySelectorAll('.btn-dash-open-live').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        store.setView('live-event');
      });
    });

    // Register button in recommendation
    this.container.querySelectorAll('.btn-rec-register').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-quick-reg');
        sound.playClick();
        window.appDispatcher?.openRegistration(id);
      });
    });

    // Mission checkbox
    this.container.querySelectorAll('.chk-mission-step').forEach(chk => {
      chk.addEventListener('change', () => {
        if (chk.checked) {
          const mId = chk.getAttribute('data-mission-id');
          const sId = chk.getAttribute('data-step-id');
          sound.playSuccess();
          store.completeMissionStep(mId, sId);
          this.render();
        }
      });
    });

    // Nav helpers
    const gotoMissions = this.container.querySelector('#btn-goto-missions');
    if (gotoMissions) gotoMissions.addEventListener('click', () => { this.activeTab = 'missions'; this.render(); });

    const gotoShowcase = this.container.querySelector('#btn-goto-showcase');
    if (gotoShowcase) gotoShowcase.addEventListener('click', () => store.setView('showcase'));
  }
}

/**
 * KIIT IEEE Platform - Live Event Mode ("🔴 LIVE EVENT")
 * The operational command screen for students during an in-progress workshop or hackathon.
 */

import { store } from '../state.js';
import { sound } from '../services/audio-service.js';
import { toast } from '../components/toast.js';
import { AIService } from '../services/ai-service.js';

export class LiveEventView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.helpModalOpen = false;
    this.quickChatInput = '';
    this.quickChatMessages = [
      { sender: 'mentor', text: 'Welcome to Lab 2! TensorRT nodes are configured at each bench. Let me know if you run into INT8 quantization errors.' }
    ];
  }

  render() {
    if (!this.container) return;
    const user = store.user;
    const liveEvent = store.events.find(e => e.status === 'LIVE') || store.events[0];
    const userReg = store.registrations.find(r => r.eventId === liveEvent.id) || store.registrations[0];
    const session = liveEvent.currentSession || {
      title: "Lab 2: Quantization & TensorRT Deployment on Edge Jetson Nodes",
      instructor: "Dr. Priyadarshi Sen",
      timeRemaining: "42 mins",
      progress: 68,
      room: "Tech Lab 4, Campus 15",
      announcement: "Flash your calibrated weights to the Jetson Orin Nano node before 3:30 PM."
    };

    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-6">
        
        <!-- Live Status Bar -->
        <div class="rounded-3xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-indigo-950/80 border border-rose-500/40 p-6 shadow-2xl relative overflow-hidden">
          <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            
            <div class="space-y-2">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider">
                <span class="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping"></span>
                🔴 LIVE EVENT IN PROGRESS
              </div>
              <h1 class="text-2xl sm:text-4xl font-black text-white tracking-tight">${liveEvent.title}</h1>
              <p class="text-xs sm:text-sm text-slate-300">
                📍 ${session.room} • Instructor: <span class="text-cyan-300 font-semibold">${session.instructor}</span>
              </p>
            </div>

            <!-- Attendance & Bench Badge -->
            <div class="flex flex-wrap items-center gap-3">
              <div class="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-center min-w-[120px]">
                <span class="text-[10px] uppercase font-bold text-slate-400">Assigned Bench</span>
                <div class="text-lg font-black text-amber-300 font-mono">${userReg ? userReg.bench || 'Bench B17' : 'Bench B17'}</div>
              </div>

              <div class="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-center min-w-[120px]">
                <span class="text-[10px] uppercase font-bold text-slate-400">Team</span>
                <div class="text-lg font-black text-indigo-300 truncate">${userReg ? userReg.team || 'Team Nova' : 'Team Nova'}</div>
              </div>

              <div class="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center min-w-[120px]">
                <span class="text-[10px] uppercase font-bold text-emerald-400">Door Pass</span>
                <div class="text-sm font-black text-emerald-300">✓ Checked In</div>
              </div>
            </div>

          </div>

          <!-- Live Announcement Ticker -->
          <div class="mt-4 pt-4 border-t border-white/10 flex items-center gap-3 text-xs">
            <span class="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-bold text-[10px] uppercase whitespace-nowrap">Broadcast</span>
            <span class="text-slate-200 font-medium truncate">📢 "${session.announcement}"</span>
          </div>
        </div>

        <!-- 3-Column Live Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Left Column: Session Progress & Agenda (5 cols) -->
          <div class="lg:col-span-5 space-y-6">
            
            <!-- Current Session Countdown Card -->
            <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-cyan-400 uppercase tracking-wider">Active Milestone</span>
                <span class="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white/5 text-amber-300 border border-white/10">
                  ⏳ ${session.timeRemaining} Left
                </span>
              </div>
              <h3 class="text-lg font-black text-white">${session.title}</h3>
              
              <!-- Progress Bar -->
              <div class="space-y-1.5">
                <div class="flex justify-between text-xs text-slate-400 font-medium">
                  <span>Lab Progress</span>
                  <span>${session.progress}% Complete</span>
                </div>
                <div class="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden p-[1px] border border-white/10">
                  <div class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style="width: ${session.progress}%"></div>
                </div>
              </div>

              <!-- Quick Dispatch Help Action -->
              <div class="pt-2">
                <button id="btn-live-request-help" class="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all btn-press flex items-center justify-center gap-2">
                  <span>🚨</span> Request Volunteer to Bench (${userReg ? userReg.bench : 'B17'})
                </button>
              </div>
            </div>

            <!-- Full Workshop Timeline -->
            <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
              <h4 class="text-xs font-bold uppercase text-slate-400 tracking-wider">Today's Lab Schedule</h4>
              <div class="space-y-2">
                ${liveEvent.schedule.map((item, idx) => `
                  <div class="p-3 rounded-2xl border ${item.status === 'In Progress' ? 'bg-indigo-950/40 border-indigo-500/40' : 'bg-slate-950/40 border-white/5'} flex items-center justify-between text-xs">
                    <div class="space-y-0.5">
                      <span class="text-[10px] font-mono text-cyan-400">${item.time}</span>
                      <div class="font-bold text-white">${item.title}</div>
                    </div>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      item.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' :
                      item.status === 'In Progress' ? 'bg-amber-500/20 text-amber-300 animate-pulse' :
                      'bg-white/5 text-slate-400'
                    }">
                      ${item.status}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>

          <!-- Right Column: Interactive Live AI Copilot & Active Challenge (7 cols) -->
          <div class="lg:col-span-7 space-y-6">
            
            <!-- Live Event AI Mentor Window -->
            <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-white/10">
                <div class="flex items-center gap-2">
                  <span class="text-cyan-400 text-lg">⚡</span>
                  <div>
                    <h3 class="text-sm font-bold text-white">Live Event AI Mentor</h3>
                    <p class="text-[10px] text-slate-400">Contextualized for ${liveEvent.title}</p>
                  </div>
                </div>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready • Low Latency
                </span>
              </div>

              <!-- Quick Chat Messages History -->
              <div id="live-chat-messages" class="h-48 overflow-y-auto space-y-2.5 p-3 rounded-2xl bg-slate-950/60 border border-white/5 text-xs font-mono">
                ${this.quickChatMessages.map(m => `
                  <div class="${m.sender === 'user' ? 'text-right' : 'text-left'}">
                    <div class="inline-block p-2.5 rounded-xl max-w-[85%] text-left ${m.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-white/10 text-slate-200'}">
                      <span class="text-[9px] block ${m.sender === 'user' ? 'text-indigo-200' : 'text-cyan-400'} font-bold mb-0.5">
                        ${m.sender === 'user' ? 'You' : '⚡ AI Lab Mentor'}
                      </span>
                      ${m.text}
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Quick Questions Pills -->
              <div class="flex flex-wrap gap-1.5 pt-1">
                <button class="btn-live-quick-q px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 border border-white/10">
                  Fix CUDA OOM in INT8 calibration
                </button>
                <button class="btn-live-quick-q px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 border border-white/10">
                  How do I transfer model to Jetson Orin?
                </button>
                <button class="btn-live-quick-q px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 border border-white/10">
                  Lane detection Hough Transform hint
                </button>
              </div>

              <!-- Chat Input -->
              <form id="live-chat-form" class="flex gap-2">
                <input 
                  type="text" 
                  id="live-chat-input" 
                  placeholder="Ask a technical question about today's code, hardware, or errors..."
                  class="flex-1 bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" 
                />
                <button type="submit" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors btn-press">
                  Ask AI
                </button>
              </form>
            </div>

            <!-- Active Live Challenge Card -->
            <div class="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-cyan-950/40 space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-amber-400 text-lg">⚡</span>
                  <div>
                    <h3 class="text-sm font-bold text-white">Live Workshop Challenge #01</h3>
                    <p class="text-[10px] text-slate-400">Target Accuracy: >85% at 30 FPS</p>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  +350 XP
                </span>
              </div>
              <p class="text-xs text-slate-300">
                Optimize your quantized model for real-time lane and hazard perception on the Jetson Orin Nano node.
              </p>
              
              <div class="flex items-center justify-between pt-2 border-t border-white/10">
                <span class="text-xs text-slate-400">Submissions Close at 04:30 PM</span>
                <button id="btn-live-submit-challenge" class="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all btn-press">
                  Submit Challenge Code 🚀
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Request Volunteer Help
    const helpBtn = this.container.querySelector('#btn-live-request-help');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        sound.playClick();
        window.appDispatcher?.openVolunteerModal();
      });
    }

    // Submit Challenge Code
    const chalBtn = this.container.querySelector('#btn-live-submit-challenge');
    if (chalBtn) {
      chalBtn.addEventListener('click', () => {
        sound.playClick();
        store.setView('challenges');
      });
    }

    // Quick Question Pills
    this.container.querySelectorAll('.btn-live-quick-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.innerText.trim();
        this.submitQuickQuestion(text);
      });
    });

    // Chat Form
    const chatForm = this.container.querySelector('#live-chat-form');
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = this.container.querySelector('#live-chat-input');
        if (input && input.value.trim()) {
          this.submitQuickQuestion(input.value.trim());
          input.value = '';
        }
      });
    }
  }

  async submitQuickQuestion(question) {
    if (!question || !question.trim()) return;
    sound.playClick();
    this.quickChatMessages.push({ sender: 'user', text: question.trim() });
    this.render();

    try {
      const liveEvent = store.events.find(e => e.status === 'LIVE') || store.events[0];
      const res = await AIService.askWorkshopCopilot(question, liveEvent);
      this.quickChatMessages.push({ sender: 'mentor', text: res.text || 'Solution verified by KIIT IEEE Workshop Mentor.' });
      sound.playSuccess();
      this.render();
    } catch (err) {
      console.warn('[LiveEventView] AI fallback:', err);
      let reply = "Here's the recommended fix:";
      if (question.toLowerCase().includes('cuda') || question.toLowerCase().includes('oom')) {
        reply = "CUDA OOM in INT8 calibration: Reduce batch size to 8 in your dataloader and invoke `torch.cuda.empty_cache()` before running TensorRT builder.";
      } else if (question.toLowerCase().includes('jetson') || question.toLowerCase().includes('transfer')) {
        reply = "Use SCP to copy the `.engine` file directly to the Jetson IP: `scp model_int8.engine user@192.168.1.104:/home/user/workspace/`";
      } else {
        reply = `For "${question}": Check the workshop reference solution in the IEEE repository under \`/solutions/lab2_reference.py\`.`;
      }
      this.quickChatMessages.push({ sender: 'mentor', text: reply });
      sound.playSuccess();
      this.render();
    }
  }
}

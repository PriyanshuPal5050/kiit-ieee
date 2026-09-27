/**
 * KIIT IEEE Platform - Coding Challenges & Mini-Hackathons Arena
 * Technical problem statements, submission workflows, visual progress, and leaderboard.
 */

import { store } from '../state.js';
import { sound } from '../services/audio-service.js';
import { toast } from '../components/toast.js';

export class ChallengesView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedChallenge = null;
  }

  render() {
    if (!this.container) return;
    const challenges = store.challenges;
    const mySubmissions = store.user.challengeSubmissions || [];

    const leaderboard = [
      { rank: 1, name: 'Aditya Mishra', roll: '2205091', points: 1450, solved: 4 },
      { rank: 2, name: 'Ananya Tripathy', roll: '2305141', points: 1200, solved: 3 },
      { rank: 3, name: 'Aryan Mohapatra (You)', roll: '2205184', points: 950, solved: 2 },
      { rank: 4, name: 'Devika Sharma', roll: '2205210', points: 800, solved: 2 },
      { rank: 5, name: 'Rohan Verma', roll: '2205091', points: 650, solved: 1 }
    ];

    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        
        <!-- Header -->
        <div class="pb-4 border-b border-white/10">
          <div class="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">
            <span>🏆</span> Competitive Engineering
          </div>
          <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight">Challenges & Hackathons</h1>
          <p class="text-sm text-slate-400 mt-1 max-w-xl">
            Tackle real-world problems in Edge AI, Embedded Systems, and Web3. Submit code to win hardware kits, bounties, and IEEE merit badges.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Left 2 Cols: Challenge Cards -->
          <div class="lg:col-span-2 space-y-6">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <span>⚡</span> Active Technical Bounties
            </h3>

            <div class="space-y-4">
              ${challenges.map(ch => {
                const isSubmitted = mySubmissions.some(s => s.challengeId === ch.id);
                return `
                  <div class="glass-card p-6 rounded-2xl border border-white/10 hover:border-indigo-500/40 space-y-4 transition-all">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div class="flex items-center gap-2.5">
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          ${ch.category}
                        </span>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${this.getDiffBadge(ch.difficulty)}">
                          ${ch.difficulty}
                        </span>
                      </div>
                      <div class="flex items-center gap-2 text-xs">
                        <span class="text-slate-400">Deadline: <strong>${ch.deadline}</strong></span>
                        <span class="text-amber-400 font-bold font-mono">★ ${ch.points} Pts</span>
                      </div>
                    </div>

                    <div>
                      <h4 class="text-base font-extrabold text-white">${ch.title}</h4>
                      <p class="text-xs text-slate-300 mt-1.5 leading-relaxed">${ch.description}</p>
                    </div>

                    <!-- Meta & Actions -->
                    <div class="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div class="flex items-center gap-4 text-slate-400 text-[11px]">
                        <span>👥 ${ch.participants} Builders</span>
                        <span>📤 ${ch.submissionsCount} Submissions</span>
                        <span class="text-emerald-400 font-semibold">Prize: ${ch.prize}</span>
                      </div>

                      <div class="flex items-center gap-2">
                        ${isSubmitted ? `
                          <span class="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                            ✓ Submitted
                          </span>
                        ` : `
                          <button data-chl-id="${ch.id}" class="btn-open-submit-modal px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all btn-press flex items-center gap-1.5">
                            <span>🚀</span> Submit Solution
                          </button>
                        `}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Right 1 Col: Leaderboard & User Progress -->
          <div class="space-y-6">
            
            <!-- My Progress Card -->
            <div class="glass-card p-5 rounded-2xl border border-indigo-500/30 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-400 uppercase">My Challenge Stats</span>
                <span class="text-xs font-mono font-bold text-amber-400">950 PTS</span>
              </div>
              <div class="grid grid-cols-2 gap-2 text-center pt-1">
                <div class="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                  <div class="text-xl font-black text-white">#3</div>
                  <div class="text-[10px] text-slate-400">Campus Rank</div>
                </div>
                <div class="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                  <div class="text-xl font-black text-emerald-400">${mySubmissions.length}</div>
                  <div class="text-[10px] text-slate-400">Completed</div>
                </div>
              </div>
            </div>

            <!-- Leaderboard -->
            <div class="glass-card p-5 rounded-2xl border border-white/10 space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>🏅</span> Campus Hall of Fame
                </h4>
                <span class="text-[10px] text-slate-400 font-mono">Autumn 2026</span>
              </div>

              <div class="space-y-2">
                ${leaderboard.map(lb => `
                  <div class="flex items-center justify-between p-2.5 rounded-xl ${lb.name.includes('(You)') ? 'bg-indigo-600/20 border border-indigo-500/30' : 'bg-slate-950/40 border border-white/5'} text-xs">
                    <div class="flex items-center gap-2.5">
                      <span class="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${lb.rank === 1 ? 'bg-amber-400 text-slate-950' : (lb.rank === 2 ? 'bg-slate-300 text-slate-950' : 'bg-white/10 text-slate-400')}">
                        ${lb.rank}
                      </span>
                      <div>
                        <div class="font-bold text-white">${lb.name}</div>
                        <div class="text-[10px] text-slate-400 font-mono">${lb.solved} Challenges Solved</div>
                      </div>
                    </div>
                    <span class="font-mono font-bold text-amber-400">${lb.points} pts</span>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>

        </div>

        <!-- Submission Modal Container -->
        <div id="challenge-submit-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop hidden overflow-y-auto">
          <div class="relative w-full max-w-md bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl my-8">
            <div class="p-6 bg-gradient-to-r from-indigo-950 to-slate-900 border-b border-white/10 flex items-center justify-between">
              <div>
                <span class="text-[10px] uppercase font-bold text-indigo-400">Challenge Submission</span>
                <h3 id="submit-modal-title" class="text-base font-bold text-white mt-0.5">Submit Project</h3>
              </div>
              <button id="btn-close-chl-modal" class="p-1.5 rounded-full bg-white/10 text-white">✕</button>
            </div>

            <div class="p-6 space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">GitHub Repository URL *</label>
                <input type="url" id="chl-repo-url" placeholder="https://github.com/username/project" class="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500" required />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Live Demo / Deployed Link (Optional)</label>
                <input type="url" id="chl-demo-url" placeholder="https://your-demo.vercel.app" class="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500" />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1">Architecture & Solution Summary</label>
                <textarea id="chl-notes" rows="3" placeholder="Briefly describe your algorithm, libraries used, and benchmark results..." class="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"></textarea>
              </div>

              <button id="btn-submit-chl-solution" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all btn-press">
                🚀 Confirm & Submit Solution
              </button>
            </div>
          </div>
        </div>

      </div>
    `;

    this.bindEvents();
  }

  getDiffBadge(d) {
    if (d === 'Hard') return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
    if (d === 'Medium') return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
  }

  bindEvents() {
    const modal = this.container.querySelector('#challenge-submit-modal');
    const closeBtn = this.container.querySelector('#btn-close-chl-modal');
    const submitBtn = this.container.querySelector('#btn-submit-chl-solution');
    const titleEl = this.container.querySelector('#submit-modal-title');

    // Open submit modal
    this.container.querySelectorAll('.btn-open-submit-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-chl-id');
        this.selectedChallenge = store.challenges.find(c => c.id === id);
        if (this.selectedChallenge && modal && titleEl) {
          titleEl.textContent = this.selectedChallenge.title;
          modal.classList.remove('hidden');
          sound.playClick();
        }
      });
    });

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        sound.playClick();
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
          sound.playClick();
        }
      });
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
          modal.classList.add('hidden');
        }
      });
    }

    if (submitBtn && modal) {
      submitBtn.addEventListener('click', () => {
        const repoUrl = this.container.querySelector('#chl-repo-url')?.value.trim();
        const demoUrl = this.container.querySelector('#chl-demo-url')?.value.trim();
        const notes = this.container.querySelector('#chl-notes')?.value.trim();

        if (!repoUrl) {
          toast.show({ title: 'Repository Required', message: 'Please provide your GitHub repository link.', type: 'warning' });
          return;
        }

        if (this.selectedChallenge) {
          store.submitChallenge(this.selectedChallenge.id, { repoUrl, demoUrl, notes });
          if (typeof confetti === 'function') {
            confetti({ particleCount: 80, spread: 60 });
          }
          sound.playSuccess();
          modal.classList.add('hidden');
          toast.show({ title: 'Challenge Submitted! 🚀', message: `Solution for "${this.selectedChallenge.title}" submitted successfully!`, type: 'success' });
          this.render();
        }
      });
    }
  }
}

/**
 * KIIT IEEE Platform - Student Technical Portfolio & Identity
 * Professional engineering profile, verified skills inventory, and event timeline.
 */

import { store } from '../state.js';
import { sound } from '../services/audio-service.js';

export class ProfileView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render() {
    if (!this.container) return;
    const user = store.user;
    const regs = store.registrations;
    const certs = store.certificates;
    const challenges = user.challengeSubmissions || [];

    this.container.innerHTML = `
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        
        <!-- Profile Identity Card -->
        <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 relative overflow-hidden shadow-2xl">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div class="flex items-center gap-5">
              <img src="${user.avatar}" alt="${user.name}" class="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-indigo-400 shadow-xl" />
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <h1 class="text-2xl sm:text-3xl font-black text-white">${user.name}</h1>
                  <span class="live-pulse"></span>
                </div>
                <p class="text-xs sm:text-sm text-indigo-300 font-mono">
                  ${user.rollNo} • ${user.branch} • ${user.year}
                </p>
                <p class="text-xs text-slate-400">Kalinga Institute of Industrial Technology, Bhubaneswar</p>
                <div class="flex items-center gap-3 pt-1 text-xs">
                  ${user.github ? `
                    <a href="${user.github}" target="_blank" class="text-slate-300 hover:text-white flex items-center gap-1 font-mono text-[11px]">
                      <span>🐙</span> GitHub
                    </a>
                  ` : ''}
                  ${user.linkedin ? `
                    <a href="${user.linkedin}" target="_blank" class="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]">
                      <span>💼</span> LinkedIn
                    </a>
                  ` : ''}
                </div>
              </div>
            </div>

            <!-- Profile Action Controls -->
            <div class="flex flex-wrap items-center gap-2">
              <button id="btn-open-edit-profile" class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all btn-press">
                Edit Profile ✏️
              </button>
              <button id="btn-profile-switch-account" class="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 font-bold text-xs transition-all btn-press">
                Switch Role ⚡
              </button>
              <button id="btn-profile-notifs" class="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all" title="View Notifications">
                🔔
              </button>
              <button id="btn-profile-audio" class="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all" title="Toggle Sound">
                ${store.soundEnabled ? '🔊' : '🔇'}
              </button>
              <button id="btn-profile-logout" class="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs transition-all btn-press" title="Sign out from session">
                Logout 🚪
              </button>
            </div>
          </div>

          <!-- Quick Metrics Bar -->
          <div class="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div class="p-3 rounded-2xl bg-slate-950/60 border border-white/5">
              <div class="text-2xl font-black text-white">${regs.length}</div>
              <div class="text-[11px] text-slate-400">Events Registered</div>
            </div>
            <div class="p-3 rounded-2xl bg-slate-950/60 border border-white/5">
              <div class="text-2xl font-black text-cyan-400">${certs.length}</div>
              <div class="text-[11px] text-slate-400">Credentials Issued</div>
            </div>
            <div class="p-3 rounded-2xl bg-slate-950/60 border border-white/5">
              <div class="text-2xl font-black text-amber-400">${challenges.length}</div>
              <div class="text-[11px] text-slate-400">Challenges Solved</div>
            </div>
            <div class="p-3 rounded-2xl bg-slate-950/60 border border-white/5">
              <div class="text-2xl font-black text-emerald-400">87%</div>
              <div class="text-[11px] text-slate-400">Readiness Score</div>
            </div>
          </div>
        </div>

        <!-- Skills Inventory Matrix -->
        <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-white">Verified Technical Competencies</h3>
              <p class="text-xs text-slate-400">Evaluated through workshop capstone reviews and code benchmarking.</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 pt-2">
            ${user.skills.map(s => `
              <div class="px-3.5 py-1.5 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-xs font-semibold text-indigo-300 flex items-center gap-1.5 shadow-sm">
                <span class="text-emerald-400">✓</span>
                <span>${s}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Two Columns: Registered Events & Earned Certificates -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Registered Events -->
          <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 class="text-base font-bold text-white">Active Workshop Passes</h3>
            <div class="space-y-3">
              ${regs.map(r => `
                <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between gap-3">
                  <div>
                    <h5 class="text-sm font-bold text-white">${r.eventName || 'Workshop Lab'}</h5>
                    <div class="text-[11px] text-slate-400 font-mono mt-0.5">Ticket: ${r.ticketId} • ${r.track || 'Track 1'}</div>
                  </div>
                  <button data-tkt="${r.ticketId}" class="btn-profile-ticket px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs btn-press">
                    Pass QR
                  </button>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Verified Credentials -->
          <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 class="text-base font-bold text-white">Official IEEE Certificates</h3>
            <div class="space-y-3">
              ${certs.map(c => `
                <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between gap-3">
                  <div>
                    <h5 class="text-sm font-bold text-white">${c.eventName}</h5>
                    <div class="text-[11px] text-emerald-400 font-semibold mt-0.5">${c.grade} • ${c.issueDate}</div>
                  </div>
                  <button class="btn-profile-view-cert px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold btn-press">
                    View Cert
                  </button>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Open edit profile modal
    const editBtn = this.container.querySelector('#btn-open-edit-profile');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        sound.playClick();
        window.appDispatcher?.openProfileModal();
      });
    }

    // Switch role / Open auth modal
    const switchBtn = this.container.querySelector('#btn-profile-switch-account');
    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        sound.playClick();
        window.appDispatcher?.openAuthModal();
      });
    }

    // Notifications
    const notifsBtn = this.container.querySelector('#btn-profile-notifs');
    if (notifsBtn) {
      notifsBtn.addEventListener('click', () => {
        sound.playClick();
        window.appDispatcher?.openNotifications();
      });
    }

    // Audio toggle
    const audioBtn = this.container.querySelector('#btn-profile-audio');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const enabled = store.toggleSound();
        if (enabled) sound.playClick();
        this.render();
      });
    }

    // Logout
    const logoutBtn = this.container.querySelector('#btn-profile-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        sound.playBeep();
        store.switchAccount('student');
        localStorage.removeItem('KIIT_IEEE_USER_SESSION');
        window.appDispatcher?.openAuthModal('student');
      });
    }

    // View Pass
    this.container.querySelectorAll('.btn-profile-ticket').forEach(btn => {
      btn.addEventListener('click', () => {
        const tkt = btn.getAttribute('data-tkt');
        sound.playClick();
        window.appDispatcher?.openTicketModal(tkt);
      });
    });

    // View cert
    this.container.querySelectorAll('.btn-profile-view-cert').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        store.setView('certificates');
      });
    });
  }
}

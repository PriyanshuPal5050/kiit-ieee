/**
 * KIIT IEEE Platform - Student Detail View For Host
 * Comprehensive operational profile inspection for event organizers.
 */

import { store } from '../state.js';
import { sound } from '../services/audio-service.js';
import { toast } from './toast.js';

export class StudentDetailModal {
  constructor() {
    this.container = document.getElementById('student-detail-modal-root');
    this.isOpen = false;
    this.currentTicket = null;
    this.init();
  }

  init() {
    if (!this.container) {
      let el = document.getElementById('student-detail-modal-root');
      if (!el) {
        el = document.createElement('div');
        el.id = 'student-detail-modal-root';
        document.body.appendChild(el);
      }
      this.container = el;
    }
    this.container.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop hidden overflow-y-auto';
    this.container.style.display = 'none';
  }

  open(ticketId) {
    const reg = store.registrations.find(r => r.ticketId === ticketId);
    if (!reg) return;
    this.currentTicket = reg;
    this.isOpen = true;
    this.render();
    this.container.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop overflow-y-auto';
    this.container.classList.remove('hidden');
    this.container.style.display = 'flex';
    this._handleKeydown = (e) => {
      if (e.key === 'Escape') this.close();
    };
    window.addEventListener('keydown', this._handleKeydown);
  }

  close() {
    this.isOpen = false;
    if (this._handleKeydown) {
      window.removeEventListener('keydown', this._handleKeydown);
      this._handleKeydown = null;
    }
    if (this.container) {
      this.container.classList.add('hidden');
      this.container.style.display = 'none';
      this.container.innerHTML = '';
    }
  }

  render() {
    if (!this.container || !this.isOpen || !this.currentTicket) return;
    const r = this.currentTicket;
    const event = store.events.find(e => e.id === r.eventId);

    this.container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
        <div class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6">
          
          <!-- Close Button -->
          <button id="student-detail-close" class="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <!-- Header Spotlight -->
          <div class="flex items-start gap-4">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" alt="${r.studentName}" class="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400/40" />
            <div class="space-y-1">
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase">
                <span>🛡️</span> Organizer Inspection Mode
              </div>
              <h3 class="text-2xl font-black text-white">${r.studentName}</h3>
              <p class="text-xs text-slate-400 font-mono">
                Roll No: <span class="text-indigo-300 font-bold">${r.rollNo}</span> • ${r.branch || 'CSE'} (${r.year || '3rd Year'})
              </p>
            </div>
          </div>

          <!-- Quick Metrics 4-Column Bar -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-3 rounded-2xl bg-slate-950/60 border border-white/10">
              <span class="text-[10px] uppercase font-bold text-slate-400">Preparation</span>
              <div class="text-xl font-black text-emerald-400">${r.prepScore || 87}%</div>
              <span class="text-[10px] text-slate-500">Env Ready</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-950/60 border border-white/10">
              <span class="text-[10px] uppercase font-bold text-slate-400">Workshop</span>
              <div class="text-xl font-black text-cyan-400">${r.workshopProgress || 72}%</div>
              <span class="text-[10px] text-slate-500">Labs Completed</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-950/60 border border-white/10">
              <span class="text-[10px] uppercase font-bold text-slate-400">Challenges</span>
              <div class="text-xl font-black text-indigo-400">${r.challengesSolved || '1 / 2'}</div>
              <span class="text-[10px] text-slate-500">Evaluated</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-950/60 border border-white/10">
              <span class="text-[10px] uppercase font-bold text-slate-400">Bench & Team</span>
              <div class="text-sm font-black text-amber-300 truncate">${r.bench || 'Bench B17'}</div>
              <span class="text-[10px] text-slate-400 truncate">${r.team || 'Team Nova'}</span>
            </div>
          </div>

          <!-- Lifecycle Status Cards -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold uppercase text-slate-400 tracking-wider">Event Lifecycle & Verification</h4>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="p-3 rounded-2xl bg-slate-950/40 border border-white/10 flex items-center justify-between">
                <div>
                  <span class="text-slate-400">Registration Status:</span>
                  <div class="font-bold text-white">${r.status} (Pass #${r.ticketId})</div>
                </div>
                <span class="text-emerald-400 text-lg font-bold">✓</span>
              </div>

              <div class="p-3 rounded-2xl bg-slate-950/40 border border-white/10 flex items-center justify-between">
                <div>
                  <span class="text-slate-400">Door Attendance:</span>
                  <div class="font-bold text-white">${r.attended ? `Checked In (${new Date(r.attendedAt || Date.now()).toLocaleTimeString()})` : 'Pending Door Scan'}</div>
                </div>
                <span class="${r.attended ? 'text-emerald-400' : 'text-amber-400'} text-lg font-bold">${r.attended ? '✓' : '⏳'}</span>
              </div>

              <div class="p-3 rounded-2xl bg-slate-950/40 border border-white/10 flex items-center justify-between">
                <div>
                  <span class="text-slate-400">Capstone Project:</span>
                  <div class="font-bold text-white">${r.projectSubmitted ? 'Submitted for Review' : 'In Progress'}</div>
                </div>
                <span class="${r.projectSubmitted ? 'text-emerald-400' : 'text-slate-500'} text-lg font-bold">${r.projectSubmitted ? '✓' : '□'}</span>
              </div>

              <div class="p-3 rounded-2xl bg-slate-950/40 border border-white/10 flex items-center justify-between">
                <div>
                  <span class="text-slate-400">Certificate Issuance:</span>
                  <div class="font-bold ${r.certificateEligible ? 'text-indigo-300' : 'text-slate-400'}">
                    ${r.certificateEligible ? 'Eligible for Signing' : 'Attendance / Labs Required'}
                  </div>
                </div>
                <span class="${r.certificateEligible ? 'text-indigo-400' : 'text-slate-500'} text-lg font-bold">📜</span>
              </div>
            </div>
          </div>

          <!-- Academic & Registration Responses -->
          <div class="space-y-3 pt-2">
            <h4 class="text-xs font-bold uppercase text-slate-400 tracking-wider">Registration Form Details</h4>
            <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-2 text-xs">
              <div class="flex justify-between py-1 border-b border-white/5">
                <span class="text-slate-400">Event Track:</span>
                <span class="font-semibold text-white">${r.track || 'General AI Track'}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-white/5">
                <span class="text-slate-400">Official IEEE T-Shirt:</span>
                <span class="font-semibold text-white">Size ${r.tshirtSize || 'L'}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-white/5">
                <span class="text-slate-400">University Email:</span>
                <span class="font-mono text-indigo-300">${r.email || r.rollNo + '@kiit.ac.in'}</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-400">Registered Timestamp:</span>
                <span class="font-mono text-slate-300">${new Date(r.registeredAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <!-- Organizer Actions Bottom Bar -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
            ${!r.attended ? `
              <button id="btn-modal-mark-attendance" class="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all btn-press flex items-center gap-1.5">
                <span>📷</span> Mark Present Now
              </button>
            ` : `
              <span class="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <span>✓</span> Verified at Lab Door Checkpoint
              </span>
            `}

            <div class="flex items-center gap-2">
              <button id="btn-modal-open-ticket" class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors">
                View Student QR Pass
              </button>
              <button id="btn-modal-toggle-cert" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors btn-press">
                ${r.certificateEligible ? 'Generate Certificate 📜' : 'Grant Eligibility'}
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Backdrop click
    const backdrop = this.container.querySelector('.fixed.inset-0');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.close();
      });
    }

    const closeBtn = this.container.querySelector('#student-detail-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    const markBtn = this.container.querySelector('#btn-modal-mark-attendance');
    if (markBtn) {
      markBtn.addEventListener('click', () => {
        const res = store.verifyAndCheckIn(this.currentTicket.ticketId);
        sound.playCheckin();
        toast.show({ title: 'Attendance Confirmed', message: res.message, type: 'success' });
        this.render();
      });
    }

    const qrBtn = this.container.querySelector('#btn-modal-open-ticket');
    if (qrBtn) {
      qrBtn.addEventListener('click', () => {
        sound.playClick();
        window.appDispatcher?.openTicketModal(this.currentTicket.ticketId);
        this.close();
      });
    }

    const certBtn = this.container.querySelector('#btn-modal-toggle-cert');
    if (certBtn) {
      certBtn.addEventListener('click', () => {
        sound.playSuccess();
        this.currentTicket.certificateEligible = true;
        store.batchGenerateCertificates(this.currentTicket.eventId);
        toast.show({ title: 'Certificate Issued!', message: `Cryptographic credential issued to ${this.currentTicket.studentName}.`, type: 'success' });
        this.render();
      });
    }
  }
}

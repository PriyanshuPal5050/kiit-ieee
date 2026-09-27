/**
 * KIIT IEEE Platform - Student Help Request Modal
 * Dispatches live bench support tickets to the Volunteer Command Center.
 */

import { store } from '../state.js';
import { sound } from '../services/audio-service.js';
import { toast } from './toast.js';

export class VolunteerModal {
  constructor() {
    this.modal = null;
    this.init();
  }

  init() {
    let el = document.getElementById('volunteer-modal-root');
    if (!el) {
      el = document.createElement('div');
      el.id = 'volunteer-modal-root';
      document.body.appendChild(el);
    }
    el.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop hidden overflow-y-auto';
    el.style.display = 'none';
    this.modal = el;
  }

  open() {
    this.render();
    this.modal.classList.remove('hidden');
    this.modal.style.display = 'flex';
    sound.playClick();
    this._handleKeydown = (e) => {
      if (e.key === 'Escape') this.close();
    };
    window.addEventListener('keydown', this._handleKeydown);
  }

  close() {
    this.modal.classList.add('hidden');
    this.modal.style.display = 'none';
    if (this._handleKeydown) {
      window.removeEventListener('keydown', this._handleKeydown);
      this._handleKeydown = null;
    }
  }

  render() {
    this.modal.innerHTML = `
      <div class="relative w-full max-w-md bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl my-8">
        
        <!-- Header -->
        <div class="p-6 bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 border-b border-white/10 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-white">Request Bench Support</h3>
              <p class="text-xs text-slate-400">A roving IEEE volunteer will visit your desk</p>
            </div>
          </div>
          <button id="btn-support-close" class="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Form Body -->
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Bench / Seat Number *</label>
              <input type="text" id="tck-bench" placeholder="e.g. Bench B17" class="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500" required />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Priority Level</label>
              <select id="tck-priority" class="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500">
                <option value="HIGH">HIGH (Blocker)</option>
                <option value="MEDIUM" selected>MEDIUM (Issue)</option>
                <option value="LOW">LOW (Question)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Describe the Hardware / Software Problem *</label>
            <textarea id="tck-issue" rows="3" placeholder="e.g. ESP32 board is not showing up in COM port, or CUDA driver memory error..." class="w-full bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500" required></textarea>
          </div>

          <div class="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-slate-300">
            💡 <strong>Pro-Tip:</strong> Have you tried asking the <strong>AI Workshop Copilot</strong>? It can resolve 80% of common environment and code issues instantly.
          </div>

          <button id="btn-submit-support" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition-all btn-press">
            🚨 Dispatch Support Ticket
          </button>
        </div>

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Backdrop click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        sound.playClick();
        this.close();
      }
    });

    const closeBtn = this.modal.querySelector('#btn-support-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        sound.playClick();
        this.close();
      });
    }

    const submitBtn = this.modal.querySelector('#btn-submit-support');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const bench = this.modal.querySelector('#tck-bench')?.value.trim();
        const priority = this.modal.querySelector('#tck-priority')?.value;
        const issue = this.modal.querySelector('#tck-issue')?.value.trim();

        if (!bench || !issue) {
          toast.show({ title: 'Missing Information', message: 'Please enter your bench location and problem description.', type: 'warning' });
          return;
        }

        const t = store.addSupportTicket({
          bench,
          priority,
          issue,
          student: `${store.user.name} (${store.user.rollNo})`,
          event: 'Current Workshop Lab'
        });

        sound.playSuccess();
        this.close();

        toast.show({
          title: 'Ticket Dispatched! 🚨',
          message: `Ticket ${t.id} dispatched for ${bench}. A volunteer is on their way.`,
          type: 'success'
        });
      });
    }
  }
}

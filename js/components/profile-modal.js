/**
 * KIIT IEEE Platform - Student Profile Edit Modal
 * Manages technical identity, academic roll, and skills inventory.
 */

import { store } from '../state.js';
import { sound } from '../services/audio-service.js';
import { toast } from './toast.js';

export class ProfileModal {
  constructor() {
    this.modal = null;
    this.init();
  }

  init() {
    let el = document.getElementById('profile-modal-root');
    if (!el) {
      el = document.createElement('div');
      el.id = 'profile-modal-root';
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
    const u = store.user;

    this.modal.innerHTML = `
      <div class="relative w-full max-w-md bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl my-8">
        
        <!-- Header -->
        <div class="p-6 bg-gradient-to-r from-indigo-900 to-slate-900 border-b border-white/10 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img src="${u.avatar}" class="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-400" />
            <div>
              <h3 class="text-base font-bold text-white">${u.name}</h3>
              <p class="text-xs text-indigo-300 font-mono">${u.rollNo} • KIIT</p>
            </div>
          </div>
          <button id="btn-prof-close" class="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Form Body -->
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input type="text" id="prof-name" value="${u.name}" class="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">KIIT Roll No</label>
              <input type="text" id="prof-roll" value="${u.rollNo}" class="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Academic Year</label>
              <select id="prof-year" class="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500">
                <option value="1st Year" ${u.year === '1st Year' ? 'selected' : ''}>1st Year</option>
                <option value="2nd Year" ${u.year === '2nd Year' ? 'selected' : ''}>2nd Year</option>
                <option value="3rd Year" ${u.year === '3rd Year' ? 'selected' : ''}>3rd Year</option>
                <option value="4th Year" ${u.year === '4th Year' ? 'selected' : ''}>4th Year</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Branch / School</label>
            <input type="text" id="prof-branch" value="${u.branch}" class="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">GitHub Profile URL</label>
            <input type="text" id="prof-github" value="${u.github || ''}" class="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Technical Skills (comma separated)</label>
            <input type="text" id="prof-skills" value="${(u.skills || []).join(', ')}" class="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500" />
          </div>

          <button id="btn-save-profile" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all btn-press">
            Save Profile Changes
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

    const closeBtn = this.modal.querySelector('#btn-prof-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        sound.playClick();
        this.close();
      });
    }

    const saveBtn = this.modal.querySelector('#btn-save-profile');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const name = this.modal.querySelector('#prof-name')?.value.trim();
        const rollNo = this.modal.querySelector('#prof-roll')?.value.trim();
        const year = this.modal.querySelector('#prof-year')?.value;
        const branch = this.modal.querySelector('#prof-branch')?.value.trim();
        const github = this.modal.querySelector('#prof-github')?.value.trim();
        const rawSkills = this.modal.querySelector('#prof-skills')?.value || '';
        const skills = rawSkills.split(',').map(s => s.trim()).filter(Boolean);

        store.updateUser({ name, rollNo, year, branch, github, skills });
        sound.playSuccess();
        this.close();
        toast.show({ title: 'Profile Updated', message: 'Your technical identity has been updated!', type: 'success' });
      });
    }
  }
}

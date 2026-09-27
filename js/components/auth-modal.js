/**
 * KIIT IEEE Platform - Authentication & Role Switcher Modal
 * Clean multi-role authorization for Students, Hosts, Volunteers, and Administrators.
 */

import { store } from '../state.js';
import { sound } from '../services/audio-service.js';
import { toast } from './toast.js';

export class AuthModal {
  constructor() {
    this.container = document.getElementById('auth-modal-root');
    this.isOpen = false;
    this.activeTab = 'student'; // 'student' | 'host' | 'admin' | 'demo'
    this.init();
  }

  init() {
    if (!this.container) {
      let el = document.getElementById('auth-modal-root');
      if (!el) {
        el = document.createElement('div');
        el.id = 'auth-modal-root';
        document.body.appendChild(el);
      }
      this.container = el;
    }
    this.container.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop hidden overflow-y-auto';
    this.container.style.display = 'none';
  }

  open(preferredTab = 'demo') {
    this.isOpen = true;
    this.activeTab = preferredTab;
    this.render();
    this.container.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop overflow-y-auto';
    this.container.classList.remove('hidden');
    this.container.style.display = 'flex';
    this._handleKeydown = (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
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
    if (!this.container || !this.isOpen) return;

    this.container.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
        <div class="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6">
          
          <!-- Close Button -->
          <button id="auth-modal-close" class="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <!-- Header -->
          <div class="text-center space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
              <span>⚡</span> KIIT IEEE Access Gateway
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-white">Sign In to KIIT IEEE</h2>
            <p class="text-xs text-slate-400">Where Students Build What's Next. Access controlled for the KIIT ecosystem.</p>
          </div>

          <!-- Role Selector Tabs -->
          <div class="grid grid-cols-4 gap-1 p-1 bg-slate-950/80 rounded-2xl border border-white/10 text-xs font-semibold">
            <button data-tab="demo" class="auth-tab-btn py-2 rounded-xl transition-all ${this.activeTab === 'demo' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}">
              ⚡ Demo
            </button>
            <button data-tab="student" class="auth-tab-btn py-2 rounded-xl transition-all ${this.activeTab === 'student' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}">
              🎓 Student
            </button>
            <button data-tab="host" class="auth-tab-btn py-2 rounded-xl transition-all ${this.activeTab === 'host' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}">
              🛡️ Host
            </button>
            <button data-tab="admin" class="auth-tab-btn py-2 rounded-xl transition-all ${this.activeTab === 'admin' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}">
              ⚙️ Admin
            </button>
          </div>

          <!-- Dynamic Tab Content -->
          <div id="auth-tab-body">
            ${this.renderTabBody()}
          </div>

        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderTabBody() {
    if (this.activeTab === 'demo') {
      return `
        <div class="space-y-3">
          <div class="text-[11px] text-slate-400 font-medium">Select an instant profile to test all role-based experiences:</div>
          
          <!-- Student Demo -->
          <button data-switch="student" class="btn-demo-switch w-full p-3.5 rounded-2xl bg-slate-950/60 hover:bg-indigo-950/40 border border-white/10 hover:border-indigo-500/40 transition-all flex items-center justify-between text-left group">
            <div class="flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80" class="w-10 h-10 rounded-xl object-cover border border-indigo-400/40" />
              <div>
                <div class="text-sm font-bold text-white group-hover:text-indigo-300">Aryan Mohapatra (Student)</div>
                <div class="text-[11px] text-slate-400">Roll No: 22051842 • 3rd Year CSE • Level 7 Innovator</div>
              </div>
            </div>
            <span class="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold">Launch 🎓</span>
          </button>

          <!-- Host Demo -->
          <button data-switch="host" class="btn-demo-switch w-full p-3.5 rounded-2xl bg-slate-950/60 hover:bg-amber-950/40 border border-white/10 hover:border-amber-500/40 transition-all flex items-center justify-between text-left group">
            <div class="flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" class="w-10 h-10 rounded-xl object-cover border border-amber-400/40" />
              <div>
                <div class="text-sm font-bold text-white group-hover:text-amber-300">Dr. Priyadarshi Sen (Host)</div>
                <div class="text-[11px] text-slate-400">Lead Organizer • AI & Vision Masterclass Host</div>
              </div>
            </div>
            <span class="text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold">Launch 🛡️</span>
          </button>

          <!-- Volunteer Demo -->
          <button data-switch="volunteer" class="btn-demo-switch w-full p-3.5 rounded-2xl bg-slate-950/60 hover:bg-cyan-950/40 border border-white/10 hover:border-cyan-500/40 transition-all flex items-center justify-between text-left group">
            <div class="flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" class="w-10 h-10 rounded-xl object-cover border border-cyan-400/40" />
              <div>
                <div class="text-sm font-bold text-white group-hover:text-cyan-300">Devika Sharma (Core Volunteer)</div>
                <div class="text-[11px] text-slate-400">Lab Bench Dispatch • Zone B Coverage</div>
              </div>
            </div>
            <span class="text-xs px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold">Launch 🚀</span>
          </button>

          <!-- Admin Demo -->
          <button data-switch="admin" class="btn-demo-switch w-full p-3.5 rounded-2xl bg-slate-950/60 hover:bg-purple-950/40 border border-white/10 hover:border-purple-500/40 transition-all flex items-center justify-between text-left group">
            <div class="flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80" class="w-10 h-10 rounded-xl object-cover border border-purple-400/40" />
              <div>
                <div class="text-sm font-bold text-white group-hover:text-purple-300">Dr. J. R. Mohanty (Admin)</div>
                <div class="text-[11px] text-slate-400">Branch Counselor • Institutional CMS & Audit Control</div>
              </div>
            </div>
            <span class="text-xs px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-bold">Launch ⚙️</span>
          </button>
        </div>
      `;
    }

    if (this.activeTab === 'student') {
      return `
        <form id="auth-student-form" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">KIIT University Email Address</label>
            <input type="email" required placeholder="rollnumber@kiit.ac.in" value="22051842@kiit.ac.in" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Password or OTP</label>
            <input type="password" required value="kiitieee2026" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all btn-press">
            Continue with KIIT Email
          </button>
          <div class="relative flex items-center justify-center my-2">
            <span class="w-full border-t border-white/10"></span>
            <span class="bg-slate-900 px-2 text-[10px] text-slate-500 uppercase">Or</span>
          </div>
          <button type="button" id="btn-auth-google" class="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-2">
            <span>🌐</span> Sign in with KIIT Google Workspace
          </button>
          <p class="text-[10px] text-slate-500 text-center">Restricted to active KIIT students and registered participants.</p>
        </form>
      `;
    }

    if (this.activeTab === 'host') {
      return `
        <form id="auth-host-form" class="space-y-4">
          <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            🛡️ <strong>HOST COMMAND CENTER:</strong> Authorized IEEE event organizers, speakers, and faculty coordinators only.
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Organizer ID / KIIT Staff Email</label>
            <input type="email" required placeholder="organizer@kiit.ac.in" value="priyadarshi.sen@kiit.ac.in" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Host Security Passkey</label>
            <input type="password" required value="hostcommand2026" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500" />
          </div>
          <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition-all btn-press">
            Enter Host Command Center
          </button>
        </form>
      `;
    }

    if (this.activeTab === 'admin') {
      return `
        <form id="auth-admin-form" class="space-y-4">
          <div class="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs">
            ⚙️ <strong>ADMINISTRATIVE CONTROL:</strong> Branch Counselor & Executive Board. Modifies institutional vision, system settings, and audit logs.
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Administrator Identifier</label>
            <input type="text" required value="branch.counselor@kiit.ac.in" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Institutional Master Key</label>
            <input type="password" required value="adminmasterkey" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500" />
          </div>
          <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all btn-press">
            Authenticate as Administrator
          </button>
        </form>
      `;
    }

    return '';
  }

  bindEvents() {
    // Backdrop click
    const backdrop = this.container.querySelector('.fixed.inset-0');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.close();
      });
    }

    // Close
    const closeBtn = this.container.querySelector('#auth-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    // Switch Tabs
    this.container.querySelectorAll('.auth-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
      });
    });

    // 1-Click Demo Switcher
    this.container.querySelectorAll('.btn-demo-switch').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-switch');
        sound.playSuccess();
        store.switchAccount(role);
        toast.show({
          title: 'Account Switched! ⚡',
          message: `Now operating as ${store.user.name} (${store.user.role.toUpperCase()}).`,
          type: 'success'
        });
        this.close();
        if (role === 'host') {
          store.setView('organizer');
        } else if (role === 'admin') {
          store.setView('about');
        } else if (role === 'volunteer') {
          store.setView('volunteer');
        } else {
          store.setView('dashboard');
        }
      });
    });

    // Student form submit
    const studentForm = this.container.querySelector('#auth-student-form');
    if (studentForm) {
      studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sound.playSuccess();
        store.switchAccount('student');
        toast.show({ title: 'Welcome Back, Aryan!', message: 'Verified KIIT Student Identity.', type: 'success' });
        this.close();
        store.setView('dashboard');
      });
    }

    // Host form submit
    const hostForm = this.container.querySelector('#auth-host-form');
    if (hostForm) {
      hostForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sound.playSuccess();
        store.switchAccount('host');
        toast.show({ title: 'Command Center Unlocked', message: 'Authorized Event Organizer Access.', type: 'success' });
        this.close();
        store.setView('organizer');
      });
    }

    // Admin form submit
    const adminForm = this.container.querySelector('#auth-admin-form');
    if (adminForm) {
      adminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sound.playSuccess();
        store.switchAccount('admin');
        toast.show({ title: 'Admin Mode Active', message: 'Executive Institutional Access.', type: 'success' });
        this.close();
        store.setView('about');
      });
    }

    // Google Workspace button
    const googleBtn = this.container.querySelector('#btn-auth-google');
    if (googleBtn) {
      googleBtn.addEventListener('click', () => {
        sound.playSuccess();
        store.switchAccount('student');
        toast.show({ title: 'Google Identity Confirmed', message: 'Signed in with KIIT University Workspace.', type: 'success' });
        this.close();
        store.setView('dashboard');
      });
    }
  }
}

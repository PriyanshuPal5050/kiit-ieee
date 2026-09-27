/**
 * KIIT IEEE Platform - Notifications Popover Dropdown
 * Displays recent alerts, registration passes, and system updates.
 */

import { store } from '../state.js';
import { sound } from '../services/audio-service.js';

export class NotificationsPopover {
  constructor() {
    this.container = null;
    this.isOpen = false;
    this.init();
  }

  init() {
    let el = document.getElementById('notifications-popover');
    if (!el) {
      el = document.createElement('div');
      el.id = 'notifications-popover';
      el.className = 'fixed top-20 right-4 sm:right-12 z-50 w-80 sm:w-96 bg-slate-900/95 border border-indigo-500/30 rounded-2xl shadow-2xl backdrop-blur-2xl hidden overflow-hidden transform transition-all duration-200 scale-95 opacity-0';
      document.body.appendChild(el);
    }
    this.container = el;

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.container.contains(e.target) && !e.target.closest('#btn-toggle-notifs')) {
        this.close();
      }
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (this.isOpen && e.key === 'Escape') {
        this.close();
      }
    });

    store.subscribe((state, type) => {
      if (['NOTIFICATION_ADDED', 'NOTIFICATIONS_CLEARED'].includes(type)) {
        if (this.isOpen) this.render();
      }
    });
  }

  render() {
    if (!this.container) return;
    const notifs = store.notifications;
    const unreadCount = notifs.filter(n => !n.read).length;

    this.container.innerHTML = `
      <div class="px-4 py-3 bg-slate-950/60 border-b border-white/10 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold text-white">Notifications</span>
          ${unreadCount > 0 ? `<span class="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-500 text-white rounded-full">${unreadCount} new</span>` : ''}
        </div>
        <button id="btn-mark-all-read" class="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Mark all read
        </button>
      </div>

      <div class="max-h-80 overflow-y-auto p-2 space-y-1.5 no-scrollbar">
        ${notifs.length === 0 ? `
          <div class="py-8 text-center text-slate-400 text-xs">
            <span class="text-2xl block mb-1">🎉</span>
            You're all caught up! No notifications.
          </div>
        ` : notifs.map(n => `
          <div 
            data-id="${n.id}"
            class="notif-item p-3 rounded-xl cursor-pointer transition-colors border ${n.read ? 'bg-white/[0.02] border-transparent text-slate-400' : 'bg-indigo-950/30 border-indigo-500/20 text-slate-200 hover:bg-indigo-950/50'}"
          >
            <div class="flex items-start justify-between gap-2">
              <h5 class="text-xs font-semibold ${n.read ? 'text-slate-300' : 'text-white'} leading-tight">${n.title}</h5>
              <span class="text-[10px] text-slate-500 shrink-0 font-mono">${n.timestamp}</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">${n.body}</p>
          </div>
        `).join('')}
      </div>

      <div class="px-4 py-2 bg-slate-950/40 border-t border-white/5 text-center text-[11px] text-slate-500">
        KIIT IEEE Live Notification Hub
      </div>
    `;

    // Mark all read button
    const markBtn = this.container.querySelector('#btn-mark-all-read');
    if (markBtn) {
      markBtn.addEventListener('click', () => {
        sound.playClick();
        store.markAllNotificationsRead();
        this.render();
      });
    }

    // Attach click triggers
    this.container.querySelectorAll('.notif-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        const item = notifs.find(n => n.id === id);
        if (item) {
          item.read = true;
          sound.playClick();
          store.notify('NOTIFICATION_READ', item);
          this.close();

          if (item.action === 'openTicket' && item.data) {
            window.appDispatcher?.openTicketModal(item.data);
          } else if (item.action === 'openEvent' && item.data) {
            window.location.hash = `#event/${item.data}`;
          } else if (item.action === 'openReadiness') {
            store.setView('readiness');
          } else if (item.action === 'openCertificates') {
            store.setView('certificates');
          }
        }
      });
    });
  }

  open() {
    this.isOpen = true;
    this.render();
    this.container.classList.remove('hidden');
    requestAnimationFrame(() => {
      this.container.classList.remove('scale-95', 'opacity-0');
      this.container.classList.add('scale-100', 'opacity-100');
    });
  }

  close() {
    this.isOpen = false;
    this.container.classList.remove('scale-100', 'opacity-100');
    this.container.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      this.container.classList.add('hidden');
    }, 180);
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }
}

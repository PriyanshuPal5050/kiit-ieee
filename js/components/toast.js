/**
 * KIIT IEEE Platform - Micro-interaction Toast System
 * Non-blocking interactive feedback toasts with audio synchronization.
 */

import { sound } from '../services/audio-service.js';

class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    let el = document.getElementById('toast-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast-container';
      el.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4';
      document.body.appendChild(el);
    }
    this.container = el;
  }

  show({ title, message, type = 'info', duration = 4000, action = null }) {
    if (!this.container) this.init();

    // Play appropriate sound
    if (type === 'success') sound.playSuccess();
    else if (type === 'error') sound.playError();
    else sound.playClick();

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto transform translate-y-4 opacity-0 transition-all duration-300 ease-out p-4 rounded-xl shadow-2xl border backdrop-blur-xl flex items-start gap-3 ${this.getToastTheme(type)}`;

    const icon = this.getToastIcon(type);

    toast.innerHTML = `
      <div class="mt-0.5 shrink-0">${icon}</div>
      <div class="flex-1">
        ${title ? `<h4 class="text-sm font-semibold text-white tracking-wide">${title}</h4>` : ''}
        <p class="text-xs text-slate-300 mt-0.5 leading-relaxed">${message}</p>
      </div>
      <button class="shrink-0 text-slate-400 hover:text-white p-1 rounded-lg transition-colors" aria-label="Close">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    `;

    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => this.dismiss(toast));

    this.container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(toast);
      }, duration);
    }
  }

  dismiss(toast) {
    if (!toast || !toast.parentElement) return;
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 300);
  }

  getToastTheme(type) {
    switch (type) {
      case 'success':
        return 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-900/30';
      case 'error':
        return 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-rose-900/30';
      case 'warning':
        return 'bg-amber-950/90 border-amber-500/40 text-amber-100 shadow-amber-900/30';
      default:
        return 'bg-slate-900/95 border-indigo-500/30 text-slate-100 shadow-indigo-950/40';
    }
  }

  getToastIcon(type) {
    switch (type) {
      case 'success':
        return `<div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">✓</div>`;
      case 'error':
        return `<div class="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs border border-rose-500/30">✕</div>`;
      case 'warning':
        return `<div class="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">⚠</div>`;
      default:
        return `<div class="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">⚡</div>`;
    }
  }
}

export const toast = new ToastManager();

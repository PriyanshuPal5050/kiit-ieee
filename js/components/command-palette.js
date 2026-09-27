/**
 * KIIT IEEE Platform - Global Command Palette (Ctrl+K)
 * Fast keyboard-navigated search and action launcher.
 */

import { store } from '../state.js';
import { sound } from '../services/audio-service.js';

export class CommandPalette {
  constructor() {
    this.modal = null;
    this.input = null;
    this.resultsList = null;
    this.selectedIndex = 0;
    this.isOpen = false;
    this.filteredItems = [];

    this.init();
  }

  init() {
    // Listen for global Ctrl+K / Cmd+K
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    this.render();
  }

  render() {
    const el = document.createElement('div');
    el.id = 'command-palette-modal';
    el.className = 'fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 modal-backdrop hidden transition-opacity duration-200';
    el.innerHTML = `
      <div class="relative w-full max-w-2xl bg-slate-900/95 border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl flex flex-col transform transition-transform duration-200 scale-95 opacity-0" id="palette-card">
        <!-- Search Input Bar -->
        <div class="flex items-center px-4 py-3.5 border-b border-white/10 bg-slate-950/40">
          <svg class="w-5 h-5 text-indigo-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            id="palette-search-input" 
            placeholder="Type a command, event name, tool, or action... (e.g. AI, Copilot, Scan)" 
            class="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
            autocomplete="off"
          />
          <kbd class="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 rounded">ESC</kbd>
        </div>

        <!-- Results List -->
        <div class="max-h-80 overflow-y-auto p-2 space-y-1 no-scrollbar" id="palette-results">
          <!-- Dynamic Results -->
        </div>

        <!-- Palette Footer -->
        <div class="px-4 py-2.5 bg-slate-950/70 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <div class="flex items-center gap-3">
            <span><kbd class="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↑</kbd> <kbd class="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↓</kbd> Navigate</span>
            <span><kbd class="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↵</kbd> Select</span>
          </div>
          <span class="text-indigo-400/80 font-medium">KIIT IEEE Smart Navigator</span>
        </div>
      </div>
    `;

    document.body.appendChild(el);
    this.modal = el;
    this.card = el.querySelector('#palette-card');
    this.input = el.querySelector('#palette-search-input');
    this.resultsList = el.querySelector('#palette-results');

    // Close on backdrop click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    // Input listener
    this.input.addEventListener('input', () => {
      this.filterResults(this.input.value);
    });

    // Key navigation
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.navigate(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigate(-1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.executeSelected();
      }
    });
  }

  getAllItems() {
    const items = [
      // Navigation
      { title: 'Home Page', category: 'Navigation', icon: '🏠', action: () => store.setView('home') },
      { title: 'Discover Technical Events', category: 'Navigation', icon: '🔍', action: () => store.setView('discover') },
      { title: 'My Student Dashboard', category: 'Navigation', icon: '👤', action: () => store.setView('dashboard') },
      { title: 'Pre-Workshop Ready Check', category: 'Tools', icon: '⚡', action: () => store.setView('readiness') },
      { title: 'AI Workshop Copilot', category: 'AI Tools', icon: '🤖', action: () => store.setView('copilot') },
      { title: 'IEEE Command Center (Organizer)', category: 'Organizer', icon: '📊', action: () => { store.setRole('organizer'); store.setView('organizer'); } },
      { title: 'AI Event Builder', category: 'AI Tools', icon: '✨', action: () => { store.setRole('organizer'); store.setView('ai-builder'); } },
      { title: 'Volunteer Dispatch Queue', category: 'Organizer', icon: '🎫', action: () => store.setView('volunteer') },
      { title: 'Certificates & Public Verification', category: 'Credentials', icon: '📜', action: () => store.setView('certificates') },
      { title: 'Live Event Mode (In-Progress Workshop)', category: 'Live', icon: '🔴', action: () => store.setView('live-event') },
      { title: 'Team Finder & Teammates', category: 'Community', icon: '🤝', action: () => store.setView('teams') },
      { title: 'What Students Are Building (Showcase)', category: 'Community', icon: '🚀', action: () => store.setView('showcase') },
      { title: 'About KIIT IEEE & Founder Story', category: 'Institutional', icon: '🏛️', action: () => store.setView('about') },
      { title: 'Account Switcher & Authentication Gateway', category: 'Auth', icon: '⚡', action: () => window.appDispatcher?.openAuthModal() },
      
      // Actions
      { title: 'Scan QR Attendance (Organizer)', category: 'Quick Action', icon: '📷', action: () => window.appDispatcher?.openQRScanner() },
      { title: 'Switch Role (Student ↔ Organizer)', category: 'Quick Action', icon: '🔄', action: () => store.toggleRole() },
      { title: 'Toggle Audio Sound Effects', category: 'Settings', icon: '🔊', action: () => store.toggleSound() }
    ];

    // Add Events dynamically
    store.events.forEach(evt => {
      items.push({
        title: `${evt.title} (${evt.category})`,
        category: 'Event',
        icon: '📅',
        subtitle: `${evt.date} • ${evt.venue}`,
        action: () => {
          window.location.hash = `#event/${evt.id}`;
        }
      });
    });

    return items;
  }

  filterResults(query = '') {
    const q = query.trim().toLowerCase();
    const all = this.getAllItems();

    if (!q) {
      this.filteredItems = all.slice(0, 8);
    } else {
      this.filteredItems = all.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.category.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
      );
    }

    this.selectedIndex = 0;
    this.renderResults();
  }

  renderResults() {
    if (this.filteredItems.length === 0) {
      this.resultsList.innerHTML = `
        <div class="py-8 text-center text-slate-400 text-sm">
          <p>No matching commands or events found for "${this.input.value}".</p>
          <p class="text-xs text-slate-500 mt-1">Try searching for "AI", "Robotics", "Copilot", or "Scan".</p>
        </div>
      `;
      return;
    }

    this.resultsList.innerHTML = this.filteredItems.map((item, idx) => `
      <div 
        data-index="${idx}"
        class="palette-item flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${idx === this.selectedIndex ? 'bg-indigo-600/30 border border-indigo-500/40 text-white' : 'text-slate-300 hover:bg-white/5 border border-transparent'}"
      >
        <div class="flex items-center gap-3 overflow-hidden">
          <span class="text-lg shrink-0">${item.icon}</span>
          <div class="truncate">
            <div class="text-sm font-medium leading-none">${item.title}</div>
            ${item.subtitle ? `<div class="text-[11px] text-slate-400 mt-1 truncate">${item.subtitle}</div>` : ''}
          </div>
        </div>
        <span class="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5 shrink-0 ml-2">
          ${item.category}
        </span>
      </div>
    `).join('');

    // Attach click handlers
    this.resultsList.querySelectorAll('.palette-item').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-index'));
        this.selectedIndex = idx;
        this.executeSelected();
      });
    });
  }

  navigate(dir) {
    if (this.filteredItems.length === 0) return;
    this.selectedIndex = (this.selectedIndex + dir + this.filteredItems.length) % this.filteredItems.length;
    sound.playClick();
    this.renderResults();
    
    // Auto-scroll selected into view
    const selectedEl = this.resultsList.children[this.selectedIndex];
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }

  executeSelected() {
    const item = this.filteredItems[this.selectedIndex];
    if (item && item.action) {
      sound.playClick();
      this.close();
      item.action();
    }
  }

  open() {
    this.isOpen = true;
    this.modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      this.card.classList.remove('scale-95', 'opacity-0');
      this.card.classList.add('scale-100', 'opacity-100');
      this.input.value = '';
      this.filterResults('');
      this.input.focus();
    });
  }

  close() {
    this.isOpen = false;
    this.card.classList.remove('scale-100', 'opacity-100');
    this.card.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      this.modal.classList.add('hidden');
    }, 180);
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }
}

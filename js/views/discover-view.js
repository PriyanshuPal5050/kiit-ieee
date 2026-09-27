/**
 * KIIT IEEE Platform - Event Discovery Portal
 * Multi-faceted search, interactive category chips, mode/difficulty filters, and dynamic layout.
 */

import { store } from '../state.js';
import { sound } from '../services/audio-service.js';

export class DiscoverView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.viewMode = 'grid'; // 'grid' | 'list'
  }

  render() {
    if (!this.container) return;

    // Filter events based on active store filters
    const filteredEvents = store.events.filter(evt => {
      // Search query
      if (store.activeSearchQuery) {
        const q = store.activeSearchQuery.toLowerCase();
        const matchTitle = evt.title.toLowerCase().includes(q);
        const matchCat = evt.category.toLowerCase().includes(q);
        const matchTags = (evt.tags || []).some(t => t.toLowerCase().includes(q));
        const matchVenue = evt.venue.toLowerCase().includes(q);
        if (!matchTitle && !matchCat && !matchTags && !matchVenue) return false;
      }

      // Category filter
      if (store.activeFilterCategory !== 'All' && evt.category !== store.activeFilterCategory) {
        return false;
      }

      // Mode filter
      if (store.activeFilterMode !== 'All' && evt.format !== store.activeFilterMode) {
        return false;
      }

      // Difficulty filter
      if (store.activeFilterDifficulty !== 'All' && !evt.difficulty.includes(store.activeFilterDifficulty)) {
        return false;
      }

      return true;
    });

    const categories = [
      'All',
      'AI & Machine Learning',
      'Robotics & IoT',
      'Web & Cloud',
      'Hackathons',
      'Cybersecurity',
      'Embedded Systems'
    ];

    const modes = ['All', 'Offline', 'Online', 'Hybrid'];
    const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div class="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">
              <span>⚡</span> Explore KIIT IEEE Catalogue
            </div>
            <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight">Technical Events & Labs</h1>
            <p class="text-sm text-slate-400 mt-1 max-w-xl">
              Hands-on workshops, 36-hour hackathons, robotics bootcamps, and specialized technical certifications.
            </p>
          </div>

          <!-- View Mode Toggle -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400 font-medium">Layout:</span>
            <div class="flex p-1 rounded-xl bg-slate-900 border border-white/10">
              <button id="btn-view-grid" class="p-1.5 rounded-lg text-xs font-semibold ${this.viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'} transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              </button>
              <button id="btn-view-list" class="p-1.5 rounded-lg text-xs font-semibold ${this.viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'} transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Filter & Search Controls Bar -->
        <div class="space-y-4">
          
          <!-- Search Input with Clear Button -->
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input 
              type="text" 
              id="discover-search-input" 
              placeholder="Search by topic, keyword, hardware, or instructor (e.g. PyTorch, ESP32, CTF, Campus 15)..."
              value="${store.activeSearchQuery}"
              class="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-indigo-500/40 focus:border-indigo-500 text-sm text-white placeholder-slate-400 shadow-xl focus:outline-none transition-all"
            />
            ${store.activeSearchQuery ? `
              <button id="btn-clear-search" class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white">
                ✕
              </button>
            ` : ''}
          </div>

          <!-- Category Filter Pills (Scrollable) -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            ${categories.map(cat => `
              <button 
                data-cat="${cat}" 
                class="filter-cat-btn shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all btn-press ${store.activeFilterCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:border-white/20 hover:text-white'}"
              >
                ${cat}
              </button>
            `).join('')}
          </div>

          <!-- Secondary Filter Row: Mode & Difficulty -->
          <div class="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs">
            <div class="flex flex-wrap items-center gap-4">
              
              <!-- Mode Filter -->
              <div class="flex items-center gap-2">
                <span class="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">Format:</span>
                <div class="flex gap-1">
                  ${modes.map(mode => `
                    <button data-mode="${mode}" class="filter-mode-btn px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${store.activeFilterMode === mode ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'bg-white/5 text-slate-400 hover:text-white'}">
                      ${mode}
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Difficulty Filter -->
              <div class="flex items-center gap-2">
                <span class="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">Level:</span>
                <div class="flex gap-1">
                  ${difficulties.map(diff => `
                    <button data-diff="${diff}" class="filter-diff-btn px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${store.activeFilterDifficulty === diff ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold' : 'bg-white/5 text-slate-400 hover:text-white'}">
                      ${diff}
                    </button>
                  `).join('')}
                </div>
              </div>

            </div>

            <!-- Active Results Counter -->
            <div class="text-slate-400 font-medium text-[11px]">
              Showing <span class="text-white font-bold">${filteredEvents.length}</span> of ${store.events.length} technical events
            </div>
          </div>

        </div>

        <!-- Events Container (Grid or List) -->
        ${filteredEvents.length === 0 ? `
          <div class="py-16 text-center space-y-3 glass-panel p-8 rounded-3xl">
            <span class="text-4xl block">🔍</span>
            <h3 class="text-lg font-bold text-white">No technical events match your filter criteria.</h3>
            <p class="text-xs text-slate-400 max-w-sm mx-auto">Try resetting filters or searching for keywords like "AI", "Robotics", "Web", or "Hackathon".</p>
            <button id="btn-reset-filters" class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs mt-2 btn-press">
              Reset All Filters
            </button>
          </div>
        ` : `
          <div class="${this.viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}">
            ${filteredEvents.map(evt => this.viewMode === 'grid' ? this.renderGridCard(evt) : this.renderListCard(evt)).join('')}
          </div>
        `}

      </div>
    `;

    this.bindEvents();
  }

  renderGridCard(evt) {
    const isRegistered = store.registrations.some(r => 
      (String(r.eventId).toLowerCase() === String(evt.id).toLowerCase() ||
       (evt.slug && String(r.eventId).toLowerCase() === String(evt.slug).toLowerCase()) ||
       (evt.title && String(r.eventName).toLowerCase() === String(evt.title).toLowerCase())) &&
      (String(r.rollNo).toLowerCase() === String(store.user?.rollNo || '').toLowerCase() ||
       (store.user?.email && String(r.email).toLowerCase() === String(store.user?.email || '').toLowerCase()))
    );
    const seatsPct = Math.round(((evt.seatsFilled || 0) / evt.seatsTotal) * 100);

    let statusBadge = '';
    if (isRegistered) {
      statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">REGISTERED</span>';
    } else if (evt.status === 'LIVE') {
      statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-pulse flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span> LIVE</span>';
    } else if (evt.status === 'ALMOST FULL' || evt.status === 'Filling Fast') {
      statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/30 text-amber-300 border border-amber-500/40">ALMOST FULL</span>';
    } else if (evt.status === 'FULL' || evt.status === 'Closed') {
      statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700">FULL</span>';
    } else if (evt.status === 'COMPLETED') {
      statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700">COMPLETED</span>';
    } else {
      statusBadge = '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">OPEN</span>';
    }

    return `
      <div class="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group border border-white/10 hover:border-indigo-500/40 transition-all duration-300">
        <div>
          <div class="h-36 bg-gradient-to-r ${evt.bannerGradient} p-4 flex flex-col justify-between relative overflow-hidden">
            <div class="flex items-center justify-between relative z-10">
              <span class="badge-tag ${evt.badgeColor || 'badge-ai'} shadow-sm">${evt.category}</span>
              ${statusBadge}
            </div>
            <div class="relative z-10 flex items-center justify-between text-xs text-white/90 font-medium">
              <span>📅 ${evt.date}</span>
              <span class="font-bold text-emerald-300">${evt.priceLabel || 'Free'}</span>
            </div>
          </div>

          <div class="p-5 space-y-3">
            <div class="flex items-center gap-1.5 text-[11px] text-indigo-400 font-semibold">
              <span>⚡ ${evt.difficulty}</span>
              <span>•</span>
              <span>${evt.time.split('-')[0]}</span>
            </div>
            <h4 class="text-base font-extrabold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">${evt.title}</h4>
            <p class="text-xs text-slate-300 line-clamp-2 leading-relaxed">${evt.tagline}</p>

            <div class="text-[11px] text-slate-400 space-y-1 pt-1">
              <div class="flex items-center gap-1.5 truncate">
                <span>📍</span>
                <span class="truncate">${evt.venue}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span>👤</span>
                <span class="truncate">${evt.speaker ? evt.speaker.name : 'IEEE Instructor'}</span>
              </div>
            </div>

            <!-- Skill Tags -->
            <div class="flex flex-wrap gap-1 pt-1">
              ${(evt.tags || []).slice(0, 3).map(tag => `
                <span class="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-300 border border-white/5 font-mono">${tag}</span>
              `).join('')}
            </div>

            <div class="pt-2">
              <div class="flex items-center justify-between text-[10px] font-semibold mb-1">
                <span class="text-slate-400">${evt.seatsFilled} / ${evt.seatsTotal} Seats</span>
                <span class="${evt.seatsFilled >= evt.seatsTotal * 0.8 ? 'text-amber-400' : 'text-cyan-400'}">${seatsPct}% Claimed</span>
              </div>
              <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div class="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full" style="width: ${seatsPct}%"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-5 pt-0 flex items-center gap-2">
          <button data-event-id="${evt.id}" class="btn-card-detail flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors btn-press cursor-pointer">
            View Details
          </button>
          ${isRegistered ? `
            <button data-ticket-id="${evt.id}" class="btn-card-view-pass px-3 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors btn-press cursor-pointer z-10 relative">
              Pass ✓
            </button>
          ` : `
            <button data-event-id="${evt.id}" class="btn-card-quick-reg px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all btn-press cursor-pointer z-10 relative">
              Register
            </button>
          `}
        </div>
      </div>
    `;
  }

  renderListCard(evt) {
    const isRegistered = store.registrations.some(r => 
      (String(r.eventId).toLowerCase() === String(evt.id).toLowerCase() ||
       (evt.slug && String(r.eventId).toLowerCase() === String(evt.slug).toLowerCase()) ||
       (evt.title && String(r.eventName).toLowerCase() === String(evt.title).toLowerCase())) &&
      (String(r.rollNo).toLowerCase() === String(store.user?.rollNo || '').toLowerCase() ||
       (store.user?.email && String(r.email).toLowerCase() === String(store.user?.email || '').toLowerCase()))
    );
    const seatsPct = Math.round(((evt.seatsFilled || 0) / evt.seatsTotal) * 100);

    return `
      <div class="glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/10 hover:border-indigo-500/40 transition-all">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${evt.bannerGradient} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg">
            ⚡
          </div>
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="badge-tag ${evt.badgeColor || 'badge-ai'} text-[10px]">${evt.category}</span>
              <span class="text-xs text-slate-400">${evt.format} • ${evt.difficulty}</span>
            </div>
            <h4 class="text-base font-bold text-white">${evt.title}</h4>
            <p class="text-xs text-slate-300 max-w-xl line-clamp-1">${evt.tagline}</p>
            <div class="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
              <span>📅 ${evt.date}</span>
              <span>📍 ${evt.venue}</span>
              <span>👤 ${evt.speaker ? evt.speaker.name : 'IEEE Mentor'}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0 border-white/10">
          <div class="text-right hidden lg:block mr-2">
            <span class="text-[11px] text-slate-400 block">${evt.seatsFilled} / ${evt.seatsTotal} Seats</span>
            <span class="text-xs font-bold text-emerald-400">${evt.priceLabel || 'Free'}</span>
          </div>

          <button data-event-id="${evt.id}" class="btn-card-detail px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors btn-press cursor-pointer">
            Details
          </button>
          ${isRegistered ? `
            <button data-ticket-id="${evt.id}" class="btn-card-view-pass px-4 py-2.5 rounded-xl bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold btn-press cursor-pointer z-10 relative">
              Pass ✓
            </button>
          ` : `
            <button data-event-id="${evt.id}" class="btn-card-quick-reg px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 btn-press cursor-pointer z-10 relative">
              Register
            </button>
          `}
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Delegated container click handler for card actions
    this.container.addEventListener('click', (e) => {
      const regBtn = e.target.closest('.btn-card-quick-reg');
      if (regBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = regBtn.getAttribute('data-event-id');
        sound.playClick();
        window.appDispatcher?.openRegistration(id);
        return;
      }

      const passBtn = e.target.closest('.btn-card-view-pass');
      if (passBtn) {
        e.preventDefault();
        e.stopPropagation();
        const evtId = passBtn.getAttribute('data-ticket-id');
        sound.playClick();
        window.appDispatcher?.openTicketModal(evtId);
        return;
      }

      const detailBtn = e.target.closest('.btn-card-detail');
      if (detailBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = detailBtn.getAttribute('data-event-id');
        sound.playClick();
        window.location.hash = `#event/${id}`;
        return;
      }
    });

    // Search input
    const searchInput = this.container.querySelector('#discover-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        store.setSearchQuery(searchInput.value);
        this.render();
      });
    }

    // Clear search
    const clearBtn = this.container.querySelector('#btn-clear-search');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        sound.playClick();
        store.setSearchQuery('');
        this.render();
      });
    }

    // Category pills
    this.container.querySelectorAll('.filter-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat');
        sound.playClick();
        store.setCategoryFilter(cat);
        this.render();
      });
    });

    // Mode buttons
    this.container.querySelectorAll('.filter-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        sound.playClick();
        store.setModeFilter(mode);
        this.render();
      });
    });

    // Difficulty buttons
    this.container.querySelectorAll('.filter-diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const diff = btn.getAttribute('data-diff');
        sound.playClick();
        store.setDifficultyFilter(diff);
        this.render();
      });
    });

    // Reset filters
    const resetBtn = this.container.querySelector('#btn-reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        sound.playClick();
        store.activeFilterCategory = 'All';
        store.activeFilterMode = 'All';
        store.activeFilterDifficulty = 'All';
        store.activeSearchQuery = '';
        this.render();
      });
    }

    // Layout toggles
    const gridBtn = this.container.querySelector('#btn-view-grid');
    if (gridBtn) {
      gridBtn.addEventListener('click', () => {
        this.viewMode = 'grid';
        sound.playClick();
        this.render();
      });
    }

    const listBtn = this.container.querySelector('#btn-view-list');
    if (listBtn) {
      listBtn.addEventListener('click', () => {
        this.viewMode = 'list';
        sound.playClick();
        this.render();
      });
    }

    // Direct card action bindings
    this.container.querySelectorAll('.btn-card-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-event-id');
        sound.playClick();
        window.location.hash = `#event/${id}`;
      });
    });

    this.container.querySelectorAll('.btn-card-quick-reg').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.getAttribute('data-event-id');
        sound.playClick();
        window.appDispatcher?.openRegistration(id);
      });
    });

    this.container.querySelectorAll('.btn-card-view-pass').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const evtId = btn.getAttribute('data-ticket-id');
        sound.playClick();
        window.appDispatcher?.openTicketModal(evtId);
      });
    });
  }
}

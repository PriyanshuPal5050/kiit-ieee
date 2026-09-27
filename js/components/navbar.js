/**
 * KIIT IEEE Platform - Top Navigation Bar
 * Glassmorphic, responsive, multi-role navigation supporting Students, Hosts, and Administrators.
 */

import { store } from '../state.js';
import { sound } from '../services/audio-service.js';

export class Navbar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.mobileOpen = false;
    this.init();
  }

  init() {
    this.render();
    store.subscribe((state, changeType) => {
      if (['ROLE_CHANGED', 'VIEW_CHANGED', 'NOTIFICATIONS_CLEARED', 'NOTIFICATION_ADDED', 'SOUND_TOGGLED', 'USER_SWITCHED'].includes(changeType)) {
        this.render();
      }
    });
  }

  render() {
    if (!this.container) return;
    const isHost = store.user.role === 'organizer' || store.user.role === 'admin';
    const unreadCount = store.notifications.filter(n => !n.read).length;

    this.container.innerHTML = `
      <nav class="fixed top-0 left-0 right-0 z-40 glass-nav transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16 sm:h-20">
            
            <!-- Left: Logo & Brand -->
            <div class="flex items-center gap-6 lg:gap-8">
              <a href="#home" id="nav-brand-logo" class="flex items-center gap-3 group cursor-pointer">
                <div class="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
                  <div class="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <span class="font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300 text-sm tracking-tighter">IEEE</span>
                  </div>
                </div>
                <div class="flex flex-col">
                  <div class="flex items-center gap-2">
                    <span class="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-indigo-300 transition-colors">KIIT IEEE</span>
                    <span class="live-pulse"></span>
                  </div>
                  <span class="text-[9px] sm:text-[10px] text-slate-400 tracking-wider uppercase font-semibold">Student Branch</span>
                </div>
              </a>

              <!-- Desktop Nav Links -->
              <div class="hidden xl:flex items-center gap-1">
                <button data-view="home" class="nav-link px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${store.activeView === 'home' ? 'text-white bg-white/10 font-bold' : 'text-slate-300 hover:text-white hover:bg-white/5'}">
                  Home
                </button>
                <button data-view="discover" class="nav-link px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${store.activeView === 'discover' ? 'text-white bg-white/10 font-bold' : 'text-slate-300 hover:text-white hover:bg-white/5'}">
                  Discover
                </button>
                <button data-view="dashboard" class="nav-link px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${store.activeView === 'dashboard' ? 'text-white bg-white/10 font-bold' : 'text-slate-300 hover:text-white hover:bg-white/5'}">
                  My Hub
                </button>
                <button data-view="live-event" class="nav-link px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${store.activeView === 'live-event' ? 'text-rose-300 bg-rose-950/40 border border-rose-500/30' : 'text-rose-400/90 hover:text-rose-300 hover:bg-rose-950/20'}">
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                  Live Event 🔴
                </button>
                <button data-view="teams" class="nav-link px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${store.activeView === 'teams' ? 'text-white bg-white/10 font-bold' : 'text-slate-300 hover:text-white hover:bg-white/5'}">
                  Teams
                </button>
                <button data-view="showcase" class="nav-link px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${store.activeView === 'showcase' ? 'text-white bg-white/10 font-bold' : 'text-slate-300 hover:text-white hover:bg-white/5'}">
                  Showcase
                </button>
                <button data-view="challenges" class="nav-link px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${store.activeView === 'challenges' ? 'text-white bg-white/10 font-bold' : 'text-slate-300 hover:text-white hover:bg-white/5'}">
                  Arena
                </button>
                <button data-view="copilot" class="nav-link px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${store.activeView === 'copilot' ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-500/30' : 'text-slate-300 hover:text-cyan-300 hover:bg-white/5'}">
                  <span class="text-cyan-400">⚡</span> Copilot
                </button>
                <button data-view="about" class="nav-link px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${store.activeView === 'about' ? 'text-white bg-white/10 font-bold' : 'text-slate-300 hover:text-white hover:bg-white/5'}">
                  About KIIT
                </button>

                ${isHost ? `
                  <div class="h-4 w-[1px] bg-white/20 mx-1"></div>
                  <button data-view="organizer" class="nav-link px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${store.activeView === 'organizer' ? 'text-amber-300 bg-amber-950/40 border border-amber-500/30' : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-950/20'}">
                    Host Command 🛡️
                  </button>
                  <button data-view="ai-builder" class="nav-link px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${store.activeView === 'ai-builder' ? 'text-purple-300 bg-purple-950/40' : 'text-purple-300 hover:bg-purple-950/20'}">
                    AI Builder
                  </button>
                ` : ''}
              </div>
            </div>

            <!-- Right Controls: Search, Auth Switcher, Sound, Notifs, Profile -->
            <div class="flex items-center gap-2 sm:gap-2.5">
              
              <!-- Ctrl+K Search Pill -->
              <button 
                id="btn-open-palette" 
                class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-indigo-500/40 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all group"
                title="Search commands and events (Ctrl + K)"
              >
                <svg class="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <span>Search</span>
                <kbd class="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-400 font-mono">⌘K</kbd>
              </button>

              <!-- Auth & Role Switcher Trigger -->
              <button 
                id="btn-open-auth-modal" 
                class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all btn-press ${
                  isHost ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10' :
                  store.user.role === 'volunteer' ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' :
                  store.user.role === 'admin' ? 'bg-purple-500/10 border-purple-500/40 text-purple-300' :
                  'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 shadow-sm shadow-indigo-500/10'
                }"
                title="Switch account profile or log in (Student, Host, Volunteer, Admin)"
              >
                <span class="text-xs">
                  ${
                    store.user.role === 'organizer' ? '🛡️ Host' :
                    store.user.role === 'admin' ? '⚙️ Admin' :
                    store.user.role === 'volunteer' ? '🚀 Volunteer' :
                    '🎓 Student'
                  }
                </span>
                <span class="hidden md:inline text-[10px] opacity-75 font-normal">Switch</span>
              </button>

              <!-- Sound Toggle -->
              <button 
                id="btn-toggle-sound" 
                class="p-2 rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white bg-slate-900/60 transition-all btn-press"
                title="${store.soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}"
              >
                ${store.soundEnabled ? `
                  <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
                ` : `
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path></svg>
                `}
              </button>

              <!-- Notifications Bell -->
              <div class="relative">
                <button 
                  id="btn-toggle-notifs" 
                  class="p-2 rounded-xl border border-white/10 hover:border-white/20 text-slate-400 hover:text-white bg-slate-900/60 transition-all relative btn-press"
                  title="Notifications"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                  ${unreadCount > 0 ? `
                    <span class="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                      ${unreadCount}
                    </span>
                  ` : ''}
                </button>
              </div>

              <!-- Profile Avatar -->
              <button 
                id="btn-nav-profile" 
                class="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-indigo-500/40 transition-all"
                title="View Technical Profile"
              >
                <img src="${store.user.avatar}" alt="${store.user.name}" class="w-7 h-7 rounded-lg object-cover border border-white/10" />
                <span class="hidden md:inline text-xs font-semibold text-slate-200">${store.user.name.split(' ')[0]}</span>
              </button>

              <!-- Mobile Hamburger Menu Button -->
              <button 
                id="btn-mobile-menu" 
                class="xl:hidden p-2 rounded-xl border border-white/10 text-slate-300 hover:text-white bg-slate-900/60"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Drawer -->
        <div id="mobile-nav-drawer" class="xl:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3 ${this.mobileOpen ? 'block' : 'hidden'}">
          <div class="grid grid-cols-2 gap-2 pb-2 border-b border-white/10 text-xs">
            <button data-view="home" class="mobile-nav-link text-left px-3 py-2 rounded-lg font-medium ${store.activeView === 'home' ? 'bg-indigo-600/30 text-white font-bold' : 'text-slate-300'}">Home</button>
            <button data-view="discover" class="mobile-nav-link text-left px-3 py-2 rounded-lg font-medium ${store.activeView === 'discover' ? 'bg-indigo-600/30 text-white font-bold' : 'text-slate-300'}">Discover</button>
            <button data-view="dashboard" class="mobile-nav-link text-left px-3 py-2 rounded-lg font-medium ${store.activeView === 'dashboard' ? 'bg-indigo-600/30 text-white font-bold' : 'text-slate-300'}">My Hub</button>
            <button data-view="live-event" class="mobile-nav-link text-left px-3 py-2 rounded-lg font-bold text-rose-300 ${store.activeView === 'live-event' ? 'bg-rose-950/50' : ''}">Live Event 🔴</button>
            <button data-view="teams" class="mobile-nav-link text-left px-3 py-2 rounded-lg font-medium ${store.activeView === 'teams' ? 'bg-indigo-600/30 text-white font-bold' : 'text-slate-300'}">Teams</button>
            <button data-view="showcase" class="mobile-nav-link text-left px-3 py-2 rounded-lg font-medium ${store.activeView === 'showcase' ? 'bg-indigo-600/30 text-white font-bold' : 'text-slate-300'}">Showcase</button>
            <button data-view="challenges" class="mobile-nav-link text-left px-3 py-2 rounded-lg font-medium ${store.activeView === 'challenges' ? 'bg-indigo-600/30 text-white font-bold' : 'text-slate-300'}">Arena</button>
            <button data-view="copilot" class="mobile-nav-link text-left px-3 py-2 rounded-lg font-medium text-cyan-300">⚡ Copilot</button>
            <button data-view="about" class="mobile-nav-link text-left px-3 py-2 rounded-lg font-medium text-slate-300">About KIIT</button>
            <button data-view="certificates" class="mobile-nav-link text-left px-3 py-2 rounded-lg font-medium text-slate-300">Certificates</button>
          </div>
          
          <div>
            <span class="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Host & Organizer Tools</span>
            <div class="grid grid-cols-2 gap-2 mt-1">
              <button data-view="organizer" class="mobile-nav-link text-left px-3 py-2 rounded-lg text-xs font-bold bg-amber-950/40 text-amber-300">Host Command Center</button>
              <button data-view="ai-builder" class="mobile-nav-link text-left px-3 py-2 rounded-lg text-xs font-medium bg-purple-950/40 text-purple-300">AI Event Builder</button>
            </div>
          </div>
        </div>
      </nav>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.container.querySelectorAll('.nav-link, .mobile-nav-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        sound.playClick();
        store.setView(view);
        this.mobileOpen = false;
        const drawer = this.container.querySelector('#mobile-nav-drawer');
        if (drawer) drawer.classList.add('hidden');
      });
    });

    const logo = this.container.querySelector('#nav-brand-logo');
    if (logo) {
      logo.addEventListener('click', (e) => {
        e.preventDefault();
        sound.playClick();
        store.setView('home');
      });
    }

    // Open Auth modal / demo switcher
    const authBtn = this.container.querySelector('#btn-open-auth-modal');
    if (authBtn) {
      authBtn.addEventListener('click', () => {
        sound.playClick();
        window.appDispatcher?.openAuthModal?.();
      });
    }

    // Sound toggle
    const soundBtn = this.container.querySelector('#btn-toggle-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const enabled = store.toggleSound();
        if (enabled) sound.playClick();
      });
    }

    // Open Command Palette
    const palBtn = this.container.querySelector('#btn-open-palette');
    if (palBtn) {
      palBtn.addEventListener('click', () => {
        sound.playClick();
        window.appDispatcher?.openCommandPalette();
      });
    }

    // Notifications toggle
    const notifsBtn = this.container.querySelector('#btn-toggle-notifs');
    if (notifsBtn) {
      notifsBtn.addEventListener('click', () => {
        sound.playClick();
        window.appDispatcher?.openNotifications();
      });
    }

    // Profile click
    const profBtn = this.container.querySelector('#btn-nav-profile');
    if (profBtn) {
      profBtn.addEventListener('click', () => {
        sound.playClick();
        store.setView('profile');
      });
    }

    // Mobile menu toggle
    const mobileBtn = this.container.querySelector('#btn-mobile-menu');
    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        this.mobileOpen = !this.mobileOpen;
        const drawer = this.container.querySelector('#mobile-nav-drawer');
        if (drawer) {
          if (this.mobileOpen) drawer.classList.remove('hidden');
          else drawer.classList.add('hidden');
        }
      });
    }
  }
}

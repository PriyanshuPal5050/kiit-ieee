/**
 * KIIT IEEE Platform - Community Showcase & Student Builds ("What Students Are Building")
 * Shareable technical portfolio, reactive upvote engine, and project submission wizard.
 */

import { store } from '../state.js';
import { sound } from '../services/audio-service.js';
import { toast } from '../components/toast.js';

export class ShowcaseView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.submitModalOpen = false;
    this.filterTech = 'All';
  }

  render() {
    if (!this.container) return;
    const projects = store.showcase;
    const user = store.user;

    const filteredProjects = projects.filter(p => {
      if (this.filterTech !== 'All') {
        return p.techStack.some(t => t.toLowerCase() === this.filterTech.toLowerCase());
      }
      return true;
    });

    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <span>🚀</span> Student Technical Portfolio
            </div>
            <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight">What Students Are Building.</h1>
            <p class="text-sm text-slate-400 mt-1 max-w-xl">
              Real functional capstone artifacts, open-source repositories, and autonomous hardware created during KIIT IEEE workshops and hackathons.
            </p>
          </div>

          <div class="flex items-center gap-2.5">
            <button id="btn-open-submit-build" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all btn-press flex items-center gap-2">
              <span>✨</span> Submit Your Build (+250 XP)
            </button>
          </div>
        </div>

        <!-- Filter Pills Bar -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <span class="text-xs text-slate-400 font-semibold mr-1">Filter Stack:</span>
          ${['All', 'PyTorch', 'TensorRT', 'ESP32', 'FreeRTOS', 'Next.js 15', 'Python', 'Linux'].map(tech => `
            <button data-tech="${tech}" class="btn-filter-tech px-3 py-1.5 rounded-xl text-xs font-semibold transition-all btn-press ${this.filterTech === tech ? 'bg-indigo-600 text-white shadow' : 'bg-slate-950/80 text-slate-400 hover:text-white border border-white/10'}">
              ${tech}
            </button>
          `).join('')}
        </div>

        <!-- Projects Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${filteredProjects.map(proj => this.renderProjectCard(proj, user)).join('')}
        </div>

        <!-- Submit Build Modal -->
        ${this.submitModalOpen ? this.renderSubmitModal() : ''}

      </div>
    `;

    this.bindEvents();
  }

  renderProjectCard(proj, user) {
    return `
      <div class="glass-card p-6 rounded-3xl border border-white/10 hover:border-indigo-500/40 flex flex-col justify-between space-y-5 group transition-all">
        <div class="space-y-3">
          
          <!-- Author & Meta -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img src="${proj.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}" class="w-9 h-9 rounded-xl object-cover border border-white/10" />
              <div>
                <div class="text-xs font-bold text-white">${proj.author}</div>
                <div class="text-[10px] text-slate-400 font-mono">${proj.event}</div>
              </div>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              ${proj.badge || 'Verified Build'}
            </span>
          </div>

          <!-- Title & Description -->
          <div>
            <h3 class="text-xl font-extrabold text-white group-hover:text-indigo-300 transition-colors">${proj.title}</h3>
            <p class="text-xs text-slate-300 leading-relaxed mt-1">${proj.description}</p>
          </div>

          <!-- Tech Stack Tags -->
          <div class="flex flex-wrap gap-1.5 pt-1">
            ${proj.techStack.map(t => `
              <span class="px-2 py-0.5 rounded-lg bg-slate-950 text-[10px] text-cyan-300 font-mono border border-cyan-500/20">${t}</span>
            `).join('')}
          </div>

        </div>

        <!-- Card Footer Actions: Upvote, GitHub, Demo -->
        <div class="pt-4 border-t border-white/10 flex items-center justify-between">
          
          <!-- Upvote Counter Button -->
          <button data-upvote-id="${proj.id}" class="btn-upvote-project flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/40 text-xs font-bold text-slate-200 hover:text-indigo-300 transition-all btn-press">
            <span>🔥</span>
            <span>${proj.upvotes || 0} Upvotes</span>
          </button>

          <!-- Links -->
          <div class="flex items-center gap-2">
            ${proj.githubUrl ? `
              <a href="${proj.githubUrl}" target="_blank" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-colors flex items-center gap-1.5">
                <span>💻</span> Code
              </a>
            ` : ''}

            ${proj.demoUrl ? `
              <a href="${proj.demoUrl}" target="_blank" class="px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-colors flex items-center gap-1.5">
                <span>🚀</span> Live Demo
              </a>
            ` : ''}
          </div>

        </div>
      </div>
    `;
  }

  renderSubmitModal() {
    return `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
        <div class="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/15 p-6 sm:p-8 shadow-2xl space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 class="text-xl font-black text-white">Publish Capstone to Showcase</h3>
              <p class="text-xs text-slate-400">Share your working code with 4,200+ KIIT builders</p>
            </div>
            <button id="submit-modal-close" class="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5">✕</button>
          </div>

          <form id="submit-build-form" class="space-y-4 text-xs">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Project Title</label>
              <input id="proj-input-title" required placeholder="e.g. Real-Time Autonomous Obstacle Avoidance Rover" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Associated Event</label>
              <select id="proj-input-event" class="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500">
                ${store.events.map(e => `
                  <option value="${e.title}">${e.title}</option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Project Description & Architecture</label>
              <textarea id="proj-input-desc" required rows="3" placeholder="Explain what it does, how it works, and key technologies used..." class="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"></textarea>
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Technologies Used (Comma separated)</label>
              <input id="proj-input-tech" placeholder="PyTorch, TensorRT, OpenCV, ESP32" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-white" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-300 mb-1">GitHub Repository URL</label>
                <input id="proj-input-github" placeholder="https://github.com/..." class="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white" />
              </div>
              <div>
                <label class="block font-semibold text-slate-300 mb-1">Live Demo / Video URL</label>
                <input id="proj-input-demo" placeholder="https://..." class="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white" />
              </div>
            </div>

            <div class="pt-3 flex justify-end gap-2 border-t border-white/10">
              <button type="button" id="submit-modal-cancel" class="px-4 py-2 rounded-xl bg-white/5 text-slate-300">Cancel</button>
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold btn-press">
                Publish Build (+250 XP) 🚀
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const openBtn = this.container.querySelector('#btn-open-submit-build');
    if (openBtn) {
      openBtn.addEventListener('click', () => {
        sound.playClick();
        this.submitModalOpen = true;
        this.render();
      });
    }

    const closeBtn = this.container.querySelector('#submit-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => { this.submitModalOpen = false; this.render(); });

    const cancelBtn = this.container.querySelector('#submit-modal-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', () => { this.submitModalOpen = false; this.render(); });

    if (this.submitModalOpen) {
      const modalBackdrop = this.container.querySelector('.fixed.inset-0');
      if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
          if (e.target === modalBackdrop) {
            this.submitModalOpen = false;
            this.render();
          }
        });
      }
      const escapeHandler = (e) => {
        if (e.key === 'Escape' && this.submitModalOpen) {
          this.submitModalOpen = false;
          window.removeEventListener('keydown', escapeHandler);
          this.render();
        }
      };
      window.addEventListener('keydown', escapeHandler);
    }

    // Filter by tech
    this.container.querySelectorAll('.btn-filter-tech').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        this.filterTech = btn.getAttribute('data-tech');
        this.render();
      });
    });

    // Upvote Button
    this.container.querySelectorAll('.btn-upvote-project').forEach(btn => {
      btn.addEventListener('click', () => {
        const projId = btn.getAttribute('data-upvote-id');
        sound.playSuccess();
        store.upvoteProject(projId);
        toast.show({ title: 'Build Upvoted! 🔥', message: '+10 XP awarded for recognizing community builds.', type: 'success' });
        this.render();
      });
    });

    // Submit build form
    const form = this.container.querySelector('#submit-build-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        sound.playSuccess();
        const title = this.container.querySelector('#proj-input-title').value;
        const event = this.container.querySelector('#proj-input-event').value;
        const description = this.container.querySelector('#proj-input-desc').value;
        const techStr = this.container.querySelector('#proj-input-tech').value;
        const githubUrl = this.container.querySelector('#proj-input-github').value;
        const demoUrl = this.container.querySelector('#proj-input-demo').value;

        const techStack = techStr ? techStr.split(',').map(s => s.trim()) : ['Python', 'OpenCV'];

        store.addProject({
          title,
          event,
          description,
          techStack,
          githubUrl,
          demoUrl
        });

        toast.show({ title: 'Build Published! 🌟', message: 'Your capstone is live in the Community Showcase (+250 XP).', type: 'success' });
        this.submitModalOpen = false;
        this.render();
      });
    }
  }
}

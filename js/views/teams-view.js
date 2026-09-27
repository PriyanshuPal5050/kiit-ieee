/**
 * KIIT IEEE Platform - Team Finder & Collaboration Arena
 * Student teammate discovery, team creation, AI missing skills detector, and role management.
 */

import { store } from '../state.js';
import { sound } from '../services/audio-service.js';
import { toast } from '../components/toast.js';

export class TeamsView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.createModalOpen = false;
    this.filterSkill = 'All';
  }

  render() {
    if (!this.container) return;
    const teams = store.teams;
    const user = store.user;
    const isHost = user.role === 'organizer' || user.role === 'admin';

    const filteredTeams = teams.filter(t => {
      if (this.filterSkill !== 'All') {
        const hasSkill = t.skills.some(s => s.toLowerCase().includes(this.filterSkill.toLowerCase()));
        const lookingSkill = (t.lookingFor || '').toLowerCase().includes(this.filterSkill.toLowerCase());
        if (!hasSkill && !lookingSkill) return false;
      }
      return true;
    });

    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
              <span>🤝</span> Team Finder & Collaboration Arena
            </div>
            <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight">Build Together.</h1>
            <p class="text-sm text-slate-400 mt-1 max-w-xl">
              Find technical co-builders for hackathons and workshops. Balance hardware, backend, AI, and design skills.
            </p>
          </div>

          <div class="flex items-center gap-2.5">
            <button id="btn-open-create-team" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all btn-press flex items-center gap-2">
              <span>➕</span> Create a Team
            </button>
          </div>
        </div>

        <!-- AI Team Matchmaker & Missing Skill Insight Banner -->
        <div class="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-cyan-950/60 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-lg">
              ⚡
            </div>
            <div>
              <div class="text-xs font-bold text-white">AI Team Composition Radar</div>
              <p class="text-xs text-slate-300">
                Team Nova currently lacks a <span class="text-amber-300 font-bold">Frontend / UI specialist</span>. 
                Team Alpha needs an <span class="text-indigo-300 font-bold">Embedded C++ engineer</span>.
              </p>
            </div>
          </div>
          <span class="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-400 whitespace-nowrap">
            Auto-analyzed across 4 active teams
          </span>
        </div>

        <!-- Filter Bar -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <span class="text-xs text-slate-400 font-semibold mr-1">Filter by Tech:</span>
          ${['All', 'PyTorch', 'TensorRT', 'ESP32', 'FreeRTOS', 'Frontend', 'Linux'].map(skill => `
            <button data-skill="${skill}" class="btn-filter-skill px-3 py-1.5 rounded-xl text-xs font-semibold transition-all btn-press ${this.filterSkill === skill ? 'bg-indigo-600 text-white shadow' : 'bg-slate-950/80 text-slate-400 hover:text-white border border-white/10'}">
              ${skill}
            </button>
          `).join('')}
        </div>

        <!-- Teams Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${filteredTeams.map(t => this.renderTeamCard(t, user, isHost)).join('')}
        </div>

        <!-- Create Team Modal -->
        ${this.createModalOpen ? this.renderCreateModal() : ''}

      </div>
    `;

    this.bindEvents();
  }

  renderTeamCard(t, user, isHost) {
    const isMember = t.members.some(m => m.rollNo === user.rollNo);

    return `
      <div class="glass-card p-6 rounded-3xl border border-white/10 hover:border-indigo-500/40 flex flex-col justify-between space-y-5 group transition-all">
        <div>
          <!-- Header -->
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">${t.bench}</span>
              <h3 class="text-xl font-black text-white group-hover:text-indigo-300 transition-colors">${t.name}</h3>
              <p class="text-xs text-slate-400 font-medium">${t.event}</p>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${t.status === 'Ready for Arena' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}">
              ${t.status}
            </span>
          </div>

          <!-- Project Idea -->
          <div class="mt-3 p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase">Capstone Objective</span>
            <p class="text-xs text-slate-200 font-medium">"${t.projectIdea}"</p>
          </div>

          <!-- Current Members Roster -->
          <div class="mt-4 space-y-2">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Team Roster (${t.members.length} Members)</span>
            <div class="space-y-1.5">
              ${t.members.map(m => `
                <div class="flex items-center justify-between text-xs py-1 px-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white">${m.name}</span>
                    <span class="text-[10px] text-slate-400 font-mono">${m.rollNo}</span>
                  </div>
                  <span class="text-[10px] px-2 py-0.5 rounded-md ${m.lead ? 'bg-amber-500/20 text-amber-300 font-bold' : 'bg-white/5 text-slate-300'}">
                    ${m.role}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Looking For Badge -->
          <div class="mt-3 p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 flex items-center gap-2">
            <span class="text-cyan-400 font-bold">Looking for:</span>
            <span class="font-semibold text-white">${t.lookingFor}</span>
          </div>

          <!-- Missing Skills Alert -->
          ${t.missingSkills && t.missingSkills.length > 0 ? `
            <div class="mt-2 text-[11px] text-amber-400/90 flex items-center gap-1 font-medium">
              <span>⚠️</span> Skill Gap: Needs ${t.missingSkills.join(', ')}
            </div>
          ` : ''}

        </div>

        <!-- Actions -->
        <div class="pt-4 border-t border-white/10 flex items-center justify-between">
          <div class="flex flex-wrap gap-1">
            ${t.skills.map(s => `
              <span class="px-2 py-0.5 rounded-lg bg-white/5 text-[10px] text-slate-300 border border-white/10">${s}</span>
            `).join('')}
          </div>

          <div>
            ${isMember ? `
              <span class="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                You're in this team ✓
              </span>
            ` : `
              <button data-team-id="${t.id}" class="btn-join-team px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all btn-press">
                Request to Join
              </button>
            `}
          </div>
        </div>

      </div>
    `;
  }

  renderCreateModal() {
    return `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
        <div class="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-white/15 p-6 sm:p-8 shadow-2xl space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 class="text-xl font-black text-white">Create an Engineering Team</h3>
              <p class="text-xs text-slate-400">Assemble your team for IEEE workshops & hackathons</p>
            </div>
            <button id="create-modal-close" class="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5">✕</button>
          </div>

          <form id="create-team-form" class="space-y-4 text-xs">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Team Name</label>
              <input id="team-input-name" required placeholder="e.g. Team Hyperion, CyberOps, NeuralNexus" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Target Event</label>
              <select id="team-input-event" class="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500">
                ${store.events.map(e => `
                  <option value="${e.title}">${e.title}</option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Project / Capstone Objective</label>
              <textarea id="team-input-idea" rows="2" placeholder="What are you building together?" class="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"></textarea>
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Your Role in Team</label>
              <input id="team-input-role" value="Lead AI Engineer" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-white" />
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">What skills are you looking for?</label>
              <input id="team-input-looking" placeholder="e.g. Frontend UI Designer, ROS2 Expert, Hardware Specialist" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-white" />
            </div>

            <div class="pt-3 flex justify-end gap-2 border-t border-white/10">
              <button type="button" id="create-modal-cancel" class="px-4 py-2 rounded-xl bg-white/5 text-slate-300">Cancel</button>
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold btn-press">
                Publish Team
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const openBtn = this.container.querySelector('#btn-open-create-team');
    if (openBtn) {
      openBtn.addEventListener('click', () => {
        sound.playClick();
        this.createModalOpen = true;
        this.render();
      });
    }

    const closeBtn = this.container.querySelector('#create-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => { this.createModalOpen = false; this.render(); });

    const cancelBtn = this.container.querySelector('#create-modal-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', () => { this.createModalOpen = false; this.render(); });

    if (this.createModalOpen) {
      const modalBackdrop = this.container.querySelector('.fixed.inset-0');
      if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
          if (e.target === modalBackdrop) {
            this.createModalOpen = false;
            this.render();
          }
        });
      }
      const escapeHandler = (e) => {
        if (e.key === 'Escape' && this.createModalOpen) {
          this.createModalOpen = false;
          window.removeEventListener('keydown', escapeHandler);
          this.render();
        }
      };
      window.addEventListener('keydown', escapeHandler);
    }

    // Filter by skill
    this.container.querySelectorAll('.btn-filter-skill').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        this.filterSkill = btn.getAttribute('data-skill');
        this.render();
      });
    });

    // Join team button
    this.container.querySelectorAll('.btn-join-team').forEach(btn => {
      btn.addEventListener('click', () => {
        const teamId = btn.getAttribute('data-team-id');
        const res = store.joinTeam(teamId);
        sound.playSuccess();
        toast.show({ title: 'Joined Team! 🤝', message: 'You have been added to the team roster.', type: 'success' });
        this.render();
      });
    });

    // Create team form
    const form = this.container.querySelector('#create-team-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        sound.playSuccess();
        const name = this.container.querySelector('#team-input-name').value;
        const event = this.container.querySelector('#team-input-event').value;
        const projectIdea = this.container.querySelector('#team-input-idea').value;
        const leaderRole = this.container.querySelector('#team-input-role').value;
        const lookingFor = this.container.querySelector('#team-input-looking').value;

        store.createTeam({
          name,
          event,
          projectIdea,
          leaderRole,
          lookingFor,
          bench: "Bench B" + Math.floor(10 + Math.random() * 15)
        });

        toast.show({ title: 'Team Created! 🚀', message: `Team "${name}" is now recruiting in the Team Finder.`, type: 'success' });
        this.createModalOpen = false;
        this.render();
      });
    }
  }
}

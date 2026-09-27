/**
 * KIIT IEEE Platform - Volunteer Support & Bench Dispatch Queue
 * Live lab troubleshooting ticket triage with claiming, resolution notes, and audio alerts.
 */

import { store } from '../state.js';
import { sound } from '../services/audio-service.js';
import { toast } from '../components/toast.js';

export class VolunteerView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.statusFilter = 'All'; // 'All' | 'Open' | 'In Progress' | 'Resolved'
  }

  render() {
    if (!this.container) return;

    const tickets = store.supportTickets.filter(t => {
      if (this.statusFilter === 'All') return true;
      return t.status === this.statusFilter;
    });

    const openCount = store.supportTickets.filter(t => t.status === 'Open').length;
    const inProgressCount = store.supportTickets.filter(t => t.status === 'In Progress').length;
    const resolvedCount = store.supportTickets.filter(t => t.status === 'Resolved').length;

    this.container.innerHTML = `
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div class="inline-flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-widest mb-1">
              <span>🚨</span> Lab Floor Operations
            </div>
            <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight">Volunteer Support Dispatch</h1>
            <p class="text-sm text-slate-400 mt-1 max-w-xl">
              Live bench assistance queue for Campus 15 Tech Labs. Claim tickets, unblock students, and maintain 100% lab velocity.
            </p>
          </div>

          <!-- New Ticket Action -->
          <button id="btn-create-bench-ticket" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all btn-press flex items-center gap-2 self-start sm:self-auto">
            <span>+</span> Request Help at My Bench
          </button>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-3 gap-4">
          <div class="glass-card p-4 rounded-2xl border border-rose-500/30 space-y-1">
            <span class="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Open Tickets</span>
            <div class="text-2xl font-black text-white">${openCount}</div>
            <div class="text-[10px] text-slate-400">Needs volunteer claim</div>
          </div>
          <div class="glass-card p-4 rounded-2xl border border-amber-500/30 space-y-1">
            <span class="text-[11px] font-bold text-amber-400 uppercase tracking-wider">In Progress</span>
            <div class="text-2xl font-black text-white">${inProgressCount}</div>
            <div class="text-[10px] text-slate-400">Volunteers at desk</div>
          </div>
          <div class="glass-card p-4 rounded-2xl border border-emerald-500/30 space-y-1">
            <span class="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Resolved Today</span>
            <div class="text-2xl font-black text-white">${resolvedCount}</div>
            <div class="text-[10px] text-emerald-400">Average fix time: 4m</div>
          </div>
        </div>

        <!-- Filter Status Tabs -->
        <div class="flex items-center gap-2 border-b border-white/10 pb-2">
          ${['All', 'Open', 'In Progress', 'Resolved'].map(st => `
            <button data-status="${st}" class="btn-filter-status px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all btn-press ${this.statusFilter === st ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white bg-white/5'}">
              ${st}
            </button>
          `).join('')}
        </div>

        <!-- Ticket Cards List -->
        <div class="space-y-4">
          ${tickets.length === 0 ? `
            <div class="p-12 text-center glass-panel rounded-3xl space-y-2">
              <span class="text-3xl block">🎉</span>
              <h3 class="text-base font-bold text-white">Queue Cleared!</h3>
              <p class="text-xs text-slate-400">No active support tickets in this category.</p>
            </div>
          ` : tickets.map(tck => `
            <div class="glass-card p-5 sm:p-6 rounded-2xl border ${this.getPriorityBorder(tck.priority)} space-y-3 transition-all">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div class="flex items-center gap-3">
                  <span class="font-mono text-sm font-extrabold px-3 py-1 rounded-xl bg-white/10 text-white border border-white/10">
                    📍 ${tck.bench}
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${this.getPriorityBadge(tck.priority)}">
                    ${tck.priority} PRIORITY
                  </span>
                  <span class="text-xs text-slate-400 font-mono">${tck.id}</span>
                </div>
                <div class="flex items-center gap-2 text-xs">
                  <span class="text-slate-400">${tck.createdAt}</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${tck.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300' : (tck.status === 'In Progress' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300')}">
                    ${tck.status}
                  </span>
                </div>
              </div>

              <!-- Issue Body -->
              <div class="text-sm font-semibold text-white leading-relaxed">
                "${tck.issue}"
              </div>

              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs text-slate-400">
                <div>
                  Student: <span class="text-slate-200 font-medium">${tck.student}</span> • Event: <span class="text-indigo-300 font-medium">${tck.event}</span>
                </div>

                <div class="flex items-center gap-2">
                  ${tck.status === 'Open' ? `
                    <button data-tck-id="${tck.id}" class="btn-claim-tck px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all btn-press">
                      Claim Ticket ✋
                    </button>
                  ` : ''}

                  ${tck.status === 'In Progress' ? `
                    <span class="text-amber-300 font-medium mr-2">Assigned: ${tck.assignedVolunteer || 'Volunteer'}</span>
                    <button data-tck-id="${tck.id}" class="btn-resolve-tck px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all btn-press">
                      Mark Resolved ✓
                    </button>
                  ` : ''}

                  ${tck.status === 'Resolved' ? `
                    <span class="text-emerald-400 font-semibold">Resolved ✓ ${tck.resolutionNote ? `(${tck.resolutionNote})` : ''}</span>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    `;

    this.bindEvents();
  }

  getPriorityBorder(p) {
    if (p === 'HIGH') return 'border-rose-500/40 bg-rose-950/10 shadow-lg shadow-rose-950/20';
    if (p === 'MEDIUM') return 'border-amber-500/40 bg-amber-950/10';
    return 'border-white/10';
  }

  getPriorityBadge(p) {
    if (p === 'HIGH') return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
    if (p === 'MEDIUM') return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    return 'bg-slate-500/20 text-slate-300 border border-slate-500/30';
  }

  bindEvents() {
    // Request help button
    const createBtn = this.container.querySelector('#btn-create-bench-ticket');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        sound.playClick();
        window.appDispatcher?.openVolunteerModal();
      });
    }

    // Status filter tabs
    this.container.querySelectorAll('.btn-filter-status').forEach(btn => {
      btn.addEventListener('click', () => {
        this.statusFilter = btn.getAttribute('data-status');
        sound.playClick();
        this.render();
      });
    });

    // Claim ticket
    this.container.querySelectorAll('.btn-claim-tck').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-tck-id');
        store.claimSupportTicket(id, `${store.user.name.split(' ')[0]} (Volunteer Lead)`);
        sound.playSuccess();
        toast.show({ title: 'Ticket Claimed', message: `You have accepted ticket ${id}. Please proceed to the bench.`, type: 'success' });
        this.render();
      });
    });

    // Resolve ticket
    this.container.querySelectorAll('.btn-resolve-tck').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-tck-id');
        const note = prompt("Enter a brief resolution note (e.g. Swapped USB-C cable, rebound CH340 COM port):", "Hardware cable reseated and verified");
        if (note !== null) {
          store.resolveSupportTicket(id, note.trim());
          sound.playSuccess();
          toast.show({ title: 'Ticket Resolved', message: `Ticket ${id} marked complete!`, type: 'success' });
          this.render();
        }
      });
    });
  }
}

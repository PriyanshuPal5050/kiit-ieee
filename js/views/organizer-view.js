/**
 * KIIT IEEE Platform - Host Command Center ("IEEE Command Center")
 * "Your entire event, under control."
 * Executive telemetry, event control rooms, participant drill-down, live funnel,
 * team skill gap AI, support clustering, hardware inventory, certificate engine, and AI post-event reports.
 */

import { store } from '../state.js';
import { sound } from '../services/audio-service.js';
import { toast } from '../components/toast.js';
import { WhatsAppShareService, WHATSAPP_TEMPLATES, generateWhatsAppMessage } from '../services/messaging-service.js';

export class OrganizerView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeHostTab = 'overview'; // 'overview' | 'control-room' | 'participants' | 'attendance' | 'teams' | 'support' | 'hardware' | 'announcements' | 'certificates' | 'report'
    this.selectedEventId = 'evt-ai-cv-2026';
    this.participantFilter = '';
    this.participantStatusFilter = 'All';
    this.generatedReport = null;
    this.copilotQuestion = '';
    this.copilotHistory = [
      { q: "How many students checked in today?", a: "Across all active tracks, 762 students are checked in (84.6% check-in velocity). In Campus 15 Tech Lab 4, 118 out of 150 students are currently active at lab benches." },
      { q: "What is the primary support bottleneck?", a: "Detected cluster: 14 students reported CH340 USB serial binding failure on Windows 11. Recommending broadcasting the driver script." }
    ];
    this.chartInstance1 = null;
    this.chartInstance2 = null;
  }

  render() {
    if (!this.container) return;

    const totalEvents = store.events.length;
    const totalRegs = store.registrations.length;
    const attendedRegs = store.registrations.filter(r => r.attended).length;
    const attendancePct = totalRegs > 0 ? Math.round((attendedRegs / totalRegs) * 100) : 0;
    const openTickets = store.supportTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
    const eligibleCerts = store.registrations.filter(r => r.attended).length;
    const issuedCerts = store.certificates.length;

    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        
        <!-- Header & Executive Status -->
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
              <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              Host Command Center • Executive Operations
            </div>
            <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight">Host Command Center</h1>
            <p class="text-sm text-slate-400 mt-1 max-w-xl">
              Real-time multi-event operations, telemetry, bench volunteer dispatch, hardware tracking, and automated certification.
            </p>
          </div>

          <!-- Top Quick Actions -->
          <div class="flex flex-wrap items-center gap-2">
            <button id="btn-org-ai-builder" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all btn-press flex items-center gap-1.5">
              <span>✨</span> AI Event Builder
            </button>
            <button id="btn-org-quick-scan" class="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all btn-press flex items-center gap-1.5">
              <span>📷</span> Attendance Scanner
            </button>
            <button id="btn-org-generate-report" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/15 text-white font-bold text-xs transition-all btn-press flex items-center gap-1.5">
              <span>📊</span> AI Event Report
            </button>
          </div>
        </div>

        <!-- 6 Telemetry Metrics Cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div class="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Events</span>
            <div class="text-2xl font-black text-white">${totalEvents}</div>
            <span class="text-[10px] text-cyan-400">1 Live Lab Session</span>
          </div>

          <div class="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registrations</span>
            <div class="text-2xl font-black text-indigo-400">${totalRegs}</div>
            <span class="text-[10px] text-emerald-400">↑ 18% vs last week</span>
          </div>

          <div class="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Checked In Today</span>
            <div class="text-2xl font-black text-emerald-400">${attendedRegs}</div>
            <span class="text-[10px] text-slate-400">${attendancePct}% conversion</span>
          </div>

          <div class="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Students</span>
            <div class="text-2xl font-black text-amber-300">143</div>
            <span class="text-[10px] text-slate-400">At Lab Benches</span>
          </div>

          <div class="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Support Queue</span>
            <div class="text-2xl font-black ${openTickets > 0 ? 'text-rose-400' : 'text-slate-400'}">${openTickets}</div>
            <span class="text-[10px] text-slate-400">${openTickets > 0 ? 'Active bench alerts' : 'Queue clear'}</span>
          </div>

          <div class="glass-card p-4 rounded-2xl border border-white/10 space-y-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Certificates</span>
            <div class="text-2xl font-black text-purple-400">${issuedCerts}</div>
            <span class="text-[10px] text-purple-300">${eligibleCerts} Eligible</span>
          </div>
        </div>

        <!-- Host Navigation Tabs Bar -->
        <div class="flex items-center gap-1.5 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
          ${[
            { id: 'overview', label: '📊 Overview' },
            { id: 'control-room', label: '🎛️ Control Room' },
            { id: 'participants', label: `👥 Participants (${totalRegs})` },
            { id: 'attendance', label: '📷 Attendance Desk' },
            { id: 'teams', label: '🤝 Teams & Radar' },
            { id: 'support', label: `🚨 Support (${openTickets})` },
            { id: 'hardware', label: '🔌 Hardware Kits' },
            { id: 'announcements', label: '📢 Announcements' },
            { id: 'certificates', label: '📜 Certificate Engine' },
            { id: 'copilot', label: '🤖 Host AI Copilot' }
          ].map(tab => `
            <button data-host-tab="${tab.id}" class="btn-host-tab px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap btn-press ${this.activeHostTab === tab.id ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}">
              ${tab.label}
            </button>
          `).join('')}
        </div>

        <!-- Dynamic Host Tab Content -->
        <div id="host-tab-content">
          ${this.renderActiveTab(totalEvents, totalRegs, attendedRegs, attendancePct, openTickets, eligibleCerts)}
        </div>

      </div>
    `;

    this.bindEvents();
    if (this.activeHostTab === 'overview') {
      this.renderCharts();
    }
  }

  renderActiveTab(totalEvents, totalRegs, attendedRegs, attendancePct, openTickets, eligibleCerts) {
    switch (this.activeHostTab) {
      case 'control-room':
        return this.renderControlRoom();
      case 'participants':
        return this.renderParticipantsTab();
      case 'attendance':
        return this.renderAttendanceTab();
      case 'teams':
        return this.renderTeamsTab();
      case 'support':
        return this.renderSupportTab();
      case 'hardware':
        return this.renderHardwareTab();
      case 'announcements':
        return this.renderAnnouncementsTab();
      case 'certificates':
        return this.renderCertificatesTab(eligibleCerts);
      case 'copilot':
        return this.renderCopilotTab();
      case 'report':
        return this.renderReportTab();
      case 'overview':
      default:
        return this.renderOverviewTab();
    }
  }

  // --- TAB 1: EXECUTIVE OVERVIEW ---
  renderOverviewTab() {
    return `
      <div class="space-y-6">
        
        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-bold text-white">Student Registration Velocity</h3>
                <p class="text-xs text-slate-400">Daily signups across KIIT IEEE technical workshops</p>
              </div>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-white/5 text-slate-300 border border-white/10">7 Days Trend</span>
            </div>
            <div class="h-64 relative">
              <canvas id="chart-registration-trend"></canvas>
            </div>
          </div>

          <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div>
              <h3 class="text-base font-bold text-white">Curriculum Distribution</h3>
              <p class="text-xs text-slate-400">Seats allocated by technical domain</p>
            </div>
            <div class="h-64 relative flex items-center justify-center">
              <canvas id="chart-category-dist"></canvas>
            </div>
          </div>
        </div>

        <!-- Host Quick Operational Status -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Live Event Funnel -->
          <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-white">Real-Time Progression Funnel</h3>
              <span class="text-xs text-cyan-400 font-mono">Campus 15 Lab 4</span>
            </div>
            <div class="space-y-2 text-xs">
              ${[
                { step: "1. Registered", count: 184, pct: 100, color: "bg-indigo-500" },
                { step: "2. Checked In", count: 161, pct: 87, color: "bg-cyan-500" },
                { step: "3. Setup Complete", count: 152, pct: 82, color: "bg-emerald-500" },
                { step: "4. Lab 1 (OpenCV)", count: 149, pct: 80, color: "bg-amber-500" },
                { step: "5. Lab 2 (TensorRT)", count: 137, pct: 74, color: "bg-purple-500" },
                { step: "6. Challenge Submitted", count: 119, pct: 64, color: "bg-rose-500" },
                { step: "7. Capstone Project", count: 87, pct: 47, color: "bg-blue-500" }
              ].map(f => `
                <div class="space-y-1">
                  <div class="flex justify-between text-slate-300">
                    <span>${f.step}</span>
                    <span class="font-bold text-white font-mono">${f.count} (${f.pct}%)</span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div class="h-full rounded-full ${f.color}" style="width: ${f.pct}%"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Audit Activity Feed -->
          <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-white">Operational Audit Trail</h3>
              <span class="text-xs text-slate-400 font-mono">Live Sync</span>
            </div>
            <div class="space-y-2.5 text-xs">
              ${store.auditLogs.slice(0, 5).map(l => `
                <div class="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex items-start justify-between gap-3">
                  <div class="space-y-0.5">
                    <span class="font-bold text-white">${l.action}</span>
                    <div class="text-[10px] text-slate-400">Actor: <span class="text-indigo-300 font-mono">${l.actor}</span> • Target: <span class="text-slate-300">${l.object}</span></div>
                  </div>
                  <span class="text-[10px] text-slate-500 font-mono whitespace-nowrap">${l.timestamp}</span>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

      </div>
    `;
  }

  // --- TAB 2: EVENT CONTROL ROOM ---
  renderControlRoom() {
    const selectedEvent = store.events.find(e => e.id === this.selectedEventId) || store.events[0];
    const session = selectedEvent.currentSession;

    return `
      <div class="space-y-6">
        <!-- Event Switcher Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-950 border border-white/10">
          <div>
            <span class="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono">Control Room</span>
            <h2 class="text-xl font-black text-white">${selectedEvent.title}</h2>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <select id="control-room-event-select" class="bg-slate-900 border border-white/15 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500">
              ${store.events.map(e => `
                <option value="${e.id}" ${e.id === selectedEvent.id ? 'selected' : ''}>${e.title}</option>
              `).join('')}
            </select>
            <button id="btn-control-share-whatsapp" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-xs flex items-center gap-1.5 btn-press shadow-md">
              <span>💬</span> Share on WhatsApp
            </button>
            <button id="btn-control-open-promotion" class="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 btn-press shadow-md">
              <span>📣</span> Promotion Center
            </button>
          </div>
        </div>

        <!-- Room Live Telemetry -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="glass-card p-5 rounded-2xl space-y-1">
            <span class="text-[10px] uppercase font-bold text-slate-400">Checked In</span>
            <div class="text-2xl font-black text-emerald-400">118 / 150</div>
            <span class="text-[10px] text-slate-400">78.6% Attendance</span>
          </div>
          <div class="glass-card p-5 rounded-2xl space-y-1">
            <span class="text-[10px] uppercase font-bold text-slate-400">Active Milestone</span>
            <div class="text-sm font-black text-amber-300 truncate">Lab 2: TensorRT</div>
            <span class="text-[10px] text-slate-400">42 mins remaining</span>
          </div>
          <div class="glass-card p-5 rounded-2xl space-y-1">
            <span class="text-[10px] uppercase font-bold text-slate-400">Hardware Kits Out</span>
            <div class="text-2xl font-black text-cyan-400">18 / 20</div>
            <span class="text-[10px] text-slate-400">Jetson Nodes Active</span>
          </div>
          <div class="glass-card p-5 rounded-2xl space-y-1">
            <span class="text-[10px] uppercase font-bold text-slate-400">Certificates Ready</span>
            <div class="text-2xl font-black text-purple-400">87 Eligible</div>
            <span class="text-[10px] text-purple-300">Capstone pending</span>
          </div>
        </div>

        <!-- Schedule & Milestone Broadcaster -->
        <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 class="text-base font-bold text-white">Live Session Schedule & Status Controls</h3>
          <div class="space-y-3">
            ${selectedEvent.schedule.map((s, idx) => `
              <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span class="text-[10px] font-mono text-cyan-400 font-bold">${s.time}</span>
                  <div class="font-bold text-white text-sm">${s.title}</div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    s.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300' :
                    s.status === 'In Progress' ? 'bg-amber-500/20 text-amber-300 animate-pulse' :
                    'bg-white/5 text-slate-400'
                  }">
                    ${s.status}
                  </span>
                  <button data-session-idx="${idx}" class="btn-advance-session px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px]">
                    Update Status
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // --- TAB 3: PARTICIPANTS MANAGEMENT ---
  renderParticipantsTab() {
    const regs = store.registrations.filter(r => {
      if (this.participantStatusFilter !== 'All') {
        if (this.participantStatusFilter === 'Attended' && !r.attended) return false;
        if (this.participantStatusFilter === 'Unattended' && r.attended) return false;
      }
      if (this.participantFilter) {
        const q = this.participantFilter.toLowerCase();
        return (r.studentName || '').toLowerCase().includes(q) ||
               (r.rollNo || '').toLowerCase().includes(q) ||
               (r.ticketId || '').toLowerCase().includes(q);
      }
      return true;
    });

    return `
      <div class="glass-panel rounded-3xl border border-white/10 p-6 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-lg font-black text-white">Authorized Event Participants</h3>
            <p class="text-xs text-slate-400">Click any student row to view full operational details, responses, and credentials.</p>
          </div>
          <button id="btn-export-csv" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold btn-press flex items-center gap-1.5">
            <span>📥</span> Export CSV Roster
          </button>
        </div>

        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-3 pt-2">
          <input 
            type="text" 
            id="roster-search-input" 
            placeholder="Search by student name, roll number, or ticket pass ID..." 
            value="${this.participantFilter}"
            class="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500" 
          />
          <select id="roster-status-filter" class="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500">
            <option value="All">All Attendance</option>
            <option value="Attended">Checked In (Attended)</option>
            <option value="Unattended">Pending Door Scan</option>
          </select>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th class="py-3 px-4">Student</th>
                <th class="py-3 px-4">Ticket ID</th>
                <th class="py-3 px-4">Bench & Team</th>
                <th class="py-3 px-4">Preparation</th>
                <th class="py-3 px-4">Workshop</th>
                <th class="py-3 px-4">Attendance</th>
                <th class="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 text-slate-300">
              ${regs.map(r => `
                <tr class="hover:bg-white/[0.04] transition-colors cursor-pointer row-student-detail" data-tkt="${r.ticketId}">
                  <td class="py-3.5 px-4">
                    <div class="font-bold text-white hover:text-amber-300 transition-colors">${r.studentName}</div>
                    <div class="text-[11px] text-slate-400 font-mono">${r.rollNo} • ${r.branch || 'CSE'}</div>
                  </td>
                  <td class="py-3.5 px-4 font-mono font-bold text-indigo-400">${r.ticketId}</td>
                  <td class="py-3.5 px-4">
                    <div class="font-semibold text-slate-200">${r.bench || 'Bench B17'}</div>
                    <div class="text-[10px] text-slate-400">${r.team || 'Unassigned'}</div>
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="font-mono text-emerald-400 font-bold">${r.prepScore || 87}%</span>
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="w-20 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div class="bg-cyan-400 h-full rounded-full" style="width: ${r.workshopProgress || 72}%"></div>
                    </div>
                    <span class="text-[10px] text-slate-400 font-mono">${r.workshopProgress || 72}%</span>
                  </td>
                  <td class="py-3.5 px-4">
                    ${r.attended ? `
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ✓ Attended
                      </span>
                    ` : `
                      <button data-quick-checkin="${r.ticketId}" class="btn-table-checkin px-2.5 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                        Check In
                      </button>
                    `}
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <span class="text-xs text-indigo-400 font-semibold hover:underline">Inspect Profile →</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- TAB 4: ATTENDANCE SCANNER DESK ---
  renderAttendanceTab() {
    return `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-6 glass-panel p-6 rounded-3xl border border-white/10 space-y-4 text-center">
          <div class="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-2xl mx-auto">
            📷
          </div>
          <div>
            <h3 class="text-lg font-black text-white">Integrated QR Attendance Desk</h3>
            <p class="text-xs text-slate-400">Scan student digital QR passes using camera or simulate barcode test scans.</p>
          </div>

          <div class="pt-2">
            <button id="btn-launch-full-scanner" class="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/30 transition-all btn-press">
              Launch Fullscreen Camera Scanner
            </button>
          </div>

          <!-- Quick Test Check-in Buttons -->
          <div class="pt-4 border-t border-white/10 space-y-2 text-left">
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Rapid Barcode Simulator</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              ${store.registrations.map(r => `
                <button data-quick-scan="${r.ticketId}" class="btn-quick-scan-test p-2.5 rounded-xl bg-slate-950/60 hover:bg-cyan-950/40 border border-white/10 hover:border-cyan-500/40 text-left transition-all flex items-center justify-between">
                  <div class="truncate">
                    <div class="font-bold text-white truncate">${r.studentName}</div>
                    <div class="text-[10px] text-slate-400 font-mono">${r.ticketId}</div>
                  </div>
                  <span class="text-[10px] px-2 py-0.5 rounded ${r.attended ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-cyan-300'} font-bold">
                    ${r.attended ? 'Checked In' : 'Scan'}
                  </span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Attendance Feed -->
        <div class="lg:col-span-6 glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 class="text-base font-bold text-white">Live Door Check-in Verification Stream</h3>
          <div class="space-y-2 text-xs">
            ${store.registrations.filter(r => r.attended).map(r => `
              <div class="p-3.5 rounded-2xl bg-slate-950/60 border border-emerald-500/20 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold">✓</span>
                  <div>
                    <div class="font-bold text-white">${r.studentName} (${r.rollNo})</div>
                    <div class="text-[10px] text-slate-400 font-mono">Verified at ${r.attendedAt ? new Date(r.attendedAt).toLocaleTimeString() : '10:02 AM'} • ${r.bench || 'Bench B17'}</div>
                  </div>
                </div>
                <span class="text-[10px] font-mono text-cyan-400 font-bold">${r.ticketId}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // --- TAB 5: TEAMS & RADAR ---
  renderTeamsTab() {
    return `
      <div class="space-y-6">
        <div class="p-5 rounded-3xl bg-indigo-950/50 border border-indigo-500/30 flex items-center justify-between gap-4">
          <div class="space-y-1">
            <h3 class="text-base font-bold text-white">Host Team Balancing Radar</h3>
            <p class="text-xs text-slate-300">AI monitors team skill deficits and suggests inter-disciplinary matches.</p>
          </div>
          <button id="btn-balance-teams" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs btn-press">
            Run AI Balance Suggestion
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${store.teams.map(t => `
            <div class="glass-card p-5 rounded-3xl border border-white/10 space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-base font-black text-white">${t.name}</h4>
                <span class="text-[10px] font-mono text-cyan-400">${t.bench}</span>
              </div>
              <p class="text-xs text-slate-300">"${t.projectIdea}"</p>
              
              <div class="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1 text-xs">
                <span class="text-[10px] font-bold text-slate-400 uppercase">Roster (${t.members.length} members)</span>
                <div class="text-white font-medium">${t.members.map(m => m.name).join(', ')}</div>
              </div>

              ${t.missingSkills && t.missingSkills.length > 0 ? `
                <div class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 font-semibold flex items-center gap-2">
                  <span>⚠️</span> Missing: ${t.missingSkills.join(', ')}
                </div>
              ` : `
                <div class="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 font-semibold">
                  ✓ Well-balanced engineering squad
                </div>
              `}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --- TAB 6: SUPPORT & AI CLUSTERING ---
  renderSupportTab() {
    return `
      <div class="space-y-6">
        <!-- AI Cluster Alert Banner -->
        <div class="p-5 rounded-3xl bg-rose-950/50 border border-rose-500/40 space-y-2">
          <div class="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
            AI Issue Cluster Detected
          </div>
          <p class="text-sm font-bold text-white">
            14 students across Bench B10 to B20 reported CH340 serial driver failure on Windows 11.
          </p>
          <div class="pt-2 flex items-center gap-2">
            <button id="btn-broadcast-cluster-fix" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs btn-press">
              Broadcast Automated Fix to Lab Benches
            </button>
          </div>
        </div>

        <!-- Ticket List -->
        <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 class="text-base font-bold text-white">Live Bench Troubleshooting Queue</h3>
          <div class="space-y-3">
            ${store.supportTickets.map(t => `
              <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      t.priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-white/5 text-slate-300'
                    }">${t.priority}</span>
                    <span class="font-bold text-cyan-400 font-mono">${t.bench}</span>
                    <span class="text-slate-400">• ${t.student}</span>
                  </div>
                  <p class="text-white font-medium">${t.issue}</p>
                </div>
                <div class="flex items-center gap-2">
                  ${t.status === 'Resolved' ? `
                    <span class="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold">Resolved ✓</span>
                  ` : `
                    <button data-resolve-tkt="${t.id}" class="btn-resolve-ticket px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs btn-press">
                      Mark Resolved
                    </button>
                  `}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // --- TAB 7: HARDWARE INVENTORY ---
  renderHardwareTab() {
    return `
      <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-white">Laboratory Hardware Inventory</h3>
            <p class="text-xs text-slate-400">Track physical ESP32 boards, Jetson Orin Nano nodes, and camera peripherals</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          ${store.hardware.map(hw => `
            <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2 text-xs">
              <div class="flex items-center justify-between">
                <span class="font-mono font-bold text-indigo-400">${hw.id}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold ${hw.status === 'In Use' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}">
                  ${hw.status}
                </span>
              </div>
              <div class="font-bold text-white">${hw.name}</div>
              <div class="text-[11px] text-slate-400">
                Location: <span class="text-slate-200 font-semibold">${hw.bench}</span> • <span class="text-cyan-300">${hw.assignedTeam}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // --- TAB 8: ANNOUNCEMENTS ---
  renderAnnouncementsTab() {
    return `
      <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-5">
        <div>
          <h3 class="text-base font-bold text-white">Broadcast Announcement Center</h3>
          <p class="text-xs text-slate-400">Dispatch push notices to student notification feeds and Live Event tickers</p>
        </div>

        <form id="form-host-broadcast" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Announcement Headline</label>
            <input id="ann-input-title" required placeholder="e.g. Schedule Update: Capstone Evaluation Starts at 3:30 PM" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label class="block font-semibold text-slate-300 mb-1">Announcement Body & Instructions</label>
            <textarea id="ann-input-body" required rows="3" placeholder="Please prepare your Git repo link and live demo bench setup..." class="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"></textarea>
          </div>
          <button type="submit" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold transition-all btn-press">
            Broadcast to All Participants 📢
          </button>
        </form>
      </div>
    `;
  }

  // --- TAB 9: CERTIFICATES ENGINE ---
  renderCertificatesTab(eligibleCerts) {
    return `
      <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-base font-bold text-white">Automated Certificate Issuance Engine</h3>
            <p class="text-xs text-slate-400">Verifies attendance (>= 75%), lab completion, and signs credentials with cryptographic hashes</p>
          </div>
          <button id="btn-batch-issue-certs" class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all btn-press">
            Batch Sign All Eligible Certificates (${eligibleCerts}) 📜
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
            <div class="text-2xl font-black text-emerald-400">${eligibleCerts}</div>
            <span class="text-xs text-slate-400">Eligible Attendees</span>
          </div>
          <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
            <div class="text-2xl font-black text-purple-400">${store.certificates.length}</div>
            <span class="text-xs text-slate-400">Issued & Sealed</span>
          </div>
          <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
            <div class="text-2xl font-black text-indigo-400">100%</div>
            <span class="text-xs text-slate-400">Cryptographically Verifiable</span>
          </div>
        </div>
      </div>
    `;
  }

  // --- TAB 10: HOST AI COPILOT ---
  renderCopilotTab() {
    return `
      <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🤖</span>
          <div>
            <h3 class="text-base font-bold text-white">Host AI Operations Copilot</h3>
            <p class="text-xs text-slate-400">Natural language event intelligence with direct state inspection</p>
          </div>
        </div>

        <div class="space-y-3 font-mono text-xs max-h-72 overflow-y-auto p-4 rounded-2xl bg-slate-950/80 border border-white/5">
          ${this.copilotHistory.map(item => `
            <div class="space-y-1">
              <div class="text-amber-300 font-bold">Host: "${item.q}"</div>
              <div class="text-slate-200 pl-3 border-l-2 border-indigo-500">${item.a}</div>
            </div>
          `).join('')}
        </div>

        <form id="form-copilot-query" class="flex gap-2 text-xs">
          <input id="copilot-input-query" placeholder="Ask AI: e.g. Who hasn't completed setup? Summarize attendance." class="flex-1 bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500" />
          <button type="submit" class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold btn-press">
            Query
          </button>
        </form>
      </div>
    `;
  }

  // --- TAB 11: AI POST-EVENT REPORT ---
  renderReportTab() {
    const reportText = this.generatedReport || `
# KIIT IEEE TECHNICAL EVENT OPERATIONAL REPORT
**Event:** AI & Edge Computer Vision Masterclass
**Date:** October 10 - 11, 2026 | **Venue:** Campus 15, Tech Lab 4
**Host:** Dr. Priyadarshi Sen (Lead AI Scientist & IEEE Senior Member)

---

### 1. Executive Summary & KPIs
- **Total Registrations:** 150 (Capacity 100% Filled)
- **Verified Door Attendance:** 118 students (78.6% Conversion)
- **Active Hardware Kits Deployed:** 18 Jetson Orin Nano nodes & 18 Sony IMX219 camera modules
- **Lab 1 (YOLO INT8 Quantization) Completion Rate:** 92.4% (109 students)
- **Lab 2 (TensorRT Deployment) Completion Rate:** 81.3% (96 students)
- **Challenge Submissions Evaluated:** 24 teams submitted lane tracking pipelines
- **Certificates Earned & Issued:** 87 verified cryptographic credentials

### 2. Operational Issues & Resolution
- **Serial Driver Anomaly:** 14 students on Windows 11 experienced CH340 COM port unbinding. Resolved within 12 minutes via automated PowerShell diagnostic broadcast.
- **CUDA OOM on Batch Sizes > 16:** Handled via dataloader batch-reduction guidance in Workshop Copilot.

### 3. Recommendations for Future Editions
1. Pre-flash Jetson nodes with containerized Docker environments to cut first-hour setup latency.
2. Expand arena testing space for real-time mobile vehicle tracking benchmarks.
    `.trim();

    return `
      <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h3 class="text-xl font-black text-white">Post-Event AI Executive Report</h3>
            <p class="text-xs text-slate-400">Complete multi-section operational analysis ready for PDF export & institutional filing</p>
          </div>
          <button id="btn-download-report" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors btn-press flex items-center gap-1.5">
            <span>📥</span> Download Markdown Report
          </button>
        </div>

        <textarea id="report-text-area" rows="18" class="w-full bg-slate-950 font-mono text-xs text-slate-200 border border-white/15 rounded-2xl p-4 leading-relaxed focus:outline-none focus:border-amber-500">${reportText}</textarea>
      </div>
    `;
  }

  // --- CHARTS INITIALIZATION ---
  renderCharts() {
    if (typeof Chart === 'undefined') return;
    if (this.chartInstance1) this.chartInstance1.destroy();
    if (this.chartInstance2) this.chartInstance2.destroy();

    const ctx1 = document.getElementById('chart-registration-trend');
    if (ctx1) {
      this.chartInstance1 = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Registrations',
            data: [42, 65, 88, 120, 175, 230, 294],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: '#38bdf8',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } },
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
          }
        }
      });
    }

    const ctx2 = document.getElementById('chart-category-dist');
    if (ctx2) {
      this.chartInstance2 = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['AI / ML', 'Robotics & IoT', 'Web & Cloud', 'Hackathons', 'Security'],
          datasets: [{
            data: [150, 100, 250, 400, 80],
            backgroundColor: ['#818cf8', '#38bdf8', '#34d399', '#f43f5e', '#fbbf24'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 }, boxWidth: 10 } }
          },
          cutout: '70%'
        }
      });
    }
  }

  // --- EVENT BINDINGS ---
  bindEvents() {
    // Switch Tabs
    this.container.querySelectorAll('.btn-host-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        this.activeHostTab = btn.getAttribute('data-host-tab');
        this.render();
      });
    });

    // Top Action: AI Builder
    const aiBuilderBtn = this.container.querySelector('#btn-org-ai-builder');
    if (aiBuilderBtn) aiBuilderBtn.addEventListener('click', () => store.setView('ai-builder'));

    // Top Action: Quick Scan
    const scanBtn = this.container.querySelector('#btn-org-quick-scan');
    if (scanBtn) scanBtn.addEventListener('click', () => window.appDispatcher?.openQRScanner());

    // Top Action: Generate Report
    const reportBtn = this.container.querySelector('#btn-org-generate-report');
    if (reportBtn) {
      reportBtn.addEventListener('click', () => {
        sound.playSuccess();
        this.activeHostTab = 'report';
        this.render();
      });
    }

    // Control Room: Direct WhatsApp Share
    const ctrlWaBtn = this.container.querySelector('#btn-control-share-whatsapp');
    if (ctrlWaBtn) {
      ctrlWaBtn.addEventListener('click', () => {
        const selectedEvent = store.events.find(e => e.id === this.selectedEventId) || store.events[0];
        sound.playClick();
        const msg = generateWhatsAppMessage(selectedEvent);
        WhatsAppShareService.shareToWhatsApp(msg, selectedEvent);
        toast.show({
          title: 'Opening WhatsApp 💬',
          message: `Ready to broadcast "${selectedEvent.title}" to student chats.`,
          type: 'info'
        });
      });
    }

    // Control Room: Open Promotion Center
    const ctrlPromoBtn = this.container.querySelector('#btn-control-open-promotion');
    if (ctrlPromoBtn) {
      ctrlPromoBtn.addEventListener('click', () => {
        sound.playClick();
        store.setView('ai-builder');
      });
    }

    // Export CSV
    const exportBtn = this.container.querySelector('#btn-export-csv');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        sound.playSuccess();
        const csvContent = "data:text/csv;charset=utf-8," + 
          ["TicketID,StudentName,RollNumber,Event,Status,Attended"].concat(
            store.registrations.map(r => `${r.ticketId},${r.studentName},${r.rollNo},${r.eventName || r.eventId},${r.status},${r.attended ? 'Yes' : 'No'}`)
          ).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `KIIT_IEEE_Roster_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.show({ title: 'Roster Exported', message: 'Participant CSV file downloaded successfully.', type: 'success' });
      });
    }

    // Inspect student detail modal
    this.container.querySelectorAll('.row-student-detail').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.btn-table-checkin')) return;
        const tkt = row.getAttribute('data-tkt');
        sound.playClick();
        window.appDispatcher?.openStudentDetail?.(tkt);
      });
    });

    // Table quick check-in
    this.container.querySelectorAll('.btn-table-checkin').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tkt = btn.getAttribute('data-quick-checkin');
        const res = store.verifyAndCheckIn(tkt);
        sound.playCheckin();
        toast.show({ title: 'Attendance Confirmed', message: res.message, type: 'success' });
        this.render();
      });
    });

    // Barcode quick test scan
    this.container.querySelectorAll('.btn-quick-scan-test').forEach(btn => {
      btn.addEventListener('click', () => {
        const tkt = btn.getAttribute('data-quick-scan');
        const res = store.verifyAndCheckIn(tkt);
        sound.playCheckin();
        toast.show({ title: 'Scanned at Door', message: res.message, type: 'success' });
        this.render();
      });
    });

    // Launch full camera scanner
    const launchScan = this.container.querySelector('#btn-launch-full-scanner');
    if (launchScan) launchScan.addEventListener('click', () => window.appDispatcher?.openQRScanner());

    // Broadcast Announcement Form
    const annForm = this.container.querySelector('#form-host-broadcast');
    if (annForm) {
      annForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sound.playSuccess();
        const title = this.container.querySelector('#ann-input-title').value;
        const body = this.container.querySelector('#ann-input-body').value;
        store.broadcastAnnouncement(title, body);
        toast.show({ title: 'Announcement Broadcast! 📢', message: 'Notice dispatched to all attendees.', type: 'success' });
        annForm.reset();
      });
    }

    // Batch Issue Certificates
    const batchCertBtn = this.container.querySelector('#btn-batch-issue-certs');
    if (batchCertBtn) {
      batchCertBtn.addEventListener('click', () => {
        sound.playSuccess();
        const count = store.batchGenerateCertificates('All');
        toast.show({ title: 'Certificates Signed! 📜', message: `Generated and sealed ${count} verified credentials.`, type: 'success' });
        this.render();
      });
    }

    // Resolve Support Ticket
    this.container.querySelectorAll('.btn-resolve-ticket').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-resolve-tkt');
        sound.playSuccess();
        store.resolveSupportTicket(id, 'Resolved by Host Command');
        toast.show({ title: 'Ticket Resolved ✓', message: `Ticket ${id} cleared.`, type: 'success' });
        this.render();
      });
    });

    // Broadcast Cluster Fix
    const clusterFixBtn = this.container.querySelector('#btn-broadcast-cluster-fix');
    if (clusterFixBtn) {
      clusterFixBtn.addEventListener('click', () => {
        sound.playSuccess();
        store.broadcastAnnouncement('CH340 Serial Driver Solution', 'Please execute: Get-PnpDevice -Class "Ports" and reconnect USB while pressing BOOT button.');
        toast.show({ title: 'Fix Broadcasted!', message: 'Automated script pushed to affected benches.', type: 'success' });
      });
    }

    // Copilot Form Query
    const copilotForm = this.container.querySelector('#form-copilot-query');
    if (copilotForm) {
      copilotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = this.container.querySelector('#copilot-input-query');
        if (input && input.value.trim()) {
          const q = input.value.trim();
          sound.playClick();
          let reply = `Analyzed "${q}". All active systems operational. Attendance conversion is 78.6% across benches.`;
          if (q.toLowerCase().includes('who') || q.toLowerCase().includes('setup')) {
            reply = "Kabir Joshi (22051980) at Bench B17 has setup incomplete (40%). Dispatch volunteer to assist.";
          } else if (q.toLowerCase().includes('report')) {
            reply = "Executive report generated and ready in the AI Post-Event Report tab.";
          }
          this.copilotHistory.push({ q, a: reply });
          sound.playSuccess();
          this.render();
        }
      });
    }

    // Download Markdown Report
    const downloadReportBtn = this.container.querySelector('#btn-download-report');
    if (downloadReportBtn) {
      downloadReportBtn.addEventListener('click', () => {
        sound.playSuccess();
        const text = this.container.querySelector('#report-text-area').value;
        const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `KIIT_IEEE_Event_Report_${Date.now()}.md`;
        link.click();
        URL.revokeObjectURL(url);
        toast.show({ title: 'Report Downloaded', message: 'Markdown executive report saved.', type: 'success' });
      });
    }
  }
}

/**
 * KIIT IEEE Platform - Institutional Vision & Founder Section
 * "About KIIT IEEE / Institutional Journey"
 * Verified official facts, inspiring storytelling, Dr. Achyuta Samanta legacy,
 * interactive milestones timeline & administrator CMS drawer.
 */

import { store } from '../state.js';
import { sound } from '../services/audio-service.js';
import { toast } from '../components/toast.js';

export class AboutView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.cmsModalOpen = false;
  }

  render() {
    if (!this.container) return;
    const inst = store.institutionalData;
    const isAdmin = store.user.role === 'admin' || store.user.role === 'organizer';

    this.container.innerHTML = `
      <div class="relative overflow-hidden pt-24 pb-20">
        
        <!-- Ambient Glow -->
        <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none"></div>

        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
          
          <!-- Section 1: Hero Header -->
          <div class="text-center space-y-4 max-w-3xl mx-auto">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide">
              <span>🏛️</span> Institutional Heritage & Vision
            </div>
            <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Built on Compassion. <br />
              <span class="text-gradient-hero">Engineered for What’s Next.</span>
            </h1>
            <p class="text-sm sm:text-base text-slate-300 leading-relaxed">
              From an initial seed of ₹5,000 in 1992 to an Institution of Eminence with 30,000+ students, 
              KIIT and its IEEE Student Branch empower young engineers to solve humanitarian and technological challenges worldwide.
            </p>

            ${isAdmin ? `
              <div class="pt-2">
                <button id="btn-open-cms" class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all btn-press flex items-center gap-2 mx-auto">
                  <span>⚙️</span> Edit Institutional Vision (Admin CMS)
                </button>
              </div>
            ` : ''}
          </div>

          <!-- Section 2: Founder Spotlight -->
          <div class="relative rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-purple-950/60 border border-white/15 p-6 sm:p-12 overflow-hidden shadow-2xl">
            <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[90px] pointer-events-none"></div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <!-- Founder Portrait & Bio Badge -->
              <div class="lg:col-span-4 flex flex-col items-center text-center space-y-3">
                <div class="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl p-1 bg-gradient-to-tr from-amber-400 via-indigo-500 to-cyan-400 shadow-2xl shadow-indigo-500/30">
                  <img src="${inst.founder.avatar && !inst.founder.avatar.includes('photo-1544717305') ? inst.founder.avatar : 'assets/dr-achyuta-samanta.png'}" alt="${inst.founder.name}" class="w-full h-full object-cover object-top rounded-[22px] bg-white" />
                </div>
                <div>
                  <h3 class="text-xl font-black text-white">${inst.founder.name}</h3>
                  <p class="text-xs text-indigo-300 font-semibold mt-0.5">${inst.founder.title}</p>
                </div>
                <span class="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
                  Philosophy: "Art of Giving"
                </span>
              </div>

              <!-- Quote & Vision Narrative -->
              <div class="lg:col-span-8 space-y-4">
                <div class="text-amber-400 text-3xl font-serif leading-none">“</div>
                <blockquote class="text-base sm:text-lg text-slate-100 font-medium italic leading-relaxed -mt-3">
                  ${inst.founder.quote}
                </blockquote>
                
                <p class="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2">
                  ${inst.founder.bio}
                </p>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                  <div class="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
                    <div class="text-xl font-black text-white">${inst.stats.students}</div>
                    <div class="text-[10px] text-slate-400">Total Students</div>
                  </div>
                  <div class="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
                    <div class="text-xl font-black text-cyan-400">${inst.stats.campuses}</div>
                    <div class="text-[10px] text-slate-400">Smart Campuses</div>
                  </div>
                  <div class="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
                    <div class="text-xl font-black text-emerald-400">${inst.stats.ranking}</div>
                    <div class="text-[10px] text-slate-400">NIRF Tier-1</div>
                  </div>
                  <div class="p-3 rounded-2xl bg-black/40 border border-white/10 text-center">
                    <div class="text-xl font-black text-purple-400">${inst.stats.patents}</div>
                    <div class="text-[10px] text-slate-400">Granted Patents</div>
                  </div>
                </div>

              </div>

            </div>
          </div>

          <!-- Section 3: KIIT IEEE Student Branch Pillar -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="glass-card p-6 sm:p-8 rounded-3xl border border-white/15 space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-xl text-indigo-400">
                ⚡
              </div>
              <h3 class="text-xl font-black text-white">The IEEE Student Branch Mission</h3>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                ${inst.ieeeBranch.mission}
              </p>
              <div class="pt-2 text-[11px] text-slate-400 font-mono">
                Branch Code: <span class="text-indigo-400 font-bold">${inst.ieeeBranch.code}</span> • Chartered in ${inst.ieeeBranch.charterYear}
              </div>
            </div>

            <div class="glass-card p-6 sm:p-8 rounded-3xl border border-white/15 space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xl text-cyan-400">
                🎯
              </div>
              <h3 class="text-xl font-black text-white">Why This Operating System Exists</h3>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Generic event portals only register names. The KIIT IEEE Platform is an intelligent operating system managing the entire journey:
                pre-workshop environment diagnostics, hands-on lab milestones, real-time bench volunteer dispatch, live challenges, and tamper-proof digital credentials.
              </p>
              <div class="pt-2 text-[11px] text-emerald-400 font-semibold">
                ✓ 100% Student-Centric • Zero Dead Clicks • Real Real-Time Telemetry
              </div>
            </div>
          </div>

          <!-- Section 4: Interactive Historical Timeline -->
          <div class="space-y-6">
            <div class="text-center space-y-1">
              <h3 class="text-2xl sm:text-3xl font-black text-white">Our Institutional Journey</h3>
              <p class="text-xs text-slate-400">Milestones of continuous technical innovation and societal upliftment</p>
            </div>

            <div class="relative border-l-2 border-indigo-500/30 ml-4 sm:ml-8 space-y-8 py-4">
              ${inst.milestones.map((m, idx) => `
                <div class="relative pl-6 sm:pl-8 group">
                  <span class="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-indigo-400 group-hover:bg-cyan-400 group-hover:scale-125 transition-all"></span>
                  <div class="glass-card p-5 rounded-2xl border border-white/10 hover:border-indigo-500/40 space-y-1">
                    <span class="text-xs font-mono font-bold text-cyan-400">${m.year}</span>
                    <h4 class="text-base font-extrabold text-white">${m.title}</h4>
                    <p class="text-xs text-slate-300 leading-relaxed">${m.desc}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Section 5: Verification & Governance Commitment -->
          <div class="p-6 rounded-3xl bg-slate-950/70 border border-white/10 text-center space-y-2">
            <div class="text-xs font-bold text-slate-400 uppercase tracking-widest">Institutional Integrity Guarantee</div>
            <p class="text-xs text-slate-400 max-w-2xl mx-auto">
              All dates, milestones, institutional accreditations, and founder citations presented on this platform are drawn exclusively from official university records and authorized IEEE Section reports.
            </p>
            <p class="text-[11px] text-indigo-400 font-mono">Branch Counselor: ${inst.ieeeBranch.counselor}</p>
          </div>

        </div>

        <!-- CMS Editor Modal (for Admin) -->
        ${this.cmsModalOpen ? this.renderCMSModal(inst) : ''}

      </div>
    `;

    this.bindEvents();
  }

  renderCMSModal(inst) {
    return `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
        <div class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-purple-500/40 p-6 sm:p-8 shadow-2xl space-y-5">
          
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 class="text-lg font-black text-white">Administrator Institutional CMS</h3>
              <p class="text-xs text-purple-300">Authorized content manager for official KIIT IEEE vision copy</p>
            </div>
            <button id="cms-close-btn" class="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">✕</button>
          </div>

          <form id="cms-form" class="space-y-4 text-xs">
            <div>
              <label class="block font-semibold text-slate-300 mb-1">Founder Official Quote</label>
              <textarea id="cms-quote" rows="3" class="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 font-sans">${inst.founder.quote}</textarea>
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">Founder Biography Summary</label>
              <textarea id="cms-bio" rows="3" class="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 font-sans">${inst.founder.bio}</textarea>
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1">IEEE Branch Mission</label>
              <textarea id="cms-mission" rows="3" class="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 font-sans">${inst.ieeeBranch.mission}</textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-300 mb-1">Total Students</label>
                <input id="cms-stat-students" value="${inst.stats.students}" class="w-full bg-slate-950 border border-white/15 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label class="block font-semibold text-slate-300 mb-1">Patents Count</label>
                <input id="cms-stat-patents" value="${inst.stats.patents}" class="w-full bg-slate-950 border border-white/15 rounded-xl p-2.5 text-white" />
              </div>
            </div>

            <div class="pt-3 flex items-center justify-end gap-2 border-t border-white/10">
              <button type="button" id="cms-cancel-btn" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300">Cancel</button>
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors btn-press">
                Save Official Changes
              </button>
            </div>
          </form>

        </div>
      </div>
    `;
  }

  bindEvents() {
    const cmsBtn = this.container.querySelector('#btn-open-cms');
    if (cmsBtn) {
      cmsBtn.addEventListener('click', () => {
        sound.playClick();
        this.cmsModalOpen = true;
        this.render();
      });
    }

    const closeBtn = this.container.querySelector('#cms-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.cmsModalOpen = false;
        this.render();
      });
    }

    const cancelBtn = this.container.querySelector('#cms-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.cmsModalOpen = false;
        this.render();
      });
    }

    if (this.cmsModalOpen) {
      const modalBackdrop = this.container.querySelector('.fixed.inset-0');
      if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
          if (e.target === modalBackdrop) {
            this.cmsModalOpen = false;
            this.render();
          }
        });
      }
      const escapeHandler = (e) => {
        if (e.key === 'Escape' && this.cmsModalOpen) {
          this.cmsModalOpen = false;
          window.removeEventListener('keydown', escapeHandler);
          this.render();
        }
      };
      window.addEventListener('keydown', escapeHandler);
    }

    const form = this.container.querySelector('#cms-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        sound.playSuccess();
        const quote = this.container.querySelector('#cms-quote').value;
        const bio = this.container.querySelector('#cms-bio').value;
        const mission = this.container.querySelector('#cms-mission').value;
        const students = this.container.querySelector('#cms-stat-students').value;
        const patents = this.container.querySelector('#cms-stat-patents').value;

        const updated = {
          founder: {
            ...store.institutionalData.founder,
            quote,
            bio
          },
          ieeeBranch: {
            ...store.institutionalData.ieeeBranch,
            mission
          },
          stats: {
            ...store.institutionalData.stats,
            students,
            patents
          }
        };

        store.updateInstitutionalData(updated);
        toast.show({ title: 'Institutional Copy Updated', message: 'Official vision text saved to state.', type: 'success' });
        this.cmsModalOpen = false;
        this.render();
      });
    }
  }
}

/**
 * KIIT IEEE Platform - Comprehensive Event Detail View Modal
 * Full-fidelity event syllabus, speaker profile, hardware specs, timeline & sticky CTA.
 */

import { store } from '../state.js';
import { sound } from '../services/audio-service.js';
import { WhatsAppShareService, WHATSAPP_TEMPLATES, generateWhatsAppMessage } from '../services/messaging-service.js';

export class EventDetailModal {
  constructor() {
    this.modal = null;
    this.event = null;
    this.escHandler = null;
    this.init();
  }

  init() {
    let el = document.getElementById('event-detail-modal-root');
    if (!el) {
      el = document.createElement('div');
      el.id = 'event-detail-modal-root';
      document.body.appendChild(el);
    }
    el.className = 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 modal-backdrop hidden overflow-y-auto';
    this.modal = el;

    // Dismiss on outside backdrop click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        sound.playClick();
        this.close();
      }
    });
  }

  async open(eventId) {
    if (!eventId) return;
    this.event = store.events.find(e => 
      String(e.id).toLowerCase() === String(eventId).toLowerCase() || 
      (e.slug && String(e.slug).toLowerCase() === String(eventId).toLowerCase())
    );

    if (!this.event) {
      try {
        const { EventService } = await import('../services/event-service.js');
        const res = await EventService.getEvent(eventId);
        if (res && res.success && res.event) {
          this.event = res.event;
          store.addEvent(res.event);
        }
      } catch (err) {}
    }

    if (!this.event) return;

    this.render();
    this.modal.classList.remove('hidden');
    sound.playClick();

    if (this.escHandler) window.removeEventListener('keydown', this.escHandler);
    this.escHandler = (e) => {
      if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
        this.close();
      }
    };
    window.addEventListener('keydown', this.escHandler);
  }

  close() {
    this.modal.classList.add('hidden');
    if (this.escHandler) {
      window.removeEventListener('keydown', this.escHandler);
      this.escHandler = null;
    }
  }

  render() {
    const evt = this.event;
    const isRegistered = store.registrations.some(r => r.eventId === evt.id);
    const seatsPct = Math.round(((evt.seatsFilled || 0) / evt.seatsTotal) * 100);

    this.modal.innerHTML = `
      <div class="relative w-full max-w-4xl bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl my-6 max-h-[90vh] flex flex-col">
        
        <!-- Header Banner with Full-bleed Gradient -->
        <div class="relative p-6 sm:p-8 bg-gradient-to-r ${evt.bannerGradient} shrink-0">
          <button id="btn-detail-close" class="absolute top-5 right-5 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors z-20">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <div class="relative z-10 max-w-2xl">
            <div class="flex flex-wrap items-center gap-2 mb-3">
              <span class="badge-tag ${evt.badgeColor || 'badge-ai'} uppercase">${evt.category}</span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black/40 text-white border border-white/20">${evt.format} Mode</span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black/40 text-white border border-white/20">${evt.difficulty}</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-white leading-tight">${evt.title}</h2>
            <p class="text-sm text-white/90 mt-2 font-medium leading-relaxed">${evt.tagline}</p>
          </div>
        </div>

        <!-- Scrollable Modal Content Grid -->
        <div class="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 no-scrollbar">
          
          <!-- Key Meta Bar -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs">
            <div>
              <span class="text-slate-400 block text-[11px]">DATE & DURATION</span>
              <span class="font-bold text-white mt-0.5 block">${evt.date}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">DAILY TIMING</span>
              <span class="font-bold text-white mt-0.5 block">${evt.time}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">LOCATION / LAB</span>
              <span class="font-bold text-cyan-300 mt-0.5 block">${evt.venue}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[11px]">REGISTRATION FEE</span>
              <span class="font-bold text-emerald-400 mt-0.5 block">${evt.priceLabel || 'Free'}</span>
            </div>
          </div>

          <!-- Two Column Content: Left Specs, Right Registration Card -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Left 2 Cols: Details, Speaker, Schedule, Hardware, FAQs -->
            <div class="lg:col-span-2 space-y-7">
              
              <!-- What You Will Build -->
              <div>
                <h4 class="text-base font-bold text-white flex items-center gap-2 mb-3">
                  <span class="text-indigo-400">🔨</span> What You Will Build & Deliver
                </h4>
                <ul class="space-y-2">
                  ${(evt.whatYouWillBuild || []).map(item => `
                    <li class="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                      <span class="text-emerald-400 mt-0.5 font-bold">✓</span>
                      <span>${item}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>

              <!-- Speaker Spotlight -->
              ${evt.speaker ? `
                <div class="p-4 rounded-2xl bg-slate-950/60 border border-white/10 flex items-start gap-4">
                  <img src="${evt.speaker.avatar}" alt="${evt.speaker.name}" class="w-14 h-14 rounded-2xl object-cover border border-indigo-500/30 shrink-0" />
                  <div>
                    <span class="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Instructor Spotlight</span>
                    <h5 class="text-sm font-bold text-white mt-0.5">${evt.speaker.name}</h5>
                    <p class="text-xs text-slate-300 font-medium">${evt.speaker.role} • <span class="text-slate-400">${evt.speaker.org}</span></p>
                    <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">${evt.speaker.bio}</p>
                  </div>
                </div>
              ` : ''}

              <!-- Hour-by-Hour Timeline Schedule -->
              <div>
                <h4 class="text-base font-bold text-white flex items-center gap-2 mb-3">
                  <span class="text-cyan-400">⏱️</span> Detailed Syllabus & Milestones
                </h4>
                <div class="space-y-3 relative pl-4 border-l border-indigo-500/30">
                  ${(evt.schedule || []).map((step, idx) => `
                    <div class="relative pl-3">
                      <div class="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-slate-900"></div>
                      <span class="text-[11px] font-mono font-semibold text-indigo-400">${step.time}</span>
                      <p class="text-xs font-semibold text-slate-200 mt-0.5">${step.title}</p>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Hardware Kit & Lab Infrastructure -->
              ${evt.hardwareKit ? `
                <div class="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
                  <h5 class="text-xs font-bold text-cyan-300 flex items-center gap-1.5 mb-1.5">
                    <span>🔌</span> Lab Hardware & Infrastructure
                  </h5>
                  <p class="text-xs text-slate-300 leading-relaxed">${evt.hardwareKit}</p>
                </div>
              ` : ''}

              <!-- Prerequisites -->
              <div>
                <h4 class="text-sm font-bold text-white mb-2">Prerequisites & Knowledge Level</h4>
                <div class="flex flex-wrap gap-2">
                  ${(evt.prerequisites || []).map(p => `
                    <span class="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                      ${p}
                    </span>
                  `).join('')}
                </div>
              </div>

              <!-- Frequently Asked Questions -->
              ${evt.faqs && evt.faqs.length > 0 ? `
                <div>
                  <h4 class="text-sm font-bold text-white mb-3">Frequently Asked Questions</h4>
                  <div class="space-y-2">
                    ${evt.faqs.map(faq => `
                      <div class="p-3.5 rounded-xl bg-slate-950/50 border border-white/5">
                        <div class="text-xs font-semibold text-white">${faq.q}</div>
                        <div class="text-[11px] text-slate-400 mt-1 leading-relaxed">${faq.a}</div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

            </div>

            <!-- Right 1 Col: Sticky Registration & Seat Card -->
            <div class="space-y-4">
              <div class="p-5 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-4">
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-semibold">Seat Availability</span>
                  <div class="flex items-center justify-between mt-1">
                    <span class="text-sm font-bold text-white">${evt.seatsFilled || 0} / ${evt.seatsTotal} Claimed</span>
                    <span class="text-xs font-mono font-bold text-indigo-400">${seatsPct}%</span>
                  </div>
                  <div class="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div class="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full" style="width: ${seatsPct}%"></div>
                  </div>
                  <p class="text-[10px] text-amber-400/90 font-medium mt-1.5">⚡ Only ${evt.seatsTotal - (evt.seatsFilled || 0)} seats remaining!</p>
                </div>

                <div class="pt-2 border-t border-white/10 space-y-2.5">
                  ${isRegistered ? `
                    <button id="btn-view-existing-pass" class="w-full py-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all btn-press flex items-center justify-center gap-2">
                      <span>✓</span> You Are Registered (View Pass)
                    </button>
                  ` : `
                    <button id="btn-detail-register" class="w-full py-3 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 shadow-xl shadow-indigo-500/30 transition-all btn-press flex items-center justify-center gap-2">
                      <span>🎟️</span> Register for Event (Free)
                    </button>
                  `}

                  <button id="btn-detail-view-page" class="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all btn-press flex items-center justify-center gap-1.5">
                    <span>👁️</span> Open Dedicated Event Page
                  </button>

                  <button id="btn-detail-ask-copilot" class="w-full py-2.5 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-500/30 transition-all btn-press flex items-center justify-center gap-1.5">
                    <span>🤖</span> Ask Copilot About This Workshop
                  </button>

                  <button id="btn-detail-share-whatsapp" class="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-md shadow-emerald-500/20 transition-all btn-press flex items-center justify-center gap-1.5">
                    <span>💬</span> Share on WhatsApp
                  </button>

                  <button id="btn-detail-share" class="w-full py-2 rounded-xl text-[11px] font-medium text-slate-400 hover:text-white bg-white/5 transition-colors">
                    Share Event Link
                  </button>
                </div>

                <div class="text-[10px] text-slate-500 text-center space-y-1">
                  <p>Verified IEEE Certificate Included</p>
                  <p>Open to all KIIT Deemed to be University students</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Close
    const closeBtn = this.modal.querySelector('#btn-detail-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        sound.playClick();
        this.close();
      });
    }

    // View Dedicated Event Page
    const pageBtn = this.modal.querySelector('#btn-detail-view-page');
    if (pageBtn) {
      pageBtn.addEventListener('click', () => {
        sound.playClick();
        this.close();
        window.location.hash = `event/${this.event.id}`;
      });
    }

    // Register CTA
    const regBtn = this.modal.querySelector('#btn-detail-register');
    if (regBtn) {
      regBtn.addEventListener('click', () => {
        sound.playClick();
        this.close();
        window.appDispatcher?.openRegistration(this.event.id);
      });
    }

    // View existing pass
    const passBtn = this.modal.querySelector('#btn-view-existing-pass');
    if (passBtn) {
      passBtn.addEventListener('click', () => {
        sound.playClick();
        const reg = store.registrations.find(r => r.eventId === this.event.id);
        if (reg) {
          this.close();
          window.appDispatcher?.openTicketModal(reg.ticketId);
        }
      });
    }

    // Ask copilot
    const copilotBtn = this.modal.querySelector('#btn-detail-ask-copilot');
    if (copilotBtn) {
      copilotBtn.addEventListener('click', () => {
        sound.playClick();
        this.close();
        store.setView('copilot');
      });
    }

    // WhatsApp Share button
    const waShareBtn = this.modal.querySelector('#btn-detail-share-whatsapp');
    if (waShareBtn) {
      waShareBtn.addEventListener('click', () => {
        sound.playClick();
        const msg = generateWhatsAppMessage(this.event);
        WhatsAppShareService.shareToWhatsApp(msg, this.event);
      });
    }

    // Share link
    const shareBtn = this.modal.querySelector('#btn-detail-share');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        sound.playClick();
        const origin = window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'http://localhost:3000';
        navigator.clipboard.writeText(`${origin}/#event/${this.event.id}`);
        shareBtn.textContent = 'Link Copied ✓';
        setTimeout(() => shareBtn.textContent = 'Share Event Link', 2000);
      });
    }
  }
}

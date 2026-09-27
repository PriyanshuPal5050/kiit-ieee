/**
 * KIIT IEEE Platform - Full-Fidelity Dynamic Event Page View
 * Resolves real database event records via GET /api/events/:idOrSlug
 * Displays complete syllabus, speaker profile, venue coordinates, schedule,
 * sticky registration CTA, digital pass access, Add to Calendar (.ics),
 * interactive FAQ accordion, and event resources.
 */

import { store } from '../state.js';
import { EventService } from '../services/event-service.js';
import { PromotionService } from '../services/promotion-service.js';
import { WhatsAppShareService, generateWhatsAppMessage } from '../services/messaging-service.js';
import { sound } from '../services/audio-service.js';
import { toast } from '../components/toast.js';

export class EventPageView {
  constructor(containerId, eventIdOrSlug) {
    this.container = document.getElementById(containerId);
    this.eventIdOrSlug = eventIdOrSlug;
    this.event = null;
    this.isLoading = true;
    this.error = null;
  }

  async render() {
    if (!this.container) return;

    // 1. Loading State Skeleton
    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 space-y-8 animate-pulse">
        <div class="h-4 w-48 bg-white/10 rounded-lg"></div>
        <div class="h-64 bg-slate-900 rounded-3xl border border-white/10"></div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-6">
            <div class="h-40 bg-slate-900 rounded-3xl border border-white/10"></div>
            <div class="h-60 bg-slate-900 rounded-3xl border border-white/10"></div>
          </div>
          <div class="h-96 bg-slate-900 rounded-3xl border border-white/10"></div>
        </div>
      </div>
    `;

    // 2. Load Real Database Event
    try {
      const res = await EventService.getEvent(this.eventIdOrSlug);
      if (res && res.success && res.event) {
        this.event = res.event;
        this.isLoading = false;
        this.error = null;
      } else {
        this.isLoading = false;
        this.error = res.error || 'Event not found';
      }
    } catch (err) {
      console.error('[EventPageView] Failed loading event:', err);
      this.isLoading = false;
      this.error = err.message || 'Error loading event';
    }

    // 3. Render Error / 404 State
    if (this.error || !this.event) {
      this.renderNotFound();
      return;
    }

    // 4. Render Actual Published Event Page
    this.renderEventPage();
  }

  renderNotFound() {
    this.container.innerHTML = `
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 text-center space-y-6 animate-fade-in">
        <div class="w-20 h-20 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-4xl mx-auto shadow-2xl">
          🔍
        </div>
        <div class="space-y-2">
          <span class="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">HTTP 404 • Not Found</span>
          <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight">Event Not Found</h1>
          <p class="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            We couldn't find an active KIIT IEEE event matching "<span class="text-purple-300 font-mono font-bold">${this.escapeHtml(this.eventIdOrSlug || '')}</span>". The event may have been unpublished or the identifier is invalid.
          </p>
        </div>
        <div class="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button id="btn-404-back-discover" class="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold text-xs transition-all btn-press flex items-center gap-2">
            <span>←</span> Back to Events
          </button>
          <button id="btn-404-builder" class="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 font-bold text-xs transition-all btn-press">
            Create Event in Builder
          </button>
        </div>
      </div>
    `;

    this.container.querySelector('#btn-404-back-discover')?.addEventListener('click', () => {
      sound.playClick();
      window.location.hash = 'discover';
    });

    this.container.querySelector('#btn-404-builder')?.addEventListener('click', () => {
      sound.playClick();
      window.location.hash = 'ai-builder';
    });
  }

  renderEventPage() {
    const evt = this.event;
    const userReg = store.registrations.find(r => 
      String(r.eventId).toLowerCase() === String(evt.id).toLowerCase() ||
      (evt.slug && String(r.eventId).toLowerCase() === String(evt.slug).toLowerCase())
    );
    const isRegistered = Boolean(userReg);
    const seatsTotal = parseInt(evt.seatsTotal) || 120;
    const seatsFilled = parseInt(evt.seatsFilled) || 0;
    const seatsPct = Math.min(100, Math.round((seatsFilled / seatsTotal) * 100));

    const speakerName = evt.speaker?.name || (evt.speakers && evt.speakers[0]?.name) || 'Senior IEEE Technical Mentor';
    const speakerRole = evt.speaker?.role || evt.speaker?.designation || (evt.speakers && evt.speakers[0]?.designation) || 'Lead Systems Architect';
    const speakerOrg = evt.speaker?.org || evt.speaker?.organization || (evt.speakers && evt.speakers[0]?.organization) || 'KIIT University';
    const speakerBio = evt.speaker?.bio || (evt.speakers && evt.speakers[0]?.bio) || 'Certified technical mentor specializing in applied engineering, systems design, and laboratory instruction.';
    const speakerAvatar = evt.speaker?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

    const whatBuild = Array.isArray(evt.whatYouWillBuild) ? evt.whatYouWillBuild : [evt.whatWillBuild || 'Production-grade practical engineering capstone project.'];
    const prereqs = Array.isArray(evt.prerequisites) ? evt.prerequisites : [evt.prerequisites || 'Basic programming fundamentals and student curiosity.'];

    const faqs = (evt.faqs && evt.faqs.length > 0) ? evt.faqs : [
      { q: "Is registration free for KIIT students?", a: "Yes, fully funded through the KIIT IEEE Student Branch endowment. All student lab benches and development boards are provided on-site." },
      { q: "Do 1st or 2nd year students need prior experience?", a: "No prior experience required! Dedicated IEEE student mentors and roving volunteers are stationed at every bench." },
      { q: "What should I bring to the workshop?", a: evt.whatToBring || "Laptop with minimum 8GB RAM, charger, and student ID card for entry verification." },
      { q: "Will I receive an official certificate?", a: "Yes, all verified attendees who complete the hands-on lab exercises receive a cryptographically verifiable IEEE certificate with unique verification hash." }
    ];

    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-8 animate-fade-in">
        
        <!-- Breadcrumb & Back Navigation -->
        <div class="flex items-center justify-between text-xs">
          <div class="flex items-center gap-2 text-slate-400">
            <a href="#discover" class="hover:text-purple-400 transition-colors">Events</a>
            <span>/</span>
            <span class="text-purple-300 font-semibold">${this.escapeHtml(evt.category || 'Workshop')}</span>
            <span>/</span>
            <span class="text-slate-200 truncate max-w-xs sm:max-w-md">${this.escapeHtml(evt.title)}</span>
          </div>

          <button id="btn-back-to-events-nav" class="inline-flex items-center gap-1.5 text-slate-300 hover:text-white font-bold transition-colors">
            <span>←</span> Back
          </button>
        </div>

        <!-- Hero Header Card with Banner Gradient -->
        <div class="rounded-3xl border border-white/10 bg-gradient-to-r ${evt.bannerGradient || 'from-indigo-900/90 via-slate-900 to-purple-950/90'} p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div class="relative z-10 max-w-3xl space-y-4">
            
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                ${this.escapeHtml(evt.category || 'Workshop')}
              </span>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/10">
                ${evt.format || 'Offline'} Mode
              </span>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                PUBLISHED
              </span>
            </div>

            <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              ${this.escapeHtml(evt.title)}
            </h1>

            <p class="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-normal">
              ${this.escapeHtml(evt.tagline || evt.shortDescription || 'A hands-on technical workshop for KIIT student builders.')}
            </p>

            <!-- Meta Strip -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
              <div>
                <span class="text-slate-400 text-[10px] uppercase font-bold block">DATE</span>
                <span class="font-bold text-white mt-0.5 block">${this.escapeHtml(evt.date || 'Upcoming 2026')}</span>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] uppercase font-bold block">TIMING</span>
                <span class="font-bold text-white mt-0.5 block">${this.escapeHtml(evt.time || '10:00 AM – 04:30 PM')}</span>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] uppercase font-bold block">LOCATION</span>
                <span class="font-bold text-cyan-300 mt-0.5 block truncate">${this.escapeHtml(evt.venue || 'Campus 15, Tech Lab')}</span>
              </div>
              <div>
                <span class="text-slate-400 text-[10px] uppercase font-bold block">REGISTRATION</span>
                <span class="font-bold text-emerald-400 mt-0.5 block">${this.escapeHtml(evt.priceLabel || evt.fee || 'Free (IEEE Sponsored)')}</span>
              </div>
            </div>

            <!-- Action Bar -->
            <div class="flex flex-wrap items-center gap-3 pt-2">
              ${isRegistered ? `
                <button id="btn-hero-view-pass" class="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs shadow-xl shadow-emerald-500/30 transition-all btn-press flex items-center gap-2">
                  <span>🎟️</span> View Digital Pass
                </button>
              ` : `
                <button id="btn-hero-register" class="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs shadow-xl shadow-emerald-500/30 transition-all btn-press flex items-center gap-2">
                  <span>🎟️</span> Register for Event
                </button>
              `}

              <button id="btn-hero-add-calendar" class="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs transition-all btn-press flex items-center gap-2">
                <span>📅</span> Add to Calendar
              </button>

              <button id="btn-hero-share-wa" class="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs transition-all btn-press flex items-center gap-2">
                <span>💬</span> Share Announcement
              </button>

              <button id="btn-hero-download-poster" class="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs transition-all btn-press flex items-center gap-2">
                <span>🖼</span> Download Poster
              </button>

              <button id="btn-hero-copy-link" class="px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-xs transition-all btn-press flex items-center gap-1.5" title="Copy Event Link">
                <span>🔗</span> Copy Link
              </button>
            </div>

          </div>
        </div>

        <!-- 2-Column Content Layout (Left Details, Right Sticky Summary) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- LEFT COLUMN: Detailed Syllabus, Requirements, Speaker & FAQs -->
          <div class="lg:col-span-8 space-y-8">
            
            <!-- SECTION A: WHAT YOU WILL BUILD -->
            <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-slate-900/80 space-y-4">
              <h3 class="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
                <span class="text-indigo-400">🔨</span> What You Will Build & Deliver
              </h3>
              <ul class="space-y-2.5 text-xs text-slate-200">
                ${whatBuild.map(b => `
                  <li class="flex items-start gap-2.5">
                    <span class="text-emerald-400 font-bold mt-0.5">✓</span>
                    <span class="leading-relaxed">${this.escapeHtml(b)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <!-- SECTION B: SPEAKER / INSTRUCTOR PROFILE -->
            <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-slate-900/80 space-y-4">
              <h3 class="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
                <span class="text-pink-400">🎤</span> Lead Speaker & Instructor
              </h3>
              
              <div class="flex flex-col sm:flex-row items-start gap-4 pt-1">
                <img src="${speakerAvatar}" alt="${this.escapeHtml(speakerName)}" class="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-lg shrink-0" />
                <div class="space-y-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h4 class="text-base font-black text-white">${this.escapeHtml(speakerName)}</h4>
                    <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold">Verified Mentor</span>
                  </div>
                  <p class="text-xs text-purple-300 font-semibold">${this.escapeHtml(speakerRole)} • ${this.escapeHtml(speakerOrg)}</p>
                  <p class="text-xs text-slate-300 leading-relaxed pt-1.5">${this.escapeHtml(speakerBio)}</p>
                </div>
              </div>
            </div>

            <!-- SECTION C: VENUE & CAMPUS COORDINATES -->
            <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-slate-900/80 space-y-4">
              <h3 class="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
                <span class="text-emerald-400">📍</span> Venue Coordinates & Check-in
              </h3>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1">
                  <span class="text-slate-400 text-[10px] uppercase font-bold block">Campus & School</span>
                  <span class="text-white font-bold block text-sm">${this.escapeHtml(evt.campus || 'Campus 15')}</span>
                  <span class="text-slate-300 block">${this.escapeHtml(evt.building || 'School of Computer Engineering')}</span>
                </div>

                <div class="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1">
                  <span class="text-slate-400 text-[10px] uppercase font-bold block">Room / Lab Facility</span>
                  <span class="text-cyan-300 font-bold block text-sm">${this.escapeHtml(evt.room || 'Tech Lab 4')}</span>
                  <span class="text-slate-400 text-[11px] block">Reporting Time: ${this.escapeHtml(evt.reportingTime || '08:30 AM')}</span>
                </div>
              </div>

              <div class="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-slate-300">
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Full Address</span>
                <span class="text-white">${this.escapeHtml(evt.address || 'KIIT Deemed to be University, Patia, Bhubaneswar, Odisha 751024')}</span>
                ${evt.landmark ? `<span class="block text-slate-400 mt-1 text-[11px]">Landmark: ${this.escapeHtml(evt.landmark)}</span>` : ''}
              </div>
            </div>

            <!-- SECTION D: ELIGIBILITY & PREREQUISITES -->
            <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-slate-900/80 space-y-4">
              <h3 class="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
                <span class="text-amber-400">🎓</span> Eligibility & What to Bring
              </h3>
              
              <div class="space-y-3 text-xs">
                <div>
                  <span class="text-slate-400 text-[10px] uppercase font-bold block mb-1">Who Can Attend?</span>
                  <p class="text-white bg-slate-950 p-3 rounded-xl border border-white/10 leading-relaxed">
                    ${this.escapeHtml(evt.eligibility || 'Open to all registered KIIT engineering students.')}
                  </p>
                </div>

                <div>
                  <span class="text-slate-400 text-[10px] uppercase font-bold block mb-1">Prerequisites</span>
                  <ul class="space-y-1.5 pl-3 list-disc text-slate-200">
                    ${prereqs.map(p => `<li>${this.escapeHtml(p)}</li>`).join('')}
                  </ul>
                </div>

                ${evt.whatToBring ? `
                  <div>
                    <span class="text-slate-400 text-[10px] uppercase font-bold block mb-1">What to Bring</span>
                    <p class="text-slate-300">${this.escapeHtml(evt.whatToBring)}</p>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- SECTION E: FREQUENTLY ASKED QUESTIONS (FAQS) -->
            <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-slate-900/80 space-y-4">
              <h3 class="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
                <span class="text-indigo-400">💬</span> Frequently Asked Questions (FAQs)
              </h3>

              <div class="space-y-2.5 text-xs">
                ${faqs.map((faq, idx) => `
                  <div class="faq-item rounded-2xl bg-slate-950/70 border border-white/10 overflow-hidden transition-all">
                    <button class="btn-faq-toggle w-full p-4 flex items-center justify-between text-left font-bold text-white hover:text-indigo-300 transition-colors" data-faq-id="${idx}">
                      <span>${this.escapeHtml(faq.q || faq.question)}</span>
                      <span class="faq-arrow text-slate-400 text-sm transition-transform duration-200">▾</span>
                    </button>
                    <div class="faq-answer hidden px-4 pb-4 text-slate-300 leading-relaxed border-t border-white/5 pt-2">
                      ${this.escapeHtml(faq.a || faq.answer)}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- SECTION F: EVENT RESOURCES & REPOSITORIES -->
            <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-slate-900/80 space-y-4">
              <h3 class="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
                <span class="text-cyan-400">📦</span> Event Resources & Repositories
              </h3>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div class="p-3.5 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between">
                  <div>
                    <span class="font-bold text-white block">Official GitHub Starter Code</span>
                    <span class="text-slate-400 text-[11px]">Lab templates and neural models</span>
                  </div>
                  <a href="https://github.com/kiit-ieee" target="_blank" class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1">
                    <span>🐙</span> Repo
                  </a>
                </div>

                <div class="p-3.5 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-between">
                  <div>
                    <span class="font-bold text-white block">Lab Setup Checklist</span>
                    <span class="text-slate-400 text-[11px]">Verify your environment runtimes</span>
                  </div>
                  <a href="#readiness" class="px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-1">
                    <span>⚡</span> Check
                  </a>
                </div>
              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN: Sticky Registration & Organizer Card -->
          <div class="lg:col-span-4 space-y-6 sticky top-24">
            
            <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-emerald-500/30 bg-slate-900/90 shadow-2xl space-y-5">
              <div class="flex items-center justify-between pb-3 border-b border-white/10">
                <span class="text-xs font-bold text-white uppercase tracking-wider">Registration Status</span>
                <span class="text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/20">
                  ${isRegistered ? 'Registered Attendee' : 'Open for Admission'}
                </span>
              </div>

              <!-- Seats Meter -->
              <div class="space-y-2">
                <div class="flex justify-between text-xs">
                  <span class="text-slate-400 font-semibold">Bench Capacity</span>
                  <span class="text-white font-bold font-mono">${seatsFilled} / ${seatsTotal} Seats</span>
                </div>
                <div class="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-white/10">
                  <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500" style="width: ${seatsPct}%"></div>
                </div>
                <span class="text-[11px] text-slate-400 block">${Math.max(0, seatsTotal - seatsFilled)} lab benches remaining. First-come basis.</span>
              </div>

              <div class="pt-2 space-y-2">
                ${isRegistered ? `
                  <button id="btn-sidebar-view-pass" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs shadow-xl shadow-emerald-500/30 transition-all btn-press flex items-center justify-center gap-2">
                    <span>🎟️</span> View Digital Pass
                  </button>
                ` : `
                  <button id="btn-sidebar-register" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs shadow-xl shadow-emerald-500/30 transition-all btn-press flex items-center justify-center gap-2">
                    <span>🎟️</span> Claim Lab Bench
                  </button>
                `}

                <button id="btn-sidebar-add-calendar" class="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-semibold text-xs transition-all btn-press flex items-center justify-center gap-1.5">
                  <span>📅</span> Add to Calendar (.ics)
                </button>
              </div>

              <!-- Organizer Contact Box -->
              <div class="p-3.5 rounded-2xl bg-slate-950 border border-white/10 text-xs space-y-1 text-slate-300">
                <span class="text-slate-400 text-[10px] uppercase font-bold block">Organizer Contact</span>
                <span class="font-bold text-white block">${this.escapeHtml(evt.contactPerson || 'Aryan Mohapatra (Lead Organizer)')}</span>
                <span class="text-slate-400 block">${this.escapeHtml(evt.contactPhone || '+91 674 2725113')}</span>
                <span class="text-purple-300 block">${this.escapeHtml(evt.contactEmail || 'ieee@kiit.ac.in')}</span>
              </div>

              <!-- Cryptographic Certificate Seal -->
              <div class="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200 leading-relaxed flex items-start gap-2">
                <span class="text-base">📜</span>
                <span>All eligible participants receive an official cryptographically verifiable IEEE Student Branch Certificate.</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    `;

    this.bindEventHandlers();
  }

  bindEventHandlers() {
    const evt = this.event;
    if (!evt) return;

    // Back button
    this.container.querySelector('#btn-back-to-events-nav')?.addEventListener('click', () => {
      sound.playClick();
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.hash = 'discover';
      }
    });

    // Registration modals
    this.container.querySelectorAll('#btn-hero-register, #btn-sidebar-register').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        window.appDispatcher?.openRegistration(evt.id);
      });
    });

    // View existing pass
    this.container.querySelectorAll('#btn-hero-view-pass, #btn-sidebar-view-pass').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        const userReg = store.registrations.find(r => 
          String(r.eventId).toLowerCase() === String(evt.id).toLowerCase() ||
          (evt.slug && String(r.eventId).toLowerCase() === String(evt.slug).toLowerCase())
        );
        if (userReg) {
          window.appDispatcher?.openTicketModal(userReg.ticketId);
        } else {
          toast.show({ title: 'Pass Status', message: 'No active ticket found for this event.', type: 'info' });
        }
      });
    });

    // Add to Calendar buttons (.ics download)
    this.container.querySelectorAll('#btn-hero-add-calendar, #btn-sidebar-add-calendar').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playSuccess();
        this.downloadCalendarInvite();
      });
    });

    // WhatsApp Sharing
    this.container.querySelector('#btn-hero-share-wa')?.addEventListener('click', () => {
      sound.playClick();
      const msg = generateWhatsAppMessage(evt);
      WhatsAppShareService.shareToWhatsApp(msg, evt);
    });

    // Download Poster
    this.container.querySelector('#btn-hero-download-poster')?.addEventListener('click', () => {
      sound.playClick();
      const canvas = document.createElement('canvas');
      PromotionService.renderPosterCanvas(canvas, evt);
      const link = document.createElement('a');
      link.download = `KIIT-IEEE-${(evt.title || 'Event').replace(/[^a-zA-Z0-9]/g, '_')}-Poster.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.show({ title: 'Poster Downloaded! 🖼', message: 'Printable PNG saved to your device.', type: 'success' });
    });

    // Copy Event Link
    this.container.querySelector('#btn-hero-copy-link')?.addEventListener('click', async () => {
      sound.playClick();
      const origin = window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'https://kiit-ieee.org';
      const fullUrl = `${origin}/#event/${evt.id}`;
      await navigator.clipboard.writeText(fullUrl);
      toast.show({ title: 'Link Copied! 🔗', message: 'Event URL copied to clipboard.', type: 'success' });
    });

    // FAQ Accordion Toggle
    this.container.querySelectorAll('.btn-faq-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const answer = item?.querySelector('.faq-answer');
        const arrow = item?.querySelector('.faq-arrow');
        if (answer) {
          const isHidden = answer.classList.contains('hidden');
          sound.playClick();
          if (isHidden) {
            answer.classList.remove('hidden');
            if (arrow) arrow.style.transform = 'rotate(180deg)';
          } else {
            answer.classList.add('hidden');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
          }
        }
      });
    });
  }

  downloadCalendarInvite() {
    const evt = this.event || {};
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//KIIT IEEE Student Branch//Event//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${evt.id || 'evt'}@kiit-ieee.org`,
      `SUMMARY:${evt.title || 'KIIT IEEE Event'}`,
      `DESCRIPTION:${(evt.tagline || evt.shortDescription || 'KIIT IEEE Technical Event').replace(/\n/g, ' ')}`,
      `LOCATION:${evt.venue || 'KIIT Deemed to be University, Bhubaneswar'}`,
      'STATUS:CONFIRMED',
      'CLASS:PUBLIC',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KIIT-IEEE-${(evt.title || 'Event').replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    link.click();
    URL.revokeObjectURL(url);

    toast.show({ title: 'Event Added to Calendar! 📅', message: 'Standard .ics invite downloaded.', type: 'success' });
  }

  escapeHtml(str) {
    if (typeof str !== 'string') return str || '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

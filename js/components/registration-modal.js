/**
 * KIIT IEEE Platform - Event Registration Confirmation & Execution Modal
 * Direct confirmation interface with authenticated student identity, real server-side
 * database transaction, capacity/eligibility validation, and post-registration pass view.
 */

import { store } from '../state.js';
import { sound } from '../services/audio-service.js';
import { toast } from './toast.js';

export class RegistrationModal {
  constructor() {
    this.modal = null;
    this.event = null;
    this.isSubmitting = false;
    this.escHandler = null;

    this.init();
  }

  init() {
    let el = document.getElementById('registration-modal-root');
    if (!el) {
      el = document.createElement('div');
      el.id = 'registration-modal-root';
      el.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop hidden overflow-y-auto';
      document.body.appendChild(el);
    }
    this.modal = el;

    // Dismiss on outside backdrop click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal && !this.isSubmitting) {
        sound.playClick();
        this.close();
      }
    });
  }

  async open(eventId) {
    if (!eventId) return;

    // 1. Verify Student Authentication
    if (!store.user || !store.user.rollNo) {
      toast.show({
        title: 'Authentication Required',
        message: 'Please log in with your KIIT student account to register.',
        type: 'warning'
      });
      window.appDispatcher?.openAuthModal('student');
      return;
    }

    // 2. Locate Event
    this.event = store.events.find(e => 
      String(e.id).toLowerCase() === String(eventId).toLowerCase() || 
      (e.slug && String(e.slug).toLowerCase() === String(eventId).toLowerCase())
    );

    if (!this.event) {
      try {
        const origin = window.location.origin && window.location.origin !== 'null' && !window.location.origin.includes('file:') ? window.location.origin : 'http://localhost:3000';
        const res = await fetch(`${origin}/api/events/${encodeURIComponent(eventId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.event) {
            this.event = data.event;
            store.addEvent(data.event);
          }
        }
      } catch (err) {}
    }

    if (!this.event) {
      toast.show({ title: 'Error', message: 'Event not found in database.', type: 'error' });
      return;
    }

    // 3. Check for Duplicate Registration
    const existing = store.registrations.find(r => 
      (String(r.eventId).toLowerCase() === String(this.event.id).toLowerCase() || 
       (this.event.slug && String(r.eventId).toLowerCase() === String(this.event.slug).toLowerCase())) &&
      (String(r.rollNo).toLowerCase() === String(store.user.rollNo).toLowerCase() ||
       (store.user.email && String(r.email).toLowerCase() === String(store.user.email).toLowerCase()))
    );

    if (existing) {
      toast.show({
        title: 'Already Registered',
        message: `✓ You're already registered for this event. Ticket: ${existing.ticketId}`,
        type: 'info'
      });
      window.appDispatcher?.openTicketModal(existing.ticketId);
      return;
    }

    this.isSubmitting = false;
    this.renderConfirmation();
    this.modal.classList.remove('hidden');
    sound.playClick();

    if (this.escHandler) window.removeEventListener('keydown', this.escHandler);
    this.escHandler = (e) => {
      if (e.key === 'Escape' && !this.modal.classList.contains('hidden') && !this.isSubmitting) {
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

  checkEligibility() {
    if (!this.event || !this.event.eligibility) return { eligible: true, message: '' };
    const eligLower = this.event.eligibility.toLowerCase();
    if (eligLower.includes('open to all') || eligLower.includes('any semester')) {
      return { eligible: true, message: '' };
    }

    const yearMap = {
      '1st': ['1st', 'first', '1'],
      '2nd': ['2nd', 'second', '2'],
      '3rd': ['3rd', 'third', '3'],
      '4th': ['4th', 'fourth', 'final', '4']
    };

    const mentionedYears = [];
    for (const [yKey, aliases] of Object.entries(yearMap)) {
      if (aliases.some(a =>
        eligLower.includes(`${a} year`) ||
        eligLower.includes(`${a} yr`) ||
        eligLower.includes(`${a}&`) ||
        eligLower.includes(`${a} &`) ||
        eligLower.includes(`${a},`) ||   // e.g. "2nd, 3rd & 4th Year"
        eligLower.includes(`${a} ,`)
      )) {
        mentionedYears.push(yKey);
      }
    }

    if (mentionedYears.length > 0) {
      const studentYearLower = (store.user.year || '').toLowerCase();
      const matched = mentionedYears.some(yKey => yearMap[yKey].some(a => studentYearLower.includes(a)));
      if (!matched) {
        return {
          eligible: false,
          message: `This event is open to ${mentionedYears.join(', ')} Year students only. Your registered profile is ${store.user.year}.`
        };
      }
    }

    return { eligible: true, message: '' };
  }

  isDeadlinePassed() {
    if (!this.event || !this.event.registrationDeadline) return false;
    try {
      const clean = this.event.registrationDeadline.trim().slice(0, 10);
      const dlDate = new Date(clean + 'T23:59:59');
      return new Date() > dlDate;
    } catch (e) {
      return false;
    }
  }

  renderConfirmation() {
    const evt = this.event;
    const isFull = (evt.seatsFilled || 0) >= (evt.seatsTotal || 120);
    const deadlinePassed = this.isDeadlinePassed();
    const elig = this.checkEligibility();
    const canRegister = !isFull && !deadlinePassed && elig.eligible;

    const eventDate = evt.date || evt.startDate || 'Upcoming 2026';
    const eventTime = evt.time || (evt.startTime && evt.endTime ? `${evt.startTime} – ${evt.endTime}` : '10:00 AM – 04:30 PM');
    const eventVenue = evt.venue || (evt.room && evt.building ? `${evt.room}, ${evt.building}` : 'KIIT University');

    this.modal.innerHTML = `
      <div class="relative w-full max-w-lg bg-slate-900 border border-indigo-500/40 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl my-8">
        
        <!-- Header Banner -->
        <div class="p-6 bg-gradient-to-r ${evt.bannerGradient || 'from-indigo-600 via-purple-600 to-cyan-600'} relative">
          <div class="flex items-start justify-between relative z-10">
            <div>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-black/40 text-white backdrop-blur-md border border-white/20">
                Event Registration
              </span>
              <h3 class="text-xl sm:text-2xl font-black text-white mt-2 leading-tight">Register for Event?</h3>
              <p class="text-sm font-bold text-indigo-100 mt-1 line-clamp-1">${evt.title}</p>
            </div>
            <button id="btn-reg-modal-close" class="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors" title="Close">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        <!-- Body Content -->
        <div class="p-6 sm:p-8 space-y-5">
          
          <!-- Event Metadata Card -->
          <div class="bg-slate-950/70 border border-white/10 rounded-2xl p-4 space-y-2.5 text-xs">
            <div class="flex items-center gap-2.5 text-slate-300">
              <span class="text-base shrink-0">📅</span>
              <div><strong class="text-white">Date:</strong> ${eventDate}</div>
            </div>
            <div class="flex items-center gap-2.5 text-slate-300">
              <span class="text-base shrink-0">⏰</span>
              <div><strong class="text-white">Time:</strong> ${eventTime}</div>
            </div>
            <div class="flex items-center gap-2.5 text-slate-300">
              <span class="text-base shrink-0">📍</span>
              <div><strong class="text-white">Venue:</strong> ${eventVenue}</div>
            </div>
            <div class="flex items-center gap-2.5 text-slate-300">
              <span class="text-base shrink-0">🎟️</span>
              <div><strong class="text-white">Capacity:</strong> <span class="text-cyan-400 font-mono font-bold">${evt.seatsFilled || 0} / ${evt.seatsTotal || 120}</span> Seats Filled</div>
            </div>
          </div>

          <!-- Authenticated Student Card (Pre-filled from authorized profile) -->
          <div class="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Authenticated Student</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Verified</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                ${store.user.name.charAt(0)}
              </div>
              <div class="truncate">
                <div class="font-bold text-white text-sm truncate">${store.user.name}</div>
                <div class="text-xs text-slate-300 font-mono">Roll: ${store.user.rollNo} • ${store.user.branch}</div>
                <div class="text-[11px] text-indigo-300 font-medium">${store.user.email} • ${store.user.year}</div>
              </div>
            </div>
          </div>

          <!-- Status Banners for Blockers -->
          ${isFull ? `
            <div class="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <span class="text-lg">🚫</span>
              <div><strong>Event is full.</strong> All ${evt.seatsTotal} available seats have been claimed.</div>
            </div>
          ` : ''}

          ${deadlinePassed ? `
            <div class="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <span class="text-lg">⏳</span>
              <div><strong>Registration closed.</strong> The deadline for this event has passed.</div>
            </div>
          ` : ''}

          ${!elig.eligible ? `
            <div class="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
              <span class="text-lg">⚠️</span>
              <div><strong>Eligibility Notice:</strong> ${elig.message}</div>
            </div>
          ` : ''}

          <!-- Confirmation Actions -->
          <div class="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
            <button id="btn-reg-cancel" class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-bold text-xs transition-colors btn-press">
              Cancel
            </button>
            <button 
              id="btn-reg-confirm" 
              ${canRegister ? '' : 'disabled'}
              class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs shadow-lg shadow-indigo-500/25 transition-all btn-press flex items-center gap-2"
            >
              <span id="reg-confirm-text">Confirm Registration</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>

        </div>

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const closeBtn = this.modal.querySelector('#btn-reg-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => { sound.playClick(); this.close(); });

    const cancelBtn = this.modal.querySelector('#btn-reg-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', () => { sound.playClick(); this.close(); });

    const confirmBtn = this.modal.querySelector('#btn-reg-confirm');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        this.handleConfirmRegistration();
      });
    }
  }

  async handleConfirmRegistration() {
    if (this.isSubmitting) return;

    const confirmBtn = this.modal.querySelector('#btn-reg-confirm');
    const confirmText = this.modal.querySelector('#reg-confirm-text');
    if (confirmBtn) confirmBtn.disabled = true;
    if (confirmText) confirmText.textContent = 'Registering...';
    this.isSubmitting = true;

    try {
      const origin = window.location.origin && window.location.origin !== 'null' && !window.location.origin.includes('file:') ? window.location.origin : 'http://localhost:3000';
      const endpoint = `${origin}/api/events/${encodeURIComponent(this.event.id)}/register`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: this.event.id,
          eventName: this.event.title,
          studentName: store.user.name,
          rollNo: store.user.rollNo,
          email: store.user.email,
          branch: store.user.branch,
          year: store.user.year,
          phone: store.user.phone || '+91 98765 43210',
          track: this.event.category || 'Technical Track',
          tshirtSize: 'L'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast.show({
            title: 'Already Registered',
            message: "✓ You're already registered for this event.",
            type: 'info'
          });
          this.close();
          const tkt = (data.registration && data.registration.ticketId) || 'KIIT-IEEE-2026-AI99';
          window.appDispatcher?.openTicketModal(tkt);
          return;
        }

        toast.show({
          title: 'Registration Blocked',
          message: data.error || 'Server rejected registration.',
          type: 'error'
        });

        if (confirmBtn) confirmBtn.disabled = false;
        if (confirmText) confirmText.textContent = 'Confirm Registration';
        this.isSubmitting = false;
        return;
      }

      // Registration successful in backend database
      const registration = data.registration;

      // Synchronize in reactive state store
      const existingIdx = store.registrations.findIndex(r => r.ticketId === registration.ticketId);
      if (existingIdx >= 0) {
        store.registrations[existingIdx] = registration;
      } else {
        store.registrations.unshift(registration);
      }

      // Update seat capacity in local event
      if (this.event) {
        this.event.seatsFilled = (data.event && data.event.seatsFilled) ? data.event.seatsFilled : ((this.event.seatsFilled || 0) + 1);
        if (this.event.seatsFilled >= this.event.seatsTotal) {
          this.event.status = 'FULL';
        } else if (this.event.seatsFilled >= this.event.seatsTotal * 0.8) {
          this.event.status = 'ALMOST FULL';
        }
      }

      store.save();
      store.awardXp(100, `Registered for "${this.event.title}"`);
      store.addAuditLog(store.user.name, `Registered for ${this.event.title}`, registration.ticketId);
      store.notify('REGISTRATION_CREATED', registration);

      // Trigger Confetti Burst
      if (typeof confetti === 'function') {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
      sound.playSuccess();

      // Render the exact Registration Success UI
      this.renderSuccess(registration);

    } catch (err) {
      console.error('[RegistrationModal] Network error:', err);
      toast.show({
        title: 'Network Error',
        message: 'Unable to reach backend registration service. Please check connection.',
        type: 'error'
      });
      if (confirmBtn) confirmBtn.disabled = false;
      if (confirmText) confirmText.textContent = 'Confirm Registration';
      this.isSubmitting = false;
    }
  }

  renderSuccess(registration) {
    this.modal.innerHTML = `
      <div class="relative w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl p-6 sm:p-8 space-y-6 text-center my-8">
        
        <!-- Big Celebration Icon -->
        <div class="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-500/20">
          🎉
        </div>

        <!-- Success Header -->
        <div class="space-y-1">
          <h3 class="text-2xl font-black text-white">Registration Successful!</h3>
          <p class="text-xs text-slate-400">You're registered for:</p>
          <p class="text-base font-extrabold text-emerald-300 mt-0.5 leading-snug">${this.event.title}</p>
        </div>

        <!-- Digital Pass Identifier Card -->
        <div class="bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs font-mono space-y-1">
          <span class="text-slate-400 text-[10px] block uppercase tracking-wider">Your Digital Pass ID</span>
          <span class="text-cyan-300 font-bold text-base tracking-wider block">${registration.ticketId}</span>
          <div class="text-[11px] text-slate-400 pt-1">
            ${registration.bench || 'Bench Assigned at Door'} • Official IEEE Participant
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button 
            id="btn-success-view-pass" 
            class="w-full sm:w-auto flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs shadow-lg shadow-emerald-500/30 transition-all btn-press flex items-center justify-center gap-2"
          >
            <span>🎫</span>
            <span>View Event Pass</span>
          </button>
          <button 
            id="btn-success-view-event" 
            class="w-full sm:w-auto flex-1 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all btn-press flex items-center justify-center gap-2"
          >
            <span>👁️</span>
            <span>View Event</span>
          </button>
        </div>

      </div>
    `;

    const passBtn = this.modal.querySelector('#btn-success-view-pass');
    if (passBtn) {
      passBtn.addEventListener('click', () => {
        sound.playClick();
        this.close();
        window.appDispatcher?.openTicketModal(registration.ticketId);
      });
    }

    const eventBtn = this.modal.querySelector('#btn-success-view-event');
    if (eventBtn) {
      eventBtn.addEventListener('click', () => {
        sound.playClick();
        this.close();
        window.location.hash = `#event/${this.event.id}`;
      });
    }
  }
}

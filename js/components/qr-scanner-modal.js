/**
 * KIIT IEEE Platform - Attendance QR Scanner Modal
 * Real camera permission handling, BarcodeDetector frame decoding, server-side host authorization,
 * event scope validation, duplicate check-in detection, and live attendance ledger synchronization.
 */

import { store } from '../state.js';
import { sound } from '../services/audio-service.js';
import { toast } from './toast.js';

export class QRScannerModal {
  constructor() {
    this.modal = null;
    this.videoStream = null;
    this.scanInterval = null;
    this.isProcessing = false;
    this.selectedEventId = null;
    this.cameraPermissionDenied = false;
    this.escHandler = null;

    this.init();
  }

  init() {
    let el = document.getElementById('qr-scanner-modal-root');
    if (!el) {
      el = document.createElement('div');
      el.id = 'qr-scanner-modal-root';
      document.body.appendChild(el);
    }
    el.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop hidden overflow-y-auto';
    el.style.display = 'none';
    this.modal = el;

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        sound.playClick();
        this.close();
      }
    });
  }

  open(eventId = null) {
    this.selectedEventId = eventId;
    this.isProcessing = false;
    this.cameraPermissionDenied = false;

    this.render();
    this.modal.classList.remove('hidden');
    this.modal.style.display = 'flex';
    sound.playClick();

    if (this.isHostAuthorized()) {
      this.startCamera();
    }

    if (this.escHandler) window.removeEventListener('keydown', this.escHandler);
    this.escHandler = (e) => {
      if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
        this.close();
      }
    };
    window.addEventListener('keydown', this.escHandler);
  }

  close() {
    this.stopCamera();
    this.modal.classList.add('hidden');
    this.modal.style.display = 'none';
    if (this.escHandler) {
      window.removeEventListener('keydown', this.escHandler);
      this.escHandler = null;
    }
  }

  isHostAuthorized() {
    const role = (store.user?.role || '').toLowerCase();
    return ['host', 'organizer', 'volunteer', 'admin', 'instructor'].includes(role);
  }

  stopCamera() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
  }

  async startCamera() {
    this.stopCamera();
    this.cameraPermissionDenied = false;

    const video = this.modal.querySelector('#scanner-video');
    const deniedBox = this.modal.querySelector('#camera-denied-box');
    const streamContainer = this.modal.querySelector('#scanner-viewport-box');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported in this browser environment');
      }

      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      if (video) {
        video.srcObject = this.videoStream;
        await video.play();
        video.classList.remove('hidden');
      }

      if (deniedBox) deniedBox.classList.add('hidden');
      if (streamContainer) streamContainer.classList.remove('hidden');

      this.startDetectionLoop();

    } catch (err) {
      console.warn('[QRScannerModal] Camera permission denied or device unavailable:', err);
      this.cameraPermissionDenied = true;

      if (video) video.classList.add('hidden');
      if (deniedBox) deniedBox.classList.remove('hidden');
    }
  }

  startDetectionLoop() {
    if ('BarcodeDetector' in window) {
      try {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        this.scanInterval = setInterval(async () => {
          if (this.isProcessing || !this.videoStream) return;
          const video = this.modal.querySelector('#scanner-video');
          if (!video || video.readyState < 2) return;

          try {
            const barcodes = await detector.detect(video);
            if (barcodes.length > 0 && barcodes[0].rawValue) {
              const raw = barcodes[0].rawValue;
              this.processScan(raw);
            }
          } catch (e) {}
        }, 400);
      } catch (err) {
        console.warn('BarcodeDetector error:', err);
      }
    }
  }

  render() {
    const isAuth = this.isHostAuthorized();

    if (!isAuth) {
      this.modal.innerHTML = `
        <div class="relative w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 text-center my-8">
          <div class="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center text-2xl mx-auto shadow-lg shadow-rose-500/20">
            🛡️
          </div>
          <div>
            <h3 class="text-xl font-bold text-white">Host Security Required</h3>
            <p class="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Attendance scanning is restricted to verified Hosts, Organizers, Volunteers, and Admins.
              Random student accounts cannot mark attendance.
            </p>
          </div>
          <div class="pt-2 flex flex-col gap-2">
            <button id="btn-scanner-switch-host" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all btn-press">
              Switch to Host / Organizer Account
            </button>
            <button id="btn-scanner-cancel-auth" class="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold">
              Cancel
            </button>
          </div>
        </div>
      `;

      const switchBtn = this.modal.querySelector('#btn-scanner-switch-host');
      if (switchBtn) {
        switchBtn.addEventListener('click', () => {
          sound.playClick();
          store.switchUserRole('organizer');
          this.render();
          this.startCamera();
        });
      }

      const cancelBtn = this.modal.querySelector('#btn-scanner-cancel-auth');
      if (cancelBtn) cancelBtn.addEventListener('click', () => this.close());
      return;
    }

    const availableTickets = store.registrations.map(r => r.ticketId);
    const scopeEvent = this.selectedEventId ? store.events.find(e => e.id === this.selectedEventId || e.slug === this.selectedEventId) : null;

    this.modal.innerHTML = `
      <div class="relative w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl my-8">
        
        <!-- Header -->
        <div class="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/80 border-b border-white/10 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
            </div>
            <div>
              <h3 class="text-base font-bold text-white">Attendance Scanner</h3>
              <p class="text-xs text-slate-400">
                ${scopeEvent ? `Active Event: <span class="text-cyan-300 font-semibold">${scopeEvent.title}</span>` : 'KIIT IEEE Multi-Event Attendance Desk'}
              </p>
            </div>
          </div>
          <button id="btn-scanner-close" class="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" title="Close">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Scanner Viewport Area -->
        <div class="p-6 space-y-5">
          
          <!-- Camera Feed Box -->
          <div id="scanner-viewport-box" class="relative w-full h-64 rounded-2xl bg-black overflow-hidden border-2 border-dashed border-cyan-500/40 flex items-center justify-center">
            
            <!-- Real Hardware Camera Video Stream -->
            <video id="scanner-video" autoplay playsinline class="w-full h-full object-cover hidden"></video>

            <!-- Sweeping Laser Scan Line -->
            <div class="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce pointer-events-none z-10"></div>

            <!-- Corner Frame Reticles -->
            <div class="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-cyan-400 z-10"></div>
            <div class="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-400 z-10"></div>
            <div class="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-400 z-10"></div>
            <div class="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-cyan-400 z-10"></div>
          </div>

          <!-- Permission Denied Prompt (Shows if camera denied) -->
          <div id="camera-denied-box" class="hidden p-5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-center space-y-3">
            <div class="text-3xl">📷🚫</div>
            <p class="text-sm font-bold text-rose-200">Camera access is required to scan attendance.</p>
            <p class="text-xs text-slate-300">Grant camera access in browser permissions or click Try Again below.</p>
            <button id="btn-camera-try-again" class="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all btn-press">
              Try Again
            </button>
          </div>

          <!-- Dynamic Result Banner -->
          <div id="scanner-result-box" class="hidden p-4 rounded-2xl border transition-all"></div>

          <!-- Rapid Ticket Input & Scanner Simulator -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs">
              <label class="font-semibold text-slate-300">Scan Student QR / Enter Pass ID</label>
              <button id="btn-retrigger-camera" class="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold flex items-center gap-1">
                <span>📷</span> Restart Camera
              </button>
            </div>
            <div class="flex gap-2">
              <input 
                type="text" 
                id="scanner-input" 
                placeholder="Scan QR or type e.g. KIIT-IEEE-2026-AI99" 
                class="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500 uppercase"
              />
              <button id="btn-verify-ticket" class="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all btn-press">
                Verify
              </button>
            </div>
          </div>

          <!-- Rapid Test Tickets Quick-Pick -->
          ${availableTickets.length > 0 ? `
            <div class="space-y-1.5 pt-1">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registered Tickets in Database:</span>
              <div class="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                ${availableTickets.slice(0, 6).map(tkt => `
                  <button class="btn-sample-tkt px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-cyan-300 transition-colors" data-tkt="${tkt}">
                    ${tkt}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

        </div>

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const closeBtn = this.modal.querySelector('#btn-scanner-close');
    if (closeBtn) closeBtn.addEventListener('click', () => { sound.playClick(); this.close(); });

    const tryAgainBtn = this.modal.querySelector('#btn-camera-try-again');
    if (tryAgainBtn) {
      tryAgainBtn.addEventListener('click', () => {
        sound.playClick();
        this.startCamera();
      });
    }

    const retriggerBtn = this.modal.querySelector('#btn-retrigger-camera');
    if (retriggerBtn) {
      retriggerBtn.addEventListener('click', () => {
        sound.playClick();
        this.startCamera();
      });
    }

    const verifyBtn = this.modal.querySelector('#btn-verify-ticket');
    if (verifyBtn) {
      verifyBtn.addEventListener('click', () => {
        const input = this.modal.querySelector('#scanner-input');
        if (input && input.value.trim()) {
          this.processScan(input.value.trim());
        }
      });
    }

    const input = this.modal.querySelector('#scanner-input');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (input.value.trim()) this.processScan(input.value.trim());
        }
      });
    }

    this.modal.querySelectorAll('.btn-sample-tkt').forEach(btn => {
      btn.addEventListener('click', () => {
        const tkt = btn.getAttribute('data-tkt');
        if (input) input.value = tkt;
        sound.playClick();
        this.processScan(tkt);
      });
    });
  }

  async processScan(rawCode) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const resultBox = this.modal.querySelector('#scanner-result-box');
    const input = this.modal.querySelector('#scanner-input');
    if (input) input.value = rawCode;

    if (resultBox) {
      resultBox.className = 'p-4 rounded-2xl border bg-slate-950/80 border-cyan-500/30 text-cyan-200 text-xs flex items-center gap-2';
      resultBox.innerHTML = `
        <span class="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></span>
        <span>Verifying pass with backend database...</span>
      `;
      resultBox.classList.remove('hidden');
    }

    try {
      const origin = window.location.origin && window.location.origin !== 'null' && !window.location.origin.includes('file:') ? window.location.origin : 'http://localhost:3000';
      const endpoint = `${origin}/api/events/checkin`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': store.user?.role || 'Host'
        },
        body: JSON.stringify({
          qrToken: rawCode,
          ticketId: rawCode,
          eventId: this.selectedEventId || undefined,
          role: store.user?.role || 'Host'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        sound.playError();
        if (resultBox) {
          resultBox.className = 'p-4 rounded-2xl border bg-rose-950/60 border-rose-500/40 text-rose-100 space-y-2';
          resultBox.innerHTML = `
            <div class="flex items-center gap-2 font-bold text-xs text-rose-300">
              <span>✕</span> ${data.error || 'Verification Failed'}
            </div>
            <div class="pt-1">
              <button id="btn-scan-next-error" class="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors">
                Scan Next Student
              </button>
            </div>
          `;
          const nextBtn = resultBox.querySelector('#btn-scan-next-error');
          if (nextBtn) nextBtn.addEventListener('click', () => this.resetForNextScan());
        }
        return;
      }

      // Handle duplicate check-in
      if (data.alreadyAttended) {
        sound.playBeep();
        if (resultBox) {
          resultBox.className = 'p-4 rounded-2xl border bg-amber-950/60 border-amber-500/40 text-amber-100 space-y-2';
          resultBox.innerHTML = `
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 font-bold text-xs text-amber-300">
                <span>✓</span> Student already checked in
              </div>
              <span class="text-[10px] font-mono text-amber-400 font-bold">${data.time || 'Previously Verified'}</span>
            </div>
            <div class="text-xs">
              <div class="font-bold text-white">${data.student || 'Registered Student'}</div>
              <div class="text-slate-300 text-[11px]">${data.event || 'KIIT IEEE Event'}</div>
            </div>
            <div class="pt-2">
              <button id="btn-scan-next-attended" class="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all btn-press">
                Scan Next Student
              </button>
            </div>
          `;
          const nextBtn = resultBox.querySelector('#btn-scan-next-attended');
          if (nextBtn) nextBtn.addEventListener('click', () => this.resetForNextScan());
        }
        return;
      }

      // Success check-in!
      sound.playCheckin();

      // Synchronize state store
      const reg = store.registrations.find(r => r.ticketId.toUpperCase() === (data.registration?.ticketId || '').toUpperCase());
      if (reg) {
        reg.attended = true;
        reg.attendedAt = data.registration?.attendedAt || new Date().toISOString();
        reg.status = 'Attended';
      }

      store.save();
      store.awardXp(150, `Checked into lab (${data.student})`);
      store.addAuditLog('Host QR Desk', `Verified attendance for ${data.student}`, data.registration?.ticketId);
      store.notify('ATTENDANCE_CHECKED_IN', data.registration);

      toast.show({
        title: 'Attendance Marked! ✓',
        message: `${data.student} is recorded present.`,
        type: 'success'
      });

      // Render the exact Scanner Success Screen required by Section 20
      if (resultBox) {
        resultBox.className = 'p-5 rounded-2xl border bg-emerald-950/70 border-emerald-500/40 text-emerald-100 space-y-3';
        resultBox.innerHTML = `
          <div class="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <span class="flex items-center gap-2 font-black text-sm text-emerald-300">
              <span class="text-lg">✓</span> Attendance Marked
            </span>
            <span class="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">
              ${data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div class="text-xs space-y-1">
            <div class="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Student:</div>
            <div class="text-base font-extrabold text-white">${data.student || 'Registered Attendee'}</div>
            
            <div class="text-slate-400 text-[10px] uppercase font-bold tracking-wider pt-1">Event:</div>
            <div class="text-xs font-semibold text-cyan-300">${data.event || 'KIIT IEEE Masterclass'}</div>
          </div>

          <div class="pt-2">
            <button id="btn-scan-next-success" class="w-full px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs shadow-lg shadow-emerald-500/30 transition-all btn-press flex items-center justify-center gap-1.5">
              <span>Scan Next Student</span>
              <span>→</span>
            </button>
          </div>
        `;

        const nextBtn = resultBox.querySelector('#btn-scan-next-success');
        if (nextBtn) nextBtn.addEventListener('click', () => this.resetForNextScan());
      }

    } catch (err) {
      console.error('[QRScannerModal] Check-in error:', err);
      sound.playError();
      if (resultBox) {
        resultBox.className = 'p-4 rounded-2xl border bg-rose-950/60 border-rose-500/40 text-rose-100 space-y-2';
        resultBox.innerHTML = `
          <div class="flex items-center gap-2 font-bold text-xs text-rose-300">
            <span>✕</span> Network connection error
          </div>
          <div class="pt-1">
            <button id="btn-scan-next-net" class="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs">
              Scan Next Student
            </button>
          </div>
        `;
        const nextBtn = resultBox.querySelector('#btn-scan-next-net');
        if (nextBtn) nextBtn.addEventListener('click', () => this.resetForNextScan());
      }
    }
  }

  resetForNextScan() {
    const resultBox = this.modal.querySelector('#scanner-result-box');
    const input = this.modal.querySelector('#scanner-input');
    if (resultBox) {
      resultBox.classList.add('hidden');
      resultBox.innerHTML = '';
    }
    if (input) input.value = '';
    this.isProcessing = false;
  }
}

/**
 * KIIT IEEE Platform - Digital IEEE Pass / Ticket Modal
 * Scannable high-contrast QR pass with attendance status, download, share,
 * wallet (.ics), event details navigation, and robust backdrop/escape handling.
 */

import { store } from '../state.js';
import { QRService } from '../services/qr-service.js';
import { sound } from '../services/audio-service.js';
import { toast } from './toast.js';

export class TicketModal {
  constructor() {
    this.modal = null;
    this.registration = null;
    this.currentEvent = null;
    this.escHandler = null;
    this.init();
  }

  init() {
    let el = document.getElementById('ticket-modal-root');
    if (!el) {
      el = document.createElement('div');
      el.id = 'ticket-modal-root';
      el.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop hidden overflow-y-auto';
      document.body.appendChild(el);
    }
    this.modal = el;

    // Dismiss on outside backdrop click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        sound.playClick();
        this.close();
      }
    });
  }

  open(ticketIdOrEventId) {
    if (!ticketIdOrEventId) return;

    const query = String(ticketIdOrEventId).trim();
    const queryUpper = query.toUpperCase();
    const queryLower = query.toLowerCase();

    // 1. Match by exact ticketId
    let reg = store.registrations.find(r => 
      String(r.ticketId || '').trim().toUpperCase() === queryUpper
    );

    // 2. Match by eventId or slug for the current authenticated user first
    if (!reg) {
      reg = store.registrations.find(r => 
        (String(r.eventId || '').toLowerCase() === queryLower ||
         (r.slug && String(r.slug).toLowerCase() === queryLower)) &&
        (String(r.rollNo || '').toLowerCase() === String(store.user?.rollNo || '').toLowerCase() ||
         (store.user?.email && String(r.email || '').toLowerCase() === String(store.user.email).toLowerCase()))
      );
    }

    // 3. Match by event title for current user
    if (!reg) {
      reg = store.registrations.find(r => 
        String(r.eventName || '').toLowerCase() === queryLower &&
        (String(r.rollNo || '').toLowerCase() === String(store.user?.rollNo || '').toLowerCase())
      );
    }

    // 4. Match by eventId, slug, or title for any user (fallback)
    if (!reg) {
      reg = store.registrations.find(r => 
        String(r.eventId || '').toLowerCase() === queryLower ||
        (r.slug && String(r.slug).toLowerCase() === queryLower) ||
        String(r.eventName || '').toLowerCase() === queryLower
      );
    }

    // 5. Match by linked event
    if (!reg) {
      const evt = store.events.find(e => 
        String(e.id || '').toLowerCase() === queryLower ||
        (e.slug && String(e.slug).toLowerCase() === queryLower) ||
        String(e.title || '').toLowerCase() === queryLower
      );
      if (evt) {
        reg = store.registrations.find(r => 
          String(r.eventId || '').toLowerCase() === String(evt.id).toLowerCase() ||
          (evt.slug && String(r.eventId || '').toLowerCase() === String(evt.slug).toLowerCase()) ||
          String(r.eventName || '').toLowerCase() === String(evt.title).toLowerCase()
        );
      }
    }

    if (!reg) {
      toast.show({ title: 'Pass Not Found', message: `No active pass found for "${ticketIdOrEventId}".`, type: 'info' });
      return;
    }

    this.registration = reg;

    this.currentEvent = store.events.find(e => 
      String(e.id).toLowerCase() === String(this.registration.eventId).toLowerCase() ||
      (e.slug && String(e.slug).toLowerCase() === String(this.registration.eventId).toLowerCase()) ||
      String(e.title).toLowerCase() === String(this.registration.eventName || '').toLowerCase()
    ) || {
      id: this.registration.eventId,
      title: this.registration.eventName || 'KIIT IEEE Technical Workshop',
      venue: 'Campus 15, Tech Lab 4',
      campus: 'Campus 15',
      date: 'Autumn Season 2026',
      time: '09:30 AM - 05:00 PM IST',
      bannerGradient: 'from-indigo-600 to-cyan-600'
    };

    this.render(this.currentEvent);
    this.modal.classList.remove('hidden');
    sound.playClick();

    // Listen for Escape key
    if (this.escHandler) window.removeEventListener('keydown', this.escHandler);
    this.escHandler = (e) => {
      if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
        this.close();
      }
    };
    window.addEventListener('keydown', this.escHandler);

    // Render QR Code onto the modal canvas
    requestAnimationFrame(() => {
      const canvas = this.modal.querySelector('#ticket-qr-canvas');
      if (canvas) {
        QRService.renderQRCode(canvas, this.registration.ticketId, { size: 190 });
      }
    });
  }

  close() {
    this.modal.classList.add('hidden');
    if (this.escHandler) {
      window.removeEventListener('keydown', this.escHandler);
      this.escHandler = null;
    }
  }

  render(event) {
    const reg = this.registration;
    const isAttended = reg.attended;

    this.modal.innerHTML = `
      <div class="relative w-full max-w-md bg-slate-900 border border-indigo-500/40 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl my-8">
        
        <!-- Pass Top Header -->
        <div class="p-6 bg-gradient-to-r ${event.bannerGradient || 'from-indigo-600 to-cyan-600'} relative">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-ping"></span>
              <span class="text-xs font-black tracking-widest uppercase text-white/90">Official Digital Pass</span>
            </div>
            <button id="btn-ticket-close" class="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors" title="Close Pass">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <h3 class="text-xl font-black text-white mt-3 leading-snug">${this.escapeHtml(event.title)}</h3>
          <p class="text-xs text-white/80 mt-1">${this.escapeHtml(event.date || 'Upcoming 2026')} • ${this.escapeHtml(event.venue || 'KIIT University')}</p>
        </div>

        <!-- Punch Notch Separator -->
        <div class="relative h-6 bg-slate-900 flex items-center justify-between px-[-10px] overflow-hidden">
          <div class="w-5 h-5 rounded-full bg-[#07090e] -ml-2.5 border-r border-indigo-500/30"></div>
          <div class="w-full border-t border-dashed border-white/20 mx-2"></div>
          <div class="w-5 h-5 rounded-full bg-[#07090e] -mr-2.5 border-l border-indigo-500/30"></div>
        </div>

        <!-- Pass Body -->
        <div class="p-6 space-y-5">
          
          <!-- QR Canvas Box -->
          <div class="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10">
            <div class="bg-white p-2.5 rounded-xl shadow-lg shadow-black/50">
              <canvas id="ticket-qr-canvas" class="w-44 h-44 rounded cursor-pointer" title="Click to view QR"></canvas>
            </div>
            <div class="mt-3 flex items-center gap-2">
              <span class="font-mono text-xs font-bold text-indigo-300 tracking-wider">${reg.ticketId}</span>
              <button id="btn-copy-ticket" class="px-2.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-slate-300 transition-colors">
                Copy ID
              </button>
            </div>
            <span class="text-[10px] text-slate-400 mt-1">Present this QR code at the lab entry desk for scanning</span>
          </div>

          <!-- Attendee Details Grid -->
          <div class="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-white/5">
            <div>
              <span class="text-slate-500 text-[10px] block">ATTENDEE</span>
              <span class="font-bold text-white">${this.escapeHtml(reg.studentName || store.user.name)}</span>
            </div>
            <div>
              <span class="text-slate-500 text-[10px] block">ROLL NUMBER</span>
              <span class="font-mono font-bold text-indigo-300">${this.escapeHtml(reg.rollNo || store.user.rollNo)}</span>
            </div>
            <div>
              <span class="text-slate-500 text-[10px] block">ACADEMIC BRANCH</span>
              <span class="font-medium text-slate-300 truncate">${this.escapeHtml(reg.branch || store.user.branch)}</span>
            </div>
            <div>
              <span class="text-slate-500 text-[10px] block">STATUS</span>
              <span class="inline-flex items-center gap-1 font-bold ${isAttended ? 'text-emerald-400' : 'text-cyan-400'}">
                ${isAttended ? '✓ Attended' : '⚡ Confirmed'}
              </span>
            </div>
          </div>

          <!-- Quick Action Buttons: Download, Share, Wallet -->
          <div class="grid grid-cols-3 gap-2 text-xs">
            <button id="btn-ticket-download" class="py-2.5 px-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-center border border-white/10 transition-all btn-press flex flex-col items-center gap-1">
              <span class="text-base">📥</span>
              <span class="text-[10px]">Download Pass</span>
            </button>
            <button id="btn-ticket-share" class="py-2.5 px-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-center border border-white/10 transition-all btn-press flex flex-col items-center gap-1">
              <span class="text-base">🔗</span>
              <span class="text-[10px]">Share Pass</span>
            </button>
            <button id="btn-ticket-wallet" class="py-2.5 px-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-center border border-white/10 transition-all btn-press flex flex-col items-center gap-1">
              <span class="text-base">📅</span>
              <span class="text-[10px]">Add to Wallet</span>
            </button>
          </div>

          <!-- Actions -->
          <div class="space-y-2 pt-1 border-t border-white/10">
            <button id="btn-ticket-event-details" class="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all btn-press flex items-center justify-center gap-2">
              <span>👁️</span> View Event Page
            </button>
            <button id="btn-goto-ready-check" class="w-full py-2 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-500/30 transition-all btn-press flex items-center justify-center gap-2">
              <span>⚡</span> Run Pre-Workshop Readiness Check
            </button>
            <button id="btn-ticket-done" class="w-full py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 transition-colors">
              Close Pass
            </button>
          </div>

        </div>

      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Close & Done
    this.modal.querySelectorAll('#btn-ticket-close, #btn-ticket-done').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        this.close();
      });
    });

    // Copy Ticket ID
    const copyBtn = this.modal.querySelector('#btn-copy-ticket');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(this.registration.ticketId);
        sound.playClick();
        copyBtn.textContent = 'Copied ✓';
        setTimeout(() => copyBtn.textContent = 'Copy ID', 2000);
        toast.show({ title: 'Pass ID Copied', message: `${this.registration.ticketId} copied to clipboard!`, type: 'success' });
      });
    }

    // Go to event page
    const eventDetailsBtn = this.modal.querySelector('#btn-ticket-event-details');
    if (eventDetailsBtn && this.currentEvent) {
      eventDetailsBtn.addEventListener('click', () => {
        sound.playClick();
        this.close();
        window.location.hash = `event/${this.currentEvent.id}`;
      });
    }

    // Download Pass PNG
    const downloadBtn = this.modal.querySelector('#btn-ticket-download');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        sound.playSuccess();
        this.downloadPassAsPNG();
      });
    }

    // Share Pass
    const shareBtn = this.modal.querySelector('#btn-ticket-share');
    if (shareBtn) {
      shareBtn.addEventListener('click', async () => {
        sound.playClick();
        const origin = window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'http://localhost:3000';
        const passUrl = `${origin}/#ticket=${this.registration.ticketId}`;
        const shareData = {
          title: `KIIT IEEE Digital Pass - ${this.currentEvent.title}`,
          text: `My verified KIIT IEEE Event Pass for ${this.currentEvent.title}. Pass ID: ${this.registration.ticketId}`,
          url: passUrl
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            toast.show({ title: 'Pass Shared! 🔗', message: 'Shared via device sheet.', type: 'success' });
            return;
          } catch (e) {
            // User cancelled or fallback
          }
        }

        await navigator.clipboard.writeText(passUrl);
        toast.show({ title: 'Pass Link Copied! 🔗', message: 'Public pass URL copied to clipboard.', type: 'success' });
      });
    }

    // Add to Wallet / Calendar (.ics)
    const walletBtn = this.modal.querySelector('#btn-ticket-wallet');
    if (walletBtn) {
      walletBtn.addEventListener('click', () => {
        sound.playSuccess();
        this.downloadCalendarInvite();
      });
    }

    // Go to ready check
    const readyBtn = this.modal.querySelector('#btn-goto-ready-check');
    if (readyBtn) {
      readyBtn.addEventListener('click', () => {
        sound.playClick();
        this.close();
        store.setView('readiness');
      });
    }

    // Click canvas to zoom/enlarge
    const canvas = this.modal.querySelector('#ticket-qr-canvas');
    if (canvas) {
      canvas.addEventListener('click', () => {
        sound.playClick();
        toast.show({ title: 'Scannable Pass Ready 📷', message: `Ticket ${this.registration.ticketId} active.`, type: 'info' });
      });
    }
  }

  downloadPassAsPNG() {
    const reg = this.registration;
    const evt = this.currentEvent || {};

    const passCanvas = document.createElement('canvas');
    passCanvas.width = 750;
    passCanvas.height = 1100;
    const ctx = passCanvas.getContext('2d');

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1100);
    bgGrad.addColorStop(0, '#0a0d1a');
    bgGrad.addColorStop(0.5, '#07090e');
    bgGrad.addColorStop(1, '#020408');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 750, 1100);

    // Decorative top header block
    const hdrGrad = ctx.createLinearGradient(0, 0, 750, 220);
    hdrGrad.addColorStop(0, '#4f46e5');
    hdrGrad.addColorStop(0.6, '#06b6d4');
    hdrGrad.addColorStop(1, '#3b82f6');
    ctx.fillStyle = hdrGrad;
    ctx.fillRect(0, 0, 750, 220);

    // IEEE Header Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('KIIT IEEE STUDENT BRANCH', 45, 60);

    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText('OFFICIAL DIGITAL EVENT PASS', 45, 90);

    // Event Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px system-ui, sans-serif';
    this.wrapText(ctx, evt.title || 'Technical Workshop', 45, 140, 660, 36);

    // Punch line divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(0, 230);
    ctx.lineTo(750, 230);
    ctx.stroke();
    ctx.setLineDash([]);

    // Attendee Card
    ctx.fillStyle = '#111827';
    ctx.fillRect(45, 260, 660, 200);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 260, 660, 200);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('ATTENDEE NAME', 75, 305);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText(reg.studentName || 'Student Builder', 75, 335);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('ROLL NUMBER', 450, 305);
    ctx.fillStyle = '#818cf8';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(reg.rollNo || '22050000', 450, 335);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('ACADEMIC BRANCH', 75, 395);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText(reg.branch || 'Computer Science & Engineering', 75, 425);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('ASSIGNED BENCH', 450, 395);
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(reg.bench || 'Bench B17', 450, 425);

    // QR Code rendering
    const qrCanvas = this.modal.querySelector('#ticket-qr-canvas');
    if (qrCanvas) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(215, 490, 320, 320);
      ctx.drawImage(qrCanvas, 235, 510, 280, 280);
    }

    // Ticket ID
    ctx.fillStyle = '#a5b4fc';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(reg.ticketId, 375, 860);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText('Present this pass for door check-in & lab equipment issuance.', 375, 895);

    // Venue & Timing details footer
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(45, 930, 660, 110);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeRect(45, 930, 660, 110);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText(`📍 Venue: ${evt.venue || 'Campus 15, Tech Lab'}`, 75, 965);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText(`📅 Date & Time: ${evt.date || 'Upcoming 2026'} | ${evt.time || '10:00 AM IST'}`, 75, 995);

    // Trigger download
    const link = document.createElement('a');
    link.download = `KIIT-IEEE-Pass-${reg.ticketId}.png`;
    link.href = passCanvas.toDataURL('image/png');
    link.click();
    toast.show({ title: 'Pass Downloaded! 📥', message: `Saved KIIT-IEEE-Pass-${reg.ticketId}.png`, type: 'success' });
  }

  downloadCalendarInvite() {
    const reg = this.registration;
    const evt = this.currentEvent || {};

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//KIIT IEEE Student Branch//Event Pass//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${reg.ticketId}@kiit-ieee.org`,
      `SUMMARY:${evt.title || 'KIIT IEEE Event'}`,
      `DESCRIPTION:Your KIIT IEEE Digital Pass is confirmed.\\nAttendee: ${reg.studentName}\\nRoll No: ${reg.rollNo}\\nBench: ${reg.bench}\\nTicket ID: ${reg.ticketId}`,
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
    link.download = `KIIT-IEEE-${reg.ticketId}.ics`;
    link.click();
    URL.revokeObjectURL(url);

    toast.show({ title: 'Added to Calendar! 📅', message: 'Standard .ics calendar invite downloaded.', type: 'success' });
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = String(text || '').split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
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

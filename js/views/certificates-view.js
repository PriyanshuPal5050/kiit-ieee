/**
 * KIIT IEEE Platform - Certificates Vault & Public Verification
 * High-resolution canvas rendering, PNG export, and public cryptographic validation portal.
 */

import { store } from '../state.js';
import { CertificateService } from '../services/certificate-service.js';
import { sound } from '../services/audio-service.js';
import { toast } from '../components/toast.js';

export class CertificatesView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedCert = store.certificates[0] || null;
    this.searchedCert = null;
    this.searchQuery = '';
  }

  render() {
    if (!this.container) return;
    const certs = store.certificates;

    this.container.innerHTML = `
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-10">
        
        <!-- Header -->
        <div class="pb-4 border-b border-white/10">
          <div class="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">
            <span>📜</span> Verified Academic Credentials
          </div>
          <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight">Certificates & Public Verification</h1>
          <p class="text-sm text-slate-400 mt-1 max-w-xl">
            Official cryptographically verifiable certificates issued by KIIT IEEE Student Branch. High-resolution canvas rendering with cryptographic integrity.
          </p>
        </div>

        <!-- Public Verification Search Bar -->
        <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 space-y-4">
          <div class="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <span>🔍</span> Public Credential Registry
          </div>
          <h3 class="text-lg font-bold text-white">Verify Certificate Authenticity</h3>
          <p class="text-xs text-slate-400">Enter a Certificate ID to verify its issuance against the KIIT IEEE official ledger.</p>

          <div class="flex flex-col sm:flex-row gap-3 pt-1">
            <input 
              type="text" 
              id="cert-verify-input" 
              placeholder="e.g. CERT-IEEE-2026-WEB01 or KIIT-IEEE-2026-AI99" 
              value="${this.searchQuery}"
              class="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
            />
            <button id="btn-run-verify-cert" class="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all btn-press flex items-center justify-center gap-2">
              <span>✓</span> Verify Credential
            </button>
          </div>

          <!-- Quick Test Badges -->
          <div class="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
            <span>Try searching:</span>
            ${certs.map(c => `
              <button class="btn-sample-cert font-mono text-cyan-300 bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded border border-white/10" data-cid="${c.id}">
                ${c.id}
              </button>
            `).join('')}
          </div>

          <!-- Verification Result Card -->
          <div id="cert-verification-result" class="hidden"></div>
        </div>

        <!-- Certificate Interactive Canvas Preview Showcase -->
        ${this.selectedCert ? `
          <div class="space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 class="text-lg font-bold text-white">Official Certificate Canvas Viewer</h3>
                <p class="text-xs text-slate-400 font-mono">ID: ${this.selectedCert.id} • ${this.selectedCert.eventName}</p>
              </div>

              <!-- Export Controls -->
              <div class="flex items-center gap-2">
                <button id="btn-download-cert-png" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all btn-press flex items-center gap-2">
                  <span>📥</span> Download High-Res (PNG)
                </button>
                <button id="btn-copy-cert-link" class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition-colors btn-press">
                  Copy Verification Link
                </button>
              </div>
            </div>

            <!-- Canvas Container -->
            <div class="p-2 sm:p-4 rounded-3xl bg-slate-950 border border-white/10 shadow-2xl overflow-hidden flex items-center justify-center">
              <canvas id="active-certificate-canvas" class="w-full max-w-4xl h-auto rounded-2xl shadow-2xl border border-amber-500/30"></canvas>
            </div>
          </div>
        ` : ''}

        <!-- My Earned Certificates Grid -->
        <div class="space-y-4">
          <h3 class="text-base font-bold text-white">My Earned Credentials (${certs.length})</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${certs.map(c => `
              <div class="glass-card p-5 rounded-2xl border border-white/10 space-y-3 cursor-pointer hover:border-amber-500/40 transition-all btn-select-cert ${this.selectedCert?.id === c.id ? 'border-amber-500/40 bg-amber-950/10' : ''}" data-cid="${c.id}">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">📜</span>
                    <div>
                      <h4 class="text-sm font-bold text-white">${c.eventName}</h4>
                      <span class="text-[10px] text-slate-400 font-mono">${c.id}</span>
                    </div>
                  </div>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Verified</span>
                </div>
                <div class="text-xs text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
                  <span>Issued: ${c.issueDate}</span>
                  <span class="text-amber-400 font-medium">${c.grade}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    this.bindEvents();

    // Render Canvas
    requestAnimationFrame(() => {
      if (this.selectedCert) {
        const canvas = document.getElementById('active-certificate-canvas');
        if (canvas) {
          CertificateService.renderCertificate(canvas, this.selectedCert);
        }
      }
    });
  }

  bindEvents() {
    // Verify search
    const verifyBtn = this.container.querySelector('#btn-run-verify-cert');
    const input = this.container.querySelector('#cert-verify-input');
    if (verifyBtn && input) {
      verifyBtn.addEventListener('click', () => {
        this.handleVerify(input.value.trim());
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleVerify(input.value.trim());
        }
      });
    }

    // Sample badges
    this.container.querySelectorAll('.btn-sample-cert').forEach(btn => {
      btn.addEventListener('click', () => {
        const cid = btn.getAttribute('data-cid');
        const inp = this.container.querySelector('#cert-verify-input');
        if (inp) inp.value = cid;
        sound.playClick();
        this.handleVerify(cid);
      });
    });

    // Select certificate card
    this.container.querySelectorAll('.btn-select-cert').forEach(btn => {
      btn.addEventListener('click', () => {
        const cid = btn.getAttribute('data-cid');
        this.selectedCert = store.certificates.find(c => c.id === cid);
        sound.playClick();
        this.render();
      });
    });

    // Download PNG
    const dlBtn = this.container.querySelector('#btn-download-cert-png');
    if (dlBtn && this.selectedCert) {
      dlBtn.addEventListener('click', () => {
        const canvas = document.getElementById('active-certificate-canvas');
        if (canvas) {
          sound.playSuccess();
          CertificateService.downloadCanvas(canvas, `${this.selectedCert.id}-${store.user.rollNo}.png`);
          toast.show({ title: 'Certificate Downloaded', message: 'High-resolution PNG saved to your downloads!', type: 'success' });
        }
      });
    }

    // Copy verification link
    const copyLinkBtn = this.container.querySelector('#btn-copy-cert-link');
    if (copyLinkBtn && this.selectedCert) {
      copyLinkBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(`${window.location.origin}#verify=${this.selectedCert.id}`);
        sound.playClick();
        copyLinkBtn.textContent = 'Link Copied ✓';
        setTimeout(() => copyLinkBtn.textContent = 'Copy Verification Link', 2000);
        toast.show({ title: 'Verification Link Copied', message: 'Public verification URL copied to clipboard.', type: 'success' });
      });
    }
  }

  handleVerify(query) {
    if (!query) return;
    const resultBox = this.container.querySelector('#cert-verification-result');
    if (!resultBox) return;

    // Search certificates or registrations
    const foundCert = store.certificates.find(c => c.id.toUpperCase() === query.toUpperCase());
    const foundReg = store.registrations.find(r => r.ticketId.toUpperCase() === query.toUpperCase());

    resultBox.classList.remove('hidden');

    if (foundCert) {
      sound.playSuccess();
      resultBox.className = 'p-5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-100 space-y-2';
      resultBox.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 font-bold text-sm text-emerald-300">
            <span class="text-lg">✓</span> CRYPTOGRAPHICALLY VERIFIED CREDENTIAL
          </div>
          <span class="text-xs font-mono text-emerald-400">STATUS: AUTHENTIC</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-emerald-500/20">
          <div><span class="text-emerald-400/80">Recipient:</span> <strong class="text-white">${foundCert.studentName}</strong></div>
          <div><span class="text-emerald-400/80">Roll Number:</span> <span class="font-mono text-white">${foundCert.rollNo}</span></div>
          <div><span class="text-emerald-400/80">Event:</span> <strong class="text-cyan-300">${foundCert.eventName}</strong></div>
          <div><span class="text-emerald-400/80">Issue Date:</span> <span class="text-white">${foundCert.issueDate}</span></div>
          <div class="col-span-2 font-mono text-[10px] text-emerald-300/80">Ledger Hash: ${foundCert.verificationHash}</div>
        </div>
      `;
    } else if (foundReg) {
      sound.playSuccess();
      resultBox.className = 'p-5 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-100 space-y-2';
      resultBox.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 font-bold text-sm text-cyan-300">
            <span class="text-lg">✓</span> VERIFIED ATTENDEE TICKET
          </div>
          <span class="text-xs font-mono text-cyan-400">ACTIVE PASS</span>
        </div>
        <div class="text-xs space-y-1 pt-1">
          <div>Student: <strong>${foundReg.studentName}</strong> (${foundReg.rollNo})</div>
          <div>Event: <strong>${foundReg.eventName || 'Workshop'}</strong></div>
          <div>Attendance: <strong>${foundReg.attended ? 'Attended ✓' : 'Confirmed'}</strong></div>
        </div>
      `;
    } else {
      sound.playError();
      resultBox.className = 'p-5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-100 space-y-1';
      resultBox.innerHTML = `
        <div class="flex items-center gap-2 font-bold text-sm text-rose-300">
          <span>✕</span> CREDENTIAL NOT FOUND
        </div>
        <p class="text-xs">No official KIIT IEEE credential or ticket found matching "${query}". Please check the ID and try again.</p>
      `;
    }
  }
}

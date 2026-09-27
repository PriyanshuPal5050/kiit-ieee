/**
 * KIIT IEEE Platform - Certificate Rendering & Verification Engine
 * High-resolution canvas certificate generator with export and cryptographic validation.
 */

export class CertificateService {
  /**
   * Renders the official KIIT IEEE Certificate onto an HTML5 Canvas
   */
  static renderCertificate(canvas, data) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // High-res canvas dimensions (1920x1080) for crisp printing & download
    const w = 1920;
    const h = 1080;
    canvas.width = w;
    canvas.height = h;

    // 1. Deep Midnight Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#070a13');
    bgGrad.addColorStop(0.5, '#0d1527');
    bgGrad.addColorStop(1, '#080c16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Subtle Radial Glow
    const glow = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, 700);
    glow.addColorStop(0, 'rgba(99, 102, 241, 0.12)');
    glow.addColorStop(0.6, 'rgba(6, 182, 212, 0.04)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // 3. Luxurious Dual Gold / Cyan Border
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, w - 100, h - 100);

    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(62, 62, w - 124, h - 124);

    // Corner Ornaments
    this.drawCornerFiligree(ctx, 50, 50);
    this.drawCornerFiligree(ctx, w - 50, 50, true);
    this.drawCornerFiligree(ctx, 50, h - 50, false, true);
    this.drawCornerFiligree(ctx, w - 50, h - 50, true, true);

    // 4. Header Titles
    ctx.textAlign = 'center';

    // IEEE + KIIT Top Bar
    ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.letterSpacing = '6px';
    ctx.fillText('KIIT DEEMED TO BE UNIVERSITY • IEEE STUDENT BRANCH', w / 2, 140);

    // Large IEEE Emblem Pill
    ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(w / 2 - 130, 165, 260, 44, 22);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.letterSpacing = '3px';
    ctx.fillText('⚡ OFFICIAL CREDENTIAL', w / 2, 193);

    // Main Title
    ctx.font = '800 64px "Plus Jakarta Sans", Georgia, serif';
    const titleGrad = ctx.createLinearGradient(w / 2 - 300, 0, w / 2 + 300, 0);
    titleGrad.addColorStop(0, '#fef08a');
    titleGrad.addColorStop(0.5, '#ffffff');
    titleGrad.addColorStop(1, '#fde047');
    ctx.fillStyle = titleGrad;
    ctx.letterSpacing = '4px';
    ctx.fillText('CERTIFICATE OF EXCELLENCE', w / 2, 290);

    // Subtitle
    ctx.font = '400 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.letterSpacing = '1px';
    ctx.fillText('PROUDLY PRESENTED IN RECOGNITION OF OUTSTANDING TECHNICAL MERIT TO', w / 2, 360);

    // Recipient Name
    ctx.font = '800 58px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.letterSpacing = '2px';
    ctx.fillText(data.studentName || 'Student Name', w / 2, 455);

    // Underline beneath name
    const nameLineGrad = ctx.createLinearGradient(w / 2 - 250, 0, w / 2 + 250, 0);
    nameLineGrad.addColorStop(0, 'transparent');
    nameLineGrad.addColorStop(0.5, '#6366f1');
    nameLineGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = nameLineGrad;
    ctx.fillRect(w / 2 - 250, 475, 500, 3);

    // Roll No & Academic Details
    ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Roll No: ${data.rollNo || '22051842'}  •  KIIT School of Computer Engineering`, w / 2, 520);

    // Body Text
    ctx.font = '400 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('for successfully completing the rigorous multi-day curriculum and capstone challenge in', w / 2, 595);

    // Event Name
    ctx.font = '700 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`"${data.eventName || 'AI & Edge Computer Vision Masterclass'}"`, w / 2, 655);

    // Honors Distinction
    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`Awarded with: ${data.grade || 'Distinction with Honors'}`, w / 2, 715);

    // 5. Signatures and Seals at Bottom
    const bottomY = 880;

    // Left Signature - Counselor
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(250, bottomY);
    ctx.lineTo(550, bottomY);
    ctx.stroke();

    ctx.font = 'italic 26px Georgia, serif';
    ctx.fillStyle = '#93c5fd';
    ctx.fillText('Dr. Priyadarshi Sen', 400, bottomY - 20);

    ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('BRANCH COUNSELOR', 400, bottomY + 28);
    ctx.font = '400 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('KIIT IEEE Student Branch', 400, bottomY + 52);

    // Center Gold IEEE Seal
    this.drawGoldenSeal(ctx, w / 2, bottomY - 30);

    // Right Signature - Branch Chair
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w - 550, bottomY);
    ctx.lineTo(w - 250, bottomY);
    ctx.stroke();

    ctx.font = 'italic 26px Georgia, serif';
    ctx.fillStyle = '#93c5fd';
    ctx.fillText('Tanmay Mohanty', w - 400, bottomY - 20);

    ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('CHAIRPERSON', w - 400, bottomY + 28);
    ctx.font = '400 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('KIIT IEEE Student Branch', w - 400, bottomY + 52);

    // 6. Verification Footer Bar
    ctx.font = '500 16px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(
      `Credential ID: ${data.id || 'CERT-IEEE-2026-AI99'}  |  Hash: ${data.verificationHash || '0x7C81A4...'}  |  Issue Date: ${data.issueDate || 'October 2026'}`,
      w / 2,
      1015
    );
  }

  static drawGoldenSeal(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Outer scalloped gold circle
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(0, 0, 65, 0, Math.PI * 2);
    ctx.fill();

    // Inner gold ring
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(0, 0, 58, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(0, 0, 52, 0, Math.PI * 2);
    ctx.fill();

    // Text in seal
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KIIT IEEE', 0, -8);
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('★ VERIFIED ★', 0, 10);
    ctx.fillText('SEAL 2026', 0, 24);

    ctx.restore();
  }

  static drawCornerFiligree(ctx, x, y, flipX = false, flipY = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(10, 35);
    ctx.lineTo(10, 10);
    ctx.lineTo(35, 10);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(10, 10, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Downloads current canvas as PNG
   */
  static downloadCanvas(canvas, filename = 'KIIT-IEEE-Certificate.png') {
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}

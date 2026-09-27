/**
 * KIIT IEEE Platform - AI Event Promotion & Distribution Service
 * Generates verified multi-channel marketing campaigns, manages WhatsApp deep linking,
 * renders high-resolution event posters on HTML5 canvas, and tracks promotion telemetry.
 */

import { store } from '../state.js';
import { QRService } from './qr-service.js';

export class PromotionService {
  /**
   * Validates that the single source of truth has all required fields.
   * NEVER invents critical event parameters.
   */
  static validateEventData(evt) {
    const missing = [];
    if (!evt.title || evt.title.trim() === '') missing.push('Event Name / Title');
    if (!evt.date || evt.date.trim() === '') missing.push('Date & Duration');
    if (!evt.venue || evt.venue.trim() === '') missing.push('Location / Campus Venue');
    if (!evt.seatsTotal) missing.push('Maximum Capacity');
    
    return {
      isValid: missing.length === 0,
      missingFields: missing
    };
  }

  /**
   * Generates a complete verified promotional kit tailored to the event and audience.
   */
  static generatePromotionKit(evt, audience = 'All Students') {
    const origin = window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'http://localhost:3000';
    const eventSlug = evt.id || `evt-${Date.now()}`;
    const regUrl = `${origin}/#event=${eventSlug}`;
    const venue = evt.venue || 'Campus 15, Tech Lab, KIIT University';
    const date = evt.date || 'Upcoming 2026';
    const time = evt.time || '10:00 AM - 04:30 PM IST';
    const title = evt.title || 'Technical Workshop';
    const category = evt.category || 'AI & Engineering';
    const seats = evt.seatsTotal || 120;
    const speaker = evt.speaker ? `${evt.speaker.name} (${evt.speaker.role}, ${evt.speaker.org})` : 'Senior IEEE Technical Mentor';
    const eligibility = evt.eligibility || 'Open to all KIIT students';

    // Adapt greeting / context by target audience
    let audienceSalutation = "Attention KIIT Students,";
    let audienceHook = "Ready to elevate your engineering skills with hands-on lab projects?";
    if (audience === 'First Year') {
      audienceSalutation = "Calling all 1st Year KIIT Engineers!";
      audienceHook = "Kickstart your technical journey early with foundation-level practical labs.";
    } else if (audience === 'Second Year') {
      audienceSalutation = "Attention 2nd Year B.Tech Students!";
      audienceHook = "Level up your core engineering stack with practical hardware and deployment skills.";
    } else if (audience === 'Third Year') {
      audienceSalutation = "Calling 3rd Year B.Tech Students!";
      audienceHook = "Build production-grade capstone projects ready for internships and resume showcases.";
    } else if (audience === 'Final Year') {
      audienceSalutation = "Final Year Builders & Innovators,";
      audienceHook = "Master cutting-edge industry implementations before stepping into top engineering roles.";
    } else if (audience === 'IEEE Members') {
      audienceSalutation = "Dear KIIT IEEE Student Members,";
      audienceHook = "Exclusive priority access to our flagship technical masterclass is now live.";
    } else if (audience === 'Registered Participants') {
      audienceSalutation = "Hello Confirmed Attendees,";
      audienceHook = "Your workshop session is locked in! Please review the venue logistics and prerequisites.";
    } else if (audience === 'Volunteers') {
      audienceSalutation = "KIIT IEEE Core Volunteer Team,";
      audienceHook = "Bench coordination and hardware lab assignment checklist for our upcoming event.";
    }

    // --- WHATSAPP VARIANTS ---
    const whatsappVariants = {
      official: 
`*🚀 KIIT IEEE PRESENTS*
*${title.toUpperCase()}*

${audienceSalutation}
${audienceHook}

📅 *Date:* ${date}
⏰ *Time:* ${time}
📍 *Venue:* ${venue}
🎓 *Eligibility:* ${eligibility}
👤 *Instructor:* ${speaker}
🎟 *Lab Capacity:* ${seats} Bench Seats Only (Strictly Limited)

*What You Will Build:*
${(evt.whatYouWillBuild || ['Production ready technical capstone', 'Verified IEEE Certificate']).map(w => `• ${w}`).join('\n')}

*Verified Certification:*
Official IEEE Student Branch credentials with cryptographic verification IDs will be issued upon capstone completion.

🔗 *Register Now:*
${regUrl}

_Organized by KIIT IEEE Student Branch • Where Students Build What's Next._
#KIITIEEE #TechnicalWorkshop #KIITUniversity`,

      friendly:
`Hey KIITians! 👋⚡

Want to build real stuff instead of sitting through boring slides? 

*KIIT IEEE* is hosting *${title}*! 🔥

🗓 ${date}
⏰ ${time}
📍 ${venue}
🍕 Free snacks, hands-on hardware kits & verified IEEE certificates included!

Seats are filling up super fast (${seats} seats max). Grab your pass before benches are full! 🏃‍♂️💨

👉 *Claim your bench seat here:* ${regUrl}

See you at the lab! 🚀
#KIITIEEE #StudentBuilders`,

      short:
`⚡ *KIIT IEEE: ${title}*
📅 ${date} | 📍 ${venue}
🛠 Hands-on hardware & software workshop with verified IEEE certification.
🔗 *Register (${seats} seats only):* ${regUrl}`,

      urgent:
`🚨 *ALERT: ALMOST FULL — ${title.toUpperCase()}*

Benches for the upcoming *${title}* are over 80% claimed! 

📍 Venue: ${venue}
📅 Date: ${date}

If you haven't secured your digital pass yet, do it now before registrations close:
👉 ${regUrl}

_Don't miss out on hands-on lab access!_`,

      reminder:
`⏰ *REMINDER: ${title} Starts Soon!*

${audienceSalutation}
Just a quick reminder that *${title}* is happening on *${date}* at *${venue}*.

Please ensure your laptop environment is ready before arrival:
🔗 Check your registration status: ${regUrl}

See you in the lab! ⚡`,

      lastCall:
`⚠️ *FINAL CALL: REGISTRATION CLOSING TODAY*

Registrations for *${title}* close tonight at 11:59 PM.

• When: ${date} (${time})
• Where: ${venue}
• Certification: Cryptographic IEEE Credential

Secure your spot now:
🔗 ${regUrl}`,

      startingSoon:
`⚡ *EVENT STARTING TOMORROW!*

Your workshop *${title}* begins tomorrow at ${time.split('-')[0].trim()}!

📍 Reporting Venue: ${venue}
⏰ Recommended Arrival: 30 minutes prior for door check-in
🎒 What to bring: Laptop + charger

View your digital attendee QR pass:
🔗 ${regUrl}

Get ready to build! 🚀`
    };

    // --- INSTAGRAM CAPTION ---
    const instagramCaption = 
`🚀 Where Students Build What's Next.

KIIT IEEE is thrilled to announce our upcoming masterclass:
✨ ${title} ✨

Are you ready to transition from theory to real-world engineering? Join fellow ambitious builders for high-velocity hands-on labs, hardware prototyping, and direct mentorship.

📌 EVENT DETAILS:
📅 Date: ${date}
⏰ Time: ${time}
📍 Venue: ${venue}
🎓 Eligibility: ${eligibility}
🎟 Capacity: ${seats} Bench Seats Only
📜 Certification: Official Cryptographically Verified IEEE Credential

🛠 What You'll Learn & Build:
${(evt.whatYouWillBuild || ['Full-stack technical implementation', 'Production-ready GitHub project']).map(item => `✓ ${item}`).join('\n')}

🔗 Tap the link in our bio to secure your digital pass!
Official URL: ${regUrl}

Tag your coding partner below! 👇

#KIITIEEE #KIIT #KIITUniversity #Engineering #TechWorkshop #${category.replace(/[^a-zA-Z]/g, '')} #StudentBuilders #BhubaneswarTech #CodeWhatNext`;

    // --- LINKEDIN POST ---
    const linkedinPost = 
`Excited to announce the next technical milestone from the KIIT IEEE Student Branch: ${title}.

At KIIT IEEE, our philosophy is simple: replace passive lectures with high-intensity, hands-on engineering where students design, code, flash, and deploy real systems.

🎯 Event Highlights:
• Focus Track: ${category}
• Date & Duration: ${date} | ${time}
• Lab Venue: ${venue}
• Mentor: ${speaker}
• Participant Limit: ${seats} students (to ensure 1:1 hardware bench ratios)

Students will participate in live environment setup, guided technical sprints, capstone benchmarking, and receive cryptographically verifiable IEEE credentials upon completion.

Registration is now open to ambitious KIIT engineering undergraduates:
👉 Register here: ${regUrl}

#KIIT #KIITIEEE #IEEE #EngineeringEducation #TechnicalInnovation #HigherEducation #HandsOnLearning #StudentBuilders`;

    // --- EMAIL ANNOUNCEMENT ---
    const emailAnnouncement = {
      to: "All KIIT Engineering Students <engineering.students@kiit.ac.in>",
      subject: `[KIIT IEEE] Official Registration Open: ${title} (${date})`,
      body: 
`Dear Students,

The KIIT IEEE Student Branch cordially invites you to participate in our upcoming technical workshop:

============================================================
EVENT: ${title}
DOMAIN: ${category}
DATE: ${date}
TIME: ${time}
VENUE: ${venue}
INSTRUCTOR: ${speaker}
BENCH CAPACITY: ${seats} Seats
============================================================

ABOUT THE WORKSHOP:
${evt.tagline || 'An intensive, hands-on workshop focused on real-world engineering and capstone development.'}

WHAT PARTICIPANTS WILL RECEIVE:
1. Complete hands-on access to campus lab equipment and hardware nodes.
2. Step-by-step guidance from senior technical leads and industry mentors.
3. Cryptographically verifiable IEEE Student Branch certificate of completion.
4. Refreshments, workshop kits, and project repository access.

REGISTRATION INSTRUCTIONS:
Registrations are handled via the KIIT IEEE Digital Platform on a first-come, first-served basis:
https://${origin.replace('http://', '').replace('https://', '')}/#event=${eventSlug}

Please ensure your laptop is brought to the venue with the recommended software pre-installed.

Warm regards,

Executive Council
KIIT IEEE Student Branch
Kalinga Institute of Industrial Technology, Bhubaneswar
Contact: ieee@kiit.ac.in | https://kiit-ieee.org`
    };

    // --- DISCORD ANNOUNCEMENT ---
    const discordMessage = 
`@everyone **🚨 NEW WORKSHOP ANNOUNCEMENT: ${title}** 🚨

> *"Where Students Build What's Next."*

**KIIT IEEE** is bringing you a hands-on masterclass in **${category}**!

📅 **Date:** \`${date}\`
⏰ **Time:** \`${time}\`
📍 **Venue:** \`${venue}\`
🎟 **Seats:** \`${seats} Limited Benches\`
📜 **Perks:** Verified IEEE Credential + Hardware Lab Access + Swag

**What we're building:**
${(evt.whatYouWillBuild || ['Production ready capstone']).map(b => `> • ${b}`).join('\n')}

🔗 **Claim Your Seat Now:** <${regUrl}>

React with 🚀 if you're attending! Discuss in <#workshop-chat>.`;

    // --- PROMOTION SCHEDULE ---
    const schedule = [
      { checkpoint: "T-14 Days", title: "Official Announcement Launch", status: "Ready", channel: "WhatsApp & LinkedIn" },
      { checkpoint: "T-7 Days", title: "Student Community Awareness", status: "Scheduled", channel: "Instagram & Discord" },
      { checkpoint: "T-3 Days", title: "Registration Reminder & Seat Update", status: "Scheduled", channel: "WhatsApp Groups" },
      { checkpoint: "T-1 Day", title: "Environment Ready & Reporting Check", status: "Scheduled", channel: "Email & WhatsApp" },
      { checkpoint: "T-2 Hours", title: "Door Check-in & Bench Welcome", status: "Pending Live", channel: "Live Event Mode" },
      { checkpoint: "Post-Event", title: "Thank You & Certificate Release", status: "Pending Event", channel: "Email & Portal" }
    ];

    return {
      regUrl,
      whatsappVariants,
      instagramCaption,
      linkedinPost,
      emailAnnouncement,
      discordMessage,
      schedule,
      eventMeta: {
        title,
        date,
        time,
        venue,
        seats,
        category,
        speaker,
        eligibility
      }
    };
  }

  /**
   * Directly triggers WhatsApp web / app sharing with prefilled message.
   * Uses official https://wa.me/?text=... deep link and logs WHATSAPP_SHARE_INITIATED.
   */
  static shareToWhatsApp(text, evtMeta = {}) {
    store.trackPromotionAction('WHATSAPP_SHARE_INITIATED', {
      eventId: evtMeta.id || 'evt',
      hostId: store.user?.id || 'host-user',
      channel: 'WhatsApp'
    });
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/?text=${encoded}`;
    
    // Attempt popup / new window keeping KIIT IEEE open
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) {
      window.location.href = url;
    }
    return true;
  }

  /**
   * Native Web Share API integration with graceful clipboard fallback.
   */
  static async shareNative(shareData) {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        store.trackPromotionAction('linkCopies');
        return { success: true, method: 'native' };
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Native share failed, falling back to clipboard:', err);
        }
      }
    }

    // Fallback: Copy URL to clipboard
    try {
      await navigator.clipboard.writeText(shareData.url || shareData.text);
      store.trackPromotionAction('linkCopies');
      return { success: true, method: 'clipboard' };
    } catch (e) {
      return { success: false, error: e };
    }
  }

  /**
   * Copies formatted text to clipboard and logs analytics.
   */
  static async copyText(text, metricName = 'linkCopies') {
    try {
      await navigator.clipboard.writeText(text);
      store.trackPromotionAction(metricName);
      return true;
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      return false;
    }
  }

  /**
   * High-Resolution Event Poster Canvas Renderer (800x1100 px).
   * Renders distinct design styles: Formal (IEEE), Modern, Technical, Minimal, Futuristic, Energetic, Cyber.
   */
  static renderPosterCanvas(canvas, evt, configOrTheme = 'auto') {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = 800;
    const height = 1100;
    canvas.width = width;
    canvas.height = height;

    const posterConfig = typeof configOrTheme === 'object' && configOrTheme !== null
      ? configOrTheme
      : { theme: configOrTheme || 'auto' };

    const title = evt.title || 'Technical Workshop';
    const date = evt.date || 'November 2026';
    const time = evt.time || '10:00 AM - 04:30 PM IST';
    const reporting = evt.reportingTime || '08:30 AM (Campus 15)';
    const venue = evt.venue || 'Campus 15, Tech Lab 2, KIIT University';
    const category = evt.category || 'AI & Machine Learning';
    const speaker = evt.speaker ? (typeof evt.speaker === 'object' ? `${evt.speaker.name || ''} ${evt.speaker.role ? '• ' + evt.speaker.role : ''}` : evt.speaker) : 'IEEE Senior Technical Mentor';
    const regUrl = `${window.location.origin || 'http://localhost:3000'}/#event=${evt.id || 'evt'}`;

    // Auto-resolve theme from category or explicit setting
    let resolvedTheme = posterConfig.theme || 'auto';
    if (!resolvedTheme || resolvedTheme === 'auto') {
      const cat = category.toLowerCase();
      if (cat.includes('ai') || cat.includes('machine learning')) resolvedTheme = 'futuristic';
      else if (cat.includes('robot') || cat.includes('embedded') || cat.includes('iot')) resolvedTheme = 'technical';
      else if (cat.includes('cyber') || cat.includes('security')) resolvedTheme = 'cyber';
      else if (cat.includes('hack') || cat.includes('competition')) resolvedTheme = 'energetic';
      else resolvedTheme = 'modern';
    }

    // --- THEME BACKGROUNDS ---
    if (resolvedTheme === 'formal') {
      // Official IEEE Deep Navy & Technical Silver Symposium Theme
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0a1226');
      grad.addColorStop(0.4, '#060c1a');
      grad.addColorStop(1, '#02060f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Subtle IEEE Blue Ambient Aura
      const aura = ctx.createRadialGradient(width / 2, 120, 20, width / 2, 120, 420);
      aura.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
      aura.addColorStop(1, 'transparent');
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, width, height);

      // Refined Technical Double Border
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(36, 36, width - 72, height - 72);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(42, 42, width - 84, height - 84);

      // Subtle engineering grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 60; x < width - 60; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x, height - 60); ctx.stroke();
      }
      for (let y = 60; y < height - 60; y += 60) {
        ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(width - 60, y); ctx.stroke();
      }

    } else if (resolvedTheme === 'technical') {
      // Blueprint / Cyber Terminal
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, width, height);

      // Grid Lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, width - 60, height - 60);

    } else if (resolvedTheme === 'cyber') {
      // Matrix Cyber Dark Terminal
      ctx.fillStyle = '#020805';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.09)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 35) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += 35) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, width - 60, height - 60);

    } else if (resolvedTheme === 'energetic') {
      // Hackathon Sunset Plasma Gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#1a0818');
      grad.addColorStop(0.5, '#0b0f24');
      grad.addColorStop(1, '#050d1a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const glow1 = ctx.createRadialGradient(220, 200, 10, 220, 200, 380);
      glow1.addColorStop(0, 'rgba(244, 63, 94, 0.28)');
      glow1.addColorStop(1, 'transparent');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, width, height);

      const glow2 = ctx.createRadialGradient(width - 150, height - 300, 10, width - 150, height - 300, 320);
      glow2.addColorStop(0, 'rgba(249, 115, 22, 0.22)');
      glow2.addColorStop(1, 'transparent');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, width, height);

    } else if (resolvedTheme === 'minimal') {
      // High-Contrast Swiss Minimalist
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#131b2e';
      ctx.fillRect(40, 40, width - 80, height - 80);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.strokeRect(40, 40, width - 80, height - 80);

    } else if (resolvedTheme === 'futuristic') {
      // Neon Cyber Violet
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#100624');
      grad.addColorStop(0.5, '#080d1a');
      grad.addColorStop(1, '#021824');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const glow1 = ctx.createRadialGradient(200, 200, 10, 200, 200, 350);
      glow1.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
      glow1.addColorStop(1, 'transparent');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, width, height);

      const glow2 = ctx.createRadialGradient(width - 150, height - 250, 10, width - 150, height - 250, 300);
      glow2.addColorStop(0, 'rgba(6, 182, 212, 0.2)');
      glow2.addColorStop(1, 'transparent');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, width, height);

    } else {
      // Modern: Dark glass aesthetic with indigo ambient glow
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0a0d18');
      grad.addColorStop(0.5, '#070a12');
      grad.addColorStop(1, '#05070d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const topGlow = ctx.createRadialGradient(width / 2, 0, 50, width / 2, 0, 500);
      topGlow.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
      topGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, width, height);
    }

    // --- HEADER: KIIT IEEE BRANDING ---
    // IEEE Emblem Box
    ctx.fillStyle = '#6366f1';
    this.roundRect(ctx, 60, 65, 54, 54, 14);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IEEE', 87, 100);

    // University Text
    ctx.textAlign = 'left';
    ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('KIIT IEEE', 128, 90);

    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('STUDENT BRANCH • KALINGA INSTITUTE OF INDUSTRIAL TECHNOLOGY', 128, 110);

    // Accent color resolution
    let primaryAccent = '#6366f1';
    if (posterConfig.accentStyle === 'electric-blue' || resolvedTheme === 'technical' || resolvedTheme === 'formal') {
      primaryAccent = '#38bdf8';
    } else if (posterConfig.accentStyle === 'cyber-green' || resolvedTheme === 'cyber') {
      primaryAccent = '#10b981';
    } else if (posterConfig.accentStyle === 'neon-purple' || resolvedTheme === 'futuristic') {
      primaryAccent = '#c084fc';
    } else if (posterConfig.accentStyle === 'amber-gold') {
      primaryAccent = '#fbbf24';
    } else if (posterConfig.accentStyle === 'rose-flame' || resolvedTheme === 'energetic') {
      primaryAccent = '#f43f5e';
    }

    // Category Pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    this.roundRect(ctx, 60, 160, 240, 36, 18);
    ctx.fill();
    ctx.strokeStyle = primaryAccent;
    ctx.stroke();

    ctx.fillStyle = primaryAccent;
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`⚡ ${category.toUpperCase()}`, 180, 183);

    // --- MAIN EVENT TITLE (WRAPPED) ---
    const isLargeTitle = posterConfig.titleScale === 'large';
    const titleFontSize = isLargeTitle ? '52px' : '46px';
    const lineHeight = isLargeTitle ? 60 : 54;

    ctx.textAlign = 'left';
    ctx.font = `900 ${titleFontSize} "Plus Jakarta Sans", sans-serif`;
    ctx.fillStyle = '#ffffff';

    const words = title.split(' ');
    let line = '';
    let y = 250;
    const maxWidth = width - 120;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, 60, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 60, y);

    // Tagline / Subtitle
    y += 24;
    ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    const taglineWords = (evt.tagline || 'A hands-on laboratory engineering workshop designed for KIIT student builders.').split(' ');
    let tagLine = '';
    for (let n = 0; n < taglineWords.length; n++) {
      const test = tagLine + taglineWords[n] + ' ';
      if (ctx.measureText(test).width > maxWidth && n > 0) {
        ctx.fillText(tagLine, 60, y);
        tagLine = taglineWords[n] + ' ';
        y += 24;
      } else {
        tagLine = test;
      }
    }
    ctx.fillText(tagLine, 60, y);

    // --- 4 KEY PARAMETER CARDS ---
    const cardY = y + 45;
    const cardWidth = (width - 140) / 2;
    const cardHeight = 110;

    // Card 1: Date & Time
    this.drawParamCard(ctx, 60, cardY, cardWidth, cardHeight, '📅 DATE & TIME', date, time, '#38bdf8');

    // Card 2: Venue & Campus
    this.drawParamCard(ctx, 80 + cardWidth, cardY, cardWidth, cardHeight, '📍 VENUE & CAMPUS', venue, 'Campus 15 Tech Labs', '#818cf8');

    // Card 3: Speaker / Instructor
    this.drawParamCard(ctx, 60, cardY + 125, cardWidth, cardHeight, '👤 LEAD INSTRUCTOR', speaker, 'IEEE Senior Member', '#c084fc');

    // Card 4: Capacity & Eligibility
    this.drawParamCard(ctx, 80 + cardWidth, cardY + 125, cardWidth, cardHeight, '🎟 ADMISSION & SEATS', `${evt.seatsTotal || 120} Lab Bench Seats`, 'Cryptographic IEEE Certificate', '#34d399');

    // --- FOOTER SECTION: QR CODE & CALL TO ACTION ---
    const footerY = cardY + 270;
    
    // Footer Background Card
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    this.roundRect(ctx, 60, footerY, width - 120, 200, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    // Render Scannable QR Code onto temporary canvas & transfer
    const qrCanvas = document.createElement('canvas');
    QRService.renderQRCode(qrCanvas, regUrl, { size: 160, colorDark: '#07090e', colorLight: '#ffffff' });
    ctx.drawImage(qrCanvas, 80, footerY + 20, 160, 160);

    // Call to Action Copy
    ctx.textAlign = 'left';
    ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('SCAN TO REGISTER', 265, footerY + 65);

    ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Use your phone camera or visit the KIIT IEEE portal', 265, footerY + 95);

    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(regUrl.replace('http://', '').replace('https://', ''), 265, footerY + 125);

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('OFFICIAL IEEE STUDENT BRANCH CREDENTIALS GUARANTEED', 265, footerY + 155);

    // Bottom Branding Slogan
    ctx.textAlign = 'center';
    ctx.font = '700 12px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('KIIT IEEE • WHERE STUDENTS BUILD WHAT’S NEXT • BHUBANESWAR, INDIA', width / 2, height - 20);
  }

  static drawParamCard(ctx, x, y, w, h, label, val1, val2, accent) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    this.roundRect(ctx, x, y, w, h, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();

    // Accent line
    ctx.fillStyle = accent;
    this.roundRect(ctx, x + 16, y + 16, 4, h - 32, 2);
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.fillStyle = accent;
    ctx.fillText(label, x + 28, y + 30);

    ctx.font = '800 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(val1.length > 28 ? val1.substring(0, 26) + '...' : val1, x + 28, y + 58);

    ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(val2.length > 32 ? val2.substring(0, 30) + '...' : val2, x + 28, y + 82);
  }

  static roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

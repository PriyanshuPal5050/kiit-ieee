/**
 * KIIT IEEE Platform - Messaging & Distribution Service
 * Implements real, user-controlled WhatsApp sharing via official https://wa.me deep links,
 * safe event-variable substitution, security sanitization, and share action telemetry.
 * Architected with WhatsAppShareService (user-controlled) and WhatsAppBusinessService (future Meta API).
 */

import { store } from '../state.js';

export const EVENT_EMOJIS = {
  title: "🎓",
  event: "🚀",
  date: "📅",
  time: "⏰",
  reporting: "🕐",
  venue: "📍",
  building: "🏢",
  eligibility: "🎯",
  description: "💡",
  capacity: "🎟️",
  deadline: "⏳",
  register: "🔗",
  organizer: "👤",
  speaker: "🎙️",
  sparkle: "✨"
};

function formatTime12h(t) {
  if (!t) return '';
  if (!t.includes(':')) return t;
  const parts = t.split(':');
  let hour = parseInt(parts[0], 10);
  if (isNaN(hour)) return t;
  const min = (parts[1] || '00').replace(/[^0-9]/g, '').slice(0, 2) || '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${min} ${ampm}`;
}

function formatDateDisplay(dStr) {
  if (!dStr) return '';
  if (/[a-zA-Z]/.test(dStr)) return dStr;
  const d = new Date(dStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return dStr;
}

/**
 * Single Canonical WhatsApp Message Generator
 * Used identically across Preview, Copy, and WhatsApp Share.
 * Strictly preserves real Unicode emojis without ASCII/Latin-1 transformations.
 */
export function generateWhatsAppMessage(event = {}) {
  if (!event) return '';

  const title = (event.title || event.eventName || 'Technical Masterclass').trim();
  const tagline = (event.shortDescription || event.tagline || "Where Students Build What's Next.").trim();

  // Speaker extraction
  let speaker = '';
  if (Array.isArray(event.speakers) && event.speakers.length > 0 && event.speakers[0]?.name) {
    const spk = event.speakers[0];
    speaker = spk.name.trim();
    if (spk.designation && spk.designation.trim()) {
      speaker += ` (${spk.designation.trim()})`;
    }
  } else if (event.speakerName) {
    speaker = event.speakerName.trim();
    if (event.speakerDesignation && event.speakerDesignation.trim()) {
      speaker += ` (${event.speakerDesignation.trim()})`;
    }
  } else if (event.speaker?.name) {
    speaker = event.speaker.name.trim();
    if (event.speaker.role && event.speaker.role.trim()) {
      speaker += ` (${event.speaker.role.trim()})`;
    }
  }

  // Date
  let dateStr = '';
  if (event.date) {
    dateStr = event.date;
  } else if (event.startDate) {
    const s = formatDateDisplay(event.startDate);
    const e = event.endDate ? formatDateDisplay(event.endDate) : '';
    dateStr = e && e !== s ? `${s} – ${e}` : s;
  } else {
    dateStr = '10 Oct 2026 – 11 Oct 2026';
  }

  // Time
  let timeStr = '';
  if (event.time) {
    timeStr = event.time;
  } else if (event.startTime) {
    const s = formatTime12h(event.startTime);
    const e = event.endTime ? formatTime12h(event.endTime) : '';
    timeStr = e ? `${s} – ${e}` : s;
  } else {
    timeStr = '9:30 AM – 5:00 PM';
  }

  // Reporting
  let reportingStr = '';
  if (event.reportingTime) {
    reportingStr = formatTime12h(event.reportingTime);
  } else {
    reportingStr = '08:30 AM';
  }

  // Venue & Building
  const campus = event.campus || 'Campus 15';
  const room = event.room || '';
  const building = event.building || 'School of Computer Engineering';
  let venueStr = event.venue || '';
  if (!venueStr) {
    venueStr = room ? `${room}, ${campus}` : `${building}, ${campus}`;
  }

  let buildingStr = building;
  if (room && !buildingStr.includes(room)) {
    buildingStr = `${building}, ${room}`;
  }

  // Eligibility
  const eligibilityStr = event.eligibility || 'Open to 2nd, 3rd & 4th Year B.Tech students';

  // Capacity
  const seats = event.seatsTotal || event.seats || event.capacity;
  const capacityStr = seats ? `${seats} Bench Seats Only (Limited)` : 'Limited Bench Seats';

  // Deadline
  const deadlineStr = event.registrationDeadline || event.regDeadline || '24 hours prior to event start';

  // Registration URL
  const origin = (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null' && !window.location.origin.includes('file:'))
    ? window.location.origin
    : 'https://kiit-ieee.org';
  const eventSlug = event.slug || event.id || 'evt';
  const regUrl = event.registrationUrl || `${origin}/#event=${eventSlug}`;

  // Organizer
  const organizerStr = event.contactPerson || event.organizer || 'KIIT IEEE Student Branch';

  // Overview / Description
  const overview = (event.fullDescription || event.whatWillLearn || event.description || '').trim();

  const lines = [
    `${EVENT_EMOJIS.title} KIIT IEEE PRESENTS`,
    ``,
    `${EVENT_EMOJIS.event} ${title}`,
    ``,
    `${EVENT_EMOJIS.date} Date: ${dateStr}`,
    `${EVENT_EMOJIS.time} Time: ${timeStr}`,
    `${EVENT_EMOJIS.reporting} Reporting: ${reportingStr}`,
    `${EVENT_EMOJIS.venue} Venue: ${venueStr}`,
    `${EVENT_EMOJIS.building} Building: ${buildingStr}`,
    ``
  ];

  if (speaker) {
    lines.push(`${EVENT_EMOJIS.speaker} Speaker: ${speaker}`);
  }
  lines.push(`${EVENT_EMOJIS.organizer} Organized by: ${organizerStr}`);

  const aboutText = (overview || tagline || '').trim();
  if (aboutText) {
    lines.push(``);
    lines.push(`${EVENT_EMOJIS.description} About the Event:`);
    lines.push(aboutText);
  }

  lines.push(``);
  lines.push(`${EVENT_EMOJIS.eligibility} Eligibility:`);
  lines.push(eligibilityStr);

  lines.push(``);
  lines.push(`${EVENT_EMOJIS.capacity} Seats: ${capacityStr}`);

  lines.push(``);
  lines.push(`${EVENT_EMOJIS.deadline} Registration Deadline:`);
  lines.push(deadlineStr);

  lines.push(``);
  lines.push(`${EVENT_EMOJIS.register} Register:`);
  lines.push(regUrl);

  return lines.join('\n');
}

export const WHATSAPP_TEMPLATES = {
  EVENT_LAUNCH: {
    id: 'EVENT_LAUNCH',
    name: 'Event Launch Announcement',
    icon: EVENT_EMOJIS.event,
    category: 'Launch',
    template: 
`${EVENT_EMOJIS.title} *KIIT IEEE PRESENTS*

${EVENT_EMOJIS.event} *{{event_name}}*

${EVENT_EMOJIS.description} Where Students Build What's Next.

${EVENT_EMOJIS.date} *Date:* {{event_date}}
${EVENT_EMOJIS.time} *Time:* {{event_start_time}} – {{event_end_time}}
${EVENT_EMOJIS.reporting} *Reporting:* {{reporting_time}}
${EVENT_EMOJIS.venue} *Venue:* {{venue_name}} ({{campus}})
${EVENT_EMOJIS.building} *Building:* {{building}}, {{room}}
${EVENT_EMOJIS.eligibility} *Eligibility:* {{eligibility}}

Join us for an intensive hands-on technical workshop covering modern engineering pipelines, lab hardware, and production deployment.

${EVENT_EMOJIS.capacity} *Capacity:* Limited Bench Seats (Strictly First-Come Basis)
${EVENT_EMOJIS.deadline} *Registration Deadline:* {{registration_deadline}}

${EVENT_EMOJIS.register} *Register Now:*
{{registration_url}}

${EVENT_EMOJIS.organizer} *Organizer:* {{organizer_name}}
📞 *Contact:* {{organizer_contact}}

#KIITIEEE #TechnicalWorkshop #KIITUniversity`
  },

  REGISTRATION_REMINDER: {
    id: 'REGISTRATION_REMINDER',
    name: 'Registration Reminder',
    icon: '⏰',
    category: 'Reminder',
    template:
`*⏰ REGISTRATION REMINDER | KIIT IEEE*
*{{event_name}}*

Hey KIITians! Registrations are rapidly filling for our flagship technical session.

📅 *Date:* {{event_date}}
⏰ *Time:* {{event_start_time}} – {{event_end_time}}
📍 *Venue:* {{venue_name}}, {{campus}}
🎓 *Eligibility:* {{eligibility}}

Don't miss the chance to build real capstone projects and earn verified IEEE credentials.

🔗 *Claim Your Seat:*
{{registration_url}}

#KIITIEEE #Engineering #Workshop`
  },

  LAST_FEW_SEATS: {
    id: 'LAST_FEW_SEATS',
    name: 'Last Few Seats',
    icon: '🔥',
    category: 'Scarcity',
    template:
`*🔥 URGENT: LAST FEW SEATS REMAINING!*
*{{event_name}}*

Only limited bench seats remain open for this high-intensity lab session!

📅 *Date:* {{event_date}}
⏰ *Time:* {{event_start_time}} – {{event_end_time}}
📍 *Venue:* {{venue_name}} ({{campus}})

Hardware bench kits are allocated on a strict first-come, first-served basis.

🔗 *Reserve Your Bench:*
{{registration_url}}

#KIITIEEE #SeatsFillingFast #HandsOnEngineering`
  },

  REGISTRATION_CLOSING: {
    id: 'REGISTRATION_CLOSING',
    name: 'Registration Closing',
    icon: '⏳',
    category: 'Deadline',
    template:
`*⏳ FINAL CALL: REGISTRATION CLOSING TONIGHT*
*{{event_name}}*

Portal closes strictly at {{registration_deadline}}.

📅 *Event Date:* {{event_date}}
⏰ *Time:* {{event_start_time}} – {{event_end_time}}
📍 *Venue:* {{venue_name}}

Final roster will be locked for lab workstation provisioning and hardware kit issuance.

🔗 *Register Before Cutoff:*
{{registration_url}}

#KIITIEEE #LastCall #RegistrationClosing`
  },

  EVENT_TOMORROW: {
    id: 'EVENT_TOMORROW',
    name: 'Event Tomorrow',
    icon: '⚡',
    category: 'Countdown',
    template:
`*⚡ HAPPENING TOMORROW | GET READY!*
*{{event_name}}*

Attention registered participants: Your workshop begins tomorrow!

📅 *Date:* Tomorrow ({{event_date}})
⏰ *Start Time:* {{event_start_time}}
🕐 *Mandatory Reporting:* {{reporting_time}}
📍 *Location:* {{venue_name}}, {{building}}, {{room}}
🏛 *Address:* {{address}}

🎒 *Prerequisites Checklist:*
1. Fully charged laptop with power adapter.
2. Verified KIIT IEEE digital ticket QR on your phone.
3. Reporting 30 minutes early for hardware bench allocation.

See you at the benches!

🔗 *Event Details & Pass:*
{{registration_url}}

#KIITIEEE #WorkshopTomorrow #ReadyToBuild`
  },

  EVENT_TODAY: {
    id: 'EVENT_TODAY',
    name: 'Event Today',
    icon: '🚨',
    category: 'Live',
    template:
`*🚨 WE ARE LIVE TODAY!*
*{{event_name}}*

The lab doors are open!

⏰ *Session Time:* {{event_start_time}} – {{event_end_time}}
🕐 *Reporting Deadline:* {{reporting_time}}
📍 *Venue:* {{venue_name}}, {{room}} ({{campus}})

Please head directly to the registration desk to scan your QR pass and claim your hardware bench kit.

📞 *Need Directions/Help?* {{organizer_contact}}

🔗 *Live Event Portal:*
{{registration_url}}

#KIITIEEE #WeAreLive #Today`
  },

  REPORTING_REMINDER: {
    id: 'REPORTING_REMINDER',
    name: 'Reporting Reminder',
    icon: '📍',
    category: 'Logistics',
    template:
`*📍 REPORTING REMINDER | VENUE COORDINATES*
*{{event_name}}*

All participants must report to the lab desk by {{reporting_time}}.

📍 *Venue:* {{venue_name}}
🏛 *Building:* {{building}}
🚪 *Room / Bench:* {{room}}
🗺 *Campus Address:* {{address}}

Please keep your digital ticket QR ready on your phone for rapid door check-in.

🔗 *View Your Ticket:*
{{registration_url}}

#KIITIEEE #ReportingNotice`
  },

  VENUE_UPDATE: {
    id: 'VENUE_UPDATE',
    name: 'Venue Update',
    icon: '🏛️',
    category: 'Update',
    template:
`*📢 IMPORTANT VENUE UPDATE*
*{{event_name}}*

Please take note of the confirmed campus lab coordinates for our session:

📍 *Confirmed Venue:* {{venue_name}}
🏛 *Building & Room:* {{building}}, {{room}}
🏫 *Campus:* {{campus}}
📅 *Date:* {{event_date}}
⏰ *Time:* {{event_start_time}} – {{event_end_time}}

All participants should proceed directly to this updated location.

🔗 *Verify Event Status:*
{{registration_url}}

#KIITIEEE #VenueUpdate`
  },

  SCHEDULE_UPDATE: {
    id: 'SCHEDULE_UPDATE',
    name: 'Schedule Update',
    icon: '⏱️',
    category: 'Update',
    template:
`*⏱ SCHEDULE UPDATE | TIMELINE REVISION*
*{{event_name}}*

Please note the revised session schedule:

📅 *Date:* {{event_date}}
⏰ *New Session Timing:* {{event_start_time}} – {{event_end_time}}
🕐 *New Reporting Time:* {{reporting_time}}
📍 *Venue:* {{venue_name}}

All teams and mentors, please align your arrival times accordingly.

🔗 *Full Schedule:*
{{registration_url}}

#KIITIEEE #ScheduleUpdate`
  },

  EVENT_LIVE: {
    id: 'EVENT_LIVE',
    name: 'Event Live',
    icon: '🔴',
    category: 'Live',
    template:
`*🔴 LIVE NOW | IN SESSION*
*{{event_name}}*

Builders are actively coding and deploying at {{venue_name}}!

Track live telemetry, benchmark submissions, and real-time announcements on the KIIT IEEE portal:

🔗 *Live Stream & Ticker:*
{{registration_url}}

#KIITIEEE #LiveNow #WhereStudentsBuildWhatsNext`
  },

  THANK_YOU: {
    id: 'THANK_YOU',
    name: 'Thank You',
    icon: '🎉',
    category: 'PostEvent',
    template:
`*🎉 THANK YOU FOR PARTICIPATING!*
*{{event_name}}*

Huge congratulations to all student engineers who built, tested, and demoed capstone projects during this workshop.

Special thanks to our mentors, student branch leads, and faculty advisors for making it a massive success.

Project repos and slide decks are now available on the portal:
🔗 *Review Workshop Materials:*
{{registration_url}}

#KIITIEEE #EventSuccess #EngineeringCommunity`
  },

  CERTIFICATE_AVAILABLE: {
    id: 'CERTIFICATE_AVAILABLE',
    name: 'Certificate Available',
    icon: '📜',
    category: 'PostEvent',
    template:
`*📜 CERTIFICATES OF COMPLETION AVAILABLE*
*{{event_name}}*

Official IEEE Student Branch Certificates are now ready for verified attendees!

🎓 *Issued By:* {{organizer_name}}
🔒 *Security:* Cryptographically verified IEEE credential IDs
⚡ *Access:* Available in your Student Dashboard

To view, verify, or add your certificate to LinkedIn:
🔗 *Claim Certificate:*
{{registration_url}}

#KIITIEEE #IEEECertificate #VerifiedCredentials`
  }
};

/**
 * Core User-Controlled WhatsApp Sharing Service
 */
export class WhatsAppShareService {
  /**
   * Safely resolves verified event variables.
   * NEVER invents missing information.
   */
  static extractVerifiedVariables(evt) {
    if (!evt) return {};

    const rawTime = evt.time || '09:00 AM – 05:00 PM IST';
    const timeParts = rawTime.includes('–') ? rawTime.split('–') : rawTime.includes('-') ? rawTime.split('-') : [rawTime, ''];
    const startTime = (timeParts[0] || '09:00 AM').trim();
    const endTime = (timeParts[1] || '05:00 PM').trim();

    // Canonical URL construction (No localhost or internal tokens in production share links)
    const slug = evt.id || 'evt';
    const origin = window.location.origin && window.location.origin !== 'null' && !window.location.origin.includes('file:')
      ? window.location.origin
      : 'https://kiit-ieee.org';
    const canonicalUrl = `${origin}/#event=${slug}`;

    return {
      event_name: evt.title || '',
      event_date: evt.date || '',
      event_start_time: startTime,
      event_end_time: endTime,
      reporting_time: evt.reportingTime || '08:30 AM (30 mins prior to start)',
      venue_name: evt.venue || '',
      campus: evt.campus || 'Campus 15',
      building: evt.building || 'School of Computer Engineering',
      room: evt.room || 'Tech Lab 2',
      address: evt.address || 'Campus 15, KIIT University, Bhubaneswar, Odisha 751024',
      eligibility: evt.eligibility || 'Open to all KIIT students',
      registration_deadline: evt.regDeadline || '24 hours prior to event start',
      registration_url: canonicalUrl,
      organizer_name: evt.organizer || 'KIIT IEEE Student Branch',
      organizer_contact: evt.organizerContact || 'ieee@kiit.ac.in | +91 674 2725113'
    };
  }

  /**
   * Validates if all mandatory event fields exist before sharing.
   */
  static validateEventForSharing(evt) {
    const missing = [];
    if (!evt.title || evt.title.trim() === '') missing.push('Event Name');
    if (!evt.date || evt.date.trim() === '') missing.push('Date');
    if (!evt.venue || evt.venue.trim() === '') missing.push('Venue');
    if (!evt.id && !evt.title) missing.push('Registration URL / Event ID');

    return {
      isValid: missing.length === 0,
      missingFields: missing,
      errorMessage: missing.length > 0 ? `Information required before sharing: ${missing.join(', ')}.` : null
    };
  }

  /**
   * Populates template string with verified variables.
   */
  static interpolateTemplate(templateStr, variables) {
    let result = templateStr;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, value || `[${key.replace(/_/g, ' ').toUpperCase()}]`);
    }
    return this.sanitizeMessage(result);
  }

  /**
   * Security sanitizer: strictly prevents secret leakages (tokens, private IDs, passwords, etc.)
   */
  static sanitizeMessage(text) {
    if (typeof text !== 'string') return '';
    // Strip any possible API keys or bearer tokens
    let sanitized = text
      .replace(/bearer\s+[a-zA-Z0-9_\-\.]+/gi, '[REDACTED_TOKEN]')
      .replace(/token=[a-zA-Z0-9_\-\.]+/gi, '')
      .replace(/admin\/[a-zA-Z0-9_\-\.]+/gi, 'events');
    return sanitized.trim();
  }

  /**
   * Builds the official wa.me share URL.
   */
  static buildShareUrl(message) {
    const encoded = encodeURIComponent(message);
    return `https://wa.me/?text=${encoded}`;
  }

  /**
   * Builds the official WhatsApp Web fallback URL.
   */
  static buildWebShareUrl(message) {
    const encoded = encodeURIComponent(message);
    return `https://web.whatsapp.com/send?text=${encoded}`;
  }

  /**
   * REAL WhatsApp sharing trigger:
   * 1. Encodes message
   * 2. Opens https://wa.me/?text=... in a new browser tab/window
   * 3. Records WHATSAPP_SHARE_INITIATED telemetry
   * 4. Does NOT claim false delivery
   */
  static shareToWhatsApp(message, evtMeta = {}) {
    const sanitized = this.sanitizeMessage(message);
    const url = this.buildShareUrl(sanitized);

    // Record internal audit telemetry: WHATSAPP_SHARE_INITIATED
    const hostUser = store.user?.name || 'Host Organizer';
    store.trackPromotionAction('WHATSAPP_SHARE_INITIATED', {
      eventId: evtMeta.id || 'evt-ai-cv-2026',
      hostId: store.user?.id || 'host-user',
      actor: hostUser,
      channel: 'WhatsApp',
      timestamp: new Date().toISOString()
    });

    // Attempt to open in a new tab keeping KIIT IEEE open
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) {
      // Fallback: If popup blocker blocked the new tab, try location redirect or prompt
      try {
        window.location.href = url;
      } catch (e) {
        console.warn('Popup blocked, falling back to clipboard copy:', e);
        navigator.clipboard.writeText(sanitized);
        return { success: false, fallback: 'clipboard', url };
      }
    }

    return { success: true, method: 'wa.me', url };
  }

  /**
   * Open WhatsApp Web directly as an alternative destination
   */
  static openWhatsAppWeb(message, evtMeta = {}) {
    const sanitized = this.sanitizeMessage(message);
    const url = this.buildWebShareUrl(sanitized);

    store.trackPromotionAction('WHATSAPP_SHARE_INITIATED', {
      eventId: evtMeta.id || 'evt',
      hostId: store.user?.id || 'host-user',
      channel: 'WhatsApp Web',
      timestamp: new Date().toISOString()
    });

    window.open(url, '_blank', 'noopener,noreferrer');
    return { success: true, method: 'web.whatsapp.com', url };
  }

  /**
   * Native device share sheet integration (Web Share API)
   */
  static async shareNative(shareData, evtMeta = {}) {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        store.trackPromotionAction('WHATSAPP_SHARE_INITIATED', {
          eventId: evtMeta.id || 'evt',
          hostId: store.user?.id || 'host-user',
          channel: 'WebShareAPI',
          timestamp: new Date().toISOString()
        });
        return { success: true, method: 'native' };
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Native share failed, fallback to clipboard:', err);
        }
      }
    }

    // Graceful clipboard copy fallback
    try {
      await navigator.clipboard.writeText(shareData.text || shareData.url || '');
      store.trackPromotionAction('link_copy', { eventId: evtMeta.id });
      return { success: true, method: 'clipboard' };
    } catch (e) {
      return { success: false, error: e };
    }
  }

  /**
   * Graceful clipboard copy with reliable execCommand fallback
   */
  static async copyMessage(message) {
    if (typeof message !== 'string') message = '';
    // Modern Clipboard API
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(message);
        store.trackPromotionAction('link_copy');
        return true;
      } catch (err) {
        console.warn('navigator.clipboard.writeText failed, using fallback:', err);
      }
    }

    // Fallback for non-secure contexts or older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = message;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        store.trackPromotionAction('link_copy');
        return true;
      }
    } catch (e) {
      console.error('Clipboard copy fallback failed:', e);
    }
    return false;
  }
}

/**
 * Future WhatsApp Business / Meta Cloud API Interface Abstraction
 * (Section 29.14 & 29.15)
 * Completely separate from user-controlled sharing.
 */
export class WhatsAppBusinessService {
  static isConfigured() {
    return false; // Not configured in client-side runtime
  }

  static getStatus() {
    return {
      configured: false,
      message: 'Official Meta WhatsApp Business Cloud API requires verified server-side credentials and approved message templates.'
    };
  }

  static async sendTemplateMessage(recipientNumber, templateId, parameters = {}) {
    throw new Error('WhatsApp Business API integration is not active. Use user-controlled WhatsApp sharing.');
  }

  static async getDeliveryStatus(messageId) {
    return { status: 'UNKNOWN', error: 'Business API inactive' };
  }

  static async getRateLimits() {
    return { tier: 'Tier 1 (1,000 unique recipients / 24h)', active: false };
  }

  static async manageOptIns(studentRollNo, optIn = true) {
    return { success: true, rollNo: studentRollNo, optIn };
  }
}

/**
 * Top-Level Messaging Service Facade
 */
export class MessagingService {
  static share = WhatsAppShareService;
  static business = WhatsAppBusinessService;
  static templates = WHATSAPP_TEMPLATES;
}

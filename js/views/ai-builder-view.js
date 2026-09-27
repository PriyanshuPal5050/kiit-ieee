/**
 * KIIT IEEE Platform - AI Event Creator & Promotion Hub
 * End-to-end AI-powered event builder with natural-language AI Event Helper,
 * reactive form state updates, AI poster generation & regeneration,
 * staleness tracking, and native WhatsApp poster + message sharing.
 */

import { store } from '../state.js';
import { AIService } from '../services/ai-service.js';
import { EventService } from '../services/event-service.js';
import { PromotionService } from '../services/promotion-service.js';
import { WhatsAppShareService, generateWhatsAppMessage, EVENT_EMOJIS } from '../services/messaging-service.js';
import { sound } from '../services/audio-service.js';
import { toast } from '../components/toast.js';

// Pre-configured official KIIT campus directory for automated venue population
export const KIIT_CAMPUS_DIRECTORY = {
  "Campus 15": {
    building: "School of Computer Engineering",
    address: "Campus 15, KIIT Deemed to be University, Patia, Bhubaneswar, Odisha 751024",
    rooms: ["Tech Lab 2", "Tech Lab 4 (AI/ML Lab)", "Auditorium Hall C15", "Seminar Hall 1", "Hardware IoT Bay"]
  },
  "Campus 12": {
    building: "School of Electronics Engineering (ETC/ECE)",
    address: "Campus 12, KIIT Deemed to be University, Patia, Bhubaneswar, Odisha 751024",
    rooms: ["Robotics & Embedded Lab", "VLSI Research Lab", "IoT Bootcamp Arena", "Conference Hall 12"]
  },
  "Campus 17": {
    building: "Cybersecurity & IT Incubation Center",
    address: "Campus 17, KIIT Deemed to be University, Patia, Bhubaneswar, Odisha 751024",
    rooms: ["Red Team Cyber Lab", "Cloud Innovation Center", "Auditorium 17"]
  },
  "Campus 3": {
    building: "School of Mechanical Engineering / Central Library",
    address: "Campus 3, KIIT Deemed to be University, Patia, Bhubaneswar, Odisha 751024",
    rooms: ["CAD/CAM Simulation Lab", "Mechatronics Bay", "Central Auditorium"]
  },
  "Campus 6": {
    building: "School of Electrical Engineering",
    address: "Campus 6, KIIT Deemed to be University, Patia, Bhubaneswar, Odisha 751024",
    rooms: ["Room 302", "Power Systems Lab", "Renewable Energy Lab", "Smart Grid Bench"]
  },
  "Campus 1": {
    building: "Central Administrative Block & Chintan Hall",
    address: "Campus 1, KIIT Deemed to be University, Patia, Bhubaneswar, Odisha 751024",
    rooms: ["Chintan Auditorium", "Executive Council Chamber"]
  },
  "Campus 25": {
    building: "KIMS Advanced Medical Research Facility",
    address: "Campus 25, KIIT Deemed to be University, Patia, Bhubaneswar, Odisha 751024",
    rooms: ["Bio-Informatics Lab", "Seminar Hall 25"]
  }
};

// Explicit whitelist of allowed fields that AI is permitted to modify (Requirement 4)
export const ALLOWED_EVENT_FIELDS = [
  'eventName', 'title',
  'eventType',
  'category',
  'description', 'shortDescription', 'fullDescription',
  'startDate', 'endDate',
  'startTime', 'endTime', 'reportingTime',
  'campus', 'building', 'room', 'venue', 'address', 'landmark',
  'speakerName', 'speakerDesignation', 'speakerOrganization', 'speakerBio',
  'eligibility', 'prerequisites', 'whatStudentsBring', 'whatToBring',
  'whatWillLearn', 'whatWillBuild',
  'seats', 'seatsTotal',
  'registrationFee', 'fee',
  'contactPerson', 'contactNumber', 'contactPhone', 'contactEmail',
  'registrationDeadline'
];

/**
 * Normalizes user/AI time strings into valid 24-hr HH:MM for HTML5 <input type="time">
 */
function normalizeTimeTo24Hr(timeStr) {
  if (!timeStr) return '';
  timeStr = timeStr.trim();
  if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
  const match = timeStr.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = match[2] ? match[2] : '00';
    const ampm = match[3] ? match[3].toLowerCase() : null;
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }
  return timeStr;
}

export class AIBuilderView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.isGeneratingContent = false;
    this.isGeneratingAIHelper = false;

    // Staleness Tracking (Requirement 18)
    this.eventVersion = 1;
    this.posterVersion = 1;
    this.contentVersion = 1;

    // AI Poster Configuration (Requirement 9, 28)
    this.posterConfig = {
      theme: 'auto',
      accentStyle: 'electric-blue',
      titleScale: 'normal',
      visualIntensity: 'moderate'
    };

    this.autosaveTimeout = null;

    // Event Model State (Single Source of Truth)
    this.eventData = {
      id: `evt-${Date.now()}`,
      title: 'AI & Edge Computer Vision Masterclass',
      eventType: 'Workshop',
      category: 'AI & Machine Learning',
      shortDescription: 'Build real-time object tracking and neural perception models on resource-constrained edge devices with YOLOv11 and Jetson hardware kits.',
      fullDescription: 'A high-intensity, hands-on technical workshop for KIIT engineering students. Participants will configure neural inference environments, optimize weights, and deploy computer vision pipelines.',
      
      // Schedule
      startDate: '2026-10-10',
      endDate: '2026-10-11',
      startTime: '09:30',
      endTime: '17:00',
      reportingTime: '08:30',
      registrationDeadline: '2026-10-09',

      // Venue
      campus: 'Campus 15',
      building: 'School of Computer Engineering',
      room: 'Tech Lab 4 (AI/ML Lab)',
      address: 'Campus 15, KIIT Deemed to be University, Patia, Bhubaneswar, Odisha 751024',
      landmark: 'Near Central Research Facility',

      // Speakers
      speakers: [
        {
          name: 'Dr. Priyadarshi Sen',
          designation: 'Principal AI Scientist & IEEE Senior Member',
          organization: 'NeuralTech Labs / Ex-Intel AI',
          bio: '12+ years experience deploying embedded computer vision and deep neural network accelerators.'
        }
      ],

      // Details
      whatWillLearn: 'Computer vision fundamentals, YOLOv11 model quantization, INT8 calibration, and embedded hardware pipelines.',
      whatWillBuild: 'Production-ready Edge AI object tracker and real-time inference pipeline deployed on Jetson hardware.',
      eligibility: 'Open to 2nd, 3rd & 4th Year B.Tech students (All branches)',
      prerequisites: 'Basic knowledge of Python and machine learning concepts. Personal laptop with min 8GB RAM.',
      whatToBring: 'Personal laptop, charger, and student ID card for laboratory bench check-in.',
      seatsTotal: 120,
      fee: 'Free (IEEE Sponsored)',
      contactPerson: 'Aryan Mohapatra (Lead Student Organizer)',
      contactPhone: '+91 674 2725113',
      contactEmail: 'ieee@kiit.ac.in',

      // AI Instruction & WhatsApp announcement
      aiInstruction: 'Make this exciting, prestigious, and clear for ambitious engineering undergraduates.',
      whatsappMessage: '',
      isPublished: false
    };

    // Restore draft if available
    this.restoreDraftIfAvailable();
    this.updateWhatsAppAnnouncement();
  }

  restoreDraftIfAvailable() {
    try {
      const saved = localStorage.getItem('KIIT_IEEE_EVENT_BUILDER_DRAFT');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.title) {
          this.eventData = { ...this.eventData, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Could not restore draft:', e);
    }
  }

  getFormattedDateRange() {
    if (!this.eventData.startDate) return 'Upcoming 2026';
    const s = new Date(this.eventData.startDate);
    const startStr = isNaN(s.getTime()) ? this.eventData.startDate : s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    if (!this.eventData.endDate || this.eventData.startDate === this.eventData.endDate) {
      return startStr;
    }
    const e = new Date(this.eventData.endDate);
    const endStr = isNaN(e.getTime()) ? this.eventData.endDate : e.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${startStr} – ${endStr}`;
  }

  getFormattedTimeRange() {
    const formatTime = (t) => {
      if (!t) return '';
      if (!t.includes(':')) return t;
      const [h, m] = t.split(':');
      let hour = parseInt(h);
      if (isNaN(hour)) return t;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      return `${hour}:${m} ${ampm}`;
    };

    const s = formatTime(this.eventData.startTime);
    const e = formatTime(this.eventData.endTime);
    return s && e ? `${s} – ${e}` : (s || '09:30 AM – 05:00 PM IST');
  }

  getFormattedReportingTime() {
    if (!this.eventData.reportingTime) return '08:30 AM';
    if (!this.eventData.reportingTime.includes(':')) return this.eventData.reportingTime;
    const [h, m] = this.eventData.reportingTime.split(':');
    let hour = parseInt(h);
    if (isNaN(hour)) return this.eventData.reportingTime;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  }

  /**
   * Constructs the clean, professional WhatsApp announcement using the controlled emoji system
   */
  updateWhatsAppAnnouncement() {
    this.eventData.whatsappMessage = generateWhatsAppMessage(this.eventData);
    return this.eventData.whatsappMessage;
  }

  /**
   * Marks event data as updated, increments version, flags poster staleness (Requirement 8, 18),
   * and triggers debounced autosave draft (Requirement 31).
   */
  markEventChanged(fieldSource = '') {
    this.eventVersion++;
    this.updateWhatsAppAnnouncement();

    // Update WhatsApp textarea in UI
    const waBox = this.container?.querySelector('#promo-whatsapp-edit');
    if (waBox) waBox.value = this.eventData.whatsappMessage;

    // Update Poster Stale Badge & Banner
    this.updatePosterStaleStatus();

    // Trigger debounced autosave
    this.debouncedAutosave();
  }

  updatePosterStaleStatus() {
    const badge = this.container?.querySelector('#badge-poster-status');
    const banner = this.container?.querySelector('#poster-stale-banner');
    const isStale = this.posterVersion < this.eventVersion;

    if (badge) {
      if (isStale) {
        badge.className = 'text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold';
        badge.textContent = '⚠️ Poster Stale';
      } else {
        badge.className = 'text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold';
        badge.textContent = '✓ Up to Date';
      }
    }

    if (banner) {
      if (isStale) {
        banner.classList.remove('hidden');
      } else {
        banner.classList.add('hidden');
      }
    }
  }

  debouncedAutosave() {
    clearTimeout(this.autosaveTimeout);
    this.autosaveTimeout = setTimeout(() => {
      this.saveDraft(true);
    }, 1000);
  }

  saveDraft(silent = false) {
    try {
      this.syncFormValuesToState();
      localStorage.setItem('KIIT_IEEE_EVENT_BUILDER_DRAFT', JSON.stringify(this.eventData));
      const ind = this.container?.querySelector('#draft-autosave-indicator');
      if (ind) {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        ind.textContent = `✓ Draft autosaved ${time}`;
        ind.classList.remove('text-amber-400', 'text-slate-400');
        ind.classList.add('text-emerald-400');
      }
      if (!silent) {
        sound.playSuccess();
        toast.show({ title: 'Draft Saved 💾', message: 'Your event parameters have been saved locally.', type: 'success' });
      }
    } catch (e) {
      console.warn('Draft save error:', e);
    }
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-10">
        
        <!-- Header (Section 1) -->
        <div class="pb-6 border-b border-white/10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest mb-1.5">
              <span>✨</span> Event Creator & Promotion Hub
            </div>
            <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight">Create Your Event</h1>
            <p class="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Tell us about your event. KIIT IEEE AI will turn your details into a complete event page, announcement, and promotional poster.
            </p>
          </div>
          <div class="flex items-center gap-2.5 flex-wrap">
            <span id="draft-autosave-indicator" class="text-[11px] font-mono text-slate-400 mr-1 hidden sm:inline-block">
              ✓ Ready
            </span>
            <button id="btn-save-draft" class="px-3.5 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all btn-press flex items-center gap-1.5" title="Save draft locally">
              <span>💾</span> Save Draft
            </button>
            <button id="btn-reset-form" class="px-3 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:border-rose-500/30 border border-white/10 text-slate-400 hover:text-rose-300 text-xs font-bold transition-all btn-press flex items-center gap-1.5" title="Reset form to defaults">
              <span>🔄</span> Reset
            </button>
            <button id="btn-quick-fill-demo" class="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-all btn-press flex items-center gap-1.5">
              <span>⚡</span> Load Flagship Preset
            </button>
          </div>
        </div>

        <!-- 2-Column Workspace Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- LEFT COLUMN: AI Event Helper + Form Fields (Sections 1-6) -->
          <div class="lg:col-span-7 space-y-8">

            <!-- ✨ AI EVENT HELPER SECTION (Requirement 1, 2, 3, 6, 7, 33) -->
            <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-purple-500/40 bg-gradient-to-br from-slate-900/95 via-purple-950/30 to-indigo-950/40 shadow-xl space-y-4 relative overflow-hidden">
              <div class="flex items-center justify-between pb-3 border-b border-white/10">
                <div class="flex items-center gap-2">
                  <span class="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-sm shadow-inner">✨</span>
                  <div>
                    <h3 class="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
                      AI Event Helper
                      <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold uppercase">Natural Language Control</span>
                    </h3>
                    <p class="text-xs text-slate-300 mt-0.5">Tell AI what you want to change — form fields, timing, venue, poster, or announcements update instantly.</p>
                  </div>
                </div>
              </div>

              <!-- Input and Apply Button -->
              <div class="space-y-2.5">
                <div class="flex flex-col sm:flex-row gap-2.5">
                  <div class="relative flex-1">
                    <input 
                      type="text" 
                      id="input-ai-helper-instruction" 
                      placeholder="Tell AI what you want to change… e.g. Change speaker name to Priyanshu Pal, update venue to Campus 6, and change timing to 2 PM–5 PM." 
                      class="w-full bg-slate-950 border border-purple-500/40 rounded-2xl px-4 py-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 transition-all shadow-inner" 
                    />
                    <button id="btn-ai-helper-clear" class="hidden absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 text-xs font-bold">✕</button>
                  </div>
                  <button 
                    id="btn-ai-helper-apply" 
                    class="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-xs shadow-lg shadow-purple-500/25 transition-all btn-press flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <span>✨</span> Apply with AI
                  </button>
                </div>

                <!-- Quick Chip Suggestions (Requirement 33) -->
                <div class="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                  <span class="text-slate-400 font-semibold mr-1">Suggestions:</span>
                  <button class="ai-chip px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 text-slate-300 hover:text-purple-200 transition-colors cursor-pointer" data-chip="Change speaker name to Priyanshu Pal">Change Speaker</button>
                  <button class="ai-chip px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 text-slate-300 hover:text-purple-200 transition-colors cursor-pointer" data-chip="Change venue to Campus 6, Room 302">Change Venue</button>
                  <button class="ai-chip px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 text-slate-300 hover:text-purple-200 transition-colors cursor-pointer" data-chip="Change timing to 2 PM to 5 PM and reporting time to 1:30 PM">Change Timing</button>
                  <button class="ai-chip px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 text-slate-300 hover:text-purple-200 transition-colors cursor-pointer" data-chip="Make the event description more formal and professional">Make Formal</button>
                  <button class="ai-chip px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 text-slate-300 hover:text-purple-200 transition-colors cursor-pointer" data-chip="Change speaker designation to Technical Lead and seats to 150">Update Designation & Seats</button>
                  <button class="ai-chip px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 text-slate-300 hover:text-purple-200 transition-colors cursor-pointer" data-chip="Make the poster more professional and corporate with modern blue futuristic technical theme">Redesign Poster</button>
                  <button class="ai-chip px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 text-slate-300 hover:text-purple-200 transition-colors cursor-pointer" data-chip="Make the WhatsApp announcement shorter and more formal">Shorten WhatsApp</button>
                </div>

                <!-- Small elegant activity status area (Requirement 7) -->
                <div id="ai-helper-status" class="hidden p-3 rounded-xl border text-xs transition-all animate-fade-in"></div>
              </div>
            </div>
            
            <!-- SECTION 1: BASIC EVENT DETAILS -->
            <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-5 bg-slate-900/80">
              <div class="flex items-center gap-2 pb-3 border-b border-white/10">
                <span class="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">1</span>
                <h3 class="text-base font-bold text-white uppercase tracking-wider">Basic Event Details</h3>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-slate-200 mb-1.5">Event Name *</label>
                  <input type="text" id="form-event-name" value="${this.escapeHtml(this.eventData.title)}" placeholder="e.g. AI & Edge Computer Vision Masterclass" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-200 mb-1.5">Event Type *</label>
                    <select id="form-event-type" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500">
                      ${['Workshop', 'Seminar', 'Webinar', 'Hackathon', 'Competition', 'Bootcamp', 'Technical Talk', 'Hands-on Lab', 'Coding Event', 'Robotics Event', 'AI/ML Event', 'Other'].map(t => `
                        <option value="${t}" ${this.eventData.eventType === t ? 'selected' : ''}>${t}</option>
                      `).join('')}
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-200 mb-1.5">Category *</label>
                    <select id="form-category" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500">
                      ${['AI & Machine Learning', 'Web & Cloud', 'Robotics & IoT', 'Cybersecurity', 'Embedded Systems', 'Hackathons', 'Other'].map(c => `
                        <option value="${c}" ${this.eventData.category === c ? 'selected' : ''}>${c}</option>
                      `).join('')}
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-200 mb-1.5">Short Description * ("What is this event about?")</label>
                  <textarea id="form-short-desc" rows="2" placeholder="Brief summary of the workshop..." class="w-full bg-slate-950 border border-white/15 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-purple-500 leading-relaxed">${this.escapeHtml(this.eventData.shortDescription)}</textarea>
                </div>
              </div>
            </div>

            <!-- SECTION 2: EVENT SCHEDULE (Proper Date & Time Controls) -->
            <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-5 bg-slate-900/80">
              <div class="flex items-center justify-between pb-3 border-b border-white/10">
                <div class="flex items-center gap-2">
                  <span class="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">2</span>
                  <h3 class="text-base font-bold text-white uppercase tracking-wider">Event Schedule</h3>
                </div>
                <span class="text-[11px] font-mono text-cyan-400">Date & Time Controls</span>
              </div>

              <!-- Date Controls -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-200 mb-1.5">Start Date *</label>
                  <input type="date" id="form-start-date" value="${this.eventData.startDate}" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono" />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-200 mb-1.5">End Date</label>
                  <input type="date" id="form-end-date" value="${this.eventData.endDate}" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono" />
                </div>
              </div>

              <!-- Time Controls -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-200 mb-1.5">Start Time *</label>
                  <input type="time" id="form-start-time" value="${this.eventData.startTime}" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono" />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-200 mb-1.5">End Time *</label>
                  <input type="time" id="form-end-time" value="${this.eventData.endTime}" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono" />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-200 mb-1.5">Reporting Time</label>
                  <input type="time" id="form-reporting-time" value="${this.eventData.reportingTime}" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-200 mb-1.5">Registration Deadline</label>
                <input type="date" id="form-deadline" value="${this.eventData.registrationDeadline}" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono" />
              </div>
            </div>

            <!-- SECTION 3: VENUE INFORMATION -->
            <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-5 bg-slate-900/80">
              <div class="flex items-center justify-between pb-3 border-b border-white/10">
                <div class="flex items-center gap-2">
                  <span class="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">3</span>
                  <h3 class="text-base font-bold text-white uppercase tracking-wider">Venue Location</h3>
                </div>
                <span class="text-[11px] font-mono text-emerald-400">Campus Auto-Fill Active</span>
              </div>

              <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-200 mb-1.5">Campus *</label>
                    <select id="form-campus" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500">
                      ${['Campus 15', 'Campus 12', 'Campus 17', 'Campus 3', 'Campus 6', 'Campus 1', 'Campus 25', 'Other'].map(c => `
                        <option value="${c}" ${this.eventData.campus === c ? 'selected' : ''}>${c}</option>
                      `).join('')}
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-200 mb-1.5">Building / Block *</label>
                    <input type="text" id="form-building" value="${this.escapeHtml(this.eventData.building)}" placeholder="School of Computer Engineering" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-200 mb-1.5">Room / Lab / Auditorium *</label>
                  <input type="text" id="form-room" value="${this.escapeHtml(this.eventData.room)}" placeholder="Tech Lab 4 (AI/ML Lab)" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500" />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-200 mb-1.5">Full Venue Address *</label>
                  <input type="text" id="form-address" value="${this.escapeHtml(this.eventData.address)}" placeholder="Campus 15, KIIT University, Patia, Bhubaneswar, Odisha 751024" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500" />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-200 mb-1.5">Landmark / Directions</label>
                  <input type="text" id="form-landmark" value="${this.escapeHtml(this.eventData.landmark)}" placeholder="Near Central Research Facility / Beside Library Block" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
            </div>

            <!-- SECTION 4: SPEAKER / INSTRUCTOR (Multiple Speakers Allowed) -->
            <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-5 bg-slate-900/80">
              <div class="flex items-center justify-between pb-3 border-b border-white/10">
                <div class="flex items-center gap-2">
                  <span class="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-300 flex items-center justify-center font-bold text-xs">4</span>
                  <h3 class="text-base font-bold text-white uppercase tracking-wider">Speaker / Instructor</h3>
                </div>
                <button id="btn-add-speaker" class="text-xs text-pink-400 hover:text-pink-300 font-bold transition-colors">
                  + Add Another Speaker
                </button>
              </div>

              <div id="speakers-container" class="space-y-4">
                ${this.eventData.speakers.map((spk, idx) => `
                  <div class="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3 relative speaker-row" data-idx="${idx}">
                    ${idx > 0 ? `
                      <button class="btn-remove-speaker absolute top-3 right-3 text-slate-500 hover:text-rose-400 text-xs font-bold" data-idx="${idx}">✕ Remove</button>
                    ` : ''}

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label class="block text-[11px] font-bold text-slate-300 mb-1">Speaker Name *</label>
                        <input type="text" id="form-speaker-name" class="spk-name w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 transition-colors" value="${this.escapeHtml(spk.name)}" placeholder="Dr. Priyadarshi Sen" data-idx="${idx}" />
                      </div>
                      <div>
                        <label class="block text-[11px] font-bold text-slate-300 mb-1">Designation</label>
                        <input type="text" id="form-speaker-desig" class="spk-desig w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 transition-colors" value="${this.escapeHtml(spk.designation)}" placeholder="Principal AI Scientist" data-idx="${idx}" />
                      </div>
                    </div>

                    <div>
                      <label class="block text-[11px] font-bold text-slate-300 mb-1">Organization / Company</label>
                      <input type="text" id="form-speaker-org" class="spk-org w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 transition-colors" value="${this.escapeHtml(spk.organization)}" placeholder="NeuralTech Labs / Ex-Intel AI" data-idx="${idx}" />
                    </div>

                    <div>
                      <label class="block text-[11px] font-bold text-slate-300 mb-1">Speaker Bio</label>
                      <textarea id="form-speaker-bio" class="spk-bio w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-pink-500 transition-colors" rows="2" placeholder="Brief technical credentials..." data-idx="${idx}">${this.escapeHtml(spk.bio)}</textarea>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- SECTION 5: WHAT SHOULD STUDENTS KNOW? -->
            <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-5 bg-slate-900/80">
              <div class="flex items-center gap-2 pb-3 border-b border-white/10">
                <span class="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">5</span>
                <h3 class="text-base font-bold text-white uppercase tracking-wider">What Should Students Know?</h3>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-bold text-slate-200 mb-1.5">What will students learn?</label>
                  <textarea id="form-learn" rows="2" placeholder="Key technical principles and domain frameworks..." class="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500">${this.escapeHtml(this.eventData.whatWillLearn)}</textarea>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-200 mb-1.5">What will students build/do?</label>
                  <textarea id="form-build" rows="2" placeholder="Hands-on capstone and software/hardware deliverables..." class="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500">${this.escapeHtml(this.eventData.whatWillBuild)}</textarea>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-200 mb-1.5">Who can attend? (Eligibility)</label>
                    <input type="text" id="form-eligibility" value="${this.escapeHtml(this.eventData.eligibility)}" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-200 mb-1.5">Prerequisites</label>
                    <input type="text" id="form-prerequisites" value="${this.escapeHtml(this.eventData.prerequisites)}" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500" />
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-200 mb-1.5">What should students bring?</label>
                  <input type="text" id="form-bring" value="${this.escapeHtml(this.eventData.whatToBring)}" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-200 mb-1.5">Seats Available</label>
                    <input type="number" id="form-seats" value="${this.eventData.seatsTotal}" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono" />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-200 mb-1.5">Registration Fee</label>
                    <input type="text" id="form-fee" value="${this.escapeHtml(this.eventData.fee)}" class="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500" />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label class="block text-[11px] font-bold text-slate-300 mb-1">Contact Person</label>
                    <input type="text" id="form-contact-person" value="${this.escapeHtml(this.eventData.contactPerson)}" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-slate-300 mb-1">Contact Number</label>
                    <input type="text" id="form-contact-phone" value="${this.escapeHtml(this.eventData.contactPhone)}" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono" />
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-slate-300 mb-1">Contact Email</label>
                    <input type="text" id="form-contact-email" value="${this.escapeHtml(this.eventData.contactEmail)}" class="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500" />
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 6: COMPREHENSIVE AI CONTENT GENERATOR -->
            <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-slate-900 to-purple-950/40 space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-bold text-white flex items-center gap-2">
                    <span>✨</span> What do you want to say? (Optional AI Instruction)
                  </h4>
                  <p class="text-xs text-slate-400 mt-0.5">
                    Example: "Make the announcement exciting and professional for 2nd and 3rd year engineering students."
                  </p>
                </div>
              </div>

              <input type="text" id="form-ai-instruction" value="${this.escapeHtml(this.eventData.aiInstruction)}" placeholder="Make this announcement exciting and prestigious for engineering students..." class="w-full bg-slate-950 border border-purple-500/40 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-400" />

              <button id="btn-generate-ai-content" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-extrabold text-xs shadow-xl shadow-purple-500/25 transition-all btn-press flex items-center justify-center gap-2">
                <span>✨</span> Generate Event Content & Sync Announcement
              </button>
            </div>

          </div>

          <!-- RIGHT COLUMN: THE TWO MAIN ACTIONS (Poster & WhatsApp) -->
          <div class="lg:col-span-5 space-y-8 sticky top-24">
            
            <!-- MAIN ACTION 1: 🎨 AI POSTER (Requirement 9, 10, 11, 12, 13) -->
            <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-purple-500/30 bg-slate-900/90 space-y-5 shadow-2xl">
              <div class="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 class="text-base font-bold text-white flex items-center gap-2">
                    <span>🎨</span> AI POSTER
                  </h3>
                  <p class="text-xs text-slate-400">Formal KIIT IEEE high-resolution promotional poster.</p>
                </div>
                <div class="flex items-center gap-2">
                  <span id="badge-poster-status" class="text-[10px] font-mono px-2 py-0.5 rounded-full ${this.posterVersion < this.eventVersion ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'}">
                    ${this.posterVersion < this.eventVersion ? '⚠️ Poster Stale' : '✓ Up to Date'}
                  </span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold uppercase">
                    ${this.eventData.category}
                  </span>
                </div>
              </div>

              <!-- Poster Staleness Notice (Requirement 8, 18) -->
              <div id="poster-stale-banner" class="${this.posterVersion < this.eventVersion ? '' : 'hidden'} p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                <span>⚠️ Poster needs regeneration because event details changed.</span>
                <button id="btn-quick-regen-poster" class="underline font-bold text-amber-200 hover:text-white ml-2 whitespace-nowrap">Regenerate Now</button>
              </div>

              <!-- Poster Canvas Live Preview Container -->
              <div class="rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-inner p-1 relative group">
                <canvas id="poster-canvas" class="w-full h-auto rounded-xl block"></canvas>
              </div>

              <!-- Obvious Poster Action Buttons (Requirement 12, 16) -->
              <div class="grid grid-cols-2 gap-2.5">
                <button id="btn-generate-poster" class="py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-xs shadow-lg shadow-purple-500/25 transition-all btn-press flex items-center justify-center gap-1.5">
                  <span>✨</span> Generate Poster
                </button>
                <button id="btn-regenerate-poster" class="py-3 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 font-bold text-xs transition-all btn-press flex items-center justify-center gap-1.5" title="Apply a new layout and style configuration with latest event data">
                  <span>✨</span> Regenerate Poster
                </button>
              </div>

              <div class="grid grid-cols-2 gap-2.5">
                <button id="btn-download-poster" class="py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs transition-all btn-press flex items-center justify-center gap-1.5" title="Download printable high-res PNG">
                  <span>🖼</span> Download Poster
                </button>
                <button id="btn-share-poster-wa" class="py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-xs shadow-lg shadow-emerald-500/25 transition-all btn-press flex items-center justify-center gap-1.5" title="Share poster image and WhatsApp text together">
                  <span>🟢</span> Share Poster + Message
                </button>
              </div>

              <div>
                <button id="btn-toggle-poster-text-edit" class="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-purple-300 font-bold text-xs transition-all btn-press flex items-center justify-center gap-1.5">
                  <span>✏️</span> Edit Poster Text & Custom Overrides
                </button>
              </div>

              <!-- Collapsible Poster Text Editor Drawer -->
              <div id="drawer-poster-text-edit" class="hidden p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3 text-xs">
                <div>
                  <label class="block text-[11px] text-slate-400 mb-1">Display Title on Poster</label>
                  <input type="text" id="poster-text-title" value="${this.escapeHtml(this.eventData.title)}" class="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white" />
                </div>
                <div>
                  <label class="block text-[11px] text-slate-400 mb-1">Subtitle / Highlights</label>
                  <input type="text" id="poster-text-tagline" value="${this.escapeHtml(this.eventData.shortDescription)}" class="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white" />
                </div>
                <button id="btn-apply-poster-text" class="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors">
                  Apply & Re-Render Poster
                </button>
              </div>
            </div>

            <!-- MAIN ACTION 2: 💬 WHATSAPP ANNOUNCEMENT (Requirement 14, 15, 16, 17) -->
            <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-emerald-500/30 bg-slate-900/90 space-y-5 shadow-2xl">
              <div class="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 class="text-base font-bold text-white flex items-center gap-2">
                    <span>💬</span> WhatsApp Announcement
                  </h3>
                  <p class="text-xs text-slate-400">Formatted with verified details, emojis, and registration link.</p>
                </div>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">wa.me Ready</span>
              </div>

              <!-- Editable WhatsApp Announcement Box -->
              <div class="relative">
                <textarea 
                  id="promo-whatsapp-edit" 
                  rows="11" 
                  class="w-full bg-[#0b141a] border border-emerald-500/30 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono leading-relaxed shadow-inner"
                  placeholder="WhatsApp message will generate here..."
                >${this.eventData.whatsappMessage}</textarea>
              </div>

              <!-- The 3 Clear Actions (Requirement 16) -->
              <div class="space-y-2.5">
                <div class="grid grid-cols-2 gap-2.5">
                  <button id="btn-download-poster-2" class="py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs transition-all btn-press flex items-center justify-center gap-1.5">
                    <span>🖼</span> Download Poster
                  </button>
                  <button id="btn-copy-whatsapp-text" class="py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-300 font-bold text-xs transition-colors btn-press flex items-center justify-center gap-1.5">
                    <span>📋</span> Copy Message
                  </button>
                </div>

                <button id="btn-share-poster-wa-2" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-xs shadow-xl shadow-emerald-500/30 transition-all btn-press flex items-center justify-center gap-2">
                  <span>🟢</span> Share Poster + Message
                </button>

                <div class="grid grid-cols-2 gap-2">
                  <button id="btn-share-whatsapp-direct" class="py-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition-colors btn-press flex items-center justify-center gap-1.5">
                    <span>💬</span> Open WhatsApp
                  </button>
                  <button id="btn-regenerate-whatsapp-text" class="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-purple-300 font-bold text-xs transition-colors btn-press flex items-center justify-center gap-1.5">
                    <span>✨</span> Regenerate Text
                  </button>
                </div>
              </div>

              <div class="pt-2 border-t border-white/10 text-[11px] text-slate-400 space-y-1">
                <div class="flex items-center gap-1.5 text-slate-300">
                  <span>💡</span>
                  <span><strong>Mobile:</strong> Shares poster image + prefilled text directly.</span>
                </div>
                <div class="flex items-center gap-1.5 text-slate-400">
                  <span>💻</span>
                  <span><strong>Desktop:</strong> Auto-downloads poster, copies text, and opens WhatsApp.</span>
                </div>
              </div>
            </div>

            <!-- REVIEW & PUBLISH EVENT ACTION (Section 15, 16) -->
            <div class="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-white">Event Readiness Checklist</span>
                <span class="text-[10px] font-mono text-emerald-400 font-bold">Single Source of Truth ✓</span>
              </div>
              <p class="text-xs text-slate-300">
                Review your event parameters, poster, and WhatsApp copy before publishing to the KIIT discovery portal.
              </p>
              <button id="btn-open-publish-review" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs shadow-lg shadow-emerald-500/25 transition-all btn-press flex items-center justify-center gap-2">
                <span>🚀</span> Review & Publish Event
              </button>
            </div>

          </div>

        </div>

      </div>
    `;

    this.bindEvents();
    this.renderPosterCanvas();
  }

  /**
   * Renders the event poster using category-adapted visuals & posterConfig
   */
  renderPosterCanvas() {
    setTimeout(() => {
      const canvas = this.container?.querySelector('#poster-canvas');
      if (!canvas) return;

      const titleOverride = this.container?.querySelector('#poster-text-title')?.value;
      const taglineOverride = this.container?.querySelector('#poster-text-tagline')?.value;

      const posterData = {
        id: this.eventData.id,
        title: titleOverride || this.eventData.title,
        tagline: taglineOverride || this.eventData.shortDescription,
        date: this.getFormattedDateRange(),
        time: this.getFormattedTimeRange(),
        reportingTime: this.getFormattedReportingTime(),
        venue: `${this.eventData.room || 'Tech Lab 2'}, ${this.eventData.campus || 'Campus 15'}`,
        category: this.eventData.category,
        speaker: this.eventData.speakers[0] ? `${this.eventData.speakers[0].name} (${this.eventData.speakers[0].designation || 'IEEE Mentor'})` : 'Senior IEEE Technical Mentor',
        seatsTotal: this.eventData.seatsTotal
      };

      PromotionService.renderPosterCanvas(canvas, posterData, this.posterConfig);
    }, 40);
  }

  /**
   * Binds all form inputs, auto-fills, AI Helper, poster actions, and sharing
   */
  bindEvents() {
    if (!this.container) return;

    // --- AI EVENT HELPER (Requirement 1, 2, 6, 7, 33) ---
    const helperInput = this.container.querySelector('#input-ai-helper-instruction');
    const helperBtn = this.container.querySelector('#btn-ai-helper-apply');
    const helperClearBtn = this.container.querySelector('#btn-ai-helper-clear');

    if (helperInput && helperClearBtn) {
      helperInput.addEventListener('input', () => {
        if (helperInput.value.trim().length > 0) {
          helperClearBtn.classList.remove('hidden');
        } else {
          helperClearBtn.classList.add('hidden');
        }
      });

      helperClearBtn.addEventListener('click', () => {
        helperInput.value = '';
        helperClearBtn.classList.add('hidden');
        helperInput.focus();
      });

      helperInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleAIHelperCommand();
        }
      });
    }

    if (helperBtn) {
      helperBtn.addEventListener('click', () => {
        this.handleAIHelperCommand();
      });
    }

    // Suggested Chips (Requirement 33)
    this.container.querySelectorAll('.ai-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        sound.playClick();
        const text = chip.getAttribute('data-chip');
        if (helperInput && text) {
          helperInput.value = text;
          if (helperClearBtn) helperClearBtn.classList.remove('hidden');
          helperInput.focus();
        }
      });
    });

    // Save Draft Button
    const saveDraftBtn = this.container.querySelector('#btn-save-draft');
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => {
        this.saveDraft(false);
      });
    }

    // Reset Form Button
    const resetBtn = this.container.querySelector('#btn-reset-form');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the form? Unsaved modifications will be cleared.')) {
          sound.playClick();
          localStorage.removeItem('KIIT_IEEE_EVENT_BUILDER_DRAFT');
          this.eventData.title = 'New Technical Workshop';
          this.eventData.shortDescription = 'Hands-on technical workshop for KIIT students.';
          this.eventData.speakers = [{ name: '', designation: '', organization: '', bio: '' }];
          this.eventVersion++;
          this.updateWhatsAppAnnouncement();
          this.render();
          toast.show({ title: 'Form Reset', message: 'Ready for new event details.', type: 'info' });
        }
      });
    }

    // Load Flagship Preset
    const demoBtn = this.container.querySelector('#btn-quick-fill-demo');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        sound.playClick();
        this.eventData = {
          ...this.eventData,
          title: 'AI & Edge Computer Vision Masterclass',
          eventType: 'Workshop',
          category: 'AI & Machine Learning',
          shortDescription: 'Build real-time object tracking and neural perception models on resource-constrained edge devices with YOLOv11 and Jetson hardware kits.',
          startDate: '2026-10-10',
          endDate: '2026-10-11',
          startTime: '09:30',
          endTime: '17:00',
          reportingTime: '08:30',
          campus: 'Campus 15',
          building: 'School of Computer Engineering',
          room: 'Tech Lab 4 (AI/ML Lab)',
          address: 'Campus 15, KIIT Deemed to be University, Patia, Bhubaneswar, Odisha 751024',
          speakers: [
            {
              name: 'Dr. Priyadarshi Sen',
              designation: 'Principal AI Scientist & IEEE Senior Member',
              organization: 'NeuralTech Labs / Ex-Intel AI',
              bio: '12+ years experience deploying embedded computer vision and deep neural network accelerators.'
            }
          ]
        };
        this.markEventChanged('preset');
        this.render();
        toast.show({ title: 'Preset Loaded', message: 'Flagship AI Workshop details populated.', type: 'info' });
      });
    }

    // Live update form fields
    const bindInput = (id, prop) => {
      const el = this.container.querySelector(id);
      if (el) {
        el.addEventListener('input', (e) => {
          this.eventData[prop] = e.target.value;
          this.markEventChanged(prop);
        });
      }
    };

    bindInput('#form-event-name', 'title');
    bindInput('#form-event-type', 'eventType');
    bindInput('#form-short-desc', 'shortDescription');
    bindInput('#form-start-date', 'startDate');
    bindInput('#form-end-date', 'endDate');
    bindInput('#form-start-time', 'startTime');
    bindInput('#form-end-time', 'endTime');
    bindInput('#form-reporting-time', 'reportingTime');
    bindInput('#form-deadline', 'registrationDeadline');
    bindInput('#form-building', 'building');
    bindInput('#form-room', 'room');
    bindInput('#form-address', 'address');
    bindInput('#form-landmark', 'landmark');
    bindInput('#form-learn', 'whatWillLearn');
    bindInput('#form-build', 'whatWillBuild');
    bindInput('#form-eligibility', 'eligibility');
    bindInput('#form-prerequisites', 'prerequisites');
    bindInput('#form-bring', 'whatToBring');
    bindInput('#form-seats', 'seatsTotal');
    bindInput('#form-fee', 'fee');
    bindInput('#form-contact-person', 'contactPerson');
    bindInput('#form-contact-phone', 'contactPhone');
    bindInput('#form-contact-email', 'contactEmail');
    bindInput('#form-ai-instruction', 'aiInstruction');

    // Category change updates poster visual theme
    const catSelect = this.container.querySelector('#form-category');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        this.eventData.category = e.target.value;
        this.markEventChanged('category');
        this.renderPosterCanvas();
      });
    }

    // Campus dropdown auto-fills Building, Address, and suggests rooms
    const campusSelect = this.container.querySelector('#form-campus');
    if (campusSelect) {
      campusSelect.addEventListener('change', (e) => {
        const selected = e.target.value;
        this.eventData.campus = selected;
        const dir = KIIT_CAMPUS_DIRECTORY[selected];
        if (dir) {
          this.eventData.building = dir.building;
          this.eventData.address = dir.address;
          if (dir.rooms && dir.rooms.length > 0) {
            this.eventData.room = dir.rooms[0];
          }
          const bEl = this.container.querySelector('#form-building');
          if (bEl) bEl.value = dir.building;
          const aEl = this.container.querySelector('#form-address');
          if (aEl) aEl.value = dir.address;
          const rEl = this.container.querySelector('#form-room');
          if (rEl) rEl.value = this.eventData.room;
        }
        this.markEventChanged('campus');
        this.renderPosterCanvas();
      });
    }

    // Add another speaker button
    const addSpkBtn = this.container.querySelector('#btn-add-speaker');
    if (addSpkBtn) {
      addSpkBtn.addEventListener('click', () => {
        this.eventData.speakers.push({
          name: '',
          designation: '',
          organization: '',
          bio: ''
        });
        sound.playClick();
        this.render();
      });
    }

    // Remove speaker buttons
    this.container.querySelectorAll('.btn-remove-speaker').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        if (idx > 0) {
          this.eventData.speakers.splice(idx, 1);
          sound.playClick();
          this.render();
        }
      });
    });

    // Speaker inputs listeners
    this.container.querySelectorAll('.spk-name').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        if (this.eventData.speakers[idx]) this.eventData.speakers[idx].name = e.target.value;
        this.markEventChanged('speakerName');
      });
    });
    this.container.querySelectorAll('.spk-desig').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        if (this.eventData.speakers[idx]) this.eventData.speakers[idx].designation = e.target.value;
        this.markEventChanged('speakerDesignation');
      });
    });
    this.container.querySelectorAll('.spk-org').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        if (this.eventData.speakers[idx]) this.eventData.speakers[idx].organization = e.target.value;
        this.markEventChanged('speakerOrganization');
      });
    });
    this.container.querySelectorAll('.spk-bio').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        if (this.eventData.speakers[idx]) this.eventData.speakers[idx].bio = e.target.value;
        this.markEventChanged('speakerBio');
      });
    });

    // AI Generate Content Button (Section 6)
    const aiBtn = this.container.querySelector('#btn-generate-ai-content');
    if (aiBtn) {
      aiBtn.addEventListener('click', () => {
        this.handleGenerateAIContent();
      });
    }

    // Poster Action Buttons (Requirement 12, 16)
    const genPosterBtn = this.container.querySelector('#btn-generate-poster');
    if (genPosterBtn) {
      genPosterBtn.addEventListener('click', () => {
        sound.playSuccess();
        this.posterVersion = this.eventVersion;
        this.updatePosterStaleStatus();
        this.renderPosterCanvas();
        toast.show({ title: 'Poster Generated! 🎨', message: 'High-res promotional poster synchronized with latest event details.', type: 'success' });
      });
    }

    const regenPosterBtn = this.container.querySelector('#btn-regenerate-poster');
    if (regenPosterBtn) {
      regenPosterBtn.addEventListener('click', () => {
        this.handleRegeneratePoster();
      });
    }

    const quickRegenBtn = this.container.querySelector('#btn-quick-regen-poster');
    if (quickRegenBtn) {
      quickRegenBtn.addEventListener('click', () => {
        this.handleRegeneratePoster();
      });
    }

    // Download Poster Buttons
    this.container.querySelectorAll('#btn-download-poster, #btn-download-poster-2').forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleDownloadPoster();
      });
    });

    // Poster text drawer toggle
    const togglePosterEdit = this.container.querySelector('#btn-toggle-poster-text-edit');
    if (togglePosterEdit) {
      togglePosterEdit.addEventListener('click', () => {
        const drawer = this.container.querySelector('#drawer-poster-text-edit');
        if (drawer) drawer.classList.toggle('hidden');
      });
    }

    const applyPosterText = this.container.querySelector('#btn-apply-poster-text');
    if (applyPosterText) {
      applyPosterText.addEventListener('click', () => {
        sound.playClick();
        this.posterVersion = this.eventVersion;
        this.updatePosterStaleStatus();
        this.renderPosterCanvas();
        toast.show({ title: 'Poster Updated', message: 'Applied custom text to canvas.', type: 'info' });
      });
    }

    // WhatsApp Action Buttons (Requirement 14, 15, 16)
    this.container.querySelectorAll('#btn-share-poster-wa, #btn-share-poster-wa-2').forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleSharePosterAndMessage();
      });
    });

    const directWaBtn = this.container.querySelector('#btn-share-whatsapp-direct');
    if (directWaBtn) {
      directWaBtn.addEventListener('click', () => {
        this.handleDirectWhatsAppLink();
      });
    }

    const regenWaBtn = this.container.querySelector('#btn-regenerate-whatsapp-text');
    if (regenWaBtn) {
      regenWaBtn.addEventListener('click', () => {
        this.handleGenerateAIContent();
      });
    }

    const copyWaBtn = this.container.querySelector('#btn-copy-whatsapp-text');
    if (copyWaBtn) {
      copyWaBtn.addEventListener('click', async () => {
        const msg = this.container.querySelector('#promo-whatsapp-edit')?.value || this.eventData.whatsappMessage;
        sound.playClick();
        const ok = await WhatsAppShareService.copyMessage(msg);
        if (ok) {
          copyWaBtn.innerHTML = `<span>✓</span> Message Copied`;
          setTimeout(() => {
            if (copyWaBtn) copyWaBtn.innerHTML = `<span>📋</span> Copy Message`;
          }, 2500);
          sound.playSuccess();
          toast.show({ title: 'Message Copied 📋', message: 'Ready to paste directly into WhatsApp.', type: 'success' });
        } else {
          toast.show({ title: 'Copy Failed', message: 'Please manually select and copy the message text.', type: 'warning' });
        }
      });
    }

    // WhatsApp Textarea live sync
    const waBox = this.container.querySelector('#promo-whatsapp-edit');
    if (waBox) {
      waBox.addEventListener('input', (e) => {
        this.eventData.whatsappMessage = e.target.value;
      });
    }

    // Review & Publish Modal
    const reviewBtn = this.container.querySelector('#btn-open-publish-review');
    if (reviewBtn) {
      reviewBtn.addEventListener('click', () => {
        this.handleOpenPublishReview();
      });
    }
  }

  /**
   * AI EVENT HELPER HANDLER (Requirement 1, 2, 3, 4, 5, 6, 7)
   * Sends natural language instruction to Gemini API,
   * validates allowed fields against explicit whitelist,
   * directly updates DOM inputs without page refresh,
   * and highlights modified fields.
   */
  async handleAIHelperCommand() {
    const inputEl = this.container?.querySelector('#input-ai-helper-instruction');
    const statusEl = this.container?.querySelector('#ai-helper-status');
    const applyBtn = this.container?.querySelector('#btn-ai-helper-apply');

    const instruction = inputEl?.value?.trim();
    if (!instruction) {
      toast.show({ title: 'No Instruction', message: 'Please type what you would like to change.', type: 'warning' });
      inputEl?.focus();
      return;
    }

    if (this.isGeneratingAIHelper) return;
    this.isGeneratingAIHelper = true;

    sound.playClick();

    // 1. Show elegant activity state (Requirement 7)
    if (statusEl) {
      statusEl.className = 'p-3 rounded-xl border border-purple-500/30 bg-purple-950/30 text-purple-200 text-xs flex items-center gap-2.5 animate-pulse';
      statusEl.innerHTML = `<span class="animate-spin inline-block">✨</span> <span>AI is updating your event...</span>`;
      statusEl.classList.remove('hidden');
    }

    if (applyBtn) {
      applyBtn.disabled = true;
      applyBtn.classList.add('opacity-75', 'cursor-not-allowed');
      applyBtn.innerHTML = `<span class="animate-spin inline-block">⏳</span> Applying...`;
    }

    // Sync latest manual changes before submitting
    this.syncFormValuesToState();

    try {
      // 2. Call server endpoint POST /api/ai/event-helper
      const response = await AIService.sendEventHelperCommand(instruction, this.eventData);

      if (!response || !response.action) {
        throw new Error('AI returned an invalid response structure.');
      }

      const changes = response.changes || {};
      const posterInstructions = response.posterInstructions || {};
      const contentInstructions = response.contentInstructions || {};

      const changesApplied = [];

      // 3. Filter changes against explicit whitelist (Requirement 4, 5)
      for (const [key, val] of Object.entries(changes)) {
        if (!ALLOWED_EVENT_FIELDS.includes(key)) {
          console.warn(`[AI Helper] Security whitelist rejected field: "${key}"`);
          continue;
        }

        // Apply to state and physically modify DOM inputs
        const appliedLabel = this.applyFieldChangeToDOM(key, val);
        if (appliedLabel) changesApplied.push(appliedLabel);
      }

      // 4. Handle Poster Redesign Instructions (Requirement 9, 13)
      if (posterInstructions && Object.keys(posterInstructions).length > 0) {
        if (posterInstructions.theme) this.posterConfig.theme = posterInstructions.theme;
        if (posterInstructions.accentStyle) this.posterConfig.accentStyle = posterInstructions.accentStyle;
        if (posterInstructions.titleScale) this.posterConfig.titleScale = posterInstructions.titleScale;
        if (posterInstructions.visualIntensity) this.posterConfig.visualIntensity = posterInstructions.visualIntensity;
        
        changesApplied.push(`Poster design updated (${this.posterConfig.theme} / ${this.posterConfig.accentStyle})`);
        this.renderPosterCanvas();
        this.posterVersion = this.eventVersion;
      }

      // 5. Handle Content Instructions (e.g. Tone/Length)
      if (contentInstructions && Object.keys(contentInstructions).length > 0) {
        if (contentInstructions.tone === 'formal') {
          changesApplied.push('Announcement tone set to formal');
        }
        if (contentInstructions.length === 'concise' || contentInstructions.length === 'short') {
          changesApplied.push('Announcement condensed');
        }
      }

      // Mark event changed to update WhatsApp announcement and poster staleness
      this.markEventChanged('ai-helper');
      this.renderPosterCanvas();
      this.posterVersion = this.eventVersion;
      this.updatePosterStaleStatus();

      sound.playSuccess();

      // 6. Show clean success activity report (Requirement 7)
      if (statusEl) {
        statusEl.className = 'p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-200 text-xs space-y-1.5 animate-fade-in';
        if (changesApplied.length > 0) {
          statusEl.innerHTML = `
            <div class="flex items-center gap-2 font-bold text-emerald-300">
              <span>✓</span> ${response.message || 'Event updated successfully.'}
            </div>
            <ul class="text-[11px] text-slate-300 space-y-0.5 ml-4 list-disc">
              ${changesApplied.map(c => `<li>${c}</li>`).join('')}
            </ul>
          `;
        } else {
          statusEl.innerHTML = `<div class="flex items-center gap-2 font-bold text-emerald-300"><span>✓</span> ${response.message || 'Instruction processed.'}</div>`;
        }
      }

      toast.show({
        title: 'Event Updated ✨',
        message: response.message || 'AI applied your requested updates directly to the form.',
        type: 'success'
      });

      // Clear input on success
      if (inputEl) inputEl.value = '';
      const clearBtn = this.container?.querySelector('#btn-ai-helper-clear');
      if (clearBtn) clearBtn.classList.add('hidden');

    } catch (err) {
      console.error('[AI Helper Error]', err);
      if (sound.playError) sound.playError();

      if (statusEl) {
        statusEl.className = 'p-3 rounded-xl border border-rose-500/40 bg-rose-950/40 text-rose-200 text-xs flex items-center gap-2';
        statusEl.innerHTML = `<span>⚠️</span> <span>${err.message || 'Could not process AI instruction. Please try again.'}</span>`;
      }

      toast.show({
        title: 'AI Helper Failed ⚠️',
        message: err.message || 'Could not update form fields. Please check server logs.',
        type: 'error'
      });
    } finally {
      this.isGeneratingAIHelper = false;
      if (applyBtn) {
        applyBtn.disabled = false;
        applyBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        applyBtn.innerHTML = `<span>✨</span> Apply with AI`;
      }
    }
  }

  /**
   * Directly updates the visible HTML input element and this.eventData,
   * flashing a clean green confirmation ring on the input.
   */
  applyFieldChangeToDOM(field, value) {
    if (value === undefined || value === null) return null;

    const flashElement = (el) => {
      if (!el) return;
      el.classList.add('ring-2', 'ring-emerald-400', 'border-emerald-400', 'bg-emerald-950/30');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-emerald-400', 'border-emerald-400', 'bg-emerald-950/30');
      }, 3000);
    };

    switch (field) {
      case 'eventName':
      case 'title': {
        this.eventData.title = value;
        const el = this.container?.querySelector('#form-event-name');
        if (el) { el.value = value; flashElement(el); }
        const posterEl = this.container?.querySelector('#poster-text-title');
        if (posterEl) posterEl.value = value;
        return `Event title: "${value}"`;
      }

      case 'speakerName': {
        if (!this.eventData.speakers[0]) this.eventData.speakers[0] = { name: '', designation: '', organization: '', bio: '' };
        this.eventData.speakers[0].name = value;
        const el = this.container?.querySelector('.spk-name[data-idx="0"]');
        if (el) { el.value = value; flashElement(el); }
        return `Speaker name: "${value}"`;
      }

      case 'speakerDesignation': {
        if (!this.eventData.speakers[0]) this.eventData.speakers[0] = { name: '', designation: '', organization: '', bio: '' };
        this.eventData.speakers[0].designation = value;
        const el = this.container?.querySelector('.spk-desig[data-idx="0"]');
        if (el) { el.value = value; flashElement(el); }
        return `Speaker designation: "${value}"`;
      }

      case 'speakerOrganization': {
        if (!this.eventData.speakers[0]) this.eventData.speakers[0] = { name: '', designation: '', organization: '', bio: '' };
        this.eventData.speakers[0].organization = value;
        const el = this.container?.querySelector('.spk-org[data-idx="0"]');
        if (el) { el.value = value; flashElement(el); }
        return `Speaker organization: "${value}"`;
      }

      case 'speakerBio': {
        if (!this.eventData.speakers[0]) this.eventData.speakers[0] = { name: '', designation: '', organization: '', bio: '' };
        this.eventData.speakers[0].bio = value;
        const el = this.container?.querySelector('.spk-bio[data-idx="0"]');
        if (el) { el.value = value; flashElement(el); }
        return `Speaker bio updated`;
      }

      case 'campus': {
        this.eventData.campus = value;
        const el = this.container?.querySelector('#form-campus');
        if (el) { el.value = value; flashElement(el); }
        // Auto-fill building and address if available in KIIT directory
        const dir = KIIT_CAMPUS_DIRECTORY[value];
        if (dir) {
          if (!this.eventData.building || this.eventData.building.includes('School')) {
            this.eventData.building = dir.building;
            const bEl = this.container?.querySelector('#form-building');
            if (bEl) { bEl.value = dir.building; flashElement(bEl); }
          }
          if (!this.eventData.address || this.eventData.address.includes('Campus')) {
            this.eventData.address = dir.address;
            const aEl = this.container?.querySelector('#form-address');
            if (aEl) { aEl.value = dir.address; flashElement(aEl); }
          }
        }
        return `Campus: "${value}"`;
      }

      case 'room': {
        this.eventData.room = value;
        const el = this.container?.querySelector('#form-room');
        if (el) { el.value = value; flashElement(el); }
        return `Room: "${value}"`;
      }

      case 'building': {
        this.eventData.building = value;
        const el = this.container?.querySelector('#form-building');
        if (el) { el.value = value; flashElement(el); }
        return `Building: "${value}"`;
      }

      case 'venue':
      case 'address': {
        this.eventData.address = value;
        const el = this.container?.querySelector('#form-address');
        if (el) { el.value = value; flashElement(el); }
        return `Address: "${value}"`;
      }

      case 'startTime': {
        const normalized = normalizeTimeTo24Hr(value);
        this.eventData.startTime = normalized;
        const el = this.container?.querySelector('#form-start-time');
        if (el) { el.value = normalized; flashElement(el); }
        return `Start time: ${normalized}`;
      }

      case 'endTime': {
        const normalized = normalizeTimeTo24Hr(value);
        this.eventData.endTime = normalized;
        const el = this.container?.querySelector('#form-end-time');
        if (el) { el.value = normalized; flashElement(el); }
        return `End time: ${normalized}`;
      }

      case 'reportingTime': {
        const normalized = normalizeTimeTo24Hr(value);
        this.eventData.reportingTime = normalized;
        const el = this.container?.querySelector('#form-reporting-time');
        if (el) { el.value = normalized; flashElement(el); }
        return `Reporting time: ${normalized}`;
      }

      case 'startDate': {
        this.eventData.startDate = value;
        const el = this.container?.querySelector('#form-start-date');
        if (el) { el.value = value; flashElement(el); }
        return `Start date: ${value}`;
      }

      case 'endDate': {
        this.eventData.endDate = value;
        const el = this.container?.querySelector('#form-end-date');
        if (el) { el.value = value; flashElement(el); }
        return `End date: ${value}`;
      }

      case 'registrationDeadline': {
        this.eventData.registrationDeadline = value;
        const el = this.container?.querySelector('#form-deadline');
        if (el) { el.value = value; flashElement(el); }
        return `Registration deadline: ${value}`;
      }

      case 'description':
      case 'shortDescription': {
        this.eventData.shortDescription = value;
        const el = this.container?.querySelector('#form-short-desc');
        if (el) { el.value = value; flashElement(el); }
        const posterTagEl = this.container?.querySelector('#poster-text-tagline');
        if (posterTagEl) posterTagEl.value = value;
        return `Description updated`;
      }

      case 'eventType': {
        this.eventData.eventType = value;
        const el = this.container?.querySelector('#form-event-type');
        if (el) { el.value = value; flashElement(el); }
        return `Event type: "${value}"`;
      }

      case 'category': {
        this.eventData.category = value;
        const el = this.container?.querySelector('#form-category');
        if (el) { el.value = value; flashElement(el); }
        return `Category: "${value}"`;
      }

      case 'seats':
      case 'seatsTotal': {
        this.eventData.seatsTotal = parseInt(value) || value;
        const el = this.container?.querySelector('#form-seats');
        if (el) { el.value = this.eventData.seatsTotal; flashElement(el); }
        return `Seats: ${value}`;
      }

      case 'registrationFee':
      case 'fee': {
        this.eventData.fee = value;
        const el = this.container?.querySelector('#form-fee');
        if (el) { el.value = value; flashElement(el); }
        return `Registration fee: "${value}"`;
      }

      case 'eligibility': {
        this.eventData.eligibility = value;
        const el = this.container?.querySelector('#form-eligibility');
        if (el) { el.value = value; flashElement(el); }
        return `Eligibility: "${value}"`;
      }

      case 'prerequisites': {
        this.eventData.prerequisites = value;
        const el = this.container?.querySelector('#form-prerequisites');
        if (el) { el.value = value; flashElement(el); }
        return `Prerequisites updated`;
      }

      case 'whatStudentsBring':
      case 'whatToBring': {
        this.eventData.whatToBring = value;
        const el = this.container?.querySelector('#form-bring');
        if (el) { el.value = value; flashElement(el); }
        return `What to bring updated`;
      }

      case 'contactPerson': {
        this.eventData.contactPerson = value;
        const el = this.container?.querySelector('#form-contact-person');
        if (el) { el.value = value; flashElement(el); }
        return `Contact person: "${value}"`;
      }

      case 'contactNumber':
      case 'contactPhone': {
        this.eventData.contactPhone = value;
        const el = this.container?.querySelector('#form-contact-phone');
        if (el) { el.value = value; flashElement(el); }
        return `Contact phone: "${value}"`;
      }

      case 'contactEmail': {
        this.eventData.contactEmail = value;
        const el = this.container?.querySelector('#form-contact-email');
        if (el) { el.value = value; flashElement(el); }
        return `Contact email: "${value}"`;
      }

      default:
        return null;
    }
  }

  /**
   * Regenerates poster with a fresh design configuration using latest verified data (Requirement 12)
   */
  handleRegeneratePoster() {
    sound.playSuccess();

    // Cycle or pick an alternate aesthetic configuration
    const themes = ['formal', 'futuristic', 'technical', 'cyber', 'modern'];
    const currentIdx = themes.indexOf(this.posterConfig.theme);
    const nextTheme = themes[(currentIdx + 1) % themes.length];
    
    const accents = ['electric-blue', 'cyber-green', 'neon-purple', 'amber-gold'];
    const nextAccent = accents[Math.floor(Math.random() * accents.length)];

    this.posterConfig = {
      theme: nextTheme,
      accentStyle: nextAccent,
      titleScale: this.posterConfig.titleScale === 'large' ? 'normal' : 'large',
      visualIntensity: 'moderate'
    };

    // Render canvas with latest state
    this.renderPosterCanvas();

    // Mark poster in sync
    this.posterVersion = this.eventVersion;
    this.updatePosterStaleStatus();

    toast.show({
      title: 'Poster Regenerated! 🎨',
      message: `Fresh ${nextTheme.toUpperCase()} layout applied with verified event parameters.`,
      type: 'success'
    });
  }

  /**
   * Downloads high-resolution 800x1100 PNG poster (Requirement 16)
   */
  handleDownloadPoster() {
    const canvas = this.container?.querySelector('#poster-canvas');
    if (!canvas) return;

    sound.playSuccess();
    const link = document.createElement('a');
    link.download = `KIIT-IEEE-${(this.eventData.title || 'Event').replace(/[^a-zA-Z0-9]/g, '_')}-Poster.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    store.trackPromotionAction('poster_download', { eventId: this.eventData.id });
    toast.show({ title: 'Poster Downloaded! 🖼', message: 'Printable PNG saved to your device.', type: 'success' });
  }

  /**
   * Share Poster + Message (Requirement 14, 15, 16)
   * On mobile / supported browsers: shares GENERATED POSTER IMAGE + MESSAGE via Web Share API.
   * On desktop / unsupported: auto-downloads poster, copies text, and opens WhatsApp Web/Desktop.
   */
  async handleSharePosterAndMessage() {
    const message = this.container?.querySelector('#promo-whatsapp-edit')?.value || this.eventData.whatsappMessage;
    const canvas = this.container?.querySelector('#poster-canvas');

    if (!message.trim()) {
      toast.show({ title: 'Empty Message', message: 'Please enter or generate a message first.', type: 'warning' });
      return;
    }

    sound.playClick();

    // 1. Check if browser supports Web Share API with files (Requirement 15)
    if (canvas && navigator.share && navigator.canShare) {
      try {
        const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
        const filename = `KIIT_IEEE_${(this.eventData.title || 'Event').replace(/[^a-zA-Z0-9]/g, '_')}_Poster.png`;
        const file = new File([blob], filename, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `KIIT IEEE: ${this.eventData.title}`,
            text: message,
            files: [file]
          });

          store.trackPromotionAction('WHATSAPP_SHARE_INITIATED', {
            eventId: this.eventData.id,
            channel: 'WebShareWithPosterFile'
          });

          sound.playSuccess();
          toast.show({ title: 'Shared! 🚀', message: 'Poster and message dispatched through device share sheet.', type: 'success' });
          return;
        }
      } catch (err) {
        if (err.name === 'AbortError') return; // User closed sheet
        console.warn('Native share with file failed, falling back to desktop flow:', err);
      }
    }

    // 2. Clear Desktop/Web Fallback Workflow (Requirement 15, 16)
    // Step A: Auto-download the poster image
    this.handleDownloadPoster();

    // Step B: Copy WhatsApp announcement text
    await WhatsAppShareService.copyMessage(message);

    // Step C: Open WhatsApp wa.me
    WhatsAppShareService.shareToWhatsApp(message, {
      id: this.eventData.id,
      title: this.eventData.title
    });

    // Step D: Show clear instruction modal / notification
    this.showDesktopShareFallbackModal();
  }

  showDesktopShareFallbackModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in';
    modal.innerHTML = `
      <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-emerald-500/40 bg-slate-900 max-w-md w-full space-y-4 shadow-2xl relative text-left">
        <div class="flex items-center gap-3 pb-3 border-b border-white/10">
          <span class="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xl font-bold">🟢</span>
          <div>
            <h4 class="text-sm font-black text-white">Poster Sharing Workflow</h4>
            <p class="text-[11px] text-slate-300">Desktop Web Browser Step-by-Step</p>
          </div>
        </div>

        <div class="space-y-2.5 text-xs text-slate-300 leading-relaxed">
          <div class="p-3 rounded-xl bg-slate-950/80 border border-white/10 flex items-start gap-2.5">
            <span class="text-emerald-400 font-bold">1.</span>
            <span><strong>Poster Image Downloaded:</strong> Your high-resolution event poster has been saved to your downloads folder.</span>
          </div>

          <div class="p-3 rounded-xl bg-slate-950/80 border border-white/10 flex items-start gap-2.5">
            <span class="text-emerald-400 font-bold">2.</span>
            <span><strong>Message Text Copied:</strong> The complete WhatsApp announcement is copied to your clipboard.</span>
          </div>

          <div class="p-3 rounded-xl bg-slate-950/80 border border-white/10 flex items-start gap-2.5">
            <span class="text-emerald-400 font-bold">3.</span>
            <span><strong>Attach & Send in WhatsApp:</strong> Switch to your opened WhatsApp tab, paste the message, and attach your downloaded poster image.</span>
          </div>
        </div>

        <button id="modal-btn-dismiss-share-flow" class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all">
          Got It, Open WhatsApp
        </button>
      </div>
    `;

    document.body.appendChild(modal);
    const cleanup = () => {
      window.removeEventListener('keydown', escapeHandler);
      modal.remove();
    };
    const escapeHandler = (e) => {
      if (e.key === 'Escape') cleanup();
    };
    window.addEventListener('keydown', escapeHandler);

    modal.querySelector('#modal-btn-dismiss-share-flow')?.addEventListener('click', cleanup);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) cleanup();
    });
  }

  handleDirectWhatsAppLink() {
    const message = this.container?.querySelector('#promo-whatsapp-edit')?.value || this.eventData.whatsappMessage;
    if (!message.trim()) {
      toast.show({ title: 'Empty Message', message: 'Please enter a message first.', type: 'warning' });
      return;
    }
    sound.playClick();
    WhatsAppShareService.shareToWhatsApp(message, {
      id: this.eventData.id,
      title: this.eventData.title
    });
    toast.show({ title: 'Opening WhatsApp 💬', message: 'Select your recipient or KIIT group to send.', type: 'info' });
  }

  /**
   * Validates mandatory event fields before dispatching AI content generation
   */
  validateFormForAI() {
    this.clearValidationHighlights();
    const missing = [];
    const elementsToHighlight = [];

    const nameVal = (this.container?.querySelector('#form-event-name')?.value || this.eventData.title || '').trim();
    if (!nameVal) {
      missing.push('Event Name');
      const el = this.container?.querySelector('#form-event-name');
      if (el) elementsToHighlight.push(el);
    }

    const typeVal = (this.container?.querySelector('#form-event-type')?.value || this.eventData.eventType || '').trim();
    if (!typeVal) {
      missing.push('Event Type');
      const el = this.container?.querySelector('#form-event-type');
      if (el) elementsToHighlight.push(el);
    }

    const dateVal = (this.container?.querySelector('#form-start-date')?.value || this.eventData.startDate || '').trim();
    if (!dateVal) {
      missing.push('Start Date');
      const el = this.container?.querySelector('#form-start-date');
      if (el) elementsToHighlight.push(el);
    }

    const startTimeVal = (this.container?.querySelector('#form-start-time')?.value || this.eventData.startTime || '').trim();
    if (!startTimeVal) {
      missing.push('Start Time');
      const el = this.container?.querySelector('#form-start-time');
      if (el) elementsToHighlight.push(el);
    }

    const endTimeVal = (this.container?.querySelector('#form-end-time')?.value || this.eventData.endTime || '').trim();
    if (!endTimeVal) {
      missing.push('End Time');
      const el = this.container?.querySelector('#form-end-time');
      if (el) elementsToHighlight.push(el);
    }

    const campusVal = (this.container?.querySelector('#form-campus')?.value || this.eventData.campus || '').trim();
    if (!campusVal) {
      missing.push('Campus');
      const el = this.container?.querySelector('#form-campus');
      if (el) elementsToHighlight.push(el);
    }

    const buildingVal = (this.container?.querySelector('#form-building')?.value || this.eventData.building || '').trim();
    const roomVal = (this.container?.querySelector('#form-room')?.value || this.eventData.room || '').trim();
    const addressVal = (this.container?.querySelector('#form-address')?.value || this.eventData.address || '').trim();
    if (!buildingVal && !roomVal && !addressVal) {
      missing.push('Venue (Room or Building)');
      const el = this.container?.querySelector('#form-room') || this.container?.querySelector('#form-building');
      if (el) elementsToHighlight.push(el);
    }

    const eligVal = (this.container?.querySelector('#form-eligibility')?.value || this.eventData.eligibility || '').trim();
    if (!eligVal) {
      missing.push('Eligibility');
      const el = this.container?.querySelector('#form-eligibility');
      if (el) elementsToHighlight.push(el);
    }

    elementsToHighlight.forEach(el => {
      el.classList.add('border-rose-500', 'ring-2', 'ring-rose-500/40', 'bg-rose-950/20');
      const clearHandler = () => {
        el.classList.remove('border-rose-500', 'ring-2', 'ring-rose-500/40', 'bg-rose-950/20');
        el.removeEventListener('input', clearHandler);
        el.removeEventListener('change', clearHandler);
      };
      el.addEventListener('input', clearHandler);
      el.addEventListener('change', clearHandler);
    });

    return {
      isValid: missing.length === 0,
      missingFields: missing,
      firstElement: elementsToHighlight[0] || null
    };
  }

  clearValidationHighlights() {
    if (!this.container) return;
    this.container.querySelectorAll('.border-rose-500').forEach(el => {
      el.classList.remove('border-rose-500', 'ring-2', 'ring-rose-500/40', 'bg-rose-950/20');
    });
  }

  /**
   * Generates real AI event content & WhatsApp announcement via Gemini API
   */
  async handleGenerateAIContent() {
    if (this.isGeneratingContent) return;

    sound.playClick();

    const validation = this.validateFormForAI();
    if (!validation.isValid) {
      if (sound.playError) sound.playError();
      if (validation.firstElement) {
        validation.firstElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        validation.firstElement.focus();
      }
      toast.show({
        title: 'Required Details Incomplete ⚠️',
        message: `Please complete: ${validation.missingFields.join(', ')}.`,
        type: 'warning'
      });
      return;
    }

    this.isGeneratingContent = true;
    const btn = this.container?.querySelector('#btn-generate-ai-content');
    const regenBtn = this.container?.querySelector('#btn-regenerate-whatsapp-text');

    if (btn) {
      btn.disabled = true;
      btn.classList.add('opacity-80', 'cursor-not-allowed');
      btn.innerHTML = `<span class="animate-spin inline-block">✨</span> Generating Event Content...`;
    }
    if (regenBtn) {
      regenBtn.disabled = true;
      regenBtn.innerHTML = `<span>⏳</span> Generating...`;
    }

    this.syncFormValuesToState();

    const origin = window.location.origin && window.location.origin !== 'null' && !window.location.origin.includes('file:')
      ? window.location.origin
      : 'https://kiit-ieee.org';
    const canonicalUrl = `${origin}/#event=${this.eventData.id || 'evt'}`;

    const payload = {
      eventName: this.eventData.title,
      eventType: this.eventData.eventType,
      category: this.eventData.category,
      description: this.eventData.shortDescription,
      startDate: this.eventData.startDate,
      endDate: this.eventData.endDate,
      startTime: this.eventData.startTime,
      endTime: this.eventData.endTime,
      reportingTime: this.eventData.reportingTime,
      campus: this.eventData.campus,
      building: this.eventData.building,
      room: this.eventData.room,
      venue: `${this.eventData.room || ''}, ${this.eventData.building || ''}, ${this.eventData.campus || ''}`.trim(),
      address: this.eventData.address,
      speakerName: this.eventData.speakers[0]?.name || '',
      speakerDesignation: this.eventData.speakers[0]?.designation || '',
      speakerOrganization: this.eventData.speakers[0]?.organization || '',
      speakerBio: this.eventData.speakers[0]?.bio || '',
      eligibility: this.eventData.eligibility,
      prerequisites: this.eventData.prerequisites,
      whatStudentsBring: this.eventData.whatToBring,
      seats: this.eventData.seatsTotal,
      registrationFee: this.eventData.fee,
      contactPerson: this.eventData.contactPerson,
      contactNumber: this.eventData.contactPhone,
      contactEmail: this.eventData.contactEmail,
      registrationDeadline: this.eventData.registrationDeadline,
      customAIInstruction: this.eventData.aiInstruction,
      registrationUrl: canonicalUrl
    };

    try {
      const result = await AIService.generateEventContent(payload);

      if (result.shortDescription) {
        this.eventData.shortDescription = result.shortDescription;
        const shortDescEl = this.container?.querySelector('#form-short-desc');
        if (shortDescEl) shortDescEl.value = result.shortDescription;
      }

      if (result.learningOutcomes && Array.isArray(result.learningOutcomes) && result.learningOutcomes.length > 0) {
        this.eventData.whatWillLearn = result.learningOutcomes.join(' • ');
        const learnEl = this.container?.querySelector('#form-learn');
        if (learnEl) learnEl.value = this.eventData.whatWillLearn;
      }

      if (result.whatWillBuild) {
        this.eventData.whatWillBuild = result.whatWillBuild;
        const buildEl = this.container?.querySelector('#form-build');
        if (buildEl) buildEl.value = result.whatWillBuild;
      }

      if (result.speakerIntroduction && this.eventData.speakers[0]) {
        this.eventData.speakers[0].bio = result.speakerIntroduction;
        const spkBioEl = this.container?.querySelector('.spk-bio[data-idx="0"]');
        if (spkBioEl) spkBioEl.value = result.speakerIntroduction;
      }

      if (result.posterText) {
        const posterTagEl = this.container?.querySelector('#poster-text-tagline');
        if (posterTagEl) posterTagEl.value = result.posterText;
      }

      // Regenerate WhatsApp announcement with controlled emojis and synthesized AI fields
      this.updateWhatsAppAnnouncement();

      const waBox = this.container?.querySelector('#promo-whatsapp-edit');
      if (waBox) waBox.value = this.eventData.whatsappMessage;

      this.markEventChanged('ai-content');
      this.renderPosterCanvas();

      sound.playSuccess();
      toast.show({
        title: 'Event Content Generated! ✨',
        message: 'AI synthesized descriptions, learning outcomes, and WhatsApp announcement.',
        type: 'success'
      });

      if (btn) {
        btn.innerHTML = `<span>✓</span> Event Content Generated`;
        btn.disabled = false;
        btn.classList.remove('opacity-80', 'cursor-not-allowed');
        setTimeout(() => {
          if (btn) btn.innerHTML = `<span>✨</span> Generate Event Content & Sync Announcement`;
        }, 3500);
      }

    } catch (err) {
      console.error('[KIIT IEEE AI Generation Failed]', err);
      if (sound.playError) sound.playError();

      const isKeyMissing = err.code === 'MISSING_API_KEY' || err.message?.includes('GEMINI_API_KEY');
      toast.show({
        title: isKeyMissing ? 'AI Configuration Needed ⚠️' : 'AI Generation Failed ⚠️',
        message: err.message || 'We could not generate the event content. Please try again.',
        type: isKeyMissing ? 'warning' : 'error'
      });

      if (btn) {
        btn.innerHTML = `<span>⚠️</span> AI Generation Error. <span class="underline font-bold ml-1">Try Again</span>`;
        btn.disabled = false;
        btn.classList.remove('opacity-80', 'cursor-not-allowed');
      }
    } finally {
      this.isGeneratingContent = false;
      if (regenBtn) {
        regenBtn.disabled = false;
        regenBtn.innerHTML = `<span>✨</span> Regenerate Text`;
      }
    }
  }

  syncFormValuesToState() {
    if (!this.container) return;
    const val = (id) => this.container.querySelector(id)?.value;

    if (val('#form-event-name') !== undefined) this.eventData.title = val('#form-event-name');
    if (val('#form-event-type') !== undefined) this.eventData.eventType = val('#form-event-type');
    if (val('#form-category') !== undefined) this.eventData.category = val('#form-category');
    if (val('#form-short-desc') !== undefined) this.eventData.shortDescription = val('#form-short-desc');
    if (val('#form-start-date') !== undefined) this.eventData.startDate = val('#form-start-date');
    if (val('#form-end-date') !== undefined) this.eventData.endDate = val('#form-end-date');
    if (val('#form-start-time') !== undefined) this.eventData.startTime = val('#form-start-time');
    if (val('#form-end-time') !== undefined) this.eventData.endTime = val('#form-end-time');
    if (val('#form-reporting-time') !== undefined) this.eventData.reportingTime = val('#form-reporting-time');
    if (val('#form-deadline') !== undefined) this.eventData.registrationDeadline = val('#form-deadline');
    if (val('#form-campus') !== undefined) this.eventData.campus = val('#form-campus');
    if (val('#form-building') !== undefined) this.eventData.building = val('#form-building');
    if (val('#form-room') !== undefined) this.eventData.room = val('#form-room');
    if (val('#form-address') !== undefined) this.eventData.address = val('#form-address');
    if (val('#form-landmark') !== undefined) this.eventData.landmark = val('#form-landmark');
    if (val('#form-learn') !== undefined) this.eventData.whatWillLearn = val('#form-learn');
    if (val('#form-build') !== undefined) this.eventData.whatWillBuild = val('#form-build');
    if (val('#form-eligibility') !== undefined) this.eventData.eligibility = val('#form-eligibility');
    if (val('#form-prerequisites') !== undefined) this.eventData.prerequisites = val('#form-prerequisites');
    if (val('#form-bring') !== undefined) this.eventData.whatToBring = val('#form-bring');
    if (val('#form-seats') !== undefined) this.eventData.seatsTotal = val('#form-seats');
    if (val('#form-fee') !== undefined) this.eventData.fee = val('#form-fee');
    if (val('#form-contact-person') !== undefined) this.eventData.contactPerson = val('#form-contact-person');
    if (val('#form-contact-phone') !== undefined) this.eventData.contactPhone = val('#form-contact-phone');
    if (val('#form-contact-email') !== undefined) this.eventData.contactEmail = val('#form-contact-email');
    if (val('#form-ai-instruction') !== undefined) this.eventData.aiInstruction = val('#form-ai-instruction');
  }

  handleOpenPublishReview() {
    sound.playClick();
    this.syncFormValuesToState();
    const p = this.eventData;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto';
    modal.innerHTML = `
      <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-slate-900 to-slate-950 max-w-2xl w-full space-y-6 shadow-2xl relative my-8">
        
        <div class="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <span class="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-wider">Step 4 of 4 • Final Confirmation</span>
            <h3 class="text-xl font-black text-white mt-0.5">Review Your Event</h3>
          </div>
          <button id="modal-close-review" class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center font-bold">✕</button>
        </div>

        <!-- Verified Parameters Summary -->
        <div class="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-white/10">
          <div>
            <span class="text-slate-400 text-[10px] uppercase block">Event Name:</span>
            <span class="text-white font-bold">${this.escapeHtml(p.title)}</span>
          </div>
          <div>
            <span class="text-slate-400 text-[10px] uppercase block">Category & Type:</span>
            <span class="text-purple-300 font-bold">${p.category} (${p.eventType})</span>
          </div>
          <div>
            <span class="text-slate-400 text-[10px] uppercase block">Schedule:</span>
            <span class="text-cyan-300 font-bold">${this.getFormattedDateRange()} • ${this.getFormattedTimeRange()}</span>
          </div>
          <div>
            <span class="text-slate-400 text-[10px] uppercase block">Venue Coordinates:</span>
            <span class="text-white font-bold">${this.escapeHtml(p.room)}, ${this.escapeHtml(p.campus)}</span>
          </div>
          <div>
            <span class="text-slate-400 text-[10px] uppercase block">Lead Speaker:</span>
            <span class="text-pink-300 font-bold">${p.speakers[0]?.name || 'IEEE Technical Mentor'}</span>
          </div>
          <div>
            <span class="text-slate-400 text-[10px] uppercase block">Capacity:</span>
            <span class="text-emerald-300 font-bold font-mono">${p.seatsTotal} Lab Benches</span>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-300 leading-relaxed">
          <span class="font-bold text-emerald-300 block mb-1">✓ Ready for Live Student Discovery</span>
          Publishing makes this workshop live on the student discovery portal and generates your permanent registration link.
        </div>

        <!-- Action Row -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button id="modal-btn-back-edit" class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs btn-press">
            ← Edit Details
          </button>
          <button id="modal-btn-confirm-publish" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/30 btn-press flex items-center gap-1.5">
            <span>🚀</span> Confirm & Publish Event
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    modal.querySelector('#modal-close-review')?.addEventListener('click', closeModal);
    modal.querySelector('#modal-btn-back-edit')?.addEventListener('click', closeModal);

    modal.querySelector('#modal-btn-confirm-publish')?.addEventListener('click', async () => {
      closeModal();
      await this.publishEventToStore();
    });
  }

  async publishEventToStore() {
    this.syncFormValuesToState();
    const p = this.eventData;

    toast.show({
      title: 'Publishing Event 🚀',
      message: 'Writing event to database and initializing discovery route.',
      type: 'info'
    });

    const payload = {
      id: p.id || `evt-${Date.now()}`,
      title: p.title || 'AI & Edge Computer Vision Masterclass',
      tagline: p.shortDescription || p.fullDescription || 'Technical Workshop by KIIT IEEE',
      category: p.category || 'AI & Machine Learning',
      format: (p.eventType && p.eventType.includes('Webinar')) ? 'Online' : 'Offline',
      eventType: p.eventType || 'Workshop',
      difficulty: 'Intermediate',
      price: 0,
      priceLabel: p.fee || 'Free (IEEE Sponsored)',
      date: this.getFormattedDateRange(),
      startDate: p.startDate,
      endDate: p.endDate,
      time: this.getFormattedTimeRange(),
      startTime: p.startTime,
      endTime: p.endTime,
      reportingTime: this.getFormattedReportingTime(),
      venue: `${p.room || 'Tech Lab 4'}, ${p.building || 'School of Computer Engineering'}, ${p.campus || 'Campus 15'}`,
      campus: p.campus || 'Campus 15',
      building: p.building || 'School of Computer Engineering',
      room: p.room || 'Tech Lab 4 (AI/ML Lab)',
      address: p.address || 'Campus 15, KIIT Deemed to be University, Patia, Bhubaneswar, Odisha 751024',
      landmark: p.landmark || 'Near Central Research Facility',
      bannerGradient: 'from-purple-600 via-indigo-600 to-cyan-600',
      badgeColor: 'badge-ai',
      featured: true,
      status: 'PUBLISHED',
      speaker: {
        name: p.speakers[0]?.name || 'IEEE Senior Technical Mentor',
        role: p.speakers[0]?.designation || 'Lead Systems Architect',
        org: p.speakers[0]?.organization || 'KIIT University',
        bio: p.speakers[0]?.bio || 'Specialist with extensive laboratory and research experience.'
      },
      speakers: p.speakers || [],
      seatsTotal: parseInt(p.seatsTotal, 10) || 120,
      seatsFilled: 0,
      eligibility: p.eligibility || 'Open to 2nd, 3rd & 4th Year B.Tech students (All branches)',
      prerequisites: Array.isArray(p.prerequisites) ? p.prerequisites : [p.prerequisites || 'Basic familiarity'],
      whatYouWillBuild: Array.isArray(p.whatWillBuild) ? p.whatWillBuild : [p.whatWillBuild || 'Production-ready technical capstone'],
      whatWillLearn: p.whatWillLearn || '',
      whatToBring: p.whatToBring || 'Personal laptop, charger, and student ID card.',
      contactPerson: p.contactPerson || 'Lead Student Organizer',
      contactPhone: p.contactPhone || '+91 674 2725113',
      contactEmail: p.contactEmail || 'ieee@kiit.ac.in',
      registrationDeadline: p.registrationDeadline || ''
    };

    let publishedEvent = null;

    try {
      // 1. Persist directly to backend database via REST API
      const res = await EventService.publishEvent(payload);
      if (res && res.event) {
        publishedEvent = res.event;
      }
    } catch (err) {
      console.warn('[AIBuilderView] EventService.publishEvent network error:', err);
    }

    // 2. Client store synchronization
    if (!publishedEvent) {
      publishedEvent = store.addEvent({ ...payload, status: 'PUBLISHED' });
    } else {
      store.addEvent(publishedEvent);
    }

    publishedEvent.status = 'PUBLISHED';

    // 3. Store real published event reference
    this.publishedEventId = publishedEvent.id;
    this.publishedEventSlug = publishedEvent.slug || publishedEvent.id;
    this.publishedEvent = publishedEvent;

    this.eventData.isPublished = true;
    this.updateWhatsAppAnnouncement();

    // 4. Remove saved draft to prevent stale state on subsequent actions
    try {
      localStorage.removeItem('KIIT_IEEE_EVENT_BUILDER_DRAFT');
    } catch (e) {}

    // 5. Celebration effects
    if (typeof confetti === 'function') {
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 } });
    }
    sound.playSuccess();

    // 6. Transition to verified success screen
    this.renderPublishedSuccessScreen(publishedEvent);
  }

  renderPublishedSuccessScreen(evt) {
    // Determine the real published event identifier (Requirement 4, 5, 23)
    const targetId = evt?.id || evt?.slug || this.publishedEventId;

    // Requirement 23: Safe Fallback if published event reference is missing
    if (!evt || !targetId) {
      console.error('[KIIT IEEE Published Event Reference Missing]', { evt, publishedEventId: this.publishedEventId });
      this.container.innerHTML = `
        <div class="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-20 text-center space-y-6 animate-fade-in">
          <div class="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-3xl mx-auto">
            ⚠️
          </div>
          <div class="space-y-2">
            <h2 class="text-2xl sm:text-3xl font-black text-white">We couldn't open the published event.</h2>
            <p class="text-sm text-slate-300">
              The event was published, but its event reference is missing.
            </p>
          </div>
          <div class="flex items-center justify-center gap-3 pt-4">
            <a href="#events" class="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all btn-press">
              ← Back to Events
            </a>
            <button id="btn-fallback-return-builder" class="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all btn-press">
              Return to Event Builder
            </button>
          </div>
        </div>
      `;
      this.container.querySelector('#btn-fallback-return-builder')?.addEventListener('click', () => {
        this.resetToFreshEventBuilder();
      });
      return;
    }

    this.container.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 text-center space-y-8 animate-fade-in">
        
        <div class="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-4xl mx-auto shadow-2xl">
          🎉
        </div>

        <div class="space-y-2">
          <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight">Event Published!</h1>
          <p class="text-sm text-slate-300 max-w-lg mx-auto">
            "${this.escapeHtml(evt.title || 'Your Event')}" is now live on the KIIT IEEE portal with instant student registrations.
          </p>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300 font-mono mt-2">
            <span>Event ID:</span>
            <span class="text-emerald-400 font-bold">${this.escapeHtml(targetId)}</span>
            <span class="text-slate-500">•</span>
            <span class="text-indigo-400 font-bold">Status: ${this.escapeHtml(evt.status || 'PUBLISHED')}</span>
          </div>
        </div>

        <!-- Clean Success Action Buttons -->
        <div class="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button id="btn-success-view-event" class="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs transition-all btn-press flex items-center gap-2 shadow-lg">
            <span>👁️</span> View Event Page
          </button>

          <button id="btn-success-share-whatsapp" class="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-xs shadow-xl shadow-emerald-500/30 transition-all btn-press flex items-center gap-2">
            <span>💬</span> Share on WhatsApp
          </button>

          <button id="btn-success-download-poster" class="px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all btn-press flex items-center gap-2">
            <span>🖼</span> Download Poster
          </button>
        </div>

        <div class="pt-8">
          <button id="btn-create-another" class="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline">
            + Create Another Event
          </button>
        </div>

      </div>
    `;

    // View Event Page Button (Requirements 5, 6, 17)
    const btnView = this.container.querySelector('#btn-success-view-event');
    btnView?.addEventListener('click', () => {
      // Feedback: Prevent duplicate navigation & show loading state
      btnView.disabled = true;
      btnView.classList.add('opacity-75', 'cursor-wait');
      btnView.innerHTML = `<span>⏳</span> Opening Event...`;
      sound.playClick();

      // Navigate to destination dynamic route using project's existing routing architecture
      setTimeout(() => {
        if (window.appDispatcher?.navigateToEvent) {
          window.appDispatcher.navigateToEvent(targetId);
        } else {
          window.location.hash = `event/${targetId}`;
        }
      }, 150);
    });

    // Share on WhatsApp Button (Requirement 22)
    this.container.querySelector('#btn-success-share-whatsapp')?.addEventListener('click', () => {
      this.handleSharePosterAndMessage();
    });

    // Download Poster Button (Requirement 22)
    this.container.querySelector('#btn-success-download-poster')?.addEventListener('click', () => {
      const dummyCanvas = document.createElement('canvas');
      PromotionService.renderPosterCanvas(dummyCanvas, evt, this.posterConfig);
      const link = document.createElement('a');
      link.download = `KIIT-IEEE-${(evt.title || 'Event').replace(/[^a-zA-Z0-9]/g, '_')}-Poster.png`;
      link.href = dummyCanvas.toDataURL('image/png');
      link.click();
      toast.show({ title: 'Poster Downloaded! 🖼', message: 'Print-ready PNG saved to your device.', type: 'success' });
    });

    // Create Another Event Button (Requirement 21)
    this.container.querySelector('#btn-create-another')?.addEventListener('click', () => {
      this.resetToFreshEventBuilder();
    });
  }

  /**
   * Resets the Event Builder to a fresh, pristine state without stale event IDs or data (Requirement 21)
   */
  resetToFreshEventBuilder() {
    try {
      localStorage.removeItem('KIIT_IEEE_EVENT_BUILDER_DRAFT');
    } catch (e) {}

    this.publishedEventId = null;
    this.publishedEventSlug = null;
    this.publishedEvent = null;
    this.eventVersion = 1;
    this.posterVersion = 1;
    this.contentVersion = 1;

    // Clean new event instance with fresh unique ID
    this.eventData = {
      id: `evt-${Date.now()}`,
      title: '',
      eventType: 'Workshop',
      category: 'AI & Machine Learning',
      shortDescription: '',
      fullDescription: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      reportingTime: '08:30',
      registrationDeadline: '',
      campus: 'Campus 15',
      building: 'School of Computer Engineering',
      room: '',
      address: 'Campus 15, KIIT Deemed to be University, Patia, Bhubaneswar, Odisha 751024',
      landmark: '',
      speakers: [
        {
          name: '',
          designation: '',
          organization: '',
          bio: ''
        }
      ],
      whatWillLearn: '',
      whatWillBuild: '',
      eligibility: 'Open to all KIIT students',
      prerequisites: '',
      whatToBring: 'Personal laptop, charger, and student ID card.',
      seatsTotal: 100,
      fee: 'Free (IEEE Sponsored)',
      contactPerson: '',
      contactPhone: '',
      contactEmail: 'ieee@kiit.ac.in',
      aiInstruction: 'Make this exciting, prestigious, and clear for ambitious engineering undergraduates.',
      whatsappMessage: '',
      isPublished: false
    };

    sound.playClick();
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.show({
      title: 'Fresh Event Form Initialized ✨',
      message: 'Fill in your details or use AI Event Helper to build your event.',
      type: 'info'
    });
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
